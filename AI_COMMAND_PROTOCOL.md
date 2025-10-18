# 🤖 AI Instruction Engine - Command Protocol for PixelProdigy3D

## 📋 Overview
This document provides a structured command system for AI-guided incremental development. Each command is atomic, testable, and builds upon previous work. The AI should follow this protocol to ensure microscopic detailing and perfect directional builds.

---

## 🎯 INSTRUCTION ENGINE PRINCIPLES

### Core Rules:
1. **Atomic Changes**: Each instruction modifies ONE feature/function
2. **Test-Driven**: Every change must be testable
3. **Incremental**: Build complexity gradually
4. **Reversible**: All changes support undo via git/version control
5. **Documented**: Each instruction includes "Why" and "What" sections

### Command Structure:
```
COMMAND: [Unique ID] - [Brief Description]
PRIORITY: [Critical|High|Medium|Low]
DEPENDS_ON: [Previous Command IDs]
ESTIMATED_TIME: [Minutes]
FILES_MODIFIED: [List of files]

OBJECTIVE:
Clear statement of what this command achieves

IMPLEMENTATION:
Step-by-step instructions with code snippets

VERIFICATION:
How to test that this command succeeded

ROLLBACK:
How to undo if something goes wrong
```

---

## 📦 PHASE 1: ENVIRONMENT CONTROLS COMPLETION

### ENV-001: Wire Fog Density Slider
**PRIORITY**: High  
**DEPENDS_ON**: None  
**ESTIMATED_TIME**: 15 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Connect the fogDensity slider to THREE.js scene fog system with linear and exponential fog support.

**IMPLEMENTATION**:
```javascript
// Step 1: Find the fog density event listener section (around line 1150)
// Step 2: Add fog application function

function applyFog() {
  const density = state.fogDensity;
  const fogColor = scene.background;
  
  if (density <= 0.001) {
    scene.fog = null;
    updateStatus('Fog disabled');
  } else if (density < 0.05) {
    // Linear fog for light fog
    scene.fog = new THREE.Fog(fogColor, 20, 100);
    updateStatus(`Linear fog: ${density.toFixed(3)}`);
  } else {
    // Exponential fog for heavy fog
    scene.fog = new THREE.FogExp2(fogColor, density);
    updateStatus(`Exponential fog: ${density.toFixed(3)}`);
  }
}

// Step 3: Wire to existing event listener
document.getElementById('fogDensity').addEventListener('input', (e) => {
  state.fogDensity = parseFloat(e.target.value);
  applyFog();
  logAIIteration('fogChange', { density: state.fogDensity });
});

// Step 4: Call applyFog() when theme changes to sync fog color
```

**VERIFICATION**:
1. Open browser console
2. Adjust fog density slider from 0 to 0.1
3. Verify fog appears and intensifies
4. Check console for "Linear fog" message when < 0.05
5. Check console for "Exponential fog" message when >= 0.05
6. Change theme and verify fog color updates

**ROLLBACK**:
```javascript
// Remove applyFog() function and event listener modifications
scene.fog = null;
```

---

### ENV-002: Add Fog Preset Buttons
**PRIORITY**: Medium  
**DEPENDS_ON**: ENV-001  
**ESTIMATED_TIME**: 10 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Create quick-access fog preset buttons (None, Light, Medium, Heavy) for instant fog configuration.

**IMPLEMENTATION**:
```html
<!-- Step 1: Add HTML buttons in right panel environment section (around line 750) -->
<div class="control-row">
  <label>Fog Presets</label>
  <div style="display: flex; gap: 4px;">
    <button style="flex: 1; padding: 4px; background: #1e3a8a; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyFogPreset('none')">None</button>
    <button style="flex: 1; padding: 4px; background: #1e3a8a; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyFogPreset('light')">Light</button>
    <button style="flex: 1; padding: 4px; background: #1e3a8a; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyFogPreset('medium')">Medium</button>
    <button style="flex: 1; padding: 4px; background: #1e3a8a; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyFogPreset('heavy')">Heavy</button>
  </div>
</div>
```

