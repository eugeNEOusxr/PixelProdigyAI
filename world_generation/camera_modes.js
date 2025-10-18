/**
 * 📹 PIXELVERSE CAMERA MODES
 * ==========================
 * Additional camera modes and presets for different gameplay situations
 */

class CameraModes {
    /**
     * Cinematic Camera Mode - For cutscenes and dramatic moments
     */
    static cinematicMode(camera, target, options = {}) {
        return {
            name: 'Cinematic',
            fov: options.fov || 35,
            distance: options.distance || 8,
            height: options.height || 3,
            angle: options.angle || 25,
            smoothing: 0.05,
            update(deltaTime, time) {
                // Smooth orbit around target
                const angle = (time * 0.1 + options.angle) || 0;
                const x = Math.sin(angle) * this.distance;
                const z = Math.cos(angle) * this.distance;
                
                camera.position.x = target.position.x + x;
                camera.position.y = target.position.y + this.height;
                camera.position.z = target.position.z + z;
                
                camera.lookAt(
                    target.position.x,
                    target.position.y + 1.5,
                    target.position.z
                );
            }
        };
    }
    
    /**
     * Combat Camera Mode - Optimized for combat
     */
    static combatMode(camera, target, options = {}) {
        return {
            name: 'Combat',
            fov: options.fov || 70,
            distance: 4.0,
            height: 1.5,
            shoulderOffset: 0.8,
            lockOnTarget: null,
            smoothing: 0.15,
            
            setLockOnTarget(enemy) {
                this.lockOnTarget = enemy;
            },
            
            update(deltaTime) {
                const targetPos = target.position.clone();
                targetPos.y += this.height;
                
                // Position behind and to the side of player
                const yaw = target.rotation.y || 0;
                const offset = new THREE.Vector3(
                    Math.sin(yaw) * this.distance + Math.cos(yaw) * this.shoulderOffset,
                    0,
                    Math.cos(yaw) * this.distance - Math.sin(yaw) * this.shoulderOffset
                );
                
                camera.position.lerp(targetPos.clone().add(offset), this.smoothing);
                
                // If locked on, look at enemy, otherwise look forward
                if (this.lockOnTarget) {
                    const lookTarget = this.lockOnTarget.position.clone();
                    lookTarget.y += 1.5;
                    camera.lookAt(lookTarget);
                } else {
                    camera.lookAt(targetPos);
                }
            }
        };
    }
    
