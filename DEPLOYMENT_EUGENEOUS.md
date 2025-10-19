# 🚀 EugeNEOus Deployment Guide

**Your Domains:**
- eugeneous.dev (Primary - for developers/tech audience)
- eugeneous.com (Secondary - for general audience)

**Last Updated:** October 19, 2025

---

## 🎯 STEP 1: Buy Your Domains

### **Option 1: Google Domains (Recommended)**

1. Go to https://domains.google.com
2. Search for "eugeneous.dev" → Should be **$12/year**
3. Search for "eugeneous.com" → Should be **$12/year**
4. **Total: $24/year** (same price as 1 month of Spotify!)

**Why Google Domains:**
- ✅ No hidden fees
- ✅ Free privacy protection (WHOIS hidden)
- ✅ Free email forwarding (admin@eugeneous.dev → your-email@gmail.com)
- ✅ Easy DNS management
- ✅ Auto-renew option

### **Option 2: Cloudflare Registrar (Cheapest)**

1. Go to https://www.cloudflare.com/products/registrar/
2. Transfer or register domain at **cost price** (no markup!)
3. eugeneous.dev: ~$10/year
4. eugeneous.com: ~$9/year
5. **Total: $19/year**

**Why Cloudflare:**
- ✅ Cheapest price (at-cost, no profit)
- ✅ Free CDN included
- ✅ Free DDoS protection
- ✅ Best DNS performance

**My Recommendation:** Start with Google Domains (easier), transfer to Cloudflare later when scaling.

---

## 🎯 STEP 2: Configure DNS

### **A. Point to GitHub Pages**

**In Google Domains (or Cloudflare) DNS settings:**

```
Type: A
Name: @
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @
Value: 185.199.111.153
TTL: 3600

Type: CNAME
Name: www
Value: yourusername.github.io
TTL: 3600
```

**For PixelProdigy subdomain:**
```
Type: CNAME
Name: pixelprodigy
Value: yourusername.github.io
TTL: 3600
```

---

### **B. Point API subdomain (for later)**

```
Type: CNAME
Name: api
Value: your-app.up.railway.app (Railway)
OR
Value: your-app.onrender.com (Render)
TTL: 3600
```

---

## 🎯 STEP 3: Configure GitHub Repository

### **A. Update GitHub Pages Settings**

1. Go to your repo: https://github.com/yourusername/PixelProdigyAI
2. Click **Settings** → **Pages**
3. Under "Custom domain", enter: **eugeneous.dev**
4. Check "Enforce HTTPS" (wait 24 hours for cert)
5. Click **Save**

### **B. Create CNAME file in repo**

```bash
cd /home/jeremy/PixelProdigyAI
echo "eugeneous.dev" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

### **C. Update index.html**

Rename your premium landing page:

```bash
mv index_premium.html index.html
git add index.html
git commit -m "Set premium landing as homepage"
git push
```

---

## 🎯 STEP 4: Project Structure

### **Your Site URLs:**

```
https://eugeneous.dev/
├── index.html ...................... Landing page (premium golden design)
├── pricing.html .................... Pricing tiers
├── pixelprodigy3d.html ............. Main PixelProdigy app
├── about.html ...................... About EugeNEOus
├── portfolio.html .................. Your projects showcase
└── blog/ ........................... Future blog posts
```

### **Create Simple Homepage:**

```bash
# Backup current index if exists
mv index.html index_backup.html 2>/dev/null

# Copy premium landing as main page
cp index_premium.html index.html
```

---

## 🎯 STEP 5: Update All Links

### **Update index.html navigation:**

```html
<nav>
  <a href="/">Home</a>
  <a href="/pixelprodigy3d.html">PixelProdigy 3D</a>
  <a href="/pricing.html">Pricing</a>
  <a href="/portfolio.html">Portfolio</a>
  <a href="/about.html">About</a>
