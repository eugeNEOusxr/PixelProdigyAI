#!/usr/bin/env python3
"""
Test Meshy AI image-to-3d submission
"""

import requests
import json

API_KEY = "msy_C4R6Gi2jUWC6RVvrsyfeTbfdGuPjNNOg9Gwl"
BASE_URL = "https://api.meshy.ai/v1"

print("🧪 Testing Meshy AI image-to-3d POST")
print("=" * 60)
print()

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

# Test image
test_image = "test_images/furniture/ergonomic_office_chair_black.jpg"

print(f"📁 Test image: {test_image}")
print()

# Try different POST formats
print("Test 1: Multipart file upload")
try:
    with open(test_image, 'rb') as f:
        files = {'file': f}
        data = {
            "name": "test_chair",
            "enable_pbr": "true"
        }
        response = requests.post(
            f"{BASE_URL}/image-to-3d",
            headers=headers,
            files=files,
            data=data,
            timeout=30
        )
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text[:500]}")
except Exception as e:
    print(f"  Error: {e}")

print()
print("Test 2: JSON with image URL")
try:
    # Try with JSON payload (some APIs prefer this)
    json_data = {
        "image_url": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8",
        "name": "test_chair",
        "enable_pbr": True
    }
    response = requests.post(
        f"{BASE_URL}/image-to-3d",
        headers={**headers, "Content-Type": "application/json"},
        json=json_data,
        timeout=30
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:500]}")
except Exception as e:
    print(f"  Error: {e}")

print()
print("Test 3: JSON with base64 encoded image")
try:
    import base64
    with open(test_image, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()
    
    json_data = {
        "image": image_data,
        "name": "test_chair"
    }
    response = requests.post(
        f"{BASE_URL}/image-to-3d",
        headers={**headers, "Content-Type": "application/json"},
        json=json_data,
        timeout=30
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.text[:500]}")
except Exception as e:
    print(f"  Error: {e}")

print()
print("=" * 60)
