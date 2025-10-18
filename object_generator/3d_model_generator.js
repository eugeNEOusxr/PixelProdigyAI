// PixelProdigy AI - 3D Object Generator
// Creates procedural 3D models using Three.js geometry

const THREE = require('three');
const fs = require('fs');
const path = require('path');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter');

class Object3DGenerator {
  constructor() {
    this.exportPath = './generated_objects/models';
    this.texturesPath = './generated_objects/textures';
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.exportPath)) {
      fs.mkdirSync(this.exportPath, { recursive: true });
    }
    if (!fs.existsSync(this.texturesPath)) {
      fs.mkdirSync(this.texturesPath, { recursive: true });
    }
  }

  // FURNITURE GENERATORS

  generateChair(variant = 'office') {
    const group = new THREE.Group();
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: this.getRandomColor(),
      metalness: 0.1,
      roughness: 0.8
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.5;
    group.add(seat);

    // Backrest
    const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0, 0.75, -0.225);
    group.add(back);

    // Legs (4)
    const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3
    });

    const legPositions = [
      [-0.2, 0.25, 0.2],
      [0.2, 0.25, 0.2],
      [-0.2, 0.25, -0.2],
      [0.2, 0.25, -0.2]
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      group.add(leg);
    });

    // Office chair specific - add wheels
    if (variant === 'office') {
      legPositions.forEach(pos => {
        const wheelGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.03);
        const wheelMaterial = new THREE.MeshStandardMaterial({
          color: 0x222222,
          metalness: 0.9,
          roughness: 0.2
        });
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos[0], 0.02, pos[2]);
        group.add(wheel);
      });
    }

    return group;
  }

  generateTable(variant = 'dining') {
    const group = new THREE.Group();
    
    // Tabletop
    const topWidth = variant === 'coffee' ? 1.2 : 1.8;
    const topDepth = variant === 'coffee' ? 0.6 : 0.9;
    const topHeight = variant === 'coffee' ? 0.4 : 0.75;
    
    const topGeometry = new THREE.BoxGeometry(topWidth, 0.05, topDepth);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: this.getRandomColor(),
      metalness: 0.1,
      roughness: 0.6
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = topHeight;
    group.add(top);

    // Legs (4)
    const legHeight = topHeight - 0.025;
    const legGeometry = new THREE.BoxGeometry(0.08, legHeight, 0.08);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0,
      roughness: 0.9
    });

    const legOffset = {
      x: topWidth / 2 - 0.1,
      z: topDepth / 2 - 0.1
    };

    const legPositions = [
      [-legOffset.x, legHeight / 2, legOffset.z],
      [legOffset.x, legHeight / 2, legOffset.z],
      [-legOffset.x, legHeight / 2, -legOffset.z],
      [legOffset.x, legHeight / 2, -legOffset.z]
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      group.add(leg);
    });

    return group;
  }

  generateSofa(variant = 'modern') {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(2, 0.4, 0.8);
    const fabricMaterial = new THREE.MeshStandardMaterial({
      color: this.getRandomColor(),
      metalness: 0,
      roughness: 0.9
    });
    const base = new THREE.Mesh(baseGeometry, fabricMaterial);
    base.position.y = 0.2;
    group.add(base);

    // Backrest
    const backGeometry = new THREE.BoxGeometry(2, 0.6, 0.15);
    const back = new THREE.Mesh(backGeometry, fabricMaterial);
    back.position.set(0, 0.6, -0.325);
    group.add(back);

    // Armrests (2)
    const armGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.8);
    const leftArm = new THREE.Mesh(armGeometry, fabricMaterial);
    leftArm.position.set(-1.075, 0.4, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, fabricMaterial);
    rightArm.position.set(1.075, 0.4, 0);
    group.add(rightArm);

    // Cushions (3)
    const cushionGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6);
    for (let i = -1; i <= 1; i++) {
      const cushion = new THREE.Mesh(cushionGeometry, fabricMaterial);
      cushion.position.set(i * 0.65, 0.45, 0.1);
      group.add(cushion);
    }

    return group;
  }

  // ARCHITECTURE GENERATORS

  generateDoor(variant = 'standard') {
    const group = new THREE.Group();
    
    const doorWidth = 0.9;
    const doorHeight = 2.1;
    const doorThickness = 0.05;

    // Door panel
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: this.getRandomColor(),
      metalness: 0.3,
      roughness: 0.7
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, doorHeight / 2, 0);
    group.add(door);

    // Door handle
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      metalness: 0.9,
      roughness: 0.2
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(doorWidth / 2 - 0.15, doorHeight / 2, doorThickness / 2 + 0.08);
    group.add(handle);

    // Door frame
    const frameThickness = 0.08;
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0,
      roughness: 0.8
    });

    // Top frame
    const topFrameGeometry = new THREE.BoxGeometry(doorWidth + frameThickness * 2, frameThickness, frameThickness);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.position.set(0, doorHeight + frameThickness / 2, 0);
    group.add(topFrame);

    // Side frames
    const sideFrameGeometry = new THREE.BoxGeometry(frameThickness, doorHeight, frameThickness);
    
    const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    leftFrame.position.set(-doorWidth / 2 - frameThickness / 2, doorHeight / 2, 0);
    group.add(leftFrame);

    const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    rightFrame.position.set(doorWidth / 2 + frameThickness / 2, doorHeight / 2, 0);
    group.add(rightFrame);

    return group;
  }

  generateWindow(variant = 'standard') {
    const group = new THREE.Group();
    
    const windowWidth = 1.2;
    const windowHeight = 1.5;
    const frameDepth = 0.1;

    // Glass pane
    const glassGeometry = new THREE.PlaneGeometry(windowWidth - 0.1, windowHeight - 0.1);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88CCFF,
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      transparent: true,
      opacity: 0.3
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.z = 0.05;
    group.add(glass);

    // Window frame
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0.1,
      roughness: 0.7
    });

    // Outer frame
    const frameThickness = 0.05;
    
    // Top
    const topFrameGeometry = new THREE.BoxGeometry(windowWidth, frameThickness, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.position.set(0, windowHeight / 2, 0);
    group.add(topFrame);

    // Bottom
    const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    bottomFrame.position.set(0, -windowHeight / 2, 0);
    group.add(bottomFrame);

    // Sides
    const sideFrameGeometry = new THREE.BoxGeometry(frameThickness, windowHeight, frameDepth);
    
    const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    leftFrame.position.set(-windowWidth / 2, 0, 0);
    group.add(leftFrame);

    const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    rightFrame.position.set(windowWidth / 2, 0, 0);
    group.add(rightFrame);

    // Cross divider (vertical)
    const divider = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    divider.position.set(0, 0, 0);
    group.add(divider);

    return group;
  }

  // ELECTRONICS GENERATORS

  generateTelevision(variant = 'modern') {
    const group = new THREE.Group();
    
    const screenWidth = 1.2;
    const screenHeight = 0.7;
    const screenThickness = 0.05;

    // Screen
    const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, screenThickness);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.8,
      roughness: 0.2
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, screenHeight / 2, 0);
    group.add(screen);

    // Display (glowing screen)
    const displayGeometry = new THREE.PlaneGeometry(screenWidth - 0.05, screenHeight - 0.05);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: 0x4444FF,
      emissive: 0x2222FF,
      emissiveIntensity: 0.5
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, screenHeight / 2, screenThickness / 2 + 0.001);
    group.add(display);

    // Stand
    const standGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.1);
    const standMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3
    });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(0, -0.05, 0);
    group.add(stand);

    return group;
  }

  // NATURE GENERATORS

  generateTree(variant = 'oak') {
    const group = new THREE.Group();
    
    // Trunk
    const trunkHeight = 3;
    const trunkRadius = 0.3;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius + 0.1, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    group.add(trunk);

    // Foliage (sphere for simplicity, could be more complex)
    const foliageGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      metalness: 0,
      roughness: 0.9
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunkHeight + 0.5;
    group.add(foliage);

    return group;
  }

  generatePlant(variant = 'potted') {
    const group = new THREE.Group();
    
    // Pot
    const potGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.2, 16);
    const potMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0,
      roughness: 0.8
    });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.y = 0.1;
    group.add(pot);

    // Soil
    const soilGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.02);
    const soilMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      metalness: 0,
      roughness: 1
    });
    const soil = new THREE.Mesh(soilGeometry, soilMaterial);
    soil.position.y = 0.21;
    group.add(soil);

    // Leaves (simplified as spheres on stems)
    for (let i = 0; i < 5; i++) {
      const stemGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3);
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        metalness: 0,
        roughness: 0.9
      });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      
      const angle = (i / 5) * Math.PI * 2;
      const radius = 0.08;
      stem.position.set(
        Math.cos(angle) * radius,
        0.35,
        Math.sin(angle) * radius
      );
      stem.rotation.z = Math.cos(angle) * 0.3;
      group.add(stem);

      const leafGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FF00,
        metalness: 0,
        roughness: 0.7
      });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(
        Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius
      );
      group.add(leaf);
    }

    return group;
  }

  // UTILITY FUNCTIONS

  getRandomColor() {
    const colors = [
      0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A,
      0x98D8C8, 0xF7DC6F, 0xBB8FCE, 0x85C1E2,
      0xC39BD3, 0x76D7C4, 0xF8B500, 0xFF7979
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async exportToGLTF(object, filename) {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      
      exporter.parse(
        object,
        (gltf) => {
          const outputPath = path.join(this.exportPath, `${filename}.gltf`);
          fs.writeFileSync(outputPath, JSON.stringify(gltf, null, 2));
          console.log(`✅ Exported: ${filename}.gltf`);
          resolve(outputPath);
        },
        (error) => {
          console.error(`❌ Export error for ${filename}:`, error);
          reject(error);
        },
        { binary: false }
      );
    });
  }

  async generateAll() {
    console.log('🎨 Starting 3D Model Generation...\n');

    const objects = [
      // Furniture
      { type: 'chair', variant: 'office', name: 'office_chair' },
      { type: 'chair', variant: 'dining', name: 'dining_chair' },
      { type: 'table', variant: 'dining', name: 'dining_table' },
      { type: 'table', variant: 'coffee', name: 'coffee_table' },
      { type: 'sofa', variant: 'modern', name: 'modern_sofa' },
      
      // Architecture
      { type: 'door', variant: 'standard', name: 'standard_door' },
      { type: 'window', variant: 'standard', name: 'standard_window' },
      
      // Electronics
      { type: 'television', variant: 'modern', name: 'modern_tv' },
      
      // Nature
      { type: 'tree', variant: 'oak', name: 'oak_tree' },
      { type: 'plant', variant: 'potted', name: 'potted_plant' }
    ];

    for (const obj of objects) {
      try {
        let model;
        
        switch(obj.type) {
          case 'chair': model = this.generateChair(obj.variant); break;
          case 'table': model = this.generateTable(obj.variant); break;
          case 'sofa': model = this.generateSofa(obj.variant); break;
          case 'door': model = this.generateDoor(obj.variant); break;
          case 'window': model = this.generateWindow(obj.variant); break;
          case 'television': model = this.generateTelevision(obj.variant); break;
          case 'tree': model = this.generateTree(obj.variant); break;
          case 'plant': model = this.generatePlant(obj.variant); break;
        }
        
        if (model) {
          await this.exportToGLTF(model, obj.name);
        }
      } catch (error) {
        console.error(`Error generating ${obj.name}:`, error);
      }
    }

    console.log('\n🎉 3D Model Generation Complete!');
    console.log(`📁 Models exported to: ${this.exportPath}`);
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new Object3DGenerator();
  generator.generateAll().catch(console.error);
}

module.exports = Object3DGenerator;
