#!/bin/bash

# Deploy to Production Environment
echo "🚀 Deploying to Production Environment..."

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Switching to main branch..."
    git checkout main
fi

# Merge sandbox changes
echo "🔄 Merging sandbox changes..."
git merge sandbox

# Push to production
echo "🚀 Pushing to production..."
git push origin main

echo "✅ Production deployment initiated!"
echo "🌐 Production URL: https://suriez-kitchen.vercel.app"
echo "⏳ Deployment will be ready in 1-2 minutes"
