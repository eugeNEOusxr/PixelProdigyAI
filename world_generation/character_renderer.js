/**
 * PIXELVERSE CHARACTER RENDERER
 * ==============================
 * 3D Character Model Rendering with Skeletal Animation
 * - VLS format integration
 * - Skeletal bone hierarchy
 * - Animation blending
 * - Equipment visualization
 * - LOD (Level of Detail) system
 * - Multiplayer synchronization
 */

// ==========================================
// CHARACTER BONE HIERARCHY
// ==========================================

class Bone {
    constructor(name, parentIndex, position, rotation) {
        this.name = name;
        this.parentIndex = parentIndex;
        this.localPosition = position || { x: 0, y: 0, z: 0 };
        this.localRotation = rotation || { x: 0, y: 0, z: 0, w: 1 }; // Quaternion
        this.worldPosition = { x: 0, y: 0, z: 0 };
        this.worldRotation = { x: 0, y: 0, z: 0, w: 1 };
        this.worldMatrix = this.createIdentityMatrix();
    }

    createIdentityMatrix() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    updateWorldTransform(parentMatrix) {
        // Combine local transform with parent
        const localMatrix = this.createTransformMatrix();
        this.worldMatrix = this.multiplyMatrices(parentMatrix, localMatrix);
        
        // Extract world position from matrix
        this.worldPosition = {
            x: this.worldMatrix[12],
            y: this.worldMatrix[13],
            z: this.worldMatrix[14]
        };
    }

    createTransformMatrix() {
        const { x, y, z } = this.localPosition;
        const { x: qx, y: qy, z: qz, w: qw } = this.localRotation;
        
        // Create rotation matrix from quaternion
        const m = [];
        m[0] = 1 - 2 * (qy * qy + qz * qz);
        m[1] = 2 * (qx * qy + qz * qw);
        m[2] = 2 * (qx * qz - qy * qw);
        m[3] = 0;
        
        m[4] = 2 * (qx * qy - qz * qw);
        m[5] = 1 - 2 * (qx * qx + qz * qz);
        m[6] = 2 * (qy * qz + qx * qw);
        m[7] = 0;
        
        m[8] = 2 * (qx * qz + qy * qw);
        m[9] = 2 * (qy * qz - qx * qw);
        m[10] = 1 - 2 * (qx * qx + qy * qy);
        m[11] = 0;
        
        // Add translation
        m[12] = x;
        m[13] = y;
        m[14] = z;
        m[15] = 1;
        
        return m;
    }

    multiplyMatrices(a, b) {
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        return result;
    }
}

// ==========================================
// CHARACTER SKELETON
// ==========================================

class CharacterSkeleton {
    constructor() {
        this.bones = [];
        this.boneMap = new Map();
        this.rootBone = null;
        this.initializeHumanoidSkeleton();
    }

    initializeHumanoidSkeleton() {
        // Standard humanoid rig (15 bones)
        const boneDefinitions = [
            { name: 'root', parent: -1, pos: { x: 0, y: 0, z: 0 } },
            { name: 'spine', parent: 0, pos: { x: 0, y: 0.9, z: 0 } },
            { name: 'chest', parent: 1, pos: { x: 0, y: 0.3, z: 0 } },
            { name: 'neck', parent: 2, pos: { x: 0, y: 0.2, z: 0 } },
            { name: 'head', parent: 3, pos: { x: 0, y: 0.15, z: 0 } },
            
            { name: 'shoulder_left', parent: 2, pos: { x: 0.15, y: 0.15, z: 0 } },
            { name: 'arm_left', parent: 5, pos: { x: 0.25, y: 0, z: 0 } },
            { name: 'forearm_left', parent: 6, pos: { x: 0.25, y: 0, z: 0 } },
            { name: 'hand_left', parent: 7, pos: { x: 0.15, y: 0, z: 0 } },
            
            { name: 'shoulder_right', parent: 2, pos: { x: -0.15, y: 0.15, z: 0 } },
            { name: 'arm_right', parent: 9, pos: { x: -0.25, y: 0, z: 0 } },
            { name: 'forearm_right', parent: 10, pos: { x: -0.25, y: 0, z: 0 } },
            { name: 'hand_right', parent: 11, pos: { x: -0.15, y: 0, z: 0 } },
            
            { name: 'leg_left', parent: 0, pos: { x: 0.1, y: -0.45, z: 0 } },
            { name: 'foot_left', parent: 13, pos: { x: 0, y: -0.45, z: 0 } },
            
            { name: 'leg_right', parent: 0, pos: { x: -0.1, y: -0.45, z: 0 } },
            { name: 'foot_right', parent: 15, pos: { x: 0, y: -0.45, z: 0 } }
        ];

        for (let def of boneDefinitions) {
            const bone = new Bone(def.name, def.parent, def.pos);
            this.bones.push(bone);
            this.boneMap.set(def.name, bone);
        }

        this.rootBone = this.bones[0];
    }

