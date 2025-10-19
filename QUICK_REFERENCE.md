# ⚡ PIXELPRODIGY QUICK REFERENCE CARD

**Version**: v1.0.0 | **Date**: Oct 17, 2025 | **Status**: 53% Complete

---

## 🎮 KEYBOARD SHORTCUTS

### **Selection**
- `B` - Box selection
- `C` - Circle selection  
- `L` - Lasso selection
- `Shift` + drag - Add to selection
- `Ctrl` + drag - Remove from selection

### **Binding** (BIND-001)
- `Alt+L` - Toggle binding mode
- `1` - Rigid binding (solid)
- `2` - Elastic binding (springy)
- `3` - Chain binding (joints)
- `4` - Weld binding (permanent)
- `Ctrl+Shift+X` - Clear all bindings

### **Fragmentation** (FRAG-001)
- `Alt+F` - Toggle fragmentation mode
- `5` - Smart Chunk (Voronoi)
- `6` - Voxel (Minecraft style)
- `7` - Radial (glass shatter)
- `8` - Slice (clean cut)
- `[` / `]` - Decrease/increase fragment count
- `Space` - FRAGMENT! 💥
- `Ctrl+Shift+C` - Clear fragments

### **Particles** (VFX-001)
- `Alt+P` - Toggle particle mode
- `9` - Spawn particles at cursor
- `Shift+9` - Previous particle type
- `Shift+0` - Next particle type
- `Ctrl+Shift+P` - Clear all particles

### **General**
- `P` - Toggle physics
- `G` - Toggle gravity
- Mouse drag - Rotate camera
- Mouse wheel - Zoom

---

## 📦 PARTICLE TYPES

1. **Smoke** - Gray clouds, rises slowly, 2-4s
2. **Sparks** - Orange flashes, 0.3-0.8s
3. **Embers** - Glowing orange, 1.5-3.5s
4. **Debris** - Gray chunks, heavy, 2-5s
5. **Fire** - Orange flames, 0.5-1.5s

---

## ✅ COMPLETED SYSTEMS

- ✅ SEL-001-004: Selection (Box/Circle/Lasso)
- ✅ PHYS-001: Physics Engine
- ✅ BIND-001: Object Binding (4 types)
- ✅ FRAG-001: Fragmentation (4 algorithms)
- ✅ VFX-001: Particle System (5 types)

---

## 🎯 NEXT: LASER-001

**Lasso-Guided Laser Cutting** (Patent Pending)
- Shift+L after lasso
- Cuts along lasso path
- Sparks + smoke + molten edges
- 12-15 hours estimated

---

## 🚀 QUICK START

```bash
# Start server
python3 -m http.server 8000

# Open browser
http://localhost:8000/pixelprodigy3d.html

# Test features
Alt+L → Lasso → Lasso → Binding created!
Alt+F → Press 5 → Space → BOOM!
Alt+P → Press 9 → Particles spawn!
```

---

## 📚 DOCUMENTATION

- **BIND_001_COMPLETE.md** (15,000 words)
- **FRAG_001_COMPLETE.md** (15,000 words)
- **VFX_001_COMPLETE.md** (12,000 words)
- **MIGRATION_TO_MMGENE.md** (Full transfer guide)

---

## 🔧 TROUBLESHOOTING

**No physics?** → Press `P`  
**No response?** → Click viewport first  
**Low FPS?** → Clear particles (`Ctrl+Shift+P`)  
**Errors?** → Check console (F12)

---

## 🎨 FILE STRUCTURE

```
pixelprodigy3d.html (5,884 lines)
├─ Lines 1503-1693: BIND-001
├─ Lines 1694-2188: FRAG-001
└─ Lines 2199-2691: VFX-001
```

---

## 💻 KEY FUNCTIONS

```javascript
// Binding
createBinding(obj1, obj2, type)
updateBindingVisuals()

// Fragmentation
fragmentMesh(mesh, type, options)
createSmartChunkFragments()

// Particles
createPointEmitter(pos, type, lifetime)
updateParticles(deltaTime)
```

---

## 🏆 PROJECT STATUS

**Progress**: 8/15 features (53%)  
**Performance**: 60 FPS @ 5k particles  
**Documentation**: 42,000+ words  
**Next Milestone**: LASER-001 (Killer Feature!)

---

**Built by**: Jeremy (EugeNEOusXR/PixelProdigy)  
**Copyright**: © 2025 All Rights Reserved  
**Patent Status**: Patent Pending

*Quick, dirty, effective.* ⚡
