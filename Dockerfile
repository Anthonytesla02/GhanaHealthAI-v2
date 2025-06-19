# Use Node.js 18 with full system (not alpine) for better compatibility
FROM node:18

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies (including devDependencies for build)
RUN npm install

# Create Python virtual environment and install packages
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install \
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

# Make build script executable and run it
COPY build.sh ./
RUN chmod +x build.sh
ENV NODE_ENV=production
RUN ./build.sh

# Clean up dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 5000

# Make sure Python virtual environment is active
ENV PATH="/opt/venv/bin:$PATH"

# Start command
CMD ["node", "dist/index.js"]