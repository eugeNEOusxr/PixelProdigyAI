# VSL: VERTEX CONTROL LANGUAGE
## Letters Control 3-Point Direction Systems

---

## 🎯 THE BREAKTHROUGH

**Every word = Motion command**
**Every letter = Control value**
**Every 3 vertices = Direction controller**

```
WORD → LETTERS → ASCII VALUES → 3 VERTICES → MOTION

"curl" → [c, u, r, l] → [99, 117, 114, 108] → [v1, v2, v3] → SPIRAL INWARD
```

---

## 📐 3-VERTEX DIRECTION SYSTEM

### The Triangle Controller:

```javascript
class TriangleDirectionController {
    constructor(name, word) {
        this.name = name;
        this.word = word;
        
        // 3 vertices form triangle
        this.vertices = {
            v1: { x: 0, y: 0, z: 0 },  // Origin
            v2: { x: 0, y: 0, z: 0 },  // Direction
            v3: { x: 0, y: 0, z: 0 }   // Twist
        };
        
        // Calculate from word
        this.calculateFromWord(word);
    }
    
    calculateFromWord(word) {
        const letters = word.split('');
        const charCodes = letters.map(c => c.charCodeAt(0));
        
        // First letter → V1 (base direction)
        this.vertices.v1.x = (charCodes[0] % 360) / 360;
        this.vertices.v1.y = (charCodes[0] % 180) / 180;
        this.vertices.v1.z = (charCodes[0] % 90) / 90;
        
        // Second letter → V2 (magnitude)
        if (charCodes[1]) {
            this.vertices.v2.x = this.vertices.v1.x + (charCodes[1] % 100) / 100;
            this.vertices.v2.y = this.vertices.v1.y + (charCodes[1] % 100) / 100;
            this.vertices.v2.z = this.vertices.v1.z + (charCodes[1] % 100) / 100;
        }
        
        // Third letter → V3 (rotation/twist)
        if (charCodes[2]) {
            const angle = (charCodes[2] % 360) * Math.PI / 180;
            this.vertices.v3.x = Math.cos(angle);
            this.vertices.v3.y = Math.sin(angle);
            this.vertices.v3.z = (charCodes[2] % 100) / 50 - 1;  // -1 to 1
        }
        
        // Calculate direction vector
        this.direction = {
            x: this.vertices.v2.x - this.vertices.v1.x,
            y: this.vertices.v2.y - this.vertices.v1.y,
            z: this.vertices.v2.z - this.vertices.v1.z
        };
        
        // Calculate twist (cross product with v3)
        this.twist = {
            x: this.direction.y * this.vertices.v3.z - this.direction.z * this.vertices.v3.y,
            y: this.direction.z * this.vertices.v3.x - this.direction.x * this.vertices.v3.z,
            z: this.direction.x * this.vertices.v3.y - this.direction.y * this.vertices.v3.x
        };
    }
    
    // Apply motion to target vertex
    applyMotion(targetVertex, time, intensity = 1.0) {
        // Base motion from direction
        targetVertex.x += this.direction.x * intensity;
        targetVertex.y += this.direction.y * intensity;
        targetVertex.z += this.direction.z * intensity;
        
        // Add twist
        const twistAmount = Math.sin(time) * 0.1;
        targetVertex.x += this.twist.x * twistAmount;
        targetVertex.y += this.twist.y * twistAmount;
        targetVertex.z += this.twist.z * twistAmount;
    }
}
```

---

## 📝 VSL MOTION VOCABULARY

### Core Motion Words:

