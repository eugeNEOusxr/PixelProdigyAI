/**
 * VLS Tree Generator
 * Generates procedural trees using Vertex Language System
 * Eugene Ousos - PixelProdigy AI
 */

class VLSTreeGenerator {
    constructor(vlsParser) {
        this.parser = vlsParser;
        this.treeCache = new Map();
        
        // VLS Tree Definitions
        this.definitions = {
            // Basic stylized tree
            simple: '+E^12-DA+Q^3-S-AAA-(+AC^4-DC)^4-CCB-(+Q^2-EE^4-S)^3',
            
            // Detailed oak-style tree
            oak: this.buildOakTree(),
            
            // Pine/conifer tree
            pine: this.buildPineTree(),
            
            // Willow tree with drooping branches
            willow: this.buildWillowTree(),
            
            // Dead/spooky tree
            dead: this.buildDeadTree()
        };
    }
    
    /**
     * Build detailed oak tree definition
     */
    buildOakTree() {
        const stump = '+E^16-DA^4-Q^2-CB-S^2';
        const bark = '+EC^3-T^2-BE^2';
        const base = stump + '-BBC-' + bark;
        
        const mainBranches = '(+AC^6-DC-O)^4+(+AD^6-DC-P)^4+(+AE^5-DC)^3';
        const twigs = '(+AA^3-N)^8+(+AB^3-N)^8';
        const branchAssembly = mainBranches + '-AAA-' + twigs + '-CCD';
        
        const leafClusters = '(+Q^3-EE^6-S^3)^5';
        const leafSurface = '(+EC^4-CC^3-T)^6';
        const leafLining = '(+BE^3-V^2)^4';
        const canopy = leafClusters + '-CCB-' + leafSurface + '-EB-' + leafLining;
        
        return base + '-AAA-' + branchAssembly + '-BBB-' + canopy;
    }
    
    /**
     * Build pine tree definition
     */
    buildPineTree() {
        const trunk = '+E^20-DA^2-Q-CB-S'; // Taller, thinner trunk
        const branches = '(+AE^3-DC-O-N)^8'; // Upward spiraling branches, smaller
        const needles = '(+Q^2-V^3-T)^6'; // Sharp needle clusters
        
        return trunk + '-AAA-' + branches + '-CCB-' + needles;
    }
    
    /**
     * Build willow tree definition
     */
    buildWillowTree() {
        const trunk = '+E^14-DA^3-Q^2-S^2';
        const droopBranches = '(+AC^8-F^4-DC)^6+(+AD^8-F^4-DC)^6'; // Branches that go down
        const leaves = '(+EC^6-CC^4-S^2)^5'; // Long flowing leaves
        
        return trunk + '-AAA-' + droopBranches + '-CCB-' + leaves;
    }
    
    /**
     * Build dead/spooky tree definition
     */
    buildDeadTree() {
        const trunk = '+E^14-DA^5-CB^2'; // Visible rings, creased bark, no smoothing
        const branches = '(+AC^5-DC-V)^3+(+AD^4-DC-V)^3'; // Fewer, split branches
        const twigs = '(+AA^2-N-V)^4'; // Small broken twigs
        
        return trunk + '-AAA-' + branches + '-CCD-' + twigs;
    }
    
