# 🧪 CIRCLE SELECT - Quick Testing Guide

## ⚡ 2-Minute Test

Want to try the cyan highlighting with modifications? Follow these steps:

### Test 1: Basic Selection (30 seconds)
```
1. Open app in browser (npm start if needed)
2. Press C key
3. Console shows: "⭕ Circle Select mode: ENABLED"
4. Move mouse around → Circle follows cursor
5. Watch vertices turn CYAN inside the circle
6. Scroll mouse wheel up → Circle gets BIGGER
7. Scroll mouse wheel down → Circle gets SMALLER
8. Console shows radius changes
```

**Expected:** You see a cyan circle that follows your mouse, and vertices inside turn cyan (highlighted).

---

### Test 2: Build Mode (30 seconds)
```
1. Press C (if not already in circle mode)
2. Press + key (or = key)
3. Console shows: "🟢 Circle BUILD mode: ACTIVE"
4. Circle border turns GREEN
5. Move mouse slowly over cylinder
6. Watch geometry BUILD UP as you move
7. Move in circles → Creates raised bumps
8. Press + again → Toggles off (back to cyan)
```

**Expected:** Green circle that builds up geometry in real-time as you move the mouse. Like a sculpting brush adding clay!

---

### Test 3: Carve Mode (30 seconds)
```
1. Press C (if not already in circle mode)
2. Press - key (or _ key)
3. Console shows: "🔴 Circle CARVE mode: ACTIVE"
4. Circle border turns RED
5. Move mouse slowly over cylinder
6. Watch geometry CARVE AWAY as you move
7. Move in lines → Creates carved grooves
8. Press - again → Toggles off (back to cyan)
```

**Expected:** Red circle that carves away geometry in real-time. Like a sculpting tool removing clay!

---

### Test 4: Combo Sculpting (30 seconds)
```
1. Press C
2. Adjust radius to medium (scroll to ~75px)
3. Press + → Green circle
4. Move over top of cylinder → Builds up
5. Press - → Red circle (switches mode)
6. Move over side of cylinder → Carves in
7. Press + → Green again
8. Move over bottom → Builds up
9. Admire your sculpted geometry!
```

**Expected:** You can rapidly switch between build and carve modes to create complex shapes. The cyan highlighting shows affected vertices.

---

## 🎨 What You Should See

### Visual Feedback Checklist
- ✅ **Cyan circle** follows mouse cursor
- ✅ **Vertices turn cyan** when inside circle (highlighted)
- ✅ **Green circle** when in build mode (+ key)
- ✅ **Red circle** when in carve mode (- key)
- ✅ **Console messages** showing mode changes
- ✅ **Real-time geometry changes** as you move

### Color Guide
| Color | Meaning |
|-------|---------|
| **Cyan circle** | Selection mode (just highlighting) |
| **Green circle** | Build mode (adding geometry) |
| **Red circle** | Carve mode (removing geometry) |
| **Cyan vertices** | Currently selected/affected vertices |

---

## 🔧 Modifier Keys

While in circle select mode (C):

