#!/usr/bin/env python3
"""
Image-to-3D Converter for PixelProdigy AI
Converts scraped images to 3D models using Meshy AI or Luma AI
"""

import requests
import json
import time
from pathlib import Path
import hashlib

class Image3DConverter:
    """Converts images to 3D models using AI services"""
    
    def __init__(self, service="meshy", api_key=None):
        self.service = service  # "meshy" or "luma"
        self.api_key = api_key
        self.output_dir = Path("generated_objects/models")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Service-specific configuration
        if service == "meshy":
            self.base_url = "https://api.meshy.ai/v1"  # v1 for image-to-3d
            self.headers = {
                "Authorization": f"Bearer {api_key}"
            }
        elif service == "luma":
            self.base_url = "https://api.lumalabs.ai/v1"
            self.headers = {
                "Authorization": f"Bearer {api_key}"
            }
    
    # ========================================
    # MESHY AI IMPLEMENTATION
    # ========================================
    
    def meshy_image_to_3d(self, image_path, object_name, category="furniture"):
        """Convert image to 3D using Meshy AI"""
        print(f"🎨 Converting: {object_name}")
        
        try:
            # Step 1: Upload image
            with open(image_path, 'rb') as f:
                files = {'file': f}
                upload_response = requests.post(
                    f"{self.base_url}/image-to-3d",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files=files,
                    data={
                        "name": object_name,
                        "enable_pbr": "true",  # PBR materials for realistic rendering
                        "topology": "quad",     # Quad topology for better editing
                        "target_polycount": "10000"  # 10K polygons (good balance)
                    }
                )
            
            if upload_response.status_code != 200:
                print(f"❌ Upload failed: {upload_response.text}")
                return None
            
            task_id = upload_response.json()['task_id']
            print(f"  ⏳ Task ID: {task_id} (waiting for completion...)")
            
            # Step 2: Poll for completion (usually takes 3-5 minutes)
            max_attempts = 60  # 5 minutes max (5 second intervals)
            for attempt in range(max_attempts):
                status_response = requests.get(
                    f"{self.base_url}/image-to-3d/{task_id}",
                    headers=self.headers
                )
                
                if status_response.status_code != 200:
                    print(f"❌ Status check failed: {status_response.text}")
                    return None
                
                status_data = status_response.json()
                status = status_data.get('status')
                progress = status_data.get('progress', 0)
                
                if status == 'SUCCEEDED':
                    print(f"  ✅ Complete! (took {attempt * 5} seconds)")
                    return status_data.get('model_urls')
                elif status == 'FAILED':
                    print(f"  ❌ Failed: {status_data.get('error', 'Unknown error')}")
                    return None
                else:
                    print(f"  ⏳ Progress: {progress}% ({status})")
                
                time.sleep(5)
            
            print(f"  ⏱️  Timeout after 5 minutes")
            return None
            
        except Exception as e:
            print(f"❌ Exception: {e}")
            return None
    
    def meshy_download_model(self, model_urls, output_path):
        """Download generated 3D model from Meshy AI"""
        # Prefer GLB format (most compatible)
        model_url = model_urls.get('glb') or model_urls.get('fbx') or model_urls.get('obj')
        
        if not model_url:
            print(f"❌ No downloadable model URL found")
            return None
        
        try:
            response = requests.get(model_url, timeout=30)
            if response.status_code == 200:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                print(f"  💾 Saved: {output_path}")
                return str(output_path)
        except Exception as e:
            print(f"❌ Download failed: {e}")
        
        return None
    
    # ========================================
    # LUMA AI IMPLEMENTATION
    # ========================================
    
    def luma_image_to_3d(self, image_path, object_name):
        """Convert image to 3D using Luma AI"""
        print(f"🎨 Converting (Luma): {object_name}")
        
        try:
            # Luma uses NeRF (Neural Radiance Fields) for high-quality 3D
            with open(image_path, 'rb') as f:
                files = {'image': f}
                response = requests.post(
                    f"{self.base_url}/generations",
                    headers=self.headers,
                    files=files,
                    data={
                        "name": object_name,
                        "type": "image_to_3d"
                    }
                )
            
            if response.status_code != 200:
                print(f"❌ Upload failed: {response.text}")
                return None
            
            generation_id = response.json()['id']
            print(f"  ⏳ Generation ID: {generation_id}")
            
            # Poll for completion
            max_attempts = 40  # 2-3 minutes typically
            for attempt in range(max_attempts):
                status_response = requests.get(
                    f"{self.base_url}/generations/{generation_id}",
                    headers=self.headers
                )
                
                status_data = status_response.json()
                status = status_data.get('state')
                
                if status == 'completed':
                    print(f"  ✅ Complete!")
                    return status_data.get('assets')
                elif status == 'failed':
                    print(f"  ❌ Failed")
                    return None
                
                time.sleep(3)
            
            return None
            
        except Exception as e:
            print(f"❌ Exception: {e}")
            return None
    
    # ========================================
    # BATCH PROCESSING
    # ========================================
    
    def batch_convert_category(self, category_name, image_folder, limit=None):
        """Convert all images in a category to 3D models"""
        image_folder = Path(image_folder)
        if not image_folder.exists():
            print(f"❌ Folder not found: {image_folder}")
            return
        
        # Get all images
        images = list(image_folder.glob("*.jpg")) + list(image_folder.glob("*.png"))
        if limit:
            images = images[:limit]
        
        total = len(images)
        successful = 0
        failed = 0
        
        print(f"\n{'='*60}")
        print(f"📦 CATEGORY: {category_name.upper()}")
        print(f"📸 Images to convert: {total}")
        print(f"💰 Estimated cost: ${total * 0.20:.2f} (Meshy AI)")
        print(f"{'='*60}\n")
        
        # Create output folder
        category_output = self.output_dir / category_name
        category_output.mkdir(parents=True, exist_ok=True)
        
        for i, image_path in enumerate(images):
            print(f"\n[{i+1}/{total}] Processing: {image_path.name}")
            
            # Generate object name
            object_name = image_path.stem
            output_filename = f"{object_name}.glb"
            output_path = category_output / output_filename
            
            # Skip if already exists
            if output_path.exists():
                print(f"  ⏭️  Skip (exists): {output_filename}")
                continue
            
            # Convert based on service
            if self.service == "meshy":
                model_urls = self.meshy_image_to_3d(str(image_path), object_name, category_name)
                if model_urls:
                    result = self.meshy_download_model(model_urls, output_path)
                    if result:
                        successful += 1
                    else:
                        failed += 1
                else:
                    failed += 1
            
            elif self.service == "luma":
                assets = self.luma_image_to_3d(str(image_path), object_name)
                if assets:
                    # Download from Luma
                    successful += 1
                else:
                    failed += 1
            
            # Rate limiting (be nice to the API)
            time.sleep(2)
        
        print(f"\n{'='*60}")
        print(f"✅ Complete: {category_name}")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"💰 Actual cost: ${successful * 0.20:.2f}")
        print(f"{'='*60}")
    
    def batch_convert_all(self, scraped_images_dir, categories=None, limit_per_category=None):
        """Convert all scraped images to 3D models"""
        scraped_dir = Path(scraped_images_dir)
        
        if not categories:
            # Auto-detect categories from folders
            categories = [d.name for d in scraped_dir.iterdir() if d.is_dir()]
        
        total_successful = 0
        total_failed = 0
        
        for category in categories:
            category_folder = scraped_dir / category
            if not category_folder.exists():
                print(f"⚠️  Category folder not found: {category}")
                continue
            
            self.batch_convert_category(category, category_folder, limit=limit_per_category)


