// world_generation/ai_system.js
// AI System with pathfinding, behaviors, and state machines

/**
 * Pathfinding - Simple A* pathfinding for navigation
 */
class Pathfinding {
  static findPath(start, goal, obstacles = [], gridSize = 1) {
    // Simple A* implementation
    const openSet = [{ pos: start, g: 0, h: this.heuristic(start, goal), f: 0, parent: null }];
    const closedSet = [];
    const maxIterations = 1000;
    let iterations = 0;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();

      // Check if reached goal
      if (this.distance(current.pos, goal) < gridSize) {
        return this.reconstructPath(current);
      }

      closedSet.push(current);

      // Check neighbors
      const neighbors = this.getNeighbors(current.pos, gridSize);
      for (let neighborPos of neighbors) {
        // Skip if in closed set or obstacle
        if (closedSet.some(n => this.distance(n.pos, neighborPos) < gridSize * 0.5)) continue;
        if (this.isObstacle(neighborPos, obstacles)) continue;

        const g = current.g + this.distance(current.pos, neighborPos);
        const h = this.heuristic(neighborPos, goal);
        const f = g + h;

        // Check if neighbor is in open set
        const existingIndex = openSet.findIndex(n => this.distance(n.pos, neighborPos) < gridSize * 0.5);
        if (existingIndex !== -1) {
          if (g < openSet[existingIndex].g) {
            openSet[existingIndex] = { pos: neighborPos, g, h, f, parent: current };
          }
        } else {
          openSet.push({ pos: neighborPos, g, h, f, parent: current });
        }
      }
    }

    // No path found, return direct line
    return [start, goal];
  }

  static reconstructPath(node) {
    const path = [];
    let current = node;
    while (current) {
      path.unshift(current.pos);
      current = current.parent;
    }
    return path;
  }

  static getNeighbors(pos, gridSize) {
    const neighbors = [];
    const directions = [
      { x: gridSize, z: 0 },
      { x: -gridSize, z: 0 },
      { x: 0, z: gridSize },
      { x: 0, z: -gridSize },
      { x: gridSize, z: gridSize },
      { x: -gridSize, z: -gridSize },
      { x: gridSize, z: -gridSize },
      { x: -gridSize, z: gridSize }
    ];

    for (let dir of directions) {
      neighbors.push({
        x: pos.x + dir.x,
        y: pos.y,
        z: pos.z + dir.z
      });
    }

    return neighbors;
  }

  static heuristic(a, b) {
    // Euclidean distance
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  static distance(a, b) {
    return this.heuristic(a, b);
  }

  static isObstacle(pos, obstacles) {
    for (let obstacle of obstacles) {
      const distance = this.distance(pos, obstacle.position);
      if (distance < (obstacle.radius || 1)) {
        return true;
      }
    }
    return false;
  }
}

/**
 * AIBehavior - Base behavior class
 */
class AIBehavior {
  constructor(name) {
    this.name = name;
    this.isActive = false;
  }

  enter(ai) {}
  update(ai, dt) {}
  exit(ai) {}
}

/**
 * IdleBehavior - Stand still and look around
 */
class IdleBehavior extends AIBehavior {
  constructor() {
    super('idle');
    this.lookTimer = 0;
    this.lookDuration = 2;
  }

  enter(ai) {
    this.isActive = true;
    this.lookTimer = 0;
  }

  update(ai, dt) {
    this.lookTimer += dt;
    
    // Occasionally look around
    if (this.lookTimer >= this.lookDuration) {
      this.lookTimer = 0;
      const randomAngle = Math.random() * Math.PI * 2;
      ai.targetRotation = randomAngle;
    }

    // Smoothly rotate to target
    if (ai.mesh) {
      const diff = ai.targetRotation - ai.mesh.rotation.y;
      ai.mesh.rotation.y += diff * dt * 2;
    }
  }

  exit(ai) {
    this.isActive = false;
  }
}

/**
 * PatrolBehavior - Move between waypoints
 */
class PatrolBehavior extends AIBehavior {
  constructor(waypoints) {
    super('patrol');
    this.waypoints = waypoints || [];
    this.currentWaypointIndex = 0;
    this.waitTimer = 0;
    this.waitDuration = 2;
  }

  enter(ai) {
    this.isActive = true;
    this.currentWaypointIndex = 0;
    this.waitTimer = 0;
  }

  update(ai, dt) {
    if (this.waypoints.length === 0) return;

    const targetWaypoint = this.waypoints[this.currentWaypointIndex];
    const distance = ai.getDistanceTo(targetWaypoint);

    if (distance < 0.5) {
      // Reached waypoint, wait
      this.waitTimer += dt;
      if (this.waitTimer >= this.waitDuration) {
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
        this.waitTimer = 0;
      }
    } else {
      // Move towards waypoint
      ai.moveTo(targetWaypoint, dt);
    }
  }

  exit(ai) {
    this.isActive = false;
  }
}

/**
 * ChaseBehavior - Chase a target
 */
class ChaseBehavior extends AIBehavior {
  constructor() {
    super('chase');
    this.minDistance = 2;
  }

  enter(ai) {
    this.isActive = true;
  }

  update(ai, dt) {
    if (!ai.target) return;

    const distance = ai.getDistanceTo(ai.target.position);
    
    if (distance > this.minDistance) {
      ai.moveTo(ai.target.position, dt);
    }
  }

  exit(ai) {
    this.isActive = false;
  }
}

/**
 * AttackBehavior - Attack target when in range
 */
class AttackBehavior extends AIBehavior {
  constructor() {
    super('attack');
    this.attackRange = 2;
    this.attackCooldown = 1.5;
    this.lastAttackTime = 0;
  }

