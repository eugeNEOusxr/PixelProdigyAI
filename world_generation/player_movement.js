/**
 * 🏃 PIXELVERSE PLAYER MOVEMENT SYSTEM
 * =====================================
 * Advanced character movement with physics, momentum, and animations
 */

class PlayerMovement {
    constructor(character, options = {}) {
        this.character = character;
        
        // Movement states
        this.STATES = {
            IDLE: 'idle',
            WALKING: 'walking',
            RUNNING: 'running',
            SPRINTING: 'sprinting',
            JUMPING: 'jumping',
            FALLING: 'falling',
            CROUCHING: 'crouching',
            SLIDING: 'sliding'
        };
        this.currentState = this.STATES.IDLE;
        
        // Configuration
        this.config = {
            // Movement speeds (m/s)
            walkSpeed: 3.0,
            runSpeed: 5.5,
            sprintSpeed: 8.0,
            crouchSpeed: 1.5,
            
            // Acceleration & deceleration
            acceleration: 15.0,      // How fast we reach max speed
            deceleration: 20.0,      // How fast we stop
            airControl: 0.3,         // Movement control while airborne (0-1)
            
            // Jump physics
            jumpForce: 6.0,          // Initial jump velocity
            jumpCooldown: 0.3,       // Seconds between jumps
            coyoteTime: 0.15,        // Grace period after leaving ground
            jumpBufferTime: 0.1,     // Input buffer for early jumps
            
            // Gravity
            gravity: -20.0,          // m/s²
            maxFallSpeed: -30.0,     // Terminal velocity
            
            // Crouch
            crouchHeight: 0.5,       // Height multiplier when crouching
            crouchTransitionSpeed: 8.0,
            
            // Slide
            slideSpeed: 10.0,
            slideFriction: 3.0,
            slideMinSpeed: 3.0,
            slideCooldown: 1.0,
            
            // Momentum
            momentumEnabled: true,
            momentumDecay: 0.95,
            
            // Slope handling
            maxSlopeAngle: 45,       // Max climbable slope in degrees
            slideOnSteepSlope: true,
            
            ...options
        };
        
        // Physics state
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.momentum = new THREE.Vector3();
        
        // Ground detection
        this.isGrounded = false;
        this.groundNormal = new THREE.Vector3(0, 1, 0);
        this.timeSinceGrounded = 0;
        
        // Jump state
        this.canJump = true;
        this.jumpCooldownTimer = 0;
        this.jumpBufferTimer = 0;
        this.isJumping = false;
        
        // Crouch state
        this.isCrouching = false;
        this.originalHeight = 2.0;
        this.currentHeight = 2.0;
        
        // Slide state
        this.isSliding = false;
        this.slideDirection = new THREE.Vector3();
        this.slideCooldownTimer = 0;
        
        // Input state
        this.input = {
            moveForward: 0,    // -1 to 1
            moveRight: 0,      // -1 to 1
            jump: false,
            crouch: false,
            sprint: false
        };
        
        // Animation state
        this.animationState = {
            walkCycle: 0,
            legRotation: 0,
            armSwing: 0,
            bobPhase: 0
        };
        
        // Raycaster for ground detection
        this.raycaster = new THREE.Raycaster();
        this.groundCheckDistance = 0.1;
        
        console.log('🏃 Player Movement System initialized');
    }
    
    /**
     * Set input values (called by input handler)
     */
    setInput(moveForward, moveRight, jump, sprint, crouch) {
        this.input.moveForward = THREE.MathUtils.clamp(moveForward, -1, 1);
        this.input.moveRight = THREE.MathUtils.clamp(moveRight, -1, 1);
        this.input.jump = jump;
        this.input.sprint = sprint;
        this.input.crouch = crouch;
        
        // Buffer jump input
        if (jump && !this.isGrounded) {
            this.jumpBufferTimer = this.config.jumpBufferTime;
        }
    }
    
