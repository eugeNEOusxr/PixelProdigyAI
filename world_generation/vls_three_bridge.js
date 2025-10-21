/**
 * VLS to THREE.js Bridge
 * Converts VLS mesh data to THREE.js geometry
 * 
 * Eugene Ousos - PixelProdigy AI
 */

class VLSThreeBridge {
    constructor(parser) {
        this.parser = parser;
    }
    
    /**
     * Convert VLS code string directly to THREE.js mesh
     * @param {string} vlsCode - VLS code string
     * @param {object} options - Material options
     * @returns {THREE.Mesh} - THREE.js mesh
     */
    createMesh(vlsCode, options = {}) {
        if (typeof THREE === 'undefined') {
            console.error('THREE.js not available!');
            return null;
        }
        
        // Parse VLS code
        const meshData = this.parser.parse(vlsCode);
        
        if (!meshData || !meshData.vertices || meshData.vertices.length === 0) {
            console.warn('No vertices generated from VLS code:', vlsCode);
            return this.createFallbackMesh(options);
        }
        
        // Create THREE.js geometry
        const geometry = new THREE.BufferGeometry();
        
        // Convert vertices array to Float32Array
        const vertices = new Float32Array(meshData.vertices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        // Add indices if available
        if (meshData.indices && meshData.indices.length > 0) {
            geometry.setIndex(meshData.indices);
        }
        
        // Compute normals for lighting
        geometry.computeVertexNormals();
        
        // Create material from VLS materials or options
        const material = this.createMaterial(meshData.materials, options);
        
        // Create and return mesh
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
    
    /**
     * Create THREE.js material from VLS material data
     */
    createMaterial(vlsMaterials = {}, options = {}) {
        const matParams = {
            color: options.color || vlsMaterials.color || 0x8B4513,
            metalness: vlsMaterials.metallic || 0.2,
            roughness: vlsMaterials.roughness || 0.8,
            side: THREE.DoubleSide
        };
        
        if (vlsMaterials.emissive) {
            matParams.emissive = new THREE.Color(vlsMaterials.color || 0x8B4513);
            matParams.emissiveIntensity = vlsMaterials.emissive;
        }
        
        if (vlsMaterials.opacity !== undefined && vlsMaterials.opacity < 1) {
            matParams.transparent = true;
            matParams.opacity = vlsMaterials.opacity;
        }
        
        return new THREE.MeshStandardMaterial(matParams);
    }
    
    /**
     * Create fallback mesh when VLS parsing fails
     */
    createFallbackMesh(options = {}) {
        console.warn('Creating fallback mesh');
        const geometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const material = new THREE.MeshStandardMaterial({ 
            color: options.color || 0x8B4513 
        });
        return new THREE.Mesh(geometry, material);
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.VLSThreeBridge = VLSThreeBridge;
}