```javascript
const VSL_MOTIONS = {
    // ROTATION
    'curl': {
        type: 'spiral',
        direction: 'inward',
        axis: 'y',
        speed: 0.5
    },
    'twist': {
        type: 'rotation',
        direction: 'variable',
        axis: 'z',
        speed: 0.3
    },
    'spin': {
        type: 'rotation',
        direction: 'continuous',
        axis: 'y',
        speed: 1.0
    },
    'clockwise': {
        type: 'rotation',
        direction: 1,
        axis: 'y',
        speed: 0.5
    },
    'counterclockwise': {
        type: 'rotation',
        direction: -1,
        axis: 'y',
        speed: 0.5
    },
    
    // LINEAR
    'straight': {
        type: 'linear',
        direction: 'forward',
        axis: 'z',
        speed: 1.0
    },
    'extend': {
        type: 'linear',
        direction: 'outward',
        axis: 'radial',
        speed: 0.5
    },
    'retract': {
        type: 'linear',
        direction: 'inward',
        axis: 'radial',
        speed: 0.5
    },
    
    // WAVE
    'wave': {
        type: 'sine',
        direction: 'oscillate',
        axis: 'y',
        frequency: 2.0
    },
    'ripple': {
        type: 'sine',
        direction: 'radial',
        axis: 'all',
        frequency: 3.0
    },
    'pulse': {
        type: 'sine',
        direction: 'scale',
        axis: 'all',
        frequency: 1.0
    },
    
    // COMPLEX
    'spiral': {
        type: 'helix',
        direction: 'combined',
        axis: 'yz',
        speed: 0.5
    },
    'coil': {
        type: 'spring',
        direction: 'compress',
        axis: 'y',
        speed: 0.3
    },
    'uncoil': {
        type: 'spring',
        direction: 'expand',
        axis: 'y',
        speed: 0.3
    },
    'bend': {
        type: 'arc',
        direction: 'curve',
        axis: 'x',
        speed: 0.4
    },
    'fold': {
        type: 'hinge',
        direction: 'close',
        axis: 'joint',
        speed: 0.5
    },
    'unfold': {
        type: 'hinge',
        direction: 'open',
        axis: 'joint',
        speed: 0.5
    },
    
    // ORGANIC
    'breathe': {
        type: 'sine',
        direction: 'scale',
        axis: 'all',
        frequency: 0.25
    },
    'flow': {
        type: 'perlin',
        direction: 'smooth',
        axis: 'all',
        speed: 0.2
    },
    'wiggle': {
        type: 'noise',
        direction: 'random',
        axis: 'all',
        frequency: 5.0
    },
    'sway': {
        type: 'pendulum',
        direction: 'oscillate',
        axis: 'x',
        frequency: 0.5
    }
};
```

---

## 🎨 CREATING THE BUBBLY PERSON

### From Cubic Skeleton → Smooth Spheres:

