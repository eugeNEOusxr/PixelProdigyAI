# 🦴 Bone Hierarchy & Animation System

## 📋 Overview

This document defines the proper **bone parenting hierarchy** for the detailed skeleton, enabling realistic movement where child bones automatically follow parent bones during animation.

**Purpose:** Eliminate the need for separate animation code for every bone by using Three.js parent-child relationships  
**Date:** October 24, 2025  
**Related:** `BONE_NAMING_COMPLETE.md`, `pixelprodigy3d.html`

---

## 🏗️ Hierarchical Bone Structure

### **Principle: Parent → Child Relationships**

When a parent bone rotates/translates, **all child bones move with it automatically**.

```
Example: Leg Hierarchy
Pelvis (root)
 └─ Femur (hip socket)
     └─ Tibia + Fibula (knee hinge)
         └─ Tarsals (ankle)
             └─ Metatarsals (midfoot)
                 └─ Phalanges (toes)
```

**Animation becomes simple:**
- Rotate Femur at hip → Entire leg below rotates
- Rotate Tibia at knee → Lower leg + foot rotates
- Rotate Foot at ankle → Toes rotate with it

---

## 🦵 Lower Limb Hierarchy (Leg)

### **Structure:**

```
Pelvis (root - positioned at Y=8.2)
  ├─ Left Leg Branch
  │   ├─ Left Femur (attach at hip socket: -0.4, 8.2, 0)
  │   │   ├─ Left Femoral Head
  │   │   ├─ Left Femoral Neck
  │   │   ├─ Left Greater Trochanter
  │   │   ├─ Left Femoral Shaft
  │   │   ├─ Left Medial Condyle
  │   │   └─ Left Lateral Condyle
  │   │
  │   └─ Left Tibia + Fibula Group (attach to femur at Y=4.0)
  │       ├─ Left Tibia
  │       ├─ Left Fibula
  │       ├─ Left Lateral Malleolus
  │       │
  │       └─ Left Foot Group (attach to tibia at Y=0.5)
  │           ├─ Left Tarsals (7 bones)
  │           │   ├─ Left Calcaneus
  │           │   └─ Left Talus
  │           │
  │           ├─ Left Metatarsals (5 bones)
  │           │   ├─ Metatarsal 1 (Big Toe)
  │           │   ├─ Metatarsal 2-5
  │           │
  │           └─ Left Phalanges (14 bones)
  │               ├─ Proximal Phalanges (5)
  │               ├─ Middle Phalanges (4 - toes 2-5)
  │               └─ Distal Phalanges (5)
  │
  └─ Right Leg Branch (mirror of left)
```

### **Animation Control Points:**

| Joint | Parent Bone | Child Bone | Rotation Axis | Range | Action |
|-------|-------------|------------|---------------|-------|--------|
| **Hip** | Pelvis | Femur | X (forward/back) | -45° to 120° | Leg swing |
| | | | Z (abduction) | -45° to 45° | Leg spread |
| **Knee** | Femur | Tibia+Fibula Group | X only | 0° to 150° | Knee bend |
| **Ankle** | Tibia+Fibula | Foot Group | X (dorsi/plantar) | -45° to 30° | Toe point/flex |
| | | | Z (inversion/eversion) | -30° to 30° | Foot roll |

---

## 💪 Upper Limb Hierarchy (Arm)

### **Structure:**

```
Clavicle (root - attached to sternum)
  └─ Scapula (shoulder blade - attached to clavicle)
      └─ Humerus (attach at glenoid cavity)
          ├─ Humeral Head
          ├─ Humeral Shaft
          ├─ Medial Epicondyle
          ├─ Lateral Epicondyle
          │
          └─ Forearm Group (attach to humerus at Y=0.2)
              ├─ Radius
              ├─ Ulna
              │   └─ Olecranon Process
              │
              └─ Hand Group (attach to radius/ulna at wrist)
                  ├─ Carpals (8 bones - wrist)
                  │   ├─ Scaphoid, Lunate, Triquetrum, Pisiform
                  │   └─ Trapezium, Trapezoid, Capitate, Hamate
                  │
                  ├─ Metacarpals (5 bones)
                  │   └─ One per finger
                  │
                  └─ Fingers (5 digits)
                      ├─ Thumb (2 phalanges)
                      │   ├─ Proximal Phalanx
                      │   └─ Distal Phalanx
                      │
                      └─ Fingers 2-5 (3 phalanges each)
                          ├─ Proximal Phalanx
                          ├─ Middle Phalanx
                          └─ Distal Phalanx
```

