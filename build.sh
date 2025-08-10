#!/bin/bash

# EcoSort Frontend Build Script for Vercel
echo "Building EcoSort Frontend..."

# Navigate to frontend directory
cd frontend/ecosort

# Install dependencies with legacy peer deps
npm install --legacy-peer-deps

# Build the application
npm run build

echo "Build completed successfully!"
