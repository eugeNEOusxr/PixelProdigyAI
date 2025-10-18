/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                  PARTICLE EFFECTS SYSTEM v1.0.0                       ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Advanced particle system for visual effects and polish                ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class ParticleEffects {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 1000;
    
    // Particle pools by type
    this.particleTypes = {
      spark: { color: 0xffaa00, size: 0.1, lifetime: 0.5 },
      smoke: { color: 0x888888, size: 0.3, lifetime: 2.0 },
      magic: { color: 0x8844ff, size: 0.2, lifetime: 1.0 },
      heal: { color: 0x44ff44, size: 0.15, lifetime: 1.5 },
      damage: { color: 0xff4444, size: 0.12, lifetime: 0.8 },
      levelUp: { color: 0xffdd00, size: 0.25, lifetime: 2.0 },
      coin: { color: 0xffdd00, size: 0.1, lifetime: 1.0 },
      leaf: { color: 0x44ff44, size: 0.15, lifetime: 3.0 },
      snow: { color: 0xffffff, size: 0.08, lifetime: 5.0 },
      rain: { color: 0x4488ff, size: 0.05, lifetime: 1.0 }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PARTICLE CREATION
  // ═══════════════════════════════════════════════════════════════════════
  
  createParticle(type, position, velocity = null, options = {}) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift()?.mesh && this.scene.remove(this.particles.shift().mesh);
    }
    
    const particleType = this.particleTypes[type] || this.particleTypes.spark;
    
    // Create particle geometry
    const geometry = new THREE.SphereGeometry(
      options.size || particleType.size,
      8,
      8
    );
    
    const material = new THREE.MeshBasicMaterial({
      color: options.color || particleType.color,
      transparent: true,
      opacity: options.opacity || 1.0
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    
    this.scene.add(mesh);
    
    const particle = {
      mesh: mesh,
      velocity: velocity || new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 3,
        (Math.random() - 0.5) * 2
      ),
      lifetime: options.lifetime || particleType.lifetime,
      age: 0,
      gravity: options.gravity !== undefined ? options.gravity : -9.8,
      drag: options.drag || 0.98,
      fadeOut: options.fadeOut !== undefined ? options.fadeOut : true
    };
    
    this.particles.push(particle);
    
    return particle;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PRESET EFFECTS
  // ═══════════════════════════════════════════════════════════════════════
  
  explosion(position, count = 20, color = 0xffaa00) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 5,
        Math.sin(angle) * speed
      );
      
      this.createParticle('spark', position.clone(), velocity, {
        color: color,
        lifetime: 0.5 + Math.random() * 0.5
      });
    }
  }
  
  levelUpEffect(position) {
    // Create upward spiral of particles
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const radius = 0.5 + (i / 30) * 0.5;
      
      const particlePos = position.clone().add(new THREE.Vector3(
        Math.cos(angle) * radius,
        i * 0.1,
        Math.sin(angle) * radius
      ));
      
      const velocity = new THREE.Vector3(
        Math.cos(angle) * 0.5,
        2 + Math.random(),
        Math.sin(angle) * 0.5
      );
      
      this.createParticle('levelUp', particlePos, velocity, {
        lifetime: 2.0,
        gravity: -2
      });
    }
  }
  
  healEffect(position) {
    // Create floating green particles
    for (let i = 0; i < 15; i++) {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 1.5
      );
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      );
      
      this.createParticle('heal', position.clone().add(offset), velocity, {
        gravity: -1,
        lifetime: 1.5
      });
    }
  }
  
  damageEffect(position) {
    // Create red burst
    for (let i = 0; i < 10; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 2,
        (Math.random() - 0.5) * 3
      );
      
      this.createParticle('damage', position.clone(), velocity, {
        lifetime: 0.8
      });
    }
  }
  
  magicCastEffect(position) {
    // Create swirling purple particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const radius = 0.3;
      
      const particlePos = position.clone().add(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.random() * 0.5,
        Math.sin(angle) * radius
      ));
      
      const velocity = new THREE.Vector3(
        Math.cos(angle + Math.PI / 2) * 2,
        Math.random() * 1,
        Math.sin(angle + Math.PI / 2) * 2
      );
      
      this.createParticle('magic', particlePos, velocity, {
        gravity: -0.5,
        lifetime: 1.0
      });
    }
  }
  
  coinCollectEffect(position) {
    // Create upward gold particles
    for (let i = 0; i < 8; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        2 + Math.random() * 2,
        (Math.random() - 0.5) * 1
      );
      
      this.createParticle('coin', position.clone(), velocity, {
        gravity: -3,
        lifetime: 1.0
      });
    }
  }
  
  environmentEffect(type, position, intensity = 1.0) {
    // Create environmental particles (leaves, snow, rain)
    const particlePos = position.clone().add(new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      5 + Math.random() * 5,
      (Math.random() - 0.5) * 10
    ));
    
    let velocity;
    if (type === 'rain') {
      velocity = new THREE.Vector3(0, -15, 0);
    } else if (type === 'snow') {
      velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        -1,
        (Math.random() - 0.5) * 0.5
      );
    } else if (type === 'leaf') {
      velocity = new THREE.Vector3(
        Math.random() * 2,
        -0.5,
        (Math.random() - 0.5) * 1
      );
    }
    
    this.createParticle(type, particlePos, velocity, {
      gravity: 0,
      drag: 0.99
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════════
  
  update(dt) {
    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update age
      particle.age += dt;
      
      // Remove if lifetime exceeded
      if (particle.age >= particle.lifetime) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }
      
      // Apply physics
      particle.velocity.y += particle.gravity * dt;
      particle.velocity.multiplyScalar(particle.drag);
      
      // Update position
      particle.mesh.position.add(
        particle.velocity.clone().multiplyScalar(dt)
      );
      
      // Fade out
      if (particle.fadeOut) {
        const lifetimeRatio = particle.age / particle.lifetime;
        particle.mesh.material.opacity = 1.0 - lifetimeRatio;
      }
      
      // Scale effect (grow then shrink)
      const lifetimeRatio = particle.age / particle.lifetime;
      let scale = 1.0;
      if (lifetimeRatio < 0.2) {
        scale = lifetimeRatio / 0.2;
      } else if (lifetimeRatio > 0.8) {
        scale = (1.0 - lifetimeRatio) / 0.2;
      }
      particle.mesh.scale.setScalar(scale);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════
  
  clear() {
    for (const particle of this.particles) {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      particle.mesh.material.dispose();
    }
    this.particles = [];
  }
  
  dispose() {
    this.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleEffects;
}
