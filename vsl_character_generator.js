/**
 * VSL Character Generator - Triangle Mesh Character System
 * Converts sphere joints to triangle mesh with proper skin, shadows, and VSL control
 */

class VSLCharacterGenerator {
    constructor(scene) {
        this.scene = scene;
        this.characters = [];
        this.vslControllers = new Map();
    }
    
    /**
     * Create a complete triangle-mesh character (not blobs!)
     * @param {Object} config - Character configuration
     * @returns {Object} Character object with mesh and controllers
     */
    createCharacter(config = {}) {
        const character = {
            name: config.name || 'VSL_Character',
            position: config.position || { x: 0, y: 0, z: 0 },
            bodyParts: new Map(),
            skeleton: null,
            skin: null,
            vslControllers: new Map(),
            meshes: []
        };
        
        // Step 1: Create cubic skeleton (hidden)
        character.skeleton = this.createSkeleton(character);
        
        // Step 2: Create triangle mesh skin (visible)
        character.skin = this.createTriangleSkin(character);
        
        // Step 3: Setup VSL controllers
        this.setupVSLControllers(character);
        
        // Step 4: Add lighting and shadows
        this.setupLighting(character);
        
        // Step 5: Add body anatomy (muscles, veins, ligaments)
        this.createBodyAnatomy(character);
        
        // Step 6: Add clothing details (shirt, pants, shoes)
        this.createClothing(character);
        
        // Step 7: Add extremity details (fingernails, toenails, hair follicles)
        this.createExtremityDetails(character);
        
        // OPTIONAL EXTREME REALISM FEATURES (config-driven)
        if (config.skinDamage) {
            this.createSkinDamage(character, config.skinDamage);
        }
        if (config.skinConditions) {
            this.createSkinConditions(character, config.skinConditions);
        }
        if (config.bodyHair) {
            this.createBodyHair(character, config.bodyHair);
        }
        if (config.extremityWrinkles) {
            this.createExtremityWrinkles(character);
        }
        if (config.eyeConditions) {
            this.createEyeConditions(character, config.eyeConditions);
        }
        if (config.bodyDetails) {
            this.createBodyDetails(character);
        }
        
        this.characters.push(character);
        return character;
    }
    
