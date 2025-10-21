# 🚀 Quick Start Guide: Image-to-3D Pipeline

## Total Time: 1 Week | Total Cost: $50-$1000

---

## 📋 Prerequisites

### Required Accounts
1. **SerpApi** (for image scraping)
   - Sign up: https://serpapi.com/
   - Free tier: 100 searches/month
   - Paid: $50/month = 5,000 searches
   - Alternative: Google Custom Search API (100 free/day)

2. **Meshy AI** (for 3D conversion - RECOMMENDED)
   - Sign up: https://meshy.ai/
   - Pricing: $0.20 per 3D model
   - $50 credit = 250 models
   - $200 credit = 1,000 models

3. **Luma AI** (alternative, cheaper)
   - Sign up: https://lumalabs.ai/
   - FREE for self-hosted (requires GPU server)
   - $20/month hosted plan

### System Requirements
- Python 3.8+
- Node.js 14+
- 10GB free disk space (for images + models)
- Internet connection

---

## 🎯 Step-by-Step Instructions

### Phase 1: Install Dependencies (5 minutes)

```bash
cd /home/jeremy/PixelProdigyAI/object_generator

# Install Python packages
pip3 install requests serpapi

# Verify installation
python3 -c "import requests; import serpapi; print('✅ Ready!')"
```

### Phase 2: Configure API Keys (2 minutes)

1. Get your SerpApi key from https://serpapi.com/manage-api-key
2. Get your Meshy AI key from https://meshy.ai/api

```bash
# Option A: Set environment variables (recommended)
export SERPAPI_KEY="your_serpapi_key_here"
export MESHY_API_KEY="your_meshy_key_here"

# Option B: Edit scripts directly
nano image_scraper.py  # Add API_KEY = "your_key" at top
nano image_to_3d_converter.py  # Add API_KEY = "your_key" at top
```

### Phase 3: Scrape Images (1-2 hours)

**Test Mode (FREE - 100 images)**
```bash
# This uses the free SerpApi tier
python3 image_scraper.py
```

This will:
- Search Google Images for 10 queries per category
- Download ~20 images per query
- Save to `scraped_images/` folder
- Create `metadata.json` with image info
- Total: ~200 images (10 categories × 20 images)

**Production Mode ($50 - 2,000 images)**
```bash
# Edit image_scraper.py and uncomment full query lists
# Then run:
python3 image_scraper.py
```

### Phase 4: Convert to 3D Models (30 minutes - 2 days)

**Test Mode ($10 - 50 models)**
```bash
python3 image_to_3d_converter.py
# Choose option 1: Test mode (5 images per category)
```

This will:
- Convert 50 images to 3D models (5 per category)
- Cost: 50 × $0.20 = $10
- Time: ~4 minutes per model = 3-4 hours total
- Output: `generated_objects/models/[category]/[object].glb`

**Small Batch ($100 - 500 models)**
```bash
python3 image_to_3d_converter.py
# Choose option 2: Small batch (50 per category)
```
- Cost: 500 × $0.20 = $100
- Time: ~33 hours (can run overnight)

**Full Production ($1000+ - 5,000 models)**
```bash
python3 image_to_3d_converter.py
# Choose option 3: Full conversion
```
- Cost: Depends on images scraped
- Time: 2-3 days (run on server)
- Recommendation: Do this in batches

### Phase 5: Update Object Metadata (10 minutes)

```bash
# Update existing object JSON files to point to real models
node update_object_metadata.js
```

This will:
- Read all object JSON files in `generated_objects/`
- Check if corresponding GLB model exists in `models/`
- Update `visual.model.hasRealModel = true`
- Update `visual.model.path` to point to GLB file

### Phase 6: Test in Browser (5 minutes)

```bash
# Start server (if not already running)
cd /home/jeremy/PixelProdigyAI
python3 -m http.server 8001
```

Open browser to: http://localhost:8001/object_browser/

You should now see:
- ✅ Objects with real 3D models load GLB files
- ✅ Objects without real models use procedural generation
- ✅ Smooth 60fps rotation
- ✅ Better visual quality for real models

---

## 💰 Cost Breakdown

### Scenario A: Minimal Test ($10)
- 50 models converted
- Covers 1-2 objects per category
- Perfect for testing the pipeline
- **Total: $10**

