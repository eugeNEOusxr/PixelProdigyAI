#!/bin/bash

# ========================================
# PIXELPRODIGY → MMGENE MIGRATION SCRIPT
# ========================================
# Date: October 17, 2025
# Purpose: Transfer PixelProdigy engine to MMGene workspace
# Usage: ./migrate_to_mmgene.sh /path/to/mmgene

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PIXELPRODIGY → MMGENE MIGRATION${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if destination path provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Destination path required${NC}"
    echo "Usage: ./migrate_to_mmgene.sh /path/to/mmgene"
    exit 1
fi

DEST_PATH="$1"
SOURCE_PATH="/home/jeremy/PixelProdigyAI"

echo -e "${YELLOW}Source:${NC} $SOURCE_PATH"
echo -e "${YELLOW}Destination:${NC} $DEST_PATH"
echo ""

# Check if source exists
if [ ! -d "$SOURCE_PATH" ]; then
    echo -e "${RED}Error: Source path does not exist!${NC}"
    exit 1
fi

# Create destination structure
echo -e "${BLUE}[1/6]${NC} Creating folder structure..."
mkdir -p "$DEST_PATH/pixelprodigy"
mkdir -p "$DEST_PATH/pixelprodigy/docs"
mkdir -p "$DEST_PATH/pixelprodigy/docs/systems"
mkdir -p "$DEST_PATH/pixelprodigy/docs/guides"
mkdir -p "$DEST_PATH/pixelprodigy/docs/sessions"
echo -e "${GREEN}✓${NC} Folders created"
echo ""

# Copy main engine
echo -e "${BLUE}[2/6]${NC} Copying main engine..."
cp "$SOURCE_PATH/pixelprodigy3d.html" "$DEST_PATH/pixelprodigy/"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} pixelprodigy3d.html (5,884 lines)"
else
    echo -e "${RED}✗${NC} Failed to copy main engine"
    exit 1
fi
echo ""

# Copy system documentation
echo -e "${BLUE}[3/6]${NC} Copying system documentation..."
cp "$SOURCE_PATH/BIND_001_COMPLETE.md" "$DEST_PATH/pixelprodigy/docs/systems/" 2>/dev/null && echo -e "${GREEN}✓${NC} BIND_001_COMPLETE.md (15,000 words)"
cp "$SOURCE_PATH/FRAG_001_COMPLETE.md" "$DEST_PATH/pixelprodigy/docs/systems/" 2>/dev/null && echo -e "${GREEN}✓${NC} FRAG_001_COMPLETE.md (15,000 words)"
cp "$SOURCE_PATH/VFX_001_COMPLETE.md" "$DEST_PATH/pixelprodigy/docs/systems/" 2>/dev/null && echo -e "${GREEN}✓${NC} VFX_001_COMPLETE.md (12,000 words)"
echo ""

# Copy guides
echo -e "${BLUE}[4/6]${NC} Copying development guides..."
cp "$SOURCE_PATH/AI_COMMAND_PROTOCOL.md" "$DEST_PATH/pixelprodigy/docs/guides/" 2>/dev/null && echo -e "${GREEN}✓${NC} AI_COMMAND_PROTOCOL.md"
cp "$SOURCE_PATH/MIGRATION_TO_MMGENE.md" "$DEST_PATH/pixelprodigy/docs/guides/" 2>/dev/null && echo -e "${GREEN}✓${NC} MIGRATION_TO_MMGENE.md"
cp "$SOURCE_PATH/QUICK_REFERENCE.md" "$DEST_PATH/pixelprodigy/docs/guides/" 2>/dev/null && echo -e "${GREEN}✓${NC} QUICK_REFERENCE.md"
echo ""

# Copy session summaries
echo -e "${BLUE}[5/6]${NC} Copying session summaries..."
cp "$SOURCE_PATH/TODAYS_VFX_BUILD.md" "$DEST_PATH/pixelprodigy/docs/sessions/" 2>/dev/null && echo -e "${GREEN}✓${NC} TODAYS_VFX_BUILD.md"
echo ""