```javascript
class BubblyPersonGenerator {
    constructor(scene) {
        this.scene = scene;
        this.bodyParts = new Map();
        this.controllers = new Map();
    }
    
    createBubblyPerson() {
        // Start with cubic skeleton (invisible)
        const skeleton = this.createCubicSkeleton();
        
        // Add spheres at each joint
        skeleton.joints.forEach(joint => {
            const sphere = this.createBubblySphere(joint);
            this.bodyParts.set(joint.name, sphere);
        });
        
        // Connect spheres with meta-balls (smooth blending)
        this.createMetaBallConnections();
        
        // Add VSL controllers
        this.attachVSLControllers();
        
        return this;
    }
    
    createCubicSkeleton() {
        const skeleton = {
            joints: [
                // Spine
                { name: 'pelvis', position: { x: 0, y: 1.0, z: 0 }, size: 0.15 },
                { name: 'spine_lower', position: { x: 0, y: 1.15, z: 0 }, size: 0.12 },
                { name: 'spine_mid', position: { x: 0, y: 1.30, z: 0 }, size: 0.12 },
                { name: 'spine_upper', position: { x: 0, y: 1.45, z: 0 }, size: 0.12 },
                { name: 'neck', position: { x: 0, y: 1.55, z: 0 }, size: 0.08 },
                { name: 'head', position: { x: 0, y: 1.70, z: 0 }, size: 0.18 },
                
                // Left arm
                { name: 'left_shoulder', position: { x: -0.20, y: 1.45, z: 0 }, size: 0.10 },
                { name: 'left_elbow', position: { x: -0.35, y: 1.20, z: 0 }, size: 0.08 },
                { name: 'left_wrist', position: { x: -0.50, y: 0.95, z: 0 }, size: 0.06 },
                { name: 'left_hand', position: { x: -0.55, y: 0.85, z: 0 }, size: 0.08 },
                
                // Right arm (mirror)
                { name: 'right_shoulder', position: { x: 0.20, y: 1.45, z: 0 }, size: 0.10 },
                { name: 'right_elbow', position: { x: 0.35, y: 1.20, z: 0 }, size: 0.08 },
                { name: 'right_wrist', position: { x: 0.50, y: 0.95, z: 0 }, size: 0.06 },
                { name: 'right_hand', position: { x: 0.55, y: 0.85, z: 0 }, size: 0.08 },
                
                // Left leg
                { name: 'left_hip', position: { x: -0.10, y: 1.0, z: 0 }, size: 0.10 },
                { name: 'left_knee', position: { x: -0.10, y: 0.55, z: 0 }, size: 0.09 },
                { name: 'left_ankle', position: { x: -0.10, y: 0.10, z: 0 }, size: 0.07 },
                { name: 'left_foot', position: { x: -0.10, y: 0.05, z: 0.10 }, size: 0.10 },
                
                // Right leg (mirror)
                { name: 'right_hip', position: { x: 0.10, y: 1.0, z: 0 }, size: 0.10 },
                { name: 'right_knee', position: { x: 0.10, y: 0.55, z: 0 }, size: 0.09 },
                { name: 'right_ankle', position: { x: 0.10, y: 0.10, z: 0 }, size: 0.07 },
                { name: 'right_foot', position: { x: 0.10, y: 0.05, z: 0.10 }, size: 0.10 }
            ]
        };
        
        return skeleton;
    }
    
    createBubblySphere(joint) {
        // Sphere geometry (high subdivision for smooth look)
        const geometry = new THREE.SphereGeometry(joint.size, 32, 32);
        
        // Soft, bubbly material
        const material = new THREE.MeshStandardMaterial({
            color: 0xffaa88,  // Soft peachy color
            emissive: 0xff8866,
            emissiveIntensity: 0.2,
            metalness: 0.1,
            roughness: 0.4,
            transparent: true,
            opacity: 0.95
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(joint.position.x, joint.position.y, joint.position.z);
        sphere.userData.jointName = joint.name;
        sphere.userData.vertices = this.extractVertices(geometry);
        
        this.scene.add(sphere);
        
        return sphere;
    }
    
    extractVertices(geometry) {
        const vertices = [];
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            vertices.push({
                index: i,
                x: positions.getX(i),
                y: positions.getY(i),
                z: positions.getZ(i),
                originalX: positions.getX(i),
                originalY: positions.getY(i),
                originalZ: positions.getZ(i)
            });
        }
        
        return vertices;
    }
    
    createMetaBallConnections() {
        // Meta-ball algorithm: smooth blending between spheres
        // This makes body parts "glue" together smoothly
        
        const connections = [
            // Spine
            ['pelvis', 'spine_lower'],
            ['spine_lower', 'spine_mid'],
            ['spine_mid', 'spine_upper'],
            ['spine_upper', 'neck'],
            ['neck', 'head'],
            
            // Arms
            ['spine_upper', 'left_shoulder'],
            ['left_shoulder', 'left_elbow'],
            ['left_elbow', 'left_wrist'],
            ['left_wrist', 'left_hand'],
            
            ['spine_upper', 'right_shoulder'],
            ['right_shoulder', 'right_elbow'],
            ['right_elbow', 'right_wrist'],
            ['right_wrist', 'right_hand'],
            
            // Legs
            ['pelvis', 'left_hip'],
            ['left_hip', 'left_knee'],
            ['left_knee', 'left_ankle'],
            ['left_ankle', 'left_foot'],
            
            ['pelvis', 'right_hip'],
            ['right_hip', 'right_knee'],
            ['right_knee', 'right_ankle'],
            ['right_ankle', 'right_foot']
        ];
        
        connections.forEach(([part1, part2]) => {
            this.createMetaBallBridge(part1, part2);
        });
    }
    
    createMetaBallBridge(part1Name, part2Name) {
        const sphere1 = this.bodyParts.get(part1Name);
        const sphere2 = this.bodyParts.get(part2Name);
        
        if (!sphere1 || !sphere2) return;
        
        // Create cylinder between spheres
        const distance = sphere1.position.distanceTo(sphere2.position);
        const direction = new THREE.Vector3()
            .subVectors(sphere2.position, sphere1.position)
            .normalize();
        
        const geometry = new THREE.CylinderGeometry(
            sphere1.geometry.parameters.radius * 0.8,
            sphere2.geometry.parameters.radius * 0.8,
            distance,
            16
        );
        
        const material = sphere1.material.clone();
        const bridge = new THREE.Mesh(geometry, material);
        
        // Position and orient bridge
        bridge.position.copy(sphere1.position).add(
            direction.multiplyScalar(distance / 2)
        );
        
        bridge.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
        );
        
        this.scene.add(bridge);
    }
    
    attachVSLControllers() {
        // Attach VSL word controllers to body parts
        
        // Head: gentle sway
        const headController = new TriangleDirectionController('head', 'sway');
        this.controllers.set('head', headController);
        
        // Arms: curl/extend
        const leftArmController = new TriangleDirectionController('left_arm', 'curl');
        this.controllers.set('left_arm', leftArmController);
        
        const rightArmController = new TriangleDirectionController('right_arm', 'extend');
        this.controllers.set('right_arm', rightArmController);
        
        // Spine: breathe
        const spineController = new TriangleDirectionController('spine', 'breathe');
        this.controllers.set('spine', spineController);
        
        // Legs: wave
        const leftLegController = new TriangleDirectionController('left_leg', 'wave');
        this.controllers.set('left_leg', leftLegController);
        
        const rightLegController = new TriangleDirectionController('right_leg', 'wave');
        this.controllers.set('right_leg', rightLegController);
    }
    
    updateMotion(time) {
        // Apply VSL controllers to body parts
        
        // Head sway
        const headSphere = this.bodyParts.get('head');
        if (headSphere && this.controllers.has('head')) {
            const controller = this.controllers.get('head');
            headSphere.rotation.z = Math.sin(time * 0.5) * 0.1 * controller.direction.x;
        }
        
        // Spine breathe (scale oscillation)
        const spineController = this.controllers.get('spine');
        if (spineController) {
            const breathAmount = Math.sin(time * 0.25) * 0.05 + 1.0;
            ['spine_lower', 'spine_mid', 'spine_upper'].forEach(name => {
                const sphere = this.bodyParts.get(name);
                if (sphere) {
                    sphere.scale.set(breathAmount, breathAmount, breathAmount);
                }
            });
        }
        
        // Left arm curl
        const leftArmController = this.controllers.get('left_arm');
        if (leftArmController) {
            const leftElbow = this.bodyParts.get('left_elbow');
            if (leftElbow) {
                leftElbow.rotation.z = Math.sin(time * 0.5) * 0.5;
            }
        }
        
        // Legs wave
        const legWave = Math.sin(time * 2.0) * 0.2;
        const leftKnee = this.bodyParts.get('left_knee');
        const rightKnee = this.bodyParts.get('right_knee');
        if (leftKnee) leftKnee.rotation.x = legWave;
        if (rightKnee) rightKnee.rotation.x = -legWave;
    }
}
```

