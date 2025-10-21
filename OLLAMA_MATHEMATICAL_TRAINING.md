# 🧮 OLLAMA MATHEMATICAL TRAINING - 3D VERTEX GENERATION MASTERY

## 📘 SYSTEM PROMPT FOR LLAMA 3.1

**Use this as the system prompt when asking Ollama to generate 3D geometry:**

```
You are a mathematical genius specializing in 3D geometry, computational graphics, and procedural generation. You have mastered:

1. Sacred geometry (Fibonacci, golden ratio, Platonic solids)
2. Three.js BufferGeometry vertex generation
3. Parametric equations for curves and surfaces
4. Fractal mathematics (L-systems, Mandelbrot, Julia sets)
5. Physics-based vertex distribution
6. Optimization for real-time 3D rendering

When generating 3D objects, you MUST:
- Return executable JavaScript code for Three.js
- Use BufferGeometry for performance
- Include position, normal, and UV attributes
- Follow mathematical principles (no random guessing)
- Optimize vertex count (prefer quality over quantity)
- Add comments explaining the mathematics

Your code will be executed in a live 3D engine, so it must be production-ready.
```

---

## 🔷 CORE MATHEMATICAL PRINCIPLES

### 1. THE GOLDEN RATIO (φ = 1.618033988749...)

**Why it matters:**
- Found in nature (spirals, flower petals, human body)
- Aesthetically pleasing proportions
- Creates organic, natural-looking structures

**Applications in 3D:**

#### Building Proportions
```javascript
const PHI = 1.618033988749;

// Golden ratio building dimensions
function createGoldenBuilding() {
    const baseWidth = 10;
    const height = baseWidth * PHI;        // 16.18m tall
    const depth = baseWidth / PHI;          // 6.18m deep
    
    const geometry = new THREE.BoxGeometry(baseWidth, height, depth);
    return new THREE.Mesh(geometry, material);
}
```

#### Golden Angle (137.5°)
```javascript
// Perfect for spirals (sunflower seeds, pinecones)
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 2.399963 radians

function createSunflowerSpiral(pointCount = 500) {
    const positions = new Float32Array(pointCount * 3);
    
    for (let i = 0; i < pointCount; i++) {
        const theta = i * GOLDEN_ANGLE;
        const r = Math.sqrt(i) * 0.5;  // Spiral grows outward
        
        positions[i * 3] = r * Math.cos(theta);      // x
        positions[i * 3 + 1] = 0;                     // y (flat)
        positions[i * 3 + 2] = r * Math.sin(theta);  // z
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
}
```

---

### 2. FIBONACCI SEQUENCE (0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...)

**Why it matters:**
- Natural growth patterns
- Optimal packing (seeds, scales, leaves)
- Creates beautiful spirals

**Applications in 3D:**

#### Fibonacci Sphere Distribution
```javascript
// Evenly distribute points on a sphere using Fibonacci
function createFibonacciSphere(pointCount = 1000, radius = 10) {
    const positions = new Float32Array(pointCount * 3);
    const PHI = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < pointCount; i++) {
        // Fibonacci lattice on sphere
        const y = 1 - (i / (pointCount - 1)) * 2;  // -1 to 1
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = 2 * Math.PI * i / PHI;
        
        positions[i * 3] = Math.cos(theta) * radiusAtY * radius;     // x
        positions[i * 3 + 1] = y * radius;                           // y
        positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius; // z
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}
```

#### Fibonacci Tower Heights
```javascript
// Buildings get taller following Fibonacci sequence
function createFibonacciCityscape() {
    const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
    const buildings = [];
    
    fib.forEach((height, i) => {
        const geometry = new THREE.BoxGeometry(5, height, 5);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(i * 7, height / 2, 0);
        buildings.push(mesh);
    });
    
    return buildings;
}
```

---

### 3. PLATONIC SOLIDS (Perfect 3D Shapes)

