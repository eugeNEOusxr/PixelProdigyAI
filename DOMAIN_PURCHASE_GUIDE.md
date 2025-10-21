# 🌐 Domain Purchase Guide - pixel-prodigy.com

## ✅ What to Buy TODAY

**Domain:** `pixel-prodigy.com`  
**Price:** $11.99/year (45% off from $21.99)  
**Registrar:** GoDaddy  
**Auto-renews:** Yes, at $21.99/yr (you can cancel anytime)

---

## ❌ What to SKIP (Save $40+/year)

### 1. Full Domain Protection - $11.99/yr
**Skip it.** GoDaddy already includes:
- Basic DNS security
- Free WHOIS privacy (hides your personal info)
- Account 2FA (enable this yourself for free)

**What they're selling:** Extra verification steps for domain transfers. You don't need this unless you're a huge company worried about domain hijacking.

### 2. Microsoft 365 Email - $0.99/mo intro (then $7.99/mo = $95.88/yr)
**Skip it.** Use free alternatives:
- **Cloudflare Email Routing** (100% free forever, unlimited forwards)
- **Zoho Mail** (free for 5 mailboxes)
- **Gmail forwarding** (free, but requires some DNS setup)

**Why skip:** You don't need Microsoft 365 features (Word, Excel, OneDrive). You just need email.

### 3. Smart Terminal - Up to $499 MSRP
**Skip it.** This is a physical credit card reader for retail stores. You're running a web app, not a physical shop!

### 4. Other TLDs (.info, .art, .net, .ai)
**Skip them all:**
- `.info` - $37.99 → $2.99 (still waste of money, nobody types .info)
- `.art` - $39.99 → $2.99 (niche TLD, low traffic)
- `.net` - $24.99 → $11.99 (outdated, people expect .com)
- `.ai` - $289.98 → $194.98 (**INSANELY OVERPRICED** for a TLD!)

**Why skip:** Users will type `.com` by default. Buying other TLDs just wastes money unless you're a massive brand.

---

## 💰 Total Cost Comparison

### What GoDaddy Wants You to Buy:
```
pixel-prodigy.com         $11.99
Full Domain Protection    $11.99
Microsoft 365 Email       $95.88/yr (after intro)
Smart Terminal            $499.00
myplacetoken.com          $11.99
pixelprodigyai.org        $9.99
.info domain              $2.99
.art domain               $2.99
.net domain               $11.99
.ai domain                $194.98
────────────────────────────────
TOTAL:                    $853.79 first year
```

### What You Should Actually Buy:
```
pixel-prodigy.com         $11.99
────────────────────────────────
TOTAL:                    $11.99 first year

Savings: $841.80 (98% cheaper!)
```

---

## 📝 Step-by-Step Purchase Instructions

### 1. Complete GoDaddy Checkout
- ✅ Check ONLY: `pixel-prodigy.com` for $11.99
- ❌ Uncheck: Full Domain Protection ($11.99/yr)
- ❌ Remove: Microsoft 365 Email ($0.99/mo)
- ❌ Remove: Smart Terminal
- ❌ Remove: myplacetoken.com
- ❌ Remove: pixelprodigyai.org
- ❌ Remove: All extra TLDs (.info, .art, .net, .ai)

**Final cart should show: $11.99**

### 2. Enable Free WHOIS Privacy
After purchase:
- Go to GoDaddy dashboard → My Products → Domains
- Click `pixel-prodigy.com` → Settings
- Toggle "Domain Privacy Protection" ON (usually free)
- This hides your name/address from public WHOIS lookups

### 3. Set Up Free Email (Cloudflare)
**Best option - 100% free forever:**

1. **Add domain to Cloudflare:**
   - Go to cloudflare.com → Add Site
   - Enter `pixel-prodigy.com`
   - Choose Free plan ($0)

2. **Update nameservers at GoDaddy:**
   - Cloudflare will give you 2 nameservers (e.g., `brad.ns.cloudflare.com`)
   - Copy these to GoDaddy → Domain Settings → Nameservers → Custom
   - Wait 5-10 minutes for DNS propagation

3. **Enable Email Routing:**
   - Cloudflare dashboard → Email → Email Routing
   - Add route: `hello@pixel-prodigy.com` → your Gmail
   - Verify your Gmail when prompted
   - Done! You now have custom email for $0

### 4. Point Domain to GitHub Pages
**In Cloudflare DNS settings, add:**

