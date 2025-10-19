#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# PIXELPRODIGY GITHUB PAGES DEPLOYMENT SCRIPT
# Deploy to: eugeneous.dev
# ═══════════════════════════════════════════════════════════════════════════

echo "🚀 PixelProdigy GitHub Pages Deployment"
echo "════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if we're in the right directory
if [ ! -f "pixelprodigy3d.html" ]; then
    echo -e "${RED}❌ Error: pixelprodigy3d.html not found${NC}"
    echo "Please run this script from the PixelProdigyAI directory"
    exit 1
fi

echo -e "${GREEN}✅ Found PixelProdigy files${NC}"
echo ""

# Step 2: Check CNAME file
if [ ! -f "CNAME" ]; then
    echo -e "${YELLOW}⚠️  CNAME file not found, creating...${NC}"
    echo "eugeneous.dev" > CNAME
    echo -e "${GREEN}✅ Created CNAME file with eugeneous.dev${NC}"
else
    echo -e "${GREEN}✅ CNAME file exists${NC}"
    echo "   Domain: $(cat CNAME)"
fi
echo ""

# Step 3: Check git status
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    echo "Please initialize git first:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    exit 1
fi

echo -e "${GREEN}✅ Git repository detected${NC}"
echo ""

# Step 4: Show current status
echo -e "${BLUE}📊 Current Git Status:${NC}"
git status --short
echo ""

# Step 5: Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    read -p "Do you want to commit all changes now? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📝 Adding all files...${NC}"
        git add .
        
        echo ""
        read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
        
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Deploy: Fixed duplicate functions, added F12 warning, ready for production"
        fi
        
        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment cancelled - commit changes first${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi
echo ""

# Step 6: Check remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo -e "${RED}❌ No remote repository configured${NC}"
    echo ""
    echo "Please add a remote repository:"
    echo "  git remote add origin https://github.com/yourusername/PixelProdigyAI.git"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Remote repository:${NC}"
    echo "   $REMOTE_URL"
fi
echo ""

# Step 7: Push to GitHub
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Push failed${NC}"
    echo "If this is your first push, try:"
    echo "  git push -u origin main"
    exit 1
fi
echo ""

# Step 8: Instructions for GitHub Pages
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ CODE DEPLOYED TO GITHUB!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Go to your GitHub repository settings:"
echo "   https://github.com/yourusername/PixelProdigyAI/settings/pages"
echo ""
echo "2️⃣  Under 'Build and deployment':"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main / (root)"
echo "   - Click 'Save'"
echo ""
echo "3️⃣  Configure Custom Domain:"
echo "   - Custom domain: eugeneous.dev"
echo "   - Wait for DNS check to pass"
echo "   - Enable 'Enforce HTTPS' (wait 24hrs for SSL)"
echo ""
echo "4️⃣  Configure DNS at your domain registrar:"
echo "   Type    Name    Value"
echo "   ─────────────────────────────────────────"
echo "   A       @       185.199.108.153"
echo "   A       @       185.199.109.153"
echo "   A       @       185.199.110.153"
echo "   A       @       185.199.111.153"
echo "   CNAME   www     yourusername.github.io"
echo ""
echo "5️⃣  Your site will be live at:"
echo "   🌐 https://eugeneous.dev"
echo "   🌐 https://www.eugeneous.dev"
echo ""
echo -e "${YELLOW}⏰ SSL certificate takes 24-48 hours to provision${NC}"
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""

# Step 9: Open test page
echo "📱 Would you like to open the test suite?"
read -p "Open test_ui_panels.html in browser? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open test_ui_panels.html
    elif command -v open &> /dev/null; then
        open test_ui_panels.html
    else
        echo "Please open test_ui_panels.html manually in your browser"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🚀 Deployment script complete!"
echo "═══════════════════════════════════════════════════════════════════════════"
