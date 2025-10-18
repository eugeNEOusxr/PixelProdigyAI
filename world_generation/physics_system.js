/**
 * ⚛️ PIXELVERSE PHYSICS SYSTEM
 * =============================
 * Advanced physics simulation for realistic character movement
 */

class PhysicsSystem {
    constructor(options = {}) {
        this.config = {
            gravity: -20.0,
            airDensity: 1.225,          // kg/m³
            dragCoefficient: 0.47,       // Sphere drag
            terminalVelocity: -53.0,     // m/s (~120 mph)
            groundFriction: 0.6,
            airFriction: 0.02,
            bounciness: 0.3,
            minBounceVelocity: 2.0,
            ...options
        };
        
        console.log('⚛️ Physics System initialized');
    }
    
    /**
     * Apply gravity force
     */
    applyGravity(velocity, deltaTime, mass = 1.0) {
        const gravityForce = this.config.gravity * mass;
        velocity.y += (gravityForce / mass) * deltaTime;
        
        // Clamp to terminal velocity
        velocity.y = Math.max(velocity.y, this.config.terminalVelocity);
        
        return velocity;
    }
    
    /**
     * Apply drag force (air resistance)
     */
    applyDrag(velocity, deltaTime, isGrounded = false) {
        const friction = isGrounded ? this.config.groundFriction : this.config.airFriction;
        
        // Drag force = 0.5 * density * velocity² * area * dragCoefficient
        const speed = velocity.length();
        if (speed < 0.01) return velocity;
        
        const dragForce = 0.5 * this.config.airDensity * speed * speed * 
                         this.config.dragCoefficient * friction;
        
        const dragAcceleration = dragForce * deltaTime;
        const dragVelocity = velocity.clone().normalize().multiplyScalar(-dragAcceleration);
        
        velocity.add(dragVelocity);
        
        // Prevent drag from reversing direction
        if (velocity.length() < dragAcceleration) {
            velocity.set(0, velocity.y, 0);
        }
        
        return velocity;
    }
    
    /**
     * Handle collision response
     */
    handleCollision(velocity, normal, bounciness = null) {
        bounciness = bounciness !== null ? bounciness : this.config.bounciness;
        
        // Calculate reflection vector
        const dot = velocity.dot(normal);
        const reflection = velocity.clone().sub(
            normal.clone().multiplyScalar(2 * dot)
        );
        
        // Apply bounciness
        if (Math.abs(dot) > this.config.minBounceVelocity) {
            velocity.copy(reflection.multiplyScalar(bounciness));
        } else {
            // Too slow to bounce, just slide along surface
            velocity.sub(normal.clone().multiplyScalar(dot));
        }
        
        return velocity;
    }
    
    /**
     * Calculate slope angle from normal
     */
    getSlopeAngle(normal) {
        const up = new THREE.Vector3(0, 1, 0);
        const angle = Math.acos(normal.dot(up));
        return THREE.MathUtils.radToDeg(angle);
    }
    
    /**
     * Check if slope is walkable
     */
    isWalkableSlope(normal, maxAngle = 45) {
        return this.getSlopeAngle(normal) <= maxAngle;
    }
    
    /**
     * Project velocity onto slope plane
     */
    projectOntoSlope(velocity, slopeNormal) {
        const perpendicular = velocity.clone().projectOnVector(slopeNormal);
        return velocity.clone().sub(perpendicular);
    }
    
    /**
     * Calculate momentum from velocity and mass
     */
    calculateMomentum(velocity, mass = 1.0) {
        return velocity.clone().multiplyScalar(mass);
    }
    
    /**
     * Apply impulse force
     */
    applyImpulse(velocity, impulse, mass = 1.0) {
        const acceleration = impulse.clone().divideScalar(mass);
        return velocity.add(acceleration);
    }
    
    /**
     * Interpolate between two velocities
     */
    interpolateVelocity(current, target, factor) {
        return current.lerp(target, factor);
    }
}

/**
 * ⚙️ ADVANCED MOVEMENT FEATURES
 * ==============================
 * Additional movement mechanics and utilities
 */