```javascript
// Step 2: Add preset function in JavaScript section
window.applyFogPreset = (preset) => {
  const presets = {
    none: 0,
    light: 0.02,
    medium: 0.05,
    heavy: 0.1
  };
  
  state.fogDensity = presets[preset];
  document.getElementById('fogDensity').value = state.fogDensity;
  applyFog();
  updateStatus(`Fog preset: ${preset}`);
  logAIIteration('fogPreset', { preset });
};
```

**VERIFICATION**:
1. Click each preset button
2. Verify fog density slider updates
3. Verify fog appears correctly for each preset
4. Check status bar shows "Fog preset: [name]"

**ROLLBACK**:
Remove HTML buttons and `applyFogPreset` function.

---

### ENV-003: Dynamic Ground Plane Size
**PRIORITY**: High  
**DEPENDS_ON**: None  
**ESTIMATED_TIME**: 20 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Make ground plane size dynamically adjustable by recreating mesh geometry when groundPlaneSize input changes.

**IMPLEMENTATION**:
```javascript
// Step 1: Store ground mesh reference globally (add near line 860)
let groundMesh = null;

// Step 2: Modify existing ground creation code (around line 865)
function createGroundPlane(size) {
  // Remove old ground if exists
  if (groundMesh) {
    scene.remove(groundMesh);
    groundMesh.geometry.dispose();
    groundMesh.material.dispose();
  }
  
  const groundGeometry = new THREE.CylinderGeometry(size, size, 0.4, 48);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x101a24, 
    roughness: 0.95 
  });
  
  groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.position.y = -2.2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
  
  updateStatus(`Ground plane: ${size} units`);
  logAIIteration('groundSizeChange', { size });
}

// Step 3: Initial creation
createGroundPlane(30);

// Step 4: Wire to input event listener (find existing listener around line 1100)
document.getElementById('groundPlaneSize').addEventListener('input', (e) => {
  state.groundPlaneSize = parseFloat(e.target.value);
  createGroundPlane(state.groundPlaneSize);
});
```

**VERIFICATION**:
1. Change ground plane size from 30 to 50 to 100
2. Verify ground mesh resizes in viewport
3. Check no memory leaks (old mesh disposed)
4. Verify shadow still works
5. Check status bar updates

**ROLLBACK**:
```javascript
createGroundPlane(30); // Reset to default
```

---

### ENV-004: Ground Material Presets
**PRIORITY**: Medium  
**DEPENDS_ON**: ENV-003  
**ESTIMATED_TIME**: 25 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Add 5 ground material presets (Grass, Concrete, Sand, Water, Metal) with distinct PBR properties.

**IMPLEMENTATION**:
```html
<!-- Step 1: Add HTML buttons in environment section -->
<div class="control-row">
  <label>Ground Material</label>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
    <button style="padding: 6px; background: #2d5016; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyGroundMaterial('grass')">🌿 Grass</button>
    <button style="padding: 6px; background: #555555; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyGroundMaterial('concrete')">🏗️ Concrete</button>
    <button style="padding: 6px; background: #c2a569; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyGroundMaterial('sand')">🏖️ Sand</button>
    <button style="padding: 6px; background: #1e90ff; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyGroundMaterial('water')">💧 Water</button>
    <button style="padding: 6px; background: #888888; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="applyGroundMaterial('metal')">⚙️ Metal</button>
  </div>
</div>
```

```javascript
// Step 2: Add material preset function
window.applyGroundMaterial = (materialType) => {
  if (!groundMesh) return;
  
  const materials = {
    grass: {
      color: 0x2d5016,
      roughness: 0.95,
      metalness: 0.0,
      name: 'Grass'
    },
    concrete: {
      color: 0x555555,
      roughness: 0.8,
      metalness: 0.0,
      name: 'Concrete'
    },
    sand: {
      color: 0xc2a569,
      roughness: 0.9,
      metalness: 0.0,
      name: 'Sand'
    },
    water: {
      color: 0x1e90ff,
      roughness: 0.1,
      metalness: 0.3,
      name: 'Water'
    },
    metal: {
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.9,
      name: 'Metal'
    }
  };
  
  const preset = materials[materialType];
  if (preset) {
    groundMesh.material.color.setHex(preset.color);
    groundMesh.material.roughness = preset.roughness;
    groundMesh.material.metalness = preset.metalness;
    groundMesh.material.needsUpdate = true;
    
    updateStatus(`Ground: ${preset.name}`);
    logAIIteration('groundMaterial', { type: materialType });
  }
};
```

**VERIFICATION**:
1. Click each material preset button
2. Verify ground color changes
3. Verify lighting interaction changes (especially water vs grass)
4. Check metallic reflection on Metal preset
5. Verify status bar shows material name

**ROLLBACK**:
```javascript
applyGroundMaterial('grass'); // Reset to default
```

---

### ENV-005: Camera Position Presets
**PRIORITY**: High  
**DEPENDS_ON**: None  
**ESTIMATED_TIME**: 30 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Add 4 camera preset buttons with smooth lerp transitions (Top, Front, Side, Isometric views).

**IMPLEMENTATION**:
```html
<!-- Step 1: Add HTML buttons in environment section -->
<div class="control-row">
  <label>Camera Presets</label>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;">
    <button style="padding: 6px; background: #2563eb; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="setCameraPreset('top')">⬆️ Top</button>
    <button style="padding: 6px; background: #2563eb; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="setCameraPreset('front')">⬅️ Front</button>
    <button style="padding: 6px; background: #2563eb; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="setCameraPreset('side')">↗️ Side</button>
    <button style="padding: 6px; background: #2563eb; border: none; color: #fff; border-radius: 3px; cursor: pointer; font-size: 10px;" onclick="setCameraPreset('iso')">📐 Iso</button>
  </div>
</div>
```

```javascript
// Step 2: Add camera transition system
let cameraAnimating = false;
let cameraAnimationProgress = 0;
let cameraAnimationStart = new THREE.Vector3();
let cameraAnimationEnd = new THREE.Vector3();
const CAMERA_ANIMATION_FRAMES = 60; // 1 second at 60fps

window.setCameraPreset = (preset) => {
  const presets = {
    top: { position: new THREE.Vector3(0, 10, 0), name: 'Top View' },
    front: { position: new THREE.Vector3(0, 0, 10), name: 'Front View' },
    side: { position: new THREE.Vector3(10, 0, 0), name: 'Side View' },
    iso: { position: new THREE.Vector3(7, 7, 7), name: 'Isometric View' }
  };
  
  const target = presets[preset];
  if (!target) return;
  
  // Start animation
  cameraAnimationStart.copy(camera.position);
  cameraAnimationEnd.copy(target.position);
  cameraAnimationProgress = 0;
  cameraAnimating = true;
  
  updateStatus(`Moving to ${target.name}...`);
  logAIIteration('cameraPreset', { preset });
};

// Step 3: Add to animate loop (find animate() function around line 2650)
// Add this inside animate() before renderer.render():
function updateCameraAnimation() {
  if (cameraAnimating) {
    cameraAnimationProgress++;
    const t = cameraAnimationProgress / CAMERA_ANIMATION_FRAMES;
    
    // Smooth ease-in-out interpolation
    const smoothT = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    camera.position.lerpVectors(cameraAnimationStart, cameraAnimationEnd, smoothT);
    camera.lookAt(0, 0, 0); // Look at origin
    
    if (cameraAnimationProgress >= CAMERA_ANIMATION_FRAMES) {
      cameraAnimating = false;
      updateStatus('Camera preset applied');
    }
  }
}

// Call in animate loop
updateCameraAnimation();
```

**VERIFICATION**:
1. Click Top preset - camera should smoothly move to (0, 10, 0)
2. Click Front preset - smooth transition to (0, 0, 10)
3. Click Side preset - smooth transition to (10, 0, 0)
4. Click Isometric - smooth transition to (7, 7, 7)
5. Verify 1-second duration for all transitions
6. Verify camera always looks at origin
7. Test rapid clicking (should start new animation)

**ROLLBACK**:
```javascript
cameraAnimating = false;
camera.position.set(5, 4, 7); // Reset to default
```

---

### ENV-006: Wire Camera Orbit Speed
**PRIORITY**: Low  
**DEPENDS_ON**: None  
**ESTIMATED_TIME**: 5 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Connect cameraOrbitSpeed slider to OrbitControls.rotateSpeed for adjustable rotation sensitivity.

**IMPLEMENTATION**:
```javascript
// Find the existing event listener for cameraOrbitSpeed (around line 1120)
// Modify or add:
document.getElementById('cameraOrbitSpeed').addEventListener('input', (e) => {
  state.cameraOrbitSpeed = parseFloat(e.target.value);
  controls.rotateSpeed = state.cameraOrbitSpeed;
  updateStatus(`Orbit speed: ${state.cameraOrbitSpeed.toFixed(1)}x`);
  logAIIteration('orbitSpeedChange', { speed: state.cameraOrbitSpeed });
});

// Also set initial value after controls creation (around line 855)
controls.rotateSpeed = state.cameraOrbitSpeed;
```

**VERIFICATION**:
1. Set orbit speed to 0.1 - verify slow rotation
2. Set orbit speed to 2.0 - verify fast rotation
3. Drag to rotate camera and feel difference
4. Check status bar updates

**ROLLBACK**:
```javascript
controls.rotateSpeed = 1.0; // Reset to default
```

---

## 📦 PHASE 2: WASD CAMERA FLIGHT SYSTEM

### CAM-001: Implement Key Tracking
**PRIORITY**: Critical  
**DEPENDS_ON**: None  
**ESTIMATED_TIME**: 10 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Create keyboard input tracking system for WASD+QE keys with Shift/Ctrl modifiers.

**IMPLEMENTATION**:
```javascript
// Step 1: Add global state near camera setup (around line 850)
const keyState = {
  w: false, a: false, s: false, d: false,
  q: false, e: false,
  shift: false, ctrl: false
};
let flyMode = false;

// Step 2: Add key event listeners (add before animate loop, around line 2100)
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key in keyState) {
    keyState[key] = true;
  }
  if (key === 'shift') keyState.shift = true;
  if (key === 'control') keyState.ctrl = true;
  
  // Toggle fly mode
  if (key === 'f' && !e.ctrlKey && !e.shiftKey) {
    flyMode = !flyMode;
    controls.enabled = !flyMode;
    updateStatus(`${flyMode ? 'Fly' : 'Orbit'} mode active`);
    logAIIteration('flightModeToggle', { flyMode });
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key in keyState) {
    keyState[key] = false;
  }
  if (key === 'shift') keyState.shift = false;
  if (key === 'control') keyState.ctrl = false;
});
```

**VERIFICATION**:
1. Open browser console
2. Type: `console.log(keyState)` and press W/A/S/D keys
3. Verify keyState object updates correctly
4. Press F key and verify "Fly mode active" message
5. Press F again and verify "Orbit mode active"

**ROLLBACK**:
```javascript
// Remove event listeners
flyMode = false;
controls.enabled = true;
```

---

### CAM-002: Implement Camera Movement
**PRIORITY**: Critical  
**DEPENDS_ON**: CAM-001  
**ESTIMATED_TIME**: 20 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Update camera position each frame based on quaternion direction and WASD input with speed modifiers.

**IMPLEMENTATION**:
```javascript
// Step 1: Add movement function (before animate loop)
function updateCameraMovement() {
  if (!flyMode) return;
  
  // Calculate speed with modifiers
  const baseSpeed = 0.1;
  let speed = baseSpeed;
  if (keyState.shift) speed *= 3;    // 3x faster
  if (keyState.ctrl) speed *= 0.25;  // 0.25x slower (precision)
  
  // Get camera forward and right vectors
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  
  // Apply movement
  if (keyState.w) camera.position.addScaledVector(forward, speed);
  if (keyState.s) camera.position.addScaledVector(forward, -speed);
  if (keyState.d) camera.position.addScaledVector(right, speed);
  if (keyState.a) camera.position.addScaledVector(right, -speed);
  if (keyState.e) camera.position.y += speed;
  if (keyState.q) camera.position.y -= speed;
}

// Step 2: Call in animate loop (add at start of animate function)
function animate() {
  requestAnimationFrame(animate);
  
  updateCameraMovement(); // Add this line
  updateCameraAnimation();
  
  controls.update();
  updateAxisArrows();
  // ... rest of animate function
}
```

**VERIFICATION**:
1. Press F to enter fly mode
2. Press W - camera moves forward
3. Press S - camera moves backward
4. Press A - camera strafes left
5. Press D - camera strafes right
6. Press Q - camera moves down
7. Press E - camera moves up
8. Hold Shift+W - verify 3x speed
9. Hold Ctrl+W - verify slow precision movement
10. Press F to exit fly mode - OrbitControls should work again

**ROLLBACK**:
```javascript
// Remove updateCameraMovement() call from animate loop
flyMode = false;
controls.enabled = true;
```

---

### CAM-003: Add Flight Speed Indicator
**PRIORITY**: Low  
**DEPENDS_ON**: CAM-002  
**ESTIMATED_TIME**: 10 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Display current flight speed and mode in viewport overlay.

**IMPLEMENTATION**:
```javascript
// Step 1: Add HTML element to viewport overlay (around line 630)
// Add this line inside viewportOverlay div:
<div id="flightModeIndicator" style="color: #7dd3fc; font-weight: bold; display: none;">
  🛫 Fly Mode - Speed: <span id="flightSpeed">1.0x</span>
</div>

// Step 2: Update indicator in updateCameraMovement function
function updateCameraMovement() {
  if (!flyMode) {
    document.getElementById('flightModeIndicator').style.display = 'none';
    return;
  }
  
  // Show indicator
  document.getElementById('flightModeIndicator').style.display = 'block';
  
  // Calculate speed with modifiers
  const baseSpeed = 0.1;
  let speedMultiplier = 1.0;
  if (keyState.shift) speedMultiplier = 3.0;
  if (keyState.ctrl) speedMultiplier = 0.25;
  
  // Update speed display
  document.getElementById('flightSpeed').textContent = speedMultiplier.toFixed(2) + 'x';
  
  let speed = baseSpeed * speedMultiplier;
  
  // ... rest of movement code
}
```

**VERIFICATION**:
1. Press F - verify "🛫 Fly Mode - Speed: 1.00x" appears
2. Hold Shift - verify "Speed: 3.00x"
3. Hold Ctrl - verify "Speed: 0.25x"
4. Press F to exit - verify indicator disappears

**ROLLBACK**:
Remove HTML element and indicator update code.

---

## 📦 PHASE 3: SELECTION TOOLS

### SEL-001: Box Select Foundation
**PRIORITY**: High  
**DEPENDS_ON**: None  
**ESTIMATED_TIME**: 25 minutes  
**FILES_MODIFIED**: `pixelprodigy3d.html`

**OBJECTIVE**:
Implement box selection: B key activates, draw rectangle, select vertices within bounds.

**IMPLEMENTATION**:
```javascript
// Step 1: Add selection state (near line 900)
let isBoxSelecting = false;
let boxSelectStart = new THREE.Vector2();
let boxSelectEnd = new THREE.Vector2();
const selectedVertices = new Set();

// Step 2: Add box selection canvas overlay (in HTML, after canvas3d)
<canvas id="selectionCanvas" style="position: absolute; top: 0; left: 0; pointer-events: none; z-index: 100;"></canvas>

// Step 3: Setup selection canvas (after canvas setup)
const selectionCanvas = document.getElementById('selectionCanvas');
const selectionCtx = selectionCanvas.getContext('2d');
function resizeSelectionCanvas() {
  selectionCanvas.width = canvas.width;
  selectionCanvas.height = canvas.height;
}
resizeSelectionCanvas();
window.addEventListener('resize', resizeSelectionCanvas);

// Step 4: Add B key handler in existing keydown listener
if (key === 'b') {
  isBoxSelecting = !isBoxSelecting;
  canvas.style.cursor = isBoxSelecting ? 'crosshair' : 'default';
  updateStatus(isBoxSelecting ? 'Box select active' : 'Box select off');
}

// Step 5: Add mouse handlers for box selection
canvas.addEventListener('mousedown', (e) => {
  if (isBoxSelecting && e.button === 0) {
    boxSelectStart.set(e.offsetX, e.offsetY);
    boxSelectEnd.copy(boxSelectStart);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isBoxSelecting) {
    boxSelectEnd.set(e.offsetX, e.offsetY);
    drawSelectionBox();
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (isBoxSelecting && e.button === 0) {
    performBoxSelect(e.shiftKey, e.ctrlKey);
    clearSelectionBox();
  }
});

// Step 6: Draw selection box
function drawSelectionBox() {
  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
  selectionCtx.strokeStyle = '#3b82f6';
  selectionCtx.lineWidth = 2;
  selectionCtx.setLineDash([5, 5]);
  
  const x = Math.min(boxSelectStart.x, boxSelectEnd.x);
  const y = Math.min(boxSelectStart.y, boxSelectEnd.y);
  const w = Math.abs(boxSelectEnd.x - boxSelectStart.x);
  const h = Math.abs(boxSelectEnd.y - boxSelectStart.y);
  
  selectionCtx.strokeRect(x, y, w, h);
  selectionCtx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  selectionCtx.fillRect(x, y, w, h);
}

function clearSelectionBox() {
  selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
}

// Step 7: Perform selection
function performBoxSelect(addMode, removeMode) {
  const minX = Math.min(boxSelectStart.x, boxSelectEnd.x);
  const maxX = Math.max(boxSelectStart.x, boxSelectEnd.x);
  const minY = Math.min(boxSelectStart.y, boxSelectEnd.y);
  const maxY = Math.max(boxSelectStart.y, boxSelectEnd.y);
  
  if (!addMode && !removeMode) {
    selectedVertices.clear();
  }
  
  const posAttr = sculptGeometry.attributes.position;
  const vertex = new THREE.Vector3();
  
  for (let i = 0; i < vertexCount; i++) {
    vertex.set(
      posAttr.array[i * 3],
      posAttr.array[i * 3 + 1],
      posAttr.array[i * 3 + 2]
    );
    
    vertex.applyMatrix4(sculptMesh.matrixWorld);
    vertex.project(camera);
    
    const screenX = (vertex.x * 0.5 + 0.5) * canvas.width;
    const screenY = (1 - (vertex.y * 0.5 + 0.5)) * canvas.height;
    
    if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
      if (removeMode) {
        selectedVertices.delete(i);
      } else {
        selectedVertices.add(i);
      }
    }
  }
  
  updateStatus(`Selected: ${selectedVertices.size} vertices`);
  logAIIteration('boxSelect', { count: selectedVertices.size, addMode, removeMode });
}
```

