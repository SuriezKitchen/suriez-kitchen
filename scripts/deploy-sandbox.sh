#!/bin/bash

# Deploy to Sandbox Environment
echo "🚀 Deploying to Sandbox Environment..."

# Check if we're on sandbox branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "sandbox" ]; then
    echo "⚠️  Switching to sandbox branch..."
    git checkout sandbox
fi

# Add all changes
echo "📝 Adding changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message: " commit_message
git commit -m "$commit_message"

# Push to sandbox
echo "🚀 Pushing to sandbox..."
git push origin sandbox

echo "✅ Sandbox deployment initiated!"
echo "🌐 Preview URL: https://suriez-kitchen-git-sandbox-suriezkitchen.vercel.app"
echo "⏳ Deployment will be ready in 1-2 minutes"