</nav>
```

---

## 🎯 STEP 6: Email Forwarding (Optional)

### **Free Email Addresses:**

**In Google Domains:**
1. Go to Email → Email forwarding
2. Create aliases:
   - admin@eugeneous.dev → your-personal@gmail.com
   - contact@eugeneous.dev → your-personal@gmail.com
   - support@eugeneous.dev → your-personal@gmail.com
   - security@eugeneous.dev → your-personal@gmail.com

**Benefits:**
- ✅ Professional email addresses (FREE!)
- ✅ All emails go to your Gmail
- ✅ No need for separate email hosting

---

## 🎯 STEP 7: SSL Certificate

**GitHub Pages handles this automatically!**

After setting custom domain:
1. Wait 24-48 hours
2. GitHub will provision SSL cert from Let's Encrypt
3. HTTPS will be enforced automatically
4. You'll see 🔒 in browser

**Check status:**
```bash
curl -I https://eugeneous.dev
# Should show: HTTP/2 200
```

---

## 🎯 STEP 8: Redirect .com to .dev

### **Option A: In DNS (Cloudflare)**

If using Cloudflare:
1. Enable "Always Use HTTPS" rule
2. Create Page Rule:
   - URL: `eugeneous.com/*`
   - Setting: Forwarding URL (301 redirect)
   - Destination: `https://eugeneous.dev/$1`

### **Option B: With HTML (GitHub Pages)**

Create `eugeneous.com` repo with single `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=https://eugeneous.dev">
  <script>window.location.href = "https://eugeneous.dev";</script>
</head>
<body>
  Redirecting to <a href="https://eugeneous.dev">eugeneous.dev</a>...
</body>
</html>
```

---

## 🎯 STEP 9: Test Everything

### **Checklist:**

```bash
# 1. Test main domain
curl -I https://eugeneous.dev
# Should return: 200 OK

# 2. Test www redirect
curl -I https://www.eugeneous.dev
# Should redirect to https://eugeneous.dev

# 3. Test PixelProdigy page
curl -I https://eugeneous.dev/pixelprodigy3d.html
# Should return: 200 OK

# 4. Test HTTPS enforcement
curl -I http://eugeneous.dev
# Should redirect to https://

# 5. Check DNS propagation
nslookup eugeneous.dev
# Should show GitHub IPs: 185.199.108.153, etc.
```

---

## 🎯 STEP 10: Analytics & Monitoring

### **A. Google Analytics (FREE)**

Add to every page `<head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### **B. Uptime Monitoring (FREE)**

Sign up for UptimeRobot: https://uptimerobot.com
- Monitor: https://eugeneous.dev
- Check every 5 minutes
- Alert via email/SMS if down

---

## 📊 FINAL STRUCTURE

### **Phase 1 (Now): Static Site**

```
eugeneous.dev (GitHub Pages)
├── index.html ............. Landing page
├── pixelprodigy3d.html .... Main app
├── pricing.html ........... Pricing tiers
├── about.html ............. About page
└── assets/
    ├── css/
    ├── js/
    └── images/
```

**Hosting:** FREE (GitHub Pages)  
**SSL:** FREE (Let's Encrypt)  
**CDN:** FREE (GitHub CDN)  
**Total Cost:** $24/year (domain only)

---

### **Phase 2 (Week 5): Add Backend**

```
Frontend: eugeneous.dev (GitHub Pages)
Backend: api.eugeneous.dev (Railway/Render)
Storage: Cloudflare R2
Database: MongoDB Atlas
```

**Monthly Cost:** ~$20-50

---

### **Phase 3 (Month 3): Scale**

```
Frontend: eugeneous.dev (Cloudflare Pages)
API: api.eugeneous.dev (Railway Pro)
Storage: R2
Database: MongoDB Atlas M30
CDN: Cloudflare Pro
```

**Monthly Cost:** ~$200

---

## 🚨 TROUBLESHOOTING

### **Problem: Domain not resolving**

**Solution:**
1. DNS takes 24-48 hours to propagate
2. Clear browser cache: Ctrl+Shift+Delete
3. Check DNS: `nslookup eugeneous.dev`
4. Flush local DNS: `sudo systemctl restart systemd-resolved`

### **Problem: SSL not working**

**Solution:**
1. Wait 24 hours after adding custom domain
2. Remove and re-add custom domain in GitHub settings
3. Check "Enforce HTTPS" is enabled

### **Problem: 404 on GitHub Pages**

**Solution:**
1. Ensure `index.html` exists in repo root
2. Check GitHub Pages is enabled in Settings
3. Verify branch is set to `main` (not `master`)

---

## ✅ DEPLOYMENT CHECKLIST

```
Phase 1: FREE Static Site
□ Buy eugeneous.dev ($12/year)
□ Buy eugeneous.com ($12/year)
□ Configure DNS A records
□ Add CNAME file to repo
□ Set custom domain in GitHub Pages
□ Wait for SSL certificate (24hr)
□ Test HTTPS works
□ Set up email forwarding
□ Add Google Analytics
□ Set up uptime monitoring

Phase 2: Backend API ($20/month)
□ Create Railway/Render account
□ Deploy Node.js API
□ Configure api.eugeneous.dev subdomain
□ Set up Cloudflare R2 storage
□ Connect MongoDB Atlas
□ Test API endpoints
□ Enable CORS for eugeneous.dev

Phase 3: Payments ($50/month)
□ Create Stripe account
□ Add payment endpoints
□ Test subscription flow
□ Set up webhook handlers
□ Enable production mode
```

---

## 🎉 READY TO DEPLOY!

### **Quick Start Commands:**

```bash
cd /home/jeremy/PixelProdigyAI

# 1. Set up custom domain
echo "eugeneous.dev" > CNAME

# 2. Use premium landing as homepage
cp index_premium.html index.html

# 3. Commit and push
git add .
git commit -m "Deploy to eugeneous.dev"
git push origin main

# 4. Go to GitHub repo settings
# 5. Pages → Custom domain → eugeneous.dev
# 6. Wait 24 hours for SSL
# 7. Done! 🎉
```

---

**Your site will be live at:**
- 🌐 https://eugeneous.dev
- 🎨 https://eugeneous.dev/pixelprodigy3d.html
- 💰 https://eugeneous.dev/pricing.html

**Professional. Modern. FREE hosting. Let's launch! 🚀**
