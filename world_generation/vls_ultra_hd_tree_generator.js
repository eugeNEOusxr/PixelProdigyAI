/**
 * VLS Ultra HD Tree Generator
 * Maximum vertex density procedural trees with advanced vertex mapping
 * Eugene Ousos - PixelProdigy AI
 */

class VLSUltraHDTreeGenerator {
    
    constructor(vlsParser) {
        this.parser = vlsParser;
        this.vertexMapper = new VLSAdvancedVertexMapper();
    }
    
    /**
     * Generate ultra-detailed tree with maximum vertices
     * @param {string} type - Tree type
     * @param {Object} options - Configuration
     * @returns {THREE.Group}
     */
    generateUltraHDTree(type = 'oak', options = {}) {
        const {
            position = { x: 0, y: 0, z: 0 },
            scale = 1.0,
            rotation = 0,
            detailLevel = 'ultra', // 'high', 'ultra', 'extreme'
            color = 0x8B4513,
            leafColor = 0x228B22
        } = options;
        
        // Get detail settings
        const detailSettings = this.getDetailSettings(detailLevel);
        
        // Parse VLS code to get path
        const vlsCode = this.getVLSCode(type);
        const meshData = this.parser.parse(vlsCode);
        
        // Convert to vertex path
        const vertexPath = [];
        for (let i = 0; i < meshData.vertices.length; i += 3) {
            vertexPath.push([
                meshData.vertices[i],
                meshData.vertices[i + 1],
                meshData.vertices[i + 2]
            ]);
        }
        
        if (vertexPath.length < 2) {
            console.warn('Insufficient vertices in path');
            return this.createFallback(position, scale, color);
        }
        
        // Generate ultra-detailed geometry
        const geometryData = this.vertexMapper.generateMaxVertexMesh(vertexPath, {
            radialSegments: detailSettings.radialSegments,
            heightSegments: detailSettings.heightSegments,
            radius: 0.15 * scale,
            subdivisionLevel: detailSettings.subdivisionLevel,
            createBranches: type !== 'dead',
            branchDensity: detailSettings.branchDensity,
            createLeaves: type !== 'dead',
            leafDensity: detailSettings.leafDensity,
            vertexNoise: 0.02
        });
        
        // Create THREE.js geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(geometryData.vertices, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(geometryData.normals, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(geometryData.uvs, 2));
        geometry.setIndex(new THREE.BufferAttribute(geometryData.indices, 1));
        
        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: false,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const treeMesh = new THREE.Mesh(geometry, material);
        treeMesh.castShadow = true;
        treeMesh.receiveShadow = true;
        
        // Create group
        const treeGroup = new THREE.Group();
        treeGroup.add(treeMesh);
        
        // Add canopy for living trees
        if (type !== 'dead') {
            const canopy = this.createUltraHDCanopy(type, vertexPath, scale, leafColor, detailSettings);
            treeGroup.add(canopy);
        }
        
        // Position and scale
        treeGroup.position.set(position.x, position.y, position.z);
        treeGroup.rotation.y = rotation;
        treeGroup.scale.setScalar(scale);
        
        // Add metadata
        treeGroup.userData = {
            type,
            detailLevel,
            vertexCount: geometryData.metadata.totalVertices,
            triangleCount: geometryData.metadata.totalTriangles,
            vertexReuse: geometryData.metadata.vertexReuse
        };
        
        console.log(`🌳 Ultra HD ${type} tree: ${geometryData.metadata.totalVertices} verts, ${geometryData.metadata.totalTriangles} tris, ${geometryData.metadata.vertexReuse} reuse`);
        
        return treeGroup;
    }
    
    /**
     * Get detail settings based on level
     */
    getDetailSettings(level) {
        const settings = {
            high: {
                radialSegments: 12,
                heightSegments: 3,
                subdivisionLevel: 1,
                branchDensity: 0.2,
                leafDensity: 0.15
            },
            ultra: {
                radialSegments: 20,
                heightSegments: 5,
                subdivisionLevel: 2,
                branchDensity: 0.35,
                leafDensity: 0.25
            },
            extreme: {
                radialSegments: 32,
                heightSegments: 8,
                subdivisionLevel: 3,
                branchDensity: 0.5,
                leafDensity: 0.4
            }
        };
        
        return settings[level] || settings.ultra;
    }
    
    /**
     * Create ultra-detailed canopy
     */
    createUltraHDCanopy(type, vertexPath, scale, color, detailSettings) {
        // Find top of tree
        let topY = -Infinity;
        let topPos = [0, 0, 0];
        for (const vertex of vertexPath) {
            if (vertex[1] > topY) {
                topY = vertex[1];
                topPos = vertex;
            }
        }
        
        let geometry;
        const detail = Math.min(3, detailSettings.subdivisionLevel);
        
        switch (type) {
            case 'oak':
                geometry = new THREE.DodecahedronGeometry(1.2 * scale, detail);
                geometry.translate(topPos[0], topPos[1] + 0.5, topPos[2]);
                geometry.scale(1, 0.8, 1);
                break;
                
            case 'pine':
                geometry = new THREE.ConeGeometry(0.8 * scale, 2 * scale, 16, detail);
                geometry.translate(topPos[0], topPos[1] + 1, topPos[2]);
                break;
                
            case 'willow':
                geometry = new THREE.IcosahedronGeometry(1.0 * scale, detail);
                geometry.translate(topPos[0], topPos[1], topPos[2]);
                geometry.scale(1, 1.3, 1);
                break;
                
            default:
                geometry = new THREE.SphereGeometry(1.0 * scale, 16, 16);
                geometry.translate(topPos[0], topPos[1] + 0.5, topPos[2]);
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.0,
            flatShading: true
        });
        
        const canopy = new THREE.Mesh(geometry, material);
        canopy.castShadow = true;
        return canopy;
    }
    
    /**
     * Get VLS code for tree type
     */
    getVLSCode(type) {
        const codes = {
            oak: '+E^16-DA^4-Q^2-CB-S^2-EC^3-T^2-BE^2',
            pine: '+E^20-DA^2-Q-CB-S-AE^3-DC-O-N',
            willow: '+E^14-DA^3-Q^2-S^2-AC^8-F^4-DC',
            dead: '+E^14-DA^5-CB^2-AC^5-DC-V',
            simple: '+E^12-DA-Q-S'
        };
        
        return codes[type] || codes.oak;
    }
    
    /**
     * Create fallback tree
     */
    createFallback(position, scale, color) {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 3, 8),
            new THREE.MeshStandardMaterial({ color })
        );
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        group.add(trunk);
        group.position.set(position.x, position.y, position.z);
        group.scale.setScalar(scale);
        return group;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.VLSUltraHDTreeGenerator = VLSUltraHDTreeGenerator;
}
