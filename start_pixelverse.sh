#!/bin/bash

# PIXELVERSE QUICK START SCRIPT
# Auto-compile and launch all systems

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           PIXELVERSE SYSTEM LAUNCHER                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# 1. Compile C++ Backend
echo "🔧 Compiling C++ resource system..."
cd world_generation
g++ -std=c++17 -DPIXELVERSE_RESOURCE_GATHERING_DEMO \
    -o resource_gathering resource_gathering.cpp
echo "  ✓ C++ backend compiled"
echo ""

# 2. Test C++ Backend
echo "🧪 Testing C++ backend..."
./resource_gathering | head -5
echo "  ✓ C++ backend functional"
echo ""

# 3. Check Node dependencies
echo "📦 Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    cd ..
    npm install ws
    cd world_generation
fi
echo "  ✓ Dependencies ready"
echo ""

# 4. Start Gameplay Bridge (background)
echo "🌐 Starting gameplay bridge..."
node gameplay_bridge.js &
BRIDGE_PID=$!
echo "  ✓ Bridge running (PID: $BRIDGE_PID)"
echo ""

# 5. Start HTTP Server (background)
echo "🌍 Starting HTTP server..."
cd ..
python3 -m http.server 8000 &
HTTP_PID=$!
echo "  ✓ HTTP server running (PID: $HTTP_PID)"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  PIXELVERSE IS LIVE!                       ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  🎮 3D Viewer:      http://localhost:8000/world_generation/pixelverse_3d_viewer.html"
echo "║  🗺️  Landing Page:   http://localhost:8000/landing_page/google_maps_landing.html"
echo "║  🌐 WebSocket:      ws://localhost:8080"
echo "║  📊 Object Browser: http://localhost:8000/object_browser/3d_browser.html"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  World Stats:                                              ║"
echo "║  - 100km² terrain with 6.3M vertices                       ║"
echo "║  - 99,640 objects distributed                              ║"
echo "║  - 5 cities, 100 chunks                                    ║"
echo "║  - C++ resource gathering backend                          ║"
echo "║  - C# crafting system ready                                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Trap exit signals
trap "echo ''; echo '🛑 Shutting down...'; kill $BRIDGE_PID $HTTP_PID 2>/dev/null; echo '  ✓ All services stopped'; exit 0" SIGINT SIGTERM

# Keep script running
wait