**The 5 Perfect Solids:**
1. **Tetrahedron** - 4 triangular faces (fire element)
2. **Cube** - 6 square faces (earth element)
3. **Octahedron** - 8 triangular faces (air element)
4. **Dodecahedron** - 12 pentagonal faces (universe element)
5. **Icosahedron** - 20 triangular faces (water element)

**Why they matter:**
- Mathematically perfect (all faces, edges, angles identical)
- Used in crystalline structures, viral capsids, architecture
- Basis for geodesic domes (Buckminster Fuller)

**Applications:**

#### Generate Icosahedron (Most Important!)
```javascript
// 20 faces, 12 vertices - perfect for spheres
function createIcosahedron(radius = 10) {
    const PHI = (1 + Math.sqrt(5)) / 2;
    const a = radius / Math.sqrt(3);
    const b = a / PHI;
    
    // 12 vertices of icosahedron
    const vertices = [
        [-b,  a,  0], [ b,  a,  0], [-b, -a,  0], [ b, -a,  0],
        [ 0, -b,  a], [ 0,  b,  a], [ 0, -b, -a], [ 0,  b, -a],
        [ a,  0, -b], [ a,  0,  b], [-a,  0, -b], [-a,  0,  b]
    ];
    
    // 20 triangular faces (vertex indices)
    const faces = [
        [0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
        [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
        [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
        [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]
    ];
    
    const positions = [];
    faces.forEach(face => {
        face.forEach(vi => {
            positions.push(...vertices[vi]);
        });
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', 
        new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.computeVertexNormals();
    return geometry;
}
```

---

### 4. PARAMETRIC EQUATIONS (Mathematical Curves)

**Why they matter:**
- Generate complex organic shapes with simple formulas
- Spirals, helices, torus, Möbius strips
- Perfect for procedural generation

**Applications:**

#### Spiral Staircase (Helix)
```javascript
function createSpiralStaircase(turns = 3, stepsPerTurn = 12, radius = 5, height = 20) {
    const totalSteps = turns * stepsPerTurn;
    const positions = new Float32Array(totalSteps * 6 * 3); // 2 triangles per step
    
    for (let i = 0; i < totalSteps; i++) {
        const t = (i / totalSteps) * turns * 2 * Math.PI;
        const y = (i / totalSteps) * height;
        
        // Step position on helix
        const x = radius * Math.cos(t);
        const z = radius * Math.sin(t);
        
        // Create step platform (simplified as quad)
        const stepWidth = 2;
        const stepDepth = 1.5;
        
        // Add step vertices (you'd create proper geometry here)
        // This is where you'd generate the platform mesh
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}
```

#### Torus (Donut Shape)
```javascript
function createParametricTorus(majorRadius = 10, minorRadius = 3, segments = 64) {
    const positions = [];
    const normals = [];
    const uvs = [];
    
    for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * 2 * Math.PI;
        
        for (let j = 0; j <= segments; j++) {
            const v = (j / segments) * 2 * Math.PI;
            
            // Parametric torus equations
            const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
            const y = minorRadius * Math.sin(v);
            const z = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
            
            positions.push(x, y, z);
            
            // Normal vector
            const nx = Math.cos(v) * Math.cos(u);
            const ny = Math.sin(v);
            const nz = Math.cos(v) * Math.sin(u);
            normals.push(nx, ny, nz);
            
            // UV coordinates
            uvs.push(i / segments, j / segments);
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', 
        new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('normal', 
        new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.setAttribute('uv', 
        new THREE.BufferAttribute(new Float32Array(uvs), 2));
    
    return geometry;
}
```

---

### 5. FRACTALS (Self-Similar Patterns)

**Why they matter:**
- Nature is fractal (trees, mountains, coastlines, clouds)
- Infinite detail at every scale
- Efficient (small code generates complex shapes)

**Applications:**

