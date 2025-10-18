/**
 * 🎥 PIXELVERSE 3D CAMERA CONTROLLER
 * ===================================
 * Professional camera system with FPS and TPS modes
 * Supports smooth transitions, collision detection, and configurable settings
 */

class CameraController {
    constructor(camera, options = {}) {
        this.camera = camera;
        this.target = null; // Character to follow
        
        // Camera modes
        this.MODES = {
            FIRST_PERSON: 'fps',
            THIRD_PERSON: 'tps',
            FREE: 'free'
        };
        this.currentMode = this.MODES.THIRD_PERSON;
        
        // Configuration
        this.config = {
            // First Person Settings
            fps: {
                eyeHeight: 1.7, // meters
                headBob: {
                    enabled: true,
                    frequency: 10.0,
                    amplitude: 0.05
                },
                fov: 75,
                minPitch: -89,
                maxPitch: 89
            },
            
            // Third Person Settings
            tps: {
                distance: 5.0,
                minDistance: 2.0,
                maxDistance: 15.0,
                height: 2.0,
                shoulderOffset: 0.5, // Right shoulder
                fov: 60,
                minPitch: -45,
                maxPitch: 75,
                collisionPadding: 0.3
            },
            
            // Mouse Settings
            mouse: {
                sensitivity: 0.002,
                smoothing: 0.1,
                invertY: false
            },
            
            // Zoom Settings
            zoom: {
                speed: 0.5,
                smoothing: 0.15
            },
            
            // Transition Settings
            transition: {
                duration: 0.5, // seconds
                smoothing: 0.2
            },
            
            ...options
        };
        
        // Camera state
        this.state = {
            yaw: 0,
            pitch: 0,
            targetYaw: 0,
            targetPitch: 0,
            distance: this.config.tps.distance,
            targetDistance: this.config.tps.distance,
            headBobTime: 0,
            isTransitioning: false,
            transitionProgress: 0
        };
        
        // Input tracking
        this.input = {
            mouseDeltaX: 0,
            mouseDeltaY: 0,
            scrollDelta: 0
        };
        
        // Collision system
        this.raycaster = new THREE.Raycaster();
        this.collisionObjects = [];
        
        this.init();
    }
    
    init() {
        console.log('🎥 Camera Controller initialized');
        this.setupEventListeners();
        this.setupPointerLock();
    }
    
