#!/usr/bin/env bash
# Build script for Render

echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Build complete!"
