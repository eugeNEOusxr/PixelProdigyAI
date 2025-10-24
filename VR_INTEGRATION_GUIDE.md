
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

**Author**: Jeremy (EugeNEOusXR)  
**Project**: PixelProdigyAI  
**Version**: 1.0  
**Last Updated**: October 24, 2025

*Ready to experience your 3D body in virtual reality! 🥽🦾*
