// world_generation/collision_system.js
// Core collision detection for player and world geometry
// Capsule-vs-plane, capsule-vs-box, and capsule-vs-sphere

class CollisionWorld {
  constructor() {
    this.planes = []; // {normal: THREE.Vector3, constant: number}
    this.boxes = [];  // {min: THREE.Vector3, max: THREE.Vector3}
    this.spheres = []; // {center: THREE.Vector3, radius: number}
  }

  addPlane(normal, constant) {
    this.planes.push({ normal: normal.clone(), constant });
  }

  addBox(min, max) {
    this.boxes.push({ min: min.clone(), max: max.clone() });
  }

  addSphere(center, radius) {
    this.spheres.push({ center: center.clone(), radius });
  }

  // Capsule: {start: Vector3, end: Vector3, radius: number}
  testCapsule(capsule) {
    let result = { collided: false, corrections: [] };
    // Planes (ground, walls)
    for (let plane of this.planes) {
      let d1 = plane.normal.dot(capsule.start) - plane.constant;
      let d2 = plane.normal.dot(capsule.end) - plane.constant;
      if (d1 < capsule.radius || d2 < capsule.radius) {
        let penetration = capsule.radius - Math.min(d1, d2);
        let correction = plane.normal.clone().multiplyScalar(penetration);
        result.collided = true;
        result.corrections.push(correction);
      }
    }
    // Boxes (AABB)
    for (let box of this.boxes) {
      let closest = this._closestPointCapsuleAABB(capsule, box);
      let dist = closest.distance;
      if (dist < capsule.radius) {
        let penetration = capsule.radius - dist;
        let correction = closest.normal.clone().multiplyScalar(penetration);
        result.collided = true;
        result.corrections.push(correction);
      }
    }
    // Spheres
    for (let sphere of this.spheres) {
      let closest = this._closestPointCapsuleSphere(capsule, sphere);
      let dist = closest.distance;
      if (dist < capsule.radius + sphere.radius) {
        let penetration = (capsule.radius + sphere.radius) - dist;
        let correction = closest.normal.clone().multiplyScalar(penetration);
        result.collided = true;
        result.corrections.push(correction);
      }
    }
    return result;
  }

  // Helper: Closest point between capsule and AABB
  _closestPointCapsuleAABB(capsule, box) {
    let segA = capsule.start, segB = capsule.end;
    let closestA = segA.clone().clamp(box.min, box.max);
    let closestB = segB.clone().clamp(box.min, box.max);
    let dA = segA.distanceTo(closestA);
    let dB = segB.distanceTo(closestB);
    let normal = dA < dB ? segA.clone().sub(closestA) : segB.clone().sub(closestB);
    let dist = normal.length();
    if (dist > 0.0001) normal.normalize();
    else normal.set(0,1,0); // fallback
    return { distance: dist, normal };
  }

  // Helper: Closest point between capsule and sphere
  _closestPointCapsuleSphere(capsule, sphere) {
    let segA = capsule.start, segB = capsule.end;
    let center = sphere.center;
    // Project center onto capsule segment
    let ab = segB.clone().sub(segA);
    let t = ab.dot(center.clone().sub(segA)) / ab.lengthSq();
    t = Math.max(0, Math.min(1, t));
    let closest = segA.clone().add(ab.multiplyScalar(t));
    let normal = closest.clone().sub(center);
    let dist = normal.length();
    if (dist > 0.0001) normal.normalize();
    else normal.set(0,1,0);
    return { distance: dist, normal };
  }
}

// Export for use in player movement and test page
if (typeof window !== 'undefined') window.CollisionWorld = CollisionWorld;
export { CollisionWorld };
