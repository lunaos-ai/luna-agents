#!/bin/bash

# Luna RAG Backend Deployment Script
# Deploys to AWS Lambda using Serverless Framework

set -e

echo "🚀 Deploying Luna RAG Backend..."

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework not installed. Installing now..."
    npm install -g serverless
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to AWS
echo "☁️  Deploying to AWS Lambda..."
serverless deploy

echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the API endpoint from above"
echo "2. Update your Claude Code plugin configuration"
echo "3. Test the health endpoint: [YOUR_API_ENDPOINT]/health"
echo "4. Configure LemonSqueezy webhooks to: [YOUR_API_ENDPOINT]/webhook"
echo ""
echo "🎯 Your Luna RAG backend is now live!"