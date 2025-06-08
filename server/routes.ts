import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatRequestSchema, chatResponseSchema, generateCaseStudyRequestSchema, submitAnswersRequestSchema } from "@shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for frontend access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Chat endpoint for RAG-based medical questions
  app.post("/api/search", async (req, res) => {
    try {
      const validatedData = chatRequestSchema.parse(req.body);
      const { question, sessionId = generateSessionId() } = validatedData;

      // Store user message
      await storage.addChatMessage({
        sessionId,
        role: 'user',
        content: question,
        sources: null,
      });

      // Call Python RAG service
      const response = await callRAGService(question);
      
      // Store assistant response
      await storage.addChatMessage({
        sessionId,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
      });

      const chatResponse = {
        answer: response.answer,
        sources: response.sources,
        sessionId,
      };

      res.json(chatResponse);
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ 
        message: "Unable to process your medical question. Please try again." 
      });
    }
  });

  // Get chat history for a session
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ message: "Unable to retrieve chat history." });
    }
  });

  // Generate new case study
  app.post("/api/case-study/generate", async (req, res) => {
    try {
      const validatedData = generateCaseStudyRequestSchema.parse(req.body);
      const { sessionId = generateSessionId() } = validatedData;

      // Call case study generator service
      const caseStudyData = await callCaseStudyGenerator("generate");
      
      // Store case study in database
      const caseStudy = await storage.addCaseStudy({
        sessionId,
        illness: caseStudyData.illness,
        caseDescription: caseStudyData.case_description,
        correctDiagnosis: caseStudyData.correct_diagnosis,
        correctTreatment: caseStudyData.correct_treatment,
        isCompleted: false,
      });

      res.json({
        id: caseStudy.id,
        sessionId: caseStudy.sessionId,
        illness: caseStudy.illness,
        caseDescription: caseStudy.caseDescription,
        isCompleted: caseStudy.isCompleted,
      });
    } catch (error) {
      console.error("Error generating case study:", error);
      res.status(500).json({ message: "Failed to generate case study" });
    }
  });

  // Submit case study answers
  app.post("/api/case-study/submit", async (req, res) => {
    try {
      const validatedData = submitAnswersRequestSchema.parse(req.body);
      const { caseStudyId, diagnosis, treatment } = validatedData;

      // Get existing case study
      const caseStudy = await storage.getCaseStudyById(caseStudyId);
      if (!caseStudy) {
        return res.status(404).json({ message: "Case study not found" });
      }

      // Evaluate answers using case study service
      const evaluation = await callCaseStudyEvaluator(
        caseStudy.correctDiagnosis,
        caseStudy.correctTreatment,
        diagnosis,
        treatment
      );

      // Update case study with user answers and scores
      const updatedCaseStudy = await storage.updateCaseStudy(caseStudyId, {
        userDiagnosis: diagnosis,
        userTreatment: treatment,
        diagnosisScore: evaluation.diagnosis_score,
        treatmentScore: evaluation.treatment_score,
        feedback: evaluation.feedback,
        isCompleted: true,
      });

      res.json({
        diagnosisScore: updatedCaseStudy.diagnosisScore!,
        treatmentScore: updatedCaseStudy.treatmentScore!,
        feedback: updatedCaseStudy.feedback!,
        correctDiagnosis: updatedCaseStudy.correctDiagnosis,
        correctTreatment: updatedCaseStudy.correctTreatment,
        isCompleted: updatedCaseStudy.isCompleted!,
      });
    } catch (error) {
      console.error("Error submitting case study answers:", error);
      res.status(500).json({ message: "Failed to submit answers" });
    }
  });

  // Get case studies for a session
  app.get("/api/case-study/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const caseStudies = await storage.getCaseStudies(sessionId);
      res.json({ caseStudies });
    } catch (error) {
      console.error("Error retrieving case studies:", error);
      res.status(500).json({ message: "Unable to retrieve case studies" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      message: "Ghana STG Medical Assistant API is running" 
    });
  });

  // Initialize document processing on startup
  initializeDocumentProcessing();

  const httpServer = createServer(app);
  return httpServer;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function callRAGService(question: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'rag_service.py');
    const pythonProcess = spawn('python3', [pythonScript, question]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(output);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse RAG service response: ${error}`));
        }
      } else {
        reject(new Error(`RAG service failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start RAG service: ${error.message}`));
    });
  });
}

async function callCaseStudyGenerator(command: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'case_study_service.py');
    const pythonProcess = spawn('python3', [pythonScript, command]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(output);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse case study service response: ${error}`));
        }
      } else {
        reject(new Error(`Case study service failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start case study service: ${error.message}`));
    });
  });
}

async function callCaseStudyEvaluator(correctDiagnosis: string, correctTreatment: string, userDiagnosis: string, userTreatment: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server', 'case_study_service.py');
    const pythonProcess = spawn('python3', [pythonScript, 'evaluate', correctDiagnosis, correctTreatment, userDiagnosis, userTreatment]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(output);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse evaluation response: ${error}`));
        }
      } else {
        reject(new Error(`Evaluation service failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start evaluation service: ${error.message}`));
    });
  });
}

function initializeDocumentProcessing() {
  const pythonScript = path.join(process.cwd(), 'server', 'simple_document_processor.py');
  const docPath = path.join(process.cwd(), 'attached_assets', 'pharmacy_guide.docx');
  
  // Check if chunks already exist
  const chunksFile = path.join(process.cwd(), 'server', 'processed_chunks.json');
  if (fs.existsSync(chunksFile)) {
    console.log('Document chunks already processed');
    return;
  }
  
  const pythonProcess = spawn('python3', [pythonScript, docPath]);
  
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Document processing completed successfully');
    } else {
      console.error(`Document processing failed with code ${code}`);
    }
  });

  pythonProcess.on('error', (error) => {
    console.error(`Failed to start document processor: ${error.message}`);
  });
}
