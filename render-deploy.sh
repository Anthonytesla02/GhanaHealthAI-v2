#!/bin/bash
# Comprehensive Render deployment script
set -e

echo "🚀 Starting Ghana Health AI deployment process..."

# Install system dependencies
echo "📦 Installing system dependencies..."
apt-get update
apt-get install -y python3 python3-pip python3-venv build-essential

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create Python environment
echo "🐍 Setting up Python environment..."
python3 -m venv /opt/venv
source /opt/venv/bin/activate
pip install --upgrade pip setuptools wheel

# Install Python packages
echo "📦 Installing Python packages..."
pip install fastapi==0.104.1 uvicorn==0.24.0 python-docx==0.8.11 langchain==0.0.352 openai==1.3.8 pinecone-client==3.0.0 mistralai==0.4.0 python-dotenv==1.0.0 typing-extensions==4.8.0

# Build application
echo "🔨 Building application..."
export NODE_ENV=production
npm run build

echo "✅ Deployment preparation complete!"