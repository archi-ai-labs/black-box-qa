#!/bin/bash

echo "🚀 Setting up Black-box QA Workspace..."

# Check Node.js version
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js >= 18."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ ! -f .env ]; then
    echo "⚙️ Creating .env from .env.example..."
    cp .env.example .env
else
    echo "✅ .env file already exists."
fi

echo ""
echo "🎉 Setup complete!"
echo "To start the development server, run: npm run dev"
echo "To initialize as a global CLI tool (later), you will use: npx black-box-qa init"