### Shift + Move Mouse
**Add to existing selection** (doesn't replace)
```
1. Press C
2. Move mouse → Select area A (cyan)
3. Hold Shift
4. Move to new area B → Both A and B are cyan now
5. Release Shift
```

### Ctrl + Move Mouse
**Remove from existing selection**
```
1. Press C
2. Move mouse → Select large area (cyan)
3. Hold Ctrl
4. Move over portion → Removes that portion
5. Release Ctrl
```

---

## 🎯 Radius Control

### Grow Radius
**Scroll UP** (wheel away from you)
- Circle gets bigger
- Console shows: "⭕ Circle radius: XXpx"
- Range: 10px to 200px
- Increment: +5px per scroll

### Shrink Radius
**Scroll DOWN** (wheel toward you)
- Circle gets smaller
- Console shows new radius
- Minimum: 10px
- Decrement: -5px per scroll

---

## 🚀 Advanced Test: Create a Face

**Time:** 2 minutes

```
1. Start with default cylinder
2. Press C → Circle select mode
3. Scroll to medium radius (~60px)

4. CREATE EYE SOCKETS (Carve)
   - Press - (red circle, carve mode)
   - Move over left side → Carve eye socket
   - Move over right side → Carve other eye socket
   - Press - to toggle off

5. CREATE NOSE (Build)
   - Press + (green circle, build mode)
   - Move over center → Build up nose bridge
   - Press + to toggle off

6. CREATE CHEEKBONES (Build)
   - Scroll to larger radius (~90px)
   - Press + (green circle)
   - Move over left cheek → Build up
   - Move over right cheek → Build up
   - Press + to toggle off

7. CREATE MOUTH (Carve)
   - Scroll to smaller radius (~40px)
   - Press - (red circle)
   - Move horizontal line → Carve mouth
   - Press - to toggle off

8. ADMIRE YOUR CREATION
   - Press C to disable circle select
   - Press F for flight mode
   - Use WASD to fly around and view your sculpted face!
```

---

## 📊 Console Output Examples

When working, you should see messages like:

```
⭕ Circle Select mode: ENABLED
🎯 Move mouse to select | Scroll to change radius | Hold Shift=ADD, Ctrl=REMOVE
💡 Press + to BUILD, - to CARVE within circle

⭕ Circle radius: 55px
⭕ Circle radius: 60px
⭕ Circle radius: 65px

🟢 Circle BUILD mode: ACTIVE
🟢 Circle BUILD mode: OFF

🔴 Circle CARVE mode: ACTIVE
🔴 Circle CARVE mode: OFF

⭕ Circle Select mode: DISABLED
```

---

## ❓ FAQ

**Q: I don't see the circle**
A: Make sure you pressed C key. Check console for "Circle Select mode: ENABLED"

**Q: Vertices aren't turning cyan**
A: Make sure you're moving the mouse inside the canvas area. Check that vertex colors are enabled (should be automatic).

**Q: Circle is too small/big**
A: Use scroll wheel to adjust. Range is 10-200px.

**Q: + and - keys don't work**
A: Make sure circle select is enabled first (press C). Check console for mode activation messages.

**Q: Modifications are too strong**
A: Currently fixed at 0.1 units per pass. Move mouse slowly for subtler changes. Intensity slider coming soon!

**Q: Can I undo?**
A: Full undo system is planned. For now, you can reload the page to reset geometry.

---

## 🎬 What to Expect

### Performance
- **Smooth on < 50k vertices:** Real-time with no lag
- **Slight lag on 50k-200k vertices:** Still usable but may stutter
- **Optimization needed for > 200k:** Future enhancement

### Visual Quality
- **Cyan highlighting:** Very visible, easy to see selection
- **Green/Red modes:** Clear indication of build/carve state
- **Real-time updates:** Geometry changes as you move

### Workflow Feel
- **Organic sculpting:** Feels like painting with clay
- **Rapid iteration:** Quick toggle between build/carve
- **Intuitive controls:** Circle follows mouse naturally

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Circle appears and follows mouse
2. ✅ Vertices turn cyan inside circle
3. ✅ Scroll wheel changes circle size
4. ✅ + key makes circle green
5. ✅ Moving with green circle builds up geometry
6. ✅ - key makes circle red
7. ✅ Moving with red circle carves geometry
8. ✅ Console shows all mode changes

---

## 🎉 Try It Now!

```bash
# If not already running:
cd /home/jeremy/PixelProdigyAI
npm start

# In browser:
# 1. Press C
# 2. Press + (green circle)
# 3. Move mouse around cylinder
# 4. Watch it build up!
# 5. Press - (red circle)
# 6. Watch it carve away!
```

**Happy sculpting! 🎨⭕**

---

**Pro Tip:** Try creating terrain by using a large radius (150px) in build mode, moving in circular motions to create hills, then switching to carve mode to add valleys and craters. It's incredibly satisfying! 🏔️