    /**
     * Spectator Camera Mode - Free flying camera
     */
    static spectatorMode(camera, options = {}) {
        return {
            name: 'Spectator',
            fov: options.fov || 80,
            speed: options.speed || 10,
            boostSpeed: options.boostSpeed || 50,
            yaw: 0,
            pitch: 0,
            
            handleInput(input, deltaTime) {
                // Rotation
                this.yaw -= input.mouseDeltaX * 0.002;
                this.pitch -= input.mouseDeltaY * 0.002;
                this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI / 2, Math.PI / 2);
                
                // Movement
                const speed = input.keys.shift ? this.boostSpeed : this.speed;
                const forward = new THREE.Vector3(
                    Math.sin(this.yaw),
                    0,
                    Math.cos(this.yaw)
                );
                const right = new THREE.Vector3(
                    Math.cos(this.yaw),
                    0,
                    -Math.sin(this.yaw)
                );
                const up = new THREE.Vector3(0, 1, 0);
                
                if (input.keys.w) camera.position.addScaledVector(forward, -speed * deltaTime);
                if (input.keys.s) camera.position.addScaledVector(forward, speed * deltaTime);
                if (input.keys.a) camera.position.addScaledVector(right, -speed * deltaTime);
                if (input.keys.d) camera.position.addScaledVector(right, speed * deltaTime);
                if (input.keys.space) camera.position.addScaledVector(up, speed * deltaTime);
                if (input.keys.control) camera.position.addScaledVector(up, -speed * deltaTime);
            },
            
            update(deltaTime, input) {
                this.handleInput(input, deltaTime);
                
                camera.rotation.order = 'YXZ';
                camera.rotation.y = this.yaw;
                camera.rotation.x = this.pitch;
            }
        };
    }
    
    /**
     * Top-Down Camera Mode - RTS/Strategy view
     */
    static topDownMode(camera, target, options = {}) {
        return {
            name: 'TopDown',
            fov: options.fov || 50,
            height: options.height || 15,
            angle: options.angle || 45,
            smoothing: 0.1,
            
            update(deltaTime) {
                const targetPos = target.position.clone();
                
                // Position above and behind target
                const angleRad = THREE.MathUtils.degToRad(this.angle);
                const distance = this.height / Math.sin(angleRad);
                const horizontalDist = distance * Math.cos(angleRad);
                
                const yaw = target.rotation.y || 0;
                camera.position.x = targetPos.x + Math.sin(yaw) * horizontalDist;
                camera.position.y = targetPos.y + this.height;
                camera.position.z = targetPos.z + Math.cos(yaw) * horizontalDist;
                
                camera.lookAt(targetPos);
            }
        };
    }
    
    /**
     * Side Scroller Camera Mode - 2.5D platformer view
     */
    static sideScrollerMode(camera, target, options = {}) {
        return {
            name: 'SideScroller',
            fov: options.fov || 50,
            distance: options.distance || 10,
            height: options.height || 0,
            smoothing: 0.1,
            
            update(deltaTime) {
                const targetPos = target.position.clone();
                
                // Lock to side view
                camera.position.x = targetPos.x;
                camera.position.y = targetPos.y + this.height;
                camera.position.z = targetPos.z + this.distance;
                
                camera.lookAt(targetPos);
            }
        };
    }
    
    /**
     * Vehicle Camera Mode - For driving/flying
     */
    static vehicleMode(camera, target, options = {}) {
        return {
            name: 'Vehicle',
            fov: options.fov || 75,
            distance: 6.0,
            height: 2.0,
            smoothing: 0.08,
            velocityInfluence: 0.5,
            
            update(deltaTime) {
                const targetPos = target.position.clone();
                const velocity = target.velocity || new THREE.Vector3();
                const yaw = target.rotation.y || 0;
                
                // Base position behind vehicle
                let offset = new THREE.Vector3(
                    Math.sin(yaw) * this.distance,
                    this.height,
                    Math.cos(yaw) * this.distance
                );
                
                // Adjust based on velocity (camera pulls back when going fast)
                const speed = velocity.length();
                offset.multiplyScalar(1 + speed * this.velocityInfluence * 0.1);
                
                const desiredPos = targetPos.clone().add(offset);
                camera.position.lerp(desiredPos, this.smoothing);
                
                // Look ahead of vehicle based on velocity
                const lookAhead = targetPos.clone().add(velocity.multiplyScalar(0.3));
                lookAhead.y += 1.0;
                camera.lookAt(lookAhead);
            }
        };
    }
    
    /**
     * Orbit Camera Mode - For examining objects
     */
    static orbitMode(camera, target, options = {}) {
        return {
            name: 'Orbit',
            fov: options.fov || 60,
            distance: options.distance || 5,
            minDistance: options.minDistance || 2,
            maxDistance: options.maxDistance || 20,
            yaw: 0,
            pitch: 0,
            autoRotate: options.autoRotate || false,
            autoRotateSpeed: options.autoRotateSpeed || 0.5,
            
            handleInput(input, deltaTime) {
                // Manual rotation
                this.yaw -= input.mouseDeltaX * 0.003;
                this.pitch -= input.mouseDeltaY * 0.003;
                this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
                
                // Zoom
                this.distance += input.scrollDelta * 0.5;
                this.distance = THREE.MathUtils.clamp(this.distance, this.minDistance, this.maxDistance);
            },
            
            update(deltaTime, input) {
                if (input) this.handleInput(input, deltaTime);
                
                // Auto-rotate
                if (this.autoRotate) {
                    this.yaw += this.autoRotateSpeed * deltaTime;
                }
                
                // Calculate position
                const targetPos = target.position.clone();
                const x = Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance;
                const y = Math.sin(this.pitch) * this.distance;
                const z = Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance;
                
                camera.position.x = targetPos.x + x;
                camera.position.y = targetPos.y + y + 1;
                camera.position.z = targetPos.z + z;
                
                camera.lookAt(targetPos.x, targetPos.y + 1, targetPos.z);
            }
        };
    }
    
    /**
     * Screenshot Camera Mode - Fixed angle for perfect shots
     */
    static screenshotMode(camera, target, options = {}) {
        return {
            name: 'Screenshot',
            fov: options.fov || 50,
            presets: {
                portrait: { distance: 3, height: 1.6, pitch: 0 },
                action: { distance: 5, height: 2.5, pitch: -10 },
                landscape: { distance: 10, height: 3, pitch: -15 },
                dramatic: { distance: 4, height: 0.5, pitch: 15 }
            },
            currentPreset: 'portrait',
            
            setPreset(presetName) {
                if (this.presets[presetName]) {
                    this.currentPreset = presetName;
                    console.log(`📸 Screenshot preset: ${presetName}`);
                }
            },
            
            update(deltaTime) {
                const preset = this.presets[this.currentPreset];
                const targetPos = target.position.clone();
                const yaw = target.rotation.y || 0;
                
                const pitchRad = THREE.MathUtils.degToRad(preset.pitch);
                const x = Math.sin(yaw) * Math.cos(pitchRad) * preset.distance;
                const y = Math.sin(pitchRad) * preset.distance + preset.height;
                const z = Math.cos(yaw) * Math.cos(pitchRad) * preset.distance;
                
                camera.position.x = targetPos.x + x;
                camera.position.y = targetPos.y + y;
                camera.position.z = targetPos.z + z;
                
                camera.lookAt(targetPos.x, targetPos.y + 1.5, targetPos.z);
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraModes;
}
