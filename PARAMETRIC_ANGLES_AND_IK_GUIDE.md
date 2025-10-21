# 📐 Parametric Angles & Inverse Kinematics (IK) - Deep Dive

## Mathematical Foundation for Character Animation

---

## Part 1: PARAMETRIC ANGLES

### 🎯 What are Parametric Angles?

Parametric angles are angles defined by a **parameter** (usually `t` ranging from 0 to 1) rather than fixed values. This allows smooth interpolation and animation.

### Basic Concept:

```javascript
// Instead of: angle = 45° (fixed)
// We use: angle(t) = f(t) (function of time/parameter)

// Example: Joint rotating from 0° to 90° over time
function jointAngle(t) {
    const startAngle = 0;
    const endAngle = Math.PI / 2; // 90 degrees in radians
    return startAngle + (endAngle - startAngle) * t;
}

// At t=0: angle = 0°
// At t=0.5: angle = 45°
// At t=1: angle = 90°
```

### 📊 Parametric Walking Cycle

A walking animation is a perfect example of parametric angles:

```javascript
/**
 * Walking cycle using sine wave parametrization
 * @param {number} t - Time parameter (increases continuously)
 * @param {number} frequency - Steps per second
 * @returns {Object} Joint angles for one leg
 */
function parametricWalkCycle(t, frequency = 2) {
    // Phase is the continuous parameter
    const phase = t * frequency * 2 * Math.PI;
    
    // Hip angle: swings from -30° to +30°
    const hipAngle = Math.sin(phase) * (Math.PI / 6); // ±30°
    
    // Knee angle: bends from 0° to 60° (always positive)
    // Use max(0, sin) to only bend forward
    const kneeAngle = Math.max(0, Math.sin(phase)) * (Math.PI / 3); // 0-60°
    
    // Ankle angle: points foot during swing
    const ankleAngle = Math.sin(phase) * (Math.PI / 12); // ±15°
    
    return { hip: hipAngle, knee: kneeAngle, ankle: ankleAngle };
}

// Usage over time:
let time = 0;
function animate(deltaTime) {
    time += deltaTime;
    const leftLeg = parametricWalkCycle(time);
    const rightLeg = parametricWalkCycle(time + 0.5); // 180° out of phase
    
    applyToCharacter(leftLeg, rightLeg);
}
```

### 🌊 Advanced Parametric Functions

#### 1. **Ease-In-Out (Smooth Acceleration/Deceleration)**
```javascript
function easeInOutCubic(t) {
    // Smooth curve: slow start, fast middle, slow end
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Apply to rotation:
function smoothRotation(startAngle, endAngle, t) {
    const easedT = easeInOutCubic(t);
    return startAngle + (endAngle - startAngle) * easedT;
}
```

#### 2. **Cyclic Motion (Breathing, Idle Sway)**
```javascript
function breathingMotion(t, breathsPerSecond = 0.25) {
    // Sinusoidal breathing
    const phase = t * breathsPerSecond * 2 * Math.PI;
    const inhale = (Math.sin(phase) + 1) / 2; // 0 to 1
    
    return {
        chestExpansion: inhale * 0.05, // 5% scale change
        shoulderRaise: inhale * 0.02   // 2% vertical movement
    };
}
```

#### 3. **Multi-Phase Parametric Motion**
```javascript
function complexAction(t) {
    // Drinking coffee: 4 phases over 3 seconds
    if (t < 0.25) {
        // Phase 1: Raise cup (0-0.75s)
        const localT = t / 0.25;
        return {
            shoulder: easeInOutCubic(localT) * -1.2,
            elbow: easeInOutCubic(localT) * -1.4
        };
    } else if (t < 0.5) {
        // Phase 2: Hold at mouth (0.75-1.5s)
        return { shoulder: -1.2, elbow: -1.4 };
    } else if (t < 0.75) {
        // Phase 3: Lower cup (1.5-2.25s)
        const localT = (t - 0.5) / 0.25;
        return {
            shoulder: -1.2 + easeInOutCubic(localT) * 1.2,
            elbow: -1.4 + easeInOutCubic(localT) * 1.4
        };
    } else {
        // Phase 4: Rest (2.25-3s)
        return { shoulder: 0, elbow: 0 };
    }
}
```

---

## Part 2: INVERSE KINEMATICS (IK)

### 🎯 Forward vs Inverse Kinematics

**Forward Kinematics (FK):**
- Given: Joint angles
- Find: End effector position
- Example: "Rotate shoulder 45°, elbow 90° → where is the hand?" x axis effector position forward y position 


