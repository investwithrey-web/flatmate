#!/bin/bash

# Flatmate Frontend Setup Script
# This script installs all dependencies needed to run the frontend

set -e

# Change to frontend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "========================================"
echo "Flatmate Frontend Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

echo "Installing dependencies..."
npm install

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Available commands:"
echo "  npm run dev    - Start development server"
echo "  npm run build  - Build for production"
echo "  npm run start  - Start production server"
echo "  npm run lint   - Run ESLint"
echo ""
echo "To start development, run: npm run dev"
echo ""
