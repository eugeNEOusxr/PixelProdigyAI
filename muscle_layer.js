// Muscle Layer System
// Adds muscle geometry attached to existing skeleton bones
// Uses simple capsule-like meshes (cylinder + spheres) and updates positions each frame

class MuscleLayer {
  constructor(scene) {
    this.scene = scene;
    this.muscles = [];
    this.layerName = 'muscles';
    this.visible = true;
    this.material = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      roughness: 0.6,
      metalness: 0.0,
      transparent: true,
      opacity: 0.95
    });
  }

  // Find bone or mesh by name in the scene
  findBoneByName(name) {
    let found = null;
    this.scene.traverse(obj => {
      if (!found && obj.name && obj.name.toLowerCase().includes(name.toLowerCase())) {
        found = obj;
      }
    });
    return found;
  }

  // Create a capsule-like muscle between two bones (originName -> insertionName)
  createMuscleAttachedToBone(muscleName, originName, insertionName, options = {}) {
    const originBone = this.findBoneByName(originName);
    const insertionBone = this.findBoneByName(insertionName);

    if (!originBone || !insertionBone) {
      console.warn(`MuscleLayer: Could not find bones for muscle '${muscleName}' (${originName} -> ${insertionName})`);
      return null;
    }

    const defaults = {
      radius: options.radius || 0.25,
      segments: options.segments || 20,
      color: options.color || 0xcc0000,
      stiffness: options.stiffness || 0.8
    };

    // Base cylinder geometry of unit length along Y; we'll scale to match distance
    const cylGeom = new THREE.CylinderGeometry(defaults.radius * 0.6, defaults.radius, 1, defaults.segments, 1, true);
    const topSphere = new THREE.SphereGeometry(defaults.radius * 0.9, defaults.segments, defaults.segments);
    const bottomSphere = new THREE.SphereGeometry(defaults.radius * 0.9, defaults.segments, defaults.segments);

    const group = new THREE.Group();
    group.name = `muscle_${muscleName}`;
    group.userData.layer = this.layerName;

    const cyl = new THREE.Mesh(cylGeom, this.material.clone());
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    cyl.userData.isMusclePart = true;

    const topS = new THREE.Mesh(topSphere, this.material.clone());
    topS.userData.isMusclePart = true;

    const bottomS = new THREE.Mesh(bottomSphere, this.material.clone());
    bottomS.userData.isMusclePart = true;

    // Attach parts to group
    group.add(cyl);
    group.add(topS);
    group.add(bottomS);

    // store meta
    const muscle = {
      name: muscleName,
      originName,
      insertionName,
      originBone,
      insertionBone,
      group,
      cyl,
      topS,
      bottomS,
      radius: defaults.radius
    };

    // Initial placement
    this._positionMuscleParts(muscle);

    // Add to scene and list
    this.scene.add(group);
    this.muscles.push(muscle);

    return muscle;
  }

  // Position muscle geometry based on bone world positions
  _positionMuscleParts(muscle) {
    const { originBone, insertionBone, group, cyl, topS, bottomS, radius } = muscle;

    const originWorld = new THREE.Vector3();
    const insertionWorld = new THREE.Vector3();
    originBone.getWorldPosition(originWorld);
    insertionBone.getWorldPosition(insertionWorld);

    // Compute vector from origin to insertion
    const dir = new THREE.Vector3().subVectors(insertionWorld, originWorld);
    const length = dir.length();
    if (length < 0.0001) return;

    // Midpoint
    const mid = new THREE.Vector3().addVectors(originWorld, insertionWorld).multiplyScalar(0.5);

    // Orientation: align Y axis of cylinder with dir
    const yAxis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(yAxis, dir.clone().normalize());

    // Apply transforms
    group.position.copy(mid);
    group.quaternion.copy(quaternion);

    // Scale cylinder to match length (cylinder's height is 1 by construction)
    cyl.scale.set(1, length, 1);
    cyl.position.set(0, 0, 0);

    // Position end spheres at half-length along local Y
    topS.position.set(0, length * 0.5, 0);
    bottomS.position.set(0, -length * 0.5, 0);

    // Slightly taper cylinder radius by adjusting geometry scale
    cyl.scale.x = radius / 0.5;
    cyl.scale.z = radius / 0.5;

    // Set userData for debugging
    group.userData.origin = originBone.name;
    group.userData.insertion = insertionBone.name;
  }

  // Update all muscles positions; call from main animate loop
  updateMuscles() {
    if (!this.visible) return;
    for (const muscle of this.muscles) {
      this._positionMuscleParts(muscle);
    }
  }

  // Build a set of common muscles by bone names
  buildMajorMuscles() {
    // Arms - Left
    this.createMuscleAttachedToBone('Left Biceps', 'Left Humerus', 'Left Radius', { radius: 0.28, segments: 20 });
    this.createMuscleAttachedToBone('Left Triceps', 'Left Humerus', 'Left Ulna', { radius: 0.24, segments: 20 });

    // Arms - Right
    this.createMuscleAttachedToBone('Right Biceps', 'Right Humerus', 'Right Radius', { radius: 0.28, segments: 20 });
    this.createMuscleAttachedToBone('Right Triceps', 'Right Humerus', 'Right Ulna', { radius: 0.24, segments: 20 });

    // Chest
    this.createMuscleAttachedToBone('Pectoralis Major L', 'Left Clavicle', 'Left Humerus', { radius: 0.6, segments: 24 });
    this.createMuscleAttachedToBone('Pectoralis Major R', 'Right Clavicle', 'Right Humerus', { radius: 0.6, segments: 24 });

    // Abs (approximate from lower sternum to pelvis)
    this.createMuscleAttachedToBone('Rectus Abdominis', 'Torso', 'Pelvis', { radius: 0.5, segments: 24 });

    // Legs
    this.createMuscleAttachedToBone('Left Quadriceps', 'Left Femur', 'Left Tibia', { radius: 0.5, segments: 24 });
    this.createMuscleAttachedToBone('Right Quadriceps', 'Right Femur', 'Right Tibia', { radius: 0.5, segments: 24 });
    this.createMuscleAttachedToBone('Left Hamstrings', 'Left Femur', 'Left Fibula', { radius: 0.45, segments: 20 });
    this.createMuscleAttachedToBone('Right Hamstrings', 'Right Femur', 'Right Fibula', { radius: 0.45, segments: 20 });
  }

  // Toggle visibility of muscle layer
  setVisible(visible) {
    this.visible = visible;
    for (const m of this.muscles) {
      m.group.visible = visible;
    }
  }

  // Remove all muscles
  clearMuscles() {
    for (const m of this.muscles) {
      this.scene.remove(m.group);
    }
    this.muscles = [];
  }
}

// Export for CommonJS or attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MuscleLayer;
} else {
  window.MuscleLayer = MuscleLayer;
}