  enter(ai) {
    this.isActive = true;
    this.lastAttackTime = 0;
  }

  update(ai, dt) {
    if (!ai.target || !ai.combatController) return;

    const distance = ai.getDistanceTo(ai.target.position);
    const currentTime = performance.now() / 1000;

    // Face target
    ai.lookAt(ai.target.position);

    // Attack if in range and cooldown ready
    if (distance <= this.attackRange && currentTime - this.lastAttackTime >= this.attackCooldown) {
      ai.combatController.performAttack('melee_light', currentTime, ai.scene);
      this.lastAttackTime = currentTime;
    }
  }

  exit(ai) {
    this.isActive = false;
  }
}

/**
 * FleeBehavior - Run away from target
 */
class FleeBehavior extends AIBehavior {
  constructor() {
    super('flee');
    this.fleeDistance = 10;
  }

  enter(ai) {
    this.isActive = true;
  }

  update(ai, dt) {
    if (!ai.target) return;

    const direction = new THREE.Vector3()
      .subVectors(ai.mesh.position, ai.target.position)
      .normalize();

    const fleeTarget = ai.mesh.position.clone().add(direction.multiplyScalar(this.fleeDistance));
    ai.moveTo(fleeTarget, dt);
  }

  exit(ai) {
    this.isActive = false;
  }
}

/**
 * AIController - Main AI controller with state machine
 */
class AIController {
  constructor(config) {
    this.mesh = config.mesh;
    this.scene = config.scene;
    this.combatStats = config.combatStats;
    this.combatController = config.combatController;
    this.target = null;
    this.moveSpeed = config.moveSpeed || 2;
    this.targetRotation = 0;
    
    // Behaviors
    this.behaviors = new Map();
    this.currentBehavior = null;
    
    // Detection
    this.detectionRange = config.detectionRange || 10;
    this.attackRange = config.attackRange || 2;
    this.loseTargetRange = config.loseTargetRange || 15;
    
    // Pathfinding
    this.path = [];
    this.currentPathIndex = 0;
    this.obstacles = [];
    
    // Setup default behaviors
    this.setupDefaultBehaviors();
  }

  setupDefaultBehaviors() {
    this.addBehavior(new IdleBehavior());
    this.addBehavior(new PatrolBehavior([]));
    this.addBehavior(new ChaseBehavior());
    this.addBehavior(new AttackBehavior());
    this.addBehavior(new FleeBehavior());
    
    // Start with idle
    this.setBehavior('idle');
  }

  addBehavior(behavior) {
    this.behaviors.set(behavior.name, behavior);
  }

  setBehavior(behaviorName) {
    const newBehavior = this.behaviors.get(behaviorName);
    if (!newBehavior || newBehavior === this.currentBehavior) return;

    if (this.currentBehavior) {
      this.currentBehavior.exit(this);
    }

    this.currentBehavior = newBehavior;
    this.currentBehavior.enter(this);
  }

  update(dt, player) {
    if (!this.mesh || this.combatStats?.isDead) return;

    // Check for player
    if (player) {
      const distanceToPlayer = this.getDistanceTo(player.position);
      
      // State transitions based on distance and health
      if (this.combatStats) {
        const healthPercent = this.combatStats.getHealthPercent();
        
        if (healthPercent < 20) {
          // Flee if low health
          this.target = player;
          if (this.currentBehavior?.name !== 'flee') {
            this.setBehavior('flee');
          }
        } else if (distanceToPlayer <= this.attackRange) {
          // Attack if in range
          this.target = player;
          if (this.currentBehavior?.name !== 'attack') {
            this.setBehavior('attack');
          }
        } else if (distanceToPlayer <= this.detectionRange) {
          // Chase if detected
          this.target = player;
          if (this.currentBehavior?.name !== 'chase') {
            this.setBehavior('chase');
          }
        } else if (distanceToPlayer > this.loseTargetRange) {
          // Return to idle/patrol if player is far
          this.target = null;
          if (this.currentBehavior?.name === 'chase' || this.currentBehavior?.name === 'attack') {
            this.setBehavior('idle');
          }
        }
      }
    }

    // Update current behavior
    if (this.currentBehavior) {
      this.currentBehavior.update(this, dt);
    }
  }

  moveTo(target, dt) {
    if (!this.mesh) return;

    const direction = new THREE.Vector3()
      .subVectors(target, this.mesh.position)
      .normalize();

    const movement = direction.multiplyScalar(this.moveSpeed * dt);
    this.mesh.position.add(movement);

    // Face movement direction
    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;
  }

  lookAt(target) {
    if (!this.mesh) return;

    const direction = new THREE.Vector3()
      .subVectors(target, this.mesh.position)
      .normalize();

    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;
  }

  getDistanceTo(target) {
    if (!this.mesh) return Infinity;
    return this.mesh.position.distanceTo(target);
  }

  setPatrolWaypoints(waypoints) {
    const patrolBehavior = this.behaviors.get('patrol');
    if (patrolBehavior) {
      patrolBehavior.waypoints = waypoints;
    }
  }

  getDebugInfo() {
    return {
      behavior: this.currentBehavior?.name || 'none',
      hasTarget: !!this.target,
      health: this.combatStats ? Math.ceil(this.combatStats.health) : 0
    };
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.Pathfinding = Pathfinding;
  window.AIBehavior = AIBehavior;
  window.IdleBehavior = IdleBehavior;
  window.PatrolBehavior = PatrolBehavior;
  window.ChaseBehavior = ChaseBehavior;
  window.AttackBehavior = AttackBehavior;
  window.FleeBehavior = FleeBehavior;
  window.AIController = AIController;
}
