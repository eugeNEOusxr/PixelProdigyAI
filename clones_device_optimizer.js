/**
 * 📱 Clones Device Optimizer
 * Adaptive performance system for legacy and modern devices
 * Optimized for Clones Phone Company hardware
 * 
 * Eugene Ousos - PixelProdigy AI
 * October 24, 2025
 */

class ClonesDeviceOptimizer {
  constructor() {
    this.profile = this.detectDeviceProfile();
    this.applyOptimizations();
  }
  
  /**
   * Detect device capability and classify into Clones product tier
   */
  detectDeviceProfile() {
    const cores = navigator.hardwareConcurrency || 1;
    const ram = navigator.deviceMemory || 0.5; // GB (Chrome 63+ only)
    const gpu = this.detectGPU();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Score device capability (0-100)
    let score = 0;
    score += Math.min(cores * 15, 40); // Max 40 points for CPU
    score += Math.min(ram * 10, 30); // Max 30 points for RAM
    score += gpu.score; // Max 30 points for GPU
    
    return {
      name: this.getProfileName(score),
      score: score,
      cores: cores,
      ram: ram,
      gpu: gpu,
      screen: { width: screenWidth, height: screenHeight },
      capabilities: this.mapCapabilities(score),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Detect GPU capability via WebGL
   */
  detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return { name: 'None', score: 0, tier: 'basic' };
      }
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo 
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
        : 'Unknown';
      
      // Score based on known GPU families
      let score = 10; // baseline for any WebGL support
      
      // High-end mobile GPUs
      if (renderer.includes('Adreno 6') || renderer.includes('Mali-G7') || 
          renderer.includes('Apple GPU')) {
        score = 30;
      }
      // Mid-range mobile GPUs
      else if (renderer.includes('Adreno 5') || renderer.includes('Mali-G5') || 
               renderer.includes('PowerVR')) {
        score = 25;
      }
      // Older but capable GPUs
      else if (renderer.includes('Adreno 4') || renderer.includes('Mali-T8')) {
        score = 20;
      }
      // Legacy GPUs
      else if (renderer.includes('Adreno 3') || renderer.includes('Mali-T7')) {
        score = 15;
      }
      
      return {
        name: renderer,
        score: score,
        tier: score > 25 ? 'premium' : score > 15 ? 'mid' : 'basic'
      };
    } catch (error) {
      console.warn('GPU detection failed:', error);
      return { name: 'Unknown', score: 10, tier: 'basic' };
    }
  }
  
  /**
   * Map score to Clones product tier
   */
  getProfileName(score) {
    if (score >= 70) return 'Clones Elite';
    if (score >= 40) return 'Clones Pro';
    return 'Clones Basic';
  }
  
  /**
   * Map capability score to feature flags
   */
  mapCapabilities(score) {
    return {
      // 3D Rendering
      enable3D: score >= 30,
      maxPolygons: score >= 70 ? 100000 : score >= 40 ? 50000 : 10000,
      enableShadows: score >= 60,
      enablePostProcessing: score >= 70,
      maxTextures: score >= 70 ? 512 : score >= 40 ? 256 : 128,
      
      // Features
      enableVR: score >= 70,
      enableVertexEngine: score >= 50,
      enableAIPersonalities: score >= 40,
      maxDimensions: score >= 70 ? 19 : score >= 40 ? 10 : 3,
      enableMuscleLayer: score >= 40, // Muscles require moderate GPU
      
      // Performance
      targetFPS: score >= 70 ? 60 : score >= 40 ? 30 : 15,
      enableWebWorkers: score >= 40,
      enableIndexedDB: score >= 30,
      
      // Rendering Quality
      antialias: score >= 50,
      pixelRatio: score >= 60 ? Math.min(window.devicePixelRatio, 2) : 1,
      renderScale: score >= 70 ? 1.0 : score >= 40 ? 0.75 : 0.5,
      
      // UI Features
      enableAnimations: score >= 40,
      enableParticles: score >= 60,
      enableBloom: score >= 70
    };
  }
  
  /**
   * Apply optimizations to THREE.js renderer and scene
   */
  applyOptimizations() {
    const caps = this.profile.capabilities;
    
    console.log('📱━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 Clones Device Profile: ${this.profile.name}`);
    console.log(`🎯 Capability Score: ${this.profile.score}/100`);
    console.log(`💻 CPU Cores: ${this.profile.cores}`);
    console.log(`🧠 RAM: ~${this.profile.ram} GB`);
    console.log(`🎮 GPU: ${this.profile.gpu.name} (${this.profile.gpu.tier})`);
    console.log(`📺 Screen: ${this.profile.screen.width}x${this.profile.screen.height}`);
    console.log('⚙️ Optimizations Applied:');
    console.log(`   - 3D Enabled: ${caps.enable3D ? '✅' : '❌'}`);
    console.log(`   - Max Polygons: ${caps.maxPolygons.toLocaleString()}`);
    console.log(`   - Shadows: ${caps.enableShadows ? '✅' : '❌'}`);
    console.log(`   - Target FPS: ${caps.targetFPS}`);
    console.log(`   - Render Scale: ${caps.renderScale}x`);
    console.log(`   - VR Mode: ${caps.enableVR ? '✅' : '❌'}`);
    console.log(`   - Vertex Engine: ${caps.enableVertexEngine ? '✅' : '❌'}`);
    console.log(`   - Muscle Layer: ${caps.enableMuscleLayer ? '✅' : '❌'}`);
    console.log('📱━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Apply to THREE.js renderer (if exists)
    if (window.renderer) {
      this.optimizeRenderer();
    } else {
      // Wait for renderer to be created
      const checkRenderer = setInterval(() => {
        if (window.renderer) {
          this.optimizeRenderer();
          clearInterval(checkRenderer);
        }
      }, 500);
    }
    
    // Store profile globally
    window.clonesProfile = this.profile;
    
    // Save to localStorage for analytics
    localStorage.setItem('clones_device_profile', JSON.stringify(this.profile));
    
    // Apply UI optimizations
    this.optimizeUI();
    
    // Enable battery saver listener
    this.setupBatterySaver();
  }
  
  /**
   * Optimize THREE.js renderer settings
   */
  optimizeRenderer() {
    const caps = this.profile.capabilities;
    const renderer = window.renderer;
    
    // Pixel ratio (higher = sharper but slower)
    renderer.setPixelRatio(caps.pixelRatio);
    
    // Shadows (expensive on low-end devices)
    renderer.shadowMap.enabled = caps.enableShadows;
    if (caps.enableShadows) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better quality
    }
    
    // Antialiasing
    if (renderer.capabilities && !caps.antialias) {
      // Can't change after creation, but we can note it
      console.log('⚠️ Antialiasing disabled for performance');
    }
    
    // Reduce render size for low-end devices
    if (caps.renderScale < 1.0) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth * caps.renderScale;
      const height = canvas.clientHeight * caps.renderScale;
      renderer.setSize(width, height, false);
      console.log(`📐 Render scale reduced to ${caps.renderScale}x for performance`);
    }
    
    console.log('✅ Renderer optimizations applied');
  }
  
  /**
   * Optimize UI for device capability
   */
  optimizeUI() {
    const caps = this.profile.capabilities;
    
    // Disable CSS animations on low-end devices
    if (!caps.enableAnimations) {
      const style = document.createElement('style');
      style.textContent = `
        * {
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
      console.log('🎨 CSS animations disabled for performance');
    }
    
    // Simplify UI on small screens
    if (this.profile.screen.width < 600) {
      document.body.classList.add('clones-mobile');
      console.log('📱 Mobile UI mode activated');
    }
  }
  
  /**
   * Setup battery saver mode
   */
  setupBatterySaver() {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const checkBattery = () => {
          if (battery.level < 0.2 && !battery.charging) {
            this.enableBatterySaverMode();
          } else if (battery.level > 0.3 || battery.charging) {
            this.disableBatterySaverMode();
          }
        };
        
        battery.addEventListener('levelchange', checkBattery);
        battery.addEventListener('chargingchange', checkBattery);
        
        // Check on startup
        checkBattery();
      });
    }
  }
  
  /**
   * Enable battery saver mode
   */
  enableBatterySaverMode() {
    if (this.batterySaverActive) return;
    
    console.log('🔋 Battery Saver Mode: ENABLED');
    this.batterySaverActive = true;
    
    const caps = this.profile.capabilities;
    
    // Reduce target FPS
    this.originalFPS = caps.targetFPS;
    caps.targetFPS = Math.max(10, caps.targetFPS / 2);
    
    // Disable shadows
    if (window.renderer) {
      this.originalShadows = window.renderer.shadowMap.enabled;
      window.renderer.shadowMap.enabled = false;
    }
    
    // Disable animations
    if (window.scene) {
      window.scene.traverse(obj => {
        if (obj.userData.animated) {
          obj.userData.wasAnimated = true;
          obj.userData.animated = false;
        }
      });
    }
    
    // Show notification
    if (window.alert) {
      console.log('⚠️ Battery low (<20%). Performance reduced to conserve power.');
    }
  }
  
  /**
   * Disable battery saver mode
   */
  disableBatterySaverMode() {
    if (!this.batterySaverActive) return;
    
    console.log('🔋 Battery Saver Mode: DISABLED');
    this.batterySaverActive = false;
    
    const caps = this.profile.capabilities;
    
    // Restore FPS
    if (this.originalFPS) {
      caps.targetFPS = this.originalFPS;
    }
    
    // Restore shadows
    if (window.renderer && this.originalShadows !== undefined) {
      window.renderer.shadowMap.enabled = this.originalShadows;
    }
    
    // Restore animations
    if (window.scene) {
      window.scene.traverse(obj => {
        if (obj.userData.wasAnimated) {
          obj.userData.animated = true;
          delete obj.userData.wasAnimated;
        }
      });
    }
  }
  
  /**
   * Get lightweight mode status
   */
  isLightweightMode() {
    return this.profile.score < 40;
  }
  
  /**
   * Get detailed report
   */
  getReport() {
    return {
      deviceName: this.profile.name,
      score: this.profile.score,
      tier: this.profile.name.split(' ')[1].toLowerCase(),
      capabilities: this.profile.capabilities,
      hardware: {
        cores: this.profile.cores,
        ram: this.profile.ram,
        gpu: this.profile.gpu.name
      },
      screen: this.profile.screen,
      batterySaver: this.batterySaverActive || false,
      timestamp: this.profile.timestamp
    };
  }
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!window.clonesOptimizer) {
      window.clonesOptimizer = new ClonesDeviceOptimizer();
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClonesDeviceOptimizer;
}
