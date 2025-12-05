#!/bin/bash
# 🚀 Quick Test Script for Gene Clone Phone + Business Universe
# Run this to test the complete integrated system

echo "🧬 EugeneOus Ecosystem Test Suite"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "geneclone_phone.html" ]; then
    echo "❌ Error: geneclone_phone.html not found"
    echo "   Please run this script from the PixelProdigyAI directory"
    exit 1
fi

# Check required files
echo "📋 Checking required files..."
REQUIRED_FILES=(
    "geneclone_phone.html"
    "geneclone_sw.js"
    "geneclone_manifest.json"
    "business_universe_navigator.html"
    "pixelprodigy3d.html"
    "three.min.js"
    "OrbitControls.js"
)

ALL_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING)"
        ALL_PRESENT=false
    fi
done

echo ""

if [ "$ALL_PRESENT" = false ]; then
    echo "⚠️  Some files are missing. Tests may fail."
    echo ""
fi

# Get local IP for iPhone testing
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo "🌐 Starting HTTP Server..."
echo "   Local: http://localhost:8000"
echo "   iPhone: http://$LOCAL_IP:8000"
echo ""

echo "📱 TESTING CHECKLIST:"
echo "===================="
echo ""
echo "1️⃣  GENE CLONE PHONE TEST"
echo "   URL: http://$LOCAL_IP:8000/geneclone_phone.html"
echo ""
echo "   Expected Behavior:"
echo "   ✓ Boot screen appears (🧬 Gene Clone Phone)"
echo "   ✓ Progress bar fills (2-3 seconds)"
echo "   ✓ Home screen loads with app grid + dock"
echo "   ✓ See 'Business Universe 🌍' in dock with badge '58'"
echo "   ✓ Search box works (filter apps)"
echo "   ✓ Offline notification appears (if disconnected)"
echo ""
echo "   Console Check:"
echo "   - Should see: '🧬 Gene Clone Phone - EugeneOusOS Initializing...'"
echo "   - Should see: '✅ Loaded XX apps'"
echo "   - NO errors about missing files"
echo ""

echo "2️⃣  BUSINESS UNIVERSE TEST"
echo "   URL: http://$LOCAL_IP:8000/business_universe_navigator.html"
echo ""
echo "   Expected Behavior:"
echo "   ✓ Loading screen (1 second)"
echo "   ✓ 3D sphere appears with glowing orbs"
echo "   ✓ Each orb has emoji logo (🎨, 🛒, 🎯, etc.)"
echo "   ✓ Drag to rotate sphere works"
echo "   ✓ Click sphere → Info panel slides in from right"
echo "   ✓ Info panel shows: Logo, Name, Description, Stats"
echo "   ✓ '🚀 Launch Platform' button present"
echo "   ✓ Category bar at bottom (All, Creative Tools, Retail, etc.)"
echo "   ✓ Left/Right arrow buttons work"
echo ""
echo "   Console Check:"
echo "   - Should see: '📊 Total Businesses: 58'"
echo "   - Should see: '✅ Created 58 business spheres'"
echo "   - Should see: '🎯 Selected: [Business Name]' when clicking sphere"
echo "   - NO Three.js errors"
echo ""

echo "3️⃣  INTEGRATION TEST (Gene Clone → Universe → PixelProdigy)"
echo "   Start: http://$LOCAL_IP:8000/geneclone_phone.html"
echo ""
echo "   Flow:"
echo "   1. Wait for home screen to load"
echo "   2. Tap 'Business Universe 🌍' in dock"
echo "   3. Verify 3D sphere loads in fullscreen"
echo "   4. Tap 'PixelProdigy 🎨' sphere"
echo "   5. Info panel opens → Tap '🚀 Launch Platform'"
echo "   6. PixelProdigy 3D loads (may take 5-10 seconds)"
echo "   7. See 3D canvas with transform controls"
echo "   8. Tap browser back button"
echo "   9. Should return to Business Universe (still loaded)"
echo ""

echo "4️⃣  IPHONE SAFARI TEST (Critical)"
echo "   On your iPhone:"
echo "   1. Open Safari"
echo "   2. Visit: http://$LOCAL_IP:8000/geneclone_phone.html"
echo "   3. Tap 'Business Universe' in dock"
echo "   4. Use touch controls:"
echo "      - Swipe to rotate sphere"
echo "      - Pinch to zoom"
echo "      - Tap sphere to select"
echo "      - Tap arrow buttons to rotate"
echo "   5. Tap any business → Tap Launch"
echo "   6. Verify platform loads"
echo "   7. Test Add to Home Screen:"
echo "      - Tap Share button"
echo "      - Tap 'Add to Home Screen'"
echo "      - Icon appears: '🧬 EugeneOus'"
echo "      - Tap icon → Full-screen app (no Safari chrome)"
echo ""

echo "5️⃣  OFFLINE MODE TEST"
echo "   1. Load Gene Clone Phone with internet ON"
echo "   2. Wait for full load + cache"
echo "   3. Turn off WiFi / Enable Airplane Mode"
echo "   4. Reload page (should still work from cache)"
echo "   5. Verify notification: 'Offline Mode - Using cached apps'"
echo "   6. Previously used apps should load instantly"
echo "   7. New apps should show 'Available when online'"
echo ""

echo "6️⃣  PERFORMANCE TEST"
echo "   Open DevTools (F12) → Performance tab"
echo "   1. Record Gene Clone Phone boot"
echo "      Expected: < 3 seconds total"
echo "   2. Record Business Universe load"
echo "      Expected: < 2 seconds"
echo "   3. Check FPS during sphere rotation"
echo "      Expected: 30-60 FPS on desktop, 15-30 FPS on mobile"
echo "   4. Check memory usage"
echo "      Expected: < 200MB for all platforms combined"
echo ""

echo "=================================="
echo ""
echo "🚀 Starting server now..."
echo "   Press Ctrl+C to stop"
echo ""

# Start Python HTTP server
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "❌ Error: Python not found"
    echo "   Please install Python to run local server"
    exit 1
fi