    getBone(name) {
        return this.boneMap.get(name);
    }

    updateBoneTransforms() {
        // Update bones in hierarchy order
        for (let i = 0; i < this.bones.length; i++) {
            const bone = this.bones[i];
            if (bone.parentIndex === -1) {
                bone.updateWorldTransform(bone.createIdentityMatrix());
            } else {
                const parentBone = this.bones[bone.parentIndex];
                bone.updateWorldTransform(parentBone.worldMatrix);
            }
        }
    }
}

// ==========================================
// ANIMATION SYSTEM
// ==========================================

class Animation {
    constructor(name, duration, frames) {
        this.name = name;
        this.duration = duration; // seconds
        this.frames = frames; // Array of bone transforms per frame
        this.looping = true;
    }

    getFrameAtTime(time) {
        if (this.looping) {
            time = time % this.duration;
        }
        
        const frameIndex = Math.floor((time / this.duration) * this.frames.length);
        return this.frames[Math.min(frameIndex, this.frames.length - 1)];
    }
}

class CharacterAnimator {
    constructor(skeleton) {
        this.skeleton = skeleton;
        this.animations = new Map();
        this.currentAnimation = null;
        this.nextAnimation = null;
        this.animationTime = 0;
        this.blendTime = 0;
        this.blendDuration = 0.3; // 300ms blend
        this.isBlending = false;
        
        this.initializeDefaultAnimations();
    }

    initializeDefaultAnimations() {
        // Create basic animations
        this.animations.set('idle', this.createIdleAnimation());
        this.animations.set('walk', this.createWalkAnimation());
        this.animations.set('run', this.createRunAnimation());
        this.animations.set('attack', this.createAttackAnimation());
        this.animations.set('cast', this.createCastAnimation());
        this.animations.set('death', this.createDeathAnimation());
    }

    createIdleAnimation() {
        // Simple breathing animation
        const frames = [];
        const frameCount = 60; // 2 seconds at 30 fps
        
        for (let i = 0; i < frameCount; i++) {
            const t = i / frameCount;
            const breathe = Math.sin(t * Math.PI * 2) * 0.02;
            
            frames.push({
                chest: { x: 0, y: breathe, z: 0 },
                head: { x: 0, y: breathe * 0.5, z: 0 }
            });
        }
        
        return new Animation('idle', 2.0, frames);
    }

    createWalkAnimation() {
        // Walking cycle
        const frames = [];
        const frameCount = 30; // 1 second at 30 fps
        
        for (let i = 0; i < frameCount; i++) {
            const t = i / frameCount;
            const legSwing = Math.sin(t * Math.PI * 2) * 0.3;
            
            frames.push({
                leg_left: { x: 0, y: 0, z: legSwing },
                leg_right: { x: 0, y: 0, z: -legSwing },
                arm_left: { x: 0, y: 0, z: -legSwing * 0.5 },
                arm_right: { x: 0, y: 0, z: legSwing * 0.5 }
            });
        }
        
        return new Animation('walk', 1.0, frames);
    }

    createRunAnimation() {
        // Running cycle (faster walk)
        const frames = [];
        const frameCount = 20; // 0.67 seconds at 30 fps
        
        for (let i = 0; i < frameCount; i++) {
            const t = i / frameCount;
            const legSwing = Math.sin(t * Math.PI * 2) * 0.5;
            
            frames.push({
                leg_left: { x: 0, y: 0, z: legSwing },
                leg_right: { x: 0, y: 0, z: -legSwing },
                arm_left: { x: 0, y: 0, z: -legSwing * 0.7 },
                arm_right: { x: 0, y: 0, z: legSwing * 0.7 }
            });
        }
        
        return new Animation('run', 0.67, frames);
    }