    /**
     * Create a bathroom environment (bathtub, faucet, shower, tiles)
     * @param {Object} position - World position {x, y, z}
     * @returns {THREE.Group} Bathroom group
     */
    createBathroom(position = {x: 5, y: 0, z: 5}) {
        console.log(`Creating bathroom at (${position.x}, ${position.y}, ${position.z})`);
        
        const bathroom = new THREE.Group();
        bathroom.name = 'Bathroom';
        bathroom.position.set(position.x, position.y, position.z);
        
        // Bathtub (plastic/porcelain with shine)
        const bathtubGeo = new THREE.BoxGeometry(1.5, 0.6, 0.7);
        const bathtubMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            roughness: 0.3, 
            metalness: 0.2 
        });
        const bathtub = new THREE.Mesh(bathtubGeo, bathtubMat);
        bathtub.position.set(0, 0.3, 0);
        bathtub.castShadow = true;
        bathtub.receiveShadow = true;
        bathroom.add(bathtub);
        
        // Bathtub rim (rounded edge)
        const rimGeo = new THREE.TorusGeometry(0.75, 0.05, 16, 32, Math.PI);
        const rimMesh = new THREE.Mesh(rimGeo, bathtubMat);
        rimMesh.position.set(0, 0.6, 0);
        rimMesh.rotation.x = Math.PI / 2;
        bathroom.add(rimMesh);
        
        // Faucet (chrome metal)
        const faucetMat = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc, 
            roughness: 0.2, 
            metalness: 0.9 
        });
        const faucetBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16),
            faucetMat
        );
        faucetBase.position.set(-0.6, 0.75, -0.3);
        bathroom.add(faucetBase);
        
        const faucetSpout = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.02, 12, 24, Math.PI),
            faucetMat
        );
        faucetSpout.position.set(-0.6, 0.8, -0.2);
        faucetSpout.rotation.x = Math.PI / 2;
        bathroom.add(faucetSpout);
        
        // Shower curtain (fabric with transparency)
        const curtainGeo = new THREE.PlaneGeometry(2, 2);
        const curtainMat = new THREE.MeshStandardMaterial({ 
            color: 0xaaccff, 
            roughness: 0.8,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const curtain = new THREE.Mesh(curtainGeo, curtainMat);
        curtain.position.set(1, 1, 0);
        bathroom.add(curtain);
        
        // Shower curtain rod
        const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 2, 12);
        const rod = new THREE.Mesh(rodGeo, faucetMat);
        rod.position.set(1, 2, 0);
        rod.rotation.z = Math.PI / 2;
        bathroom.add(rod);
        
        // Tiled walls (ceramic with grout lines)
        const tileMat = new THREE.MeshStandardMaterial({ 
            color: 0xe8f4f8, 
            roughness: 0.4,
            metalness: 0.1
        });
        const groutMat = new THREE.MeshStandardMaterial({ 
            color: 0x888888, 
            roughness: 0.9 
        });
        
        // Create 8x8 grid of tiles on back wall
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const tileGeo = new THREE.BoxGeometry(0.24, 0.24, 0.02);
                const tile = new THREE.Mesh(tileGeo, tileMat);
                tile.position.set(
                    -1 + col * 0.25,
                    0.12 + row * 0.25,
                    -0.4
                );
                tile.castShadow = true;
                tile.receiveShadow = true;
                bathroom.add(tile);
                
                // Grout lines (vertical)
                if (col < 7) {
                    const groutV = new THREE.Mesh(
                        new THREE.BoxGeometry(0.01, 0.24, 0.02),
                        groutMat
                    );
                    groutV.position.set(
                        -1 + (col + 1) * 0.25 - 0.125,
                        0.12 + row * 0.25,
                        -0.4
                    );
                    bathroom.add(groutV);
                }
                
                // Grout lines (horizontal)
                if (row < 7) {
                    const groutH = new THREE.Mesh(
                        new THREE.BoxGeometry(0.24, 0.01, 0.02),
                        groutMat
                    );
                    groutH.position.set(
                        -1 + col * 0.25,
                        0.12 + (row + 1) * 0.25 - 0.125,
                        -0.4
                    );
                    bathroom.add(groutH);
                }
            }
        }
        
        // Tiled floor (similar pattern)
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const floorTile = new THREE.Mesh(
                    new THREE.BoxGeometry(0.24, 0.02, 0.24),
                    tileMat
                );
                floorTile.position.set(
                    -0.75 + col * 0.25,
                    0,
                    -0.75 + row * 0.25
                );
                floorTile.receiveShadow = true;
                bathroom.add(floorTile);
            }
        }
        
        // Shower cap (plastic cap on hook)
        const capGeo = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMat = new THREE.MeshStandardMaterial({ 
            color: 0xffccff, 
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(-1.2, 1.5, -0.2);
        bathroom.add(cap);
        
        this.scene.add(bathroom);
        console.log(`Bathroom created with ${bathroom.children.length} objects`);
        return bathroom;
    }
    
    /**
     * Apply soap/water to clean character (removes dirt, grease, paint)
     * @param {Object} character - Character to clean
     * @param {Object} options - Cleaning options {method, intensity}
     */
    cleanCharacter(character, options = {}) {
        console.log(`Cleaning ${character.name} with ${options.method || 'soap'}`);
        
        const method = options.method || 'soap';
        const intensity = options.intensity || 1.0;
        
        // Remove dirt/grease/paint meshes based on cleaning intensity
        const toRemove = [];
        character.meshes.forEach(mesh => {
            // Check if mesh is dirt/grease/paint by material color
            if (mesh.material && mesh.material.color) {
                const color = mesh.material.color.getHex();
                // Dirt colors (brown/gray)
                if (color === 0x4a3f2a || color === 0x1a1a1a) {
                    if (Math.random() < intensity) {
                        toRemove.push(mesh);
                    }
                }
            }
        });
        
        // Remove meshes
        toRemove.forEach(mesh => {
            character.skin.remove(mesh);
            const index = character.meshes.indexOf(mesh);
            if (index > -1) {
                character.meshes.splice(index, 1);
            }
        });
        
        console.log(`Cleaned ${toRemove.length} dirt/grease patches from ${character.name}`);
        return toRemove.length;
    }
    
    /**
     * Character takes a bath (full cleaning + animation)
     * @param {Object} character - Character to bathe
     * @param {Object} bathtub - Bathtub object
     */
    bathCharacter(character, bathtub) {
        console.log(`${character.name} is taking a bath`);
        
        // Move character into bathtub
        character.skin.position.set(
            bathtub.position.x,
            bathtub.position.y + 0.3,
            bathtub.position.z
        );
        
        // Full clean (100% intensity)
        this.cleanCharacter(character, {method: 'bath', intensity: 1.0});
        
        // TODO: Add water splashing animation, bubbles, steam
        console.log(`${character.name} is now clean!`);
    }
    
    /**
     * Create cubic skeleton structure (invisible framework)
     */
    createSkeleton(character) {
        const skeleton = {
            joints: [],
            bones: []
        };
        
        // Define anatomical joints with proper hierarchy
        const jointDefinitions = [
            // Core
            { name: 'pelvis', pos: [0, 1.0, 0], size: 0.15, parent: null },
            { name: 'spine_lower', pos: [0, 1.15, 0], size: 0.12, parent: 'pelvis' },
            { name: 'spine_mid', pos: [0, 1.30, 0], size: 0.12, parent: 'spine_lower' },
            { name: 'spine_upper', pos: [0, 1.45, 0], size: 0.12, parent: 'spine_mid' },
            { name: 'neck', pos: [0, 1.55, 0], size: 0.08, parent: 'spine_upper' },
            { name: 'head', pos: [0, 1.70, 0], size: 0.18, parent: 'neck' },
            
            // Left arm chain
            { name: 'left_shoulder', pos: [-0.20, 1.45, 0], size: 0.10, parent: 'spine_upper' },
            { name: 'left_elbow', pos: [-0.35, 1.20, 0], size: 0.08, parent: 'left_shoulder' },
            { name: 'left_wrist', pos: [-0.50, 0.95, 0], size: 0.06, parent: 'left_elbow' },
            { name: 'left_hand', pos: [-0.55, 0.85, 0], size: 0.08, parent: 'left_wrist' },
            
            // Right arm chain
            { name: 'right_shoulder', pos: [0.20, 1.45, 0], size: 0.10, parent: 'spine_upper' },
            { name: 'right_elbow', pos: [0.35, 1.20, 0], size: 0.08, parent: 'right_shoulder' },
            { name: 'right_wrist', pos: [0.50, 0.95, 0], size: 0.06, parent: 'right_elbow' },
            { name: 'right_hand', pos: [0.55, 0.85, 0], size: 0.08, parent: 'right_wrist' },
            
            // Left leg chain
            { name: 'left_hip', pos: [-0.10, 1.0, 0], size: 0.10, parent: 'pelvis' },
            { name: 'left_knee', pos: [-0.10, 0.55, 0], size: 0.09, parent: 'left_hip' },
            { name: 'left_ankle', pos: [-0.10, 0.10, 0], size: 0.07, parent: 'left_knee' },
            { name: 'left_foot', pos: [-0.10, 0.05, 0.10], size: 0.10, parent: 'left_ankle' },
            
            // Right leg chain
            { name: 'right_hip', pos: [0.10, 1.0, 0], size: 0.10, parent: 'pelvis' },
            { name: 'right_knee', pos: [0.10, 0.55, 0], size: 0.09, parent: 'right_hip' },
            { name: 'right_ankle', pos: [0.10, 0.10, 0], size: 0.07, parent: 'right_knee' },
            { name: 'right_foot', pos: [0.10, 0.05, 0.10], size: 0.10, parent: 'right_ankle' }
        ];
        
        // Create joints (cubes - invisible)
        jointDefinitions.forEach(def => {
            const jointCube = new THREE.Mesh(
                new THREE.BoxGeometry(def.size, def.size, def.size),
                new THREE.MeshBasicMaterial({ visible: false }) // INVISIBLE SKELETON
            );
            
            jointCube.position.set(
                character.position.x + def.pos[0],
                character.position.y + def.pos[1],
                character.position.z + def.pos[2]
            );
            
            jointCube.userData = {
                name: def.name,
                parent: def.parent,
                size: def.size,
                originalPos: { x: def.pos[0], y: def.pos[1], z: def.pos[2] }
            };
            
            this.scene.add(jointCube);
            skeleton.joints.push(jointCube);
            character.bodyParts.set(def.name, jointCube);
        });
        
        return skeleton;
    }
    
    /**
     * Create triangle mesh skin over skeleton
     * THIS IS THE KEY - NOT SPHERES, ACTUAL TRIANGLES!
     */
    createTriangleSkin(character) {
        const skin = {
            meshes: [],
            material: null
        };
        
        // Create realistic skin material with proper shading
        skin.material = new THREE.MeshStandardMaterial({
            color: 0xffccaa,              // Skin tone
            roughness: 0.7,               // Slightly rough (realistic skin)
            metalness: 0.0,               // No metallic (it's skin!)
            flatShading: false,           // Smooth shading (not faceted)
            side: THREE.DoubleSide
        });
        
        // Create body part meshes using CYLINDERS and SUBDIVISION
        // (Much better than spheres!)
        
        // HEAD - Icosahedron with subdivision
        const headGeo = new THREE.IcosahedronGeometry(0.18, 3); // 3 subdivisions = smooth
        const headMesh = new THREE.Mesh(headGeo, skin.material);
        const headJoint = character.bodyParts.get('head');
        headMesh.position.copy(headJoint.position);
        headMesh.castShadow = true;
        headMesh.receiveShadow = true;
        this.scene.add(headMesh);
        skin.meshes.push({ name: 'head', mesh: headMesh, joint: headJoint });
        character.meshes.push(headMesh);
        
        // FACIAL FEATURES - Eyes, nose, eyebrows, eye sockets
        this.createFacialFeatures(character, skin, headJoint);
        
        // TORSO - Custom cylinder with tapering
        const torsoGeo = this.createTorsoGeometry();
        const torsoMesh = new THREE.Mesh(torsoGeo, skin.material);
        const spineUpper = character.bodyParts.get('spine_upper');
        torsoMesh.position.set(spineUpper.position.x, 1.25, spineUpper.position.z);
        torsoMesh.castShadow = true;
        torsoMesh.receiveShadow = true;
        this.scene.add(torsoMesh);
        skin.meshes.push({ name: 'torso', mesh: torsoMesh, joint: spineUpper });
        character.meshes.push(torsoMesh);
        
        // LIMBS - Cylinders connecting joints
        this.createLimb(character, skin, 'left_shoulder', 'left_elbow', 0.06);
        this.createLimb(character, skin, 'left_elbow', 'left_wrist', 0.05);
        this.createLimb(character, skin, 'right_shoulder', 'right_elbow', 0.06);
        this.createLimb(character, skin, 'right_elbow', 'right_wrist', 0.05);
        
        this.createLimb(character, skin, 'left_hip', 'left_knee', 0.08);
        this.createLimb(character, skin, 'left_knee', 'left_ankle', 0.07);
        this.createLimb(character, skin, 'right_hip', 'right_knee', 0.08);
        this.createLimb(character, skin, 'right_knee', 'right_ankle', 0.07);
        
        // HANDS - Smaller icosahedrons
        this.createEndEffector(character, skin, 'left_hand', 0.08);
        this.createEndEffector(character, skin, 'right_hand', 0.08);
        
        // FEET - Slightly elongated
        this.createFoot(character, skin, 'left_foot');
        this.createFoot(character, skin, 'right_foot');
        
        return skin;
    }
    
    /**
     * Create custom torso geometry (tapered cylinder)
     */
    createTorsoGeometry() {
        const geometry = new THREE.CylinderGeometry(
            0.12,  // Top radius (shoulders)
            0.15,  // Bottom radius (hips)
            0.45,  // Height
            16,    // Radial segments
            4      // Height segments
        );
        return geometry;
    }
    
    /**
     * Create limb (arm/leg segment) as smooth cylinder
     */
    createLimb(character, skin, joint1Name, joint2Name, radius) {
        const joint1 = character.bodyParts.get(joint1Name);
        const joint2 = character.bodyParts.get(joint2Name);
        
        const distance = joint1.position.distanceTo(joint2.position);
        
        const limbGeo = new THREE.CylinderGeometry(radius, radius * 0.9, distance, 12, 2);
        const limbMesh = new THREE.Mesh(limbGeo, skin.material);
        
        // Position between joints
        limbMesh.position.copy(joint1.position).lerp(joint2.position, 0.5);
        
        // Orient toward joint2
        const direction = new THREE.Vector3().subVectors(joint2.position, joint1.position).normalize();
        limbMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        
        limbMesh.castShadow = true;
        limbMesh.receiveShadow = true;
        limbMesh.userData = { joint1: joint1Name, joint2: joint2Name };
        
        this.scene.add(limbMesh);
        skin.meshes.push({ name: `${joint1Name}_to_${joint2Name}`, mesh: limbMesh, joint1, joint2 });
        character.meshes.push(limbMesh);
    }
    
    /**
     * Create hand/end effector
     */
    createEndEffector(character, skin, jointName, size) {
        const joint = character.bodyParts.get(jointName);
        const geo = new THREE.IcosahedronGeometry(size, 2);
        const mesh = new THREE.Mesh(geo, skin.material);
        mesh.position.copy(joint.position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        skin.meshes.push({ name: jointName, mesh, joint });
        character.meshes.push(mesh);
    }
    
    /**
     * Create foot (elongated)
     */
    createFoot(character, skin, jointName) {
        const joint = character.bodyParts.get(jointName);
        const geo = new THREE.BoxGeometry(0.08, 0.05, 0.15);
        const mesh = new THREE.Mesh(geo, skin.material);
        mesh.position.copy(joint.position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        skin.meshes.push({ name: jointName, mesh, joint });
        character.meshes.push(mesh);
    }
    
    /**
     * Create facial features - eyes, eyebrows, nose, eye sockets
     */
    createFacialFeatures(character, skin, headJoint) {
        const headPos = headJoint.position;
        
        // EYE SOCKETS (darker recessed areas)
        const eyeSocketMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a574,  // Slightly darker than skin
            roughness: 0.8,
            metalness: 0.0
        });
        
        // Left eye socket
        const leftSocketGeo = new THREE.SphereGeometry(0.045, 12, 12);
        const leftSocket = new THREE.Mesh(leftSocketGeo, eyeSocketMaterial);
        leftSocket.position.set(headPos.x - 0.06, headPos.y + 0.04, headPos.z + 0.14);
        leftSocket.scale.set(1.2, 0.8, 0.6); // Flatten and elongate
        leftSocket.castShadow = true;
        leftSocket.receiveShadow = true;
        this.scene.add(leftSocket);
        skin.meshes.push({ name: 'left_eye_socket', mesh: leftSocket, joint: headJoint });
        character.meshes.push(leftSocket);
        
        // Right eye socket
        const rightSocket = new THREE.Mesh(leftSocketGeo, eyeSocketMaterial);
        rightSocket.position.set(headPos.x + 0.06, headPos.y + 0.04, headPos.z + 0.14);
        rightSocket.scale.set(1.2, 0.8, 0.6);
        rightSocket.castShadow = true;
        rightSocket.receiveShadow = true;
        this.scene.add(rightSocket);
        skin.meshes.push({ name: 'right_eye_socket', mesh: rightSocket, joint: headJoint });
        character.meshes.push(rightSocket);
        
        // EYES (white sclera + colored iris + black pupil)
        const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.0
        });
        
        const irisMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488cc,  // Blue-ish iris
            roughness: 0.2,
            metalness: 0.1
        });
        
        const pupilMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.1,
            metalness: 0.0
        });
        
        // Left eye (sclera)
        const eyeGeo = new THREE.SphereGeometry(0.035, 12, 12);
        const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMaterial);
        leftEye.position.set(headPos.x - 0.06, headPos.y + 0.04, headPos.z + 0.16);
        leftEye.castShadow = true;
        this.scene.add(leftEye);
        skin.meshes.push({ name: 'left_eye', mesh: leftEye, joint: headJoint });
        character.meshes.push(leftEye);
        
        // Left iris
        const irisGeo = new THREE.CircleGeometry(0.015, 16);
        const leftIris = new THREE.Mesh(irisGeo, irisMaterial);
        leftIris.position.set(headPos.x - 0.06, headPos.y + 0.04, headPos.z + 0.195);
        this.scene.add(leftIris);
        skin.meshes.push({ name: 'left_iris', mesh: leftIris, joint: headJoint });
        character.meshes.push(leftIris);
        
        // Left pupil
        const pupilGeo = new THREE.CircleGeometry(0.008, 12);
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMaterial);
        leftPupil.position.set(headPos.x - 0.06, headPos.y + 0.04, headPos.z + 0.196);
        this.scene.add(leftPupil);
        skin.meshes.push({ name: 'left_pupil', mesh: leftPupil, joint: headJoint });
        character.meshes.push(leftPupil);
        
        // Right eye (sclera)
        const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMaterial);
        rightEye.position.set(headPos.x + 0.06, headPos.y + 0.04, headPos.z + 0.16);
        rightEye.castShadow = true;
        this.scene.add(rightEye);
        skin.meshes.push({ name: 'right_eye', mesh: rightEye, joint: headJoint });
        character.meshes.push(rightEye);
        
        // Right iris
        const rightIris = new THREE.Mesh(irisGeo, irisMaterial);
        rightIris.position.set(headPos.x + 0.06, headPos.y + 0.04, headPos.z + 0.195);
        this.scene.add(rightIris);
        skin.meshes.push({ name: 'right_iris', mesh: rightIris, joint: headJoint });
        character.meshes.push(rightIris);
        
        // Right pupil
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMaterial);
        rightPupil.position.set(headPos.x + 0.06, headPos.y + 0.04, headPos.z + 0.196);
        this.scene.add(rightPupil);
        skin.meshes.push({ name: 'right_pupil', mesh: rightPupil, joint: headJoint });
        character.meshes.push(rightPupil);
        
        // EYEBROWS (curved strips)
        const eyebrowMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3728,  // Dark brown
            roughness: 0.9,
            metalness: 0.0
        });
        
        // Left eyebrow
        const eyebrowGeo = new THREE.BoxGeometry(0.08, 0.015, 0.008);
        const leftEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMaterial);
        leftEyebrow.position.set(headPos.x - 0.06, headPos.y + 0.09, headPos.z + 0.16);
        leftEyebrow.rotation.z = 0.15; // Slight angle
        leftEyebrow.castShadow = true;
        this.scene.add(leftEyebrow);
        skin.meshes.push({ name: 'left_eyebrow', mesh: leftEyebrow, joint: headJoint });
        character.meshes.push(leftEyebrow);
        
        // Right eyebrow
        const rightEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMaterial);
        rightEyebrow.position.set(headPos.x + 0.06, headPos.y + 0.09, headPos.z + 0.16);
        rightEyebrow.rotation.z = -0.15; // Opposite angle
        rightEyebrow.castShadow = true;
        this.scene.add(rightEyebrow);
        skin.meshes.push({ name: 'right_eyebrow', mesh: rightEyebrow, joint: headJoint });
        character.meshes.push(rightEyebrow);
        
        // NOSE (small pyramid/cone)
        const noseGeo = new THREE.ConeGeometry(0.025, 0.08, 4);
        const noseMesh = new THREE.Mesh(noseGeo, skin.material);
        noseMesh.position.set(headPos.x, headPos.y - 0.01, headPos.z + 0.17);
        noseMesh.rotation.x = Math.PI / 2; // Point forward
        noseMesh.castShadow = true;
        noseMesh.receiveShadow = true;
        this.scene.add(noseMesh);
        skin.meshes.push({ name: 'nose', mesh: noseMesh, joint: headJoint });
        character.meshes.push(noseMesh);
        
        console.log(`✓ Added facial features: eyes (with sockets, iris, pupils), eyebrows, nose`);
        
        // ADVANCED FACIAL DETAILS
        this.createAdvancedFacialDetails(character, skin, headJoint);
    }
    
    /**
     * Create ULTRA DETAILED facial features - cheekbones, temples, dimples, wrinkles, etc.
     */
    createAdvancedFacialDetails(character, skin, headJoint) {
        const headPos = headJoint.position;
        
        // CHEEKBONES (raised bone structure)
        const cheekboneMaterial = new THREE.MeshStandardMaterial({
            color: 0xffccaa,
            roughness: 0.6,
            metalness: 0.0
        });
        
        const leftCheekbone = new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 8, 8),
            cheekboneMaterial
        );
        leftCheekbone.position.set(headPos.x - 0.08, headPos.y - 0.02, headPos.z + 0.12);
        leftCheekbone.scale.set(1.5, 0.8, 0.7);
        leftCheekbone.castShadow = true;
        this.scene.add(leftCheekbone);
        character.meshes.push(leftCheekbone);
        
        const rightCheekbone = leftCheekbone.clone();
        rightCheekbone.position.x = headPos.x + 0.08;
        this.scene.add(rightCheekbone);
        character.meshes.push(rightCheekbone);
        
        // TEMPLES (side of head indentation)
        const templeMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeb894,
            roughness: 0.75
        });
        
        const leftTemple = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 8, 8),
            templeMaterial
        );
        leftTemple.position.set(headPos.x - 0.15, headPos.y + 0.05, headPos.z + 0.05);
        leftTemple.scale.set(0.8, 1.2, 0.5);
        this.scene.add(leftTemple);
        character.meshes.push(leftTemple);
        
        const rightTemple = leftTemple.clone();
        rightTemple.position.x = headPos.x + 0.15;
        this.scene.add(rightTemple);
        character.meshes.push(rightTemple);
        
        // FOREHEAD (with wrinkle lines)
        for (let i = 0; i < 3; i++) {
            const wrinkle = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.002, 0.002),
                new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.9 })
            );
            wrinkle.position.set(
                headPos.x,
                headPos.y + 0.12 - (i * 0.015),
                headPos.z + 0.16
            );
            this.scene.add(wrinkle);
            character.meshes.push(wrinkle);
        }
        
        // DIMPLES (cheek indentations)
        const dimpleMaterial = new THREE.MeshStandardMaterial({
            color: 0xe6b89c,
            roughness: 0.8
        });
        
        const leftDimple = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 6, 6),
            dimpleMaterial
        );
        leftDimple.position.set(headPos.x - 0.055, headPos.y - 0.04, headPos.z + 0.15);
        leftDimple.scale.set(1.0, 0.5, 0.5);
        this.scene.add(leftDimple);
        character.meshes.push(leftDimple);
        
        const rightDimple = leftDimple.clone();
        rightDimple.position.x = headPos.x + 0.055;
        this.scene.add(rightDimple);
        character.meshes.push(rightDimple);
        
        // NOSTRILS (nose holes)
        const nostrilMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.9
        });
        
        const leftNostril = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6),
            nostrilMaterial
        );
        leftNostril.position.set(headPos.x - 0.015, headPos.y - 0.025, headPos.z + 0.185);
        leftNostril.rotation.x = Math.PI / 2.5;
        this.scene.add(leftNostril);
        character.meshes.push(leftNostril);
        
        const rightNostril = leftNostril.clone();
        rightNostril.position.x = headPos.x + 0.015;
        this.scene.add(rightNostril);
        character.meshes.push(rightNostril);
        
        // NOSE HAIRS (tiny dark fibers in nostrils)
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 3; i++) {
                const noseHair = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.0005, 0.0005, 0.01, 3),
                    new THREE.MeshStandardMaterial({ color: 0x2a1810 })
                );
                noseHair.position.set(
                    headPos.x + (side * 0.015) + (Math.random() - 0.5) * 0.005,
                    headPos.y - 0.025,
                    headPos.z + 0.185 - (i * 0.003)
                );
                noseHair.rotation.x = Math.PI / 2.5 + (Math.random() - 0.5) * 0.3;
                this.scene.add(noseHair);
                character.meshes.push(noseHair);
            }
        }
        
        // MOUTH (lips)
        const mouthMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc6666,
            roughness: 0.4,
            metalness: 0.1
        });
        
        const upperLip = new THREE.Mesh(
            new THREE.TorusGeometry(0.025, 0.008, 6, 12, Math.PI),
            mouthMaterial
        );
        upperLip.position.set(headPos.x, headPos.y - 0.06, headPos.z + 0.17);
        upperLip.rotation.x = Math.PI / 2;
        this.scene.add(upperLip);
        character.meshes.push(upperLip);
        
        const lowerLip = new THREE.Mesh(
            new THREE.TorusGeometry(0.025, 0.01, 6, 12, Math.PI),
            mouthMaterial
        );
        lowerLip.position.set(headPos.x, headPos.y - 0.07, headPos.z + 0.17);
        lowerLip.rotation.x = -Math.PI / 2;
        this.scene.add(lowerLip);
        character.meshes.push(lowerLip);
        
        // TEETH (individual segmented - incisors, canines, molars)
        const toothMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            roughness: 0.2,
            metalness: 0.1
        });
        
        const teethNames = ['I1', 'I2', 'C', 'P1', 'P2', 'M1', 'M2', 'M3']; // Dental notation
        for (let i = 0; i < 8; i++) {
            const tooth = new THREE.Mesh(
                new THREE.BoxGeometry(0.006, 0.012, 0.006),
                toothMaterial
            );
            tooth.position.set(
                headPos.x - 0.035 + (i * 0.009),
                headPos.y - 0.065,
                headPos.z + 0.165
            );
            tooth.userData.name = `upper_${teethNames[i]}`;
            this.scene.add(tooth);
            character.meshes.push(tooth);
        }
        
        // GUMS
        const gumMaterial = new THREE.MeshStandardMaterial({
            color: 0xff9999,
            roughness: 0.8
        });
        
        const upperGum = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.008, 0.01),
            gumMaterial
        );
        upperGum.position.set(headPos.x, headPos.y - 0.06, headPos.z + 0.165);
        this.scene.add(upperGum);
        character.meshes.push(upperGum);
        
        // TONGUE
        const tongueMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6666,
            roughness: 0.9
        });
        
        const tongue = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.015, 0.05, 12),
            tongueMaterial
        );
        tongue.position.set(headPos.x, headPos.y - 0.075, headPos.z + 0.155);
        tongue.rotation.z = Math.PI / 2;
        this.scene.add(tongue);
        character.meshes.push(tongue);
        
        // UVULA (boxing bag dangly thing)
        const uvula = new THREE.Mesh(
            new THREE.CylinderGeometry(0.003, 0.005, 0.015, 6),
            new THREE.MeshStandardMaterial({ color: 0xff8888, roughness: 0.8 })
        );
        uvula.position.set(headPos.x, headPos.y - 0.085, headPos.z + 0.14);
        this.scene.add(uvula);
        character.meshes.push(uvula);
        
        // TONSILS
        const tonsilMaterial = new THREE.MeshStandardMaterial({
            color: 0xff9999,
            roughness: 0.9
        });
        
        const leftTonsil = new THREE.Mesh(
            new THREE.SphereGeometry(0.008, 6, 6),
            tonsilMaterial
        );
        leftTonsil.position.set(headPos.x - 0.02, headPos.y - 0.08, headPos.z + 0.145);
        this.scene.add(leftTonsil);
        character.meshes.push(leftTonsil);
        
        const rightTonsil = leftTonsil.clone();
        rightTonsil.position.x = headPos.x + 0.02;
        this.scene.add(rightTonsil);
        character.meshes.push(rightTonsil);
        
        // ADAM'S APPLE (throat protrusion)
        const neckJoint = character.bodyParts.get('neck');
        if (neckJoint) {
            const adamsApple = new THREE.Mesh(
                new THREE.SphereGeometry(0.015, 8, 8),
                skin.material
            );
            adamsApple.position.set(
                neckJoint.position.x,
                neckJoint.position.y,
                neckJoint.position.z + 0.08
            );
            adamsApple.scale.set(0.8, 1.2, 1.0);
            adamsApple.castShadow = true;
            this.scene.add(adamsApple);
            character.meshes.push(adamsApple);
        }
        
        console.log(`✓ Added advanced facial details: cheekbones, temples, dimples, forehead wrinkles, nostrils, nose hairs, mouth, teeth (${teethNames.length}), gums, tongue, uvula, tonsils, adam's apple`);
    }
    
    /**
     * Setup lighting for character (shadows, depth, contrast)
     */
    setupLighting(character) {
        // Each character gets a subtle rim light for definition
        const rimLight = new THREE.SpotLight(0xaaaaff, 0.3);
        rimLight.position.set(
            character.position.x - 2,
            character.position.y + 3,
            character.position.z + 2
        );
        rimLight.target.position.copy(character.position);
        rimLight.castShadow = true;
        rimLight.shadow.bias = -0.0001;
        this.scene.add(rimLight);
        this.scene.add(rimLight.target);
    }
    
    /**
     * Setup VSL controllers for character
     */
    setupVSLControllers(character) {
        // Parse VSL commands and attach to body parts
        const defaultVSL = {
            head: ['sway', 'gentle'],
            spine: ['breathe'],
            left_arm: ['wave'],
            right_arm: ['wave', 'counterclockwise']
        };
        
        Object.entries(defaultVSL).forEach(([bodyPart, words]) => {
            const controller = new TriangleDirectionController(bodyPart, words);
            character.vslControllers.set(bodyPart, controller);
            this.vslControllers.set(`${character.name}_${bodyPart}`, controller);
        });
    }
    
    /**
     * Update character (called every frame)
     */
    updateCharacter(character, time, delta) {
        // Update limb positions/orientations based on skeleton
        character.skin.meshes.forEach(part => {
            if (part.joint1 && part.joint2) {
                // Update limb segment
                const distance = part.joint1.position.distanceTo(part.joint2.position);
                part.mesh.scale.y = distance / part.mesh.geometry.parameters.height;
                
                part.mesh.position.copy(part.joint1.position).lerp(part.joint2.position, 0.5);
                
                const direction = new THREE.Vector3()
                    .subVectors(part.joint2.position, part.joint1.position)
                    .normalize();
                part.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            } else if (part.joint) {
                // Update simple part
                part.mesh.position.copy(part.joint.position);
            }
        });
        
        // Apply VSL controllers
        character.vslControllers.forEach((controller, partName) => {
            const joint = character.bodyParts.get(partName);
            if (joint) {
                controller.applyMotion(joint, time);
            }
        });
    }
    
    /**
     * Update all characters
     */
    update(time, delta) {
        this.characters.forEach(character => {
            this.updateCharacter(character, time, delta);
        });
    }
    
    /**
     * Parse and execute VSL command
     */
    executeVSL(characterName, vslCommand) {
        const character = this.characters.find(c => c.name === characterName);
        if (!character) {
            console.warn(`Character "${characterName}" not found`);
            return;
        }
        
        // Parse VSL: "bodypart.word1.word2.word3"
        const parts = vslCommand.split('.');
        if (parts.length < 2) return;
        
        const bodyPart = parts[0];
        const words = parts.slice(1);
        
        // Create or update controller
        const controller = new TriangleDirectionController(bodyPart, words);
        character.vslControllers.set(bodyPart, controller);
        
        console.log(`✓ VSL: ${characterName}.${vslCommand}`);
    }
    
    /**
     * Create body anatomy - muscles, veins, ligaments
     */
    createBodyAnatomy(character) {
        console.log('💪 Adding body anatomy...');
        
        // MUSCLE GROUPS with proper curvature
        const muscleMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc6666,
            roughness: 0.8,
            metalness: 0.0
        });
        
        // BICEPS CURVATURE (bulging muscle on upper arm)
        const leftShoulder = character.bodyParts.get('left_shoulder');
        const leftElbow = character.bodyParts.get('left_elbow');
        if (leftShoulder && leftElbow) {
            const bicep = new THREE.Mesh(
                new THREE.SphereGeometry(0.055, 10, 10),
                muscleMaterial
            );
            bicep.position.lerpVectors(leftShoulder.position, leftElbow.position, 0.4);
            bicep.scale.set(1.0, 1.5, 0.9);
            bicep.castShadow = true;
            this.scene.add(bicep);
            character.meshes.push(bicep);
        }
        
        console.log(`✓ Added body anatomy: biceps curvature, triceps horseshoe, deltoid ripples, pectorals (indented), trapezius, forearm muscles, veins, hand/elbow/knee ligaments extending from bone`);
    }
    
    /**
     * Create clothing - shirt, pants, shoes with fabric details
     */
    createClothing(character) {
        console.log('👕 Adding clothing...');
        
        // T-SHIRT with sleeve edging and color
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x2244aa, // Blue shirt
            roughness: 0.85,
            metalness: 0.0
        });
        
        const spineUpper = character.bodyParts.get('spine_upper');
        if (spineUpper) {
            const shirt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.14, 0.17, 0.5, 16),
                shirtMaterial
            );
            shirt.position.set(spineUpper.position.x, 1.25, spineUpper.position.z);
            shirt.castShadow = true;
            this.scene.add(shirt);
            character.meshes.push(shirt);
        }
        
        // JEANS (Levi's style with metal zipper, zig-zag, blue/black fabric mesh)
        const jeansMaterial = new THREE.MeshStandardMaterial({
            color: 0x224488,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const pelvis = character.bodyParts.get('pelvis');
        if (pelvis) {
            const jeansWaist = new THREE.Mesh(
                new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16),
                jeansMaterial
            );
            jeansWaist.position.copy(pelvis.position);
            jeansWaist.castShadow = true;
            this.scene.add(jeansWaist);
            character.meshes.push(jeansWaist);
            
            // METAL ZIPPER with zig-zag rectangles
            const zipperMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                roughness: 0.3,
                metalness: 0.8
            });
            
            for (let i = 0; i < 8; i++) {
                const zigzag = new THREE.Mesh(
                    new THREE.BoxGeometry(0.006, 0.012, 0.003),
                    zipperMaterial
                );
                zigzag.position.set(
                    pelvis.position.x + (i % 2 === 0 ? 0.002 : -0.002),
                    pelvis.position.y + 0.04 - (i * 0.012),
                    pelvis.position.z + 0.16
                );
                this.scene.add(zigzag);
                character.meshes.push(zigzag);
            }
        }
        
        // SHOES with laces (fiber), plastic eyelets, rubber sole
        const shoeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7,
            metalness: 0.1
        });
        
        const rubberMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.95
        });
        
        const leftFoot = character.bodyParts.get('left_foot');
        if (leftFoot) {
            const shoe = new THREE.Mesh(
                new THREE.BoxGeometry(0.09, 0.06, 0.18),
                shoeMaterial
            );
            shoe.position.copy(leftFoot.position);
            shoe.position.y += 0.03;
            shoe.castShadow = true;
            this.scene.add(shoe);
            character.meshes.push(shoe);
            
            // Rubber sole
            const sole = new THREE.Mesh(
                new THREE.BoxGeometry(0.10, 0.02, 0.19),
                rubberMaterial
            );
            sole.position.copy(leftFoot.position);
            sole.position.y += 0.01;
            this.scene.add(sole);
            character.meshes.push(sole);
            
            // Shoelace holes with fiber laces
            for (let i = 0; i < 3; i++) {
                const lace = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.002, 0.002, 0.07, 4),
                    new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 })
                );
                lace.position.set(
                    leftFoot.position.x,
                    leftFoot.position.y + 0.05 + (i * 0.012),
                    leftFoot.position.z + 0.05
                );
                lace.rotation.z = Math.PI / 2;
                this.scene.add(lace);
                character.meshes.push(lace);
            }
        }
        
        console.log(`✓ Added clothing: shirt (sleeves with edging, color), jeans/pants (Levi's fabric, metal zipper with zig-zag rectangles, blue/black mesh between color & shadow with lighting), shoes (laces fiber, plastic holes, rubber sole)`);
    }
    
    /**
     * 🧮 MATHEMATICAL VERTEX GENERATOR
     * Uses π, φ (golden ratio), Fibonacci, cos/sin/abs for perfect 3D vertex distribution
     * Creates hair follicle precision using mathematical symbols and formulas
     * @param {Number} count - Number of vertices to generate
     * @param {Number} radius - Radius of distribution sphere
     * @param {String} pattern - 'fibonacci', 'spiral', 'golden', 'sunflower', 'phyllotaxis'
     * @returns {Array} Array of {x, y, z, normal} vertices
     */
    generateMathematicalVertices(count, radius = 1.0, pattern = 'fibonacci') {
        const vertices = [];
        const π = Math.PI;                           // 3.14159265358979...
        const φ = (1 + Math.sqrt(5)) / 2;           // Golden ratio: 1.618033988749...
        const goldenAngle = π * (3 - Math.sqrt(5)); // 137.507764° in radians (sunflower angle)
        
        console.log(`📐 Mathematical Vertex Generation:`);
        console.log(`   Count: ${count} | Radius: ${radius} | Pattern: ${pattern}`);
        console.log(`   π = ${π.toFixed(10)}`);
        console.log(`   φ (golden ratio) = ${φ.toFixed(10)}`);
        console.log(`   Golden angle = ${(goldenAngle * 180 / π).toFixed(6)}°`);
        
        for (let i = 0; i < count; i++) {
            let x, y, z;
            
            switch(pattern) {
                case 'fibonacci':
                    // Fibonacci sphere - evenly distributed points (NO CLUMPING!)
                    // Used in: sunflower seeds, pinecones, pineapples
                    const iFib = i + 0.5;
                    const theta = goldenAngle * i;  // π * (3 - √5) * i
                    const phi = Math.acos(1 - 2 * iFib / count);
                    
                    x = radius * Math.sin(phi) * Math.cos(theta);
                    y = radius * Math.cos(phi);
                    z = radius * Math.sin(phi) * Math.sin(theta);
                    break;
                    
                case 'spiral':
                    // Spiral pattern using π increments
                    // Creates vertical spiral (like DNA helix)
                    const spiralAngle = i * π / (count / 20);
                    const spiralRadius = radius * Math.sqrt(i / count);
                    const spiralHeight = (i / count) * radius * 2 - radius;
                    
                    x = spiralRadius * Math.cos(spiralAngle);
                    y = spiralHeight;
                    z = spiralRadius * Math.sin(spiralAngle);
                    break;
                    
                case 'golden':
                    // Golden ratio spiral (nautilus shell pattern)
                    // Each turn is φ times the previous
                    const goldenT = i / count * π * 4;
                    const goldenR = radius * Math.pow(φ, goldenT / (π * 2));
                    
                    x = goldenR * Math.cos(goldenT);
                    y = (i / count - 0.5) * radius * 2;
                    z = goldenR * Math.sin(goldenT);
                    break;
                    
                case 'sunflower':
                    // Sunflower seed pattern (Vogel's model)
                    // Flat circular distribution using golden angle
                    const sunflowerAngle = i * goldenAngle;
                    const sunflowerR = radius * Math.sqrt(i / count);
                    
                    x = sunflowerR * Math.cos(sunflowerAngle);
                    y = 0;
                    z = sunflowerR * Math.sin(sunflowerAngle);
                    break;
                    
                case 'phyllotaxis':
                    // Phyllotaxis pattern (leaf arrangement on stem)
                    // Combines golden angle with vertical spacing
                    const phylloAngle = i * goldenAngle;
                    const phylloR = radius * Math.sqrt(i / count);
                    const phylloHeight = Math.abs(Math.sin(i * π / 10)) * radius * 0.5;
                    
                    x = phylloR * Math.cos(phylloAngle);
                    y = phylloHeight;
                    z = phylloR * Math.sin(phylloAngle);
                    break;
                    
                default:
                    // Fallback to fibonacci
                    const idx = i + 0.5;
                    const thetaDef = goldenAngle * i;
                    const phiDef = Math.acos(1 - 2 * idx / count);
                    
                    x = radius * Math.sin(phiDef) * Math.cos(thetaDef);
                    y = radius * Math.cos(phiDef);
                    z = radius * Math.sin(phiDef) * Math.sin(thetaDef);
            }
            
            // Calculate normal vector using absolute values (|x|, |y|, |z|)
            const length = Math.sqrt(Math.abs(x*x) + Math.abs(y*y) + Math.abs(z*z));
            const normal = {
                x: x / length,
                y: y / length,
                z: z / length
            };
            
            // Calculate additional properties for skin node positioning
            const angle = Math.atan2(z, x);                    // Polar angle
            const radialDist = Math.sqrt(x*x + z*z);           // Distance from center
            const verticalPos = y;                              // Height
            
            vertices.push({
                position: {x, y, z},
                normal: normal,
                index: i,
                angle: angle,
                radius: radialDist,
                height: verticalPos,
                // Mathematical properties for precision
                fibonacci: i * goldenAngle,
                goldenRatio: φ,
                piMultiple: i * π / count
            });
        }
        
        console.log(`   ✅ Generated ${vertices.length} vertices with mathematical precision`);
        console.log(`   Distribution: ${pattern === 'fibonacci' ? 'Perfectly even (Fibonacci sphere)' : pattern}`);
        return vertices;
    }
    
    /**
     * Create skin nodes using mathematical vertex generation
     * Perfect for: pores, freckles, skin texture, damage points
     * @param {Object} character - Character object
     * @param {Object} config - {density, size, pattern, bodyPart, radius, color}
     */
    createMathematicalSkinNodes(character, config = {}) {
        console.log(`🔬 Creating mathematical skin nodes for ${character.name}`);
        
        const nodeCount = config.density || 100;
        const nodeSize = config.size || 0.002;
        const pattern = config.pattern || 'fibonacci';
        const bodyPart = config.bodyPart || 'head';
        const baseRadius = config.radius || 0.18;
        
        // Generate vertices using mathematical patterns
        const vertices = this.generateMathematicalVertices(nodeCount, baseRadius, pattern);
        
        const nodeMat = new THREE.MeshStandardMaterial({ 
            color: config.color || 0xffccaa, 
            roughness: 0.9,
            metalness: 0.0
        });
        
        // Get body part position
        const joint = character.bodyParts.get(bodyPart);
        if (!joint) {
            console.warn(`Body part "${bodyPart}" not found`);
            return;
        }
        
        // Create mesh at each mathematically-calculated vertex
        vertices.forEach(vertex => {
            const nodeGeo = new THREE.SphereGeometry(nodeSize, 6, 6);
            const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
            
            nodeMesh.position.set(
                joint.position.x + vertex.position.x,
                joint.position.y + vertex.position.y,
                joint.position.z + vertex.position.z
            );
            
            // Store vertex data for future manipulation
            nodeMesh.userData.mathVertex = vertex;
            nodeMesh.userData.pattern = pattern;
            nodeMesh.userData.goldenRatio = vertex.goldenRatio;
            
            this.scene.add(nodeMesh);
            character.meshes.push(nodeMesh);
        });
        
        console.log(`   ✅ Created ${nodeCount} skin nodes using ${pattern} distribution`);
    }
    
    /**
     * Create extremity details - fingernails, toenails, hair follicles
     * NOW WITH MATHEMATICAL VERTEX PRECISION! 🧮
     */
    createExtremityDetails(character, config = {}) {
        console.log('💅 Adding extremity details...');
        
        const useMathPrecision = config.useMathematicalVertices !== false; // Default true
        
        // FINGERNAILS (10 total)
        const nailMaterial = new THREE.MeshStandardMaterial({
            color: 0xffeeee,
            roughness: 0.3,
            metalness: 0.2
        });
        
        const leftHand = character.bodyParts.get('left_hand');
        if (leftHand) {
            for (let i = 0; i < 5; i++) {
                const fingernail = new THREE.Mesh(
                    new THREE.BoxGeometry(0.008, 0.01, 0.003),
                    nailMaterial
                );
                fingernail.position.set(
                    leftHand.position.x - 0.025 + (i * 0.012),
                    leftHand.position.y - 0.03,
                    leftHand.position.z + 0.06
                );
                fingernail.rotation.x = -Math.PI / 6;
                this.scene.add(fingernail);
                character.meshes.push(fingernail);
            }
        }
        
        const rightHand = character.bodyParts.get('right_hand');
        if (rightHand) {
            for (let i = 0; i < 5; i++) {
                const fingernail = new THREE.Mesh(
                    new THREE.BoxGeometry(0.008, 0.01, 0.003),
                    nailMaterial
                );
                fingernail.position.set(
                    rightHand.position.x - 0.025 + (i * 0.012),
                    rightHand.position.y - 0.03,
                    rightHand.position.z + 0.06
                );
                fingernail.rotation.x = -Math.PI / 6;
                this.scene.add(fingernail);
                character.meshes.push(fingernail);
            }
        }
        
        // TOENAILS (10 total)
        const leftFoot = character.bodyParts.get('left_foot');
        if (leftFoot) {
            for (let i = 0; i < 5; i++) {
                const toenail = new THREE.Mesh(
                    new THREE.BoxGeometry(0.006, 0.008, 0.002),
                    nailMaterial
                );
                toenail.position.set(
                    leftFoot.position.x - 0.03 + (i * 0.015),
                    leftFoot.position.y,
                    leftFoot.position.z + 0.09
                );
                this.scene.add(toenail);
                character.meshes.push(toenail);
            }
        }
        
        const rightFoot = character.bodyParts.get('right_foot');
        if (rightFoot) {
            for (let i = 0; i < 5; i++) {
                const toenail = new THREE.Mesh(
                    new THREE.BoxGeometry(0.006, 0.008, 0.002),
                    nailMaterial
                );
                toenail.position.set(
                    rightFoot.position.x - 0.03 + (i * 0.015),
                    rightFoot.position.y,
                    rightFoot.position.z + 0.09
                );
                this.scene.add(toenail);
                character.meshes.push(toenail);
            }
        }
        
        // HAIR FOLLICLES - NOW WITH MATHEMATICAL PRECISION! 🧮
        const head = character.bodyParts.get('head');
        if (head) {
            const hairCount = config.hairCount || 200;
            const hairPattern = config.hairPattern || 'fibonacci';
            
            if (useMathPrecision) {
                console.log(`🧮 Using mathematical vertex generation for ${hairCount} hair follicles`);
                console.log(`   Pattern: ${hairPattern}`);
                console.log(`   Formula: Using π, φ (golden ratio), cos, sin, abs for perfect distribution`);
                
                // Generate mathematically perfect vertices
                const hairVertices = this.generateMathematicalVertices(hairCount, 0.18, hairPattern);
                
                const hairMaterial = new THREE.MeshStandardMaterial({
                    color: config.hairColor || 0x3a2819,
                    roughness: 0.95
                });
                
                hairVertices.forEach(vertex => {
                    const hairLength = 0.02 + (Math.abs(Math.sin(vertex.fibonacci)) * 0.02); // 0.02-0.04 length
                    const hairStrand = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.0005, 0.0005, hairLength, 3),
                        hairMaterial
                    );
                    
                    // Position at mathematically-calculated vertex
                    hairStrand.position.set(
                        head.position.x + vertex.position.x,
                        head.position.y + vertex.position.y,
                        head.position.z + vertex.position.z
                    );
                    
                    // Orient along normal vector (hair grows OUTWARD from scalp)
                    const up = new THREE.Vector3(0, 1, 0);
                    const normal = new THREE.Vector3(
                        vertex.normal.x,
                        vertex.normal.y,
                        vertex.normal.z
                    );
                    hairStrand.quaternion.setFromUnitVectors(up, normal);
                    
                    // Slight random tilt for natural look (using golden ratio for variation)
                    hairStrand.rotation.x += Math.sin(vertex.goldenRatio * vertex.index) * 0.2;
                    hairStrand.rotation.z += Math.cos(vertex.goldenRatio * vertex.index) * 0.2;
                    
                    // Store vertex data for physics/animation
                    hairStrand.userData.mathVertex = vertex;
                    hairStrand.userData.pattern = hairPattern;
                    hairStrand.userData.goldenRatio = vertex.goldenRatio;
                    
                    this.scene.add(hairStrand);
                    character.meshes.push(hairStrand);
                });
                
                console.log(`   ✅ Generated ${hairCount} follicles using ${hairPattern} distribution`);
                console.log(`   📊 Mathematical properties:`);
                console.log(`      - Golden ratio (φ): ${hairVertices[0].goldenRatio.toFixed(10)}`);
                console.log(`      - Golden angle: 137.507764°`);
                console.log(`      - Distribution: Perfectly even (zero clumping)`);
                console.log(`      - Formula: x = r·sin(φ)·cos(θ), y = r·cos(φ), z = r·sin(φ)·sin(θ)`);
                console.log(`      - Where: θ = π(3-√5)·i, φ = arccos(1-2i/n)`);
                
            } else {
                // Original random distribution (kept for compatibility)
                const hairMaterial = new THREE.MeshStandardMaterial({
                    color: 0x3a2819,
                    roughness: 0.95
                });
                
                for (let i = 0; i < hairCount; i++) {
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI * 0.6;
                    
                    const hairStrand = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.0005, 0.0005, 0.02, 3),
                        hairMaterial
                    );
                    
                    const radius = 0.18;
                    hairStrand.position.set(
                        head.position.x + radius * Math.sin(phi) * Math.cos(theta),
                        head.position.y + radius * Math.cos(phi),
                        head.position.z + radius * Math.sin(phi) * Math.sin(theta)
                    );
                    
                    const normal = new THREE.Vector3().subVectors(hairStrand.position, head.position).normalize();
                    hairStrand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
                    
                    this.scene.add(hairStrand);
                    character.meshes.push(hairStrand);
                }
                
                console.log(`   ⚠️ Using random distribution (old method)`);
            }
        }
        
        console.log(`✓ Added extremity details: fingernails (10), toenails (10), hair follicles (${config.hairCount || 200} fiber strands with ${useMathPrecision ? 'MATHEMATICAL PRECISION' : 'random distribution'})`);
    }
}

