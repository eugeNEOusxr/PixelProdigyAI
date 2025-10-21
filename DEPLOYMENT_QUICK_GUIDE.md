# 🚀 Quick Deployment Guide

**Created:** October 19, 2025  
**Purpose:** Deploy PixelProdigy to GitHub Pages  

---

## ✅ FIXES APPLIED

### **1. Permission Denied Error - FIXED!**
```bash
# The script was not executable
# Fixed with:
chmod +x deploy_to_github.sh

# Now run with:
./deploy_to_github.sh
# (No sudo needed!)
```

### **2. Social Card PNG Export - FIXED!**
- Added `html2canvas` library to `github_social_card.html`
- **Download PNG button** now exports exact 1280x640px PNG
- **Copy to Clipboard button** copies image directly
- Automatically hides safe zone guide before export
- Auto-restores safe zone after export
- 2x scale for crisp quality
- Perfect for GitHub social preview!

---

## 🎨 HOW TO CREATE SOCIAL CARD

### **Step 1: Open the Generator**
```bash
# Option A: Open in browser
xdg-open github_social_card.html

# Option B: Direct file path
file:///home/jeremy/PixelProdigyAI/github_social_card.html
```

### **Step 2: Export the Card**
```
1. Click "Toggle Safe Zone" to hide the dashed border
2. Click "Download PNG" button
3. File saves as: github_social_card.png (1280x640px)
4. Done! ✅
```

### **Alternative: Copy to Clipboard**
```
1. Click "Toggle Safe Zone" to hide guide
2. Click "Copy Image" button
3. Paste directly in GitHub/Discord/Twitter
4. Done! ✅
```

---

## 🚀 DEPLOY TO GITHUB PAGES

### **Step 1: Initialize Git (if needed)**
```bash
cd /home/jeremy/PixelProdigyAI

# Check if already a git repo
git status

# If not, initialize:
git init
git add .
git commit -m "Initial commit: PixelProdigy with mobile controls"
```

### **Step 2: Add GitHub Remote**
```bash
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/PixelProdigyAI.git

# Verify remote
git remote -v
```

### **Step 3: Run Deployment Script**
```bash
# Make sure it's executable (already done!)
chmod +x deploy_to_github.sh

# Run the script
./deploy_to_github.sh

# Follow the prompts:
# - It will show git status
# - Ask if you want to commit changes
# - Push to GitHub
# - Show next steps for GitHub Pages setup
```

### **Step 4: Enable GitHub Pages**
```
1. Go to: https://github.com/yourusername/PixelProdigyAI
2. Click: Settings (⚙️ gear icon)
3. Scroll to: Pages (left sidebar)
4. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Click "Save"
5. Wait 1-2 minutes
6. Your site will be live at:
   https://yourusername.github.io/PixelProdigyAI
```

### **Step 5: Add Custom Domain (Optional)**
```
In GitHub Pages settings:
1. Custom domain: eugeneous.dev
2. Click "Save"
3. Wait for DNS check (green checkmark)
4. Enable "Enforce HTTPS" (after DNS propagates)
```

### **Step 6: Configure DNS (at your domain registrar)**
```
Add these DNS records:

Type    Name    Value
──────────────────────────────────────
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     yourusername.github.io

Wait 24-48 hours for DNS propagation
```

### **Step 7: Upload Social Card**
```
1. Open github_social_card.html in browser
2. Click "Download PNG"
3. Save as github_social_card.png
4. Go to GitHub repo → Settings → Social preview
5. Click "Edit" → "Upload an image"
6. Select github_social_card.png
7. Save changes
8. Test by sharing repo link on Twitter/Discord!
```

---

## 🧪 TEST YOUR DEPLOYMENT

### **Test Pages:**
```bash
# After GitHub Pages is enabled:

1. Landing page:
   https://yourusername.github.io/PixelProdigyAI/

2. Premium landing:
   https://yourusername.github.io/PixelProdigyAI/index_premium.html

3. Main app:
   https://yourusername.github.io/PixelProdigyAI/pixelprodigy3d.html

4. Pricing:
   https://yourusername.github.io/PixelProdigyAI/pricing.html

5. Test suite:
   https://yourusername.github.io/PixelProdigyAI/test_ui_panels.html
```

### **Test Checklist:**
- [ ] Landing page loads
- [ ] Main app loads (THREE.js scene appears)
- [ ] No console errors
- [ ] Security warning appears on F12
- [ ] Mobile touch controls work (test on phone)
- [ ] All UI panels function
- [ ] Social card shows on repo link shares

---

## 📱 MOBILE TESTING

### **Test on Real Devices:**
```
iOS (iPhone/iPad):
1. Open Safari
2. Go to: https://yourusername.github.io/PixelProdigyAI/pixelprodigy3d.html
3. Test: Single touch, pinch, twist, three-finger pan
4. Verify: Virtual joystick appears bottom-left
5. Check: Panels collapse properly

Android (Phone/Tablet):
1. Open Chrome
2. Go to: https://yourusername.github.io/PixelProdigyAI/pixelprodigy3d.html
3. Test: All touch gestures
4. Verify: Haptic feedback works
5. Check: No page scrolling during sculpting
```