**Inverse Kinematics (IK):**
- Given: Target position for end effector
- Find: Joint angles needed to reach it
- Example: "Hand needs to touch this object → what angles?"

### 🦾 2-Joint IK Solver (Analytical Solution)

For a 2-bone chain (like arm: shoulder-elbow-hand):

```javascript
/**
 * Analytical IK solver for 2-joint chain
 * Uses law of cosines and trigonometry
 * 
 * @param {Vector3} target - Target position in 3D space
 * @param {number} length1 - Length of first bone (upper arm)
 * @param {number} length2 - Length of second bone (forearm)
 * @param {Vector3} origin - Joint origin position
 * @returns {Object} Joint angles {shoulder, elbow}
 */
function solveIK2Joint(target, length1, length2, origin) {
    // Calculate distance to target
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Check if target is reachable
    const maxReach = length1 + length2;
    const minReach = Math.abs(length1 - length2);
    
    if (distance > maxReach || distance < minReach) {
        console.warn('Target unreachable!');
        // Clamp to max reach
        const scale = maxReach / distance;
        target.x = origin.x + dx * scale;
        target.y = origin.y + dy * scale;
        target.z = origin.z + dz * scale;
        distance = maxReach;
    }
    
    // Law of Cosines to find elbow angle
    // c² = a² + b² - 2ab·cos(C)
    // Solving for angle C (elbow):
    const cosElbow = (length1*length1 + length2*length2 - distance*distance) 
                     / (2 * length1 * length2);
    const elbowAngle = Math.acos(Math.max(-1, Math.min(1, cosElbow)));
    
    // Law of Cosines to find shoulder angle component
    const cosShoulder = (length1*length1 + distance*distance - length2*length2)
                        / (2 * length1 * distance);
    const shoulderAngleToTarget = Math.acos(Math.max(-1, Math.min(1, cosShoulder)));
    
    // Direction to target
    const angleToTarget = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz));
    
    // Final shoulder angle
    const shoulderAngle = angleToTarget + shoulderAngleToTarget;
    
    return {
        shoulder: shoulderAngle,
        elbow: Math.PI - elbowAngle // Interior angle
    };
}
```

### 🎨 Practical Example: Hand Reaching for Object

```javascript
class ArmIK {
    constructor(character) {
        this.character = character;
        this.upperArmLength = 0.3; // meters
        this.forearmLength = 0.25; // meters
        this.shoulderPosition = new THREE.Vector3(0, 1.4, 0);
    }
    
    /**
     * Make hand reach for target position
     */
    reachFor(targetPosition) {
        // Solve IK
        const solution = solveIK2Joint(
            targetPosition,
            this.upperArmLength,
            this.forearmLength,
            this.shoulderPosition
        );
        
        // Apply to character joints
        if (this.character.userData.bodyParts) {
            const parts = this.character.userData.bodyParts;
            
            // Apply shoulder rotation
            parts.leftShoulder.rotation.x = solution.shoulder;
            
            // Apply elbow rotation
            parts.leftElbow.rotation.x = -solution.elbow;
        }
        
        return solution;
    }
    
    /**
     * Smooth IK over time (interpolated)
     */
    smoothReach(targetPosition, currentT, duration = 1.0) {
        const progress = Math.min(currentT / duration, 1.0);
        const eased = easeInOutCubic(progress);
        
        // Get IK solution
        const solution = solveIK2Joint(
            targetPosition,
            this.upperArmLength,
            this.forearmLength,
            this.shoulderPosition
        );
        
        // Interpolate to solution
        const currentShoulder = this.character.userData.bodyParts.leftShoulder.rotation.x;
        const currentElbow = this.character.userData.bodyParts.leftElbow.rotation.x;
        
        const newShoulder = currentShoulder + (solution.shoulder - currentShoulder) * eased;
        const newElbow = currentElbow + (-solution.elbow - currentElbow) * eased;
        
        this.character.userData.bodyParts.leftShoulder.rotation.x = newShoulder;
        this.character.userData.bodyParts.leftElbow.rotation.x = newElbow;
    }
}
```

### 🦿 Full Body IK (FABRIK Algorithm)

**FABRIK** = Forward And Backward Reaching Inverse Kinematics

This is an iterative algorithm that works for any number of joints:

