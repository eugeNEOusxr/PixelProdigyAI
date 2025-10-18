# ⭕ CIRCLE SELECT TOOL - Complete Guide

## 🎯 Overview

The Circle Select tool is a **radius-based brush selection** that lets you select, build, or carve vertices within a circular area. It's perfect for organic sculpting workflows where you need fluid, continuous modifications.

---

## 🎮 Basic Usage

### Activate Circle Select
```
Press C → Circle Select Mode ENABLED
```

**Visual Feedback:**
- Circular overlay appears at mouse position
- Default radius: 50px
- Default color: Cyan (selection mode)
- Cursor disappears (replaced by circle)

### Move Circle
- **Mouse Movement:** Circle follows cursor in real-time
- **Live Selection:** Vertices within circle are selected as you move
- **Visual Highlight:** Selected vertices turn cyan

### Adjust Radius
- **Scroll Up:** Increase radius (+5px per scroll)
- **Scroll Down:** Decrease radius (-5px per scroll)
- **Range:** 10px (min) to 200px (max)
- **Console Log:** Shows current radius value

### Deactivate
```
Press C again → Circle Select Mode DISABLED
```

---

## 🛠️ Selection Modes

### 1. Normal Selection (Replace)
**Default behavior** - Move mouse to select vertices within circle
```
C → Move mouse → Selects vertices (replaces previous)
```

### 2. Add to Selection
**Hold Shift** while moving
```
C → Hold Shift → Move mouse → Adds to existing selection
```

### 3. Remove from Selection
**Hold Ctrl** while moving
```
C → Hold Ctrl → Move mouse → Removes from existing selection
```

---

## 🎨 Layer Modification Modes

### Build Mode (Green Circle)
**Press + key** to toggle BUILD mode
```
C → Press + → Circle turns GREEN → Move mouse → Builds up layers in real-time
```

