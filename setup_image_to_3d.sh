#!/bin/bash

# PixelProdigy AI - One-Click Image-to-3D Setup
# This script runs everything needed to get photo-realistic 3D objects

echo "🎨 PixelProdigy AI - Image-to-3D Setup"
echo "======================================"
echo ""

# Navigate to object generator directory
cd /home/jeremy/PixelProdigyAI/object_generator

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -q requests
echo "✅ Dependencies installed"
echo ""

# Ask user what they want to do
echo "🎯 What would you like to do?"
echo ""
echo "1. Download 10 test images (FREE)"
echo "2. Convert existing images to 3D ($0.20 each)"
echo "3. Full workflow (download + convert)"
echo "4. Update object metadata (after conversion)"
echo "5. Open object browser"
echo ""
read -p "Choose (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📸 Downloading 10 test images from Unsplash..."
        python3 quick_download_test_images.py
        echo ""
        echo "✅ Done! Next: Run option 2 to convert to 3D"
        ;;
    
    2)
        echo ""
        echo "🤖 Starting 3D conversion..."
        echo "⚠️  This will cost $0.20 per image"
        echo ""
        python3 image_to_3d_converter.py
        echo ""
        echo "✅ Done! Next: Run option 4 to update metadata"
        ;;
    
    3)
        echo ""
        echo "🚀 Full workflow starting..."
        echo ""
        echo "Step 1: Downloading images..."
        python3 quick_download_test_images.py
        echo ""
        echo "Step 2: Converting to 3D..."
        python3 image_to_3d_converter.py
        echo ""
        echo "Step 3: Updating metadata..."
        node update_object_metadata.js
        echo ""
        echo "✅ All done! Open http://localhost:8001/object_browser/"
        ;;
    
    4)
        echo ""
        echo "🔄 Updating object metadata..."
        node update_object_metadata.js
        echo ""
        echo "✅ Done! Refresh object browser to see changes"
        ;;
    
    5)
        echo ""
        echo "🌐 Opening object browser..."
        
        # Check if server is running
        if lsof -i:8001 > /dev/null 2>&1; then
            echo "✅ Server already running on port 8001"
        else
            echo "🚀 Starting HTTP server on port 8001..."
            cd /home/jeremy/PixelProdigyAI
            python3 -m http.server 8001 > /dev/null 2>&1 &
            sleep 2
            echo "✅ Server started"
        fi
        
        echo ""
        echo "📱 Open in browser: http://localhost:8001/object_browser/"
        echo ""
        
        # Try to open browser (if running on desktop)
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:8001/object_browser/ 2>/dev/null || true
        fi
        ;;
    
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "🎉 PixelProdigy AI Setup Complete!"
echo "======================================"
