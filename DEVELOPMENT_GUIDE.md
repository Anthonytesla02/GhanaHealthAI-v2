# MediQA Ghana Medical Assistant - Complete Development Guide

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [AI/RAG Service](#airag-service)
5. [Data Flow](#data-flow)
6. [Code Examples](#code-examples)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Deployment Guide](#deployment-guide)

---

## Project Architecture

### Overall Structure
```
project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main application
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data storage layer
│   ├── vite.ts           # Development server setup
│   ├── rag_service.py    # Python AI service
│   └── processed_chunks.json # Medical knowledge base
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database and API schemas
└── attached_assets/      # Medical documents
    └── pharmacy_guide.docx
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Wouter (lightweight routing)
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- Radix UI (accessible components)

**Backend:**
- Express.js (Node.js server)
- TypeScript
- In-memory storage

**AI Processing:**
- Python 3.11
- Mistral AI (language model)
- Custom RAG implementation
- Document processing pipeline

---

## Frontend Implementation

### Main Application Structure

**File: `client/src/App.tsx`**
```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

### Chat Page Implementation

**File: `client/src/pages/chat.tsx`**
```typescript
import { useState } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { useChat } from "@/hooks/use-chat";

export default function ChatPage() {
  const [sessionId] = useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const { messages, isLoading, sendMessage, error } = useChat(sessionId);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl">
      <ChatHeader />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      {error && (
        <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <div>
                <p className="font-medium text-sm">Connection Error</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Custom Chat Hook

**File: `client/src/hooks/use-chat.ts`**
```typescript
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendChatMessage, getChatHistory } from "@/lib/chat-api";
import { type ChatMessage } from "@shared/schema";

export function useChat(sessionId: string) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get chat history
  const { data: chatData } = useQuery({
    queryKey: ["/api/chat", sessionId],
    queryFn: () => getChatHistory(sessionId),
    enabled: !!sessionId,
  });

  const messages: ChatMessage[] = chatData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      // Invalidate and refetch chat history
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to send message. Please try again.");
    },
  });

  const sendMessage = useCallback(
    (question: string) => {
      sendMessageMutation.mutate({
        question,
        sessionId,
      });
    },
    [sendMessageMutation, sessionId]
  );

  return {
    messages,
    isLoading: sendMessageMutation.isPending,
    sendMessage,
    error,
  };
}
```

### Message Bubble Component

**File: `client/src/components/message-bubble.tsx`**
```typescript
import { type ChatMessage } from "@shared/schema";
import { SourceCitations } from "./source-citations";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs shadow-sm">
          <p className="text-sm">{message.content}</p>
          <div className="flex justify-end mt-2">
            <span className="text-xs text-blue-100">{timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm shadow-sm">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-2">
            <i className="fas fa-robot text-white text-xs"></i>
          </div>
          <span className="text-xs font-medium text-slate-600">Medical Assistant</span>
        </div>

        <div className="prose-sm text-slate-700 mb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Source Citations */}
        {message.sources && Array.isArray(message.sources) && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}

        <div className="flex justify-start mt-3">
          <span className="text-xs text-slate-500">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## Backend Implementation

### Express Server Setup

**File: `server/index.ts`**
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});
```

### API Routes Implementation

**File: `server/routes.ts`**
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatRequestSchema, chatResponseSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
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
```

---

## AI/RAG Service

### Python RAG Implementation

**File: `server/rag_service.py`**
```python
import os
import sys
import json
from typing import List, Dict, Any
import re
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

class RAGService:
    def __init__(self):
        if os.getenv('MISTRAL_API_KEY'):
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

    def generate_response(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate response using Mistral AI."""
        if not self.mistral_client:
            return self._get_fallback_response(query)
            
        try:
            # Prepare context from retrieved chunks
            context = "\n\n".join([
                f"From {chunk['section']}: {chunk['content']}"
                for chunk in context_chunks
            ])
            
            # Construct prompt
            prompt = f"""You are a clinical assistant specializing in Ghana's Standard Treatment Guidelines (7th Edition, 2017). Your role is to provide accurate, evidence-based medical guidance based on the official guidelines.

Context from Ghana Standard Treatment Guidelines:
{context}

Question: {query}

Instructions:
- Provide a clear, professional medical response based on the Ghana STG
- Include specific treatment recommendations when available
- Mention dosages, monitoring requirements, and safety considerations
- Be concise but comprehensive
- If the query is outside the scope of the guidelines, advise consulting healthcare professionals
- Always emphasize the importance of proper medical assessment

Answer:"""

            # Call Mistral API
            messages = [
                ChatMessage(role="user", content=prompt)
            ]
            
            response = self.mistral_client.chat(
                model="mistral-large-latest",
                messages=messages,
                temperature=0.3,
                max_tokens=800
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating response: {e}", file=sys.stderr)
            return self._get_fallback_response(query)

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
```

---

## Data Flow

### 1. User Interaction Flow
```
User Types Question → ChatInput Component → useChat Hook → sendChatMessage API
                                                                      ↓
Response Display ← MessageBubble ← ChatMessages ← useChat Hook ← API Response
```

### 2. Backend Processing Flow
```
API Request → Route Handler → Storage (User Message) → Python RAG Service
                                           ↓                      ↓
Response JSON ← Storage (AI Response) ← Route Handler ← RAG Processing
```

### 3. RAG Processing Pipeline
```
Question → Keyword Extraction → Chunk Retrieval → Context Building → Mistral AI → Response
```

---

## Database Schema

**File: `shared/schema.ts`**
```typescript
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  sources: jsonb("sources"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentChunks = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Request/Response Schemas
export const chatRequestSchema = z.object({
  question: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
});

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  page: z.string().optional(),
  section: z.string().optional(),
});

export const chatResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(sourceSchema),
  sessionId: z.string(),
});

// Type Exports
export type ChatMessage = typeof chatMessages.$inferSelect;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type Source = z.infer<typeof sourceSchema>;
```

---

## API Documentation

### Endpoints

#### POST /api/search
Process medical questions using RAG
```typescript
Request Body: {
  question: string;      // Medical question (1-1000 chars)
  sessionId?: string;    // Optional session ID
}

Response: {
  answer: string;        // AI-generated medical response
  sources: Source[];     // Supporting citations
  sessionId: string;     // Session identifier
}
```

#### GET /api/chat/:sessionId
Retrieve chat history for session
```typescript
Response: {
  messages: ChatMessage[];  // Array of chat messages
}
```

#### GET /api/health
Health check endpoint
```typescript
Response: {
  status: "healthy";
  message: string;
}
```

---

## Deployment Guide

### Environment Setup
1. **Replit Secrets Configuration**
   - Set `MISTRAL_API_KEY` in Replit secrets
   - Ensure Python 3.11 is available
   - Install required packages via package manager

2. **Development Server**
   ```bash
   npm run dev  # Starts Express + Vite development server
   ```

3. **Production Build**
   ```bash
   npm run build  # Builds frontend and backend
   npm start      # Starts production server
   ```

### Required Dependencies
**Node.js packages**: Express, TypeScript, Vite, React, TanStack Query, Wouter, Tailwind CSS
**Python packages**: mistralai, python-dotenv, python-docx

### File Structure Requirements
- `server/processed_chunks.json` - Medical knowledge base
- `attached_assets/pharmacy_guide.docx` - Source document
- Environment variable `MISTRAL_API_KEY` configured

---

*This guide provides complete technical documentation for understanding, maintaining, and extending the MediQA Ghana Medical Assistant application.*