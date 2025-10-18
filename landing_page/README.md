# PixelProdigy AI Landing Page

## 🌐 Deployment Instructions

### Option 1: GitHub Pages (Recommended)

1. **Create GitHub Repository**
   ```bash
   cd /home/jeremy/PixelProdigyAI
   git init
   git add .
   git commit -m "Initial commit - PixelProdigy AI MyPlace YourPlace"
   ```

2. **Push to GitHub**
   ```bash
   # Create repo at github.com/eugeneousxr/myplaceyourplace
   git remote add origin https://github.com/eugeneousxr/myplaceyourplace.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/landing_page`
   - Save

4. **Access Your Site**
   - URL: `https://eugeneousxr.github.io/myplaceyourplace/`

### Option 2: Custom Domain

1. **Add CNAME file**
   ```bash
   echo "myplaceyourplace.com" > landing_page/CNAME
   ```

2. **Configure DNS**
   - Add A records pointing to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Add CNAME record: `www` → `eugeneousxr.github.io`

3. **Enable Custom Domain in GitHub Settings**
   - Settings → Pages → Custom domain
   - Enter: `myplaceyourplace.com`
   - Enable HTTPS

---

## 🔑 API Keys Required

### 1. Google Maps API Key

**Get your key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "PixelProdigy AI"
3. Enable APIs:
   - Maps JavaScript API
   - Elevation API
   - Geocoding API
   - Places API
4. Create credentials → API Key
5. Restrict key:
   - Application restrictions: HTTP referrers
   - Add: `https://eugeneousxr.github.io/*`
   - API restrictions: Select enabled APIs only

**Replace in code:**
```html
<!-- In index.html line 20 -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places,geometry&callback=initMap" async defer></script>
```

**Monthly free tier:**
- $200 credit per month
- 28,000 map loads free
- 40,000 elevation requests free

### 2. OpenWeather API Key (Optional - for weather integration)

**Get your key:**
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get API key from dashboard

**Usage:**
- Free tier: 60 calls/minute, 1M calls/month
- Add to `google_maps_integration.js` CONFIG

---

## 📁 File Structure

```
landing_page/
├── index.html              # Main landing page
├── README.md              # This file
└── assets/                # (Create this folder)
    ├── images/
    │   ├── logo.png
    │   ├── sky-mansion-preview.jpg
    │   └── og-image.jpg   # For social media previews
    ├── models/            # 3D models
    │   └── sky_mansion.gltf
    └── styles/
        └── (optional separate CSS)
```

---

## 🎨 Customization Guide

### Colors
All colors defined in CSS `:root`:
```css
--primary-white: #FFFFFF;
--primary-black: #000000;
--accent-blue: #4169E1;
--accent-pink: #FF69B4;
--accent-green: #00FF88;
--bg-dark: #0A0E1A;
--bg-card: #1A1F2E;
--text-gray: #A0A0A0;
```

### Fonts
- Headings: **Space Grotesk** (700 weight)
- Body: **Inter** (300, 400, 600, 700, 900)

### Sections
1. **Hero** - Main headline with CTA
2. **Stats** - Quick numbers (1000 plots, 144 AI, etc.)
3. **Map** - Interactive Google Maps with property markers
4. **Showcase** - Sky Mansion feature highlight
5. **Pricing** - 4-tier pricing cards
6. **Features** - 6 key features in grid
7. **Footer** - Links and credits

---

## 🚀 Features Included

### Interactive Google Map
- ✅ Real GPS coordinates for all properties
- ✅ Color-coded property markers (pink = claimed, green = available)
- ✅ Click markers to see property details
- ✅ Info windows with claim buttons
- ✅ Satellite view with custom styling
- ✅ Overlay showing district information

### 3D Preview System
- ✅ Three.js integration
- ✅ OrbitControls for camera movement
- ✅ Placeholder mansion geometry (replace with GLTF)
- ✅ Lighting and materials
- ✅ Responsive canvas sizing

### Responsive Design
- ✅ Mobile-friendly (breakpoints at 968px)
- ✅ Touch-friendly buttons
- ✅ Smooth animations
- ✅ Loading screen

### SEO Optimized
- ✅ Semantic HTML5
- ✅ Meta tags (add these):
  ```html
  <meta name="description" content="Claim your spot in the PixelProdigy AI metaverse. Real GPS coordinates, infinite customization. First 100 plots FREE.">
  <meta property="og:title" content="MyPlace YourPlace - PixelProdigy AI">
  <meta property="og:image" content="https://eugeneousxr.github.io/myplaceyourplace/assets/og-image.jpg">
  ```

---

## 🔧 Local Development

### Test Locally
```bash
# Simple Python server
cd /home/jeremy/PixelProdigyAI/landing_page
python3 -m http.server 8000

# Open browser to:
# http://localhost:8000
```

### Live Reload (Optional)
```bash
# Install live-server
npm install -g live-server

# Run
cd /home/jeremy/PixelProdigyAI/landing_page
live-server
```

---

## 📊 Analytics Setup (Optional)

### Google Analytics
Add before closing `</head>`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🐛 Troubleshooting

### Map Not Loading
- Check API key is correct
- Verify referrer restrictions
- Check browser console for errors
- Ensure billing is enabled on Google Cloud

### 3D Preview Not Working
- Check Three.js import URLs
- Verify browser supports WebGL
- Check console for CORS errors

### Markers Not Appearing
- Verify `initMap()` is called
- Check marker coordinates are valid
- Ensure map zoom level is appropriate

---

## 🎯 Next Steps

1. **Get Google Maps API key** and update `index.html`
2. **Test locally** with Python server
3. **Push to GitHub** and enable Pages
4. **Add real images** to assets folder
5. **Create GLTF model** of Sky Mansion
6. **Integrate payment** processing (Stripe/PayPal)
7. **Add user authentication** (Firebase/Auth0)
8. **Build backend** for property database

---

## 📞 Support

- **GitHub**: [@eugeneousxr](https://github.com/eugeneousxr)
- **Website**: [eugeneousxr.github.io](https://eugeneousxr.github.io)
- **Email**: (Add your email here)

---

## 📄 License

© 2025 PixelProdigy AI. All rights reserved.

---

*Built with ❤️ using 144 AI Personalities*
