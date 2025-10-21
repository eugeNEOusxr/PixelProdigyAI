# 🌐 DNS Setup Guide - pixel-prodigy.com → GitHub Pages

**Status:** CNAME file updated ✅  
**Domain:** pixel-prodigy.com (purchased from GoDaddy)  
**Target:** GitHub Pages (eugeNEOusxr.github.io/PixelProdigyAI)

---

## 🚀 Quick Start (Choose One Method)

### Option A: Transfer to Cloudflare (RECOMMENDED - Free Features)
- ✅ Free SSL/HTTPS
- ✅ Free email forwarding
- ✅ Free DDoS protection
- ✅ Free CDN (faster worldwide)
- ✅ Better DNS management

### Option B: Keep at GoDaddy (Simpler, But Limited)
- ✅ Faster setup (5 minutes)
- ❌ No free email forwarding
- ❌ No CDN
- ❌ Less control

**I recommend Option A (Cloudflare).** Here's how to do both:

---

## 📋 Option A: Transfer DNS to Cloudflare (BEST)

### Step 1: Add Site to Cloudflare (FREE)

1. **Go to:** https://dash.cloudflare.com/sign-up
2. **Create account** (free, no credit card needed)
3. **Click:** "Add a Site"
4. **Enter:** `pixel-prodigy.com`
5. **Select:** Free plan ($0/month)
6. **Click:** Continue

### Step 2: Cloudflare Scans Your DNS

Cloudflare will automatically detect any existing DNS records from GoDaddy. Review them and click Continue.

### Step 3: Update Nameservers at GoDaddy

Cloudflare will show you 2 nameservers like:
```
brad.ns.cloudflare.com
kate.ns.cloudflare.com
```

**Now go to GoDaddy:**

1. **Login:** https://dcc.godaddy.com/domains
2. **Click:** pixel-prodigy.com → Manage
3. **Scroll to:** Nameservers section
4. **Click:** Change
5. **Select:** "Use my own nameservers (custom)"
6. **Paste:** The 2 Cloudflare nameservers
7. **Click:** Save

**Wait 5-30 minutes for propagation.** Cloudflare will email you when it's active.

### Step 4: Configure DNS Records in Cloudflare

Once nameservers are updated, go to Cloudflare → DNS → Records:

**Delete any existing A/CNAME records for @ and www, then add these:**

| Type  | Name | Content                | Proxy Status | TTL  |
|-------|------|------------------------|--------------|------|
| A     | @    | 185.199.108.153        | Proxied ✅   | Auto |
| A     | @    | 185.199.109.153        | Proxied ✅   | Auto |
| A     | @    | 185.199.110.153        | Proxied ✅   | Auto |
| A     | @    | 185.199.111.153        | Proxied ✅   | Auto |
| CNAME | www  | eugenousxr.github.io   | Proxied ✅   | Auto |

**Important:** Make sure "Proxy status" is ORANGE (Proxied) for all records. This enables Cloudflare's CDN and free SSL.

### Step 5: Enable Free Email Forwarding

**In Cloudflare dashboard:**

1. **Go to:** Email → Email Routing
2. **Click:** Get Started
3. **Add destination:** Enter your personal Gmail
4. **Verify:** Check your Gmail for verification email
5. **Add route:** 
   - Source: `hello@pixel-prodigy.com`
   - Destination: Your Gmail
6. **Add more routes** (optional):
   - `contact@pixel-prodigy.com` → Your Gmail
   - `support@pixel-prodigy.com` → Your Gmail
   - `jeremy@pixel-prodigy.com` → Your Gmail

**Done! You now have unlimited free email forwarding.**

### Step 6: Configure GitHub Pages

1. **Go to:** https://github.com/eugeNEOusxr/PixelProdigyAI/settings/pages
2. **Under "Custom domain":** Enter `pixel-prodigy.com`
3. **Click:** Save
4. **Wait 1-2 minutes**
5. **Check the box:** ☑️ Enforce HTTPS

**If you see "DNS check unsuccessful":** Wait 5-10 minutes for DNS propagation, then refresh.

### Step 7: Commit CNAME File

I already updated the CNAME file in your repo. Just commit and push:

```bash
cd /home/jeremy/PixelProdigyAI
git add CNAME
git commit -m "Update domain to pixel-prodigy.com"
git push origin main
```

### Step 8: Test Your Domain

**Wait 10-15 minutes after DNS changes, then test:**

```bash
# Check DNS propagation
dig pixel-prodigy.com +short
# Should show: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153

# Check www subdomain
dig www.pixel-prodigy.com +short
# Should show: eugenousxr.github.io

# Test in browser
curl -I https://pixel-prodigy.com
# Should show: HTTP/2 200
```

**Visit in browser:**
- https://pixel-prodigy.com ✅
- https://www.pixel-prodigy.com ✅
- http://pixel-prodigy.com (should redirect to https) ✅

---

