#!/bin/bash
# Production start script for Render deployment

echo "Starting Ghana Health AI application..."

# Install Python dependencies if not already installed
if [ ! -d ".pythonlibs" ]; then
    echo "Installing Python dependencies..."
    pip3 install fastapi uvicorn python-docx langchain openai pinecone-client mistralai python-dotenv typing-extensions
fi

# Start the Node.js application
node dist/index.js