    /**
     * Generate a tree mesh using 3D triangle matrices
     * @param {string} type - Tree type: 'simple', 'oak', 'pine', 'willow', 'dead'
     * @param {Object} options - Customization options
     * @returns {THREE.Group}
     */
    generateTree(type = 'oak', options = {}) {
        const {
            scale = 1.0,
            color = 0x8B4513, // Brown
            leafColor = 0x228B22, // Forest green
            position = { x: 0, y: 0, z: 0 },
            rotation = 0,
            lodLevel = 'high' // 'high', 'medium', 'low'
        } = options;
        
        // Check if VLSTriangleMatrix is available
        if (typeof VLSTriangleMatrix === 'undefined') {
            console.warn('VLSTriangleMatrix not available, using fallback');
            return this.createFallbackTree(position, scale, color);
        }
        
        // Get VLS definition
        let vlsCode = this.definitions[type] || this.definitions.oak;
        
        // Apply LOD optimization
        vlsCode = this.applyLOD(vlsCode, lodLevel);
        
        // Check cache
        const cacheKey = `${type}_${lodLevel}_${scale}`;
        if (this.treeCache.has(cacheKey)) {
            const cached = this.treeCache.get(cacheKey);
            const tree = cached.clone();
            tree.position.set(position.x, position.y, position.z);
            tree.rotation.y = rotation;
            return tree;
        }
        
        try {
            // Parse VLS into vertex path
            const meshData = this.parser.parse(vlsCode);
            
            // Convert flat array to path array [[x,y,z], [x,y,z], ...]
            const vertexPath = [];
            for (let i = 0; i < meshData.vertices.length; i += 3) {
                vertexPath.push([
                    meshData.vertices[i],
                    meshData.vertices[i + 1],
                    meshData.vertices[i + 2]
                ]);
            }
            
            if (vertexPath.length < 2) {
                throw new Error('Not enough vertices for mesh generation');
            }
            
            // Generate 3D triangulated geometry from path
            const geometryData = VLSTriangleMatrix.generateMeshFromPath(vertexPath, {
                radius: 0.15 * scale, // Trunk/branch thickness
                segments: 8,
                closed: false,
                extrude: true
            });
            
            // Create THREE.js geometry
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(geometryData.vertices, 3));
            geometry.setIndex(new THREE.BufferAttribute(geometryData.indices, 1));
            geometry.computeVertexNormals();
            
            // Create material
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.9,
                metalness: 0.1,
                flatShading: false
            });
            
            // Create group for tree parts
            const treeGroup = new THREE.Group();
            
            // Main trunk/branches mesh
            const trunk = new THREE.Mesh(geometry, material);
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            treeGroup.add(trunk);
            
            // Add canopy/leaves for living trees
            if (type !== 'dead') {
                const canopyGeometry = this.createCanopy(type, vertexPath, scale);
                const canopyMaterial = new THREE.MeshStandardMaterial({
                    color: leafColor,
                    roughness: 0.7,
                    metalness: 0.0,
                    flatShading: true
                });
                const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
                canopy.castShadow = true;
                treeGroup.add(canopy);
            }
            
            // Position and scale
            treeGroup.position.set(position.x, position.y, position.z);
            treeGroup.rotation.y = rotation;
            treeGroup.scale.setScalar(scale);
            
            // Cache the base tree
            this.treeCache.set(cacheKey, treeGroup.clone());
            
            console.log(`✓ Generated ${type} tree with ${geometryData.count} vertices, ${geometryData.indices.length / 3} triangles`);
            
            return treeGroup;
            
        } catch (error) {
            console.error(`Failed to generate tree type "${type}":`, error);
            return this.createFallbackTree(position, scale, color);
        }
    }
    
    /**
     * Create canopy geometry based on tree type
     */
    createCanopy(type, vertexPath, scale) {
        // Find top of tree (highest Y value)
        let topY = -Infinity;
        let topPos = [0, 0, 0];
        for (const vertex of vertexPath) {
            if (vertex[1] > topY) {
                topY = vertex[1];
                topPos = vertex;
            }
        }
        
        // Create canopy based on type
        let geometry;
        switch (type) {
            case 'oak':
                // Wide, rounded canopy
                geometry = new THREE.DodecahedronGeometry(1.2 * scale, 1);
                geometry.translate(topPos[0], topPos[1] + 0.5, topPos[2]);
                geometry.scale(1, 0.8, 1); // Flatten slightly
                break;
                
            case 'pine':
                // Conical canopy
                geometry = new THREE.ConeGeometry(0.8 * scale, 2 * scale, 8);
                geometry.translate(topPos[0], topPos[1] + 1, topPos[2]);
                break;
                
            case 'willow':
                // Drooping, irregular canopy
                geometry = new THREE.IcosahedronGeometry(1.0 * scale, 1);
                geometry.translate(topPos[0], topPos[1], topPos[2]);
                geometry.scale(1, 1.3, 1); // Stretch vertically
                break;
                
            default:
                geometry = new THREE.SphereGeometry(1.0 * scale, 8, 8);
                geometry.translate(topPos[0], topPos[1] + 0.5, topPos[2]);
        }
        
        return geometry;
    }
    
    /**
     * Apply LOD optimization to VLS code
     */
    applyLOD(vlsCode, lodLevel) {
        if (lodLevel === 'high') {
            return vlsCode;
        } else if (lodLevel === 'medium') {
            // Reduce node counts by half
            return vlsCode.replace(/\^(\d+)/g, (match, num) => {
                return '^' + Math.max(2, Math.floor(parseInt(num) / 2));
            });
        } else { // low
            // Reduce node counts to minimum
            return vlsCode.replace(/\^(\d+)/g, (match, num) => {
                return '^' + Math.max(2, Math.floor(parseInt(num) / 4));
            });
        }
    }
    
    /**
     * Create a simple fallback tree
     */
    createFallbackTree(position, scale, color) {
        const group = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: color });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Canopy
        const canopyGeometry = new THREE.SphereGeometry(2, 8, 8);
        const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 4.5;
        canopy.scale.set(1, 1.2, 1);
        canopy.castShadow = true;
        group.add(canopy);
        
        group.scale.setScalar(scale);
        group.position.set(position.x, position.y, position.z);
        
        console.log('✓ Created fallback tree');
        return group;
    }
    
    /**
     * Populate an area with random trees
     */
    populateForest(scene, options = {}) {
        const {
            count = 20,
            area = { xMin: -50, xMax: 50, zMin: -50, zMax: 50 },
            types = ['oak', 'pine', 'willow'],
            minScale = 0.8,
            maxScale = 1.5,
            lodDistance = { high: 30, medium: 60, low: 100 }
        } = options;
        
        const trees = [];
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (area.xMax - area.xMin) + area.xMin;
            const z = Math.random() * (area.zMax - area.zMin) + area.zMin;
            const scale = Math.random() * (maxScale - minScale) + minScale;
            const rotation = Math.random() * Math.PI * 2;
            const type = types[Math.floor(Math.random() * types.length)];
            
            const tree = this.generateTree(type, {
                position: { x, y: 0, z },
                scale,
                rotation,
                lodLevel: 'high' // Will be adjusted based on distance
            });
            
            tree.userData.treeType = type;
            tree.userData.lodDistance = lodDistance;
            
            scene.add(tree);
            trees.push(tree);
        }
        
        console.log(`✓ Populated forest with ${count} trees`);
        return trees;
    }
    
    /**
     * Update LOD based on camera distance
     */
    updateLOD(trees, cameraPosition) {
        trees.forEach(tree => {
            const distance = tree.position.distanceTo(cameraPosition);
            const lodDist = tree.userData.lodDistance || { high: 30, medium: 60, low: 100 };
            
            let targetLOD = 'low';
            if (distance < lodDist.high) {
                targetLOD = 'high';
            } else if (distance < lodDist.medium) {
                targetLOD = 'medium';
            }
            
            // Only regenerate if LOD changed
            if (tree.userData.currentLOD !== targetLOD) {
                const newTree = this.generateTree(tree.userData.treeType, {
                    position: tree.position,
                    scale: tree.scale.x,
                    rotation: tree.rotation.y,
                    lodLevel: targetLOD
                });
                
                // Replace in scene
                if (tree.parent) {
                    tree.parent.add(newTree);
                    tree.parent.remove(tree);
                }
                
                tree.userData.currentLOD = targetLOD;
            }
        });
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.treeCache.clear();
        console.log('✓ Tree cache cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VLSTreeGenerator };
}

console.log('✓ VLS Tree Generator loaded');
