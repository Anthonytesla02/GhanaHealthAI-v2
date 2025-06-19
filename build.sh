#!/bin/bash
set -e

echo "Starting build process..."

# Ensure we have the latest npm
npm install -g npm@latest

# Clear any existing build artifacts
rm -rf dist/
rm -rf client/dist/

# Install dependencies with verbose logging
echo "Installing Node.js dependencies..."
npm install --verbose

# Verify critical build tools exist
echo "Verifying build tools..."
npx --version
npx vite --version
npx esbuild --version

# Build frontend
echo "Building frontend with Vite..."
npx vite build --mode production

# Build backend
echo "Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Verify build outputs exist
echo "Verifying build outputs..."
if [ ! -d "client/dist" ]; then
    echo "ERROR: Frontend build failed - client/dist not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "ERROR: Backend build failed - dist/index.js not found"
    exit 1
fi

echo "Build completed successfully!"