# ============================================
# MAIN EXECUTION
# ============================================

def main():
    """Main conversion workflow"""
    print("🤖 PixelProdigy AI - Image-to-3D Converter")
    print("=" * 60)
    
    # Configuration
    SERVICE = "meshy"  # or "luma"
    API_KEY = "msy_C4R6Gi2jUWC6RVvrsyfeTbfdGuPjNNOg9Gwl"  # Meshy AI API key
    
    print(f"✅ Using Meshy AI service")
    print(f"🔑 API Key: {API_KEY[:20]}...{API_KEY[-8:]}")
    
    if not API_KEY:
        print("\n⚠️  WARNING: No API key provided!")
        print("To use this script:")
        print("1. Sign up at https://meshy.ai (or https://lumalabs.ai)")
        print("2. Get your API key")
        print("3. Set API_KEY in this script or use environment variable")
        print("\nFor now, exiting...")
        return
    
    # Initialize converter
    converter = Image3DConverter(service=SERVICE, api_key=API_KEY)
    
    # Choose mode
    print("\n🎯 Conversion Modes:")
    print("1. Test mode (convert 5 images per category)")
    print("2. Small batch (convert 50 images per category)")
    print("3. Full conversion (all images, expensive!)")
    
    mode = input("\nChoose mode (1/2/3): ").strip()
    
    limits = {
        "1": 5,    # Test: $10 total (5 per category × 10 categories × $0.20)
        "2": 50,   # Small: $100 total
        "3": None  # Full: Could be $1000+ depending on how many images scraped
    }
    
    limit = limits.get(mode)
    
    if limit:
        estimated_cost = limit * 10 * 0.20  # limit × 10 categories × $0.20
        print(f"\n💰 Estimated cost: ${estimated_cost:.2f}")
    else:
        print(f"\n💰 Estimated cost: Depends on number of images scraped")
    
    confirm = input("Continue? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        return
    
    # Start conversion
    converter.batch_convert_all(
        scraped_images_dir="scraped_images",
        limit_per_category=limit
    )
    
    print(f"\n{'='*60}")
    print("🎉 CONVERSION COMPLETE!")
    print(f"📁 Models saved to: {converter.output_dir}")
    print("\n💡 Next step: Update object_browser/index.html to load these .glb models")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