## 📋 Option B: Keep DNS at GoDaddy (Quick Setup)

### Step 1: Add DNS Records at GoDaddy

1. **Login:** https://dcc.godaddy.com/domains
2. **Click:** pixel-prodigy.com → Manage
3. **Click:** DNS → Manage Zones
4. **Add Records:**

**Delete any existing A records for @, then add these 4 A records:**

| Type | Name | Value            | TTL        |
|------|------|------------------|------------|
| A    | @    | 185.199.108.153  | 600 (10m)  |
| A    | @    | 185.199.109.153  | 600        |
| A    | @    | 185.199.110.153  | 600        |
| A    | @    | 185.199.111.153  | 600        |

**Update or add CNAME record for www:**

| Type  | Name | Value                 | TTL        |
|-------|------|-----------------------|------------|
| CNAME | www  | eugenousxr.github.io  | 600        |

**Click Save for each record.**

### Step 2: Configure GitHub Pages

1. **Go to:** https://github.com/eugeNEOusxr/PixelProdigyAI/settings/pages
2. **Under "Custom domain":** Enter `pixel-prodigy.com`
3. **Click:** Save
4. **Wait 1-2 minutes**
5. **Check the box:** ☑️ Enforce HTTPS

### Step 3: Commit CNAME File

```bash
cd /home/jeremy/PixelProdigyAI
git add CNAME
git commit -m "Update domain to pixel-prodigy.com"
git push origin main
```

### Step 4: Test

Wait 10-15 minutes, then visit:
- https://pixel-prodigy.com
- https://www.pixel-prodigy.com

**Note:** With GoDaddy DNS, you won't have:
- Free email forwarding (need to pay for Microsoft 365 or use third-party)
- CDN/speed boost (Cloudflare proxies your traffic)
- DDoS protection

---

## 🆘 Troubleshooting

### "DNS check unsuccessful" in GitHub
**Wait 5-10 minutes.** DNS propagation takes time. If still failing after 30 minutes:
- Check that A records are correct (4 GitHub IPs)
- Make sure CNAME file exists in repo root
- Verify domain is not using HTTPS redirect at registrar level

### Email not forwarding
**If using Cloudflare:**
- Check Email Routing → Routes (should show as "Active")
- Verify destination email in Gmail
- Check Gmail spam folder

**If using GoDaddy:**
- GoDaddy doesn't offer free email forwarding
- Use Cloudflare Email Routing (free) or Zoho Mail (free for 5 users)

### Site shows 404
**Check:**
- CNAME file contains `pixel-prodigy.com` (no www, no https://)
- GitHub Pages is enabled in repo settings
- Custom domain is set to `pixel-prodigy.com` in repo settings
- Wait 10-15 minutes after DNS changes

### "Not Secure" warning in browser
**Wait 5 minutes after enabling "Enforce HTTPS" in GitHub settings.** GitHub needs to provision SSL certificate from Let's Encrypt.

If still not working after 1 hour:
- Uncheck "Enforce HTTPS"
- Wait 2 minutes
- Re-check "Enforce HTTPS"
- Wait 5 minutes

---

## ✅ Final Checklist

- [x] Domain purchased (pixel-prodigy.com) ✅
- [ ] DNS configured (choose Option A or B above)
- [ ] GitHub Pages custom domain set
- [ ] HTTPS enabled in GitHub
- [ ] CNAME file committed to repo
- [ ] Site loads at https://pixel-prodigy.com
- [ ] www subdomain works (https://www.pixel-prodigy.com)
- [ ] Email forwarding configured (if using Cloudflare)
- [ ] Social media handles reserved (@pixelprodigy)

---

## 🎯 Next Steps After DNS Works

1. **Update all links in your code:**
   - Change `index.html` Open Graph URLs from `yourusername.github.io` to `pixel-prodigy.com`
   - Update README.md with new domain
   - Update any hardcoded links

2. **Set up Google Analytics:**
   - Free traffic monitoring
   - See how many visitors you get
   - Track which features are used

3. **Submit to Google Search Console:**
   - Help Google index your site faster
   - Monitor search rankings
   - Fix SEO issues

4. **Reserve social handles:**
   - @pixelprodigy on Twitter/X, Instagram, YouTube
   - Link back to pixel-prodigy.com

---

## 📞 Need Help?

**Common commands:**

```bash
# Check if DNS is working
dig pixel-prodigy.com

# Check CNAME file
cat CNAME

# Push changes to GitHub
git add CNAME
git commit -m "Update domain"
git push

# Test HTTPS
curl -I https://pixel-prodigy.com
```

**If stuck, I can help with:**
- DNS troubleshooting
- Email setup
- GitHub Pages configuration
- SSL certificate issues

---

**🎉 Once DNS is live, your PixelProdigy app will be accessible at your own custom domain!**

---

*Last Updated: October 19, 2025*  
*Domain: pixel-prodigy.com*  
*Owner: Jeremy (eugeNEOusxr)*
