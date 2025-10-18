# Google Maps API Setup Guide

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com

### 2. Create a New Project
- Click "Select a project" dropdown (top left)
- Click "NEW PROJECT"
- Project name: `PixelProdigy-AI`
- Click "CREATE"

### 3. Enable Required APIs
- In the search bar, type: "Maps JavaScript API"
- Click on "Maps JavaScript API"
- Click "ENABLE"
- Repeat for these APIs:
  - Elevation API
  - Geocoding API
  - Places API

### 4. Create API Key
- Go to "Credentials" in left sidebar
- Click "+ CREATE CREDENTIALS"
- Select "API key"
- Copy the key that appears (looks like: AIzaSyD...)

### 5. Restrict Your API Key (IMPORTANT for security)
- Click "RESTRICT KEY" 
- Application restrictions:
  - Select "HTTP referrers (web sites)"
  - Add referrer: `http://localhost:*` (for local testing)
  - Add referrer: `https://eugeneousxr.github.io/*` (for production)
- API restrictions:
  - Select "Restrict key"
  - Check only the 4 APIs you enabled
- Click "SAVE"

### 6. Enable Billing (Required but Free)
- Go to "Billing" in left sidebar
- Set up billing account (requires credit card)
- **Don't worry**: Google gives $200/month FREE credit
- You won't be charged unless you exceed:
  - 28,000 map loads/month
  - 40,000 elevation requests/month
- Your site won't hit these limits

### 7. Copy Your API Key
Your key will look like:
```
AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Save it somewhere safe!

---

## Estimated Monthly Usage for PixelProdigy AI

### If you get 1,000 visitors/month:
- Map loads: 1,000 (way under 28,000 free limit)
- Elevation requests: ~100 (way under 40,000 free limit)
- **Cost: $0**

### If you get 10,000 visitors/month:
- Map loads: 10,000 (still under free limit)
- Elevation requests: ~1,000 (still under free limit)
- **Cost: $0**

### If you get 100,000 visitors/month:
- Map loads: 100,000 (72,000 paid loads × $7/1000 = ~$500)
- But at that scale, you'll have revenue from plot sales!

---

## What to Do With Your API Key

Once you have it, I'll update your `index.html` file with the real key.
Just paste it in chat and I'll insert it for you!

---

## Troubleshooting

**"This page can't load Google Maps correctly"**
- API key not activated yet (wait 5 minutes)
- Billing not enabled
- APIs not enabled
- Referrer restrictions too strict

**"API key not valid"**
- Copied wrong key
- Key restrictions block your domain
- Check API restrictions match your needs

---

**Ready to get your API key now? It takes 5 minutes!**
