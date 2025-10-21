#!/bin/bash

# PixelVerse Multiplayer Quick Start
# Launches server and opens browser clients

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🎮 PIXELVERSE MULTIPLAYER - QUICK START             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is already running
if pgrep -f "node multiplayer_server.js" > /dev/null; then
    echo "⚠️  Multiplayer server already running. Restarting..."
    pkill -f "node multiplayer_server.js"
    sleep 1
fi

# Start multiplayer server
echo "🚀 Starting multiplayer server on port 8081..."
cd /home/jeremy/PixelProdigyAI/world_generation
node multiplayer_server.js &
SERVER_PID=$!
sleep 2

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Multiplayer server running (PID: $SERVER_PID)"
else
    echo "❌ Failed to start multiplayer server"
    exit 1
fi

# Start HTTP server for client files
echo "🌐 Starting HTTP server on port 8000..."
cd /home/jeremy/PixelProdigyAI/world_generation
python3 -m http.server 8000 > /dev/null 2>&1 &
HTTP_PID=$!
sleep 1

if ps -p $HTTP_PID > /dev/null; then
    echo "✅ HTTP server running (PID: $HTTP_PID)"
else
    echo "❌ Failed to start HTTP server"
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  🎉 ALL SYSTEMS READY!                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Available URLs:"
echo "   • Multiplayer Client:  http://localhost:8000/multiplayer_client.html"
echo "   • Test Suite:          http://localhost:8000/multiplayer_test.html"
echo ""
echo "🎮 Quick Test:"
echo "   1. Open multiplayer_client.html in 2-3 browser tabs"
echo "   2. Login with different usernames (e.g., Player1, Player2)"
echo "   3. Test chat, friends, parties, guilds, matchmaking!"
echo ""
echo "🧪 Automated Testing:"
echo "   1. Open multiplayer_test.html"
echo "   2. Click 'Spawn Clients' (default: 4 clients)"
echo "   3. Select and run test scenarios"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f 'node multiplayer_server.js'"
echo "   pkill -f 'python3 -m http.server 8000'"
echo ""
echo "📚 Documentation:"
echo "   • MULTIPLAYER_SYSTEM_DOCS.md  - Protocol specification"
echo "   • MULTIPLAYER_FEATURES.md     - Feature overview & usage"
echo ""

# Open browser (optional - uncomment if desired)
# echo "🌐 Opening browser..."
# xdg-open "http://localhost:8000/multiplayer_test.html" 2>/dev/null || \
# open "http://localhost:8000/multiplayer_test.html" 2>/dev/null || \
# echo "   Please open http://localhost:8000/multiplayer_test.html manually"

echo "✨ Ready to test PixelVerse Multiplayer!"