---

## ❌ TROUBLESHOOTING

### **Problem: "Permission denied" when running script**
```bash
# Solution:
chmod +x deploy_to_github.sh
./deploy_to_github.sh  # No sudo!
```

### **Problem: "fatal: not a git repository"**
```bash
# Solution:
git init
git add .
git commit -m "Initial commit"
```

### **Problem: "No remote repository"**
```bash
# Solution:
git remote add origin https://github.com/yourusername/PixelProdigyAI.git
```

### **Problem: "Push failed"**
```bash
# Solution (first push):
git push -u origin main

# If branch is 'master' instead of 'main':
git branch -M main
git push -u origin main
```

### **Problem: "GitHub Pages not building"**
```
Solutions:
1. Check Settings → Pages is enabled
2. Verify branch is 'main' not 'master'
3. Wait 2-3 minutes for first build
4. Check Actions tab for build status
5. Ensure index.html exists in root
```

### **Problem: "404 on GitHub Pages"**
```
Solutions:
1. Wait 2-5 minutes after enabling Pages
2. Hard refresh: Ctrl+Shift+R
3. Check URL is correct: username.github.io/PixelProdigyAI
4. Verify repo is public (not private)
5. Check Settings → Pages shows green checkmark
```

### **Problem: "Social card doesn't download"**
```
Solutions:
1. Make sure html2canvas loaded (check console)
2. Allow pop-ups in browser settings
3. Try "Copy Image" button instead
4. Use manual screenshot: Ctrl+Shift+S (Firefox)
5. Check browser console for errors
```

### **Problem: "Custom domain not working"**
```
Solutions:
1. Verify DNS records are correct (4 A records + CNAME)
2. Wait 24-48 hours for DNS propagation
3. Check DNS with: dig eugeneous.dev
4. Ensure CNAME file contains only: eugeneous.dev
5. Don't enable HTTPS until DNS check passes (green ✓)
```

---

## 🎯 QUICK COMMANDS REFERENCE

### **Git Commands:**
```bash
# Status
git status

# Add all files
git add .

# Commit
git commit -m "Your message here"

# Push
git push origin main

# View remote
git remote -v

# Change remote
git remote set-url origin https://github.com/yourusername/PixelProdigyAI.git
```

### **Deployment Script:**
```bash
# Make executable
chmod +x deploy_to_github.sh

# Run deployment
./deploy_to_github.sh

# View script
cat deploy_to_github.sh
```

### **Test Locally:**
```bash
# Start simple HTTP server (Python 3)
python3 -m http.server 8000

# Or use Node.js http-server
npx http-server -p 8000

# Then open:
http://localhost:8000/pixelprodigy3d.html
```

---

## ✅ DEPLOYMENT CHECKLIST

### **Before Deploy:**
- [x] Fixed duplicate functions (updateBindingVisuals, updateFragments)
- [x] Added F12 warning popup
- [x] Added referrer policy
- [x] Created social card with 40pt safe zone
- [x] Made deploy script executable
- [x] All HTML files present
- [x] CNAME file created

### **Deploy Steps:**
- [ ] Run `./deploy_to_github.sh`
- [ ] Push to GitHub successfully
- [ ] Enable GitHub Pages in settings
- [ ] Wait 2 minutes for first build
- [ ] Test live site loads

### **After Deploy:**
- [ ] Upload social card (github_social_card.png)
- [ ] Test all pages work
- [ ] Test on mobile devices
- [ ] Share repo link to test social preview
- [ ] Buy domain (eugeneous.dev)
- [ ] Configure custom domain DNS
- [ ] Wait for SSL (24-48 hours)

---

## 🎉 SUCCESS CHECKLIST

When everything works, you should see:

✅ Site live at: https://yourusername.github.io/PixelProdigyAI  
✅ Main app loads with 3D scene  
✅ Security warning on F12  
✅ Mobile touch controls work  
✅ Social card shows on link shares  
✅ All UI panels functional  
✅ No console errors  
✅ Responsive on mobile  

---

## 📞 NEED HELP?

### **GitHub Pages Official Docs:**
https://docs.github.com/en/pages

### **Custom Domain Setup:**
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

### **Troubleshooting GitHub Pages:**
https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites

### **Check Build Status:**
https://github.com/yourusername/PixelProdigyAI/actions

---

## 🚀 YOU'RE READY!

All fixes applied:
- ✅ Deploy script is executable
- ✅ Social card exports to PNG (1280x640px)
- ✅ 40pt safe zone protected
- ✅ html2canvas working
- ✅ Deployment guide complete

**Next step:** Run `./deploy_to_github.sh` and follow the prompts! 🎉