    createAttackAnimation() {
        // Sword swing animation
        const frames = [];
        const frameCount = 24; // 0.8 seconds at 30 fps
        
        for (let i = 0; i < frameCount; i++) {
            const t = i / frameCount;
            let swing = 0;
            
            if (t < 0.3) {
                // Wind up
                swing = -t / 0.3;
            } else if (t < 0.6) {
                // Swing
                swing = ((t - 0.3) / 0.3) * 2 - 1;
            } else {
                // Recovery
                swing = 1 - ((t - 0.6) / 0.4);
            }
            
            frames.push({
                arm_right: { x: 0, y: swing * -0.5, z: swing * 0.8 },
                chest: { x: 0, y: 0, z: swing * 0.2 }
            });
        }
        
        const anim = new Animation('attack', 0.8, frames);
        anim.looping = false;
        return anim;
    }

    createCastAnimation() {
        // Spell casting animation
        const frames = [];
        const frameCount = 30; // 1 second at 30 fps
        
        for (let i = 0; i < frameCount; i++) {
            const t = i / frameCount;
            let raise = 0;
            
            if (t < 0.5) {
                // Raise hands
                raise = t / 0.5;
            } else {
                // Hold
                raise = 1;
            }
            
            frames.push({
                arm_left: { x: 0, y: raise * 0.5, z: raise * 0.3 },
                arm_right: { x: 0, y: raise * 0.5, z: raise * 0.3 }
            });
        }
        
        const anim = new Animation('cast', 1.0, frames);
        anim.looping = false;
        return anim;
    }

    createDeathAnimation() {
        // Fall down animation
        const frames = [];
        const frameCount = 30; // 1 second at 30 fps
        
        for (let i = 0; i < frameCount; i++) {
            const t = i / frameCount;
            const fall = t * t; // Accelerate
            
            frames.push({
                root: { x: 0, y: -fall * 1.5, z: 0 },
                chest: { x: fall * -0.5, y: 0, z: 0 }
            });
        }
        
        const anim = new Animation('death', 1.0, frames);
        anim.looping = false;
        return anim;
    }

    playAnimation(animationName, forceRestart = false) {
        const animation = this.animations.get(animationName);
        if (!animation) {
            console.warn(`Animation "${animationName}" not found`);
            return;
        }

        if (this.currentAnimation === animation && !forceRestart) {
            return; // Already playing
        }

        // Start blending
        this.nextAnimation = animation;
        this.isBlending = true;
        this.blendTime = 0;
        
        console.log(`Playing animation: ${animationName}`);
    }

    update(deltaTime) {
        if (!this.currentAnimation && !this.nextAnimation) {
            this.playAnimation('idle');
            return;
        }

        this.animationTime += deltaTime;

        if (this.isBlending) {
            this.blendTime += deltaTime;
            
            if (this.blendTime >= this.blendDuration) {
                // Blend complete
                this.currentAnimation = this.nextAnimation;
                this.nextAnimation = null;
                this.isBlending = false;
                this.animationTime = 0;
            } else {
                // Blend between animations
                const blendFactor = this.blendTime / this.blendDuration;
                this.blendAnimations(this.currentAnimation, this.nextAnimation, blendFactor);
                return;
            }
        }

        // Apply current animation
        if (this.currentAnimation) {
            const frame = this.currentAnimation.getFrameAtTime(this.animationTime);
            this.applyFrame(frame);
        }

        this.skeleton.updateBoneTransforms();
    }

    blendAnimations(anim1, anim2, factor) {
        if (!anim1 || !anim2) return;

        const frame1 = anim1.getFrameAtTime(this.animationTime);
        const frame2 = anim2.getFrameAtTime(0);

        // Blend transforms
        const blendedFrame = {};
        const allBones = new Set([...Object.keys(frame1), ...Object.keys(frame2)]);
        
        for (let boneName of allBones) {
            const transform1 = frame1[boneName] || { x: 0, y: 0, z: 0 };
            const transform2 = frame2[boneName] || { x: 0, y: 0, z: 0 };
            
            blendedFrame[boneName] = {
                x: this.lerp(transform1.x, transform2.x, factor),
                y: this.lerp(transform1.y, transform2.y, factor),
                z: this.lerp(transform1.z, transform2.z, factor)
            };
        }

        this.applyFrame(blendedFrame);
    }

    applyFrame(frame) {
        for (let boneName in frame) {
            const bone = this.skeleton.getBone(boneName);
            if (bone) {
                const transform = frame[boneName];
                // Add transform to bone's local position (relative animation)
                bone.localPosition.x += transform.x;
                bone.localPosition.y += transform.y;
                bone.localPosition.z += transform.z;
            }
        }
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}

// ==========================================
// EQUIPMENT SYSTEM
// ==========================================

class EquipmentSlot {
    constructor(name, boneName, offset) {
        this.name = name;
        this.boneName = boneName;
        this.offset = offset || { x: 0, y: 0, z: 0 };
        this.equippedItem = null;
        this.itemMesh = null;
    }

