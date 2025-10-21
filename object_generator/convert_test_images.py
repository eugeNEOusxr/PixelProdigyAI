#!/usr/bin/env python3
"""
Convert Test Images to 3D Models using Meshy AI
Process the 19 downloaded test images and create GLB models
"""

import os
import sys
from pathlib import Path
from image_to_3d_converter import Image3DConverter

def main():
    print("🎨 PixelProdigy AI - Image-to-3D Batch Converter")
    print("=" * 60)
    print("🤖 Using Meshy AI ($0.20 per model)")
    print()
    
    # Initialize converter with your API key (hardcoded in image_to_3d_converter.py)
    API_KEY = "msy_C4R6Gi2jUWC6RVvrsyfeTbfdGuPjNNOg9Gwl"
    converter = Image3DConverter(service="meshy", api_key=API_KEY)
    
    # Find all downloaded test images
    test_images_dir = Path("test_images")
    if not test_images_dir.exists():
        print("❌ Error: test_images/ directory not found")
        print("   Run: python3 quick_download_test_images.py")
        sys.exit(1)
    
    # Collect all images
    image_files = []
    for category_dir in test_images_dir.iterdir():
        if category_dir.is_dir():
            for img_file in category_dir.glob("*.jpg"):
                image_files.append({
                    "path": img_file,
                    "category": category_dir.name,
                    "name": img_file.stem
                })
    
    if not image_files:
        print("❌ No images found in test_images/")
        sys.exit(1)
    
    print(f"📦 Found {len(image_files)} images to convert")
    print()
    
    # Create output directory
    output_dir = Path("3d_models")
    for category in ["furniture", "electronics", "vehicles", "nature"]:
        (output_dir / category).mkdir(parents=True, exist_ok=True)
    
    # Process each image
    successful = []
    failed = []
    
    for i, img_data in enumerate(image_files, 1):
        img_path = img_data['path']
        category = img_data['category']
        name = img_data['name']
        
        print(f"[{i}/{len(image_files)}] 🔄 {category}/{name}")
        output_path = output_dir / category / f"{name}.glb"
        
        try:
            # Use the meshy_image_to_3d method which handles the entire pipeline
            result = converter.meshy_image_to_3d(
                image_path=str(img_path),
                object_name=name,
                category=category
            )
            
            if result:
                # Download the GLB file
                model_urls = result.get('model_urls', {})
                if model_urls:
                    converter.meshy_download_model(model_urls, str(output_path))
                    file_size = output_path.stat().st_size / (1024 * 1024)  # MB
                    print(f"  ✅ Saved: {output_path} ({file_size:.2f} MB)")
                    
                    successful.append({
                        "name": name,
                        "category": category,
                        "path": str(output_path)
                    })
                else:
                    print(f"  ❌ No model URLs in response")
                    failed.append(name)
            else:
                print(f"  ❌ Conversion failed")
                failed.append(name)
        
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            failed.append(name)
        
        print()
    
    # Summary
    print("=" * 60)
    print("📊 CONVERSION SUMMARY")
    print("=" * 60)
    print(f"✅ Successful: {len(successful)}/{len(image_files)}")
    print(f"❌ Failed: {len(failed)}/{len(image_files)}")
    print()
    
    if successful:
        print("📁 3D Models saved to:")
        for model in successful[:5]:  # Show first 5
            print(f"   {model['path']}")
        if len(successful) > 5:
            print(f"   ... and {len(successful) - 5} more")
        print()
        
        # Calculate costs
        total_cost = len(successful) * 0.20
        print(f"💰 Total Cost: ${total_cost:.2f} ({len(successful)} models × $0.20)")
        print()
        
        print("🎯 Next Steps:")
        print()
        print("1. View the GLB files:")
        print(f"   cd {output_dir}")
        print("   ls -lhR")
        print()
        print("2. Update object metadata to link 3D models:")
        print("   node update_object_metadata.js")
        print()
        print("3. View in browser:")
        print("   python3 -m http.server 8001")
        print("   Open http://localhost:8001/object_browser/")
        print()
        print("4. Select any object to see the REAL 3D model! 🎉")
    
    if failed:
        print(f"⚠️ Failed conversions ({len(failed)}):")
        for name in failed[:10]:  # Show first 10
            print(f"   - {name}")
        if len(failed) > 10:
            print(f"   ... and {len(failed) - 10} more")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