    /**
     * Check if player is on ground
     */
    checkGround(collisionWorld) {
        const rayOrigin = this.character.position.clone();
        rayOrigin.y += 0.1; // Start slightly above feet
        
        const rayDirection = new THREE.Vector3(0, -1, 0);
        this.raycaster.set(rayOrigin, rayDirection);
        this.raycaster.far = this.groundCheckDistance + 0.2;
        
        const intersects = this.raycaster.intersectObjects(collisionWorld, true);
        
        if (intersects.length > 0) {
            this.isGrounded = true;
            this.timeSinceGrounded = 0;
            this.groundNormal.copy(intersects[0].face.normal);
            return true;
        } else {
            this.isGrounded = false;
            return false;
        }
    }
    
    /**
     * Calculate movement direction from input
     */
    getMovementDirection(cameraForward, cameraRight) {
        const direction = new THREE.Vector3();
        
        // Combine forward/backward and left/right input
        direction.add(cameraForward.multiplyScalar(this.input.moveForward));
        direction.add(cameraRight.multiplyScalar(this.input.moveRight));
        
        // Normalize to prevent faster diagonal movement
        if (direction.length() > 0) {
            direction.normalize();
        }
        
        return direction;
    }
    
    /**
     * Get current movement speed based on state
     */
    getCurrentSpeed() {
        if (this.isSliding) return this.config.slideSpeed;
        if (this.isCrouching) return this.config.crouchSpeed;
        if (this.input.sprint && !this.isCrouching) return this.config.sprintSpeed;
        
        // Check if actually moving
        const isMoving = Math.abs(this.input.moveForward) > 0.1 || 
                        Math.abs(this.input.moveRight) > 0.1;
        
        if (!isMoving) return 0;
        
        return this.config.runSpeed;
    }
    
    /**
     * Update movement state
     */
    updateState() {
        const speed = this.velocity.length();
        const isMoving = Math.abs(this.input.moveForward) > 0.1 || 
                        Math.abs(this.input.moveRight) > 0.1;
        
        if (this.isSliding) {
            this.currentState = this.STATES.SLIDING;
        } else if (!this.isGrounded) {
            this.currentState = this.velocity.y > 0 ? this.STATES.JUMPING : this.STATES.FALLING;
        } else if (this.isCrouching) {
            this.currentState = this.STATES.CROUCHING;
        } else if (isMoving) {
            if (this.input.sprint) {
                this.currentState = this.STATES.SPRINTING;
            } else if (speed > 4.0) {
                this.currentState = this.STATES.RUNNING;
            } else {
                this.currentState = this.STATES.WALKING;
            }
        } else {
            this.currentState = this.STATES.IDLE;
        }
    }
    
    /**
     * Handle jumping
     */
    updateJump(deltaTime) {
        // Update timers
        this.jumpCooldownTimer = Math.max(0, this.jumpCooldownTimer - deltaTime);
        this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - deltaTime);
        
        if (!this.isGrounded) {
            this.timeSinceGrounded += deltaTime;
        }
        
        // Check if can jump (coyote time allows jump shortly after leaving ground)
        const canCoyoteJump = this.timeSinceGrounded < this.config.coyoteTime;
        const hasJumpBuffer = this.jumpBufferTimer > 0;
        
        if ((this.input.jump || hasJumpBuffer) && 
            (this.isGrounded || canCoyoteJump) && 
            this.jumpCooldownTimer <= 0 &&
            !this.isCrouching) {
            
            // Execute jump
            this.velocity.y = this.config.jumpForce;
            this.isGrounded = false;
            this.timeSinceGrounded = this.config.coyoteTime; // Prevent double jump
            this.jumpCooldownTimer = this.config.jumpCooldown;
            this.jumpBufferTimer = 0;
            this.isJumping = true;
            
            console.log('🦘 Jump! velocity.y =', this.velocity.y);
        }
        