#### L-System Tree Generation
```javascript
// Lindenmayer System for procedural trees
function generateLSystemTree(iterations = 5) {
    let axiom = 'F';
    const rules = {
        'F': 'FF+[+F-F-F]-[-F+F+F]'  // Branch splitting rule
    };
    
    // Generate string
    let current = axiom;
    for (let i = 0; i < iterations; i++) {
        let next = '';
        for (let char of current) {
            next += rules[char] || char;
        }
        current = next;
    }
    
    // Interpret string as 3D turtle graphics
    const positions = [];
    const stack = [];
    let pos = new THREE.Vector3(0, 0, 0);
    let dir = new THREE.Vector3(0, 1, 0);
    const angle = 25 * Math.PI / 180;
    const length = 0.5;
    
    for (let char of current) {
        switch(char) {
            case 'F':
                // Draw forward
                const newPos = pos.clone().add(dir.clone().multiplyScalar(length));
                positions.push(pos.x, pos.y, pos.z);
                positions.push(newPos.x, newPos.y, newPos.z);
                pos = newPos;
                break;
            case '+':
                // Rotate right
                dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
                break;
            case '-':
                // Rotate left
                dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -angle);
                break;
            case '[':
                // Save state
                stack.push({ pos: pos.clone(), dir: dir.clone() });
                break;
            case ']':
                // Restore state
                const state = stack.pop();
                pos = state.pos;
                dir = state.dir;
                break;
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', 
        new THREE.BufferAttribute(new Float32Array(positions), 3));
    return geometry;
}
```

#### Fractal Mountain Terrain (Diamond-Square Algorithm)
```javascript
function generateFractalTerrain(size = 129, roughness = 0.7) {
    // Size must be 2^n + 1 (e.g., 129 = 2^7 + 1)
    const heightMap = new Array(size * size).fill(0);
    
    // Set corner heights
    heightMap[0] = Math.random();
    heightMap[size - 1] = Math.random();
    heightMap[size * (size - 1)] = Math.random();
    heightMap[size * size - 1] = Math.random();
    
    let stepSize = size - 1;
    let scale = 1.0;
    
    while (stepSize > 1) {
        const halfStep = stepSize / 2;
        
        // Diamond step
        for (let y = halfStep; y < size; y += stepSize) {
            for (let x = halfStep; x < size; x += stepSize) {
                const avg = (
                    heightMap[(y - halfStep) * size + (x - halfStep)] +
                    heightMap[(y - halfStep) * size + (x + halfStep)] +
                    heightMap[(y + halfStep) * size + (x - halfStep)] +
                    heightMap[(y + halfStep) * size + (x + halfStep)]
                ) / 4;
                
                heightMap[y * size + x] = avg + (Math.random() - 0.5) * scale;
            }
        }
        
        // Square step
        for (let y = 0; y < size; y += halfStep) {
            for (let x = (y + halfStep) % stepSize; x < size; x += stepSize) {
                let sum = 0, count = 0;
                
                if (y - halfStep >= 0) { sum += heightMap[(y - halfStep) * size + x]; count++; }
                if (y + halfStep < size) { sum += heightMap[(y + halfStep) * size + x]; count++; }
                if (x - halfStep >= 0) { sum += heightMap[y * size + (x - halfStep)]; count++; }
                if (x + halfStep < size) { sum += heightMap[y * size + (x + halfStep)]; count++; }
                
                heightMap[y * size + x] = sum / count + (Math.random() - 0.5) * scale;
            }
        }
        
        stepSize /= 2;
        scale *= roughness;
    }
    
    // Convert heightmap to Three.js geometry
    const positions = new Float32Array(size * size * 3);
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 3;
            positions[i] = x - size / 2;
            positions[i + 1] = heightMap[y * size + x] * 20; // Scale height
            positions[i + 2] = y - size / 2;
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}
```

---

### 6. PERLIN/SIMPLEX NOISE (Organic Randomness)

