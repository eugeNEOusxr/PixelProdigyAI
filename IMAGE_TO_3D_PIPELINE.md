# Image-to-3D Model Pipeline for PixelProdigy AI

## 🎯 The Plan: Scrape Images → AI Convert to 3D → Import to Platform

Instead of manually creating 3D models, we'll:
1. **Scrape images** from Google Images, OfferUp, furniture stores
2. **Convert to 3D** using AI (Stability AI, OpenAI DALL-E 3D, or Meshy AI)
3. **Generate OBJ/GLTF files** automatically
4. **Import into platform** with proper metadata

---

## 🔧 Technologies Required

### Image Scraping
- **Google Custom Search API** (100 free searches/day, then $5/1000)
- **SerpApi** (scrapes Google Images, OfferUp, etc.)
- **Puppeteer** (headless browser for dynamic sites)

### Image-to-3D Conversion Services

#### **Option 1: Meshy AI (RECOMMENDED)**
- Website: meshy.ai
- Cost: $0.20 per 3D model
- Speed: 3-5 minutes per model
- Quality: High (game-ready assets)
- API: Yes (meshy.ai/api)
- Features: Text-to-3D, Image-to-3D, AI texturing

#### **Option 2: Stability AI (Stable Diffusion 3D)**
- Website: stability.ai
- Cost: Pay-as-you-go
- Speed: 2-3 minutes per model
- Quality: Medium-High
- API: Yes
- Features: Image-to-3D, multi-view generation

#### **Option 3: OpenAI DALL-E + DreamFusion**
- Website: openai.com
- Cost: API credits
- Speed: 5-10 minutes per model
- Quality: High
- API: Yes
- Features: Text-to-image → 3D

#### **Option 4: Luma AI (Open Source Alternative)**
- Website: lumalabs.ai
- Cost: FREE (self-hosted) or $20/month
- Speed: 1-2 minutes per model
- Quality: Very High
- API: Yes
- Features: Neural Radiance Fields (NeRF)

---

## 📊 Cost Analysis

### For 47,000 Objects (10 Categories × 4,000 each)

**Option A: Meshy AI**
- Cost per model: $0.20
- Total cost: 47,000 × $0.20 = **$9,400**
- Time: ~3.9 days (5 min each, parallel processing)

**Option B: Luma AI (Self-Hosted)**
- Cost: FREE (just server costs)
- Server: $200/month GPU instance (6 months)
- Total cost: **$1,200**
- Time: ~1.6 days (2 min each, parallel processing)

**Option C: Hybrid Approach (BEST)**
- Use **Luma AI** for common objects (26,600): FREE
- Use **Meshy AI** for rare/epic/legendary (20,400): $4,080
- Total cost: **$4,080**
- Time: ~2 days

---

## 🚀 Implementation Strategy

### Phase 1: Image Collection (Week 1)

#### Search Queries per Category

**Furniture (9,000 objects)**
```
Seating:
- "office chair white background"
- "gaming chair product photo"
- "dining chair wood"
- "accent chair modern"
- "rocking chair isolated"

Tables:
- "coffee table modern"
- "dining table wood"
- "desk minimalist"
- "side table contemporary"

Sofas:
- "sectional sofa gray"
- "loveseat modern"
- "chesterfield sofa"
- "sleeper sofa"
```

**Architecture (6,000 objects)**
```
Doors:
- "front door modern"
- "interior door white"
- "sliding glass door"
- "barn door rustic"

Windows:
- "double hung window"
- "casement window"
- "bay window"
- "picture window"
```

**Electronics (4,000 objects)**
```
- "4K TV flat screen"
- "gaming monitor"
- "laptop silver"
- "desktop computer"
- "soundbar"
- "smart speaker"
```

**Vehicles (4,000 objects)**
```
- "sedan car side view"
- "SUV isolated"
- "sports car red"
- "motorcycle side profile"
- "helicopter aerial"
```

**Nature (4,000 objects)**
```
- "oak tree isolated"
- "palm tree"
- "fern plant pot"
- "succulent plant"
- "river rock"
- "boulder"
```

**Food & Beverage (4,000 objects)**
```
- "pizza whole"
- "burger gourmet"
- "sushi platter"
- "coffee cup"
- "wine glass"
```

**Clothing (4,000 objects)**
```
- "t-shirt white"
- "hoodie black"
- "jeans blue"
- "dress casual"
- "backpack"
```

**Tools (4,000 objects)**
```
- "hammer tool"
- "screwdriver set"
- "drill power tool"
- "saw circular"
```

**Art & Decor (4,000 objects)**
```
- "abstract painting"
- "sculpture modern"
- "wall art canvas"
- "ceramic vase"
```

