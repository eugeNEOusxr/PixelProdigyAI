/**
 * SYMMETRICAL VERTEX CHARACTER SYSTEM
 * Inspired by Solana's symmetrical drawing technique
 * 
 * How it works:
 * - Define vertices for ONE SIDE of the body (left or right)
 * - System automatically mirrors to create the other side
 * - Edit one side = both sides update
 * - Half the work, perfect symmetry
 * 
 * Like drawing: You sketch half a face, fold paper, trace mirror image
 */

class SymmetricalCharacterSystem {
    constructor() {
        this.symmetryAxis = 'x'; // Mirror across X axis (left/right)
        this.characterParts = {};
        this.materials = this.createCharacterMaterials();
    }

    createCharacterMaterials() {
        return {
            skin: new THREE.MeshStandardMaterial({
                color: 0xffdbac,
                roughness: 0.6,
                metalness: 0.0
            }),
            hair: new THREE.MeshStandardMaterial({
                color: 0x3a2a1a,
                roughness: 0.8,
                metalness: 0.0
            }),
            eyes: new THREE.MeshStandardMaterial({
                color: 0x4a90e2,
                roughness: 0.2,
                metalness: 0.1
            }),
            clothes: new THREE.MeshStandardMaterial({
                color: 0x2c5aa0,
                roughness: 0.7,
                metalness: 0.0
            }),
            shoes: new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.4,
                metalness: 0.1
            })
        };
    }

    /**
     * SYMMETRICAL VERTEX DEFINITION
     * Define vertices for ONE SIDE only
     * System mirrors automatically
     */
    createSymmetricalHead() {
        const group = new THREE.Group();

        // Define RIGHT HALF vertices (positive X values)
        const rightHalfVertices = [
            // Front face outline (right side)
            0, 4, 0,        // Center top of head
            0.5, 3.8, 0.3,  // Forehead right
            0.8, 3.5, 0.5,  // Temple right
            1.0, 3.0, 0.6,  // Upper cheek right
            1.1, 2.3, 0.5,  // Cheekbone right
            1.0, 1.5, 0.4,  // Lower cheek right
            0.8, 0.8, 0.3,  // Jaw right
            0.5, 0.3, 0.2,  // Chin approach right
            0, 0, 0,        // Center chin
        ];

        // Create geometry from right half
        const rightGeometry = new THREE.BufferGeometry();
        rightGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rightHalfVertices, 3));

        // MIRROR to create left half
        const leftHalfVertices = this.mirrorVertices(rightHalfVertices, 'x');
        const leftGeometry = new THREE.BufferGeometry();
        leftGeometry.setAttribute('position', new THREE.Float32BufferAttribute(leftHalfVertices, 3));

        // Combine both halves
        const fullHeadVertices = [...rightHalfVertices, ...leftHalfVertices];
        const fullHeadIndices = this.createSymmetricalIndices(rightHalfVertices.length / 3);

        const headGeometry = new THREE.BufferGeometry();
        headGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fullHeadVertices, 3));
        headGeometry.setIndex(fullHeadIndices);
        headGeometry.computeVertexNormals();

        const head = new THREE.Mesh(headGeometry, this.materials.skin);
        head.castShadow = true;
        group.add(head);

        // Add symmetrical eyes
        this.addSymmetricalEyes(group);

        return group;
    }

    /**
     * MIRROR VERTICES across specified axis
     * This is the SYMMETRY MAGIC
     */
    mirrorVertices(vertices, axis) {
        const mirrored = [];
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];

            if (axis === 'x') {
                mirrored.push(-x, y, z); // Flip X coordinate
            } else if (axis === 'y') {
                mirrored.push(x, -y, z); // Flip Y coordinate
            } else if (axis === 'z') {
                mirrored.push(x, y, -z); // Flip Z coordinate
            }
        }

        return mirrored;
    }

    createSymmetricalIndices(vertexCount) {
        const indices = [];
        
        // Create faces connecting vertices
        for (let i = 0; i < vertexCount - 1; i++) {
            // Right half triangle
            indices.push(i, i + 1, i + vertexCount);
            // Left half triangle
            indices.push(i + 1, i + vertexCount + 1, i + vertexCount);
        }

        return indices;
    }

    /**
     * SYMMETRICAL EYES
     * Define right eye, mirror to create left eye
     */
    addSymmetricalEyes(headGroup) {
        // Right eye (positive X)
        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 16, 16),
            this.materials.eyes
        );
        rightEye.position.set(0.5, 2.8, 0.7);
        rightEye.castShadow = true;
        headGroup.add(rightEye);

        // Left eye (mirror of right eye)
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 16, 16),
            this.materials.eyes
        );
        leftEye.position.set(-0.5, 2.8, 0.7); // Negative X = mirrored
        leftEye.castShadow = true;
        headGroup.add(leftEye);
    }

    /**
     * SYMMETRICAL ARM
     * Define right arm vertices, mirror for left arm
     */
    createSymmetricalArm(side = 'right') {
        const armVertices = [
            // Shoulder
            0, 0, 0,
            0.3, 0, 0.1,
            0.3, -0.5, 0.1,
            
            // Upper arm
            0.25, -1.0, 0.05,
            0.2, -1.5, 0,
            
            // Elbow
            0.2, -2.0, 0,
            
            // Forearm
            0.18, -2.5, 0,
            0.15, -3.0, 0,
            
            // Wrist
            0.12, -3.3, 0,
            
            // Hand
            0.1, -3.6, 0
        ];

        // If left arm, mirror vertices
        const finalVertices = side === 'left' ? this.mirrorVertices(armVertices, 'x') : armVertices;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(finalVertices, 3));
        
        // Create tube connecting vertices
        const indices = [];
        for (let i = 0; i < finalVertices.length / 3 - 1; i++) {
            indices.push(i, i + 1);
        }
        geometry.setIndex(indices);

        const arm = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffdbac, linewidth: 5 }));
        
        return arm;
    }

    /**
     * SYMMETRICAL LEG
     * Define right leg vertices, mirror for left leg
     */
    createSymmetricalLeg(side = 'right') {
        const legVertices = [
            // Hip
            0, 0, 0,
            
            // Upper leg
            0.1, -1.0, 0,
            0.12, -2.0, 0,
            
            // Knee
            0.12, -2.5, 0.1,
            
            // Lower leg
            0.1, -3.5, 0.05,
            0.08, -4.5, 0,
            
            // Ankle
            0.08, -5.0, 0,
            
            // Foot
            0.08, -5.2, 0.3
        ];

        const finalVertices = side === 'left' ? this.mirrorVertices(legVertices, 'x') : legVertices;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(finalVertices, 3));
        
        const indices = [];
        for (let i = 0; i < finalVertices.length / 3 - 1; i++) {
            indices.push(i, i + 1);
        }
        geometry.setIndex(indices);

        const leg = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffdbac, linewidth: 5 }));
        
        return leg;
    }

    /**
     * CREATE COMPLETE SYMMETRICAL CHARACTER
     * Define right side, system creates left side automatically
     */
    createSymmetricalCharacter() {
        const character = new THREE.Group();

        // Head (symmetrical by default)
        const head = this.createSymmetricalHead();
        head.position.y = 6;
        character.add(head);

        // Torso (centered, no mirroring needed)
        const torso = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.9, 3, 16),
            this.materials.clothes
        );
        torso.position.y = 3.5;
        torso.castShadow = true;
        character.add(torso);

        // Right arm
        const rightArm = this.createSymmetricalArm('right');
        rightArm.position.set(1.2, 5, 0);
        character.add(rightArm);

        // Left arm (mirrored automatically)
        const leftArm = this.createSymmetricalArm('left');
        leftArm.position.set(-1.2, 5, 0);
        character.add(leftArm);

        // Right leg
        const rightLeg = this.createSymmetricalLeg('right');
        rightLeg.position.set(0.4, 2, 0);
        character.add(rightLeg);

        // Left leg (mirrored automatically)
        const leftLeg = this.createSymmetricalLeg('left');
        leftLeg.position.set(-0.4, 2, 0);
        character.add(leftLeg);

        return character;
    }

    /**
     * BRUSHWORK UTILITY: Edit vertices with "brush strokes"
     * Like drawing - paint vertices where you want them
     */
    brushVertices(geometry, brushPosition, brushRadius, brushStrength) {
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const vx = positions[i];
            const vy = positions[i + 1];
            const vz = positions[i + 2];
            
            // Distance from brush to vertex
            const dx = vx - brushPosition.x;
            const dy = vy - brushPosition.y;
            const dz = vz - brushPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // If vertex is within brush radius
            if (distance < brushRadius) {
                const falloff = 1 - (distance / brushRadius);
                const strength = brushStrength * falloff;
                
                // Move vertex (like sculpting)
                positions[i] += dx * strength;
                positions[i + 1] += dy * strength;
                positions[i + 2] += dz * strength;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    /**
     * SYMMETRICAL BRUSH: Edit one side, other side mirrors automatically
     */
    symmetricalBrush(geometry, brushPosition, brushRadius, brushStrength, mirrorAxis = 'x') {
        // Apply brush to original side
        this.brushVertices(geometry, brushPosition, brushRadius, brushStrength);
        
        // Create mirrored brush position
        const mirroredPosition = brushPosition.clone();
        if (mirrorAxis === 'x') mirroredPosition.x *= -1;
        else if (mirrorAxis === 'y') mirroredPosition.y *= -1;
        else if (mirrorAxis === 'z') mirroredPosition.z *= -1;
        
        // Apply brush to mirrored side
        this.brushVertices(geometry, mirroredPosition, brushRadius, brushStrength);
    }

    /**
     * SAVE CHARACTER DATA
     * Store vertex positions for later use
     */
    exportCharacterData(character) {
        const data = {
            name: character.name || "Unnamed Character",
            parts: [],
            symmetry: true,
            symmetryAxis: this.symmetryAxis
        };

        character.traverse((child) => {
            if (child.geometry) {
                const positions = Array.from(child.geometry.attributes.position.array);
                data.parts.push({
                    type: child.userData.type || "unknown",
                    material: child.material.color.getHexString(),
                    vertices: positions,
                    position: {
                        x: child.position.x,
                        y: child.position.y,
                        z: child.position.z
                    }
                });
            }
        });

        return data;
    }

    /**
     * LOAD CHARACTER FROM DATA
     */
    importCharacterData(data) {
        const character = new THREE.Group();

        data.parts.forEach(part => {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(part.vertices, 3));
            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                color: parseInt(part.material, 16),
                roughness: 0.6,
                metalness: 0.0
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(part.position.x, part.position.y, part.position.z);
            mesh.castShadow = true;
            mesh.userData.type = part.type;
            
            character.add(mesh);
        });

        return character;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SymmetricalCharacterSystem;
}
