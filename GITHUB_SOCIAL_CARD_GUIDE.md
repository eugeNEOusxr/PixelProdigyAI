# GitHub Social Card Templates - 40pt Safe Zone

**Date:** October 19, 2025  
**Purpose:** GitHub repository social preview image  
**Dimensions:** 1280x640px (GitHub recommended)  
**Safe Zone:** 40pt border on all sides  

---

## 📐 SAFE ZONE SPECIFICATIONS

### **Why 40pt Border?**
GitHub's social cards get cropped differently on various platforms:
- **GitHub Desktop:** Full 1280x640px visible
- **GitHub Mobile:** Crops ~30px from edges
- **Twitter Cards:** Crops ~35px from edges  
- **Discord Embeds:** Crops ~40px from edges
- **LinkedIn Shares:** Crops ~45px from edges

**Solution:** 40pt safe zone ensures ALL text/logos stay visible everywhere!

---

## 🎨 DESIGN SPECIFICATIONS

### **Full Dimensions:**
```
Width:  1280px (standard)
Height: 640px  (standard)
Ratio:  2:1    (GitHub requirement)
Format: PNG or JPG
```

### **Safe Content Area:**
```
Top:    40pt (53px at 1x)
Bottom: 40pt (53px at 1x)
Left:   40pt (53px at 1x)
Right:  40pt (53px at 1x)

Safe Width:  1174px (1280 - 106)
Safe Height: 534px  (640 - 106)
```

### **Critical Elements Placement:**
```
Logo:        Center or 40pt from top
Tagline:     Center, 40pt margin
Description: Center, 40pt margin
Footer:      Center, 40pt from bottom

❌ NEVER place text/logos within 40pt of edge!
```

---

## 🖼️ TEMPLATE OPTIONS

### **Option 1: Dark Gradient (Current)**
- Background: Black → Dark Purple gradient
- Border: Golden animated glow
- Logo: 72px, gradient gold→orange→pink
- Tagline: 32px, golden
- Features: Badge style with icons
- Particles: 50 floating golden dots

### **Option 2: Minimalist**
```css
Background: Solid #0d1117 (GitHub dark)
Border: 2px solid #FFD700
Logo: 96px, white + golden accent
Tagline: 40px, golden
Description: 24px, gray
Features: Simple text list
```

### **Option 3: Screenshot Showcase**
```
Background: Blurred app screenshot
Overlay: Dark gradient (80% opacity)
Logo: Top-left (80pt from edges)
Tagline: Bottom-left (80pt from edges)
QR Code: Bottom-right (80pt from edges)
```

### **Option 4: Feature Grid**
```
Layout: 2x2 grid of features
Each cell: Icon + title + description
Border: Golden frame
Center: Logo + tagline
Background: Dark with subtle pattern
```

---

## 📱 PLATFORM-SPECIFIC RENDERING

### **GitHub Desktop/Web:**
```
Full 1280x640px visible
Safe zone: Recommended but not required
Best for: Detailed designs
```

### **GitHub Mobile App:**
```
Visible: 1220x580px (crops ~30px)
Safe zone: REQUIRED
Avoid: Text near edges
```

### **Twitter/X Cards:**
```
Visible: 1210x570px (crops ~35px)
Safe zone: REQUIRED
Avoid: Fine details at edges
```

### **Discord Embeds:**
```
Visible: 1200x560px (crops ~40px)
Safe zone: CRITICAL
Avoid: Any content at edges
```

### **LinkedIn:**
```
Visible: 1190x550px (crops ~45px)
Safe zone: EXTRA CRITICAL
Avoid: Logos at edges
```

---

## 🎯 CONTENT GUIDELINES

### **Text Hierarchy:**
```
1. Logo/Brand:   72-96px (most important)
2. Tagline:      32-40px (hook phrase)
3. Description:  20-24px (1-2 lines max)
4. Features:     16-18px (badges/icons)
5. Footer:       14-16px (tech stack)
```

