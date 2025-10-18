#!/usr/bin/env python3
"""
Test Meshy AI API connection
"""

import requests
import json

API_KEY = "msy_C4R6Gi2jUWC6RVvrsyfeTbfdGuPjNNOg9Gwl"

print("🧪 Testing Meshy AI API")
print("=" * 60)
print()

# Test 1: Check API key validity by listing tasks
print("Test 1: Checking API key...")
headers = {
    "Authorization": f"Bearer {API_KEY}"
}

# Try different base URLs
base_urls = [
    "https://api.meshy.ai/v1",
    "https://api.meshy.ai/v2",
    "https://api.meshy.ai",
]

for base_url in base_urls:
    print(f"\nTrying: {base_url}")
    
    # Try to list tasks (this endpoint usually exists)
    try:
        response = requests.get(
            f"{base_url}/tasks",
            headers=headers,
            timeout=10
        )
        print(f"  GET /tasks: {response.status_code}")
        if response.status_code < 500:
            print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"  Error: {e}")
    
    # Try text-to-3d endpoint
    try:
        response = requests.get(
            f"{base_url}/text-to-3d",
            headers=headers,
            timeout=10
        )
        print(f"  GET /text-to-3d: {response.status_code}")
        if response.status_code < 500:
            print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"  Error: {e}")
    
    # Try image-to-3d endpoint
    try:
        response = requests.get(
            f"{base_url}/image-to-3d",
            headers=headers,
            timeout=10
        )
        print(f"  GET /image-to-3d: {response.status_code}")
        if response.status_code < 500:
            print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"  Error: {e}")

print()
print("=" * 60)
print("💡 Check the Meshy AI documentation at:")
print("   https://docs.meshy.ai")
