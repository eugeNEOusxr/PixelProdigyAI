/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║              PERFORMANCE OPTIMIZATION SYSTEM v1.0.0                   ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Optimizes rendering, physics, and game loop for 60 FPS               ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class PerformanceOptimizer {
  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    
    // Performance metrics
    this.metrics = {
      fps: 60,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      memoryUsage: 0
    };
    
    // Object pools
    this.pools = {
      vectors: [],
      quaternions: [],
      matrices: [],
      raycasters: []
    };
    
    // Frustum culling
    this.frustum = new THREE.Frustum();
    this.cameraViewProjectionMatrix = new THREE.Matrix4();
    
    // Level of Detail (LOD) settings
    this.lodLevels = [
      { distance: 20, detail: 'high' },
      { distance: 50, detail: 'medium' },
      { distance: 100, detail: 'low' }
    ];
    
    // Performance settings
    this.settings = {
      enableFrustumCulling: true,
      enableOcclusion: false,
      enableLOD: true,
      maxDrawCalls: 1000,
      targetFPS: 60,
      autoAdjustQuality: true,
      shadowQuality: 'high', // high, medium, low, off
      particleLimit: 1000,
      maxLights: 8
    };
    
    // Statistics
    this.stats = {
      lastFrameTime: performance.now(),
      frameCount: 0,
      totalFrameTime: 0,
      worstFrameTime: 0,
      bestFrameTime: Infinity
    };
    
    this.initialize();
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  initialize() {
    // Pre-allocate object pools
    this.createObjectPools();
    
    // Optimize renderer settings
    this.optimizeRenderer();
    
    // Setup automatic quality adjustment
    if (this.settings.autoAdjustQuality) {
      this.setupAutoQualityAdjustment();
    }
    
    console.log('✅ Performance Optimizer initialized');
  }
  
  createObjectPools() {
    // Vector3 pool (100 vectors)
    for (let i = 0; i < 100; i++) {
      this.pools.vectors.push(new THREE.Vector3());
    }
    
    // Quaternion pool (50 quaternions)
    for (let i = 0; i < 50; i++) {
      this.pools.quaternions.push(new THREE.Quaternion());
    }
    
    // Matrix4 pool (50 matrices)
    for (let i = 0; i < 50; i++) {
      this.pools.matrices.push(new THREE.Matrix4());
    }
    
    // Raycaster pool (10 raycasters)
    for (let i = 0; i < 10; i++) {
      this.pools.raycasters.push(new THREE.Raycaster());
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // OBJECT POOLING
  // ═══════════════════════════════════════════════════════════════════════
  
  getVector3() {
    return this.pools.vectors.pop() || new THREE.Vector3();
  }
  
  returnVector3(vector) {
    vector.set(0, 0, 0);
    this.pools.vectors.push(vector);
  }
  
  getQuaternion() {
    return this.pools.quaternions.pop() || new THREE.Quaternion();
  }
  
  returnQuaternion(quat) {
    quat.set(0, 0, 0, 1);
    this.pools.quaternions.push(quat);
  }
  
  getMatrix4() {
    return this.pools.matrices.pop() || new THREE.Matrix4();
  }
  
  returnMatrix4(matrix) {
    matrix.identity();
    this.pools.matrices.push(matrix);
  }
  
  getRaycaster() {
    return this.pools.raycasters.pop() || new THREE.Raycaster();
  }
  
  returnRaycaster(raycaster) {
    this.pools.raycasters.push(raycaster);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // RENDERER OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  optimizeRenderer() {
    // Enable performance optimizations
    this.renderer.sortObjects = true; // Sort transparent objects
    this.renderer.powerPreference = "high-performance";
    
    // Optimize shadow maps
    if (this.renderer.shadowMap.enabled) {
      this.setShadowQuality(this.settings.shadowQuality);
    }
    
    // Enable frustum culling
    this.scene.traverse((object) => {
      if (object.isMesh) {
        object.frustumCulled = this.settings.enableFrustumCulling;
      }
    });
  }
  
  setShadowQuality(quality) {
    const settings = {
      'high': { mapSize: 2048, bias: -0.0001, radius: 2 },
      'medium': { mapSize: 1024, bias: -0.0005, radius: 1 },
      'low': { mapSize: 512, bias: -0.001, radius: 0 },
      'off': null
    };
    
    const setting = settings[quality];
    
    if (!setting) {
      this.renderer.shadowMap.enabled = false;
      return;
    }
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = quality === 'high' 
      ? THREE.PCFSoftShadowMap 
      : THREE.BasicShadowMap;
    
    // Update all lights
    this.scene.traverse((object) => {
      if (object.isLight && object.castShadow) {
        if (object.shadow.mapSize) {
          object.shadow.mapSize.width = setting.mapSize;
          object.shadow.mapSize.height = setting.mapSize;
          object.shadow.bias = setting.bias;
          object.shadow.radius = setting.radius;
        }
      }
    });
    
    this.settings.shadowQuality = quality;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // FRUSTUM CULLING
  // ═══════════════════════════════════════════════════════════════════════
  
  updateFrustum() {
    this.camera.updateMatrixWorld();
    this.cameraViewProjectionMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.cameraViewProjectionMatrix);
  }
  
  isInFrustum(object) {
    if (!object.geometry || !object.geometry.boundingSphere) {
      object.geometry?.computeBoundingSphere();
    }
    
    if (object.geometry?.boundingSphere) {
      const sphere = object.geometry.boundingSphere.clone();
      sphere.applyMatrix4(object.matrixWorld);
      return this.frustum.intersectionsSphere(sphere);
    }
    
    return true; // If no bounding sphere, assume visible
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LEVEL OF DETAIL (LOD)
  // ═══════════════════════════════════════════════════════════════════════
  
  applyLOD(objects, cameraPosition) {
    if (!this.settings.enableLOD) return;
    
    objects.forEach(object => {
      if (!object.isMesh) return;
      
      const distance = cameraPosition.distanceTo(object.position);
      
      let detail = 'low';
      for (const level of this.lodLevels) {
        if (distance < level.distance) {
          detail = level.detail;
          break;
        }
      }
      
      // Adjust object based on detail level
      if (object.userData.originalMaterial) {
        switch (detail) {
          case 'high':
            object.material = object.userData.originalMaterial;
            break;
          case 'medium':
            // Use simpler material
            if (!object.userData.mediumMaterial) {
              object.userData.mediumMaterial = object.material.clone();
              object.userData.mediumMaterial.flatShading = true;
            }
            object.material = object.userData.mediumMaterial;
            break;
          case 'low':
            // Use basic material
            if (!object.userData.lowMaterial) {
              object.userData.lowMaterial = new THREE.MeshBasicMaterial({
                color: object.material.color
              });
            }
            object.material = object.userData.lowMaterial;
            break;
        }
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // GEOMETRY OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  optimizeGeometry(geometry) {
    // Merge vertices
    geometry.mergeVertices?.();
    
    // Compute normals efficiently
    geometry.computeVertexNormals();
    
    // Compute bounding sphere for frustum culling
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    
    return geometry;
  }
  
  mergeGeometries(geometries) {
    // Use BufferGeometryUtils to merge multiple geometries into one
    // This reduces draw calls significantly
    if (window.THREE.BufferGeometryUtils) {
      return THREE.BufferGeometryUtils.mergeGeometries(geometries);
    }
    return geometries[0]; // Fallback
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // TEXTURE OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  optimizeTexture(texture) {
    // Use mipmaps
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // Use anisotropic filtering (improves quality at angles)
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    texture.anisotropy = Math.min(4, maxAnisotropy);
    
    return texture;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // AUTO QUALITY ADJUSTMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  setupAutoQualityAdjustment() {
    this.qualityCheckInterval = setInterval(() => {
      if (this.metrics.fps < 50) {
        this.decreaseQuality();
      } else if (this.metrics.fps > 58 && this.settings.shadowQuality !== 'high') {
        this.increaseQuality();
      }
    }, 5000); // Check every 5 seconds
  }
  
  decreaseQuality() {
    const qualities = ['high', 'medium', 'low', 'off'];
    const currentIndex = qualities.indexOf(this.settings.shadowQuality);
    
    if (currentIndex < qualities.length - 1) {
      const newQuality = qualities[currentIndex + 1];
      console.log(`⚡ Auto-adjusting quality: ${this.settings.shadowQuality} → ${newQuality}`);
      this.setShadowQuality(newQuality);
    }
  }
  
  increaseQuality() {
    const qualities = ['high', 'medium', 'low', 'off'];
    const currentIndex = qualities.indexOf(this.settings.shadowQuality);
    
    if (currentIndex > 0) {
      const newQuality = qualities[currentIndex - 1];
      console.log(`⚡ Auto-adjusting quality: ${this.settings.shadowQuality} → ${newQuality}`);
      this.setShadowQuality(newQuality);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PERFORMANCE MONITORING
  // ═══════════════════════════════════════════════════════════════════════
  
  update(dt) {
    const now = performance.now();
    const frameTime = now - this.stats.lastFrameTime;
    
    // Update statistics
    this.stats.frameCount++;
    this.stats.totalFrameTime += frameTime;
    this.stats.worstFrameTime = Math.max(this.stats.worstFrameTime, frameTime);
    this.stats.bestFrameTime = Math.min(this.stats.bestFrameTime, frameTime);
    
    // Calculate FPS
    this.metrics.fps = Math.round(1000 / frameTime);
    this.metrics.frameTime = frameTime.toFixed(2);
    
    // Update renderer info
    const info = this.renderer.info;
    this.metrics.drawCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;
    this.metrics.geometries = info.memory.geometries;
    this.metrics.textures = info.memory.textures;
    this.metrics.programs = info.programs?.length || 0;
    
    // Estimate memory usage (approximate)
    if (performance.memory) {
      this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
    }
    
    this.stats.lastFrameTime = now;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      avgFrameTime: (this.stats.totalFrameTime / this.stats.frameCount).toFixed(2),
      worstFrameTime: this.stats.worstFrameTime.toFixed(2),
      bestFrameTime: this.stats.bestFrameTime.toFixed(2)
    };
  }
  
  getPerformanceReport() {
    const metrics = this.getMetrics();
    
    return `
╔═══════════════════════════════════════════════════════════════╗
║                   PERFORMANCE REPORT                          ║
╠═══════════════════════════════════════════════════════════════╣
║ FPS:              ${metrics.fps.toString().padEnd(40)} ║
║ Frame Time:       ${metrics.frameTime}ms (avg: ${metrics.avgFrameTime}ms)${' '.repeat(20)} ║
║ Worst Frame:      ${metrics.worstFrameTime}ms${' '.repeat(35)} ║
║ Best Frame:       ${metrics.bestFrameTime}ms${' '.repeat(35)} ║
╠═══════════════════════════════════════════════════════════════╣
║ Draw Calls:       ${metrics.drawCalls.toString().padEnd(40)} ║
║ Triangles:        ${metrics.triangles.toString().padEnd(40)} ║
║ Geometries:       ${metrics.geometries.toString().padEnd(40)} ║
║ Textures:         ${metrics.textures.toString().padEnd(40)} ║
║ Shader Programs:  ${metrics.programs.toString().padEnd(40)} ║
║ Memory Usage:     ${metrics.memoryUsage}MB${' '.repeat(35)} ║
╠═══════════════════════════════════════════════════════════════╣
║ Shadow Quality:   ${this.settings.shadowQuality.padEnd(40)} ║
║ LOD Enabled:      ${(this.settings.enableLOD ? 'Yes' : 'No').padEnd(40)} ║
║ Frustum Culling:  ${(this.settings.enableFrustumCulling ? 'Yes' : 'No').padEnd(40)} ║
║ Auto Quality:     ${(this.settings.autoAdjustQuality ? 'Yes' : 'No').padEnd(40)} ║
╚═══════════════════════════════════════════════════════════════╝
    `.trim();
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════
  
  resetStats() {
    this.stats = {
      lastFrameTime: performance.now(),
      frameCount: 0,
      totalFrameTime: 0,
      worstFrameTime: 0,
      bestFrameTime: Infinity
    };
  }
  
  dispose() {
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}
