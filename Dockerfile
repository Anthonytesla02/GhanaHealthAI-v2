# Use Node.js 18 as base image
FROM node:18-alpine

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip build-base python3-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pyproject.toml ./

# Install Node.js dependencies
RUN npm ci --only=production

# Install Python dependencies
RUN pip3 install --no-cache-dir fastapi uvicorn python-docx langchain openai pinecone-client mistralai python-dotenv typing-extensions

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]