### **Animation Control Points:**

| Joint | Parent Bone | Child Bone | Rotation Axis | Range | Action |
|-------|-------------|------------|---------------|-------|--------|
| **Shoulder** | Scapula | Humerus | X (flex/extend) | -45° to 180° | Arm raise front/back |
| | | | Y (int/ext rotate) | -90° to 90° | Arm twist |
| | | | Z (abduction) | -30° to 180° | Arm raise side |
| **Elbow** | Humerus | Forearm Group | X only | 0° to 145° | Elbow bend |
| **Wrist** | Forearm | Hand Group | X (flexion) | -70° to 90° | Hand up/down |
| | | | Z (deviation) | -30° to 20° | Hand side tilt |
| **Fingers** | Metacarpal | Proximal Phalanx | X only | 0° to 90° | Finger curl |
| | Proximal | Middle Phalanx | X only | 0° to 100° | Middle bend |
| | Middle | Distal Phalanx | X only | 0° to 80° | Tip bend |

---

## 🏛️ Axial Skeleton Hierarchy (Spine + Head)

### **Structure:**

```
Pelvis (root at Y=8.2)
  └─ Spine Column (stacked vertebrae)
      ├─ Lumbar Vertebrae (L1-L5) - positions Y=8.5 to 9.5
      │   ├─ Each vertebra is child of the one below
      │   └─ L5 → L4 → L3 → L2 → L1
      │
      ├─ Thoracic Vertebrae (T1-T12) - positions Y=11.5 to 14.5
      │   ├─ T12 is child of L1
      │   ├─ Each T vertebra is child of the one below
      │   └─ Ribs attach to each thoracic vertebra (left/right pairs)
      │
      ├─ Cervical Vertebrae (C1-C7) - positions Y=16.5 to 18.5
      │   ├─ C7 is child of T1
      │   └─ Each C vertebra is child of the one below
      │
      └─ Skull Group (attach to C1/Atlas)
          ├─ Cranial Vault
          │   ├─ Occipital (back)
          │   ├─ Parietal (2 - top sides)
          │   ├─ Frontal (forehead)
          │   └─ Temporal (2 - ear regions)
          │
          ├─ Facial Bones
          │   ├─ Maxilla (upper jaw - fixed to skull)
          │   ├─ Zygomatic (2 - cheekbones)
          │   ├─ Nasal structures
          │   └─ Orbital cavities
          │
          └─ Mandible (lower jaw - separate pivot)
              ├─ Mandibular Body
              ├─ Left/Right Ramus
              └─ Left/Right Condyles (TMJ hinges)
```

### **Animation Control Points:**

| Joint | Parent | Child | Axis | Range | Action |
|-------|--------|-------|------|-------|--------|
| **Lumbar** | Pelvis | L5 | X (flex) | -20° to 30° | Bend forward/back |
| | | | Y (rotate) | -30° to 30° | Twist torso |
| | | | Z (lateral) | -20° to 20° | Side bend |
| **Thoracic** | L1 | T12 | X (flex) | -15° to 15° | Upper back curve |
| | | | Y (rotate) | -20° to 20° | Shoulder turn |
| **Cervical** | T1 | C7 | X (nod) | -40° to 50° | Head nod yes |
| | | | Y (turn) | -80° to 80° | Head turn no |
| | | | Z (tilt) | -45° to 45° | Head tilt ear to shoulder |
| **TMJ** | Skull | Mandible | X only | 0° to 35° | Jaw open |

---

## 🔧 Implementation Code Structure

### **Step 1: Create Bone Groups with Proper Parenting**