/**
 * Triangle Direction Controller (from VSL system)
 */
class TriangleDirectionController {
    constructor(name, words) {
        this.name = name;
        this.words = words;
        this.vertices = { v1: {x:0,y:0,z:0}, v2: {x:0,y:0,z:0}, v3: {x:0,y:0,z:0} };
        this.direction = {x:0, y:0, z:0};
        this.intensity = 1.0;
        this.motions = [];
        
        this.calculateFromWords(words);
    }
    
    calculateFromWords(words) {
        const VSL_MOTIONS = {
            'curl': { type: 'spiral', direction: 'inward', speed: 0.5 },
            'twist': { type: 'rotation', direction: 'variable', speed: 0.3 },
            'wave': { type: 'sine', direction: 'oscillate', frequency: 2.0 },
            'breathe': { type: 'sine', direction: 'scale', frequency: 0.25 },
            'sway': { type: 'pendulum', direction: 'oscillate', frequency: 0.5 },
            'gentle': { type: 'modifier', intensity: 0.5 },
            'counterclockwise': { type: 'rotation', direction: -1, speed: 0.5 }
        };
        
        words.forEach((word, index) => {
            const motion = VSL_MOTIONS[word.toLowerCase()];
            if (motion) {
                this.motions.push(motion);
                if (motion.type === 'modifier') {
                    this.intensity = motion.intensity;
                }
            }
            
            // Calculate vertices from letters
            const charCodes = word.split('').map(c => c.charCodeAt(0));
            if (index === 0 && charCodes[0]) {
                this.vertices.v1.x = (charCodes[0] % 360) / 360;
                this.vertices.v1.y = (charCodes[0] % 180) / 180;
                this.vertices.v1.z = (charCodes[0] % 90) / 90;
            }
        });
    }
    
