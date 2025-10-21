#!/bin/bash
# PixelProdigy Workspace Cleanup Script
# Removes heavy files you can regenerate or reinstall

echo "🧹 PixelProdigy Workspace Cleanup"
echo "=================================="
echo ""

# Backup first
echo "📦 Creating backup of critical files..."
mkdir -p ~/pixelprodigy_backup
cp skyrelics_world.html ~/pixelprodigy_backup/
cp ai_world_generator.js ~/pixelprodigy_backup/
cp skyrelics_ai_legends.js ~/pixelprodigy_backup/
cp OLLAMA_MATHEMATICAL_TRAINING.md ~/pixelprodigy_backup/
echo "✅ Backup saved to ~/pixelprodigy_backup/"
echo ""

# Show current size
echo "📊 Current workspace size:"
du -sh /home/jeremy/PixelProdigyAI
echo ""

# Delete google-cloud-sdk (643 MB)
echo "🗑️  Removing google-cloud-sdk (643 MB)..."
rm -rf google-cloud-sdk
echo "✅ Removed google-cloud-sdk"
echo ""

# Delete generated objects (412 MB)
echo "🗑️  Removing generated objects (412 MB)..."
rm -rf object_generator/generated_objects
echo "✅ Removed generated objects"
echo ""

# Delete old demo HTML files (keep only the main ones)
echo "🗑️  Removing old demo HTML files..."
mkdir -p _archived_demos
mv *demo*.html _archived_demos/ 2>/dev/null
mv *test*.html _archived_demos/ 2>/dev/null
mv *prototype*.html _archived_demos/ 2>/dev/null
echo "✅ Moved old demos to _archived_demos/"
echo ""

# Clean git history (optional - makes .git smaller)
echo "🗑️  Cleaning git cache..."
git gc --aggressive --prune=now 2>/dev/null
echo "✅ Git cleaned"
echo ""

# Show new size
echo "📊 New workspace size:"
du -sh /home/jeremy/PixelProdigyAI
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "📤 Next steps:"
echo "  1. Push to GitHub: git add . && git commit -m 'Cleanup workspace' && git push"
echo "  2. Work from cloud: https://github.dev/eugeNEOusxr/PixelProdigyAI"
echo "  3. Deploy to pixel-prodigy.com automatically"
