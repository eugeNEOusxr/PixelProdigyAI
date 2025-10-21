#!/usr/bin/env python3
"""
Quick Image Downloader - Get sample images to test 3D conversion
No API key needed! Uses Unsplash's free CDN
"""

import requests
import os
from pathlib import Path

def download_test_images():
    """Download high-quality furniture, electronics, and vehicles from Unsplash"""
    
    print("🎨 PixelProdigy AI - Quick Image Downloader")
    print("=" * 60)
    print("📦 Downloading 21 diverse product images (FREE)")
    print("🪑 5 office chair styles + electronics + vehicles + plants")
    print()
    
    # Create output directory with category folders
    output_dir = Path("test_images")
    for category in ["furniture", "electronics", "vehicles", "nature"]:
        (output_dir / category).mkdir(parents=True, exist_ok=True)
    
    # High-quality product images from Unsplash (no API key needed)
    # Diverse selection: furniture, electronics, vehicles - most popular items
    sample_images = [
        # FURNITURE - Diverse Office Chairs (5 different styles)
        {
            "name": "ergonomic_office_chair_black",
            "url": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        {
            "name": "gaming_chair_rgb",
            "url": "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        {
            "name": "executive_leather_chair",
            "url": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        {
            "name": "modern_mesh_chair_white",
            "url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        {
            "name": "minimalist_wood_chair",
            "url": "https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        
        # FURNITURE - Popular Items
        {
            "name": "sectional_sofa_gray",
            "url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        {
            "name": "modern_coffee_table",
            "url": "https://images.unsplash.com/photo-1565191999001-551c187427bb?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        {
            "name": "standing_desk",
            "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&h=1200&fit=crop",
            "category": "furniture"
        },
        
        # ELECTRONICS - Most Popular
        {
            "name": "macbook_pro_laptop",
            "url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=1200&fit=crop",
            "category": "electronics"
        },
        {
            "name": "gaming_monitor_curved",
            "url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=1200&fit=crop",
            "category": "electronics"
        },
        {
            "name": "4k_tv_flatscreen",
            "url": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&h=1200&fit=crop",
            "category": "electronics"
        },
        {
            "name": "wireless_headphones",
            "url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=1200&fit=crop",
            "category": "electronics"
        },
        {
            "name": "smartphone_iphone",
            "url": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&h=1200&fit=crop",
            "category": "electronics"
        },
        
        # VEHICLES - Most Popular
        {
            "name": "tesla_model_s_sedan",
            "url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&h=1200&fit=crop",
            "category": "vehicles"
        },
        {
            "name": "luxury_suv_range_rover",
            "url": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&h=1200&fit=crop",
            "category": "vehicles"
        },
        {
            "name": "sports_car_ferrari",
            "url": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=1200&fit=crop",
            "category": "vehicles"
        },
        {
            "name": "motorcycle_sportbike",
            "url": "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=1200&h=1200&fit=crop",
            "category": "vehicles"
        },
        {
            "name": "electric_scooter",
            "url": "https://images.unsplash.com/photo-1600766857032-9aef5c61c4a2?w=1200&h=1200&fit=crop",
            "category": "vehicles"
        },
        
        # NATURE - Popular Plants
        {
            "name": "fiddle_leaf_fig_plant",
            "url": "https://images.unsplash.com/photo-1545239705-1564e58b9e4a?w=1200&h=1200&fit=crop",
            "category": "nature"
        },
        {
            "name": "monstera_plant_large",
            "url": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1200&h=1200&fit=crop",
            "category": "nature"
        }
    ]
    
    success_count = 0
    total_count = len(sample_images)
    
    for i, img in enumerate(sample_images, 1):
        try:
            print(f"[{i}/{total_count}] 📥 {img['category']}: {img['name']}...", end=" ")
            
            response = requests.get(img['url'], timeout=30)
            
            if response.status_code == 200:
                filename = output_dir / img['category'] / f"{img['name']}.jpg"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                
                file_size = len(response.content) / 1024  # KB
                print(f"✅ ({file_size:.0f} KB)")
                success_count += 1
            else:
                print(f"❌ Error {response.status_code}")
        
        except Exception as e:
            print(f"❌ Failed: {e}")
    
    print()
    print("=" * 60)
    print(f"✅ Downloaded: {success_count}/10 images")
    print(f"📁 Location: {output_dir.absolute()}")
    print()
    
    if success_count > 0:
        print("🎯 Next Steps:")
        print()
        print("1. Review images:")
        print(f"   cd {output_dir}")
        print(f"   ls -lh")
        print()
        print("2. Convert to 3D models:")
        print("   cd /home/jeremy/PixelProdigyAI/object_generator")
        print("   python3 image_to_3d_converter.py")
        print()
        print(f"3. Cost: ${success_count * 0.20} ({success_count} images × $0.20)")
        print(f"   Time: {success_count * 4} minutes (~{success_count * 4 // 60} hours)")
        print()
        print("4. After conversion, update metadata:")
        print("   node update_object_metadata.js")
        print()
        print("5. View in browser:")
        print("   Open http://localhost:8001/object_browser/")
        print("   See REAL 3D models instead of generic boxes! 🎉")
    else:
        print("⚠️  No images downloaded. Check your internet connection.")
    
    print("=" * 60)


def download_more_categories():
    """Download images for all 10 categories (100 images total)"""
    
    print("🎨 Full Category Download (100 images)")
    print("=" * 60)
    print()
    
    categories = {
        "furniture": [
            "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1200&h=1200&fit=crop",
            "https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&h=1200&fit=crop",
            # Add 8 more furniture images...
        ],
        "electronics": [
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&h=1200&fit=crop",  # Laptop
            "https://images.unsplash.com/photo-1601944177325-f8867652837f?w=1200&h=1200&fit=crop",  # TV
            # Add 8 more electronics...
        ],
        "vehicles": [
            "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1200&h=1200&fit=crop",  # Car
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1200&fit=crop",  # Motorcycle
            # Add 8 more vehicles...
        ]
        # Add other categories...
    }
    
    print("⚠️  This will download 100 images")
    print("Cost to convert: $20 (100 × $0.20)")
    print()
    confirm = input("Continue? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("Cancelled.")
        return
    
    # Download logic here...
    print("Feature coming soon! For now, use the 10-image test mode.")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--full":
        download_more_categories()
    else:
        download_test_images()