```javascript
/**
 * FABRIK IK Solver - Multi-joint chain
 * Converges to solution through iteration
 */
class FABRIKSolver {
    constructor(joints, boneLengths) {
        this.joints = joints; // Array of Vector3 positions
        this.boneLengths = boneLengths; // Array of lengths between joints
        this.tolerance = 0.01; // Convergence threshold
        this.maxIterations = 10;
    }
    
    /**
     * Solve IK for target position
     * @param {Vector3} target - Desired end effector position
     * @param {Vector3} base - Fixed base position (e.g., shoulder)
     */
    solve(target, base) {
        const n = this.joints.length;
        let iteration = 0;
        
        // Store original base position
        const originalBase = base.clone();
        
        // Check if target is reachable
        const totalLength = this.boneLengths.reduce((sum, len) => sum + len, 0);
        const distToTarget = base.distanceTo(target);
        
        if (distToTarget > totalLength) {
            // Target unreachable - stretch towards it
            const direction = new THREE.Vector3()
                .subVectors(target, base)
                .normalize();
            
            this.joints[0] = base.clone();
            for (let i = 1; i < n; i++) {
                this.joints[i] = this.joints[i-1].clone()
                    .add(direction.clone().multiplyScalar(this.boneLengths[i-1]));
            }
            return this.joints;
        }
        
        // Iterative solving
        while (iteration < this.maxIterations) {
            // Check if close enough to target
            if (this.joints[n-1].distanceTo(target) < this.tolerance) {
                break;
            }
            
            // ═══ BACKWARD PASS (from end effector to base) ═══
            this.joints[n-1] = target.clone();
            
            for (let i = n - 2; i >= 0; i--) {
                // Direction from next joint to current
                const direction = new THREE.Vector3()
                    .subVectors(this.joints[i], this.joints[i+1])
                    .normalize();
                
                // Place joint at correct distance from next joint
                this.joints[i] = this.joints[i+1].clone()
                    .add(direction.multiplyScalar(this.boneLengths[i]));
            }
            
            // ═══ FORWARD PASS (from base to end effector) ═══
            this.joints[0] = originalBase.clone();
            
            for (let i = 0; i < n - 1; i++) {
                // Direction from current to next joint
                const direction = new THREE.Vector3()
                    .subVectors(this.joints[i+1], this.joints[i])
                    .normalize();
                
                // Place next joint at correct distance
                this.joints[i+1] = this.joints[i].clone()
                    .add(direction.multiplyScalar(this.boneLengths[i]));
            }
            
            iteration++;
        }
        
        return this.joints;
    }
    
    /**
     * Convert solved joint positions back to rotation angles
     */
    getJointAngles() {
        const angles = [];
        
        for (let i = 0; i < this.joints.length - 1; i++) {
            const direction = new THREE.Vector3()
                .subVectors(this.joints[i+1], this.joints[i])
                .normalize();
            
            // Calculate rotation angles from direction vector
            const angleX = Math.atan2(direction.y, 
                Math.sqrt(direction.x * direction.x + direction.z * direction.z));
            const angleY = Math.atan2(direction.x, direction.z);
            
            angles.push({ x: angleX, y: angleY, z: 0 });
        }
        
        return angles;
    }
}
```

### 🎯 Practical Application: Foot Placement IK

```javascript
/**
 * Ground-adaptive foot placement using IK
 * Ensures feet stay on terrain regardless of slope
 */
class FootIK {
    constructor(character, legLength) {
        this.character = character;
        this.legLength = legLength;
        this.raycast = new THREE.Raycaster();
    }
    
    /**
     * Find ground height at foot position
     */
    findGroundHeight(footPosition, scene) {
        this.raycast.set(
            new THREE.Vector3(footPosition.x, footPosition.y + 10, footPosition.z),
            new THREE.Vector3(0, -1, 0)
        );
        
        const intersects = this.raycast.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            return intersects[0].point.y;
        }
        return 0; // Default ground level
    }
    
    /**
     * Apply IK to keep foot on ground
     */
    plantFoot(footName, scene) {
        const hipPosition = this.character.position.clone();
        hipPosition.y += 0.9; // Hip height
        
        // Determine foot position based on stride
        const stride = this.character.userData.stride || 0;
        const footOffset = footName === 'left' ? -0.15 : 0.15;
        const footX = hipPosition.x + footOffset;
        const footZ = hipPosition.z + stride;
        
        // Find ground at foot position
        const groundY = this.findGroundHeight(
            new THREE.Vector3(footX, hipPosition.y, footZ),
            scene
        );
        
        // Target position for foot
        const target = new THREE.Vector3(footX, groundY, footZ);
        
        // Solve IK for leg
        const legIK = solveIK2Joint(
            target,
            this.legLength * 0.5, // Thigh
            this.legLength * 0.5, // Calf
            hipPosition
        );
        
        // Apply angles to character
        const bodyParts = this.character.userData.bodyParts;
        if (footName === 'left') {
            bodyParts.leftHip.rotation.x = legIK.shoulder;
            bodyParts.leftKnee.rotation.x = legIK.elbow;
        } else {
            bodyParts.rightHip.rotation.x = legIK.shoulder;
            bodyParts.rightKnee.rotation.x = legIK.elbow;
        }
    }
}
```