### **What to Include:**
✅ Project name/logo (large, centered)  
✅ One-line tagline (what it does)  
✅ 3-4 key features (visual icons)  
✅ Tech stack badges  
✅ Website URL or domain  

❌ Don't include:
- Long paragraphs (won't be readable)
- Tiny text (minimum 16px)
- Code snippets (too detailed)
- More than 4-5 features
- Contact info (use README)

---

## 🛠️ CREATION WORKFLOW

### **Method 1: HTML Template (Recommended)**
```bash
1. Open: github_social_card.html
2. Edit: Text content in HTML
3. Toggle: Hide safe zone guide
4. Screenshot: Use Firefox (Ctrl+Shift+S)
5. Save: github_social_card.png
6. Upload: GitHub Settings → Social preview
```

### **Method 2: Figma/Canva**
```
1. Create: 1280x640px canvas
2. Add: 40pt guide margins
3. Design: Within safe area
4. Export: PNG at 2x resolution
5. Upload: To GitHub
```

### **Method 3: Python Script**
```python
from PIL import Image, ImageDraw, ImageFont

# Create canvas
img = Image.new('RGB', (1280, 640), color='#000000')
draw = ImageDraw.Draw(img)

# Safe zone: 40pt = 53px
margin = 53

# Add text (centered, inside safe zone)
font_logo = ImageFont.truetype('Arial', 72)
text = "PixelProdigyAI"
bbox = draw.textbbox((0, 0), text, font=font_logo)
x = (1280 - bbox[2]) // 2
y = 200
draw.text((x, y), text, fill='#FFD700', font=font_logo)

# Save
img.save('github_social_card.png')
```

### **Method 4: ImageMagick CLI**
```bash
convert -size 1280x640 xc:'#000000' \
  -gravity center \
  -fill '#FFD700' \
  -pointsize 72 \
  -annotate +0-100 'PixelProdigyAI' \
  -pointsize 32 \
  -annotate +0+0 '3D Sculpting in Your Browser' \
  github_social_card.png
```

---

## 📊 TESTING CHECKLIST

### **Before Upload:**
- [ ] Dimensions exactly 1280x640px
- [ ] All text at least 40pt from edges
- [ ] Logo/brand clearly visible
- [ ] Text readable at thumbnail size
- [ ] No safe zone guides visible
- [ ] Format: PNG or JPG
- [ ] File size < 1MB (GitHub limit)

### **After Upload:**
Test preview on:
- [ ] GitHub repo page (desktop)
- [ ] GitHub repo page (mobile)
- [ ] Share link on Twitter/X
- [ ] Share link on Discord
- [ ] Share link on LinkedIn
- [ ] Direct link preview

### **Visual Tests:**
- [ ] Text legible in all previews
- [ ] Colors not washed out
- [ ] Logo not cropped
- [ ] Features visible
- [ ] No pixelation

---

## 🎨 COLOR RECOMMENDATIONS

### **Brand Colors (PixelProdigy):**
```css
Primary Gold:   #FFD700
Accent Orange:  #FFA500
Highlight Pink: #FF69B4
Background:     #000000
Text Light:     #FFFFFF
Text Gray:      #CCCCCC
Border:         rgba(255, 215, 0, 0.5)
```

### **GitHub Dark Theme Match:**
```css
Background:     #0d1117
Surface:        #161b22
Border:         #30363d
Text Primary:   #c9d1d9
Text Secondary: #8b949e
Accent Blue:    #58a6ff
```

### **High Contrast (Accessibility):**
```css
Background:     #000000
Text:           #FFFFFF
Accent:         #FFD700
Ratio:          21:1 (WCAG AAA)
```

---

## 📝 EXAMPLE CONTENT

### **PixelProdigy Version 1:**
```
Logo:        "PixelProdigyAI"
Tagline:     "3D Sculpting in Your Browser"
Description: "Zero downloads • Mobile ready • 10-layer security"
Features:    🔗 Binding • 💥 Fragmentation • ✨ Particles • 📱 Touch
Tech:        Three.js • WebGL • eugeneous.dev
```

### **PixelProdigy Version 2:**
```
Logo:        "PixelProdigy"
Tagline:     "Create 3D Art Anywhere"
Description: "Professional sculpting tools in your browser. No installation required."
Features:    Desktop & Mobile • Real-time 3D • Cloud Sync • Marketplace
Tech:        Powered by WebGL
```

### **PixelProdigy Version 3:**
```
Logo:        "PP" (monogram)
Tagline:     "Browser-Based 3D Creation"
Description: "Sculpt, fragment, bind, and animate"
Features:    [4 screenshot thumbnails]
Tech:        eugeneous.dev
```

---

## 🚀 GITHUB UPLOAD INSTRUCTIONS

### **Step 1: Generate Card**
```bash
1. Open github_social_card.html
2. Customize text if needed
3. Click "Toggle Safe Zone" to hide guides
4. Screenshot the card (full 1280x640px)
5. Save as: github_social_card.png
```

### **Step 2: Upload to GitHub**
```bash
1. Go to: https://github.com/yourusername/PixelProdigyAI
2. Click: Settings (gear icon)
3. Scroll to: Social preview section
4. Click: Edit
5. Upload: github_social_card.png
6. Save changes
```

### **Step 3: Verify**
```bash
1. Copy repo URL
2. Share in Discord/Slack
3. Check preview looks correct
4. Test on mobile devices
5. Adjust if text is cropped
```

---

## 💡 PRO TIPS

### **Design Tips:**
- Use bold, high-contrast colors
- Keep text SHORT (1-2 lines max per section)
- Use icons/emojis for visual interest
- Test at 50% zoom (how most people see it)
- Avoid gradients that don't compress well

### **Technical Tips:**
- Export at 2x resolution, downscale to 1280x640
- Use PNG for text/logos (crisp edges)
- Use JPG for photos/gradients (smaller size)
- Compress with TinyPNG before upload
- Test with GitHub's card validator

### **Branding Tips:**
- Match your website's color scheme
- Use consistent typography
- Include your domain/brand name
- Make it recognizable at thumbnail size
- Update seasonally for engagement

---

## 📐 SAFE ZONE CALCULATOR

```javascript
// Calculate safe content area
const fullWidth = 1280;
const fullHeight = 640;
const safeMargin = 40; // points

// Convert pt to px (assuming 72 DPI)
const marginPx = Math.round(safeMargin * 1.333);

const safeArea = {
  x: marginPx,
  y: marginPx,
  width: fullWidth - (marginPx * 2),
  height: fullHeight - (marginPx * 2)
};

console.log('Safe Area:', safeArea);
// Output: { x: 53, y: 53, width: 1174, height: 534 }
```

---

## ✅ FINAL CHECKLIST

Before publishing your social card:

**Design:**
- [ ] 40pt safe zone respected
- [ ] Text is large and bold
- [ ] Colors are high contrast
- [ ] Brand clearly visible
- [ ] Features easy to read

**Technical:**
- [ ] Exactly 1280x640px
- [ ] PNG or JPG format
- [ ] File size < 1MB
- [ ] No transparency issues
- [ ] Compressed optimally

**Content:**
- [ ] Project name visible
- [ ] Tagline compelling
- [ ] Features accurate
- [ ] Website URL included
- [ ] No typos

**Testing:**
- [ ] Looks good on GitHub
- [ ] Looks good on mobile
- [ ] Looks good on Twitter
- [ ] Looks good on Discord
- [ ] Text not cropped

---

## 🎉 READY TO DEPLOY!

Your GitHub social card is ready with proper 40pt safe zone borders.

**Files created:**
- `github_social_card.html` - Interactive generator
- `GITHUB_SOCIAL_CARD_GUIDE.md` - This guide

**Next steps:**
1. Open `github_social_card.html` in browser
2. Screenshot the card (1280x640px)
3. Upload to GitHub Settings → Social preview
4. Share your repo and watch the beautiful card appear! 🎨✨

---

**Need help?** Check GitHub's official guide:  
https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview
