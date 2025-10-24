
# VR Integration Guide - PixelProdigy3D

## Overview

PixelProdigy3D now supports **WebXR Virtual Reality** with full body tracking and mechanical arm inverse kinematics (IK). Your anatomical body follows your headset and your arms track your VR controllers with realistic elbow bending.

---

## 🥽 VR Features

### Core Functionality
- **WebXR Support**: Compatible with Meta Quest, Valve Index, HTC Vive, and other WebXR devices
- **Full Body Tracking**: Your 3D body follows your headset position in VR space
- **Controller Hand Tracking**: Both VR controllers control your body's arms
- **Mechanical Arm IK**: Two-bone inverse kinematics for realistic arm movements
- **Automatic Positioning**: Body positioned 1.5m below headset (natural standing height)
- **Orientation Tracking**: Body rotates to face the direction you're looking

### Supported VR Headsets
- ✅ Meta Quest 2/3/Pro
- ✅ Valve Index
- ✅ HTC Vive/Vive Pro
- ✅ Windows Mixed Reality
- ✅ PlayStation VR2 (with browser support)
- ✅ Any WebXR-compatible headset

---

## 🎮 How to Use VR Mode

### Step 1: Load a Body
1. Click **"FULL BODY"** or **"DETAILED SKELETON"** button
2. Wait for body to load (564V or 1200V+)
3. Body appears standing in the scene

### Step 2: Enter VR
1. Click **"ENTER VR"** button (appears at bottom center)
2. Put on your VR headset
3. Allow browser permissions for VR access
4. Your body automatically attaches to VR space!

### Step 3: Move Your Arms
1. Move your VR controllers
2. Your body's arms follow the controllers
3. **IK ON**: Arms bend realistically at elbows
4. **IK OFF**: Arms point straight toward controllers

### Step 4: Exit VR
1. Press the **Menu** button on your controller
2. Select "Exit VR"
3. Or click "EXIT VR" button in browser

---

## 🦾 Inverse Kinematics (IK) System

### What is IK?

**Inverse Kinematics** calculates how joints should bend to reach a target position. Instead of manually rotating shoulder and elbow, you specify where the hand should be, and IK calculates the angles automatically.

### Two-Bone IK Algorithm

Our IK solver uses the **Law of Cosines** for a two-joint arm:

```
Shoulder ───┐
            │ Upper Arm (1.4m)
            │
          Elbow ───┐
                   │ Forearm (1.3m)
                   │
                 Wrist/Hand (controller position)
```

**Math:**
- `a` = upper arm length (1.4m)
- `b` = forearm length (1.3m)
- `c` = distance from shoulder to controller
- Elbow angle: `θ = arccos((a² + b² - c²) / (2ab))`
- Shoulder angle: `φ = arccos((a² + c² - b²) / (2ac))`

### IK Features

✅ **Reachability Check**: Arms won't stretch beyond natural limits  
✅ **Smooth Interpolation**: Gradual rotation (no snapping)  
✅ **Clamping**: Distance clamped between min/max reach  
✅ **Elbow Bend**: Realistic inward elbow bending  
✅ **Per-Frame Update**: Runs in animation loop for smooth tracking  

---

## 🎛️ VR Controls

### VR IK Toggle Button
- **Location**: Top right of UI (purple button)
- **States**:
  - 🦾 **VR IK: ON** (purple glow) - Mechanical arm IK enabled
  - 🦾 **VR IK: OFF** (dim) - Simple pointing mode

### Controller Buttons
- **Trigger**: Select/grab (logged in console)
- **Menu**: Exit VR session
- **Thumbstick**: (Available for custom controls)

### WASD Controls in VR
- **Automatically Disabled** when VR session starts
- Body position controlled by headset
- Re-enabled when exiting VR

---

## 📐 Technical Details

### Body Positioning

```javascript
// Body offset from headset
vrBodyOffset = new THREE.Vector3(0, -1.5, 0)

// In VR loop:
body.position = headset.position + vrBodyOffset
body.rotation.y = headset.direction.angle
```

**Why -1.5m?**
- Average head height above shoulders: ~0.3m
- Shoulder to hip: ~0.6m
- Hip to ground (standing): ~0.9m
- Total: 1.8m, offset to -1.5m centers body nicely

### IK Arm Lengths

```javascript
const upperArmLength = 1.4;  // Shoulder to elbow
const forearmLength = 1.3;   // Elbow to wrist
const maxReach = 2.7;        // upperArm + forearm
const minReach = 0.1;        // |upperArm - forearm|
```

These match anatomical proportions from our body system.

### Controller Tracking

```javascript
// Left controller (index 0)
leftController = renderer.xr.getController(0)
leftController.addEventListener('selectstart', onSelectStart)
leftController.addEventListener('connected', onConnected)

// Right controller (index 1)
rightController = renderer.xr.getController(1)

// Controller grips (for hand models)
leftGrip = renderer.xr.getControllerGrip(0)
rightGrip = renderer.xr.getControllerGrip(1)
```

### Hand Models

Each controller has a simplified hand model:
- **Palm**: 8cm × 3cm × 12cm box
- **5 Fingers**: 0.8cm diameter × 6cm length cylinders
- **Material**: Skin tone (0xffdbac)
- **Position**: Attached to controller grip

---

## 🔧 Code Integration

### Key Functions

#### `setupVRControllers()`
Initializes VR controller tracking and hand models.

```javascript
setupVRControllers() {
  // Setup left/right controllers
  // Add event listeners (select, connected, disconnected)
  // Create hand models
  // Listen for VR session start/end
}
```

#### `attachBodyToVR()`
Connects body to VR space when session starts.

```javascript
attachBodyToVR() {
  // Find left/right arm references in body
  // Mark body as VR-tracked
  // Log attachment status
}
```

#### `updateVRBodyTracking()`
Main VR update loop (runs every frame).

```javascript
updateVRBodyTracking() {
  if (vrIKEnabled) {
    updateVRBodyTrackingWithIK()  // Use IK solver
  } else {
    updateVRBodyTrackingSimple()  // Simple pointing
  }
}
```

#### `solveArmIK(shoulderPos, targetPos, upperLen, foreLen, side)`
Two-bone IK solver returning shoulder and elbow angles.

```javascript
solveArmIK(...) {
  // Calculate distance to target
  // Clamp to reachable range
  // Use law of cosines
  // Return { shoulderAngle, elbowAngle, reachable }
}
```

#### `applyIKToArm(controllerPos, side)`
Applies IK solution to body arm.

```javascript
applyIKToArm(controllerPos, 'left') {
  // Find shoulder, upperArm, forearm, hand
  // Calculate IK angles
  // Apply smooth rotation (lerp/slerp)
  // Log IK angles
}
```

---

## 🎯 Use Cases

### 1. **VR Game Development**
Create first-person VR games where you see your own body and arms.

```javascript
// Load body
loadFullBody()

// Enter VR
renderer.xr.enabled = true
document.body.appendChild(VRButton.createButton(renderer))

// Body automatically tracks in VR!
```

### 2. **Anatomical Education**
View your skeleton in VR with hands following controllers.

```javascript
// Load detailed skeleton
loadDetailedSkeleton()  // 1200V+ with realistic bones

// Enter VR to inspect bone structure
// Move controllers to see arm bones flex
```

### 3. **Motion Capture Preview**
Preview character movements in VR before recording.

```javascript
// Enable IK for realistic arm bending
vrIKEnabled = true

// Move arms to test reach and poses
// Controllers = hands, headset = view
```

### 4. **Virtual Sculpting**
Sculpt 3D models with hands in VR space.

```javascript
// Attach sculpting tools to controllers
// Body hands show where tools are
// IK ensures natural arm positions
```

---

## 🐛 Troubleshooting

### "ENTER VR" Button Not Appearing
**Solution**: Check browser WebXR support
```javascript
if ('xr' in navigator) {
  console.log('✅ WebXR supported')
} else {
  console.log('❌ WebXR not supported')
}
```
**Fix**: Use Chrome/Edge browser on desktop, or Meta Quest Browser on headset.

### Arms Not Following Controllers
**Problem**: Body not loaded before entering VR  
**Solution**: Load body FIRST, then enter VR

**Problem**: Arm references not found  
**Solution**: Check console for "Found left hand/arm" messages

### Arms Stretching/Snapping
**Problem**: IK solver reaching beyond limits  
**Solution**: Toggle IK OFF for simple tracking, or adjust arm lengths:
```javascript
const upperArmLength = 1.4;  // Increase if too short
const forearmLength = 1.3;   // Increase if too short
```

### Body Not Rotating
**Problem**: Headset orientation not tracking  
**Solution**: Recenter your VR space (press Options on controller)

### Controllers Not Detected
**Problem**: Browser permissions  
**Solution**: Allow VR access when prompted

**Problem**: Controllers off or disconnected  
**Solution**: Turn on controllers and re-pair with headset

---

## 📊 Performance

### VR Frame Rate Requirements
- **Target**: 90 FPS (for smooth VR)
- **Minimum**: 72 FPS
- **Current**: ~85-90 FPS with Full Body (564V)

### Optimization Tips

1. **Use Simple Skeleton in VR** (if lag occurs)
```javascript
loadSkeletonBody()  // 564V instead of detailed 1200V+
```

2. **Disable Vertex Visualization**
```javascript
// Don't use vertex tools in VR mode
// Cyan points + labels = performance hit
```

3. **Reduce Body Parts**
```javascript
// Hide feet if out of view
leftFootGroup.visible = false
rightFootGroup.visible = false
```

4. **Lower Renderer Resolution**
```javascript
renderer.setPixelRatio(1.0)  // Instead of window.devicePixelRatio
```

---

## 🚀 Future Enhancements

### Planned Features
- [ ] **Full-body IK**: Legs follow floor position
- [ ] **Finger Tracking**: Individual finger joint control (Quest 3 Pro)
- [ ] **Body Physics**: Collision with VR objects
- [ ] **Hand Gestures**: Recognize poses (thumbs up, fist, etc.)
- [ ] **Haptic Feedback**: Controller vibration on contact
- [ ] **Foot Tracking**: Additional trackers for legs (Vive Trackers)
- [ ] **Multiplayer VR**: See other players' bodies in shared space
- [ ] **VR UI**: 3D interface attached to wrist
- [ ] **Recording**: Save VR movements to animation files

### Experimental
- **Eye Tracking**: Head/eyes look at focused objects (PSVR2, Quest Pro)
- **Face Tracking**: Facial expressions (Quest Pro)
- **Room-Scale**: Walk around in physical space
- **Mixed Reality**: See real environment + virtual body

---

## 📝 Example Workflows

### Workflow 1: View Your Skeleton in VR

1. Click **"DETAILED SKELETON"** button
2. Wait for 1200V+ skeleton to load
3. Click **"ENTER VR"** button at bottom
4. Put on headset
5. Move controllers to see arms follow
6. Toggle **"VR IK"** button (in browser or via voice command)
7. Observe realistic elbow bending

### Workflow 2: Test Arm Reach

1. Load **"FULL BODY"**
2. Enter VR
3. Enable **VR IK: ON**
4. Extend controllers to max reach
5. Watch console: "⚠️ controller out of reach" appears
6. Pull controllers closer
7. See arms track smoothly within natural range

### Workflow 3: Compare IK vs Simple Tracking

1. Load body and enter VR
2. Set **VR IK: ON**
3. Move controllers - see elbows bend
4. Toggle **VR IK: OFF**
5. Move controllers - arms point straight
6. Compare realism

---

## 🔗 Related Documentation

- **PROGRESS_REPORT.md** - Overall system status
- **VERTEX_ENGINE_GUIDE.md** - Vertex manipulation details
- **BODY_VERTEX_WORKFLOW.md** - Body creation workflows
- **INTEGRATION_MASTER.md** - System architecture

