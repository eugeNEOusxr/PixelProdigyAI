/**
 * Simple Procedural Tree Generator
 * Creates visually distinct trees using THREE.js primitives
 * Eugene Ousos - PixelProdigy AI
 */

class SimpleTreeGenerator {
    
    /**
     * Generate a tree
     * @param {string} type - 'oak', 'pine', 'willow', 'dead'
     * @param {object} options - position, scale, etc
     * @returns {THREE.Group}
     */
    static generateTree(type = 'oak', options = {}) {
        const {
            position = { x: 0, y: 0, z: 0 },
            scale = 1.0,
            rotation = 0
        } = options;
        
        let treeGroup;
        
        switch(type) {
            case 'oak':
                treeGroup = this.createOakTree();
                break;
            case 'pine':
                treeGroup = this.createPineTree();
                break;
            case 'willow':
                treeGroup = this.createWillowTree();
                break;
            case 'dead':
                treeGroup = this.createDeadTree();
                break;
            default:
                treeGroup = this.createOakTree();
        }
        
        treeGroup.position.set(position.x, position.y, position.z);
        treeGroup.scale.setScalar(scale);
        treeGroup.rotation.y = rotation;
        
        return treeGroup;
    }
    
    /**
     * Create oak tree - wide canopy, thick trunk
     */
    static createOakTree() {
        const group = new THREE.Group();
        
        // Thick trunk with slight taper
        const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 3, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Wide, rounded canopy
        const canopyGeo = new THREE.DodecahedronGeometry(1.8, 1);
        const canopyMat = new THREE.MeshStandardMaterial({ 
            color: 0x228B22,
            roughness: 0.8,
            flatShading: true
        });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.y = 3.5;
        canopy.scale.set(1, 0.8, 1); // Flatten slightly
        canopy.castShadow = true;
        group.add(canopy);
        
        // Add some branch detail
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const branchGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 6);
            const branch = new THREE.Mesh(branchGeo, trunkMat);
            branch.position.set(
                Math.cos(angle) * 0.4,
                2.5,
                Math.sin(angle) * 0.4
            );
            branch.rotation.z = Math.PI / 6;
            branch.rotation.y = angle;
            branch.castShadow = true;
            group.add(branch);
        }
        
        return group;
    }
    
    /**
     * Create pine tree - tall, conical
     */
    static createPineTree() {
        const group = new THREE.Group();
        
        // Tall, thin trunk
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 5, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x654321,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Conical needle layers
        const needleMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a5f1a, // Darker green
            roughness: 0.9,
            flatShading: true
        });
        
        // Create 4 layers getting smaller towards top
        for (let i = 0; i < 4; i++) {
            const radius = 1.2 - (i * 0.25);
            const height = 1.5;
            const needleGeo = new THREE.ConeGeometry(radius, height, 8);
            const needles = new THREE.Mesh(needleGeo, needleMat);
            needles.position.y = 2.5 + (i * 1);
            needles.castShadow = true;
            group.add(needles);
        }
        
        return group;
    }
    
    /**
     * Create willow tree - drooping branches
     */
    static createWillowTree() {
        const group = new THREE.Group();
        
        // Medium trunk
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3.5, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B7355,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.75;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Drooping branches (vertical cylinders)
        const branchMat = new THREE.MeshStandardMaterial({ 
            color: 0x90ee90, // Light green
            roughness: 0.8
        });
        
        const angles = 8;
        for (let i = 0; i < angles; i++) {
            const angle = (i / angles) * Math.PI * 2;
            const radius = 0.8 + Math.random() * 0.4;
            const branchGeo = new THREE.CylinderGeometry(0.05, 0.08, 2 + Math.random() * 1, 4);
            const branch = new THREE.Mesh(branchGeo, branchMat);
            
            branch.position.set(
                Math.cos(angle) * radius,
                2.5,
                Math.sin(angle) * radius
            );
            branch.position.y -= Math.random() * 0.5;
            branch.castShadow = true;
            group.add(branch);
            
            // Add leaf clusters at bottom
            const leafGeo = new THREE.SphereGeometry(0.2, 6, 6);
            const leaf = new THREE.Mesh(leafGeo, branchMat);
            leaf.position.copy(branch.position);
            leaf.position.y -= 1;
            group.add(leaf);
        }
        
        return group;
    }
    
    /**
     * Create dead tree - bare branches, dark
     */
    static createDeadTree() {
        const group = new THREE.Group();
        
        // Gnarled trunk
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x4a4a4a, // Dark gray
            roughness: 1.0
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        group.add(trunk);
        
        // Sparse, twisted branches
        const branchMat = new THREE.MeshStandardMaterial({ 
            color: 0x3a3a3a,
            roughness: 1.0
        });
        
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const branchGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.5, 4);
            const branch = new THREE.Mesh(branchGeo, branchMat);
            
            branch.position.set(
                Math.cos(angle) * 0.3,
                2 + Math.random() * 0.5,
                Math.sin(angle) * 0.3
            );
            
            // Random twisted angles
            branch.rotation.x = (Math.random() - 0.5) * 0.5;
            branch.rotation.z = (Math.random() - 0.5) * Math.PI / 3;
            branch.rotation.y = angle;
            branch.castShadow = true;
            group.add(branch);
        }
        
        return group;
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.SimpleTreeGenerator = SimpleTreeGenerator;
}
