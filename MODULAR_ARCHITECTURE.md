# 🏗️ PixelProdigy Modular Architecture

## 🎯 Product Separation Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PIXELPRODIGY ECOSYSTEM                           │
│                  3 Standalone Applications                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌─────────────────┐  ┌────────────────────┐
│  SCULPT ENGINE   │  │ ANIMATION STUDIO│  │  WORLD BUILDER     │
│  pixelprodigy    │  │ animation-      │  │  world-builder     │
│  3d.html         │  │ studio.html     │  │  .html             │
├──────────────────┤  ├─────────────────┤  ├────────────────────┤
│                  │  │                 │  │                    │
│ 🔨 Selection     │  │ 🎬 Timeline     │  │ 🌍 Terrain Gen    │
│ ✂️ Manipulation  │  │ ⏱️ Keyframes    │  │ 🌲 Procedural     │
│ 📚 Layers        │  │ 📹 Recording    │  │ 🤖 AI Generation  │
│ 🎨 Materials     │  │ 🎥 Camera Paths │  │ ☁️ Weather        │
│ 💾 Export 3D     │  │ 🎞️ Video Export │  │ 🏔️ Biomes        │
│                  │  │                 │  │                    │
│ FREE: 10K polys  │  │ FREE: 30s/720p  │  │ FREE: 1km² map    │
│ PRO: $9/mo       │  │ CREATOR: $19/mo │  │ EXPLORER: $14/mo  │
│                  │  │                 │  │                    │
└────────┬─────────┘  └────────┬────────┘  └─────────┬──────────┘
         │                     │                      │
         └─────────────────────┴──────────────────────┘
                               │
                    ┌──────────▼────────────┐
                    │   SHARED CORE LIB     │
                    │   shared-core.js      │
                    ├───────────────────────┤
                    │ • THREE.js renderer   │
                    │ • Camera controls     │
                    │ • Scene management    │
                    │ • AI assistant API    │
                    │ • File system         │
                    │ • Undo/Redo stack     │
                    │ • Material system     │
                    │ • Cloud sync          │
                    └───────────────────────┘
```

---

## 📦 File Structure

```
PixelProdigyAI/
├── shared/
│   ├── core.js              # Base class for all apps
│   ├── renderer.js          # THREE.js setup
│   ├── camera-controls.js   # Orbit + Flight
│   ├── ai-assistant.js      # OpenAI/Gemini integration
│   ├── file-system.js       # Save/load/export
│   ├── undo-stack.js        # Undo/redo logic
│   ├── materials.js         # PBR material system
│   └── cloud-sync.js        # Optional cloud storage
│
├── sculpt-engine/
│   ├── index.html           # Sculpt Engine app
│   ├── selection-tools.js   # Box/Circle/Lasso select
│   ├── manipulation.js      # Grab/Smooth/Flatten
│   ├── creation-tools.js    # Extrude/Subdivide/Inflate
│   ├── destruction-tools.js # Carve/Decimate
│   └── generators.js        # Shape generators
│
├── animation-studio/
│   ├── index.html           # Animation Studio app
│   ├── timeline.js          # Timeline UI & logic
│   ├── keyframes.js         # Keyframe management
│   ├── easing.js            # 7 easing curves
│   ├── camera-paths.js      # Camera animation
│   └── video-export.js      # MP4/WebM/GIF export
│
├── world-builder/
│   ├── index.html           # World Builder app
│   ├── terrain-gen.js       # Heightmap generation
│   ├── procedural.js        # Tree/rock scattering
│   ├── biomes.js            # Desert/forest/snow
│   ├── weather.js           # Rain/fog/snow effects
│   └── ai-worldgen.js       # Text-to-world AI
│
└── docs/
    ├── DEPLOYMENT_STRATEGY.md
    ├── BOX_SELECT_GUIDE.md
    └── API_REFERENCE.md
```

---

## 🔌 Shared Core API

### **PixelProdigyCore Class**

```javascript
// shared/core.js
export class PixelProdigyCore {
  constructor(canvasId) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(canvasId), antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Shared state
    this.undoStack = new UndoStack(50);
    this.aiAssistant = new AIAssistant();
    this.fileSystem = new FileSystem();
    this.materials = new MaterialSystem();
    
