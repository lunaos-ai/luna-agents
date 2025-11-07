#!/bin/bash

# Luna Agents Website Deployment Script
# This script deploys the website to Cloudflare Pages

echo "🚀 Luna Agents Website Deployment"
echo "=================================="
echo ""

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set"
    echo ""
    echo "Please set it with:"
    echo "  export CLOUDFLARE_API_TOKEN='your_token_here'"
    echo ""
    echo "Or add it to your ~/.zshrc:"
    echo "  echo 'export CLOUDFLARE_API_TOKEN=\"your_token_here\"' >> ~/.zshrc"
    echo "  source ~/.zshrc"
    exit 1
fi

echo "✅ API token found"
echo "📦 Deploying to Cloudflare Pages..."
echo ""

# Deploy to Cloudflare Pages
wrangler pages deploy website --project-name=luna-agents

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your website is live at:"
    echo "   https://luna-agents.pages.dev"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Add custom domain: agent.lunaos.ai"
    echo "   2. Configure DNS in Cloudflare Dashboard"
    echo "   3. Wait ~2 minutes for SSL provisioning"
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Common issues:"
    echo "  1. API token missing Cloudflare Pages - Edit permission"
    echo "  2. API token missing User Details - Read permission"
    echo "  3. API token missing Memberships - Read permission"
    echo ""
    echo "Fix at: https://dash.cloudflare.com/profile/api-tokens"
    exit 1
fi