class MovementFeatures {
    /**
     * Wall Running System
     */
    static wallRun = {
        enabled: false,
        minSpeed: 5.0,
        maxDuration: 2.0,
        jumpBoost: 1.5,
        gravityMultiplier: 0.3,
        
        checkWall(position, direction, raycaster, obstacles) {
            raycaster.set(position, direction);
            raycaster.far = 1.0;
            const hits = raycaster.intersectObjects(obstacles, true);
            return hits.length > 0 ? hits[0] : null;
        }
    };
    
    /**
     * Ledge Grab System
     */
    static ledgeGrab = {
        enabled: false,
        detectDistance: 1.0,
        climbSpeed: 2.0,
        
        checkLedge(position, direction, height, raycaster, obstacles) {
            const checkPos = position.clone().add(direction.multiplyScalar(0.5));
            checkPos.y += height;
            
            raycaster.set(checkPos, new THREE.Vector3(0, -1, 0));
            raycaster.far = 0.5;
            const hits = raycaster.intersectObjects(obstacles, true);
            
            return hits.length > 0;
        }
    };
    
    /**
     * Dash System
     */
    static dash = {
        enabled: false,
        distance: 5.0,
        duration: 0.2,
        cooldown: 1.0,
        currentCooldown: 0,
        
        execute(velocity, direction) {
            const dashVelocity = direction.clone().multiplyScalar(this.distance / this.duration);
            velocity.copy(dashVelocity);
            this.currentCooldown = this.cooldown;
            return velocity;
        },
        
        update(deltaTime) {
            this.currentCooldown = Math.max(0, this.currentCooldown - deltaTime);
        },
        
        canDash() {
            return this.enabled && this.currentCooldown <= 0;
        }
    };
    
    /**
     * Grappling Hook System
     */
    static grapple = {
        enabled: false,
        maxDistance: 20.0,
        pullSpeed: 15.0,
        swingDamping: 0.98,
        isGrappling: false,
        grapplepPoint: null,
        
        fire(origin, direction, raycaster, obstacles) {
            raycaster.set(origin, direction);
            raycaster.far = this.maxDistance;
            const hits = raycaster.intersectObjects(obstacles, true);
            
            if (hits.length > 0) {
                this.isGrappling = true;
                this.grapplePoint = hits[0].point;
                return true;
            }
            return false;
        },
        
        update(position, velocity, deltaTime) {
            if (!this.isGrappling || !this.grapplePoint) return velocity;
            
            const toGrapple = this.grapplePoint.clone().sub(position);
            const distance = toGrapple.length();
            
            if (distance > 0.5) {
                toGrapple.normalize();
                velocity.add(toGrapple.multiplyScalar(this.pullSpeed * deltaTime));
                velocity.multiplyScalar(this.swingDamping);
            } else {
                this.release();
            }
            
            return velocity;
        },
        
        release() {
            this.isGrappling = false;
            this.grapplePoint = null;
        }
    };
    
    /**
     * Double Jump System
     */
    static doubleJump = {
        enabled: false,
        force: 5.0,
        hasDoubleJump: true,
        
        reset() {
            this.hasDoubleJump = true;
        },
        
        execute(velocity) {
            if (this.enabled && this.hasDoubleJump) {
                velocity.y = this.force;
                this.hasDoubleJump = false;
                return true;
            }
            return false;
        }
    };
    
    /**
     * Stamina System
     */
    static stamina = {
        enabled: false,
        max: 100,
        current: 100,
        sprintDrain: 20,      // per second
        jumpCost: 10,
        regenRate: 15,        // per second
        regenDelay: 2.0,      // seconds after use
        regenTimer: 0,
        
        canSprint() {
            return this.current > 0;
        },
        
        canJump() {
            return this.current >= this.jumpCost;
        },
        
        useSprint(deltaTime) {
            this.current = Math.max(0, this.current - this.sprintDrain * deltaTime);
            this.regenTimer = this.regenDelay;
        },
        
        useJump() {
            this.current = Math.max(0, this.current - this.jumpCost);
            this.regenTimer = this.regenDelay;
        },
        
        update(deltaTime) {
            this.regenTimer = Math.max(0, this.regenTimer - deltaTime);
            
            if (this.regenTimer <= 0) {
                this.current = Math.min(this.max, this.current + this.regenRate * deltaTime);
            }
        },
        
        getPercent() {
            return (this.current / this.max) * 100;
        }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PhysicsSystem, MovementFeatures };
}