**Why it matters:**
- Creates smooth, natural-looking randomness
- Used in Minecraft, No Man's Sky, every procedural game
- Better than random() - has continuity

**Applications:**

#### Organic Terrain with Noise
```javascript
// You'd use a noise library like simplex-noise, but here's the concept
function createNoiseTerrain(width = 100, depth = 100, scale = 20) {
    const positions = new Float32Array(width * depth * 3);
    
    for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
            const i = (z * width + x) * 3;
            
            // Multiple octaves of noise for detail
            let height = 0;
            let frequency = 0.05;
            let amplitude = 1;
            
            for (let octave = 0; octave < 4; octave++) {
                // Pseudo-Perlin (use real library in production)
                height += Math.sin(x * frequency) * 
                         Math.cos(z * frequency) * 
                         amplitude;
                
                frequency *= 2;
                amplitude *= 0.5;
            }
            
            positions[i] = x - width / 2;
            positions[i + 1] = height * scale;
            positions[i + 2] = z - depth / 2;
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}
```

---

### 7. VORONOI DIAGRAMS (Organic Cells)

**Why it matters:**
- Natural cell patterns (giraffe skin, cracked mud, leaf veins)
- Efficient space partitioning
- Creates organic, non-uniform structures

**Applications:**

#### Procedural Stone Wall (Voronoi Cells)
```javascript
function createVoronoiWall(width = 20, height = 10, cellCount = 50) {
    // Generate random seed points
    const seeds = [];
    for (let i = 0; i < cellCount; i++) {
        seeds.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: 0
        });
    }
    
    // For each point on wall surface, find nearest seed
    const resolution = 100;
    const positions = [];
    
    for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
            const worldX = (x / resolution) * width;
            const worldY = (y / resolution) * height;
            
            // Find closest seed
            let minDist = Infinity;
            let closestSeed = null;
            
            seeds.forEach(seed => {
                const dist = Math.sqrt(
                    (worldX - seed.x) ** 2 + 
                    (worldY - seed.y) ** 2
                );
                if (dist < minDist) {
                    minDist = dist;
                    closestSeed = seed;
                }
            });
            
            // Depth based on distance (creates relief)
            const depth = Math.min(minDist * 0.5, 1);
            
            positions.push(worldX, worldY, depth);
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', 
        new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.computeVertexNormals();
    return geometry;
}
```

---

### 8. CATMULL-ROM SPLINES (Smooth Curves Through Points)

**Why it matters:**
- Create smooth paths through control points
- Used for roads, rivers, roller coasters
- Interpolates smoothly without sharp corners

**Applications:**

#### Procedural River Path
```javascript
function createRiverPath(controlPoints, segments = 50) {
    // controlPoints = [[x1,y1,z1], [x2,y2,z2], ...]
    const curve = new THREE.CatmullRomCurve3(
        controlPoints.map(p => new THREE.Vector3(...p))
    );
    
    const points = curve.getPoints(segments);
    const positions = new Float32Array(points.length * 3);
    
    points.forEach((point, i) => {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
}
```

---

## 🎯 EXAMPLE PROMPTS FOR OLLAMA

### Prompt Template for Building Generation
```
Generate a medieval castle using sacred geometry principles.

Requirements:
- Main keep: golden ratio proportions (φ = 1.618)
- 4 corner towers: Fibonacci heights (8m, 13m, 21m, 34m)
- Walls: 3m thick, form golden rectangle
- Use BufferGeometry for performance
- Include vertex positions, normals, and UVs
- Total vertex count: < 50,000

Return ONLY executable Three.js JavaScript code.
```

### Prompt Template for Terrain
```
Generate organic terrain using fractal noise.

Requirements:
- Size: 100x100 units
- Use multi-octave Perlin noise (4 octaves)
- Frequency: 0.05 (smooth rolling hills)
- Amplitude: 15 units (moderate elevation changes)
- Use BufferGeometry
- Compute vertex normals for lighting

Return ONLY executable Three.js JavaScript code.
```

