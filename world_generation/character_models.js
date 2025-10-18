// world_generation/character_models.js
// Three modular character styles: stylized, realistic, robot

class CharacterFactory {
  static createStylizedCharacter() {
    // Simple stylized: capsule body, sphere head, colored limbs
    const group = new THREE.Group();
    // Body
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 1.0, 8, 16),
      new THREE.MeshPhongMaterial({ color: 0x4ad7ff })
    );
    group.add(body);
    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshPhongMaterial({ color: 0xffe066 })
    );
    head.position.y = 1.0;
    group.add(head);
    // Arms
    const arms = [];
    for (let side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.7, 12),
        new THREE.MeshPhongMaterial({ color: 0x2a7cff })
      );
      arm.position.set(0.38 * side, 0.5, 0);
      arm.rotation.z = Math.PI / 2;
      group.add(arm);
      arms.push(arm);
    }
    // Legs
    const legs = [];
    for (let side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.8, 12),
        new THREE.MeshPhongMaterial({ color: 0x1e90ff })
      );
      leg.position.set(0.18 * side, -0.7, 0);
      group.add(leg);
      legs.push(leg);
    }
    group.name = 'Stylized';
    // Animation state
    group.userData = {
      animationState: 'idle',
      animationTime: 0,
      arms,
      legs,
      head,
      setAnimationState(state) {
        this.animationState = state;
        this.animationTime = 0;
      },
      animate(dt) {
        this.animationTime += dt;
        // Idle: slight breathing
        if (this.animationState === 'idle') {
          this.head.position.y = 1.0 + 0.03 * Math.sin(this.animationTime * 2);
          this.arms[0].rotation.x = 0.05 * Math.sin(this.animationTime * 2);
          this.arms[1].rotation.x = -0.05 * Math.sin(this.animationTime * 2);
          this.legs[0].rotation.x = 0;
          this.legs[1].rotation.x = 0;
        } else if (this.animationState === 'walk' || this.animationState === 'run') {
          // Walk/Run: swing arms and legs
          const speed = this.animationState === 'run' ? 6 : 3;
          const amp = this.animationState === 'run' ? 0.7 : 0.4;
          const t = this.animationTime * speed;
          this.arms[0].rotation.x = Math.sin(t) * amp;
          this.arms[1].rotation.x = -Math.sin(t) * amp;
          this.legs[0].rotation.x = -Math.sin(t) * amp;
          this.legs[1].rotation.x = Math.sin(t) * amp;
          this.head.position.y = 1.0 + 0.01 * Math.sin(t * 2);
        } else if (this.animationState === 'jump') {
          // Jump: arms up, legs straight
          this.arms[0].rotation.x = -1.2;
          this.arms[1].rotation.x = -1.2;
          this.legs[0].rotation.x = 0.2;
          this.legs[1].rotation.x = 0.2;
          this.head.position.y = 1.0;
        }
      }
    };
    group.setAnimationState = function(state) { this.userData.setAnimationState(state); };
    group.animate = function(dt) { this.userData.animate(dt); };
    return group;
  }

  static createRealisticCharacter() {
    // Realistic: taller, more human proportions, skin and clothing colors
    const group = new THREE.Group();
    // Torso
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 1.1, 8, 16),
      new THREE.MeshPhongMaterial({ color: 0x8d5524 })
    );
    group.add(torso);
    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16),
      new THREE.MeshPhongMaterial({ color: 0xffdbac })
    );
    head.position.y = 1.05;
    group.add(head);
    // Arms
    const arms = [];
    for (let side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.75, 12),
        new THREE.MeshPhongMaterial({ color: 0xc68642 })
      );
      arm.position.set(0.33 * side, 0.55, 0);
      arm.rotation.z = Math.PI / 2;
      group.add(arm);
      arms.push(arm);
    }
    // Legs
    const legs = [];
    for (let side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 1.0, 12),
        new THREE.MeshPhongMaterial({ color: 0x403d3a })
      );
      leg.position.set(0.13 * side, -0.85, 0);
      group.add(leg);
      legs.push(leg);
    }
    group.name = 'Realistic';
    group.userData = {
      animationState: 'idle',
      animationTime: 0,
      arms,
      legs,
      head,
      setAnimationState(state) {
        this.animationState = state;
        this.animationTime = 0;
      },
      animate(dt) {
        this.animationTime += dt;
        if (this.animationState === 'idle') {
          this.head.position.y = 1.05 + 0.025 * Math.sin(this.animationTime * 2);
          this.arms[0].rotation.x = 0.04 * Math.sin(this.animationTime * 2);
          this.arms[1].rotation.x = -0.04 * Math.sin(this.animationTime * 2);
          this.legs[0].rotation.x = 0;
          this.legs[1].rotation.x = 0;
        } else if (this.animationState === 'walk' || this.animationState === 'run') {
          const speed = this.animationState === 'run' ? 6 : 3;
          const amp = this.animationState === 'run' ? 0.6 : 0.35;
          const t = this.animationTime * speed;
          this.arms[0].rotation.x = Math.sin(t) * amp;
          this.arms[1].rotation.x = -Math.sin(t) * amp;
          this.legs[0].rotation.x = -Math.sin(t) * amp;
          this.legs[1].rotation.x = Math.sin(t) * amp;
          this.head.position.y = 1.05 + 0.01 * Math.sin(t * 2);
        } else if (this.animationState === 'jump') {
          this.arms[0].rotation.x = -1.1;
          this.arms[1].rotation.x = -1.1;
          this.legs[0].rotation.x = 0.15;
          this.legs[1].rotation.x = 0.15;
          this.head.position.y = 1.05;
        }
      }
    };
    group.setAnimationState = function(state) { this.userData.setAnimationState(state); };
    group.animate = function(dt) { this.userData.animate(dt); };
    return group;
  }

  static createRobotCharacter() {
    // Robot: metallic, blocky, glowing eyes
    const group = new THREE.Group();
    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.0, 0.3),
      new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 80 })
    );
    group.add(body);
    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.32, 0.32),
      new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 100 })
    );
    head.position.y = 0.7;
    group.add(head);
    // Eyes
    for (let side of [-1, 1]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff })
      );
      eye.position.set(0.09 * side, 0.73, 0.18);
      group.add(eye);
    }
    // Arms
    const arms = [];
    for (let side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8),
        new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
      );
      arm.position.set(0.36 * side, 0.2, 0);
      arm.rotation.z = Math.PI / 2;
      group.add(arm);
      arms.push(arm);
    }
    // Legs
    const legs = [];
    for (let side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8),
        new THREE.MeshPhongMaterial({ color: 0x666666 })
      );
      leg.position.set(0.13 * side, -0.7, 0);
      group.add(leg);
      legs.push(leg);
    }
    group.name = 'Robot';
    group.userData = {
      animationState: 'idle',
      animationTime: 0,
      arms,
      legs,
      head,
      setAnimationState(state) {
        this.animationState = state;
        this.animationTime = 0;
      },
      animate(dt) {
        this.animationTime += dt;
        if (this.animationState === 'idle') {
          this.head.position.y = 0.7 + 0.02 * Math.sin(this.animationTime * 2);
          this.arms[0].rotation.x = 0.03 * Math.sin(this.animationTime * 2);
          this.arms[1].rotation.x = -0.03 * Math.sin(this.animationTime * 2);
          this.legs[0].rotation.x = 0;
          this.legs[1].rotation.x = 0;
        } else if (this.animationState === 'walk' || this.animationState === 'run') {
          const speed = this.animationState === 'run' ? 6 : 3;
          const amp = this.animationState === 'run' ? 0.5 : 0.25;
          const t = this.animationTime * speed;
          this.arms[0].rotation.x = Math.sin(t) * amp;
          this.arms[1].rotation.x = -Math.sin(t) * amp;
          this.legs[0].rotation.x = -Math.sin(t) * amp;
          this.legs[1].rotation.x = Math.sin(t) * amp;
          this.head.position.y = 0.7 + 0.01 * Math.sin(t * 2);
        } else if (this.animationState === 'jump') {
          this.arms[0].rotation.x = -1.0;
          this.arms[1].rotation.x = -1.0;
          this.legs[0].rotation.x = 0.1;
          this.legs[1].rotation.x = 0.1;
          this.head.position.y = 0.7;
        }
      }
    };
    group.setAnimationState = function(state) { this.userData.setAnimationState(state); };
    group.animate = function(dt) { this.userData.animate(dt); };
    return group;
  }
}

if (typeof window !== 'undefined') window.CharacterFactory = CharacterFactory;