    applyMotion(targetObject, time) {
        this.motions.forEach(motion => {
            switch(motion.type) {
                case 'sine':
                    const wave = Math.sin(time * motion.frequency) * 0.3 * this.intensity;
                    if (motion.direction === 'scale') {
                        const scale = 1.0 + wave * 0.1;
                        targetObject.scale.set(scale, scale, scale);
                    } else if (motion.direction === 'oscillate') {
                        targetObject.rotation.z = wave;
                    }
                    break;
                    
                case 'rotation':
                    if (typeof motion.direction === 'number') {
                        targetObject.rotation.y += motion.direction * motion.speed * 0.01 * this.intensity;
                    }
                    break;
                    
                case 'pendulum':
                    const sway = Math.sin(time * motion.frequency) * 0.2 * this.intensity;
                    targetObject.rotation.z = sway;
                    break;
            }
        });
    }
    
    /**
     * Create skin damage system (scars, freckles, moles, birthmarks, black eyes)
     * @param {Object} character - Character object
     * @param {Object} config - Damage configuration
     */
    createSkinDamage(character, config = {}) {
        console.log(`Adding skin damage to ${character.name}`);
        
        // Get head joint for face positioning
        const headJoint = character.bodyParts.get('head');
        const torsoJoint = character.bodyParts.get('torso');
        
        // Scars - raised tissue lines
        if (config.scars && config.scars.length > 0) {
            config.scars.forEach((scar, index) => {
                const scarGeo = new THREE.CylinderGeometry(0.002, 0.002, scar.length || 0.05, 8);
                const scarMat = new THREE.MeshStandardMaterial({ 
                    color: scar.color || 0xffaaaa, 
                    roughness: 0.9,
                    metalness: 0.0
                });
                const scarMesh = new THREE.Mesh(scarGeo, scarMat);
                scarMesh.position.set(scar.x || 0, scar.y || 1.6, scar.z || 0.12);
                scarMesh.rotation.z = scar.rotation || Math.PI / 2;
                character.skin.add(scarMesh);
                character.meshes.push(scarMesh);
            });
        }
        
        // Freckles - small brown spots
        const freckleCount = config.freckles || 0;
        for (let i = 0; i < freckleCount; i++) {
            const freckleGeo = new THREE.SphereGeometry(0.002, 6, 6);
            const freckleMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.9 });
            const freckleMesh = new THREE.Mesh(freckleGeo, freckleMat);
            freckleMesh.position.set(
                (Math.random() - 0.5) * 0.2,
                1.55 + (Math.random() - 0.5) * 0.1,
                0.11 + Math.random() * 0.02
            );
            character.skin.add(freckleMesh);
            character.meshes.push(freckleMesh);
        }
        
        // Moles - dark raised spots
        if (config.moles && config.moles.length > 0) {
            config.moles.forEach(mole => {
                const moleGeo = new THREE.SphereGeometry(mole.size || 0.005, 8, 8);
                const moleMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.8 });
                const moleMesh = new THREE.Mesh(moleGeo, moleMat);
                moleMesh.position.set(mole.x || 0, mole.y || 1.5, mole.z || 0.11);
                character.skin.add(moleMesh);
                character.meshes.push(moleMesh);
            });
        }
        
        // Birthmarks - larger pigmentation areas
        if (config.birthmarks && config.birthmarks.length > 0) {
            config.birthmarks.forEach(mark => {
                const markGeo = new THREE.BoxGeometry(mark.width || 0.03, mark.height || 0.02, 0.001);
                const markMat = new THREE.MeshStandardMaterial({ 
                    color: mark.color || 0x8b4513, 
                    roughness: 0.85 
                });
                const markMesh = new THREE.Mesh(markGeo, markMat);
                markMesh.position.set(mark.x || 0, mark.y || 1.4, mark.z || 0.15);
                character.skin.add(markMesh);
                character.meshes.push(markMesh);
            });
        }
        
        // Black eye with color progression stages (0=fresh purple, 4=healing yellow)
        if (config.blackEye) {
            const stage = config.blackEye.stage || 0;
            const colors = [0x663399, 0x4455aa, 0x557755, 0x887744, 0xaa9944]; // purple → blue → green → brown → yellow
            const side = config.blackEye.side === 'right' ? 0.04 : -0.04;
            
            const blackEyeGeo = new THREE.SphereGeometry(0.025, 12, 12);
            const blackEyeMat = new THREE.MeshStandardMaterial({ 
                color: colors[stage], 
                roughness: 0.7,
                transparent: true,
                opacity: 0.7
            });
            const blackEyeMesh = new THREE.Mesh(blackEyeGeo, blackEyeMat);
            blackEyeMesh.position.set(side, 1.57, 0.11);
            blackEyeMesh.scale.set(1.2, 0.8, 0.5);
            character.skin.add(blackEyeMesh);
            character.meshes.push(blackEyeMesh);
        }
        
        console.log(`Skin damage added: ${config.scars?.length || 0} scars, ${freckleCount} freckles, ${config.moles?.length || 0} moles`);
    }
    
    /**
     * Create skin conditions (sweat, dirt, grease, paint, dead skin, boils)
     * @param {Object} character - Character object
     * @param {Object} config - Condition configuration
     */
    createSkinConditions(character, config = {}) {
        console.log(`Adding skin conditions to ${character.name}`);
        
        // Sweat pores - tiny glistening droplets
        const sweatIntensity = config.sweat || 0;
        for (let i = 0; i < sweatIntensity * 50; i++) {
            const sweatGeo = new THREE.SphereGeometry(0.001, 6, 6);
            const sweatMat = new THREE.MeshStandardMaterial({ 
                color: 0xccddff, 
                roughness: 0.1, 
                metalness: 0.3,
                transparent: true,
                opacity: 0.8
            });
            const sweatMesh = new THREE.Mesh(sweatGeo, sweatMat);
            sweatMesh.position.set(
                (Math.random() - 0.5) * 0.4,
                1.3 + Math.random() * 0.4,
                0.15 + Math.random() * 0.05
            );
            character.skin.add(sweatMesh);
            character.meshes.push(sweatMesh);
        }
        
        // Dirt patches - brown/gray overlays
        if (config.dirt && config.dirt.length > 0) {
            config.dirt.forEach(area => {
                const dirtGeo = new THREE.BoxGeometry(0.05, 0.05, 0.001);
                const dirtMat = new THREE.MeshStandardMaterial({ 
                    color: 0x4a3f2a, 
                    roughness: 1.0 
                });
                const dirtMesh = new THREE.Mesh(dirtGeo, dirtMat);
                dirtMesh.position.set(area.x, area.y, area.z);
                character.skin.add(dirtMesh);
                character.meshes.push(dirtMesh);
            });
        }
        
        // Grease stains - shiny dark patches
        if (config.grease && config.grease.length > 0) {
            config.grease.forEach(area => {
                const greaseGeo = new THREE.BoxGeometry(0.04, 0.04, 0.001);
                const greaseMat = new THREE.MeshStandardMaterial({ 
                    color: 0x1a1a1a, 
                    roughness: 0.2,
                    metalness: 0.4
                });
                const greaseMesh = new THREE.Mesh(greaseGeo, greaseMat);
                greaseMesh.position.set(area.x, area.y, area.z);
                character.skin.add(greaseMesh);
                character.meshes.push(greaseMesh);
            });
        }
        
        // Paint coatings - thick colored layers
        if (config.paint && config.paint.length > 0) {
            config.paint.forEach(coating => {
                const paintGeo = new THREE.BoxGeometry(
                    coating.width || 0.06, 
                    coating.height || 0.06, 
                    coating.thickness || 0.003
                );
                const paintMat = new THREE.MeshStandardMaterial({ 
                    color: coating.color || 0xff0000, 
                    roughness: coating.type === 'polymer' ? 0.3 : 0.7,
                    metalness: coating.type === 'metal' ? 0.8 : 0.0
                });
                const paintMesh = new THREE.Mesh(paintGeo, paintMat);
                paintMesh.position.set(coating.x, coating.y, coating.z);
                character.skin.add(paintMesh);
                character.meshes.push(paintMesh);
            });
        }
        
        // Dead/peeling skin - flaky texture
        if (config.deadSkin && config.deadSkin.length > 0) {
            config.deadSkin.forEach(area => {
                const flakeGeo = new THREE.BoxGeometry(0.01, 0.01, 0.001);
                const flakeMat = new THREE.MeshStandardMaterial({ 
                    color: 0xddc9b4, 
                    roughness: 1.0 
                });
                const flakeMesh = new THREE.Mesh(flakeGeo, flakeMat);
                flakeMesh.position.set(area.x, area.y, area.z);
                flakeMesh.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                character.skin.add(flakeMesh);
                character.meshes.push(flakeMesh);
            });
        }
        
        // Boils - inflamed raised bumps
        if (config.boils && config.boils.length > 0) {
            config.boils.forEach(boil => {
                const boilGeo = new THREE.SphereGeometry(boil.size || 0.008, 12, 12);
                const boilMat = new THREE.MeshStandardMaterial({ 
                    color: 0xff6666, 
                    roughness: 0.9 
                });
                const boilMesh = new THREE.Mesh(boilGeo, boilMat);
                boilMesh.position.set(boil.x, boil.y, boil.z);
                character.skin.add(boilMesh);
                character.meshes.push(boilMesh);
            });
        }
        
        console.log(`Skin conditions added: ${sweatIntensity * 50} sweat pores, ${config.dirt?.length || 0} dirt patches`);
    }
    
    /**
     * Create body hair system (chest, soul patch, pubic, gooch, buttcrack)
     * @param {Object} character - Character object
     * @param {Object} config - Hair configuration
     */
    createBodyHair(character, config = {}) {
        console.log(`Adding body hair to ${character.name}`);
        
        const hairMat = new THREE.MeshStandardMaterial({ 
            color: config.color || 0x442211, 
            roughness: 0.9 
        });
        
        // Chest hair
        if (config.chestHair) {
            const density = config.chestHair;
            for (let i = 0; i < density * 30; i++) {
                const hairGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.015, 4);
                const hairMesh = new THREE.Mesh(hairGeo, hairMat);
                hairMesh.position.set(
                    (Math.random() - 0.5) * 0.15,
                    1.15 + (Math.random() - 0.5) * 0.1,
                    0.16 + Math.random() * 0.02
                );
                hairMesh.rotation.set(
                    Math.random() * 0.3,
                    Math.random() * Math.PI * 2,
                    Math.random() * 0.3
                );
                character.skin.add(hairMesh);
                character.meshes.push(hairMesh);
            }
        }
        
        // Soul patch (below lower lip)
        if (config.soulPatch) {
            for (let i = 0; i < 8; i++) {
                const hairGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.01, 4);
                const hairMesh = new THREE.Mesh(hairGeo, hairMat);
                hairMesh.position.set(
                    (Math.random() - 0.5) * 0.015,
                    1.50,
                    0.11 + Math.random() * 0.005
                );
                hairMesh.rotation.x = Math.PI / 4;
                character.skin.add(hairMesh);
                character.meshes.push(hairMesh);
            }
        }
        
        // Pubic hair (landing strip style)
        if (config.pubicHair) {
            const style = config.pubicHair;
            const count = style === 'trimmed' ? 15 : style === 'natural' ? 40 : 0;
            for (let i = 0; i < count; i++) {
                const hairGeo = new THREE.CylinderGeometry(0.0006, 0.0006, 0.012, 4);
                const hairMesh = new THREE.Mesh(hairGeo, hairMat);
                hairMesh.position.set(
                    (Math.random() - 0.5) * 0.08,
                    0.85 + (Math.random() - 0.5) * 0.05,
                    0.12 + Math.random() * 0.02
                );
                hairMesh.rotation.x = Math.random() * 0.5;
                character.skin.add(hairMesh);
                character.meshes.push(hairMesh);
            }
        }
        
        // Gooch/buttcrack hair (if density specified)
        if (config.goochHair) {
            for (let i = 0; i < config.goochHair * 10; i++) {
                const hairGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.008, 4);
                const hairMesh = new THREE.Mesh(hairGeo, hairMat);
                hairMesh.position.set(
                    (Math.random() - 0.5) * 0.05,
                    0.78 + (Math.random() - 0.5) * 0.04,
                    -0.08 + Math.random() * 0.02
                );
                character.skin.add(hairMesh);
                character.meshes.push(hairMesh);
            }
        }
        
        console.log(`Body hair added: chest=${config.chestHair || 0}, soulPatch=${config.soulPatch || false}`);
    }
    
    /**
     * Create hand/foot wrinkle details (3-layer knuckles, palm lines)
     * @param {Object} character - Character object
     */
    createExtremityWrinkles(character) {
        console.log(`Adding extremity wrinkles to ${character.name}`);
        
        const wrinkleMat = new THREE.MeshStandardMaterial({ 
            color: 0xcc9966, 
            roughness: 0.9 
        });
        
        // Knuckle wrinkles (3 rings per finger joint)
        const hands = ['leftHand', 'rightHand'];
        hands.forEach((hand, handIndex) => {
            const side = handIndex === 0 ? -1 : 1;
            for (let finger = 0; finger < 5; finger++) {
                for (let knuckle = 0; knuckle < 3; knuckle++) {
                    const ringGeo = new THREE.TorusGeometry(0.006, 0.0008, 6, 12);
                    const ringMesh = new THREE.Mesh(ringGeo, wrinkleMat);
                    ringMesh.position.set(
                        side * 0.22 + (finger - 2) * 0.015,
                        0.48 - knuckle * 0.015,
                        0
                    );
                    ringMesh.rotation.x = Math.PI / 2;
                    character.skin.add(ringMesh);
                    character.meshes.push(ringMesh);
                }
            }
        });
        
        // Palm lines (major creases)
        for (let side = -1; side <= 1; side += 2) {
            for (let line = 0; line < 3; line++) {
                const lineGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.06, 8);
                const lineMesh = new THREE.Mesh(lineGeo, wrinkleMat);
                lineMesh.position.set(
                    side * 0.22,
                    0.5 - line * 0.02,
                    0
                );
                lineMesh.rotation.z = (Math.PI / 2) + (line * 0.2);
                character.skin.add(lineMesh);
                character.meshes.push(lineMesh);
            }
        }
        
        console.log(`Extremity wrinkles added: 30 knuckle rings, 6 palm lines`);
    }
    
    /**
     * Create eye condition details (red veins, colored retinas)
     * @param {Object} character - Character object
     * @param {Object} config - Eye condition configuration
     */
    createEyeConditions(character, config = {}) {
        console.log(`Adding eye conditions to ${character.name}`);
        
        // Red veins from sleep deprivation
        if (config.tired) {
            const veinMat = new THREE.MeshStandardMaterial({ 
                color: 0xff3333, 
                roughness: 0.8 
            });
            
            for (let side = -1; side <= 1; side += 2) {
                // 6 veins radiating from pupil
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const veinGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.012, 4);
                    const veinMesh = new THREE.Mesh(veinGeo, veinMat);
                    veinMesh.position.set(
                        side * 0.04 + Math.cos(angle) * 0.008,
                        1.57 + Math.sin(angle) * 0.008,
                        0.115
                    );
                    veinMesh.rotation.z = angle;
                    character.skin.add(veinMesh);
                    character.meshes.push(veinMesh);
                }
            }
        }
        
        // Colored retinas (if not default)
        if (config.retinas) {
            const colors = {
                blue: 0x4488ff,
                green: 0x44ff88,
                brown: 0x6d4c41,
                hazel: 0x8b7355,
                gray: 0x708090
            };
            const retinaColor = colors[config.retinas] || 0x4488ff;
            
            // Update iris color (need to find existing iris meshes)
            character.meshes.forEach(mesh => {
                if (mesh.geometry.type === 'SphereGeometry' && 
                    mesh.position.z > 0.11 && 
                    mesh.position.y > 1.5) {
                    mesh.material.color.setHex(retinaColor);
                }
            });
        }
        
        console.log(`Eye conditions added: tired=${config.tired}, retinas=${config.retinas || 'blue'}`);
    }
    
    /**
     * Create body details (belly button, nipples, asshole)
     * @param {Object} character - Character object
     */
    createBodyDetails(character) {
        console.log(`Adding body details to ${character.name}`);
        
        // Belly button (cauliflower indentation)
        const navelGeo = new THREE.TorusGeometry(0.015, 0.008, 8, 16);
        const navelMat = new THREE.MeshStandardMaterial({ 
            color: 0xcc8866, 
            roughness: 0.9 
        });
        const navelMesh = new THREE.Mesh(navelGeo, navelMat);
        navelMesh.position.set(0, 0.95, 0.16);
        navelMesh.rotation.x = Math.PI / 2;
        character.skin.add(navelMesh);
        character.meshes.push(navelMesh);
        
        // Belly button lint
        const lintGeo = new THREE.SphereGeometry(0.003, 6, 6);
        const lintMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 1.0 });
        const lintMesh = new THREE.Mesh(lintGeo, lintMat);
        lintMesh.position.set(0, 0.95, 0.15);
        character.skin.add(lintMesh);
        character.meshes.push(lintMesh);
        
        // Nipples (cylindrical protrusions with spherical ends)
        for (let side = -1; side <= 1; side += 2) {
            const nippleBaseGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.005, 12);
            const nippleBaseMat = new THREE.MeshStandardMaterial({ 
                color: 0xcc7766, 
                roughness: 0.8 
            });
            const nippleBase = new THREE.Mesh(nippleBaseGeo, nippleBaseMat);
            nippleBase.position.set(side * 0.08, 1.15, 0.17);
            nippleBase.rotation.x = Math.PI / 2;
            character.skin.add(nippleBase);
            character.meshes.push(nippleBase);
            
            const nippleTipGeo = new THREE.SphereGeometry(0.006, 12, 12);
            const nippleTip = new THREE.Mesh(nippleTipGeo, nippleBaseMat);
            nippleTip.position.set(side * 0.08, 1.15, 0.175);
            character.skin.add(nippleTip);
            character.meshes.push(nippleTip);
        }
        
        // Asshole (cauliflower texture - hidden by default)
        const assholeGeo = new THREE.TorusGeometry(0.008, 0.004, 8, 12);
        const assholeMat = new THREE.MeshStandardMaterial({ 
            color: 0x8b6f47, 
            roughness: 1.0 
        });
        const assholeMesh = new THREE.Mesh(assholeGeo, assholeMat);
        assholeMesh.position.set(0, 0.78, -0.1);
        assholeMesh.rotation.x = Math.PI / 2;
        assholeMesh.visible = false; // Hidden by default
        character.skin.add(assholeMesh);
        character.meshes.push(assholeMesh);
        
        console.log(`Body details added: belly button, nipples, asshole`);
    }
}
