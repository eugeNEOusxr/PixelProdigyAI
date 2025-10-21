#!/usr/bin/env python3
"""
Image Scraper for PixelProdigy AI
Scrapes product images from Google Images, OfferUp, furniture stores
"""

import requests
import json
import time
from pathlib import Path
from urllib.parse import quote
import hashlib

class ImageScraper:
    """Scrapes product images for 3D model generation"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key  # SerpApi key (optional, will use free method if None)
        self.output_dir = Path("scraped_images")
        self.output_dir.mkdir(exist_ok=True)
        self.metadata_file = self.output_dir / "metadata.json"
        self.metadata = self.load_metadata()
        
    def load_metadata(self):
        """Load existing metadata"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return {}
    
    def save_metadata(self):
        """Save metadata to disk"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def search_google_images(self, query, num_images=100):
        """Search Google Images using SerpApi"""
        if not self.api_key:
            print("⚠️  No API key provided. Using free method (limited results)")
            return self.search_google_images_free(query, num_images)
        
        try:
            params = {
                "engine": "google_images",
                "q": query,
                "api_key": self.api_key,
                "num": num_images,
                "safe": "active",
                "tbm": "isch"
            }
            
            response = requests.get("https://serpapi.com/search", params=params)
            if response.status_code == 200:
                results = response.json()
                images = []
                
                for image in results.get("images_results", []):
                    images.append({
                        "url": image.get("original"),
                        "thumbnail": image.get("thumbnail"),
                        "title": image.get("title", ""),
                        "source": image.get("source", "")
                    })
                
                return images
        except Exception as e:
            print(f"❌ Error with SerpApi: {e}")
            return []
    
    def search_google_images_free(self, query, num_images=20):
        """Free method using Google Custom Search API (100 free/day)"""
        # This uses Google's official CSE API (requires setup at console.cloud.google.com)
        # For now, return placeholder - user needs to set up their own API
        print(f"🔍 Searching: {query} (free method, limited to 20 images)")
        
        # Placeholder - would integrate with Google Custom Search API
        # See: https://developers.google.com/custom-search/v1/overview
        
        return []
    
    def download_image(self, url, filename):
        """Download image from URL"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10, stream=True)
            
            if response.status_code == 200:
                # Check if it's actually an image
                content_type = response.headers.get('content-type', '')
                if 'image' not in content_type:
                    print(f"⚠️  Not an image: {content_type}")
                    return None
                
                filepath = self.output_dir / filename
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                return str(filepath)
        except Exception as e:
            print(f"❌ Error downloading {url}: {e}")
        return None
    
    def scrape_category(self, category_name, queries, images_per_query=100):
        """Scrape all images for a category"""
        category_dir = self.output_dir / category_name
        category_dir.mkdir(exist_ok=True)
        
        if category_name not in self.metadata:
            self.metadata[category_name] = []
        
        all_images = []
        total_downloaded = 0
        
        for query_idx, query in enumerate(queries):
            print(f"\n[{query_idx+1}/{len(queries)}] Searching: {query}")
            images = self.search_google_images(query, images_per_query)
            print(f"  Found {len(images)} results")
            
            for img_idx, img in enumerate(images):
                # Create unique filename
                img_hash = hashlib.md5(img['url'].encode()).hexdigest()[:8]
                filename = f"{category_name}/{query.replace(' ', '_')}_{img_idx}_{img_hash}.jpg"
                
                # Skip if already downloaded
                full_path = self.output_dir / filename
                if full_path.exists():
                    print(f"  ⏭️  Skip (exists): {filename}")
                    continue
                
                filepath = self.download_image(img['url'], filename)
                
                if filepath:
                    total_downloaded += 1
                    image_data = {
                        "filepath": filepath,
                        "query": query,
                        "url": img['url'],
                        "title": img['title'],
                        "source": img['source']
                    }
                    all_images.append(image_data)
                    self.metadata[category_name].append(image_data)
                    print(f"  ✅ Downloaded: {filename}")
                
                # Rate limiting
                time.sleep(0.5)
            
            # Save metadata after each query
            self.save_metadata()
            
            # Rate limiting between queries
            time.sleep(2)
        
        print(f"\n✅ Category '{category_name}' complete: {total_downloaded} new images downloaded")
        return all_images


# ============================================
# QUERY DEFINITIONS FOR ALL 10 CATEGORIES
# ============================================

FURNITURE_QUERIES = [
    # Seating (1,500 objects)
    "office chair white background", "gaming chair black", "dining chair wood",
    "accent chair modern", "rocking chair classic", "bar stool metal",
    "bean bag chair", "folding chair plastic", "chaise lounge",
    # Sofas (1,500 objects)
    "sectional sofa gray", "loveseat modern", "chesterfield sofa leather",
    "sleeper sofa", "futon sofa bed", "modular sofa",
    # Tables (1,500 objects)
    "coffee table modern wood", "dining table rectangular", "desk minimalist white",
    "side table contemporary", "console table narrow", "end table small",
    # Storage (1,500 objects)
    "bookshelf modern", "dresser wood", "cabinet white", "wardrobe closet",
    "nightstand", "chest of drawers", "media console", "credenza"
]