**Education (4,000 objects)**
```
- "textbook"
- "calculator scientific"
- "notebook"
- "pencil"
- "mortgage document"
- "tax form"
```

#### Scraping Script

```python
# image_scraper.py

import requests
import json
import time
from serpapi import GoogleSearch
from pathlib import Path

class ImageScraper:
    def __init__(self, api_key):
        self.api_key = api_key
        self.output_dir = Path("scraped_images")
        self.output_dir.mkdir(exist_ok=True)
    
    def search_images(self, query, num_images=100):
        """Search Google Images and download"""
        params = {
            "engine": "google_images",
            "q": query,
            "api_key": self.api_key,
            "num": num_images,
            "safe": "active",
            "tbm": "isch"
        }
        
        search = GoogleSearch(params)
        results = search.get_dict()
        
        images = []
        for image in results.get("images_results", []):
            images.append({
                "url": image.get("original"),
                "title": image.get("title"),
                "source": image.get("source")
            })
        
        return images
    
    def download_image(self, url, filename):
        """Download image from URL"""
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                filepath = self.output_dir / filename
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                return str(filepath)
        except Exception as e:
            print(f"Error downloading {url}: {e}")
        return None
    
    def scrape_category(self, category_name, queries, images_per_query=100):
        """Scrape all images for a category"""
        category_dir = self.output_dir / category_name
        category_dir.mkdir(exist_ok=True)
        
        all_images = []
        for query in queries:
            print(f"Searching: {query}")
            images = self.search_images(query, images_per_query)
            
            for i, img in enumerate(images):
                filename = f"{query.replace(' ', '_')}_{i}.jpg"
                filepath = self.download_image(img['url'], category_name + "/" + filename)
                
                if filepath:
                    all_images.append({
                        "filepath": filepath,
                        "query": query,
                        "metadata": img
                    })
            
            time.sleep(1)  # Rate limiting
        
        return all_images

# Example usage
scraper = ImageScraper(api_key="YOUR_SERPAPI_KEY")

furniture_queries = [
    "office chair white background",
    "dining chair modern",
    "coffee table wood",
    "sofa modern gray",
    # ... 100 more queries
]

images = scraper.scrape_category("furniture", furniture_queries)
print(f"Downloaded {len(images)} furniture images")
```

---

### Phase 2: Image-to-3D Conversion (Week 2)

#### Using Meshy AI

```python
# meshy_converter.py

import requests
import json
import time
from pathlib import Path

class MeshyConverter:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.meshy.ai/v2"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def image_to_3d(self, image_path, object_name):
        """Convert image to 3D model"""
        
        # Upload image
        with open(image_path, 'rb') as f:
            files = {'file': f}
            upload_response = requests.post(
                f"{self.base_url}/image-to-3d",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
                data={
                    "name": object_name,
                    "enable_pbr": True,
                    "topology": "quad",
                    "target_polycount": 10000
                }
            )
        
        if upload_response.status_code != 200:
            print(f"Upload failed: {upload_response.text}")
            return None
        
        task_id = upload_response.json()['task_id']
        print(f"Task created: {task_id}")
        
        # Poll for completion
        max_attempts = 60  # 5 minutes max
        for attempt in range(max_attempts):
            status_response = requests.get(
                f"{self.base_url}/image-to-3d/{task_id}",
                headers=self.headers
            )
            
            status = status_response.json()
            if status['status'] == 'SUCCEEDED':
                print(f"✅ Model ready: {object_name}")
                return status['model_urls']
            elif status['status'] == 'FAILED':
                print(f"❌ Failed: {object_name}")
                return None
            
            time.sleep(5)
        
        print(f"⏱️ Timeout: {object_name}")
        return None
    
    def download_model(self, model_urls, output_path):
        """Download generated 3D model"""
        gltf_url = model_urls.get('glb') or model_urls.get('fbx')
        
        if not gltf_url:
            print("No downloadable model URL")
            return None
        
        response = requests.get(gltf_url)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return output_path
        
        return None
    
    def batch_convert(self, image_folder, output_folder):
        """Convert all images in folder to 3D"""
        image_folder = Path(image_folder)
        output_folder = Path(output_folder)
        output_folder.mkdir(exist_ok=True)
        
        images = list(image_folder.glob("*.jpg")) + list(image_folder.glob("*.png"))
        total = len(images)
        
        for i, image_path in enumerate(images):
            print(f"\n[{i+1}/{total}] Converting: {image_path.name}")
            
            object_name = image_path.stem
            model_urls = self.image_to_3d(str(image_path), object_name)
            
            if model_urls:
                output_path = output_folder / f"{object_name}.glb"
                self.download_model(model_urls, str(output_path))
            
            time.sleep(2)  # Rate limiting

# Example usage
converter = MeshyConverter(api_key="YOUR_MESHY_API_KEY")
converter.batch_convert(
    "scraped_images/furniture",
    "generated_objects/models/furniture"
)
```