### Prompt Template for Trees
```
Generate a procedural tree using L-System fractals.

Requirements:
- Axiom: "F"
- Rule: F → FF+[+F-F-F]-[-F+F+F]
- Iterations: 4
- Branch angle: 25 degrees
- Use LineSegments geometry for branches
- Green leaves at branch endpoints (small spheres)

Return ONLY executable Three.js JavaScript code.
```

---

## 🧪 TEST PROMPTS (Feed these to Ollama)

### Test 1: Fibonacci Sphere
```bash
ollama run llama3.1:8b

Prompt:
"Generate a Fibonacci sphere with 1000 points using the golden angle (2.399963 radians).
Use Three.js BufferGeometry. Include position attribute and compute normals.
Return ONLY the JavaScript function, no explanations."
```

### Test 2: Golden Ratio Building
```bash
ollama run llama3.1:8b

Prompt:
"Create a building with golden ratio proportions. Base width: 10m.
Height = width * φ (1.618). Depth = width / φ.
Use BoxGeometry, return complete Three.js mesh creation code."
```

### Test 3: Spiral Staircase
```bash
ollama run llama3.1:8b

Prompt:
"Generate a spiral staircase using parametric helix equations.
Parameters: 3 turns, 12 steps per turn, radius 5m, total height 20m.
Use BufferGeometry. Return executable Three.js code."
```

---

## 📚 MATHEMATICAL FORMULAS REFERENCE

### Essential Constants
```javascript
const PI = Math.PI;                                    // 3.14159...
const PHI = (1 + Math.sqrt(5)) / 2;                   // 1.618... (golden ratio)
const GOLDEN_ANGLE = PI * (3 - Math.sqrt(5));         // 2.399... radians (137.5°)
const E = Math.E;                                      // 2.71828... (Euler's number)
const SQRT2 = Math.sqrt(2);                           // 1.41421...
const SQRT3 = Math.sqrt(3);                           // 1.73205...
```

### Coordinate Conversions
```javascript
// Spherical to Cartesian
function sphericalToCartesian(radius, theta, phi) {
    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi)
    };
}

// Cylindrical to Cartesian
function cylindricalToCartesian(radius, theta, height) {
    return {
        x: radius * Math.cos(theta),
        y: height,
        z: radius * Math.sin(theta)
    };
}
```

### Distance Formulas
```javascript
// Euclidean distance 3D
function distance3D(p1, p2) {
    return Math.sqrt(
        (p2.x - p1.x) ** 2 +
        (p2.y - p1.y) ** 2 +
        (p2.z - p1.z) ** 2
    );
}

// Manhattan distance
function manhattanDistance(p1, p2) {
    return Math.abs(p2.x - p1.x) + 
           Math.abs(p2.y - p1.y) + 
           Math.abs(p2.z - p1.z);
}
```

---

## ✅ OLLAMA TRAINING CHECKLIST

Feed Ollama these concepts in order:

1. ✅ **Golden Ratio** - Base proportions
2. ✅ **Fibonacci Sequence** - Growth patterns
3. ✅ **Platonic Solids** - Perfect 3D forms
4. ✅ **Parametric Equations** - Curves and surfaces
5. ✅ **Fractals** - Self-similar patterns
6. ✅ **Perlin Noise** - Organic randomness
7. ✅ **Voronoi Diagrams** - Cell patterns
8. ✅ **Splines** - Smooth paths

---

## 🎓 FINAL TRAINING PROMPT FOR OLLAMA

**Copy/paste this into Ollama to teach it everything:**