**VERIFICATION**:
1. Press B key - cursor becomes crosshair
2. Click and drag - blue rectangle appears
3. Release - vertices in rectangle are selected
4. Verify status shows "Selected: X vertices"
5. Hold Shift and box select - adds to selection
6. Hold Ctrl and box select - removes from selection
7. Press B again to deactivate

**ROLLBACK**:
```javascript
isBoxSelecting = false;
selectedVertices.clear();
canvas.style.cursor = 'default';
```

---

## 🎯 AI PROMPTING PROTOCOL

### How AI Should Use This Document:

**1. Request Clarification**:
```
AI: "I'm about to implement ENV-001 (Wire Fog Density Slider). 
     This will modify pixelprodigy3d.html and take approximately 15 minutes.
     The change will connect the fog slider to THREE.js fog system.
     Should I proceed?"
```

**2. Report Progress**:
```
AI: "Step 1/4 complete: Added applyFog() function
     Step 2/4 complete: Wired event listener
     Step 3/4 complete: Connected to theme system
     Step 4/4 complete: Testing fog application
     
     ENV-001 COMPLETED ✅
     Verification: All 6 tests passed
     Ready for next command."
```

**3. Request Testing**:
```
AI: "ENV-001 implementation complete. Please verify:
     1. Adjust fog density slider (0 to 0.1)
     2. Check console for fog messages
     3. Change theme and verify fog color updates
     
     Reply with TEST PASSED or describe any issues."
```

**4. Handle Errors**:
```
AI: "ERROR during ENV-001, Step 2:
     Issue: event listener not found
     Cause: fogDensity element ID mismatch
     Fix: Changed 'fogDensity' to 'fog-density'
     
     Retrying Step 2..."
```

**5. Request Next Command**:
```
AI: "ENV-001 ✅ COMPLETE
     Dependencies satisfied for: ENV-002
     
     Available next commands:
     - ENV-002: Add Fog Preset Buttons [10 min]
     - ENV-003: Dynamic Ground Plane Size [20 min]
     - CAM-001: Implement Key Tracking [10 min]
     
     Which command should I execute next?"
```

---

## 📊 COMMAND COMPLETION TRACKING

### Phase 1: Environment (6 commands)
- [ ] ENV-001: Wire Fog Density Slider
- [ ] ENV-002: Add Fog Preset Buttons
- [ ] ENV-003: Dynamic Ground Plane Size
- [ ] ENV-004: Ground Material Presets
- [ ] ENV-005: Camera Position Presets
- [ ] ENV-006: Wire Camera Orbit Speed

### Phase 2: Camera Flight (3 commands)
- [ ] CAM-001: Implement Key Tracking
- [ ] CAM-002: Implement Camera Movement
- [ ] CAM-003: Add Flight Speed Indicator

### Phase 3: Selection (3 commands)
- [ ] SEL-001: Box Select Foundation
- [ ] SEL-002: Circle Select Tool [Pending]
- [ ] SEL-003: Lasso Select Tool [Pending]

### Phase 4: Manipulation (3 commands)
- [ ] MAN-001: Grab Tool [Pending]
- [ ] MAN-002: Smooth Tool Enhancement [Pending]
- [ ] MAN-003: Flatten Tool [Pending]

---

## 💡 BEST PRACTICES FOR AI

### DO:
✅ Ask before implementing each command  
✅ Report progress step-by-step  
✅ Run all verification tests  
✅ Log AI iterations for pattern learning  
✅ Update status bar with clear messages  
✅ Handle errors gracefully with rollback  
✅ Request user testing after implementation  

### DON'T:
❌ Skip verification steps  
❌ Implement multiple commands simultaneously  
❌ Modify files not listed in FILES_MODIFIED  
❌ Change existing functionality without noting  
❌ Forget to log AI iterations  
❌ Proceed if dependencies aren't satisfied  

---

**Last Updated**: October 17, 2025  
**Version**: 1.0  
**Total Commands**: 12 (defined), 30+ (planned)  
**Status**: Ready for AI execution