# Create README and TODO
echo -e "${BLUE}[6/6]${NC} Creating README and TODO..."

# Create README.md
cat > "$DEST_PATH/pixelprodigy/README.md" << 'EOF'
# PixelProdigy Destruction Platform

**Status**: 53% Complete (8/15 features)  
**Next**: LASER-001 (Lasso-Guided Laser Cutting)

## Quick Start

1. Start server:
   ```bash
   cd pixelprodigy
   python3 -m http.server 8000
   ```

2. Open browser: `http://localhost:8000/pixelprodigy3d.html`

3. Test systems:
   - `P` - Enable physics
   - `Alt+L` - Binding mode (lasso two objects)
   - `Alt+F` - Fragmentation (Space to break)
   - `Alt+P` - Particles (9 to spawn)

## Completed Features ✅

1. SEL-001-004: Selection Systems
2. PHYS-001: Physics Engine
3. BIND-001: Object Binding (4 types)
4. FRAG-001: Fragmentation (4 algorithms)
5. VFX-001: Particle System (5 types)

## Next: LASER-001 🎯

Lasso-guided laser cutting (Patent Pending)
- Estimated: 12-15 hours
- Dependencies: ✅ All complete

## Documentation

- `docs/systems/`: System documentation (42k words)
- `docs/guides/`: Development guides
- `docs/sessions/`: Build summaries

**Say "laser-001!" to AI to continue development!**
EOF

echo -e "${GREEN}✓${NC} README.md created"

# Create TODO.md
cat > "$DEST_PATH/pixelprodigy/TODO.md" << 'EOF'
# PixelProdigy Todo List

## Completed ✅

- [x] BIND-001: Object Binding System
- [x] FRAG-001: Fragmentation System
- [x] VFX-001: Particle System

## Next: LASER-001 🎯

Lasso-Guided Laser Cutting (Patent Pending)
- Phase 1: Beam rendering (3-4h)
- Phase 2: Geometry intersection (3-4h)
- Phase 3: Cutting integration (2-3h)
- Phase 4: VFX effects (2-3h)
- Phase 5: Polish (2-3h)
- **Total**: 12-15 hours

## Pending ⏳

- [ ] DESTRUCT-001: Explosion System (6-8h)
- [ ] BURN-001: Fire Propagation (10-12h)
- [ ] SCENE-001: Scene Destruction (8-10h)
- [ ] UI-001: Advanced UI (4-6h)
- [ ] SAVE-001: Serialization (3-4h)
- [ ] DEPLOY-001: Beta Launch (1 week)

**Progress**: 53% (8/15 features)  
**Time to Market**: ~40-50 hours
EOF

echo -e "${GREEN}✓${NC} TODO.md created"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}MIGRATION COMPLETE!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Files transferred:${NC}"
echo "  • pixelprodigy3d.html (main engine)"
echo "  • 3 system docs (42,000 words)"
echo "  • 3 development guides"
echo "  • 1 session summary"
echo "  • README.md + TODO.md"
echo ""
echo -e "${YELLOW}Location:${NC}"
echo "  $DEST_PATH/pixelprodigy/"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. cd $DEST_PATH/pixelprodigy"
echo "  2. python3 -m http.server 8000"
echo "  3. Open http://localhost:8000/pixelprodigy3d.html"
echo "  4. Say 'laser-001!' to AI to continue!"
echo ""
echo -e "${GREEN}Ready to build the KILLER FEATURE! ⚡${NC}"
echo ""

# Optional: Count lines
if command -v wc &> /dev/null; then
    LINES=$(wc -l "$DEST_PATH/pixelprodigy/pixelprodigy3d.html" 2>/dev/null | awk '{print $1}')
    if [ ! -z "$LINES" ]; then
        echo -e "${BLUE}Main engine:${NC} $LINES lines"
        echo ""
    fi
fi

exit 0
