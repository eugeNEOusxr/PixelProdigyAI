/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║              VLS COMPILER - Vertex Language System                    ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Compiles shorthand VLS syntax into THREE.js geometry                 ║
 * ║ Meta AI Optimized for rapid 3D object creation                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class VLSCompiler {
  /**
   * Compile VLS code into THREE.js mesh
   * @param {string} vlsCode - VLS shorthand code
   * @param {object} options - Rendering options
   * @returns {THREE.Mesh} - Compiled 3D mesh
   */
  static compile(vlsCode, options = {}) {
    const lines = vlsCode.trim().split('\n');
    const commands = lines.map(line => this.parseLine(line)).filter(cmd => cmd);
    
    return this.buildMesh(commands, options);
  }

  /**
   * Parse a single VLS command line
   * VLS Syntax Examples:
   * - BOX 2,3,1 #FF0000    (width, height, depth, color)
   * - SPHERE 1.5 #00FF00   (radius, color)
   * - CYLINDER 0.5,3 #0000FF (radius, height, color)
   * - POS 0,1,0            (x, y, z position)
   * - ROT 0,45,0           (x, y, z rotation in degrees)
   * - MAT shiny            (material type: basic, standard, phong, shiny, glass)
   */
  static parseLine(line) {
    line = line.trim();
    if (!line || line.startsWith('//')) return null;

    const parts = line.split(/\s+/);
    const command = parts[0].toUpperCase();
    
    return {
      type: command,
      params: parts.slice(1).join(' ')
    };
  }

  /**
   * Build THREE.js mesh from parsed commands
   */
  static buildMesh(commands, options) {
    let geometry = null;
    let material = null;
    let position = new THREE.Vector3(0, 0, 0);
    let rotation = new THREE.Euler(0, 0, 0);
    let scale = new THREE.Vector3(1, 1, 1);
    let color = 0xffffff;
    let materialType = 'standard';

    for (const cmd of commands) {
      switch (cmd.type) {
        case 'BOX':
          geometry = this.createBox(cmd.params);
          break;
        case 'SPHERE':
          geometry = this.createSphere(cmd.params);
          break;
        case 'CYLINDER':
          geometry = this.createCylinder(cmd.params);
          break;
        case 'CONE':
          geometry = this.createCone(cmd.params);
          break;
        case 'TORUS':
          geometry = this.createTorus(cmd.params);
          break;
        case 'PLANE':
          geometry = this.createPlane(cmd.params);
          break;
        case 'CAPSULE':
          geometry = this.createCapsule(cmd.params);
          break;
        case 'CUSTOM':
          geometry = this.createCustom(cmd.params);
          break;
        case 'POS':
          position = this.parseVector3(cmd.params);
          break;
        case 'ROT':
          const rot = this.parseVector3(cmd.params);
          rotation = new THREE.Euler(
            THREE.MathUtils.degToRad(rot.x),
            THREE.MathUtils.degToRad(rot.y),
            THREE.MathUtils.degToRad(rot.z)
          );
          break;
        case 'SCALE':
          scale = this.parseVector3(cmd.params);
          break;
        case 'COLOR':
          color = this.parseColor(cmd.params);
          break;
        case 'MAT':
          materialType = cmd.params.trim().toLowerCase();
          break;
      }
    }

    // Create material
    material = this.createMaterial(materialType, color, options);

    // Create mesh
    if (!geometry) {
      console.warn('No geometry defined in VLS code');
      geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
    mesh.castShadow = options.castShadow !== false;
    mesh.receiveShadow = options.receiveShadow !== false;

    return mesh;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GEOMETRY CREATORS
  // ═══════════════════════════════════════════════════════════════════════

  static createBox(params) {
    const [w, h, d] = params.split(',').map(s => parseFloat(s.trim()));
    return new THREE.BoxGeometry(w || 1, h || 1, d || 1);
  }

  static createSphere(params) {
    const parts = params.split(',');
    const radius = parseFloat(parts[0]) || 1;
    const widthSeg = parseInt(parts[1]) || 32;
    const heightSeg = parseInt(parts[2]) || 32;
    return new THREE.SphereGeometry(radius, widthSeg, heightSeg);
  }

  static createCylinder(params) {
    const [r, h] = params.split(',').map(s => parseFloat(s.trim()));
    return new THREE.CylinderGeometry(r || 0.5, r || 0.5, h || 1, 32);
  }

  static createCone(params) {
    const [r, h] = params.split(',').map(s => parseFloat(s.trim()));
    return new THREE.ConeGeometry(r || 0.5, h || 1, 32);
  }

  static createTorus(params) {
    const [r, t] = params.split(',').map(s => parseFloat(s.trim()));
    return new THREE.TorusGeometry(r || 1, t || 0.4, 16, 100);
  }

  static createPlane(params) {
    const [w, h] = params.split(',').map(s => parseFloat(s.trim()));
    return new THREE.PlaneGeometry(w || 1, h || 1);
  }

  static createCapsule(params) {
    const [r, h] = params.split(',').map(s => parseFloat(s.trim()));
    return new THREE.CapsuleGeometry(r || 0.5, h || 1, 8, 16);
  }

  static createCustom(params) {
    // Custom vertex-based geometry
    // Format: CUSTOM v:x,y,z;x,y,z;... f:0,1,2;1,2,3;...
    const geometry = new THREE.BufferGeometry();
    
    const vertexMatch = params.match(/v:([\d\.,;-]+)/);
    const faceMatch = params.match(/f:([\d\.,;]+)/);
    
    if (vertexMatch) {
      const vertices = [];
      const vertexGroups = vertexMatch[1].split(';');
      vertexGroups.forEach(group => {
        const [x, y, z] = group.split(',').map(s => parseFloat(s.trim()));
        vertices.push(x, y, z);
      });
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    }
    
    if (faceMatch) {
      const indices = [];
      const faceGroups = faceMatch[1].split(';');
      faceGroups.forEach(group => {
        const face = group.split(',').map(s => parseInt(s.trim()));
        indices.push(...face);
      });
      geometry.setIndex(indices);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MATERIAL CREATORS
  // ═══════════════════════════════════════════════════════════════════════

  static createMaterial(type, color, options) {
    const matOptions = {
      color: color,
      ...options
    };

    switch (type) {
      case 'basic':
        return new THREE.MeshBasicMaterial(matOptions);
      
      case 'phong':
        return new THREE.MeshPhongMaterial({
          ...matOptions,
          shininess: 100
        });
      
      case 'shiny':
        return new THREE.MeshStandardMaterial({
          ...matOptions,
          metalness: 0.8,
          roughness: 0.2
        });
      
      case 'glass':
        return new THREE.MeshPhysicalMaterial({
          ...matOptions,
          metalness: 0,
          roughness: 0.1,
          transmission: 0.9,
          transparent: true,
          opacity: 0.5
        });
      
      case 'metal':
        return new THREE.MeshStandardMaterial({
          ...matOptions,
          metalness: 1.0,
          roughness: 0.3
        });
      
      case 'standard':
      default:
        return new THREE.MeshStandardMaterial(matOptions);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  static parseVector3(params) {
    const [x, y, z] = params.split(',').map(s => parseFloat(s.trim()));
    return new THREE.Vector3(x || 0, y || 0, z || 0);
  }

  static parseColor(params) {
    params = params.trim();
    if (params.startsWith('#')) {
      return parseInt(params.substring(1), 16);
    }
    return parseInt(params, 16);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BATCH COMPILATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Compile multiple VLS objects at once
   * Format: Each object separated by blank line
   */
  static compileMultiple(vlsCode, options = {}) {
    const objects = vlsCode.split(/\n\s*\n/);
    return objects.map(obj => this.compile(obj, options));
  }

  /**
   * Create a VLS object library
   */
  static createLibrary() {
    return {
      // Trees
      tree: `
CYLINDER 0.3,3 #8B4513
POS 0,1.5,0
MAT standard
      `.trim(),

      treeTop: `
SPHERE 1.5 #228B22
POS 0,3.5,0
MAT standard
      `.trim(),

      // Rocks
      rock: `
BOX 1.2,0.8,1 #808080
ROT 15,30,10
MAT standard
      `.trim(),

      // Crystals
      crystal: `
CONE 0.4,1.2 #FFFF00
POS 0,0.6,0
ROT 0,45,0
MAT shiny
      `.trim(),

      // Grass patch
      grass: `
PLANE 2,2 #4CAF50
ROT 90,0,0
MAT standard
      `.trim(),

      // Character
      character: `
CAPSULE 0.5,1 #667EEA
POS 0,1.5,0
MAT standard
      `.trim(),

      // Cloud
      cloud: `
SPHERE 2,8,8 #FFFFFF
POS 0,10,0
MAT basic
      `.trim()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VLSCompiler;
}