### Scenario B: Key Objects Only ($100)
- 500 models converted
- Focus on:
  - All "Legendary" objects (4.5% = ~2,100 objects)
  - All "Epic" objects (13.4% = ~6,300 objects)
  - Selected "Rare" objects
- Fallback to procedural for "Common"
- **Total: $100**

### Scenario C: Premium Objects ($500)
- 2,500 models converted
- All rare/epic/legendary objects
- Best-selling furniture items
- Procedural for common items
- **Total: $500**

### Scenario D: Everything ($2,000-$4,000)
- All 10,000-20,000 unique base models
- Use variations (colors/sizes) from same base
- Professional-quality marketplace
- **Total: $2,000-$4,000**

**RECOMMENDED: Start with Scenario B ($100)**

---

## 🎯 Smart Strategy: Hybrid Approach

### The 80/20 Rule

Convert 20% of objects (the best ones) → 80% of visual impact

**Priority List:**
1. **Legendary & Epic** (18% of objects) → Always use real models
2. **Rare Furniture** (seating, tables, sofas) → Use real models
3. **Featured Items** (Sky Mansion specific) → Use real models
4. **Common Items** (basic objects) → Procedural generation

### Cost Optimization

Instead of converting all 47,000 objects:
1. Identify 5,000 unique base objects
2. Convert to 3D: 5,000 × $0.20 = **$1,000**
3. Create 9-10 variants (colors/sizes) from each base
4. Result: 50,000 objects for $1,000 instead of $9,400

**Savings: $8,400 (90%)**

---

## 🔧 Troubleshooting

### Issue: "No API key provided"
**Solution:** Set environment variables or edit scripts directly

### Issue: "Rate limit exceeded"
**Solution:** Add `time.sleep(5)` between requests

### Issue: "Model conversion failed"
**Solution:** 
- Check image quality (needs clear product photo)
- Try different image from same query
- Meshy AI works best with white/plain backgrounds

### Issue: "GLB model won't load in browser"
**Solution:**
- Check file path is correct
- Verify CORS headers (serve from same domain)
- Check browser console for errors

### Issue: "Conversion taking too long"
**Solution:**
- Run in batches (100 at a time)
- Use cloud server with better internet
- Consider Luma AI (faster, 1-2 min per model)

---

## 📊 Expected Results

### After Phase 4 (Test Mode - $10)

You will have:
- ✅ 50 high-quality 3D models (5 per category)
- ✅ Proof of concept working
- ✅ Visual comparison: Real vs Procedural
- ✅ Performance benchmarks

### After Full Pipeline ($100-$500)

You will have:
- ✅ 500-2,500 photo-realistic 3D models
- ✅ Premium object marketplace
- ✅ Competitive advantage (real products vs generic placeholders)
- ✅ Higher user engagement
- ✅ Ability to charge premium prices (real models worth more MPT)

---

## 🚀 Next Steps After Setup

1. **Deploy to production** (GitHub Pages)
2. **Add model quality badges**
   - "Photo-Realistic 3D" badge for real models
   - "Procedural" badge for generated models
3. **Dynamic pricing**
   - Real models cost 2-3× more MPT
   - Legendary real models are truly premium
4. **User uploads**
   - Let users upload photos of their furniture
   - Convert to 3D automatically
   - Reward with 1,000 MPT per accepted model
5. **Expand catalog**
   - Scrape more sources (IKEA, Wayfair, Amazon)
   - Add new categories
   - Scale to 100,000 objects

---

## 📞 Support

**Documentation:**
- Meshy AI: https://docs.meshy.ai
- Three.js: https://threejs.org/docs
- GLTFLoader: https://threejs.org/docs/#examples/en/loaders/GLTFLoader

**Community:**
- Three.js Discord: https://discord.gg/threejs
- Meshy AI Discord: https://discord.gg/meshy

**Questions?**
Check `IMAGE_TO_3D_PIPELINE.md` for detailed technical info

---

## ✅ Success Checklist

- [ ] Python dependencies installed
- [ ] API keys configured (SerpApi + Meshy AI)
- [ ] Images scraped (test: 200 images)
- [ ] Models converted (test: 50 models)
- [ ] Object metadata updated
- [ ] Browser showing real 3D models
- [ ] Performance acceptable (60fps with 24 models)
- [ ] Ready to scale up

**Current Status:** Scripts created, ready to run!

**Next Action:** Get API keys and run `python3 image_scraper.py`

---

**🎉 You're now ready to build a photo-realistic 3D object marketplace!**