```
Type    Name    Content                   Proxy
────────────────────────────────────────────────────
A       @       185.199.108.153           Proxied ✅
A       @       185.199.109.153           Proxied ✅
A       @       185.199.110.153           Proxied ✅
A       @       185.199.111.153           Proxied ✅
CNAME   www     eugenousxr.github.io      Proxied ✅
```

**These are GitHub Pages' official IPs** (see [docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))

### 5. Enable HTTPS on GitHub
1. Go to your repo: `github.com/eugeNEOusxr/PixelProdigyAI`
2. Settings → Pages → Custom domain
3. Enter: `pixel-prodigy.com`
4. Click Save
5. Wait 5 minutes, then check ☑️ "Enforce HTTPS"

### 6. Add CNAME File to Repo
Create file at repo root:
```bash
echo "pixel-prodigy.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

**Wait 10-15 minutes for DNS propagation, then test:**
- http://pixel-prodigy.com (should redirect to https)
- https://pixel-prodigy.com (should show your site)
- https://www.pixel-prodigy.com (should work too)

---

## 🎯 When to Buy Other Domains

### myplacetoken.com ($11.99/yr)
**Buy when:** You're ready to launch the MyPlace Token (3-6 months from now)
**Why wait:** Save $12/yr, domain will still be available (low demand)
**Before launch:** Check availability again, register 1 week before announcement

### pixelprodigyai.org ($9.99/yr)
**Buy when:** You file 501(c)(3) nonprofit paperwork (PixelProdigy Foundation)
**Why wait:** .org domains are for organizations. Makes more sense after nonprofit approval
**Before filing:** Register to match foundation name exactly

### pixel-prodigy.ai ($194.98/yr - EXPENSIVE!)
**Buy when:** You have $10K/month revenue and want premium AI branding
**Why wait:** .ai domains are CRAZY expensive ($195/yr ongoing, not a promo)
**Alternative:** Just use `pixelprodigy.com/ai` as a subdirectory (free!)

---

## ✅ Summary Checklist

- [ ] Buy `pixel-prodigy.com` for $11.99 (ONLY THIS)
- [ ] Skip all GoDaddy upsells (save $841)
- [ ] Enable free WHOIS privacy at GoDaddy
- [ ] Transfer DNS to Cloudflare (free plan)
- [ ] Set up Cloudflare Email Routing (free)
- [ ] Point domain to GitHub Pages (A records + CNAME)
- [ ] Enable HTTPS in GitHub repo settings
- [ ] Add CNAME file to repo
- [ ] Test: https://pixel-prodigy.com loads correctly
- [ ] Reserve @pixelprodigy on Twitter, Instagram, YouTube
- [ ] Wait 3-6 months before buying other domains

---

## 🚨 Common Mistakes to Avoid

1. **Don't buy .ai domains yet** - They're $195/year ongoing, not a promo. Total rip-off.
2. **Don't pay for email** - Cloudflare Email Routing is FREE and unlimited.
3. **Don't buy "domain protection"** - Free WHOIS privacy + 2FA is enough.
4. **Don't buy every TLD** - Focus on .com first, add others when you have revenue.
5. **Don't use GoDaddy for hosting** - GitHub Pages is free and faster.
6. **Don't skip Cloudflare** - It's free and gives you SSL, email, DDoS protection, and analytics.

---

## 💡 Pro Tips

### Use Cloudflare for Everything (Free)
- ✅ Free SSL certificate (auto-renews)
- ✅ Free email forwarding (unlimited)
- ✅ Free DDoS protection
- ✅ Free CDN (faster page loads worldwide)
- ✅ Free analytics (better than Google Analytics)
- ✅ Free DNS management

### Set Auto-Renewal Reminder
- GoDaddy will auto-renew at $21.99/yr (normal price)
- Set calendar reminder 1 month before renewal
- Option to transfer to Cloudflare Registrar (same price, no markup)

### Reserve Social Handles NOW
- @pixelprodigy might get taken if you wait
- Free to reserve on all platforms
- Use Namechk.com to check availability across 50+ sites at once

---

**Bottom Line: Spend $11.99 today on `pixel-prodigy.com`, skip everything else, set up free email via Cloudflare. You'll have a professional domain + custom email for $12/year total.**

---

*Last Updated: October 19, 2025*  
*Need help? Read: BUSINESS_OVERVIEW.md*
