#!/bin/bash

# PixelProdigy GitHub Pages Deployment Script
# Run this to deploy to GitHub Pages

echo "🚀 PixelProdigy GitHub Pages Deployment"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized"
    echo "Run: git init"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  No remote 'origin' found"
    echo ""
    read -p "Enter your GitHub repository URL: " REPO_URL
    git remote add origin "$REPO_URL"
    echo "✅ Remote added: $REPO_URL"
    echo ""
fi

# Show current status
echo "📊 Current Status:"
echo "-------------------"
git status --short
echo ""

# Prompt for commit message
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="🚀 Deploy PixelProdigy v1.0 - $(date '+%Y-%m-%d %H:%M')"
fi

# Stage all files
echo "📦 Staging files..."
git add .

# Commit
echo "💾 Committing..."
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your site will be live at:"
    REMOTE_URL=$(git remote get-url origin)
    USERNAME=$(echo $REMOTE_URL | sed -E 's|.*github.com[:/]([^/]+)/.*|\1|')
    REPO=$(echo $REMOTE_URL | sed -E 's|.*github.com[:/][^/]+/(.+)(\.git)?$|\1|' | sed 's/.git$//')
    echo "   https://$USERNAME.github.io/$REPO/"
    echo ""
    echo "⏳ Wait 1-2 minutes for GitHub Pages to build"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Go to: https://github.com/$USERNAME/$REPO/settings/pages"
    echo "   2. Under 'Source', select branch: main, folder: / (root)"
    echo "   3. Click Save"
    echo "   4. Wait for deployment (check Actions tab)"
    echo "   5. Visit your live site!"
    echo ""
    echo "🎉 Happy creating!"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   - Check if remote URL is correct"
    echo "   - Make sure you have push access"
    echo "   - Try: git push -u origin main --force (if this is first push)"
fi
