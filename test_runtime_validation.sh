#!/bin/bash
# PixelProdigy Runtime Validation & Console Testing
# Tests: Clones Optimizer + Muscle Layer Integration
# Date: October 24, 2025

echo "🧪 PixelProdigy Runtime Validation Test Suite"
echo "=============================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "pixelprodigy3d.html" ]; then
  echo "❌ Error: pixelprodigy3d.html not found. Run this script from the project root."
  exit 1
fi

echo "📂 Current directory: $(pwd)"
echo "📋 Test Files:"
echo "   ✅ pixelprodigy3d.html"
echo "   ✅ clones_device_optimizer.js"
echo "   ✅ muscle_layer.js"
echo "   ✅ security_system.js"
echo "   ✅ payment_integration.js"
echo "   ✅ nft_system.js"
echo ""

# Check for required files
REQUIRED_FILES=(
  "pixelprodigy3d.html"
  "clones_device_optimizer.js"
  "muscle_layer.js"
  "security_system.js"
  "payment_integration.js"
  "nft_system.js"
)

echo "🔍 Checking Required Files..."
ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file MISSING"
    ALL_FILES_EXIST=false
  fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
  echo ""
  echo "❌ Some required files are missing. Cannot proceed with tests."
  exit 1
fi

echo ""
echo "✅ All required files present"
echo ""

# Start a local web server
echo "🌐 Starting Local Web Server..."
echo "   Port: 8000"
echo "   URL: http://localhost:8000/pixelprodigy3d.html"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
  echo "🐍 Using Python 3 HTTP Server"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📱 CLONES RUNTIME VALIDATION TEST INSTRUCTIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "1. Open browser to: http://localhost:8000/pixelprodigy3d.html"
  echo ""
  echo "2. Open Browser Console (F12 or Ctrl+Shift+I)"
  echo ""
  echo "3. CHECK CLONES DEVICE OPTIMIZER:"
  echo "   ✅ Look for device profile banner:"
  echo "      📱 Clones Device Profile: [Basic|Pro|Elite]"
  echo "      🎯 Capability Score: XX/100"
  echo "      💻 CPU Cores: X"
  echo "      🧠 RAM: ~X GB"
  echo "      🎮 GPU: [name]"
  echo "      ⚙️ Optimizations Applied: ..."
  echo ""
  echo "4. CHECK MUSCLE LAYER INITIALIZATION:"
  echo "   ✅ Look for:"
  echo "      💪 Muscle Layer initialized"
  echo "      ✅ Muscle created: Left Biceps"
  echo "      ✅ Muscle created: Left Triceps"
  echo "      ✅ Muscle created: Pectoralis Major L"
  echo "      ✅ Muscle created: Rectus Abdominis"
  echo "      ✅ Muscle created: Left Quadriceps"
  echo "      ✅ Muscle created: Left Hamstrings"
  echo "      ... (14 total muscles)"
  echo ""
  echo "5. LOAD A SKELETON:"
  echo "   ✅ Click: 'DETAILED SKELETON (1200V+)' button in sidebar"
  echo "   ✅ OR: 'FULL BODY (564V)' button"
  echo "   ✅ OR: 'BONES BODY (564V)' button"
  echo ""
  echo "6. CHECK MUSCLE VISIBILITY:"
  echo "   ✅ Muscles should appear as red capsule-like shapes"
  echo "   ✅ Connecting between bones (e.g., upper arm to forearm)"
  echo ""
  echo "7. TEST MUSCLE TOGGLE:"
  echo "   ✅ Find 'Muscles' checkbox in sidebar (Anatomy workspace)"
  echo "   ✅ Uncheck: muscles disappear"
  echo "      Console: 💪 Muscle Layer hidden"
  echo "   ✅ Check: muscles reappear"
  echo "      Console: 💪 Muscle Layer shown"
  echo ""
  echo "8. TEST MUSCLE MOVEMENT:"
  echo "   ✅ Use Transform Controls (W/E/R) to move bones"
  echo "   ✅ Muscles should follow bone positions dynamically"
  echo ""
  echo "9. CHECK SECURITY & PAYMENT SYSTEMS:"
  echo "   ✅ Look for:"
  echo "      🔐 Initializing Security & Payment Systems..."
  echo "      ✅ Stripe loaded successfully"
  echo "      ✅ Payment System Ready"
  echo "      ✅ All Systems Initialized"
  echo "      🎯 Platform Readiness: 90/100"
  echo ""
  echo "10. CHECK NFT SYSTEM:"
  echo "    ✅ Click '🎨 NFT Dashboard' button (bottom right)"
  echo "    ✅ Verify readiness score displays"
  echo "    ✅ Check 'Mint NFT' button enabled if score >= 75"
  echo ""
  echo "11. EXPECTED CONSOLE OUTPUT (Summary):"
  echo "    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "    📱 Clones Device Profile: [tier]"
  echo "    🎯 Capability Score: XX/100"
  echo "    ⚙️ Optimizations Applied: ..."
  echo "    🔐 Initializing Security & Payment Systems..."
  echo "    💪 Muscle Layer initialized"
  echo "    ✅ Muscle created: [name] (×14)"
  echo "    ✅ All Systems Initialized"
  echo "    🎯 Platform Readiness: 90/100"
  echo "    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "12. PASS/FAIL CRITERIA:"
  echo "    ✅ PASS if:"
  echo "       - Clones profile detected and logged"
  echo "       - 14 muscles created (or warnings if bones not found)"
  echo "       - Muscles toggle on/off with checkbox"
  echo "       - Muscles follow bone movements"
  echo "       - No JavaScript errors in console"
  echo "       - Platform readiness = 90/100"
  echo ""
  echo "    ❌ FAIL if:"
  echo "       - JavaScript errors appear"
  echo "       - Muscles don't appear or don't move"
  echo "       - Systems fail to initialize"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🚀 Server Starting... Press Ctrl+C to stop"
  echo ""
  
  # Start Python HTTP server
  python3 -m http.server 8000
  
elif command -v python &> /dev/null; then
  echo "🐍 Using Python 2 HTTP Server"
  echo "(Follow same instructions as above)"
  echo ""
  python -m SimpleHTTPServer 8000
  
else
  echo "❌ Python not found. Please install Python or use another web server."
  echo ""
  echo "Alternative methods:"
  echo "  1. Node.js: npx http-server -p 8000"
  echo "  2. PHP: php -S localhost:8000"
  echo "  3. VS Code: Install 'Live Server' extension and click 'Go Live'"
  exit 1
fi
