#!/bin/bash
# Optimize VS Code for low memory systems

echo "🔧 VS Code Memory Optimization"
echo "==============================="
echo ""

# 1. Disable heavy extensions you don't need right now
echo "📋 Recommended extensions to disable temporarily:"
echo "  - C# (ms-dotnettools.csharp) - using 53 MB"
echo "  - IntelliCode (visualstudioexptteam.intellicode) - using 102 MB"
echo "  - Extra TypeScript servers - using 450 MB"
echo ""

# 2. Create VS Code settings for low memory
echo "📝 Creating optimized settings.json..."
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/_archived_demos": true,
    "**/google-cloud-sdk": true,
    "**/object_generator/generated_objects": true
  },
  "search.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/_archived_demos": true,
    "**/google-cloud-sdk": true
  },
  "typescript.tsserver.maxTsServerMemory": 2048,
  "typescript.disableAutomaticTypeAcquisition": true,
  "files.watcherExclude": {
    "**/.git/**": true,
    "**/node_modules/**": true,
    "**/_archived_demos/**": true
  },
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "git.enabled": true,
  "git.autorefresh": false,
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": false
  }
}
EOF

echo "✅ Created optimized .vscode/settings.json"
echo ""

# 3. Clear VS Code cache
echo "🗑️  Clearing VS Code cache..."
rm -rf ~/.config/Code/Cache/*
rm -rf ~/.config/Code/CachedData/*
rm -rf ~/.config/Code/logs/*
echo "✅ Cache cleared"
echo ""

# 4. Show memory after
echo "📊 Current memory usage:"
free -h
echo ""

echo "✅ Optimization complete!"
echo ""
echo "🔄 Restart VS Code for changes to take effect:"
echo "   1. Close VS Code completely"
echo "   2. Run: code /home/jeremy/PixelProdigyAI"
echo ""
echo "💡 For even better performance:"
echo "   • Disable extensions you don't need (Ctrl+Shift+X)"
echo "   • Close unused editor tabs"
echo "   • Use 'code --disable-extensions' for minimal mode"
