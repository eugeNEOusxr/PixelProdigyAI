/**
 * VLS Character Model Loader
 * Loads character models in VLS format and prepares them for skeletal animation
 */

class VLSCharacterLoader {
    constructor() {
        this.modelCache = new Map();
        this.textureCache = new Map();
        this.loadedModels = {};
    }

    /**
     * Load a character base model (race + gender)
     */
    async loadCharacterModel(race, gender = 'male') {
        const modelKey = `${race}_${gender}`;
        
        if (this.modelCache.has(modelKey)) {
            return this.modelCache.get(modelKey);
        }

        try {
            // Load VLS model file
            const modelPath = `/generated_objects/characters/${modelKey}.vls`;
            const response = await fetch(modelPath);
            
            if (!response.ok) {
                console.warn(`Character model not found: ${modelPath}, using fallback`);
                return this.createFallbackModel();
            }

            const vlsData = await response.arrayBuffer();
            const model = this.parseVLSModel(vlsData);
            
            // Cache the model
            this.modelCache.set(modelKey, model);
            this.loadedModels[modelKey] = model;
            
            console.log(`✓ Loaded character model: ${modelKey}`);
            return model;
            
        } catch (error) {
            console.error(`Error loading character model ${modelKey}:`, error);
            return this.createFallbackModel();
        }
    }

    /**
     * Parse VLS binary format into model data
     */
    parseVLSModel(buffer) {
        const view = new DataView(buffer);
        let offset = 0;

        // Read VLS header
        const magic = String.fromCharCode(
            view.getUint8(offset++),
            view.getUint8(offset++),
            view.getUint8(offset++)
        );
        
        if (magic !== 'VLS') {
            throw new Error('Invalid VLS file format');
        }

        const version = view.getUint8(offset++);
        const vertexCount = view.getUint32(offset, true); offset += 4;
        const faceCount = view.getUint32(offset, true); offset += 4;

        // Read vertex data
        const vertices = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);
        const uvs = new Float32Array(vertexCount * 2);
        const boneIndices = new Uint8Array(vertexCount * 4);
        const boneWeights = new Float32Array(vertexCount * 4);

        for (let i = 0; i < vertexCount; i++) {
            // Position
            vertices[i * 3] = view.getFloat32(offset, true); offset += 4;
            vertices[i * 3 + 1] = view.getFloat32(offset, true); offset += 4;
            vertices[i * 3 + 2] = view.getFloat32(offset, true); offset += 4;

            // Normal
            normals[i * 3] = view.getFloat32(offset, true); offset += 4;
            normals[i * 3 + 1] = view.getFloat32(offset, true); offset += 4;
            normals[i * 3 + 2] = view.getFloat32(offset, true); offset += 4;

            // UV
            uvs[i * 2] = view.getFloat32(offset, true); offset += 4;
            uvs[i * 2 + 1] = view.getFloat32(offset, true); offset += 4;

            // Bone indices (4 per vertex)
            boneIndices[i * 4] = view.getUint8(offset++);
            boneIndices[i * 4 + 1] = view.getUint8(offset++);
            boneIndices[i * 4 + 2] = view.getUint8(offset++);
            boneIndices[i * 4 + 3] = view.getUint8(offset++);

            // Bone weights (4 per vertex, normalized)
            boneWeights[i * 4] = view.getFloat32(offset, true); offset += 4;
            boneWeights[i * 4 + 1] = view.getFloat32(offset, true); offset += 4;
            boneWeights[i * 4 + 2] = view.getFloat32(offset, true); offset += 4;
            boneWeights[i * 4 + 3] = view.getFloat32(offset, true); offset += 4;
        }

        // Read face indices
        const indices = new Uint32Array(faceCount * 3);
        for (let i = 0; i < faceCount * 3; i++) {
            indices[i] = view.getUint32(offset, true);
            offset += 4;
        }