**How it works:**
- Circle border turns green (#00ff00)
- As you move mouse, vertices within circle build up (+0.1 units along normals)
- **Real-time modification** - changes happen as you move
- Press + again to toggle OFF

**Use cases:**
- Add muscle definition to character
- Build up terrain hills
- Add volume to thin areas
- Create organic bumps and ridges

### Carve Mode (Red Circle)
**Press - key** to toggle CARVE mode
```
C → Press - → Circle turns RED → Move mouse → Carves away layers in real-time
```

**How it works:**
- Circle border turns red (#ff0000)
- As you move mouse, vertices within circle carve away (-0.1 units along normals)
- **Real-time modification** - changes happen as you move
- Press - again to toggle OFF

**Use cases:**
- Carve facial features (eye sockets, mouth)
- Create valleys in terrain
- Hollow out objects
- Add surface detail (scales, wrinkles)

---

## 📊 Complete Workflow Examples

### Example 1: Organic Sculpting
```
1. Press C → Enable circle select
2. Scroll to adjust radius (try 75px)
3. Move over face area → Vertices highlight cyan
4. Press + → Circle turns green (build mode)
5. Move over cheekbone → Builds up as you move
6. Move over forehead → Continues building
7. Press + → Disable build mode
8. Press - → Circle turns red (carve mode)
9. Move over eye area → Carves eye socket
10. Press C → Disable circle select
```

### Example 2: Terrain Sculpting
```
1. Press C → Enable circle select
2. Scroll to large radius (150px)
3. Press + → Build mode (green)
4. Move over flat area → Creates hill
5. Circle multiple times → Hill gets taller
6. Press - → Carve mode (red)
7. Move over hill top → Creates crater
8. Press C → Done
```

### Example 3: Detail Work
```
1. Press C → Enable circle select
2. Scroll to small radius (20px)
3. Press + → Build mode
4. Move in lines → Creates raised detail (scales, ridges)
5. Press - → Carve mode
6. Move in dots → Creates pitted detail (pores, damage)
7. Alternate between + and - for complex textures
```

---

## 🔧 Technical Details

### Screen Space Projection
Circle select uses the same projection math as box select:

```javascript
// Convert 3D vertex to 2D screen space
const projected = vertex.clone().project(camera);
const screenX = (projected.x * 0.5 + 0.5) * canvas.width;
const screenY = ((-projected.y * 0.5) + 0.5) * canvas.height;

// Calculate distance from circle center
const dx = screenX - circleCenter.x;
const dy = screenY - circleCenter.y;
const distance = Math.sqrt(dx * dx + dy * dy);

// Check if within radius
if (distance <= circleRadius) {
  // Vertex is inside circle
}
```

### Real-Time Modification
When in build/carve mode:

```javascript
if (circleModifyMode === 'build') {
  applyLayerModification(verticesInCircle, 0.1);  // Build +0.1
  highlightSelectedVertices(verticesInCircle);    // Show cyan
} else if (circleModifyMode === 'carve') {
  applyLayerModification(verticesInCircle, -0.1); // Carve -0.1
  highlightSelectedVertices(verticesInCircle);    // Show cyan
}
```

**Performance:**
- Runs on every `mousemove` event
- Checks all vertices in geometry
- Uses `Set` for efficient selection tracking
- Updates only affected vertices

### Visual State
```javascript
// State variables
let circleSelectMode = false;        // C key toggles
let circleRadius = 50;               // Scroll adjusts (10-200)
let circleCenter = { x: 0, y: 0 };  // Mouse position
let circleModifyMode = null;         // null, 'build', or 'carve'

// Visual overlay
circleSelectOverlay.style.borderColor = {
  null: 'cyan',      // Selection mode
  'build': '#00ff00', // Build mode (green)
  'carve': '#ff0000'  // Carve mode (red)
}
```

---

## 🎯 vs. Box Select Comparison

| Feature | Box Select (B) | Circle Select (C) |
|---------|----------------|-------------------|
| **Shape** | Rectangle | Circle |
| **Selection** | Drag to define | Follows mouse |
| **Best For** | Large areas, architectural | Organic sculpting, detail |
| **Modification** | Explicit (+ or -) | Real-time (+ or -) |
| **Speed** | Single drag | Continuous brush |
| **Precision** | Edge-based | Radius-based |

**When to use each:**
- **Box Select:** Selecting floors, walls, large flat regions
- **Circle Select:** Sculpting characters, terrain, organic shapes

---

## 🚀 Advanced Tips

### Tip 1: Layer Building
**Stack multiple passes** for stronger effect:
```
C → + (green) → Move over area 3-4 times → Stronger build-up
```

### Tip 2: Smooth Blending
**Use overlapping circles** for smooth transitions:
```
C → Adjust to medium radius → Build/carve with overlapping strokes
```

### Tip 3: Fine Detail
**Tiny radius + single passes** for precise control:
```
C → Scroll to minimum (10px) → Build/carve in specific spots
```

### Tip 4: Terrain Workflow
**Large radius for base, small for detail:**
```
1. C → Large radius (150px) → Build major hills
2. Reduce to medium (75px) → Refine slopes
3. Reduce to small (20px) → Add rocks/details
```

### Tip 5: Rapid Iteration
**Quick toggle between modes:**
```
C → + → Build → - → Carve → + → Build (rapid fire)
```

---

## 🎬 Video Demo Script

**Title:** "Circle Select: Organic Sculpting Made Easy"

1. **Open PixelProdigy** → Show default cylinder
2. **Press C** → Circle appears, show console message
3. **Move mouse** → Circle follows, vertices highlight
4. **Scroll wheel** → Circle grows/shrinks, show radius values
5. **Press +** → Circle turns green, show "BUILD mode"
6. **Move slowly** → Geometry builds up in real-time
7. **Press -** → Circle turns red, show "CARVE mode"
8. **Move slowly** → Geometry carves away in real-time
9. **Alternate + and -** → Create complex surface detail
10. **Adjust radius** → Show different brush sizes
11. **Press C** → Disable, return to normal

**Key Message:** "Circle Select gives you a sculpting brush for organic, real-time modifications. Perfect for characters, terrain, and detail work!"

---

## 🔗 Integration with Dual-Window System

### Human Window (Manual Control)
Circle Select lives in **human_sculpt_window.html**:
- Manual precision control
- Radius adjustment with mouse wheel
- Real-time visual feedback
- Direct manipulation workflow

### AI Studio Window (Future)
AI can use circle select API:
- Programmatic radius control
- Automated brush strokes
- Pattern generation (scales, feathers)
- Symmetrical application

### Inter-Window Sync
```javascript
// Human modifies geometry with circle select
applyLayerModification(vertices, 0.1);
→ WebSocket broadcast: GEOMETRY_UPDATE
→ AI window receives update
→ AI can suggest next modifications
```

---

## 🎨 Future Enhancements

### Short-Term (Next 1-2 days)
- [ ] **Intensity slider** - Adjust +/- strength (0.01 to 1.0)
- [ ] **Falloff curve** - Stronger at center, weaker at edge
- [ ] **Pressure sensitivity** - Tablet support
- [ ] **Smooth mode** - Average nearby vertices

### Medium-Term (Next week)
- [ ] **Brush presets** - Save/load favorite settings
- [ ] **Symmetry mode** - Mirror modifications across axis
- [ ] **Noise mode** - Add organic detail
- [ ] **Pattern stamps** - Apply repeating patterns

### Long-Term (Month 2+)
- [ ] **AI-guided strokes** - AI suggests optimal brush paths
- [ ] **Style transfer** - Apply artistic styles within circle
- [ ] **Procedural detail** - Generate scales, skin, etc.
- [ ] **Depth-aware** - Only affect vertices at certain depth

---

## 📋 Keyboard Reference

| Key | Action |
|-----|--------|
| **C** | Toggle Circle Select Mode |
| **Mouse Move** | Move circle, select/modify vertices |
| **Scroll Up** | Increase radius (+5px) |
| **Scroll Down** | Decrease radius (-5px) |
| **+** or **=** | Toggle BUILD mode (green circle) |
| **-** or **_** | Toggle CARVE mode (red circle) |
| **Shift + Move** | Add to selection |
| **Ctrl + Move** | Remove from selection |

---

## 🐛 Troubleshooting

### Issue: Circle not visible
**Solution:** Press C to enable circle select mode first

### Issue: Circle too small/large
**Solution:** Use scroll wheel to adjust radius (10-200px range)

### Issue: Modifications not happening
**Solution:** Make sure you've pressed + (build) or - (carve) to enable modification mode

### Issue: Building/carving too strong
**Solution:** (Future) Use intensity slider to reduce strength. Currently fixed at 0.1 units.

### Issue: Selection not highlighting
**Solution:** Check console for errors. Ensure geometry has vertex colors enabled.

---

## 📖 Related Documents

- `SELECTION_WORKFLOW_GUIDE.md` - Box select and layer modification
- `BOX_SELECT_GUIDE.md` - Original box select implementation
- `DEPLOYMENT_STRATEGY.md` - Dual-window architecture plans
- `MODULAR_ARCHITECTURE.md` - Code structure for multi-app system

---

## ✅ Status

**Implementation:** ✅ COMPLETE  
**Testing:** 🔄 READY FOR USER TESTING  
**Documentation:** ✅ COMPLETE  
**Next Steps:** Add intensity slider and falloff curve  

---

**Try it now!**
```bash
npm start
# In browser: Press C → Move mouse → Scroll to resize → Press + or -
```

**Key Innovation:** Circle Select with real-time build/carve modes gives you a **sculpting brush** that works on vertex geometry. Perfect for organic modeling and terrain design! 🎨⭕