---

### Phase 3: Integration with Object Generator (Week 3)

```javascript
// Update generator.js to use real 3D models

const fs = require('fs');
const path = require('path');

class ObjectGenerator {
  async generateObject(category, subcategory, type, variant) {
    const objectId = `obj_${category}_${subcategory}_${type}_${variant}`;
    
    // Check if 3D model exists
    const modelPath = `./generated_objects/models/${category}/${type}_${variant}.glb`;
    const modelExists = fs.existsSync(modelPath);
    
    return {
      objectId: objectId,
      category: category,
      subCategory: subcategory,
      type: type,
      metadata: {
        name: `${type} - ${variant}`,
        description: `High-quality ${type} for your MyPlace property`,
        tags: [category, subcategory, type],
        rarity: this.determineRarity(),
        price: {
          myplaceCoins: this.calculatePrice(),
          usd: this.calculatePrice() * 0.01
        }
      },
      visual: {
        model: {
          format: modelExists ? "GLB" : "PROCEDURAL",
          path: modelExists ? modelPath : `/procedural/${category}/${type}`,
          hasRealModel: modelExists,
          polyCount: modelExists ? await this.getModelPolyCount(modelPath) : 5000,
          textureResolution: "2048x2048"
        },
        colors: this.generateColors(),
        thumbnail: `/thumbnails/${objectId}.jpg`
      },
      physical: {
        dimensions: this.estimateDimensions(type),
        weight: this.estimateWeight(type),
        boundingBox: this.calculateBoundingBox()
      }
    };
  }
}
```

---

## 💰 Cost Optimization Strategies

### Strategy 1: Priority Tiers
1. **Tier 1 (Legendary/Epic)**: Use Meshy AI - highest quality ($4,080)
2. **Tier 2 (Rare)**: Use Luma AI - good quality (FREE)
3. **Tier 3 (Common)**: Use procedural generation (FREE)

### Strategy 2: Smart Caching
- Download models once, reuse with variations (colors, sizes)
- 47,000 objects = ~5,000 unique base models × 9-10 variants
- Real cost: 5,000 × $0.20 = **$1,000** (90% savings!)

### Strategy 3: Community Contributions
- Let users upload photos of their real furniture
- Convert to 3D automatically
- Give them 1,000 MPT bonus per accepted model
- Cost: $0 (users provide images)

---

## 🎯 Recommended Approach

### Week 1: Setup & Scraping
- Get SerpApi key ($50 credit)
- Get Meshy AI key ($50 credit)
- Scrape 10,000 high-quality images (200 per category)
- Focus on most popular objects first

### Week 2: Convert 1,000 Models
- Test with 100 objects first
- Convert best 1,000 images to 3D
- Cost: $200 (1,000 × $0.20)
- Result: All "legendary" and "epic" items have real models

### Week 3: Integration
- Update object browser to load GLB files
- Add fallback to procedural generation
- Test performance (should load 24 models smoothly)

### Week 4: Scale Up
- Use Luma AI (self-hosted) for remaining objects
- $200/month GPU server converts 500 objects/day
- Month 2: All 47,000 objects have real 3D models

---

## 📝 Implementation Checklist

- [ ] Get SerpApi API key ($50 credit)
- [ ] Get Meshy AI API key ($50 credit)
- [ ] Create image scraper script (Python)
- [ ] Scrape 10,000 product images (100/category × 100 categories)
- [ ] Set up Meshy AI converter script
- [ ] Convert 1,000 test images to 3D
- [ ] Update object browser to load GLB models
- [ ] Add GLTFLoader to Three.js renderer
- [ ] Test loading performance (24 models per page)
- [ ] Deploy Luma AI on GPU server for remaining objects
- [ ] Batch convert all 47,000 images
- [ ] Update catalog.json with model paths
- [ ] Add model quality badges (Real 3D vs Procedural)

---

## 🚀 The Result

Instead of spending months manually modeling 47,000 objects, we:
1. **Scrape images**: 1 week
2. **Convert to 3D**: 1 month (automated)
3. **Cost**: $1,000 - $4,000 (vs $500K+ for manual 3D modeling)
4. **Quality**: Photo-realistic (real product images)
5. **Scalability**: Infinite (scrape any new products)

**Users see REAL furniture, electronics, vehicles** - not generic placeholders!

---

**Ready to implement?** Let me know and I'll create the scraper + converter scripts! 🎨🤖
