#!/usr/bin/env python3
"""
Case Study Generator service for Ghana Standard Treatment Guidelines.
Generates realistic medical case studies and evaluates student answers using Mistral AI.
"""

import os
import sys
import json
import random
from typing import List, Dict, Any, Tuple
import re
try:
    from mistralai.client import MistralClient
    from mistralai.models.chat_completion import ChatMessage
    MISTRAL_AVAILABLE = True
except ImportError:
    try:
        from mistralai import Mistral
        MISTRAL_AVAILABLE = True
    except ImportError:
        MISTRAL_AVAILABLE = False

class CaseStudyGenerator:
    def __init__(self):
        if MISTRAL_AVAILABLE and os.getenv('MISTRAL_CASE_STUDY_API_KEY'):
            try:
                self.mistral_client = MistralClient(
                    api_key=os.getenv('MISTRAL_CASE_STUDY_API_KEY')
                )
            except Exception as e:
                print(f"Error initializing Mistral client for case studies: {e}", file=sys.stderr)
                self.mistral_client = None
        else:
            self.mistral_client = None
        
        # Load medical knowledge base
        self.chunks_file = os.path.join(os.path.dirname(__file__), 'processed_chunks.json')
        self.chunks_data = self.load_chunks_data()
        
        # Curated list of illnesses for case study generation
        self.illnesses = [
            "Diarrhoea", "Rotavirus Disease and Diarrhoea", "Constipation", "Peptic Ulcer Disease",
            "Gastro-oesophageal Reflux Disease", "Haemorrhoids", "Vomiting", "Anaemia", "Measles",
            "Pertussis", "Common cold", "Pneumonia", "Headache", "Boils", "Impetigo", "Buruli ulcer",
            "Yaws", "Superficial Fungal Skin infections", "Pityriasis Versicolor", "Herpes Simplex Infections",
            "Herpes Zoster Infections", "Chicken pox", "Large Chronic Ulcers", "Pruritus", "Urticaria",
            "Reactive Erythema and Bullous Reaction", "Acne Vulgaris", "Eczema", "Intertrigo",
            "Diabetes Mellitus", "Diabetic Ketoacidosis", "Diabetes in Pregnancy", "Treatment-Induced Hypoglycemia",
            "Dyslipidaemia", "Goitre", "Hypothyroidism", "Hyperthyroidism", "Overweight and Obesity",
            "Dysmenorrhoea", "Abortion", "Abnormal Vaginal Bleeding", "Abnormal Vaginal Discharge",
            "Acute Lower Abdominal Pain", "Menopause", "Erectile Dysfunction", "Urinary Tract Infection",
            "Sexually Transmitted Infections in Adults", "STI-related Urethral Discharge in Males",
            "Mycoplasma genitalum", "STI-related Persistent or Recurrent Urethral Discharge",
            "STI-related Vaginal Discharge", "STI-related Lower Abdominal Pain in Women",
            "STI-related Genital Ulcer", "STI-related Scrotal Swelling", "STI-related Inguinal Bubo",
            "STI-related Genital Warts", "STI-related Ano-rectal Related Syndromes", "Fever",
            "Tuberculosis", "Typhoid fever", "Malaria", "Uncomplicated Malaria", "Severe Malaria",
            "Malaria in Pregnancy", "Worm Infestation", "Xerophthalmia", "Foreign body in the eye",
            "Neonatal conjunctivitis", "Red eye", "Stridor", "Acute Epiglottitis", "Retropharyngeal Abscess",
            "Pharyngitis and Tonsillitis", "Acute Sinusitis", "Acute otitis Media", "Chronic Otitis Media",
            "Epistaxis", "Dental Caries", "Oral Candidiasis", "Acute Necrotizing Ulcerative Gingivitis",
            "Acute Bacterial Sialoadenitis", "Chronic Periodontal Infections", "Mouth Ulcers",
            "Odontogenic Infections", "Osteoarthritis", "Rheumatoid arthritis", "Juvenile Idiopathic Arthritis",
            "Back pain", "Gout", "Dislocations", "Open Fractures", "Cellulitis", "Burns", "Wounds",
            "Bites and Stings", "Shock", "Acute Allergic Reaction"
        ]

    def load_chunks_data(self) -> List[Dict[str, Any]]:
        """Load processed chunks from local JSON file."""
        try:
            if os.path.exists(self.chunks_file):
                with open(self.chunks_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading chunks data: {e}", file=sys.stderr)
        return []

    def get_relevant_medical_context(self, illness: str) -> List[Dict[str, Any]]:
        """Retrieve relevant medical context for the specified illness."""
        relevant_chunks = []
        illness_lower = illness.lower()
        
        for chunk in self.chunks_data:
            content_lower = chunk.get('content', '').lower()
            title_lower = chunk.get('title', '').lower()
            
            # Check for exact illness match or related keywords
            if (illness_lower in content_lower or 
                illness_lower in title_lower or
                any(word in content_lower for word in illness_lower.split())):
                relevant_chunks.append(chunk)
        
        # Sort by relevance and return top chunks
        return relevant_chunks[:5]

    def generate_case_study(self, illness: str = None) -> Dict[str, Any]:
        """Generate a realistic case study for the specified illness."""
        if not illness:
            illness = random.choice(self.illnesses)
        
        # Get relevant medical context
        context_chunks = self.get_relevant_medical_context(illness)
        context_text = "\n\n".join([chunk.get('content', '') for chunk in context_chunks[:3]])
        
        if self.mistral_client:
            try:
                prompt = f"""
Based on the Ghana Standard Treatment Guidelines, generate a realistic medical case study for {illness}.

Medical Context from Guidelines:
{context_text}

Create a case study that includes:
1. Patient demographics (age, gender, occupation)
2. Chief complaint and history of present illness
3. Relevant symptoms and physical findings
4. Any relevant past medical history
5. Make it realistic for a Ghanaian healthcare setting

The case should be challenging but solvable with the provided medical knowledge.
Format as a narrative case presentation suitable for medical students.

Generate ONLY the case description without revealing the diagnosis or treatment.
"""

                response = self.mistral_client.chat(
                    model="mistral-large-latest",
                    messages=[ChatMessage(role="user", content=prompt)],
                    max_tokens=500
                )
                
                case_description = response.choices[0].message.content.strip()
                
                # Generate correct answers
                diagnosis, treatment = self._generate_correct_answers(illness, context_chunks)
                
                return {
                    "illness": illness,
                    "case_description": case_description,
                    "correct_diagnosis": diagnosis,
                    "correct_treatment": treatment
                }
                
            except Exception as e:
                print(f"Error generating case study with Mistral: {e}", file=sys.stderr)
        
        # Fallback case study generation
        return self._generate_fallback_case_study(illness)

    def _generate_correct_answers(self, illness: str, context_chunks: List[Dict[str, Any]]) -> Tuple[str, str]:
        """Generate correct diagnosis and treatment based on medical guidelines."""
        context_text = "\n\n".join([chunk.get('content', '') for chunk in context_chunks[:3]])
        
        if self.mistral_client:
            try:
                prompt = f"""
Based on the Ghana Standard Treatment Guidelines, provide:

1. DIAGNOSIS: The correct medical diagnosis for {illness}
2. TREATMENT: The specific treatment protocol as per Ghana STG

Medical Context:
{context_text}

Format your response as:
DIAGNOSIS: [diagnosis]
TREATMENT: [detailed treatment protocol]

Be specific and follow the exact guidelines provided in the context.
"""

                response = self.mistral_client.chat(
                    model="mistral-large-latest",
                    messages=[ChatMessage(role="user", content=prompt)],
                    max_tokens=400
                )
                
                content = response.choices[0].message.content.strip()
                
                # Parse diagnosis and treatment
                diagnosis_match = re.search(r'DIAGNOSIS:\s*(.+?)(?=TREATMENT:|$)', content, re.IGNORECASE | re.DOTALL)
                treatment_match = re.search(r'TREATMENT:\s*(.+)', content, re.IGNORECASE | re.DOTALL)
                
                diagnosis = diagnosis_match.group(1).strip() if diagnosis_match else illness
                treatment = treatment_match.group(1).strip() if treatment_match else "Standard treatment as per Ghana STG"
                
                return diagnosis, treatment
                
            except Exception as e:
                print(f"Error generating correct answers: {e}", file=sys.stderr)
        
        return illness, f"Standard treatment for {illness} as per Ghana STG"

    def _generate_fallback_case_study(self, illness: str) -> Dict[str, Any]:
        """Generate a fallback case study when Mistral is unavailable."""
        case_templates = {
            "Malaria": "A 28-year-old farmer presents with 3 days of fever, headache, and body aches. He works in rural areas and has not been taking antimalarial prophylaxis.",
            "Diabetes Mellitus": "A 45-year-old teacher complains of increased thirst, frequent urination, and unexplained weight loss over the past 2 months.",
            "Pneumonia": "A 35-year-old mother presents with cough, chest pain, and difficulty breathing for 5 days. She has fever and appears unwell.",
            "Hypertension": "A 50-year-old market vendor complains of headaches and dizziness. Family history of high blood pressure.",
        }
        
        description = case_templates.get(illness, f"A patient presents with symptoms consistent with {illness}.")
        
        return {
            "illness": illness,
            "case_description": description,
            "correct_diagnosis": illness,
            "correct_treatment": f"Treatment for {illness} as per Ghana Standard Treatment Guidelines"
        }

    def evaluate_answers(self, correct_diagnosis: str, correct_treatment: str, 
                        user_diagnosis: str, user_treatment: str) -> Dict[str, Any]:
        """Evaluate user answers and provide scoring and feedback."""
        
        if self.mistral_client:
            try:
                prompt = f"""
Evaluate the following medical student answers against the correct answers from Ghana Standard Treatment Guidelines:

CORRECT DIAGNOSIS: {correct_diagnosis}
STUDENT DIAGNOSIS: {user_diagnosis}

CORRECT TREATMENT: {correct_treatment}  
STUDENT TREATMENT: {user_treatment}

Provide:
1. DIAGNOSIS_SCORE: 0-100 (how close is the student's diagnosis?)
2. TREATMENT_SCORE: 0-100 (how accurate is the treatment plan?)
3. FEEDBACK: Constructive feedback explaining what was correct/incorrect

Format as:
DIAGNOSIS_SCORE: [number]
TREATMENT_SCORE: [number]  
FEEDBACK: [detailed feedback]

Be fair but thorough in evaluation. Consider partial credit for related conditions or alternative valid treatments.
"""

                response = self.mistral_client.chat(
                    model="mistral-large-latest",
                    messages=[ChatMessage(role="user", content=prompt)],
                    max_tokens=600
                )
                
                content = response.choices[0].message.content.strip()
                
                # Parse scores and feedback
                diag_score_match = re.search(r'DIAGNOSIS_SCORE:\s*(\d+)', content, re.IGNORECASE)
                treat_score_match = re.search(r'TREATMENT_SCORE:\s*(\d+)', content, re.IGNORECASE)
                feedback_match = re.search(r'FEEDBACK:\s*(.+)', content, re.IGNORECASE | re.DOTALL)
                
                diagnosis_score = int(diag_score_match.group(1)) if diag_score_match else 0
                treatment_score = int(treat_score_match.group(1)) if treat_score_match else 0
                feedback = feedback_match.group(1).strip() if feedback_match else "Evaluation completed."
                
                return {
                    "diagnosis_score": diagnosis_score,
                    "treatment_score": treatment_score,
                    "feedback": feedback
                }
                
            except Exception as e:
                print(f"Error evaluating answers: {e}", file=sys.stderr)
        
        # Fallback evaluation
        return self._fallback_evaluation(correct_diagnosis, correct_treatment, user_diagnosis, user_treatment)

    def _fallback_evaluation(self, correct_diagnosis: str, correct_treatment: str,
                           user_diagnosis: str, user_treatment: str) -> Dict[str, Any]:
        """Provide basic evaluation when Mistral is unavailable."""
        
        # Simple keyword matching for basic scoring
        diagnosis_score = 50 if correct_diagnosis.lower() in user_diagnosis.lower() else 20
        treatment_score = 50 if any(word in user_treatment.lower() for word in correct_treatment.lower().split()[:3]) else 20
        
        feedback = f"""
Diagnosis Evaluation: Your answer was compared against '{correct_diagnosis}'.
Treatment Evaluation: Your answer was compared against the standard treatment protocol.

For detailed feedback, please ensure the AI service is properly configured.
"""
        
        return {
            "diagnosis_score": diagnosis_score,
            "treatment_score": treatment_score,
            "feedback": feedback
        }

def main():
    """Main function for command line usage."""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        generator = CaseStudyGenerator()
        
        if command == "generate":
            illness = sys.argv[2] if len(sys.argv) > 2 else None
            result = generator.generate_case_study(illness)
            print(json.dumps(result))
            
        elif command == "evaluate":
            if len(sys.argv) != 6:
                print("Usage: python case_study_service.py evaluate <correct_diagnosis> <correct_treatment> <user_diagnosis> <user_treatment>")
                sys.exit(1)
            
            result = generator.evaluate_answers(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
            print(json.dumps(result))
            
        else:
            print("Unknown command. Use 'generate' or 'evaluate'")
            sys.exit(1)
    else:
        print("Usage: python case_study_service.py <command> [args]")
        sys.exit(1)

if __name__ == "__main__":
    main()