```
You are now a 3D geometry expert. You will generate Three.js code for procedural 3D objects.

CORE PRINCIPLES:
1. Golden Ratio (φ = 1.618) - Use for proportions
2. Fibonacci (0,1,1,2,3,5,8,13...) - Use for sequences
3. Golden Angle (2.399963 rad) - Use for spirals
4. Platonic Solids - Use for base shapes
5. Fractals - Use for organic complexity
6. Perlin Noise - Use for terrain
7. Parametric Equations - Use for curves

ALWAYS:
- Return executable JavaScript for Three.js
- Use BufferGeometry (not Geometry - deprecated)
- Include position, normal, UV attributes
- Optimize vertex count
- Add mathematical comments
- Follow sacred geometry principles

NEVER:
- Use random() without purpose
- Ignore performance
- Return explanations (code only)
- Forget to compute normals

Example output format:
```javascript
function createFibonacciSphere(count = 1000, radius = 10) {
    const positions = new Float32Array(count * 3);
    const PHI = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = 2 * Math.PI * i / PHI;
        
        positions[i * 3] = Math.cos(theta) * radiusAtY * radius;
        positions[i * 3 + 1] = y * radius;
        positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}
```

You are ready to generate 3D worlds. Respond "READY" if you understand.
```

---

## 🚀 NEXT STEPS

1. **Train Ollama**: Run the final training prompt above
2. **Test with examples**: Try the test prompts
3. **Integrate**: Use in `ai_world_generator.js`
4. **Iterate**: Refine based on results

**The vertex-to-macroverse journey begins!** 🌌

---

## 🧪 PRACTICAL TEST PROMPTS

Once Ollama is trained, test it with these prompts:

### Test 1: Golden Ratio Building
```
Generate a medieval castle using golden ratio proportions. Base width 20m. Return Three.js BufferGeometry code only.
```

**Expected**: Code with width=20, height≈32.36 (20*1.618), depth≈12.36 (20/1.618)

---

### Test 2: Fibonacci Sphere
```
Create a Fibonacci sphere with 1000 points, radius 15m. Use golden angle distribution. Return Three.js code only.
```

**Expected**: Points geometry using golden angle (2.399963 rad), evenly distributed

---

### Test 3: Fractal Tree
```
Generate an L-system tree with 5 iterations. Use rule: F -> FF+[+F-F-F]-[-F+F+F]. Branch angle 25°. Return Three.js code only.
```

**Expected**: LineSegments geometry showing branching tree structure

---

### Test 4: Parametric Torus
```
Create a parametric torus. Major radius 10m, minor radius 3m, 64 segments. Include normals and UVs. Return Three.js code only.
```

**Expected**: BufferGeometry with position, normal, uv attributes

---

### Test 5: Voronoi Village Layout
```
Generate a village with 10 buildings using Voronoi tessellation. Map size 100x100m. Return JSON with building positions and types.
```

**Expected**: JSON array with natural-looking clustered buildings

---

### Test 6: Terrain with Perlin Noise
```
Create fractal terrain using diamond-square algorithm. Size 129x129 vertices, roughness 0.7. Return Three.js PlaneGeometry code only.
```

**Expected**: Heightmap-based terrain with natural mountains/valleys

---

## 🔧 TRAINING SCRIPT

Save this as `train_ollama.sh`:

