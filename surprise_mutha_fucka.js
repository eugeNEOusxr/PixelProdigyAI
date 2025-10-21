/**
 * ═══════════════════════════════════════════════════════════
 * SURPRISE MUTHA FUCKA - Easter Egg System
 * ═══════════════════════════════════════════════════════════
 * 
 * Random NPC jumps out with "SURPRISE MUTHA FUCKA" messages
 * Based on the legendary Dexter meme
 */

class SurpriseMuthaFucka {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.active = false;
        this.surpriseChance = 0.001;  // 0.1% chance per frame
        
        // All the classic lines
        this.lines = [
            "SURPRISE MUTHA FUCKA",
            "SOME FRIES MUTHA FUCKA",
            "ALL RISE MUTHA FUCKA",
            "DISGUISE MUTHA FUCKA",
            "SUPPLIES MUTHA FUCKA",
            "SUNRISE MUTHA FUCKA",
            "HEART EYES MUTHA FUCKA",
            "BAPTIZE MUTHA FUCKA",
            "SOME PIES MUTHA FUCKA",
            "DOWNSIZE MUTHA FUCKA"
        ];
        
        // Hidden NPC that jumps out
        this.surpriseNPC = null;
        
        console.log('🎭 SURPRISE MUTHA FUCKA system loaded! Watch out...');
    }
    
    /**
     * Check if it's time for a surprise
     */
    update() {
        if (this.active) return;  // Already surprising
        
        // Random chance
        if (Math.random() < this.surpriseChance) {
            this.trigger();
        }
    }
    
    /**
     * SURPRISE MUTHA FUCKA!
     */
    trigger() {
        this.active = true;
        
        // Find a random hiding spot around the player
        const angle = Math.random() * Math.PI * 2;
        const distance = 3 + Math.random() * 2;
        
        const hidingSpot = new THREE.Vector3(
            this.camera.position.x + Math.cos(angle) * distance,
            this.camera.position.y,
            this.camera.position.z + Math.sin(angle) * distance
        );
        
        // Create surprise NPC (simple character)
        this.createSurpriseNPC(hidingSpot);
        
        // Jump out animation
        this.jumpOut();
        
        // Show text
        const line = this.lines[Math.floor(Math.random() * this.lines.length)];
        this.showSurpriseText(line);
        
        // Play sound (if you add audio)
        console.log(`🎭 ${line}!`);
        
        // Disappear after 3 seconds
        setTimeout(() => {
            this.disappear();
        }, 3000);
    }
    
    /**
     * Create the surprise NPC (simplified character)
     */
    createSurpriseNPC(position) {
        const group = new THREE.Group();
        
        // Body (simple cube for now)
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.8, 0.3);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x2a2a2a,  // Dark clothing
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0xffdbac,  // Skin tone
            roughness: 0.6
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.5;
        group.add(head);
        
        // Eyes (wide with surprise!)
        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.08, 1.55, 0.15);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.08, 1.55, 0.15);
        group.add(rightEye);
        
        // Pupils (looking at camera)
        const pupilGeo = new THREE.SphereGeometry(0.02, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.08, 1.55, 0.17);
        group.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.08, 1.55, 0.17);
        group.add(rightPupil);
        
        // Mouth (open wide - O shape)
        const mouthGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 1.4, 0.18);
        mouth.rotation.x = Math.PI / 2;
        group.add(mouth);
        
        // Arms (raised in surprise)
        const armGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
        const armMat = new THREE.MeshStandardMaterial({ 
            color: 0xffdbac,
            roughness: 0.6
        });
        
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.3, 1.2, 0);
        leftArm.rotation.z = -0.5;  // Raised
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.3, 1.2, 0);
        rightArm.rotation.z = 0.5;  // Raised
        group.add(rightArm);
        
        // Position and hide initially (underground)
        group.position.copy(position);
        group.position.y = -2;  // Hidden underground
        
        // Look at camera
        group.lookAt(this.camera.position);
        
        this.scene.add(group);
        this.surpriseNPC = group;
    }
    
    /**
     * Jump out animation
     */
    jumpOut() {
        if (!this.surpriseNPC) return;
        
        const startY = -2;
        const endY = 0;
        const duration = 0.3;  // 300ms jump
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const t = Math.min(elapsed / duration, 1);
            
            // Ease out cubic for bouncy jump
            const eased = 1 - Math.pow(1 - t, 3);
            
            this.surpriseNPC.position.y = startY + (endY - startY) * eased;
            
            // Add bounce
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Wobble a bit
                this.surpriseNPC.rotation.y += Math.sin(Date.now() * 0.01) * 0.1;
            }
        };
        
        animate();
    }
    
    /**
     * Show surprise text overlay
     */
    showSurpriseText(text) {
        const textDiv = document.createElement('div');
        textDiv.style.position = 'absolute';
        textDiv.style.top = '20%';
        textDiv.style.left = '50%';
        textDiv.style.transform = 'translateX(-50%)';
        textDiv.style.fontSize = '72px';
        textDiv.style.fontWeight = 'bold';
        textDiv.style.color = '#ff0000';
        textDiv.style.textShadow = '4px 4px 8px #000000, 0 0 20px #ff0000';
        textDiv.style.fontFamily = 'Impact, sans-serif';
        textDiv.style.letterSpacing = '3px';
        textDiv.style.zIndex = '10000';
        textDiv.style.animation = 'pulse 0.3s ease-in-out infinite';
        textDiv.textContent = text;
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(textDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            textDiv.remove();
            style.remove();
        }, 3000);
    }
    
    /**
     * Disappear back into the woodwork
     */
    disappear() {
        if (!this.surpriseNPC) return;
        
        const startY = 0;
        const endY = -2;
        const duration = 0.5;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const t = Math.min(elapsed / duration, 1);
            
            // Ease in cubic - sink down
            const eased = t * t * t;
            
            this.surpriseNPC.position.y = startY + (endY - startY) * eased;
            
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove from scene
                this.scene.remove(this.surpriseNPC);
                this.surpriseNPC = null;
                this.active = false;
            }
        };
        
        animate();
    }
    
    /**
     * Force trigger for testing (press SHIFT+S)
     */
    forceTrigger() {
        if (!this.active) {
            this.trigger();
        }
    }
}

// Export for use in main game
if (typeof window !== 'undefined') {
    window.SurpriseMuthaFucka = SurpriseMuthaFucka;
}

/**
 * ═══════════════════════════════════════════════════════════
 * USAGE IN GAME:
 * ═══════════════════════════════════════════════════════════
 * 
 * // In skyrelics_world.html:
 * const surpriseSystem = new SurpriseMuthaFucka(scene, camera);
 * 
 * // In animation loop:
 * surpriseSystem.update();
 * 
 * // Test with keyboard (in keydown handler):
 * if (event.shiftKey && event.code === 'KeyS') {
 *     surpriseSystem.forceTrigger();
 * }
 * 
 * ═══════════════════════════════════════════════════════════
 */