        // Reset jump flag when player stops holding jump or lands
        if (!this.input.jump || this.isGrounded) {
            this.isJumping = false;
        }
    }
    
    /**
     * Handle crouching
     */
    updateCrouch(deltaTime) {
        const targetHeight = this.input.crouch 
            ? this.originalHeight * this.config.crouchHeight
            : this.originalHeight;
        
        // Smooth height transition
        this.currentHeight = THREE.MathUtils.lerp(
            this.currentHeight,
            targetHeight,
            deltaTime * this.config.crouchTransitionSpeed
        );
        
        this.isCrouching = this.currentHeight < this.originalHeight * 0.9;
        
        // Update character scale
        if (this.character.scale) {
            this.character.scale.y = this.currentHeight / this.originalHeight;
        }
    }
    
    /**
     * Handle sliding
     */
    updateSlide(deltaTime) {
        // Start slide: sprinting + crouch
        if (this.input.crouch && 
            this.input.sprint && 
            this.isGrounded && 
            !this.isSliding &&
            this.slideCooldownTimer <= 0 &&
            this.velocity.length() > this.config.slideMinSpeed) {
            
            this.isSliding = true;
            this.slideDirection.copy(this.velocity).normalize();
            console.log('🛝 Slide start!');
        }
        
        // Update slide
        if (this.isSliding) {
            // Apply friction
            const slideSpeed = this.velocity.length();
            const newSpeed = Math.max(0, slideSpeed - this.config.slideFriction * deltaTime);
            
            if (newSpeed > 0) {
                this.velocity.copy(this.slideDirection).multiplyScalar(newSpeed);
            }
            
            // End slide when too slow or player releases crouch
            if (slideSpeed < this.config.slideMinSpeed || !this.input.crouch || !this.isGrounded) {
                this.isSliding = false;
                this.slideCooldownTimer = this.config.slideCooldown;
                console.log('🛝 Slide end');
            }
        }
        
        // Update cooldown
        this.slideCooldownTimer = Math.max(0, this.slideCooldownTimer - deltaTime);
    }
    
    /**
     * Apply gravity
     */
    updateGravity(deltaTime) {
        if (!this.isGrounded) {
            this.velocity.y += this.config.gravity * deltaTime;
            this.velocity.y = Math.max(this.velocity.y, this.config.maxFallSpeed);
        } else if (this.velocity.y < 0) {
            this.velocity.y = 0; // Reset vertical velocity when grounded
        }
    }
    
    /**
     * Update horizontal movement
     */
    updateHorizontalMovement(deltaTime, cameraForward, cameraRight) {
        if (this.isSliding) return; // Slide handles its own movement
        
        const movementDir = this.getMovementDirection(cameraForward, cameraRight);
        const targetSpeed = this.getCurrentSpeed();
        const targetVelocity = movementDir.multiplyScalar(targetSpeed);
        
        // Get current horizontal velocity
        const currentHorizontal = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
        
        // Calculate acceleration rate
        const isAccelerating = targetVelocity.length() > currentHorizontal.length();
        const rate = isAccelerating ? this.config.acceleration : this.config.deceleration;
        
        // Apply air control multiplier if not grounded
        const controlMultiplier = this.isGrounded ? 1.0 : this.config.airControl;
        
        // Lerp towards target velocity
        const newHorizontal = new THREE.Vector3().lerpVectors(
            currentHorizontal,
            targetVelocity,
            deltaTime * rate * controlMultiplier
        );
        
        this.velocity.x = newHorizontal.x;
        this.velocity.z = newHorizontal.z;
        
        // Apply momentum if enabled
        if (this.config.momentumEnabled && !this.isGrounded) {
            this.velocity.x += this.momentum.x * this.config.momentumDecay;
            this.velocity.z += this.momentum.z * this.config.momentumDecay;
            this.momentum.multiplyScalar(this.config.momentumDecay);
        }
    }
    
    /**
     * Update character rotation to face movement direction
     */
    updateRotation(deltaTime) {
        if (this.isSliding) {
            // Face slide direction
            const angle = Math.atan2(this.slideDirection.x, this.slideDirection.z);
            this.character.rotation.y = THREE.MathUtils.lerp(
                this.character.rotation.y,
                angle,
                deltaTime * 10
            );
            return;
        }
        
        const horizontalVel = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
        
        if (horizontalVel.length() > 0.5) {
            const targetAngle = Math.atan2(horizontalVel.x, horizontalVel.z);
            
            // Smooth rotation towards movement direction
            this.character.rotation.y = THREE.MathUtils.lerp(
                this.character.rotation.y,
                targetAngle,
                deltaTime * 10
            );
        }
    }
    
    /**
     * Update animation state
     */
    updateAnimation(deltaTime) {
        const speed = new THREE.Vector3(this.velocity.x, 0, this.velocity.z).length();
        
        // Walk cycle
        if (speed > 0.1) {
            this.animationState.walkCycle += deltaTime * speed * 2;
            this.animationState.bobPhase += deltaTime * speed * 3;
        }
        
        // Leg rotation (walking animation)
        this.animationState.legRotation = Math.sin(this.animationState.walkCycle) * 0.5;
        
        // Arm swing
        this.animationState.armSwing = Math.sin(this.animationState.walkCycle + Math.PI) * 0.3;
    }
    
    /**
     * Apply movement to character position
     */
    applyMovement(deltaTime) {
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.character.position.add(movement);
    }
    
    /**
     * Main update function (call every frame)
     */
    update(deltaTime, collisionWorld, cameraForward, cameraRight) {
        // Clamp delta time to prevent physics explosions
        deltaTime = Math.min(deltaTime, 0.1);

        // Check ground
        this.checkGround(collisionWorld);

        // Update movement systems
        this.updateJump(deltaTime);
        this.updateCrouch(deltaTime);
        this.updateSlide(deltaTime);
        this.updateGravity(deltaTime);
        this.updateHorizontalMovement(deltaTime, cameraForward, cameraRight);
        this.updateRotation(deltaTime);
        this.updateAnimation(deltaTime);

        // Update state
        this.updateState();

        // --- Collision resolution ---
        if (collisionWorld) {
            // Represent player as capsule
            const capsule = {
                start: this.character.position.clone().add(new THREE.Vector3(0, this.currentHeight * 0.5 - this.config.crouchHeight * 0.5, 0)),
                end: this.character.position.clone().add(new THREE.Vector3(0, -this.currentHeight * 0.5 + this.config.crouchHeight * 0.5, 0)),
                radius: 0.4
            };
            const result = collisionWorld.testCapsule(capsule);
            if (result.collided) {
                // Apply all corrections
                for (let corr of result.corrections) {
                    this.character.position.add(corr);
                }
                // Stop velocity in direction of correction
                for (let corr of result.corrections) {
                    const n = corr.clone().normalize();
                    const dot = this.velocity.dot(n);
                    if (dot < 0) {
                        this.velocity.add(n.multiplyScalar(-dot));
                    }
                }
            }
        }

        // Apply movement
        this.applyMovement(deltaTime);

        // Update character flags
        this.character.isMoving = this.velocity.length() > 0.5;
        this.character.velocity = this.velocity.clone();
    }
    
    /**
     * Get debug information
     */
    getInfo() {
        return {
            state: this.currentState,
            velocity: {
                x: this.velocity.x.toFixed(2),
                y: this.velocity.y.toFixed(2),
                z: this.velocity.z.toFixed(2),
                magnitude: this.velocity.length().toFixed(2)
            },
            speed: new THREE.Vector3(this.velocity.x, 0, this.velocity.z).length().toFixed(2),
            isGrounded: this.isGrounded,
            isCrouching: this.isCrouching,
            isSliding: this.isSliding,
            isJumping: this.isJumping,
            height: this.currentHeight.toFixed(2)
        };
    }
    
    /**
     * Reset to default state
     */
    reset() {
        this.velocity.set(0, 0, 0);
        this.momentum.set(0, 0, 0);
        this.isGrounded = false;
        this.isCrouching = false;
        this.isSliding = false;
        this.isJumping = false;
        this.currentState = this.STATES.IDLE;
        this.currentHeight = this.originalHeight;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerMovement;
}
