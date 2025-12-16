#!/usr/bin/env bash
# Build script for Render

set -e  # Exit on error

echo "Installing root dependencies..."

npm install

echo "Installing backend dependencies..."

cd backend

npm ci --production=false

echo "Installing frontend dependencies (including dev for build tools)..."

cd ../frontend

npm ci --production=false

echo "Building frontend..."

npm run build

echo "Verifying build output..."

ls -la dist/

echo "Build complete!"