// world_generation/graphics_effects_system.js
// Graphics & Effects System - Post-processing, Particles, Lighting, Weather, Day/Night

/**
 * ParticleSystem - GPU-based particle system for effects
 */
class ParticleSystem {
  constructor(scene, maxParticles = 1000) {
    this.scene = scene;
    this.maxParticles = maxParticles;
    this.particles = [];
    this.particlePool = [];
    this.emitters = [];
    
    // Create particle geometry (instanced)
    this.particleGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Particle material
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.particleMesh = new THREE.Points(this.particleGeometry, this.particleMaterial);
    scene.add(this.particleMesh);
    
    // Initialize pool
    for (let i = 0; i < maxParticles; i++) {
      this.particlePool.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 0.1,
        life: 0,
        maxLife: 1,
        active: false
      });
    }
  }

  createEmitter(config) {
    const emitter = {
      position: config.position || new THREE.Vector3(),
      rate: config.rate || 10, // particles per second
      velocity: config.velocity || new THREE.Vector3(0, 1, 0),
      velocityVariance: config.velocityVariance || new THREE.Vector3(0.5, 0.5, 0.5),
      color: config.color || new THREE.Color(1, 1, 1),
      colorVariance: config.colorVariance || 0.1,
      size: config.size || 0.1,
      life: config.life || 1.0,
      gravity: config.gravity || new THREE.Vector3(0, -2, 0),
      active: true,
      accumulator: 0
    };
    
    this.emitters.push(emitter);
    return emitter;
  }

  emitParticle(emitter) {
    // Find inactive particle
    const particle = this.particlePool.find(p => !p.active);
    if (!particle) return;
    
    particle.active = true;
    particle.position.copy(emitter.position);
    
    // Random velocity
    particle.velocity.set(
      emitter.velocity.x + (Math.random() - 0.5) * emitter.velocityVariance.x,
      emitter.velocity.y + (Math.random() - 0.5) * emitter.velocityVariance.y,
      emitter.velocity.z + (Math.random() - 0.5) * emitter.velocityVariance.z
    );
    
    // Random color
    particle.color.copy(emitter.color);
    particle.color.r += (Math.random() - 0.5) * emitter.colorVariance;
    particle.color.g += (Math.random() - 0.5) * emitter.colorVariance;
    particle.color.b += (Math.random() - 0.5) * emitter.colorVariance;
    
    particle.size = emitter.size;
    particle.life = emitter.life;
    particle.maxLife = emitter.life;
    particle.gravity = emitter.gravity;
    
    this.particles.push(particle);
  }

  update(dt) {
    // Update emitters
    this.emitters.forEach(emitter => {
      if (!emitter.active) return;
      
      emitter.accumulator += dt;
      const spawnInterval = 1.0 / emitter.rate;
      
      while (emitter.accumulator >= spawnInterval) {
        this.emitParticle(emitter);
        emitter.accumulator -= spawnInterval;
      }
    });
    
    // Update particles
    const positions = this.particleGeometry.attributes.position.array;
    const colors = this.particleGeometry.attributes.color.array;
    const sizes = this.particleGeometry.attributes.size.array;
    
    let activeCount = 0;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.life -= dt;
      
      if (p.life <= 0) {
        p.active = false;
        this.particles.splice(i, 1);
        continue;
      }
      
      // Physics
      p.velocity.add(p.gravity.clone().multiplyScalar(dt));
      p.position.add(p.velocity.clone().multiplyScalar(dt));
      
      // Update buffer
      const idx = activeCount * 3;
      positions[idx] = p.position.x;
      positions[idx + 1] = p.position.y;
      positions[idx + 2] = p.position.z;
      
      colors[idx] = p.color.r;
      colors[idx + 1] = p.color.g;
      colors[idx + 2] = p.color.b;
      
      sizes[activeCount] = p.size * (p.life / p.maxLife);
      
      activeCount++;
    }
    
    // Hide unused particles
    for (let i = activeCount; i < this.maxParticles; i++) {
      sizes[i] = 0;
    }
    
    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.color.needsUpdate = true;
    this.particleGeometry.attributes.size.needsUpdate = true;
    this.particleGeometry.setDrawRange(0, activeCount);
  }

  removeEmitter(emitter) {
    const index = this.emitters.indexOf(emitter);
    if (index !== -1) {
      this.emitters.splice(index, 1);
    }
  }
}

/**
 * LightingSystem - Dynamic lighting with day/night cycle
 */