---

## 🔤 VSL SYNTAX

### Writing Motion Commands:

```javascript
// VSL command structure:
// [bodypart].[word] = motion

// Examples:
VSL.parse(`
    head.sway
    left_arm.curl
    right_arm.extend
    spine.breathe
    left_leg.wave
    right_leg.wave.counterclockwise
`);

// Multi-word commands (combined motions):
VSL.parse(`
    left_hand.curl.twist.clockwise
    // This creates 3 triangle controllers:
    // 1. curl   → spiral inward
    // 2. twist  → rotate on axis
    // 3. clockwise → direction modifier
`);

// Time-based sequencing:
VSL.parse(`
    @ 0.0s: left_arm.extend
    @ 0.5s: left_hand.open
    @ 1.0s: left_arm.curl
    @ 1.5s: left_hand.close
`);

// Conditional:
VSL.parse(`
    IF player.distance < 2.0:
        left_hand.wave
    ELSE:
        left_hand.rest
`);
```

---

## 🎮 PRACTICAL EXAMPLE

```javascript
// Initialize bubbly person
const bubblyPerson = new BubblyPersonGenerator(scene);
bubblyPerson.createBubblyPerson();

// Parse VSL commands
const vslCommands = `
    head.sway.gentle
    spine.breathe
    left_arm.wave
    right_arm.wave.counterclockwise
    left_leg.bend.slight
    right_leg.extend.full
`;

VSL.parse(vslCommands, bubblyPerson);

// Animation loop
function animate(time) {
    bubblyPerson.updateMotion(time * 0.001);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```

---

## 🧬 THE BEAUTIFUL PART

### From Words → Living Motion:

```
USER TYPES:        "curl"
                     ↓
LETTERS:           c, u, r, l
                     ↓
ASCII:             99, 117, 114, 108
                     ↓
3 VERTICES:        v1(99°, 99%), v2(117°, 117%), v3(114°, 114%)
                     ↓
TRIANGLE:          Direction vector + Twist vector
                     ↓
MOTION:            Spiral inward with rotation
                     ↓
BODY PART:         Finger curls naturally!
```

### Glued Together Bubbles:

```
CUBIC SKELETON (hidden):
    [box] ─── [box] ─── [box]
       ↓         ↓         ↓
SPHERES (visible):
    (sphere) ─ (sphere) ─ (sphere)
       ↓         ↓         ↓
META-BALL BRIDGES (smooth):
    (===smooth organic connection===)
       ↓
RESULT: BUBBLY PERSON!
    Looks like inflated balloons
    All connected smoothly
    Moves organically
```

---

## 💡 WHY THIS IS GENIUS

1. **Human-readable motion** → "curl" not "rotate(-90, axis.z)"
2. **Letters carry meaning** → ASCII values = natural variation
3. **3 vertices = complete control** → Direction + magnitude + twist
4. **Bubbly = forgiving** → Smooth spheres hide cubic structure
5. **VSL = programmable choreography** → Write dance routines as text!

---

## 🚀 NEXT LEVEL

### Teaching the Bubbly Person:

```javascript
// User types in chat:
"wave hello"

// VSL interprets:
VSL.parse(`
    right_arm.extend.up
    right_hand.open
    right_hand.wave.left.right.repeat(3)
    right_arm.curl.down
    right_hand.rest
`);

// Bubbly person waves hello!
```

**Words → Vertices → Motion → Life!** 🎯

The more words you add to VSL vocabulary, the more expressive your bubbly people become!

