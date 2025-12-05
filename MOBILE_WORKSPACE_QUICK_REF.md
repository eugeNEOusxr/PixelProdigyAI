# 📱 Mobile Workspace - Quick Reference Card

## 🚀 Getting Started (30 seconds)
```bash
# 1. Open VS Code Mobile
# 2. File > Open Workspace from File
# 3. Select: mobile-workspace.code-workspace
# 4. Start coding!
```

---

## ⌨️ Essential Shortcuts

### Navigation
| Shortcut | Action |
|----------|--------|
| `Ctrl+P` / `Cmd+P` | Quick file open |
| `Ctrl+Shift+F` | Search in all files |
| `Ctrl+G` | Go to line |
| `Ctrl+B` / `Cmd+B` | Toggle sidebar |

### Editing
| Shortcut | Action |
|----------|--------|
| `Ctrl+D` / `Cmd+D` | Select next occurrence |
| `Ctrl+/` / `Cmd+/` | Toggle comment |
| `Alt+Up/Down` | Move line up/down |
| `Shift+Alt+Down` | Copy line down |

### Terminal
| Shortcut | Action |
|----------|--------|
| ``Ctrl+` `` / ``Cmd+` `` | Toggle terminal |
| `Ctrl+Shift+5` | Split terminal |

### Tasks
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+B` | Run build task |

---

## 📂 Workspace Folders

| Icon | Folder | Contains |
|------|--------|----------|
| 📚 | Documentation | All .md files |
| 🎨 | HTML Apps | All .html files |
| ⚙️ | Scripts | Build & deploy scripts |
| 🏗️ | Core Files | package.json, tsconfig.json, server.ts |

---

## 🛠️ Quick Tasks

### From Command Palette (Ctrl+Shift+P)
```
> Tasks: Run Task

📦 Build TypeScript     - Compile server.ts
🚀 Start Server        - Run the app
🔄 Build and Run       - Build + Run (one tap)
🧹 Clean Build         - Fresh rebuild
```

---

## 💡 Pro Tips

### 1. Quick File Open
Type `Ctrl+P` then start typing filename
- `pix` → pixelprodigy3d.html
- `serv` → server.ts
- `integ` → INTEGRATION_MASTER.md

### 2. Search Everything
`Ctrl+Shift+F` → Type search term
- Searches all files instantly
- Case-insensitive by default

### 3. Auto-Save is ON
- Saves after 2 seconds of inactivity
- No need to manually save
- Prevents data loss on mobile

### 4. Word Wrap is ON
- No horizontal scrolling
- All text visible on small screens

### 5. Minimap is OFF
- More screen space for code
- Better on small displays

---

## 🎯 Common Workflows

### Quick Edit
```
1. Ctrl+P → filename
2. Make changes
3. Auto-saves
4. Done!
```

### Build & Test
```
1. Edit code
2. Ctrl+Shift+B (build)
3. Open localhost:3000
4. Test changes
```

### Search & Replace
```
1. Ctrl+H
2. Enter find term
3. Enter replace term
4. Replace all
```

---

## 🔧 Settings

### Font Size
Default: 13px (readable on phones)
- **Pinch to zoom** for temporary adjustment
- Edit workspace file for permanent change

### Theme
Default: Dark (saves battery)
- Change: File > Preferences > Color Theme

### Auto-Save
Enabled: Saves after 2 seconds
- Prevents data loss
- Works offline

---

## 📱 Mobile-Specific Features

### Touch Gestures
- **Tap** - Place cursor
- **Double tap** - Select word
- **Long press** - Context menu
- **Pinch** - Zoom in/out
- **Two-finger scroll** - Navigate

### Portrait Mode
- Sidebar auto-hides for more space
- Tap to show sidebar
- Terminal docks at bottom

### Landscape Mode
- Split view available (tablets)
- Terminal on right
- More code visible

---

## 🐛 Quick Fixes

### "Workspace won't open"
```bash
cd /path/to/PixelProdigyAI
code mobile-workspace.code-workspace
```

### "Font too small"
- Pinch to zoom
- Or edit: `"editor.fontSize": 14`

### "Terminal hidden"
- Press `Ctrl+\``
- Or drag bottom panel up

### "Build fails"
```bash
npm install
npm run pixelprodigy3d
```

---

## 📚 Documentation Quick Links

### Essential Reads
- `START_HERE.md` - Begin here
- `INTEGRATION_MASTER.md` - System overview
- `API_ARCHITECTURE.md` - Backend reference
- `MOBILE_WORKSPACE_GUIDE.md` - Full guide (this doc)

### Features
- `AI_COMMAND_PROTOCOL.md` - AI commands
- `VERTEX_TOOLS_MASTER_LIST.md` - 45+ tools
- `DIMENSIONAL_WORKSPACE_SYSTEM.md` - Multi-env system

### Development
- `QUICK_START_GUIDE.md` - Getting started
- `IMPLEMENTATION_ROADMAP.md` - 4-week plan
- `DOCUMENTATION_INDEX.md` - All files

---

## 🎨 Workspace Structure

```
mobile-workspace.code-workspace
├─ Folders
│  ├─ 📱 Mobile Root (all files)
│  ├─ 📚 Documentation (*.md)
│  ├─ 🎨 HTML Apps (*.html)
│  ├─ ⚙️ Scripts (scripts/)
│  └─ 🏗️ Core Files (config + code)
│
├─ Settings (mobile-optimized)
│  ├─ Font: 13px
│  ├─ Auto-save: 2s delay
│  ├─ Word wrap: on
│  └─ Minimap: off
│
├─ Tasks
│  ├─ Build TypeScript
│  ├─ Start Server
│  ├─ Build and Run
│  └─ Clean Build
│
└─ Extensions (recommended)
   ├─ TypeScript
   ├─ ESLint
   ├─ Prettier
   └─ GitLens
```

---

## 🚀 Performance

### Battery Saving
- ✅ Dark theme enabled
- ✅ Auto-updates disabled
- ✅ Minimal extensions
- ✅ Efficient file watching

### Speed
- ✅ Excluded large folders
- ✅ Smart search indexing
- ✅ Optimized font rendering
- ✅ Reduced animations

### Memory
- ✅ Close unused tabs
- ✅ Restart occasionally
- ✅ Limit terminal history

---

## 📞 Need Help?

1. **Read full guide**: `MOBILE_WORKSPACE_GUIDE.md`
2. **Check troubleshooting**: See "🐛 Quick Fixes" above
3. **Search docs**: All in `📚 Documentation` folder
4. **GitHub Issues**: Tag with `[mobile-workspace]`

---

## ✅ Checklist: First Time Setup

- [ ] Clone repository
- [ ] Open `mobile-workspace.code-workspace`
- [ ] Install recommended extensions
- [ ] Run `npm install`
- [ ] Test build: `npm run pixelprodigy3d`
- [ ] Test server: `npm start`
- [ ] Browse to `localhost:3000`
- [ ] Verify auto-save works
- [ ] Try Ctrl+P quick open
- [ ] Read `MOBILE_WORKSPACE_GUIDE.md`

---

## 🎉 You're Ready!

The mobile workspace is configured and ready to use.

**Next steps:**
1. Make a small edit
2. Watch it auto-save
3. Run a build task
4. Commit your changes

**Remember:**
- Auto-save is your friend
- Use Ctrl+P for quick navigation
- Tasks are accessible via Ctrl+Shift+B
- Documentation is organized in folders

---

**Created:** October 2025  
**Purpose:** Mobile Development Reference  
**Status:** ✅ Ready to Use

📱 **Code from anywhere!**
