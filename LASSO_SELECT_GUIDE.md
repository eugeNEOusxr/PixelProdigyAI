# 🎨 LASSO SELECT TOOL - Complete Guide

## 🎯 Overview

The Lasso Select tool is a **freehand polygon selection** system that lets you draw custom selection boundaries around any irregular shape. Perfect for selecting complex organic forms, specific details, or non-rectangular areas.

---

## 🎮 Basic Usage

### Activate Lasso Select
```
Press L → Lasso Select Mode ENABLED
```

**Visual Feedback:**
- Cursor changes to crosshair
- Canvas overlay activated for drawing
- Console shows: "🎨 Lasso Select mode: ENABLED"

### Draw Lasso Path
1. **Click** to place first point (green circle)
2. **Move mouse** to next location
3. **Click** to add points along the path
4. **Continue** adding points to outline your selection
5. **Complete** selection (see methods below)

### Complete Selection

**Method 1: Click Near Start**
- Click within 15 pixels of starting point (green circle)
- Path auto-closes and selects vertices

**Method 2: Press Enter**
- Press Enter key to complete with 3+ points
- Path closes and selects vertices

**Method 3: Double-Click**
- Double-click anywhere to complete
- Path closes at that point

### Cancel Selection
```
Press Escape → Cancels current lasso path
```

### Deactivate
```
Press L again → Lasso Select Mode DISABLED
```

---

## 🛠️ Selection Modes

### 1. Normal Selection (Replace)
**Default behavior** - Replaces previous selection
```
L → Click points → Complete → New selection
```

### 2. Add to Selection
**Hold Shift** when completing
```
L → Click points → Hold Shift → Complete → Adds to existing
```

### 3. Remove from Selection
**Hold Ctrl** when completing
```
L → Click points → Hold Ctrl → Complete → Removes from existing
```

---

## 📊 Complete Workflow Examples

### Example 1: Select Face on Character
```
1. Press L → Enable lasso
2. Click around left eye → 4-5 points
3. Click near start point → Auto-closes
4. Vertices inside turn cyan
5. Press + → Build up eye socket
6. Press L → Disable lasso
```

### Example 2: Complex Organic Shape
```
1. Rotate camera to good view angle
2. Press L → Enable lasso
3. Click around muscle group → 10-12 points for precision
4. Press Enter → Complete selection
5. Selected vertices turn cyan
6. Press - → Carve to add definition
7. Press L → Done
```

### Example 3: Multi-Region Selection
```
1. Press L → Enable lasso
2. Click around first region → Complete (near start)
3. Hold Shift, Press L → Add mode
4. Click around second region → Complete (near start)
5. Hold Shift, Press L → Add mode
6. Click around third region → Complete
7. All three regions selected (cyan)
8. Press + to modify all at once
```

### Example 4: Precision Detail Work
```
1. Press F → Flight mode
2. Use WASD to get close to detail
3. Press F → Exit flight
4. Press L → Lasso select
5. Click tight path around small detail (6-8 points)
6. Double-click to complete
7. Zoom in selected area turns cyan
8. Press + or - for micro-adjustments
```

---

## 🔧 Technical Details

### Point-in-Polygon Algorithm
Lasso uses ray-casting algorithm to test if vertices are inside polygon:

```javascript
function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
```

**How it works:**
1. Cast ray from test point to infinity
2. Count intersections with polygon edges
3. Odd number of intersections = inside
4. Even number = outside

### Screen Space Projection
Same projection as box/circle select:

```javascript
// Convert 3D vertex to 2D screen space
const projected = vertex.clone().project(camera);
const screenX = (projected.x * 0.5 + 0.5) * canvas.width;
const screenY = ((-projected.y * 0.5) + 0.5) * canvas.height;

// Test if inside lasso polygon
if (pointInPolygon(screenX, screenY, lassoPath)) {
  verticesInLasso.add(i);
}
```

