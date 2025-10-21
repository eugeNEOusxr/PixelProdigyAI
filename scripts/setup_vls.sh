#!/bin/bash

# PixelProdigy VLS System Setup Script
# Initializes database, installs dependencies, and starts services

set -e  # Exit on error

echo "🎨 PixelProdigy VLS System Setup"
echo "=================================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo "🔍 Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not found${NC}"
    echo "   Install PostgreSQL:"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   Fedora/RHEL:   sudo dnf install postgresql postgresql-server"
    echo "   Arch:          sudo pacman -S postgresql"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL found${NC}"
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL service..."
if ! systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}⚠️  PostgreSQL service not running${NC}"
    echo "   Starting PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Initialize database
echo "🗄️  Initializing database..."
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='pixelprodigy_vls'" 2>/dev/null || echo "")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database 'pixelprodigy_vls' already exists${NC}"
    read -p "   Drop and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Dropping existing database..."
        sudo -u postgres psql -c "DROP DATABASE pixelprodigy_vls;"
    else
        echo "   Using existing database"
    fi
fi

if [ "$DB_EXISTS" != "1" ] || [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Creating database..."
    sudo -u postgres psql -c "CREATE DATABASE pixelprodigy_vls;"
    echo -e "${GREEN}✅ Database created${NC}"
    
    echo "   Loading schema..."
    sudo -u postgres psql -d pixelprodigy_vls -f "$(dirname "$0")/../schema/vls_schema.sql"
    echo -e "${GREEN}✅ Schema loaded${NC}"
fi
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Install Node.js:"
    echo "   Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "                  sudo apt-get install -y nodejs"
    exit 1
fi

cd "$(dirname "$0")/.."

if [ ! -f "package.json" ]; then
    echo "   Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "pixelprodigy-vls",
  "version": "1.0.0",
  "description": "Vertex Language System for PixelProdigy AI",
  "main": "server/vls_api.js",
  "scripts": {
    "start": "node server/vls_api.js",
    "convert": "node scripts/convert_objects_to_vls.js",
    "dev": "nodemon server/vls_api.js"
  },
  "keywords": ["vls", "3d", "ai", "metaverse"],
  "author": "PixelProdigy AI",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
fi

echo "   Installing packages..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Verify installation
echo "🧪 Verifying installation..."

# Test database connection
TEST_RESULT=$(sudo -u postgres psql -d pixelprodigy_vls -tAc "SELECT COUNT(*) FROM ai_personalities;" 2>/dev/null || echo "0")
if [ "$TEST_RESULT" -ge "5" ]; then
    echo -e "${GREEN}✅ Database connection verified (${TEST_RESULT} personalities)${NC}"
else
    echo -e "${RED}❌ Database verification failed${NC}"
    exit 1
fi

# Check Node modules
if [ -d "node_modules/express" ] && [ -d "node_modules/pg" ]; then
    echo -e "${GREEN}✅ Node modules verified${NC}"
else
    echo -e "${RED}❌ Node modules verification failed${NC}"
    exit 1
fi
echo ""

# Summary
echo "=================================================================="
echo "✨ SETUP COMPLETE"
echo "=================================================================="
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1️⃣  Convert existing objects to VLS:"
echo "   npm run convert"
echo ""
echo "2️⃣  Start the VLS API server:"
echo "   npm start"
echo ""
echo "3️⃣  Open the renderer in your browser:"
echo "   file://$(pwd)/pixelprodigy.html"
echo ""
echo "4️⃣  Test VLS rendering:"
echo "   - Select a personality"
echo "   - Enter VLS code (e.g., CHAIR:A5B5C2.D4E4F4)"
echo "   - Click 'Render 3D Model'"
echo ""
echo "📚 Documentation:"
echo "   VLS Architecture: VLS_ARCHITECTURE.md"
echo "   API Endpoints:    server/vls_api.js"
echo "   Database Schema:  schema/vls_schema.sql"
echo ""
echo "🚀 Happy VLS rendering!"
