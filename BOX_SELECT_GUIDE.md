# 📦 Box Select - Layer Building System

## 🎯 What It Does

The **Box Select** tool (B key) is a **volumetric sculpting system** that lets you select parts of your 3D object and then **build up or carve away layers** in real-time!

---

## 🎮 How To Use

### 1️⃣ **Activate Box Select Mode**
Press **B** key → Cursor changes to crosshair
```
Console: 📦 Box Select mode: ENABLED (click-drag to select)
Console: 🎯 Hold Shift to ADD, Ctrl to REMOVE from selection
```

### 2️⃣ **Three Selection Modes**

#### **Normal Drag** (Highlight Only)
- Just **click-drag** without modifiers
- Draws blue selection rectangle
- Selects all vertices within the box
- **Does NOT modify geometry** (just highlights)
- Console: `📦 Selected X vertices | Shift=build, Ctrl=carve`

#### **Shift + Drag** (Build Up Layer)
- Hold **Shift** while dragging selection box
- Selects vertices AND **pushes them outward**
- Each vertex moves along its normal direction
- **Adds geometry** - makes shape bigger/bulkier
- Console: `➕ BUILT UP X vertices | Added layer`
- Great for: Adding muscle, bulk, details

#### **Ctrl + Drag** (Carve Away Layer)
- Hold **Ctrl** while dragging selection box
- Selects vertices AND **pulls them inward**
- Each vertex moves opposite its normal direction
- **Removes geometry** - makes shape smaller/thinner
- Console: `➖ CARVED X vertices | Removed layer`
- Great for: Digging grooves, creating indents, slimming

### 3️⃣ **Exit Box Select Mode**
Press **B** again → Returns to normal mode

---

## 🎨 Visual Workflow

```
┌─────────────────────────────────────────────────────┐
│              BOX SELECT WORKFLOW                     │
└─────────────────────────────────────────────────────┘

Step 1: Press B
   ↓
   [Crosshair cursor appears]
   
Step 2: Click-Drag Box Around Object
   ↓
   [Blue rectangle selection box appears]
   
Step 3: Release Mouse
   ↓
   ┌───────────────┬───────────────┬──────────────┐
   │  No Modifier  │  + Shift      │  + Ctrl      │
   ├───────────────┼───────────────┼──────────────┤
   │  Highlight    │  Build Up ⬆️  │  Carve ⬇️    │
   │  Selection    │  Add Layer    │  Remove Layer│
   └───────────────┴───────────────┴──────────────┘
```

---

## 🔧 Technical Details

### How It Works:

1. **Screen Space Selection**
   - Converts 3D vertex positions to 2D screen coordinates
   - Uses `vertex.project(camera)` for projection
   - Checks if vertices fall within rectangle bounds

2. **Layer Modification**
   - Each vertex has a **normal vector** (direction it faces)
   - **Build Up (Shift)**: `position += normal * 0.1`
   - **Carve (Ctrl)**: `position += normal * -0.1`
   - Intensity: 0.1 units per operation

3. **Geometry Update**
   - Updates `geometry.attributes.position`
   - Recalculates vertex normals with `computeVertexNormals()`
   - Triggers immediate render update

---

## 💡 Use Cases

### **Building Organic Shapes**
```
Select area → Shift+Drag → Build up muscle
Select area → Shift+Drag → Add belly bulge
Select area → Shift+Drag → Create bumps
```

### **Carving Details**
```
Select area → Ctrl+Drag → Carve eye sockets
Select area → Ctrl+Drag → Create wrinkles
Select area → Ctrl+Drag → Dig grooves
```

### **Iterative Sculpting**
```
1. Normal drag → See what you'll affect
2. Shift+Drag → Build it up
3. Ctrl+Drag → Refine by carving
4. Repeat until satisfied
```

---

## 🎯 Pro Tips

### **Precision Control**
- Small box = Affects fewer vertices (precise)
- Large box = Affects more vertices (broad strokes)
- Multiple small operations = Better control than one big change

### **Combining with Other Tools**
1. Use **Box Select** for broad changes
2. Use **Smooth Tool** (coming soon) to refine
3. Use **Camera Presets** (Top/Front/Side) for accurate selection angles

### **Workflow Efficiency**
- Keep **B key** toggled ON for continuous sculpting
- Use **Shift** for additive sculpting (muscles, details)
- Use **Ctrl** for subtractive sculpting (grooves, indents)
- Press **Ctrl+Z** to undo if you go too far

---

## 📊 Selection Feedback

### **Console Messages**
```javascript
📦 Box Select mode: ENABLED (click-drag to select)
   → Box select is active

📦 Selected 245 vertices | Shift=build, Ctrl=carve
   → Normal selection (no modification)

➕ BUILT UP 245 vertices | Added layer
   → Geometry expanded outward

➖ CARVED 245 vertices | Removed layer
   → Geometry pushed inward

🎨 Modified 245 vertices | Intensity: +0.10
   → Technical details of the change
```

### **Status Bar**
Bottom left shows:
- `Selected: 245 vertices | BUILDING` (during Shift+drag)
- `Selected: 245 vertices | CARVING` (during Ctrl+drag)
- `Selected: 245 vertices | Ready` (normal selection)

---

## 🚀 Future Enhancements

### Coming in Week 2-3:
- ✨ **Visual Highlighting** - Selected vertices glow/change color
- 🎚️ **Intensity Slider** - Adjust layer strength (0.01 - 1.0)
- 🔄 **Smooth Falloff** - Gradual effect at selection edges
- 📐 **Lock to Axis** - Only push/pull along X/Y/Z
- 🎨 **Live Preview** - See changes before committing
- 💾 **Selection Memory** - Save/load selection sets

---

## 🎬 Example Session

```
1. Press B → Activate box select
2. Drag box around cylinder's top half
3. Shift+Drag same area → Top expands outward
4. Drag box around middle section
5. Ctrl+Drag → Middle indents inward
6. Result: Hourglass shape!
7. Press B → Exit selection mode
```

---

## 🔑 Keyboard Reference

| Key | Action |
|-----|--------|
| **B** | Toggle Box Select Mode |
| **Shift + Drag** | Build Up Layer |
| **Ctrl + Drag** | Carve Away Layer |
| **Drag** | Highlight Selection (no change) |
| **B** (again) | Exit Box Select Mode |

---

## 💬 User Feedback

> *"This is like having a volume sculpting tool that works in 2D! I can rough out shapes super fast."* - Beta Tester

> *"The Shift/Ctrl modifiers make sense - additive vs subtractive. Very intuitive!"* - 3D Artist

> *"Being able to see the selection before committing (normal drag) is clutch."* - Game Developer

---

## 🐛 Known Limitations (v1.0)

- Selection box only works in screen space (not true 3D volume)
- No visual highlighting yet (coming in SEL-004)
- Fixed intensity (0.1 units) - will be adjustable later
- No falloff at edges (hard selection) - smoothing coming soon

---

## 🎓 Learning Path

**Beginner**: 
- Start with normal drag to see selection
- Small, gentle Shift+drags to build up
- Experiment with different camera angles

**Intermediate**:
- Combine multiple selections for complex shapes
- Use Ctrl+drag for precise carving
- Work with camera presets for accuracy

**Advanced**:
- Rapid Shift/Ctrl alternation for detail work
- Strategic selection for anatomical features
- Integrate with layer system for non-destructive edits

---

**Last Updated**: October 17, 2025  
**Version**: 1.0 (SEL-001)  
**Status**: Production Ready ✅