### Visual Rendering
```javascript
// Dashed cyan line
lassoCtx.strokeStyle = '#00ffff';
lassoCtx.lineWidth = 2;
lassoCtx.setLineDash([5, 5]); // Dashed pattern

// Draw path points
lassoCtx.fillStyle = '#00ffff';
lassoPath.forEach(point => {
  lassoCtx.beginPath();
  lassoCtx.arc(point.x, point.y, 4, 0, Math.PI * 2);
  lassoCtx.fill();
});

// Larger green circle for start point
lassoCtx.fillStyle = '#00ff00';
lassoCtx.beginPath();
lassoCtx.arc(lassoPath[0].x, lassoPath[0].y, 6, 0, Math.PI * 2);
lassoCtx.fill();
```

---

## 🎯 vs. Other Selection Tools

| Feature | Box (B) | Circle (C) | Lasso (L) |
|---------|---------|------------|-----------|
| **Shape** | Rectangle | Circle | Freehand |
| **Best For** | Flat regions | Organic sculpting | Complex shapes |
| **Precision** | Edge-based | Radius-based | Custom boundary |
| **Speed** | Fast (one drag) | Fast (continuous) | Moderate (clicks) |
| **Complexity** | Simple | Simple | Flexible |
| **Use Case** | Walls, floors | Characters, terrain | Details, irregular |

**When to use Lasso:**
- Selecting specific facial features
- Isolating complex organic shapes
- Working around existing geometry
- Precise detail selection
- Non-rectangular areas

---

## 🚀 Advanced Tips

### Tip 1: Fewer Points = Faster
**Use 4-6 points** for simple shapes
```
L → Click 4 corners → Complete (fast selection)
```

### Tip 2: More Points = Precision
**Use 12-20 points** for complex curves
```
L → Click tight curve → Many points → Smooth boundary
```

### Tip 3: Combine with Camera
**Get right angle first**
```
1. Rotate view to best angle
2. Press L → Draw lasso from that view
3. Better accuracy when perpendicular
```

### Tip 4: Progressive Selection
**Build selection in stages**
```
1. L → Select rough area → Complete
2. Shift + L → Add refined area → Complete
3. Ctrl + L → Remove unwanted → Complete
4. Final precise selection
```

### Tip 5: Use with Flight Mode
**Get close for detail**
```
1. F → WASD to fly close
2. F → Exit flight
3. L → Draw tight lasso
4. Micro-detail selection
```

---

## 🎬 Video Demo Script

**Title:** "Lasso Select: Freehand Precision Selection"

1. **Open PixelProdigy** → Show default cylinder
2. **Press L** → Show "Lasso Select mode: ENABLED"
3. **Click first point** → Green circle appears
4. **Click around top** → Path grows with cyan dots
5. **Move near start** → Preview line shows closure
6. **Click near start** → Auto-closes, vertices turn cyan
7. **Show selection** → Top portion highlighted
8. **Press +** → Selected area builds up
9. **Press L again** → Draw new lasso
10. **Hold Shift** → Add to selection mode
11. **Draw second area** → Complete
12. **Both areas cyan** → Press - to carve
13. **Press L** → Disable, show final result

**Key Message:** "Lasso Select gives you freehand control for selecting exactly what you want. Perfect for organic shapes and complex details!"

---

## 🐛 Troubleshooting

### Issue: Can't complete lasso
**Solution:** Need at least 3 points. Click more points before completing.

### Issue: Lasso path not visible
**Solution:** Make sure you pressed L first. Check console for "Lasso Select mode: ENABLED".

### Issue: Selection too large/small
**Solution:** View angle matters. Rotate camera perpendicular to surface for best accuracy.

### Issue: Points not connecting
**Solution:** Click near the green start point (within 15 pixels) to auto-close, or press Enter.

### Issue: Wrong vertices selected
**Solution:** Lasso selects in 2D screen space. Rotate camera to avoid selecting through object.

---

## 🎨 Creative Workflows

### Workflow 1: Character Facial Features
```
Goal: Add eye sockets, nose, cheekbones

1. Rotate to front view
2. L → Lasso around left eye → Complete → Press -
3. L → Lasso around right eye → Complete → Press -
4. L → Lasso nose area → Complete → Press +
5. L → Lasso left cheek → Complete → Press +
6. L → Lasso right cheek → Complete → Press +
7. Result: Detailed facial structure
```

