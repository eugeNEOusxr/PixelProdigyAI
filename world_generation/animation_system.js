// world_generation/animation_system.js
// Advanced Animation System with State Machine, Blend Trees, and Locomotion Blending

/**
 * AnimationState - Represents a single animation state
 */
class AnimationState {
  constructor(name, animationData = {}) {
    this.name = name;
    this.animationData = animationData;
    this.transitions = [];
    this.onEnter = null;
    this.onExit = null;
    this.onUpdate = null;
  }

  addTransition(targetState, condition) {
    this.transitions.push({ targetState, condition });
  }

  checkTransitions(context) {
    for (let transition of this.transitions) {
      if (transition.condition(context)) {
        return transition.targetState;
      }
    }
    return null;
  }
}

/**
 * AnimationStateMachine - Manages state transitions and current state
 */
class AnimationStateMachine {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.transitionProgress = 0;
    this.isTransitioning = false;
    this.transitionDuration = 0.2; // 200ms default blend time
  }

  addState(state) {
    this.states.set(state.name, state);
  }

  setState(stateName, forceImmediate = false) {
    const newState = this.states.get(stateName);
    if (!newState || newState === this.currentState) return;

    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit();
    }

    this.previousState = this.currentState;
    this.currentState = newState;
    
    if (forceImmediate) {
      this.isTransitioning = false;
      this.transitionProgress = 1;
    } else {
      this.isTransitioning = true;
      this.transitionProgress = 0;
    }

    if (this.currentState.onEnter) {
      this.currentState.onEnter();
    }
  }

  update(dt, context) {
    if (!this.currentState) return;

    // Update transition blending
    if (this.isTransitioning) {
      this.transitionProgress += dt / this.transitionDuration;
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
        this.previousState = null;
      }
    }

    // Check for state transitions
    const nextState = this.currentState.checkTransitions(context);
    if (nextState) {
      this.setState(nextState);
    }

    // Update current state
    if (this.currentState.onUpdate) {
      this.currentState.onUpdate(dt, context);
    }
  }

  getBlendWeight() {
    return this.isTransitioning ? this.transitionProgress : 1;
  }

  getCurrentStateName() {
    return this.currentState ? this.currentState.name : null;
  }
}

/**
 * BlendTree - Blends between multiple animations based on parameters
 */
class BlendTree {
  constructor() {
    this.nodes = [];
  }

  addNode(animation, weight = 0) {
    this.nodes.push({ animation, weight, targetWeight: weight });
  }

  setWeight(index, weight) {
    if (this.nodes[index]) {
      this.nodes[index].targetWeight = Math.max(0, Math.min(1, weight));
    }
  }

  // 1D blend (e.g., idle -> walk -> run based on speed)
  blend1D(parameter, min, max) {
    if (this.nodes.length < 2) return;
    
    const normalized = Math.max(0, Math.min(1, (parameter - min) / (max - min)));
    const segmentSize = 1 / (this.nodes.length - 1);
    
    for (let i = 0; i < this.nodes.length; i++) {
      const nodePos = i * segmentSize;
      const distance = Math.abs(normalized - nodePos);
      this.nodes[i].targetWeight = Math.max(0, 1 - distance / segmentSize);
    }
  }

  // 2D blend (e.g., directional movement)
  blend2D(x, y) {
    // Simple radial blend for directional locomotion
    for (let node of this.nodes) {
      if (node.position) {
        const dx = x - node.position.x;
        const dy = y - node.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        node.targetWeight = Math.max(0, 1 - dist);
      }
    }
    this.normalizeWeights();
  }

  normalizeWeights() {
    const sum = this.nodes.reduce((acc, node) => acc + node.targetWeight, 0);
    if (sum > 0) {
      this.nodes.forEach(node => node.targetWeight /= sum);
    }
  }

  update(dt, smoothing = 5) {
    // Smoothly interpolate to target weights
    for (let node of this.nodes) {
      const diff = node.targetWeight - node.weight;
      node.weight += diff * Math.min(1, dt * smoothing);
    }
  }