    /**
     * Setup event listeners for mouse and scroll
     */
    setupEventListeners() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) {
                this.input.mouseDeltaX += e.movementX;
                this.input.mouseDeltaY += e.movementY;
            }
        });
        
        // Mouse wheel (zoom)
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.input.scrollDelta += e.deltaY * 0.001;
        }, { passive: false });
        
        // Camera mode toggle (V key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'v' || e.key === 'V') {
                this.toggleMode();
            }
        });
    }
    
    /**
     * Setup pointer lock for FPS controls
     */
    setupPointerLock() {
        document.addEventListener('click', () => {
            if (!document.pointerLockElement) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) {
                console.log('🔒 Pointer locked');
            } else {
                console.log('🔓 Pointer unlocked');
            }
        });
    }
    
    /**
     * Set the target character to follow
     */
    setTarget(target) {
        this.target = target;
        console.log('🎯 Camera target set:', target);
    }
    
    /**
     * Set collision objects for camera collision detection
     */
    setCollisionObjects(objects) {
        this.collisionObjects = objects;
    }
    
    /**
     * Toggle between camera modes
     */
    toggleMode() {
        if (this.currentMode === this.MODES.FIRST_PERSON) {
            this.setMode(this.MODES.THIRD_PERSON);
        } else {
            this.setMode(this.MODES.FIRST_PERSON);
        }
    }
    
    /**
     * Set camera mode with smooth transition
     */
    setMode(mode) {
        if (this.currentMode === mode) return;
        
        console.log(`🎥 Camera mode: ${this.currentMode} → ${mode}`);
        
        const prevMode = this.currentMode;
        this.currentMode = mode;
        
        // Start transition
        this.state.isTransitioning = true;
        this.state.transitionProgress = 0;
        
        // Update FOV
        const targetFOV = mode === this.MODES.FIRST_PERSON 
            ? this.config.fps.fov 
            : this.config.tps.fov;
        this.animateFOV(targetFOV);
    }
    
    /**
     * Animate FOV change
     */
    animateFOV(targetFOV) {
        const startFOV = this.camera.fov;
        const duration = this.config.transition.duration * 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutQuad(progress);
            
            this.camera.fov = startFOV + (targetFOV - startFOV) * eased;
            this.camera.updateProjectionMatrix();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * Easing function for smooth transitions
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    /**
     * Handle zoom input
     */
    handleZoom(deltaTime) {
        if (this.currentMode !== this.MODES.THIRD_PERSON) return;
        
        // Apply scroll delta to target distance
        this.state.targetDistance += this.input.scrollDelta * this.config.zoom.speed;
        this.state.targetDistance = THREE.MathUtils.clamp(
            this.state.targetDistance,
            this.config.tps.minDistance,
            this.config.tps.maxDistance
        );
        
        // Smooth zoom
        this.state.distance = THREE.MathUtils.lerp(
            this.state.distance,
            this.state.targetDistance,
            this.config.zoom.smoothing
        );
        
        // Reset scroll delta
        this.input.scrollDelta = 0;
    }
    
    /**
     * Handle mouse look input
     */
    handleMouseLook(deltaTime) {
        // Apply mouse delta to target rotation
        const sensitivity = this.config.mouse.sensitivity;
        this.state.targetYaw -= this.input.mouseDeltaX * sensitivity;
        this.state.targetPitch -= this.input.mouseDeltaY * sensitivity 
            * (this.config.mouse.invertY ? -1 : 1);
        
        // Clamp pitch based on mode
        const pitchLimits = this.currentMode === this.MODES.FIRST_PERSON
            ? this.config.fps
            : this.config.tps;
        
        this.state.targetPitch = THREE.MathUtils.clamp(
            this.state.targetPitch,
            THREE.MathUtils.degToRad(pitchLimits.minPitch),
            THREE.MathUtils.degToRad(pitchLimits.maxPitch)
        );
        
        // Smooth rotation
        const smoothing = this.config.mouse.smoothing;
        this.state.yaw = THREE.MathUtils.lerp(
            this.state.yaw,
            this.state.targetYaw,
            smoothing
        );
        this.state.pitch = THREE.MathUtils.lerp(
            this.state.pitch,
            this.state.targetPitch,
            smoothing
        );
        
        // Reset mouse delta
        this.input.mouseDeltaX = 0;
        this.input.mouseDeltaY = 0;
    }
    
    /**
     * Update first-person camera
     */
    updateFirstPerson(deltaTime) {
        if (!this.target) return;
        
        const targetPos = this.target.position.clone();
        
        // Add eye height
        targetPos.y += this.config.fps.eyeHeight;
        
        // Add head bob if moving
        if (this.config.fps.headBob.enabled && this.target.isMoving) {
            this.state.headBobTime += deltaTime * this.config.fps.headBob.frequency;
            const bobAmount = Math.sin(this.state.headBobTime) * this.config.fps.headBob.amplitude;
            targetPos.y += bobAmount;
        }
        
        // Set camera position
        this.camera.position.copy(targetPos);
        
        // Set camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.state.yaw;
        this.camera.rotation.x = this.state.pitch;
    }
    
    /**
     * Update third-person camera
     */
    updateThirdPerson(deltaTime) {
        if (!this.target) return;
        
        const targetPos = this.target.position.clone();
        targetPos.y += this.config.tps.height;
        
        // Calculate desired camera position
        const distance = this.state.distance;
        const offset = new THREE.Vector3(
            Math.sin(this.state.yaw) * Math.cos(this.state.pitch) * distance,
            Math.sin(this.state.pitch) * distance,
            Math.cos(this.state.yaw) * Math.cos(this.state.pitch) * distance
        );
        
        // Add shoulder offset
        const shoulderOffset = new THREE.Vector3(
            Math.cos(this.state.yaw) * this.config.tps.shoulderOffset,
            0,
            -Math.sin(this.state.yaw) * this.config.tps.shoulderOffset
        );
        
        let cameraPos = targetPos.clone().add(offset).add(shoulderOffset);
        
        // Check for collisions
        cameraPos = this.checkCameraCollision(targetPos, cameraPos);
        
        // Set camera position
        this.camera.position.copy(cameraPos);
        
        // Look at target
        this.camera.lookAt(targetPos);
    }
    
    /**
     * Check for camera collision with world objects
     */
    checkCameraCollision(targetPos, desiredPos) {
        if (this.collisionObjects.length === 0) return desiredPos;
        
        const direction = desiredPos.clone().sub(targetPos);
        const distance = direction.length();
        direction.normalize();
        
        // Raycast from target to desired camera position
        this.raycaster.set(targetPos, direction);
        this.raycaster.far = distance;
        
        const intersects = this.raycaster.intersectObjects(this.collisionObjects, true);
        
        if (intersects.length > 0) {
            // Collision detected, move camera closer
            const hitDistance = intersects[0].distance - this.config.tps.collisionPadding;
            return targetPos.clone().add(direction.multiplyScalar(Math.max(hitDistance, 0.5)));
        }
        
        return desiredPos;
    }
    
    /**
     * Update camera (call every frame)
     */
    update(deltaTime) {
        if (!this.target) return;
        
        // Handle input
        this.handleMouseLook(deltaTime);
        this.handleZoom(deltaTime);
        
        // Update transition
        if (this.state.isTransitioning) {
            this.state.transitionProgress += deltaTime / this.config.transition.duration;
            if (this.state.transitionProgress >= 1) {
                this.state.isTransitioning = false;
                this.state.transitionProgress = 1;
            }
        }
        
        // Update camera based on mode
        switch (this.currentMode) {
            case this.MODES.FIRST_PERSON:
                this.updateFirstPerson(deltaTime);
                break;
                
            case this.MODES.THIRD_PERSON:
                this.updateThirdPerson(deltaTime);
                break;
        }
    }
    
    /**
     * Get camera direction (for movement)
     */
    getDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.y = 0; // Keep on horizontal plane
        direction.normalize();
        return direction;
    }
    
    /**
     * Get camera right vector (for strafing)
     */
    getRight() {
        const right = new THREE.Vector3();
        right.crossVectors(this.camera.up, this.getDirection());
        right.normalize();
        return right;
    }
    
    /**
     * Get camera forward vector (on horizontal plane)
     */
    getForward() {
        return this.getDirection();
    }
    
    /**
     * Get camera info for debugging
     */
    getInfo() {
        return {
            mode: this.currentMode,
            yaw: THREE.MathUtils.radToDeg(this.state.yaw).toFixed(1),
            pitch: THREE.MathUtils.radToDeg(this.state.pitch).toFixed(1),
            distance: this.state.distance.toFixed(2),
            fov: this.camera.fov.toFixed(1),
            position: {
                x: this.camera.position.x.toFixed(2),
                y: this.camera.position.y.toFixed(2),
                z: this.camera.position.z.toFixed(2)
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraController;
}