### Workflow 2: Terrain Details
```
Goal: Create rock formations on hillside

1. View terrain from side angle
2. L → Draw irregular rock shape → Complete
3. Press + (3-4 times) → Build up rock
4. L → Draw crack pattern → Complete
5. Press - (2 times) → Carve cracks
6. Repeat for multiple rocks
7. Result: Rocky hillside with detail
```

### Workflow 3: Armor Plates
```
Goal: Select and modify armor segments

1. Rotate to show armor plate clearly
2. L → Trace plate outline (10-15 points) → Complete
3. Press + → Build up plate thickness
4. Ctrl + L → Select edge to bevel
5. Press - → Carve bevel edge
6. Repeat for each plate
7. Result: Detailed armor with depth
```

---

## 🔗 Integration with Workflow

### Selection Tool Progression
**Typical workflow order:**
1. **Box Select (B)** → Rough area selection
2. **Circle Select (C)** → Refine and sculpt
3. **Lasso Select (L)** → Final precision details

### With Layer Modification
```
B → Select large area → + (build foundation)
↓
C → Sculpt organic shapes → + and - (form)
↓
L → Select details → + or - (refinement)
↓
Final detailed model
```

### With Dual-Window System (Future)
**Human Window:**
- L → Draw precise selection
- Visual confirmation

**AI Studio Window:**
- Receives selection boundary
- Applies procedural detail within lasso
- Returns modified geometry

---

## 📋 Keyboard Reference

| Key | Action |
|-----|--------|
| **L** | Toggle Lasso Select Mode |
| **Click** | Add point to lasso path |
| **Click near start** | Auto-close and complete |
| **Enter** | Complete selection (3+ points) |
| **Escape** | Cancel current lasso path |
| **Shift + Complete** | Add to existing selection |
| **Ctrl + Complete** | Remove from existing selection |
| **+** | Build up selected vertices |
| **-** | Carve selected vertices |

---

## 🎯 Best Practices

### DO:
✅ Get good camera angle before starting
✅ Use appropriate number of points (4-6 simple, 12-20 complex)
✅ Click methodically around boundary
✅ Test with fewer points first, add more if needed
✅ Combine with other selection tools

### DON'T:
❌ Rush through point placement
❌ Use from bad viewing angle
❌ Forget to complete selection
❌ Place too many points (slows down)
❌ Ignore the preview line

---

## 🌟 Pro Techniques

### Technique 1: Symmetrical Selection
```
1. L → Select left side feature
2. Complete and modify
3. Rotate camera 180°
4. L → Select matching right side
5. Apply same modifications
6. Mirror symmetry achieved
```

### Technique 2: Layered Detail
```
1. B → Box select large area
2. + → Build up base
3. L → Lasso inner detail
4. + → Build second layer
5. L → Lasso fine detail
6. + → Build third layer
7. Multi-level depth achieved
```

### Technique 3: Cutout Selection
```
1. B → Select whole region
2. Ctrl + L → Lasso unwanted part
3. Removes interior selection
4. Creates cutout/window effect
```

---

## 📖 Related Documents

- `SELECTION_WORKFLOW_GUIDE.md` - Box select and layer modification
- `CIRCLE_SELECT_GUIDE.md` - Circle select with build/carve
- `CIRCLE_SELECT_TESTING_GUIDE.md` - Testing procedures
- `MASTER_BUILD_PLAN.md` - Complete 20-feature roadmap

---

## ✅ Status

**Implementation:** ✅ COMPLETE  
**Testing:** 🔄 READY FOR USER TESTING  
**Documentation:** ✅ COMPLETE  
**Next Steps:** SEL-004 (Selection Utilities - Invert, Grow, Shrink)  

---

**Try it now!**
```bash
npm start
# In browser:
# 1. Press L
# 2. Click around a shape (4-10 points)
# 3. Click near the green start point
# 4. Watch vertices turn cyan!
# 5. Press + or - to modify
```

**Key Innovation:** Lasso Select gives you **freehand precision** for selecting exactly what you need. The point-in-polygon algorithm ensures accurate selection even with complex curved boundaries. Combined with Box and Circle select, you have a complete selection toolkit! 🎨✨