    this.init();
  }
  
  init() {
    // Setup scene, lighting, helpers
    this.setupLighting();
    this.setupHelpers();
    this.animate();
  }
  
  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0x4a6073, 0.45));
    const dirLight = new THREE.DirectionalLight(0x9dcfff, 1.6);
    dirLight.position.set(6, 14, 10);
    this.scene.add(dirLight);
  }
  
  setupHelpers() {
    const axisHelper = new THREE.AxesHelper(3);
    this.scene.add(axisHelper);
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -2;
    this.scene.add(gridHelper);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  // Shared methods
  saveProject(name) { return this.fileSystem.save(name, this.scene); }
  loadProject(name) { return this.fileSystem.load(name); }
  undo() { return this.undoStack.undo(); }
  redo() { return this.undoStack.redo(); }
  exportScene(format) { return this.fileSystem.export(this.scene, format); }
}
```

---

## 🔨 Sculpt Engine Extension

```javascript
// sculpt-engine/index.js
import { PixelProdigyCore } from '../shared/core.js';
import { SelectionTools } from './selection-tools.js';
import { ManipulationTools } from './manipulation.js';

export class SculptEngine extends PixelProdigyCore {
  constructor() {
    super('canvas3d');
    
    // Sculpt-specific tools
    this.selection = new SelectionTools(this);
    this.manipulation = new ManipulationTools(this);
    
    // Sculpt state
    this.selectedVertices = new Set();
    this.brushSize = 1.0;
    this.brushStrength = 0.5;
    
    this.initSculptTools();
  }
  
  initSculptTools() {
    // Box Select (B key)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'b') this.selection.toggleBoxSelect();
    });
    
    // Grab Tool (G key)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'g') this.manipulation.activateGrabTool();
    });
  }
  
  // Sculpt-specific methods
  boxSelect(start, end, modifier) {
    return this.selection.boxSelect(start, end, modifier);
  }
  
  grabTool(vertices, direction) {
    return this.manipulation.grab(vertices, direction);
  }
  
  smoothTool(vertices, strength) {
    return this.manipulation.smooth(vertices, strength);
  }
}

// Initialize Sculpt Engine
const app = new SculptEngine();
```

---

## 🎬 Animation Studio Extension

```javascript
// animation-studio/index.js
import { PixelProdigyCore } from '../shared/core.js';
import { Timeline } from './timeline.js';
import { Keyframes } from './keyframes.js';
import { VideoExport } from './video-export.js';

export class AnimationStudio extends PixelProdigyCore {
  constructor() {
    super('canvas3d');
    
    // Animation-specific systems
    this.timeline = new Timeline(this);
    this.keyframes = new Keyframes(this);
    this.videoExport = new VideoExport(this);
    
    // Animation state
    this.currentFrame = 0;
    this.totalFrames = 300; // 10 seconds @ 30fps
    this.isPlaying = false;
    this.recordedKeyframes = [];
    
    this.initAnimationTools();
  }
  
  initAnimationTools() {
    // Spacebar to play/pause
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') this.togglePlayback();
    });
    
    // K key to add keyframe
    window.addEventListener('keydown', (e) => {
      if (e.key === 'k') this.addKeyframe();
    });
  }
  
  // Animation-specific methods
  addKeyframe() {
    const keyframe = {
      frame: this.currentFrame,
      cameraPos: this.camera.position.clone(),
      cameraRot: this.camera.rotation.clone(),
      objects: this.captureObjectStates()
    };
    this.keyframes.add(keyframe);
    console.log(`🎬 Keyframe added at frame ${this.currentFrame}`);
  }
  
  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      console.log('▶️ Playing animation');
      this.playAnimation();
    } else {
      console.log('⏸️ Paused animation');
    }
  }
  
  playAnimation() {
    if (!this.isPlaying) return;
    
    this.currentFrame++;
    if (this.currentFrame >= this.totalFrames) {
      this.currentFrame = 0;
    }
    
    this.interpolateFrame(this.currentFrame);
    requestAnimationFrame(() => this.playAnimation());
  }
  
  exportVideo(format, quality) {
    return this.videoExport.render(format, quality);
  }
}