```javascript
// Example: Creating leg hierarchy
function createLegHierarchy(side, boneMat) {
  // Create femur group (root of leg)
  const femurGroup = createDetailedFemur(side, boneMat);
  femurGroup.position.set(side === 'Left' ? -0.4 : 0.4, 8.2, 0); // Hip socket position
  femurGroup.userData.jointType = 'hip';
  femurGroup.userData.side = side;
  
  // Create tibia+fibula group (child of femur)
  const lowerLegGroup = createDetailedTibiaFibula(side, boneMat);
  lowerLegGroup.position.set(0, -4.0, 0); // Relative to femur (knee position)
  lowerLegGroup.userData.jointType = 'knee';
  femurGroup.add(lowerLegGroup); // ✅ PARENT lowerLeg to femur
  
  // Create foot group (child of lowerLeg)
  const footGroup = createFoot(side, boneMat);
  footGroup.position.set(0, -3.5, 0); // Relative to tibia (ankle position)
  footGroup.userData.jointType = 'ankle';
  lowerLegGroup.add(footGroup); // ✅ PARENT foot to lowerLeg
  
  // Store references for animation
  femurGroup.userData.knee = lowerLegGroup;
  femurGroup.userData.ankle = footGroup;
  
  return femurGroup;
}

// Usage in skeleton creation:
const leftLeg = createLegHierarchy('Left', boneMat);
pelvis.add(leftLeg); // ✅ PARENT leg to pelvis

const rightLeg = createLegHierarchy('Right', boneMat);
pelvis.add(rightLeg); // ✅ PARENT leg to pelvis
```

### **Step 2: Animate Using Joint Rotations**

```javascript
// Walking animation - now only need to rotate major joints
function updateWalkingAnimation() {
  if (!leftLeg || !rightLeg) return;
  
  const swingAngle = Math.sin(walkCycle) * 0.5; // -0.5 to 0.5 radians
  
  // Rotate femur at hip → entire leg swings automatically!
  leftLeg.rotation.x = swingAngle;
  rightLeg.rotation.x = -swingAngle; // Opposite leg
  
  // Rotate tibia at knee (access through userData reference)
  const leftKnee = leftLeg.userData.knee;
  const rightKnee = rightLeg.userData.knee;
  
  if (leftKnee && rightKnee) {
    // Knee bends more when leg is forward
    leftKnee.rotation.x = Math.max(0, swingAngle) * 1.5; // 0 to 0.75 rad
    rightKnee.rotation.x = Math.max(0, -swingAngle) * 1.5;
  }
  
  // Foot dorsiflexion at ankle
  const leftAnkle = leftLeg.userData.ankle;
  const rightAnkle = rightLeg.userData.ankle;
  
  if (leftAnkle && rightAnkle) {
    leftAnkle.rotation.x = -swingAngle * 0.3; // Subtle toe lift
    rightAnkle.rotation.x = swingAngle * 0.3;
  }
  
  walkCycle += walkSpeed * 0.02;
}
```

### **Step 3: Benefits of Hierarchy**

✅ **Automatic propagation:** Rotate hip → knee, ankle, toes all move  
✅ **Realistic physics:** Child bones maintain spatial relationships  
✅ **Simplified code:** No need to manually update every bone position  
✅ **IK compatibility:** Can still apply inverse kinematics to end effectors  
✅ **Natural constraints:** Parent limits define child movement range

---

## 📊 Complete Hierarchy Reference Table

| Body Region | Root Bone | Levels | Total Bones | Animation Joints |
|-------------|-----------|--------|-------------|------------------|
| **Left Leg** | Left Femur | 4 | 31 | Hip, Knee, Ankle, Toes (5) |
| **Right Leg** | Right Femur | 4 | 31 | Hip, Knee, Ankle, Toes (5) |
| **Left Arm** | Left Humerus | 5 | 32 | Shoulder, Elbow, Wrist, Fingers (15) |
| **Right Arm** | Right Humerus | 5 | 32 | Shoulder, Elbow, Wrist, Fingers (15) |
| **Spine** | Pelvis (L5) | 3 | 24 | Lumbar (5), Thoracic (12), Cervical (7) |
| **Ribs** | T1-T12 | 1 | 24 | Attached to thoracic vertebrae |
| **Skull** | C1 (Atlas) | 2 | 22 | Neck pivot, TMJ |
| **Pelvis** | Root | 1 | 1 | Hip sockets |
| **Sternum** | T2-T7 | 1 | 1 | Attached to thoracic spine |
| **Clavicles** | Sternum | 1 | 2 | Shoulder girdle |
| **Scapulae** | Clavicles | 1 | 2 | Shoulder blade glide |