        return {
            vertices,
            normals,
            uvs,
            indices,
            boneIndices,
            boneWeights,
            vertexCount,
            faceCount
        };
    }

    /**
     * Create a simple fallback model (cube character)
     */
    createFallbackModel() {
        // Simple humanoid shape made of boxes
        const vertices = new Float32Array([
            // Head (cube)
            -0.2, 1.6, -0.2,  0.2, 1.6, -0.2,  0.2, 1.9, -0.2,  -0.2, 1.9, -0.2,
            -0.2, 1.6, 0.2,   0.2, 1.6, 0.2,   0.2, 1.9, 0.2,   -0.2, 1.9, 0.2,
            
            // Torso
            -0.3, 0.8, -0.15,  0.3, 0.8, -0.15,  0.3, 1.6, -0.15,  -0.3, 1.6, -0.15,
            -0.3, 0.8, 0.15,   0.3, 0.8, 0.15,   0.3, 1.6, 0.15,   -0.3, 1.6, 0.15,
            
            // Arms (left)
            -0.5, 0.8, -0.1,  -0.3, 0.8, -0.1,  -0.3, 1.4, -0.1,  -0.5, 1.4, -0.1,
            -0.5, 0.8, 0.1,   -0.3, 0.8, 0.1,   -0.3, 1.4, 0.1,   -0.5, 1.4, 0.1,
            
            // Arms (right)
            0.3, 0.8, -0.1,  0.5, 0.8, -0.1,  0.5, 1.4, -0.1,  0.3, 1.4, -0.1,
            0.3, 0.8, 0.1,   0.5, 0.8, 0.1,   0.5, 1.4, 0.1,   0.3, 1.4, 0.1,
            
            // Legs (left)
            -0.25, 0, -0.1,  -0.05, 0, -0.1,  -0.05, 0.8, -0.1,  -0.25, 0.8, -0.1,
            -0.25, 0, 0.1,   -0.05, 0, 0.1,   -0.05, 0.8, 0.1,   -0.25, 0.8, 0.1,
            
            // Legs (right)
            0.05, 0, -0.1,  0.25, 0, -0.1,  0.25, 0.8, -0.1,  0.05, 0.8, -0.1,
            0.05, 0, 0.1,   0.25, 0, 0.1,   0.25, 0.8, 0.1,   0.05, 0.8, 0.1
        ]);

        // Generate normals (simplified)
        const normals = new Float32Array(vertices.length);
        for (let i = 0; i < normals.length; i += 3) {
            normals[i] = 0;
            normals[i + 1] = 1;
            normals[i + 2] = 0;
        }

        // Generate UVs
        const uvs = new Float32Array(vertices.length / 3 * 2);
        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i] = (i % 8) / 8;
            uvs[i + 1] = Math.floor(i / 8) / 8;
        }

        // Generate indices (6 faces per box part, 6 parts)
        const indices = [];
        for (let part = 0; part < 6; part++) {
            const offset = part * 8;
            // Front, back, left, right, top, bottom faces
            indices.push(
                offset+0, offset+1, offset+2, offset+0, offset+2, offset+3,
                offset+4, offset+5, offset+6, offset+4, offset+6, offset+7,
                offset+0, offset+4, offset+7, offset+0, offset+7, offset+3,
                offset+1, offset+5, offset+6, offset+1, offset+6, offset+2,
                offset+3, offset+2, offset+6, offset+3, offset+6, offset+7,
                offset+0, offset+1, offset+5, offset+0, offset+5, offset+4
            );
        }

        // Assign bone weights (simplified - each part to one bone)
        const vertexCount = vertices.length / 3;
        const boneIndices = new Uint8Array(vertexCount * 4);
        const boneWeights = new Float32Array(vertexCount * 4);
        
        const boneMappings = [
            4,  // Head -> head bone
            2,  // Torso -> chest bone
            7,  // Left arm -> arm_left bone
            8,  // Right arm -> arm_right bone
            11, // Left leg -> leg_left bone
            12  // Right leg -> leg_right bone
        ];

        for (let i = 0; i < vertexCount; i++) {
            const part = Math.floor(i / 8);
            const boneIndex = boneMappings[part] || 0;
            
            boneIndices[i * 4] = boneIndex;
            boneIndices[i * 4 + 1] = 0;
            boneIndices[i * 4 + 2] = 0;
            boneIndices[i * 4 + 3] = 0;
            
            boneWeights[i * 4] = 1.0;
            boneWeights[i * 4 + 1] = 0;
            boneWeights[i * 4 + 2] = 0;
            boneWeights[i * 4 + 3] = 0;
        }

        console.log('✓ Created fallback character model');

        return {
            vertices,
            normals,
            uvs,
            indices: new Uint32Array(indices),
            boneIndices,
            boneWeights,
            vertexCount,
            faceCount: indices.length / 3
        };
    }

    /**
     * Load character texture
     */
    async loadTexture(textureName) {
        if (this.textureCache.has(textureName)) {
            return this.textureCache.get(textureName);
        }

        try {
            const texturePath = `/generated_objects/characters/textures/${textureName}.png`;
            const image = await this.loadImage(texturePath);
            
            this.textureCache.set(textureName, image);
            console.log(`✓ Loaded texture: ${textureName}`);
            return image;
            
        } catch (error) {
            console.warn(`Failed to load texture ${textureName}, using placeholder`);
            return this.createPlaceholderTexture();
        }
    }

    /**
     * Load image helper
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Create a placeholder texture
     */
    createPlaceholderTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Checkerboard pattern
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#A0826D';
        for (let y = 0; y < 256; y += 32) {
            for (let x = 0; x < 256; x += 32) {
                if ((x + y) % 64 === 0) {
                    ctx.fillRect(x, y, 32, 32);
                }
            }
        }
        
        return canvas;
    }

    /**
     * Load equipment model piece
     */
    async loadEquipmentModel(itemId) {
        const modelKey = `equipment_${itemId}`;
        
        if (this.modelCache.has(modelKey)) {
            return this.modelCache.get(modelKey);
        }

        try {
            const modelPath = `/generated_objects/equipment/${itemId}.vls`;
            const response = await fetch(modelPath);
            
            if (!response.ok) {
                console.warn(`Equipment model not found: ${itemId}`);
                return null;
            }

            const vlsData = await response.arrayBuffer();
            const model = this.parseVLSModel(vlsData);
            
            this.modelCache.set(modelKey, model);
            console.log(`✓ Loaded equipment model: ${itemId}`);
            return model;
            
        } catch (error) {
            console.warn(`Error loading equipment model ${itemId}:`, error);
            return null;
        }
    }

    /**
     * Apply appearance customization to model
     */
    applyAppearanceToModel(model, appearance) {
        // Clone model data
        const customModel = {
            vertices: new Float32Array(model.vertices),
            normals: new Float32Array(model.normals),
            uvs: new Float32Array(model.uvs),
            indices: new Uint32Array(model.indices),
            boneIndices: new Uint8Array(model.boneIndices),
            boneWeights: new Float32Array(model.boneWeights),
            vertexCount: model.vertexCount,
            faceCount: model.faceCount
        };

        // Apply body scale modifications based on race
        if (appearance.bodyScale) {
            const scaleFactors = appearance.bodyScale;
            for (let i = 0; i < customModel.vertices.length; i += 3) {
                customModel.vertices[i] *= scaleFactors.x || 1;
                customModel.vertices[i + 1] *= scaleFactors.y || 1;
                customModel.vertices[i + 2] *= scaleFactors.z || 1;
            }
        }

        return customModel;
    }

    /**
     * Get all loaded models
     */
    getLoadedModels() {
        return this.loadedModels;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.modelCache.clear();
        this.textureCache.clear();
        this.loadedModels = {};
        console.log('✓ VLS Character Loader cache cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VLSCharacterLoader };
}

console.log('✓ VLS Character Loader loaded');