    attach(itemModel) {
        this.itemMesh = itemModel;
        this.equippedItem = itemModel.itemId;
    }

    detach() {
        this.itemMesh = null;
        this.equippedItem = null;
    }

    updateTransform(bone) {
        if (!this.itemMesh || !bone) return;

        // Position item at bone location + offset
        this.itemMesh.position = {
            x: bone.worldPosition.x + this.offset.x,
            y: bone.worldPosition.y + this.offset.y,
            z: bone.worldPosition.z + this.offset.z
        };

        this.itemMesh.rotation = bone.worldRotation;
    }
}

class EquipmentManager {
    constructor(skeleton) {
        this.skeleton = skeleton;
        this.slots = new Map();
        this.initializeSlots();
    }

    initializeSlots() {
        // Define equipment attachment points
        this.slots.set('head', new EquipmentSlot('head', 'head', { x: 0, y: 0.1, z: 0 }));
        this.slots.set('chest', new EquipmentSlot('chest', 'chest', { x: 0, y: 0, z: 0 }));
        this.slots.set('legs', new EquipmentSlot('legs', 'root', { x: 0, y: -0.5, z: 0 }));
        this.slots.set('feet', new EquipmentSlot('feet', 'foot_left', { x: 0, y: 0, z: 0 }));
        this.slots.set('weapon_main', new EquipmentSlot('weapon_main', 'hand_right', { x: 0, y: 0, z: 0 }));
        this.slots.set('weapon_off', new EquipmentSlot('weapon_off', 'hand_left', { x: 0, y: 0, z: 0 }));
        this.slots.set('back', new EquipmentSlot('back', 'chest', { x: 0, y: 0, z: -0.1 }));
    }

    equipItem(slotName, itemModel) {
        const slot = this.slots.get(slotName);
        if (!slot) {
            console.warn(`Equipment slot "${slotName}" not found`);
            return false;
        }

        // Unequip current item
        if (slot.equippedItem) {
            this.unequipItem(slotName);
        }

        slot.attach(itemModel);
        console.log(`Equipped ${itemModel.itemId} to ${slotName}`);
        return true;
    }

    unequipItem(slotName) {
        const slot = this.slots.get(slotName);
        if (!slot) return false;

        slot.detach();
        console.log(`Unequipped ${slotName}`);
        return true;
    }

    updateEquipmentTransforms() {
        for (let [name, slot] of this.slots) {
            const bone = this.skeleton.getBone(slot.boneName);
            slot.updateTransform(bone);
        }
    }

    getEquippedItems() {
        const equipped = {};
        for (let [name, slot] of this.slots) {
            equipped[name] = slot.equippedItem;
        }
        return equipped;
    }
}

// ==========================================
// CHARACTER RENDERER (MAIN CLASS)
// ==========================================

class CharacterRenderer {
    constructor(characterData) {
        this.characterData = characterData;
        this.skeleton = new CharacterSkeleton();
        this.animator = new CharacterAnimator(this.skeleton);
        this.equipmentManager = new EquipmentManager(this.skeleton);
        
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = 1.0;
        
        this.meshData = null;
        this.isLoaded = false;
        this.lodLevel = 0; // 0 = high, 1 = medium, 2 = low, 3 = billboard
        
        this.initialize();
    }

    async initialize() {
        // Load character model based on race
        await this.loadCharacterModel();
        
        // Apply appearance customization
        this.applyAppearance();
        
        // Load starting equipment
        await this.loadStartingEquipment();
        
        this.isLoaded = true;
        console.log(`Character "${this.characterData.name}" loaded`);
    }

    async loadCharacterModel() {
        // In a real implementation, this would load VLS files
        // For now, create a placeholder mesh
        
        const race = this.characterData.race;
        console.log(`Loading model for race: ${race}`);
        
        // Placeholder mesh data
        this.meshData = {
            race: race,
            vertices: [], // Would contain VLS vertex data
            normals: [],
            uvs: [],
            indices: []
        };
    }