**Total Bones:** 206  
**Total Animatable Joints:** ~50 major joints + ~30 finger/toe joints = **80 control points**

---

## 🎮 Animation System Architecture

### **Global References (maintain these):**

```javascript
// Root skeleton group
let skeletonGroup = null;

// Major body segments (for high-level animation)
let pelvis = null;
let spine = null; // Array of vertebrae [L5, L4, ..., C1]
let skull = null;

// Limbs (root bones)
let leftLeg = null;  // Femur group
let rightLeg = null; // Femur group
let leftArm = null;  // Humerus group
let rightArm = null; // Humerus group

// Quick access to joints (via userData)
// leftLeg.userData.knee → tibia/fibula group
// leftLeg.userData.ankle → foot group
// leftArm.userData.elbow → forearm group
// leftArm.userData.wrist → hand group
```

### **Animation Functions:**

```javascript
// Walking cycle
function animateWalking(speed) {
  // Only animate: pelvis bob, hip rotation, knee bend, ankle flex
  // All child bones (tarsals, metatarsals, phalanges) move automatically!
}

// Arm swing
function animateArmSwing(leftAngle, rightAngle) {
  // Only animate: shoulder rotation
  // Forearm, hand, fingers all follow automatically!
}

// Spine bend
function animateSpineBend(angle) {
  // Iterate through vertebrae, apply progressive rotation
  // Ribs, skull, arms all follow automatically!
}

// Finger curl
function animateFingerCurl(hand, fingerIndex, curlAmount) {
  // hand.children[fingerIndex] = metacarpal
  // Rotate proximal → middle → distal phalanges progressively
}
```

---

## 🔄 Conversion Plan for Existing Code

### **Current State (loadDetailedSkeleton):**
- ❌ All bones added flat to `skeletonGroup`
- ❌ No parent-child relationships
- ❌ Animation would require moving every bone individually

### **Target State:**
- ✅ Hierarchical bone structure with proper parenting
- ✅ Only animate root and joint bones
- ✅ Child bones follow automatically

### **Conversion Steps:**

1. **Modify bone creation functions** to return groups (already done for some)
2. **Add parenting calls** after creating each bone segment
3. **Use relative positions** instead of absolute world positions
4. **Store joint references** in userData for animation access
5. **Update animation functions** to use hierarchy
6. **Test each limb** independently before full body

---

## 🎯 Priority Implementation Order

1. **Legs** (most important for walking)
   - Femur → Tibia/Fibula → Foot hierarchy
   - Hip, knee, ankle rotation
   
2. **Arms** (important for gestures)
   - Humerus → Forearm → Hand hierarchy
   - Shoulder, elbow, wrist rotation

3. **Spine** (important for posture)
   - Vertebrae chain with progressive rotation
   - Ribs attached to thoracic vertebrae

4. **Hands/Feet** (detailed control)
   - Individual finger/toe joints
   - Metacarpals, phalanges hierarchy

5. **Head** (facial animation)
   - Skull attached to C1
   - Mandible jaw hinge

---

## 📚 References

- **Three.js Scene Graph:** https://threejs.org/manual/#en/scenegraph
- **Skeletal Animation Theory:** Forward Kinematics (FK) and Inverse Kinematics (IK)
- **Human Anatomy:** Joint ranges of motion (ROM) from orthopedic literature
- **Game Animation:** Skeleton rigging in Unity/Unreal for comparison

---

## ✅ Next Actions

1. ✏️ **Modify `loadDetailedSkeleton()`** to create hierarchical structure
2. 🧪 **Test leg hierarchy** with simple walking animation
3. 🔄 **Refactor arm hierarchy** with proper shoulder attachment
4. 📊 **Add joint constraint system** (min/max rotation limits)
5. 🎮 **Create animation controller** with named poses (idle, walk, run, etc.)

---

**With proper bone hierarchy, you'll control 206 bones with just ~80 joint rotations!** 🦴🎮