// Initialize Animation Studio
const app = new AnimationStudio();
```

---

## 🌍 World Builder Extension

```javascript
// world-builder/index.js
import { PixelProdigyCore } from '../shared/core.js';
import { TerrainGenerator } from './terrain-gen.js';
import { ProceduralPlacer } from './procedural.js';
import { AIWorldGen } from './ai-worldgen.js';

export class WorldBuilder extends PixelProdigyCore {
  constructor() {
    super('canvas3d');
    
    // World-specific systems
    this.terrainGen = new TerrainGenerator(this);
    this.procedural = new ProceduralPlacer(this);
    this.aiWorldGen = new AIWorldGen(this);
    
    // World state
    this.worldSize = 1000; // 1km × 1km
    this.biome = 'temperate';
    this.weather = null;
    
    this.initWorldTools();
  }
  
  initWorldTools() {
    // T key for terrain generation
    window.addEventListener('keydown', (e) => {
      if (e.key === 't') this.generateTerrain();
    });
    
    // P key for procedural placement
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p') this.scatterObjects();
    });
  }
  
  // World-specific methods
  generateTerrain(options = {}) {
    const terrain = this.terrainGen.create({
      size: this.worldSize,
      biome: this.biome,
      seed: Math.random(),
      ...options
    });
    this.scene.add(terrain);
    console.log(`🏔️ Terrain generated: ${this.worldSize}m²`);
    return terrain;
  }
  
  scatterObjects(type, count) {
    return this.procedural.scatter(type, count);
  }
  
  textToWorld(prompt) {
    return this.aiWorldGen.generate(prompt);
  }
}

// Initialize World Builder
const app = new WorldBuilder();
```

---

## 🚀 Deployment Plan

### **Phase 1: Sculpt Engine (Week 1)** ✅
```bash
# Build
npm run build:sculpt

# Output
dist/
├── sculpt-engine.html     # 500KB minified
├── sculpt-engine.js       # Core + tools
└── shared-core.js         # Shared lib

# Deploy
- Vercel: sculpt.pixelprodigy.ai
- Electron: Windows/Mac/Linux builds
```

### **Phase 2: Animation Studio (Week 2)**
```bash
# Build
npm run build:animation

# Output
dist/
├── animation-studio.html  # 800KB minified
├── animation-studio.js    # Timeline + export
└── shared-core.js         # Shared lib (reused)

# Deploy
- Vercel: animate.pixelprodigy.ai
- Electron: Desktop app with FFmpeg
```

### **Phase 3: World Builder (Week 3)**
```bash
# Build
npm run build:world

# Output
dist/
├── world-builder.html     # 1.2MB minified
├── world-builder.js       # Terrain + AI
└── shared-core.js         # Shared lib (reused)

# Deploy
- Vercel: world.pixelprodigy.ai
- Cloud workers for AI generation
```

---

## 💰 Bundle Pricing

### **Individual Apps**
- Sculpt Engine: $9/mo
- Animation Studio: $19/mo
- World Builder: $14/mo

### **Bundle Discounts**
- **Creator Bundle**: Sculpt + Animation = $24/mo (save $4)
- **Builder Bundle**: Sculpt + World = $20/mo (save $3)
- **Complete Suite**: All 3 = $35/mo (save $7)

### **Enterprise**
- All apps + Cloud + API = $99/mo
- Team collaboration (5 seats)
- Priority support
- White-label option

---

## 📊 Success Metrics Per App

### **Sculpt Engine**
- DAU: 500+ users
- Avg session: 15 min
- Export rate: 30% (users export models)
- Conversion: 5% free → pro

### **Animation Studio**
- DAU: 200+ users
- Avg session: 30 min
- Export rate: 60% (users export videos)
- Conversion: 10% free → creator

### **World Builder**
- DAU: 100+ users
- Avg session: 45 min
- Export rate: 40% (users export worlds)
- Conversion: 8% free → explorer

---

**Ready to build the next 3 selection tools?** This will complete the Sculpt Engine foundation! 🚀

Let me know when you want to continue!