---

## 🎓 Learning Resources

### WebXR Tutorials
- [WebXR Device API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Three.js WebXR Guide](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content)
- [Immersive Web](https://immersiveweb.dev/)

### IK Mathematics
- [Two-Bone IK Solver](https://theorangeduck.com/page/simple-two-joint)
- [Law of Cosines](https://en.wikipedia.org/wiki/Law_of_cosines)
- [Inverse Kinematics Overview](https://www.alanzucconi.com/2017/04/10/inverse-kinematics/)

### VR Best Practices
- [Oculus Developer Guidelines](https://developer.oculus.com/resources/design-intro-principles/)
- [VR Locomotion](https://xinreality.com/wiki/VR_Locomotion)
- [Comfort & Performance](https://developer.oculus.com/documentation/native/android/mobile-vrcn/)

---

## 💬 Console Commands

### Enable VR Debugging
```javascript
// Log all VR events
renderer.xr.addEventListener('sessionstart', () => console.log('VR START'))
renderer.xr.addEventListener('sessionend', () => console.log('VR END'))

// Log controller positions every frame
setInterval(() => {
  if (vrEnabled && leftController) {
    const pos = new THREE.Vector3()
    leftController.getWorldPosition(pos)
    console.log('Left controller:', pos)
  }
}, 1000)
```

### Manually Adjust Body Offset
```javascript
// Body too high/low?
vrBodyOffset.y = -2.0  // Lower body
vrBodyOffset.y = -1.0  // Raise body
```

### Test IK Without VR
```javascript
// Simulate controller position
const testPos = new THREE.Vector3(1.5, 12, 0.5)
applyIKToArm(testPos, 'right')
```

---

## ✅ Checklist for VR Development

- [ ] Load body before entering VR
- [ ] Enable `renderer.xr.enabled = true`
- [ ] Add VRButton to page
- [ ] Setup controllers with event listeners
- [ ] Create hand models for visual feedback
- [ ] Implement `attachBodyToVR()` on session start
- [ ] Call `updateVRBodyTracking()` in animation loop
- [ ] Test IK arm bending
- [ ] Verify body position offset
- [ ] Check performance (90 FPS target)
- [ ] Test on multiple VR headsets
- [ ] Add fallback for non-VR browsers

---

## 🏛️ VR ROOM & SKYRELICS INTEGRATION

### VR Room Environment

The **VR Room** is a complete virtual environment where your body exists in VR space:

#### Environment Features
- **100×100m Ground Plane**: Large walkable area with grass-green terrain
- **Grid Overlay**: Visual reference grid for spatial awareness
- **Procedural SkyBox**: 500m radius sphere with sky-blue color (0x87CEEB)
- **20 Animated Clouds**: Procedurally placed, varying sizes, floating at different heights
- **3-Point Lighting System**:
  - **Sun**: Directional light (orange 0xffa500) at sunset angle with shadows
  - **Ambient**: Fill light (warm 0xffeedd) for overall illumination
  - **Hemisphere**: Sky/ground color blending for realism
- **Atmospheric Fog**: Distance fog (50-300m) for depth perception

#### How to Enter VR Room

```javascript
// Click "ENTER VR ROOM" button in the UI
enterVRRoom();

// Automatically creates:
// - Sky box with clouds
// - Ground plane with grid
// - Lighting system
// - SkyRelics pedestals
// - Spawns your body if loaded
```

### SkyRelics System

**SkyRelics** are ancient artifacts displayed on pedestals in a circular formation:

#### 5 Ancient Relics

1. **Crystal** (Octahedron) - First relic, mystical geometry
2. **Orb** (Sphere) - Smooth, spherical artifact
3. **Cube** (Box) - Ancient cubic relic
4. **Torus** (Ring) - Circular energy ring
5. **Pyramid** (Tetrahedron) - Triangular power structure

#### Pedestal Structure
Each pedestal consists of:
- **Base**: 0.8m radius cylinder (bottom)
- **Column**: 2.0m tall, tapered shaft
- **Top**: 0.7m platform for relic display
- **Material**: Metallic gray (0xcccccc) with 70% metalness

#### Relic Properties
- **Material**: Golden (0xffd700) with emissive glow
- **Animation**: 
  - Continuous rotation (varying speeds per relic)
  - Hover effect (sine wave, ±0.05m)
  - Independent animation offsets for variety
- **Interactivity**: `userData.isRelic = true` for selection
- **Holographic Labels**: Cyan translucent panels above each relic

#### Relic Positioning
Relics form a circle around the origin:
- **Radius**: 8 meters from center
- **Spacing**: 72° apart (360° / 5 relics)
- **Height**: 2.8m above ground (on pedestals)

#### Game Integration Ready

```javascript
// SkyRelics are tagged for gameplay interaction
scene.traverse(child => {
  if (child.userData.isRelic) {
    console.log(`Found ${child.name} - Relic #${child.userData.relicId}`);
    // Add your game logic here:
    // - Click to collect
    // - Teleport between relics
    // - Show information panels
    // - Unlock story content
  }
});
```

#### Animation System

SkyRelics animate automatically in the render loop:

```javascript
function animateSkyRelics() {
  const time = Date.now() * 0.001;
  
  scene.traverse(child => {
    if (child.userData.isRelic) {
      // Rotate around Y axis
      child.rotation.y += child.userData.rotationSpeed;
      
      // Hover up and down
      const hover = Math.sin(time * 2 + child.userData.hoverOffset) * 0.05;
      child.position.y = 2.8 + hover;
    }
  });
}
```

### VR Room Usage

1. **Load Body First**: Create FULL BODY or DETAILED SKELETON
2. **Click "ENTER VR ROOM"**: Button with pulsing cyan glow
3. **Environment Spawns**: Sky, clouds, ground, lights, relics appear
4. **Body Positioned**: Your body spawns at origin (0, 0, 0)
5. **Explore in VR**: Put on headset, body follows you
6. **Interact with Relics**: Walk to pedestals, examine artifacts

---

## 😊 ENHANCED FACIAL STRUCTURE

### Detailed Face System

The `createDetailedFace()` function builds anatomically accurate facial features:

#### Bone Structure

**Maxilla (Upper Jaw)**
- Box geometry: 0.5×0.35×0.45m
- Position: (0, 1.5, 0.3)
- Color: Bone (0xfff8e7)
- Holds upper teeth

**Mandible (Lower Jaw)**
- Custom BufferGeometry with U-shaped curve
- 20 segments creating anatomical jaw arc
- Position: Y=0.95
- Opens/closes for speech (animation ready)

**Zygomatic Bones (Cheekbones)**
- Left & right spheres: 0.15m radius
- Position: (±0.35, 1.6, 0.45)
- Scale: (1, 0.6, 1.2) - flattened, elongated
- Creates proper cheek definition

#### Dental System

**Upper Teeth** (16 total, 8 visible front)
- Individual tooth geometry: 0.04×0.12×0.05m
- Positioned in dental arcade (curved arc)
- Variation by tooth type:
  - **Incisors** (0, 7): 90% normal size
  - **Canines** (3, 4): 85% width, 110% height (pointy)
  - **Molars** (others): Normal size
- Color: Off-white (0xfff8f0)
- Proper angle for each tooth position

**Lower Teeth** (16 total, 8 visible front)
- Smaller than upper: 90% scale, 95% height
- Positioned in narrower arc (0.55 vs 0.6 radians)
- Slightly recessed position

**Gums**
- Upper gum: 0.28m radius half-cylinder
- Lower gum: 0.26m radius (smaller)
- Color: Pink (0xffb3ba)
- Covers tooth roots realistically

**Tongue**
- Box geometry: 0.18×0.06×0.28m
- Color: Pink/red (0xff6b8a)
- Position: Inside mouth cavity
- High roughness (0.8) for texture

#### Skin Overlay

**Facial Skin**
- Sphere geometry: 0.58m radius
- Covers cheekbones and jaw structure
- Color: Light skin (0xffccaa)
- Roughness: 0.65, slight metalness: 0.05

**Chin**
- Sphere: 0.15m radius
- Position: (0, 0.88, 0.42)
- Scale: (1.2, 0.9, 1) - wider, flatter
- Defines jawline

**Lips**
- **Upper Lip**: 0.32×0.04×0.08m box
- **Lower Lip**: 0.30×0.05×0.08m box (slightly larger)
- Color: Pink/red (0xffaaaa)
- Position: Covers tooth gap
- Roughness: 0.6 for natural texture

### Usage Example

```javascript
// Add detailed face to any head/body
const headGroup = new THREE.Group();
createDetailedFace(headGroup, 15.0); // Y offset = 15m (neck height)

// Face includes:
// - Maxilla & Mandible bones
// - Left & right cheekbones
// - 16 upper teeth + gums
// - 16 lower teeth + gums
// - Tongue
// - Facial skin
// - Lips (upper & lower)
```

### Material System

| Component | Color (Hex) | Roughness | Metalness | Notes |
|-----------|-------------|-----------|-----------|-------|
| Skin | 0xffccaa | 0.65 | 0.05 | Realistic flesh tone |
| Bone | 0xfff8e7 | 0.4 | 0.1 | Ivory/calcium white |
| Gums | 0xffb3ba | 0.7 | 0 | Pink mucous membrane |
| Teeth | 0xfff8f0 | 0.2 | 0.1 | Off-white enamel |
| Tongue | 0xff6b8a | 0.8 | 0 | Matte pink/red |
| Lips | 0xffaaaa | 0.6 | 0 | Soft pink |

### Vertex Counts

- **Jaw Bones**: ~200 vertices (custom mandible geometry)
- **Cheekbones**: ~150 vertices (2 spheres)
- **Teeth**: ~640 vertices (16 teeth × 40V each)
- **Gums**: ~200 vertices (2 half-cylinders)
- **Tongue**: 8 vertices (simple box)
- **Skin**: ~1,200 vertices (face sphere + chin)
- **Lips**: 16 vertices (2 boxes)

**Total Face**: ~2,400 vertices (detailed, game-ready)

### Integration with Bodies

```javascript
// Attach to Full Body
function loadFullBody(btn) {
  const fullBodyGroup = new THREE.Group();
  
  // ... create body parts ...
  
  // Add detailed face to head
  const headGroup = fullBodyGroup.getObjectByName('Head');
  if (headGroup) {
    createDetailedFace(headGroup, 17.5); // Position at head height
  }
  
  scene.add(fullBodyGroup);
}
```

---

## 🎮 COMPLETE SYSTEM WORKFLOW

### 1. Load Body
```
Click "FULL BODY" or "DETAILED SKELETON"
→ Body appears in scene (564V or 1200V+)
→ Detailed face optional (click to add)
```

### 2. Enter VR Room
```
Click "ENTER VR ROOM"
→ Environment creates (sky, ground, lights, relics)
→ Body ready for VR attachment
```

### 3. Start VR Session
```
Click "ENTER VR" button (bottom center)
→ Put on VR headset
→ Body attaches to headset position
→ Arms track controllers (IK enabled)
```

### 4. Explore & Interact
```
Walk around VR room (100×100m space)
→ Approach SkyRelics pedestals
→ Examine ancient artifacts (rotating, hovering)
→ Body follows your movements naturally
```

### 5. Game Integration
```
Export body to game engine
→ SkyRelics ready for gameplay
→ Facial features animate (jaw open/close, blink)
→ VR controls map to game actions
```

---

**Author**: Jeremy (EugeNEOusXR)  
**Project**: PixelProdigyAI  
**Version**: 2.0  
**Last Updated**: October 24, 2025

*Complete VR universe with detailed anatomy ready for your game! 🥽🏛️😊*