---

## Part 3: COMBINED PARAMETRIC + IK SYSTEM

### 🎭 Hybrid Animation Controller

Combines procedural parametric animation with goal-oriented IK:

```javascript
/**
 * Advanced character controller
 * Uses parametric motion for natural movement
 * Uses IK for precise positioning
 */
class HybridAnimationController {
    constructor(character) {
        this.character = character;
        this.time = 0;
        this.ikTargets = {};
        this.parametricCycles = {};
    }
    
    /**
     * Update animation each frame
     */
    update(deltaTime) {
        this.time += deltaTime;
        
        // 1. Apply parametric base motion (walking, breathing, etc.)
        this.updateParametricMotion();
        
        // 2. Override with IK for specific goals (reaching, foot planting)
        this.updateIKTargets();
        
        // 3. Blend between parametric and IK
        this.blendMotions();
    }
    
    /**
     * Parametric base motion
     */
    updateParametricMotion() {
        const state = this.character.userData.behaviorState;
        
        if (state === 'walking') {
            const cycle = parametricWalkCycle(this.time, 1.5);
            this.parametricCycles.leftLeg = cycle;
            this.parametricCycles.rightLeg = parametricWalkCycle(this.time + 0.5, 1.5);
        }
        else if (state === 'idle') {
            const breathe = breathingMotion(this.time);
            this.parametricCycles.chest = breathe;
        }
    }
    
    /**
     * IK goal-driven motion
     */
    updateIKTargets() {
        // Example: Hand reaches for object
        if (this.ikTargets.rightHand) {
            const armIK = new ArmIK(this.character);
            armIK.reachFor(this.ikTargets.rightHand.position);
        }
        
        // Example: Feet plant on ground
        if (this.ikTargets.groundPlanting) {
            const footIK = new FootIK(this.character, 0.9);
            footIK.plantFoot('left', this.ikTargets.groundPlanting.scene);
            footIK.plantFoot('right', this.ikTargets.groundPlanting.scene);
        }
    }
    
    /**
     * Blend parametric and IK results
     */
    blendMotions() {
        const blendFactor = 0.7; // 70% IK, 30% parametric
        
        // Combine motions with weighted average
        const bodyParts = this.character.userData.bodyParts;
        
        // Example: Blend leg motion
        if (this.parametricCycles.leftLeg && bodyParts.leftHip) {
            const parametric = this.parametricCycles.leftLeg.hip;
            const current = bodyParts.leftHip.rotation.x;
            
            // Smooth blend
            bodyParts.leftHip.rotation.x = 
                parametric * (1 - blendFactor) + current * blendFactor;
        }
    }
    
    /**
     * Set IK target
     */
    setIKTarget(limb, target) {
        this.ikTargets[limb] = target;
    }
    
    /**
     * Clear IK target
     */
    clearIKTarget(limb) {
        delete this.ikTargets[limb];
    }
}
```

---

## 🎓 Summary

### Parametric Angles:
- Define motion as **functions of time** (t)
- Enable **smooth interpolation**
- Support **cyclic patterns** (walking, breathing)
- Use **easing functions** for natural acceleration

### Inverse Kinematics:
- **Goal-oriented** positioning
- Solves "how to reach target" problem
- **Analytical** (2-joint) or **Iterative** (FABRIK)
- Essential for **terrain adaptation** and **object interaction**

### Best Practices:
1. **Parametric for base motion** - walking, idle, running
2. **IK for constraints** - foot on ground, hand on object
3. **Blend both** for natural + precise animation
4. **Clamp to limits** - prevent unnatural poses
5. **Smooth transitions** - use easing functions

---

## 📊 Math Reference

**Radians to Degrees:**
```
degrees = radians × (180 / π)
radians = degrees × (π / 180)
```

**Law of Cosines:**
```
c² = a² + b² - 2ab·cos(C)
cos(C) = (a² + b² - c²) / (2ab)
```

**Vector Magnitude:**
```
|v| = √(x² + y² + z²)
```

**Vector Normalization:**
```
v̂ = v / |v|
```

**Linear Interpolation (Lerp):**
```
lerp(a, b, t) = a + (b - a) × t
```

where `t ∈ [0, 1]`

---

🎮 These techniques power every modern game animation system from AAA titles to indie games!