ARCHITECTURE_QUERIES = [
    # Doors (2,000 objects)
    "front door modern black", "interior door white panel", "sliding glass door",
    "barn door wood rustic", "french door double", "pocket door",
    "bifold door closet", "dutch door half", "pivot door contemporary",
    # Windows (2,000 objects)
    "double hung window", "casement window", "bay window", "picture window large",
    "sliding window horizontal", "awning window", "skylight window roof",
    # Walls (2,000 objects)
    "brick wall texture", "concrete wall", "wood panel wall", "glass wall partition"
]

ELECTRONICS_QUERIES = [
    # Entertainment (2,000 objects)
    "4K TV flat screen", "OLED TV", "gaming monitor curved", "soundbar speaker",
    "home theater projector", "smart speaker", "turntable vinyl",
    # Computers (2,000 objects)
    "laptop silver MacBook", "desktop computer tower", "all-in-one computer",
    "tablet iPad", "gaming PC RGB", "monitor ultrawide"
]

VEHICLES_QUERIES = [
    # Ground vehicles (2,000 objects)
    "sedan car side view white background", "SUV black isolated", "sports car red",
    "pickup truck", "minivan", "hatchback", "convertible car", "coupe",
    "motorcycle sport bike", "cruiser motorcycle", "scooter", "bicycle mountain bike",
    # Aircraft (2,000 objects)
    "helicopter side view", "private jet", "small airplane cessna", "drone quadcopter"
]

NATURE_QUERIES = [
    # Plants (2,000 objects)
    "oak tree isolated white", "palm tree", "pine tree", "maple tree",
    "potted plant fern", "succulent plant", "cactus", "indoor plant monstera",
    "bamboo plant", "snake plant", "fiddle leaf fig", "peace lily",
    # Landscape (2,000 objects)
    "river rock smooth", "boulder large", "pebbles", "gravel stones",
    "water fountain outdoor", "pond", "waterfall"
]

FOOD_QUERIES = [
    # Food items (2,000 objects)
    "pizza whole top view", "burger gourmet", "sushi platter", "pasta dish",
    "salad bowl fresh", "steak grilled", "sandwich", "taco plate",
    "apple fruit", "banana", "orange", "grapes", "strawberries",
    # Beverages (2,000 objects)
    "coffee cup latte art", "espresso shot", "cappuccino", "tea cup",
    "wine glass red", "beer glass", "cocktail martini", "water bottle"
]

CLOTHING_QUERIES = [
    # Tops (2,000 objects)
    "t-shirt white front view", "hoodie black", "sweater knit", "shirt button down",
    "blouse women's", "tank top", "polo shirt", "cardigan",
    # Accessories (2,000 objects)
    "backpack black", "handbag leather", "wallet", "sunglasses",
    "watch wristwatch", "necklace jewelry", "bracelet", "earrings"
]

TOOLS_QUERIES = [
    # Hand tools (2,000 objects)
    "hammer claw", "screwdriver set", "wrench adjustable", "pliers",
    "saw hand saw", "level tool", "tape measure", "utility knife",
    # Power tools (2,000 objects)
    "drill cordless", "circular saw", "jigsaw power tool", "sander orbital",
    "angle grinder", "impact driver", "router tool"
]

ART_QUERIES = [
    # Wall art (2,000 objects)
    "abstract painting canvas", "landscape painting", "portrait art",
    "photograph framed", "poster print", "wall decal",
    # Sculptures (2,000 objects)
    "sculpture modern abstract", "ceramic vase", "statue bronze", "figurine"
]

EDUCATION_QUERIES = [
    # Educational materials (2,000 objects)
    "textbook", "notebook spiral", "binder", "pencil", "pen",
    "calculator scientific", "globe world", "microscope",
    # Financial documents (2,000 objects)
    "mortgage document", "tax form 1040", "bank statement", "credit card",
    "invoice template", "receipt", "contract"
]


# ============================================
# MAIN EXECUTION
# ============================================

def main():
    """Main scraping workflow"""
    print("🎨 PixelProdigy AI - Image Scraper")
    print("=" * 60)
    
    # Initialize scraper (no API key = free mode, limited results)
    # To use SerpApi: scraper = ImageScraper(api_key="YOUR_SERPAPI_KEY")
    scraper = ImageScraper()
    
    # Define all categories
    categories = {
        "furniture": FURNITURE_QUERIES[:10],  # Start with 10 queries per category for testing
        "architecture": ARCHITECTURE_QUERIES[:10],
        "electronics": ELECTRONICS_QUERIES[:10],
        "vehicles": VEHICLES_QUERIES[:10],
        "nature": NATURE_QUERIES[:10],
        "food_beverage": FOOD_QUERIES[:10],
        "clothing": CLOTHING_QUERIES[:10],
        "tools": TOOLS_QUERIES[:10],
        "art_decor": ART_QUERIES[:10],
        "education": EDUCATION_QUERIES[:10]
    }
    
    # Scrape each category
    total_images = 0
    for category_name, queries in categories.items():
        print(f"\n{'='*60}")
        print(f"📦 CATEGORY: {category_name.upper()}")
        print(f"{'='*60}")
        
        images = scraper.scrape_category(category_name, queries, images_per_query=20)
        total_images += len(images)
        
        print(f"✅ {category_name}: {len(images)} images scraped")
    
    print(f"\n{'='*60}")
    print(f"🎉 COMPLETE! Total images: {total_images}")
    print(f"📁 Images saved to: {scraper.output_dir}")
    print(f"📋 Metadata saved to: {scraper.metadata_file}")
    print(f"\n💡 Next step: Run image_to_3d_converter.py to convert images to 3D models")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
