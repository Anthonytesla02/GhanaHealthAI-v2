#!/usr/bin/env python3
"""
RAG service for Ghana Standard Treatment Guidelines chatbot.
Retrieves relevant context from Pinecone and generates responses using Mistral.
"""

import os
import sys
import json
from typing import List, Dict, Any
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

class RAGService:
    def __init__(self):
        if MISTRAL_AVAILABLE and os.getenv('MISTRAL_API_KEY'):
            try:
                self.mistral_client = MistralClient(
                    api_key=os.getenv('MISTRAL_API_KEY')
                )
            except Exception as e:
                print(f"Error initializing Mistral client: {e}", file=sys.stderr)
                self.mistral_client = None
        else:
            self.mistral_client = None
        
        # Path to locally stored chunks
        self.chunks_file = os.path.join(os.path.dirname(__file__), 'processed_chunks.json')
        self.chunks_data = self.load_chunks_data()

    def load_chunks_data(self) -> List[Dict[str, Any]]:
        """Load processed chunks from local JSON file."""
        try:
            if os.path.exists(self.chunks_file):
                with open(self.chunks_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading chunks data: {e}", file=sys.stderr)
        return []

    def extract_query_keywords(self, query: str) -> List[str]:
        """Extract keywords from user query for matching."""
        words = re.findall(r'\b[a-zA-Z]{3,}\b', query.lower())
        stopwords = {
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
            'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 
            'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'with', 'this',
            'that', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some',
            'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make',
            'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what'
        }
        return [word for word in words if word not in stopwords and len(word) > 3]

    def retrieve_relevant_chunks(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve most relevant chunks using keyword matching."""
        if not self.chunks_data:
            return self._get_fallback_chunks(query)
        
        try:
            query_keywords = self.extract_query_keywords(query)
            if not query_keywords:
                return self._get_fallback_chunks(query)
            
            # Score chunks based on keyword matches
            scored_chunks = []
            for chunk in self.chunks_data:
                score = 0
                chunk_keywords = chunk.get('keywords', [])
                chunk_content = chunk['content'].lower()
                
                # Direct keyword matches in keywords list
                for keyword in query_keywords:
                    if keyword in chunk_keywords:
                        score += 2
                    # Partial matches in content
                    if keyword in chunk_content:
                        score += 1
                
                # Boost score for medical terms
                medical_terms = ['treatment', 'therapy', 'medicine', 'drug', 'dose', 
                               'symptom', 'diagnosis', 'patient', 'disease', 'condition']
                for term in medical_terms:
                    if term in query.lower() and term in chunk_content:
                        score += 3
                
                if score > 0:
                    scored_chunks.append({
                        'content': chunk['content'],
                        'title': chunk['title'],
                        'section': chunk['section'],
                        'score': score,
                        'id': chunk['id']
                    })
            
            # Sort by score and return top_k
            scored_chunks.sort(key=lambda x: x['score'], reverse=True)
            return scored_chunks[:top_k]
            
        except Exception as e:
            print(f"Error retrieving chunks: {e}", file=sys.stderr)
            return self._get_fallback_chunks(query)

    def _get_fallback_chunks(self, query: str) -> List[Dict[str, Any]]:
        """Provide fallback content when Pinecone is not available."""
        # This is a simplified fallback - in production, you'd want more comprehensive content
        fallback_content = [
            {
                'content': 'For medical conditions, always consult the latest Ghana Standard Treatment Guidelines. Treatment should be individualized based on patient assessment, available resources, and clinical expertise.',
                'title': 'General Medical Guidelines',
                'section': 'Standard Treatment Principles',
                'score': 0.8,
                'id': 'fallback_1'
            },
            {
                'content': 'Patient safety is paramount. Monitor for adverse reactions, ensure proper dosing based on age and weight, and maintain appropriate follow-up care.',
                'title': 'Patient Safety Guidelines',
                'section': 'Safety Protocols',
                'score': 0.75,
                'id': 'fallback_2'
            }
        ]
        return fallback_content

    def generate_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate response using Mistral AI."""
        if not self.mistral_client:
            return self._create_manual_response(query, context_chunks)

        try:
            # Limit chunk content length for clarity
            trimmed_chunks = context_chunks[:3]
            context = "\n\n".join([
                f"{chunk['section']}:\n{chunk['content'][:500].strip()}..."
                for chunk in trimmed_chunks
            ])

            # More directive prompt
            prompt = f"""
Answer the following medical question strictly using the Ghana Standard Treatment Guidelines (7th Edition, 2017).

Context:
{context}

Question: {query}

Respond concisely and professionally with specific treatment instructions from the guidelines only.
If context is insufficient, say: "The provided medical guidelines do not cover this question."
"""

            # Debug logging
            print("=== Mistral Prompt ===", file=sys.stderr)
            print(prompt, file=sys.stderr)
            print("=== End Prompt ===", file=sys.stderr)

            response = self.mistral_client.chat(
                model="mistral-large-latest",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=800
            )

            content = response.choices[0].message.content.strip()

            # Optional: detect fallback messages and warn in logs
            if "consult" in content.lower() and "health" in content.lower():
                print("⚠️ Warning: Fallback detected in Mistral response.", file=sys.stderr)
            
            return content

        except Exception as e:
            print(f"Error generating response: {e}", file=sys.stderr)
            return self._create_manual_response(query, context_chunks)

    def _create_manual_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Create a structured response using retrieved content when API fails."""
        if not context_chunks:
            return self._get_fallback_response(query)
        
        # Extract key information from chunks
        response_parts = []
        response_parts.append(f"Based on Ghana Standard Treatment Guidelines (7th Edition, 2017):\n")
        
        # Process each relevant chunk
        for i, chunk in enumerate(context_chunks[:3], 1):  # Limit to top 3 most relevant
            content = chunk['content']
            section = chunk['section']
            
            # Clean up the content and make it more readable
            clean_content = content.replace('\n', ' ').strip()
            if len(clean_content) > 300:
                clean_content = clean_content[:300] + "..."
            
            response_parts.append(f"{i}. From {section}:")
            response_parts.append(f"   {clean_content}\n")
        
        # Add important medical disclaimer
        response_parts.append("\n⚠️ Important:")
        response_parts.append("• Always consult a qualified healthcare professional for proper diagnosis")
        response_parts.append("• Treatment should be individualized based on patient assessment")
        response_parts.append("• Follow proper medical protocols and safety guidelines")
        
        return "\n".join(response_parts)
    
    def _get_fallback_response(self, query: str) -> str:
        """Provide a fallback response when no relevant content is found."""
        return f"""I apologize, but I'm currently unable to access the complete Ghana Standard Treatment Guidelines database to provide a specific answer to your question about "{query}".

For accurate medical guidance, please:
1. Consult the official Ghana Standard Treatment Guidelines (7th Edition, 2017)
2. Speak with a qualified healthcare professional
3. Contact your local healthcare facility

This is important for ensuring you receive appropriate, safe, and effective medical care based on the most current guidelines and your specific situation."""

    def process_query(self, query: str) -> Dict[str, Any]:
        """Main RAG pipeline."""
        try:
            # Retrieve relevant chunks
            chunks = self.retrieve_relevant_chunks(query)
            
            # Generate response
            answer = self.generate_response(query, chunks)
            
            # Format sources for frontend
            sources = []
            for i, chunk in enumerate(chunks[:3]):  # Limit to top 3 sources
                sources.append({
                    'id': str(i + 1),
                    'title': chunk['section'],
                    'content': chunk['content'][:200] + "..." if len(chunk['content']) > 200 else chunk['content'],
                    'section': chunk['section']
                })
            
            return {
                'answer': answer,
                'sources': sources
            }
            
        except Exception as e:
            print(f"Error processing query: {e}", file=sys.stderr)
            return {
                'answer': self._get_fallback_response(query),
                'sources': []
            }

def main():
    if len(sys.argv) != 2:
        print("Usage: python rag_service.py <query>", file=sys.stderr)
        sys.exit(1)
    
    query = sys.argv[1]
    
    rag_service = RAGService()
    result = rag_service.process_query(query)
    
    # Output JSON response
    print(json.dumps(result))

if __name__ == "__main__":
    main()