class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.timeOfDay = 12.0; // 0-24 hours
    this.dayDuration = 120; // seconds for full day
    this.paused = false;
    
    // Sun (directional light)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sunLight.position.set(10, 10, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    scene.add(this.sunLight);
    
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(this.ambientLight);
    
    // Moon (directional light)
    this.moonLight = new THREE.DirectionalLight(0x9999ff, 0.3);
    this.moonLight.position.set(-10, 5, -10);
    scene.add(this.moonLight);
    
    // Hemisphere light for sky
    this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.6);
    scene.add(this.hemisphereLight);
    
    this.updateLighting();
  }

  update(dt) {
    if (this.paused) return;
    
    // Advance time
    this.timeOfDay += (dt / this.dayDuration) * 24;
    if (this.timeOfDay >= 24) this.timeOfDay -= 24;
    
    this.updateLighting();
  }

  updateLighting() {
    // Calculate sun position based on time
    const angle = (this.timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    const sunX = Math.cos(angle) * 20;
    const sunY = Math.sin(angle) * 20;
    
    this.sunLight.position.set(sunX, sunY, 10);
    
    // Day/night intensity
    const dayFactor = Math.max(0, Math.sin(angle));
    const nightFactor = Math.max(0, -Math.sin(angle));
    
    // Sun intensity
    this.sunLight.intensity = dayFactor * 1.5;
    
    // Sun color (orange at sunrise/sunset)
    if (dayFactor < 0.3) {
      this.sunLight.color.setHex(0xff8844); // Orange
    } else {
      this.sunLight.color.setHex(0xffffff); // White
    }
    
    // Moon intensity
    this.moonLight.intensity = nightFactor * 0.4;
    
    // Ambient light
    this.ambientLight.intensity = 0.3 + dayFactor * 0.3;
    
    // Sky color
    if (dayFactor > 0.5) {
      this.hemisphereLight.color.setHex(0x87ceeb); // Day sky
    } else if (dayFactor > 0.1) {
      this.hemisphereLight.color.setHex(0xff6644); // Sunset
    } else {
      this.hemisphereLight.color.setHex(0x112244); // Night sky
    }
    
    // Update fog
    if (this.scene.fog) {
      if (dayFactor > 0.5) {
        this.scene.fog.color.setHex(0xccddff); // Day fog
      } else {
        this.scene.fog.color.setHex(0x112244); // Night fog
      }
    }
  }

  setTimeOfDay(hours) {
    this.timeOfDay = hours % 24;
    this.updateLighting();
  }

  getTimeOfDay() {
    return this.timeOfDay;
  }

  getTimeString() {
    const hours = Math.floor(this.timeOfDay);
    const minutes = Math.floor((this.timeOfDay % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}

/**
 * WeatherSystem - Rain, snow, fog effects
 */
class WeatherSystem {
  constructor(scene, particleSystem) {
    this.scene = scene;
    this.particleSystem = particleSystem;
    this.currentWeather = 'clear';
    this.weatherEmitter = null;
    
    // Fog
    this.scene.fog = new THREE.Fog(0xccddff, 20, 100);
  }

  setWeather(type) {
    // Remove old weather emitter
    if (this.weatherEmitter) {
      this.particleSystem.removeEmitter(this.weatherEmitter);
      this.weatherEmitter = null;
    }
    
    this.currentWeather = type;
    
    switch (type) {
      case 'rain':
        this.startRain();
        break;
      case 'snow':
        this.startSnow();
        break;
      case 'fog':
        this.startFog();
        break;
      case 'clear':
      default:
        this.clearWeather();
        break;
    }
  }

  startRain() {
    this.weatherEmitter = this.particleSystem.createEmitter({
      position: new THREE.Vector3(0, 15, 0),
      rate: 500,
      velocity: new THREE.Vector3(0, -15, 0),
      velocityVariance: new THREE.Vector3(2, 2, 2),
      color: new THREE.Color(0.6, 0.6, 1.0),
      colorVariance: 0.1,
      size: 0.05,
      life: 1.5,
      gravity: new THREE.Vector3(0, -5, 0)
    });
    
    this.scene.fog.near = 30;
    this.scene.fog.far = 80;
  }

  startSnow() {
    this.weatherEmitter = this.particleSystem.createEmitter({
      position: new THREE.Vector3(0, 15, 0),
      rate: 200,
      velocity: new THREE.Vector3(0, -2, 0),
      velocityVariance: new THREE.Vector3(3, 1, 3),
      color: new THREE.Color(1.0, 1.0, 1.0),
      colorVariance: 0.05,
      size: 0.15,
      life: 8.0,
      gravity: new THREE.Vector3(0, -0.5, 0)
    });
    
    this.scene.fog.near = 20;
    this.scene.fog.far = 70;
  }

  startFog() {
    this.scene.fog.near = 5;
    this.scene.fog.far = 30;
  }

  clearWeather() {
    this.scene.fog.near = 20;
    this.scene.fog.far = 100;
  }

  update(dt) {
    // Weather emitter follows camera (if exists)
    if (this.weatherEmitter && this.scene.children[0]) {
      // Position emitter above camera
      const camera = this.scene.children.find(child => child.isCamera);
      if (camera) {
        this.weatherEmitter.position.set(
          camera.position.x,
          camera.position.y + 15,
          camera.position.z
        );
      }
    }
  }

  getWeather() {
    return this.currentWeather;
  }
}

/**
 * PostProcessingEffects - Bloom, SSAO, etc.
 */
class PostProcessingEffects {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = false;
    
    // Note: This requires EffectComposer from THREE.js examples
    // For basic implementation, we'll use simple effects
    
    this.bloomStrength = 1.0;
    this.vignetteStrength = 0.5;
  }

  enable() {
    this.enabled = true;
    // Enable bloom/glow effect (simplified)
    this.renderer.toneMappingExposure = 1.0;
  }

  disable() {
    this.enabled = false;
    this.renderer.toneMappingExposure = 1.0;
  }

  setBloomStrength(value) {
    this.bloomStrength = value;
    this.renderer.toneMappingExposure = 1.0 + value * 0.5;
  }

  render() {
    if (!this.enabled) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    
    // Apply post-processing
    this.renderer.render(this.scene, this.camera);
  }
}

/**
 * EffectsController - Manages all graphics effects
 */
class EffectsController {
  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    
    this.particleSystem = new ParticleSystem(scene, 2000);
    this.lightingSystem = new LightingSystem(scene);
    this.weatherSystem = new WeatherSystem(scene, this.particleSystem);
    this.postProcessing = new PostProcessingEffects(renderer, scene, camera);
    
    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  update(dt) {
    this.particleSystem.update(dt);
    this.lightingSystem.update(dt);
    this.weatherSystem.update(dt);
  }

  render() {
    this.postProcessing.render();
  }

  // Particle effects
  createExplosion(position, color = new THREE.Color(1, 0.5, 0)) {
    const emitter = this.particleSystem.createEmitter({
      position: position.clone(),
      rate: 500,
      velocity: new THREE.Vector3(0, 3, 0),
      velocityVariance: new THREE.Vector3(5, 5, 5),
      color: color,
      colorVariance: 0.2,
      size: 0.2,
      life: 0.5,
      gravity: new THREE.Vector3(0, -10, 0)
    });
    
    // Remove after burst
    setTimeout(() => {
      emitter.active = false;
      this.particleSystem.removeEmitter(emitter);
    }, 100);
  }

  createHitSparks(position) {
    this.createExplosion(position, new THREE.Color(1, 1, 0.5));
  }

  createHealEffect(position) {
    const emitter = this.particleSystem.createEmitter({
      position: position.clone(),
      rate: 100,
      velocity: new THREE.Vector3(0, 2, 0),
      velocityVariance: new THREE.Vector3(1, 1, 1),
      color: new THREE.Color(0.2, 1.0, 0.2),
      colorVariance: 0.1,
      size: 0.15,
      life: 1.5,
      gravity: new THREE.Vector3(0, 1, 0)
    });
    
    setTimeout(() => {
      emitter.active = false;
      this.particleSystem.removeEmitter(emitter);
    }, 1000);
  }

  // Weather controls
  setWeather(type) {
    this.weatherSystem.setWeather(type);
  }

  getWeather() {
    return this.weatherSystem.getWeather();
  }

  // Time controls
  setTimeOfDay(hours) {
    this.lightingSystem.setTimeOfDay(hours);
  }

  getTimeOfDay() {
    return this.lightingSystem.getTimeOfDay();
  }

  getTimeString() {
    return this.lightingSystem.getTimeString();
  }

  pauseTime() {
    this.lightingSystem.pause();
  }

  resumeTime() {
    this.lightingSystem.resume();
  }

  // Post-processing controls
  enablePostProcessing() {
    this.postProcessing.enable();
  }

  disablePostProcessing() {
    this.postProcessing.disable();
  }

  setBloomStrength(value) {
    this.postProcessing.setBloomStrength(value);
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.ParticleSystem = ParticleSystem;
  window.LightingSystem = LightingSystem;
  window.WeatherSystem = WeatherSystem;
  window.PostProcessingEffects = PostProcessingEffects;
  window.EffectsController = EffectsController;
}