```bash
#!/bin/bash

# Train Ollama with mathematical principles for 3D vertex generation
# Usage: ./train_ollama.sh

echo "🦙 Training Ollama Llama 3.1 for 3D Geometry..."
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama not running. Start it with: ollama serve"
    exit 1
fi

# Check if llama3.1:8b is installed
if ! ollama list | grep -q "llama3.1:8b"; then
    echo "📦 Downloading llama3.1:8b (this takes ~5-10 min)..."
    ollama pull llama3.1:8b
fi

echo "✅ Ollama ready!"
echo ""

# The core training prompt
TRAINING_PROMPT="You are now a 3D geometry expert. You will generate Three.js code for procedural 3D objects.

CORE PRINCIPLES:
1. Golden Ratio (φ = 1.618) - Use for proportions
2. Fibonacci (0,1,1,2,3,5,8,13...) - Use for sequences
3. Golden Angle (2.399963 rad) - Use for spirals
4. Platonic Solids - Use for base shapes
5. Fractals - Use for organic complexity
6. Perlin Noise - Use for terrain
7. Parametric Equations - Use for curves

ALWAYS:
- Return executable JavaScript for Three.js
- Use BufferGeometry (not Geometry - deprecated)
- Include position, normal, UV attributes
- Optimize vertex count
- Add mathematical comments
- Follow sacred geometry principles

NEVER:
- Use random() without purpose
- Ignore performance
- Return explanations (code only)
- Forget to compute normals

Example output format:
\`\`\`javascript
function createFibonacciSphere(count = 1000, radius = 10) {
    const positions = new Float32Array(count * 3);
    const PHI = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = 2 * Math.PI * i / PHI;
        
        positions[i * 3] = Math.cos(theta) * radiusAtY * radius;
        positions[i * 3 + 1] = y * radius;
        positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}
\`\`\`

You are ready to generate 3D worlds. Respond \"READY\" if you understand."

echo "📖 Feeding training prompt to Ollama..."
echo ""

# Send training to Ollama
RESPONSE=$(curl -s http://localhost:11434/api/generate -d "{
  \"model\": \"llama3.1:8b\",
  \"prompt\": \"$TRAINING_PROMPT\",
  \"stream\": false,
  \"options\": {
    \"temperature\": 0.1
  }
}" | jq -r '.response')

echo "🤖 Llama 3.1 Response:"
echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -qi "ready"; then
    echo "✅ Training successful! Ollama is ready for 3D geometry generation."
    echo ""
    echo "🧪 Test it with:"
    echo "  ollama run llama3.1:8b 'Generate a Fibonacci sphere with 500 points. Return Three.js code only.'"
else
    echo "⚠️  Training sent, but uncertain response. Try running test prompts manually."
fi

echo ""
echo "🌟 Next: Run test_ollama_api.html to verify geometry generation"
```

Make it executable:
```bash
chmod +x train_ollama.sh
./train_ollama.sh
```

---

## 🎯 QUICK START COMMANDS

```bash
# 1. Ensure Ollama is running
systemctl status ollama

# 2. If not running, start it
sudo systemctl start ollama

# 3. Verify models installed
ollama list

# 4. Train Ollama
./train_ollama.sh

# 5. Test with simple prompt
ollama run llama3.1:8b "Generate a golden ratio cube. Return Three.js code only."

# 6. Open web test interface
firefox test_ollama_api.html  # or chrome/brave
```

---

## 📊 VALIDATION CHECKLIST

After training, verify Ollama understands:

- [ ] **Golden Ratio**: Returns proportions using 1.618
- [ ] **Fibonacci**: Uses sequence 0,1,1,2,3,5,8...
- [ ] **Golden Angle**: Uses 2.399963 radians for spirals
- [ ] **BufferGeometry**: Never uses deprecated Geometry
- [ ] **Normals**: Always calls computeVertexNormals()
- [ ] **Float32Array**: Uses typed arrays for performance
- [ ] **Comments**: Explains mathematical principles
- [ ] **No explanations**: Returns code only (unless asked for explanation)

---

## 🚀 INTEGRATION WITH AI WORLD GENERATOR

Once trained, update `ai_world_generator.js`:

```javascript
// In generateGeometry() method
async generateGeometry(description) {
    const prompt = `${description}. Use mathematical principles (golden ratio, Fibonacci, parametric equations). Return Three.js BufferGeometry code only. No explanations.`;
    
    const response = await this.ask('mathematician', prompt, {
        temperature: 0.2  // Low = precise math
    });
    
    return this.extractCode(response);
}
```

Test in `ai_world_demo.html`:
1. Type: `/geometry fibonacci sphere`
2. Llama generates code
3. Code executes in Three.js
4. Sphere appears in viewport

**The AI is now trained to build your universe!** 🌌✨

````
