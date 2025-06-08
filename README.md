# Ghana STG Medical Assistant

An AI-powered medical chatbot based on Ghana's Standard Treatment Guidelines (7th Edition, 2017) using RAG (Retrieval-Augmented Generation) architecture.

## Features

- **AI-Powered Medical Guidance**: Get evidence-based medical advice using Mistral AI
- **Source Citations**: Every response includes references to specific sections of the Ghana STG
- **Vector Search**: Semantic search through medical guidelines using Pinecone vector database
- **Mobile-Responsive Design**: Optimized for mobile healthcare workers
- **Real-time Chat Interface**: Modern, WhatsApp-style chat experience
- **Contextual Responses**: RAG architecture ensures responses are grounded in official guidelines

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive styling
- **shadcn/ui** for UI components
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **FastAPI** (Python) for REST API
- **Pinecone** vector database for semantic search
- **OpenAI Embeddings** (text-embedding-3-large)
- **Mistral AI** for response generation
- **LangChain** for document processing

## Setup Instructions

### Prerequisites

1. **Python 3.8+** installed
2. **Node.js 18+** installed
3. **API Keys** for:
   - Mistral AI
   - Pinecone
   - OpenAI

### Environment Setup

1. Clone the repository and navigate to the project directory

2. Copy the environment file:
   ```bash
   cp .env.example .env
   