  getBlendedValue(getValue) {
    let result = 0;
    for (let node of this.nodes) {
      if (node.weight > 0.001) {
        result += getValue(node.animation) * node.weight;
      }
    }
    return result;
  }
}

/**
 * LocomotionBlender - Blends locomotion animations (idle, walk, run) based on velocity
 */
class LocomotionBlender {
  constructor() {
    this.blendTree = new BlendTree();
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.acceleration = 8; // How fast speed changes
    
    // Speed thresholds
    this.idleThreshold = 0.1;
    this.walkSpeed = 2.0;
    this.runSpeed = 5.0;
  }

  setTargetSpeed(speed) {
    this.targetSpeed = speed;
  }

  update(dt) {
    // Smooth speed interpolation
    const diff = this.targetSpeed - this.currentSpeed;
    this.currentSpeed += diff * Math.min(1, dt * this.acceleration);

    // Blend based on speed
    if (this.currentSpeed < this.idleThreshold) {
      // Full idle
      return { state: 'idle', blend: 1.0 };
    } else if (this.currentSpeed < this.walkSpeed) {
      // Blend idle -> walk
      const t = this.currentSpeed / this.walkSpeed;
      return { state: 'walk', blend: t, idleBlend: 1 - t };
    } else if (this.currentSpeed < this.runSpeed) {
      // Blend walk -> run
      const t = (this.currentSpeed - this.walkSpeed) / (this.runSpeed - this.walkSpeed);
      return { state: 'run', blend: t, walkBlend: 1 - t };
    } else {
      // Full run
      return { state: 'run', blend: 1.0 };
    }
  }
}

/**
 * IKSolver - Simple 2-joint IK for foot placement
 */
class IKSolver {
  static solveTwoJoint(origin, target, length1, length2) {
    // Simple 2-joint IK (shoulder->elbow->hand or hip->knee->foot)
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Clamp distance to valid range
    const maxReach = length1 + length2;
    const minReach = Math.abs(length1 - length2);
    const clampedDist = Math.max(minReach, Math.min(maxReach, distance));
    
    // Law of cosines to find joint angles
    const cosAngle1 = (length1 * length1 + clampedDist * clampedDist - length2 * length2) / (2 * length1 * clampedDist);
    const cosAngle2 = (length1 * length1 + length2 * length2 - clampedDist * clampedDist) / (2 * length1 * length2);
    
    const angle1 = Math.acos(Math.max(-1, Math.min(1, cosAngle1)));
    const angle2 = Math.acos(Math.max(-1, Math.min(1, cosAngle2)));
    
    return { angle1, angle2, reachable: distance <= maxReach };
  }

  static applyFootIK(leg, groundHeight, hipPos) {
    // Apply IK to keep foot on ground
    const targetY = groundHeight;
    const hipY = hipPos.y;
    const thighLength = 0.5;
    const shinLength = 0.5;
    
    const result = this.solveTwoJoint(
      { x: hipPos.x, y: hipY, z: hipPos.z },
      { x: leg.position.x, y: targetY, z: leg.position.z },
      thighLength,
      shinLength
    );
    
    return result;
  }
}

/**
 * AnimationController - Main controller integrating all animation systems
 */
class AnimationController {
  constructor(character) {
    this.character = character;
    this.stateMachine = new AnimationStateMachine();
    this.locomotionBlender = new LocomotionBlender();
    this.enableIK = true;
    this.groundHeight = 0;
    
    this.setupStateMachine();
  }