    applyAppearance() {
        const { hairColor, skinTone, hairStyle, faceType } = this.characterData.appearance;
        
        console.log(`Applying appearance: Hair=${hairColor}, Skin=${skinTone}, Style=${hairStyle}, Face=${faceType}`);
        
        // In a real implementation:
        // - Apply texture for skin tone
        // - Apply hair model and texture
        // - Apply face mesh variant
    }

    async loadStartingEquipment() {
        const equippedItems = this.characterData.equipment;
        
        for (let slot in equippedItems) {
            const itemId = equippedItems[slot];
            if (itemId) {
                // Load item model (VLS)
                const itemModel = await this.loadItemModel(itemId);
                this.equipmentManager.equipItem(slot, itemModel);
            }
        }
    }

    async loadItemModel(itemId) {
        // Placeholder - would load VLS model
        return {
            itemId: itemId,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            mesh: null // Would contain VLS mesh data
        };
    }

    update(deltaTime) {
        if (!this.isLoaded) return;

        // Update animation
        this.animator.update(deltaTime);
        
        // Update equipment positions
        this.equipmentManager.updateEquipmentTransforms();
    }

    playAnimation(animationName) {
        this.animator.playAnimation(animationName);
    }

    setPosition(x, y, z) {
        this.position = { x, y, z };
    }

    setRotation(x, y, z) {
        this.rotation = { x, y, z };
    }

    equipItem(slotName, itemId) {
        // Load and equip item
        this.loadItemModel(itemId).then(itemModel => {
            this.equipmentManager.equipItem(slotName, itemModel);
        });
    }

    unequipItem(slotName) {
        this.equipmentManager.unequipItem(slotName);
    }

    setLODLevel(level) {
        // 0 = high (0-20m), 1 = medium (20-50m), 2 = low (50-100m), 3 = billboard (100m+)
        this.lodLevel = level;
    }

    calculateLODLevel(distanceToCamera) {
        if (distanceToCamera < 20) return 0;
        if (distanceToCamera < 50) return 1;
        if (distanceToCamera < 100) return 2;
        return 3;
    }

    // Multiplayer sync methods
    getState() {
        return {
            characterId: this.characterData.id,
            name: this.characterData.name,
            race: this.characterData.race,
            class: this.characterData.class,
            appearance: this.characterData.appearance,
            position: this.position,
            rotation: this.rotation,
            currentAnimation: this.animator.currentAnimation?.name || 'idle',
            equipment: this.equipmentManager.getEquippedItems(),
            level: this.characterData.level
        };
    }

    updateFromState(state) {
        this.position = state.position;
        this.rotation = state.rotation;
        
        if (state.currentAnimation && state.currentAnimation !== this.animator.currentAnimation?.name) {
            this.playAnimation(state.currentAnimation);
        }
        
        // Update equipment if changed
        const currentEquipment = this.equipmentManager.getEquippedItems();
        for (let slot in state.equipment) {
            if (currentEquipment[slot] !== state.equipment[slot]) {
                if (state.equipment[slot]) {
                    this.equipItem(slot, state.equipment[slot]);
                } else {
                    this.unequipItem(slot);
                }
            }
        }
    }
}

// ==========================================
// CHARACTER MANAGER (MULTIPLAYER)
// ==========================================

class CharacterManager {
    constructor() {
        this.characters = new Map();
        this.localCharacter = null;
    }

    createLocalCharacter(characterData) {
        const renderer = new CharacterRenderer(characterData);
        this.localCharacter = renderer;
        this.characters.set(characterData.id, renderer);
        return renderer;
    }

    createRemoteCharacter(characterData) {
        const renderer = new CharacterRenderer(characterData);
        this.characters.set(characterData.id, renderer);
        return renderer;
    }

    getCharacter(characterId) {
        return this.characters.get(characterId);
    }

    removeCharacter(characterId) {
        this.characters.delete(characterId);
    }

    updateAll(deltaTime) {
        for (let [id, character] of this.characters) {
            character.update(deltaTime);
        }
    }

    syncCharacterState(characterId, state) {
        const character = this.characters.get(characterId);
        if (character) {
            character.updateFromState(state);
        }
    }

    getAllCharacterStates() {
        const states = [];
        for (let [id, character] of this.characters) {
            states.push(character.getState());
        }
        return states;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Bone,
        CharacterSkeleton,
        Animation,
        CharacterAnimator,
        EquipmentSlot,
        EquipmentManager,
        CharacterRenderer,
        CharacterManager
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.CharacterRenderer = CharacterRenderer;
    window.CharacterManager = CharacterManager;
}

console.log('✓ Character Renderer loaded');
