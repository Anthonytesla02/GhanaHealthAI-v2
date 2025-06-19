# Use Node.js 18 as base image
FROM node:18-alpine

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip build-base python3-dev gcc musl-dev libffi-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Create Python virtual environment and install packages
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    python-docx==0.8.11 \
    langchain==0.0.352 \
    openai==1.3.8 \
    pinecone-client==3.0.0 \
    mistralai==0.4.0 \
    python-dotenv==1.0.0 \
    typing-extensions==4.8.0

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Make sure Python virtual environment is active
ENV PATH="/opt/venv/bin:$PATH"

# Start command
CMD ["npm", "start"]