  setupStateMachine() {
    // Create states
    const idleState = new AnimationState('idle');
    const walkState = new AnimationState('walk');
    const runState = new AnimationState('run');
    const jumpState = new AnimationState('jump');
    const landState = new AnimationState('land');
    const crouchState = new AnimationState('crouch');

    // Add states to machine
    this.stateMachine.addState(idleState);
    this.stateMachine.addState(walkState);
    this.stateMachine.addState(runState);
    this.stateMachine.addState(jumpState);
    this.stateMachine.addState(landState);
    this.stateMachine.addState(crouchState);

    // Setup transitions with conditions
    // Idle -> Walk/Run
    idleState.addTransition('walk', (ctx) => ctx.speed > 0.1 && ctx.speed < 3.5 && ctx.isGrounded);
    idleState.addTransition('run', (ctx) => ctx.speed >= 3.5 && ctx.isGrounded);
    idleState.addTransition('jump', (ctx) => ctx.isJumping);
    idleState.addTransition('crouch', (ctx) => ctx.isCrouching && ctx.isGrounded);

    // Walk -> Idle/Run
    walkState.addTransition('idle', (ctx) => ctx.speed < 0.1 && ctx.isGrounded);
    walkState.addTransition('run', (ctx) => ctx.speed >= 3.5 && ctx.isGrounded);
    walkState.addTransition('jump', (ctx) => ctx.isJumping);

    // Run -> Walk/Idle
    runState.addTransition('walk', (ctx) => ctx.speed < 3.5 && ctx.speed > 0.1 && ctx.isGrounded);
    runState.addTransition('idle', (ctx) => ctx.speed < 0.1 && ctx.isGrounded);
    runState.addTransition('jump', (ctx) => ctx.isJumping);

    // Jump -> Land
    jumpState.addTransition('land', (ctx) => ctx.isGrounded && !ctx.isJumping);

    // Land -> Idle/Walk/Run
    landState.addTransition('idle', (ctx) => ctx.speed < 0.1 && ctx.isGrounded);
    landState.addTransition('walk', (ctx) => ctx.speed > 0.1 && ctx.speed < 3.5 && ctx.isGrounded);
    landState.addTransition('run', (ctx) => ctx.speed >= 3.5 && ctx.isGrounded);

    // Crouch -> Idle
    crouchState.addTransition('idle', (ctx) => !ctx.isCrouching);

    // Set initial state
    this.stateMachine.setState('idle', true);
  }

  update(dt, context) {
    // Update locomotion blender
    this.locomotionBlender.setTargetSpeed(context.speed || 0);
    const locomotion = this.locomotionBlender.update(dt);

    // Update state machine
    this.stateMachine.update(dt, context);

    // Apply animation to character
    const currentState = this.stateMachine.getCurrentStateName();
    if (this.character.setAnimationState) {
      this.character.setAnimationState(currentState);
    }
    if (this.character.animate) {
      this.character.animate(dt);
    }

    // Apply IK if enabled
    if (this.enableIK && context.isGrounded && this.character.userData.legs) {
      this.applyFootIK();
    }

    return {
      currentState,
      locomotion,
      blendWeight: this.stateMachine.getBlendWeight()
    };
  }

  applyFootIK() {
    // Simple foot IK to keep feet on ground
    const legs = this.character.userData.legs;
    if (!legs) return;

    for (let leg of legs) {
      const worldPos = new THREE.Vector3();
      leg.getWorldPosition(worldPos);
      
      // Simple IK: adjust leg rotation to reach ground
      const targetY = this.groundHeight;
      const currentY = worldPos.y;
      const diff = targetY - currentY;
      
      if (Math.abs(diff) > 0.01) {
        leg.rotation.x += diff * 0.1;
      }
    }
  }

  setGroundHeight(height) {
    this.groundHeight = height;
  }

  getDebugInfo() {
    return {
      currentState: this.stateMachine.getCurrentStateName(),
      isTransitioning: this.stateMachine.isTransitioning,
      transitionProgress: this.stateMachine.transitionProgress,
      currentSpeed: this.locomotionBlender.currentSpeed.toFixed(2),
      targetSpeed: this.locomotionBlender.targetSpeed.toFixed(2)
    };
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.AnimationState = AnimationState;
  window.AnimationStateMachine = AnimationStateMachine;
  window.BlendTree = BlendTree;
  window.LocomotionBlender = LocomotionBlender;
  window.IKSolver = IKSolver;
  window.AnimationController = AnimationController;
}
