/**
 * PHOTOREALISTIC 4K BUILDING SYSTEM
 * Reference: Modern college building with glass curtain walls, dramatic lighting
 * 
 * Features matching the reference image:
 * - Floor-to-ceiling glass curtain walls
 * - Dramatic interior lighting visible through glass
 * - Grand entrance stairs with handrails
 * - Large structural pillars supporting overhangs
 * - Mixed materials (brick, stone panels, glass)
 * - Architectural lighting (step lights, soffit lights)
 * - PBR materials for photorealistic rendering
 */

class PhotorealisticBuildingSystem {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.buildings = [];
        this.placedBuildings = [];
        
        // Enable high-quality rendering for photorealism
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.init();
    }

    init() {
        this.setupLighting();
        this.loadFromStorage();
        this.setupControls();
    }

    setupLighting() {
        // Sunset/dusk lighting to match reference image
        const ambientLight = new THREE.AmbientLight(0x5566aa, 0.3); // Cool blue ambient
        this.scene.add(ambientLight);

        // Main sun (low angle, sunset)
        const sunLight = new THREE.DirectionalLight(0xffaa77, 1.5);
        sunLight.position.set(100, 50, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        this.scene.add(sunLight);

        // Evening sky light
        const skyLight = new THREE.HemisphereLight(0x4466bb, 0x332211, 0.6);
        this.scene.add(skyLight);
    }

    createPhotorealisticBuilding(template, position) {
        const group = new THREE.Group();
        group.position.copy(position);

        // Create materials library
        const materials = this.createMaterialsLibrary();

        // 1. FOUNDATION & BASE PLAZA (like in reference)
        this.addFoundationPlaza(group, template, materials);

        // 2. MAIN STRUCTURE with mixed materials
        this.addMainStructure(group, template, materials);

        // 3. GLASS CURTAIN WALLS (floor-to-ceiling)
        this.addGlassCurtainWalls(group, template, materials);

        // 4. GRAND ENTRANCE STAIRS with handrails
        this.addGrandStairs(group, template, materials);

        // 5. LARGE STRUCTURAL PILLARS
        this.addStructuralPillars(group, template, materials);

        // 6. DRAMATIC INTERIOR LIGHTING
        this.addInteriorLighting(group, template);

        // 7. ARCHITECTURAL LIGHTING (step lights, soffit lights)
        this.addArchitecturalLighting(group, template);

        // 8. ROOF with modern details
        this.addModernRoof(group, template, materials);

        group.userData = {
            buildingType: template.name,
            template: template
        };

        return group;
    }

    createMaterialsLibrary() {
        return {
            // BRICK TEXTURE (dark grey like in reference)
            darkBrick: new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.9,
                metalness: 0.0,
                map: this.createBrickTexture(0x3a3a3a),
                normalMap: this.createBrickNormalMap(),
                normalScale: new THREE.Vector2(0.5, 0.5)
            }),

            // LIGHT STONE PANELS (cream/tan like in reference)
            stonePanel: new THREE.MeshStandardMaterial({
                color: 0xd4c4a8,
                roughness: 0.4,
                metalness: 0.0,
                map: this.createStonePanelTexture()
            }),

            // GLASS CURTAIN WALL (highly reflective, slightly tinted)
            curtainGlass: new THREE.MeshPhysicalMaterial({
                color: 0xaaccee,
                roughness: 0.05,
                metalness: 0.0,
                transmission: 0.85,
                thickness: 1.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05,
                transparent: true,
                opacity: 0.4,
                reflectivity: 0.95,
                ior: 1.52, // Glass IOR
                envMapIntensity: 1.5
            }),

            // DARK METAL FRAMING (pillars, window frames)
            darkMetal: new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.3,
                metalness: 0.9,
                envMapIntensity: 1.0
            }),

            // CONCRETE (smooth modern finish)
            smoothConcrete: new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.5,
                metalness: 0.0,
                map: this.createConcreteTexture()
            }),

            // METAL HANDRAILS
            brushedMetal: new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.4,
                metalness: 0.95
            })
        };
    }

    createBrickTexture(baseColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base brick color
        ctx.fillStyle = `#${baseColor.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, 512, 512);

        // Individual bricks with mortar
        const brickWidth = 64;
        const brickHeight = 24;
        const mortarSize = 2;

        for (let y = 0; y < 512; y += brickHeight + mortarSize) {
            for (let x = 0; x < 512; x += brickWidth + mortarSize) {
                // Offset every other row
                const offsetX = (Math.floor(y / (brickHeight + mortarSize)) % 2) * (brickWidth / 2);
                
                // Brick variation
                const variation = Math.random() * 20 - 10;
                const r = Math.min(255, Math.max(0, (baseColor >> 16 & 255) + variation));
                const g = Math.min(255, Math.max(0, (baseColor >> 8 & 255) + variation));
                const b = Math.min(255, Math.max(0, (baseColor & 255) + variation));
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x + offsetX, y, brickWidth, brickHeight);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }

    createBrickNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#8080ff'; // Neutral normal
        ctx.fillRect(0, 0, 512, 512);

        // Brick depth lines
        const brickWidth = 64;
        const brickHeight = 24;
        const mortarSize = 2;

        ctx.strokeStyle = '#6060a0';
        ctx.lineWidth = 2;

        for (let y = 0; y < 512; y += brickHeight + mortarSize) {
            for (let x = 0; x < 512; x += brickWidth + mortarSize) {
                const offsetX = (Math.floor(y / (brickHeight + mortarSize)) % 2) * (brickWidth / 2);
                ctx.strokeRect(x + offsetX, y, brickWidth, brickHeight);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }

    createStonePanelTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base stone color
        ctx.fillStyle = '#d4c4a8';
        ctx.fillRect(0, 0, 512, 512);

        // Stone variation and subtle veining
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3 + 1;
            
            ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${170 + Math.random() * 40}, ${140 + Math.random() * 40}, 0.3)`;
            ctx.fillRect(x, y, size, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    createConcreteTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, 512, 512);

        // Concrete aggregate texture
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2;
            
            ctx.fillStyle = `rgba(${Math.random() * 50 + 180}, ${Math.random() * 50 + 180}, ${Math.random() * 50 + 180}, 0.5)`;
            ctx.fillRect(x, y, size, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 6);
        return texture;
    }

    addFoundationPlaza(group, template, materials) {
        // Large plaza foundation like in reference
        const plazaWidth = template.width + 20;
        const plazaDepth = template.depth + 15;
        
        const plaza = new THREE.Mesh(
            new THREE.BoxGeometry(plazaWidth, 0.5, plazaDepth),
            materials.smoothConcrete
        );
        plaza.position.y = -0.25;
        plaza.receiveShadow = true;
        plaza.castShadow = true;
        group.add(plaza);
    }

    addMainStructure(group, template, materials) {
        const floors = template.floors || 3;
        const floorHeight = template.height / floors;

        // Mix of brick and stone panels (like reference)
        for (let floor = 0; floor < floors; floor++) {
            const isTopFloor = floor === floors - 1;
            const material = (floor % 2 === 0) ? materials.darkBrick : materials.stonePanel;

            // Solid sections between glass (not full walls)
            const solidSectionWidth = template.width * 0.15; // Side sections

            // Left section
            const leftSection = new THREE.Mesh(
                new THREE.BoxGeometry(solidSectionWidth, floorHeight, template.depth),
                material
            );
            leftSection.position.set(-template.width / 2 + solidSectionWidth / 2, floorHeight / 2 + floor * floorHeight, 0);
            leftSection.castShadow = true;
            leftSection.receiveShadow = true;
            group.add(leftSection);

            // Right section
            const rightSection = new THREE.Mesh(
                new THREE.BoxGeometry(solidSectionWidth, floorHeight, template.depth),
                material
            );
            rightSection.position.set(template.width / 2 - solidSectionWidth / 2, floorHeight / 2 + floor * floorHeight, 0);
            rightSection.castShadow = true;
            rightSection.receiveShadow = true;
            group.add(rightSection);

            // Back wall (solid)
            const backWall = new THREE.Mesh(
                new THREE.BoxGeometry(template.width, floorHeight, template.depth * 0.1),
                material
            );
            backWall.position.set(0, floorHeight / 2 + floor * floorHeight, -template.depth / 2 + template.depth * 0.05);
            backWall.castShadow = true;
            backWall.receiveShadow = true;
            group.add(backWall);
        }
    }

    addGlassCurtainWalls(group, template, materials) {
        const floors = template.floors || 3;
        const floorHeight = template.height / floors;
        const glassWidth = template.width * 0.6; // Center glass section

        for (let floor = 0; floor < floors; floor++) {
            // Floor-to-ceiling glass panels
            const glassPanel = new THREE.Mesh(
                new THREE.BoxGeometry(glassWidth, floorHeight - 0.3, 0.15),
                materials.curtainGlass
            );
            glassPanel.position.set(0, floorHeight / 2 + floor * floorHeight, template.depth / 2 - 0.5);
            glassPanel.castShadow = false;
            glassPanel.receiveShadow = true;
            group.add(glassPanel);

            // Dark metal frame dividers (vertical)
            const frameDividers = 5;
            for (let i = 0; i <= frameDividers; i++) {
                const frameX = -glassWidth / 2 + (i * glassWidth / frameDividers);
                const verticalFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, floorHeight, 0.2),
                    materials.darkMetal
                );
                verticalFrame.position.set(frameX, floorHeight / 2 + floor * floorHeight, template.depth / 2 - 0.5);
                verticalFrame.castShadow = true;
                group.add(verticalFrame);
            }

            // Horizontal frame dividers
            const horizontalFrame = new THREE.Mesh(
                new THREE.BoxGeometry(glassWidth, 0.3, 0.2),
                materials.darkMetal
            );
            horizontalFrame.position.set(0, floor * floorHeight, template.depth / 2 - 0.5);
            horizontalFrame.castShadow = true;
            group.add(horizontalFrame);
        }
    }

    addGrandStairs(group, template, materials) {
        const stairWidth = template.width * 0.5;
        const numSteps = 12;
        const stepHeight = 0.18;
        const stepDepth = 0.35;

        for (let i = 0; i < numSteps; i++) {
            // Each step
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth),
                materials.smoothConcrete
            );
            step.position.set(
                0,
                i * stepHeight,
                template.depth / 2 + 2 + i * stepDepth
            );
            step.castShadow = true;
            step.receiveShadow = true;
            group.add(step);

            // Step lighting (LED strips)
            if (i > 0) {
                const stepLight = new THREE.PointLight(0xffffdd, 0.5, 3);
                stepLight.position.set(0, i * stepHeight - 0.05, template.depth / 2 + 2 + i * stepDepth);
                stepLight.castShadow = true;
                group.add(stepLight);
            }
        }

        // Metal handrails on both sides
        const handrailHeight = numSteps * stepHeight;
        const handrailDepth = numSteps * stepDepth;

        for (let side = -1; side <= 1; side += 2) {
            // Main handrail post
            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, handrailHeight + 1, 16),
                materials.brushedMetal
            );
            post.position.set(
                side * stairWidth / 2,
                handrailHeight / 2,
                template.depth / 2 + 2 + handrailDepth / 2
            );
            post.castShadow = true;
            group.add(post);

            // Top rail
            const rail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, handrailDepth, 16),
                materials.brushedMetal
            );
            rail.rotation.x = Math.PI / 2;
            rail.position.set(
                side * stairWidth / 2,
                handrailHeight,
                template.depth / 2 + 2 + handrailDepth / 2
            );
            rail.castShadow = true;
            group.add(rail);

            // Vertical balusters
            for (let b = 0; b < numSteps; b += 2) {
                const baluster = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, handrailHeight - (b * stepHeight), 8),
                    materials.brushedMetal
                );
                baluster.position.set(
                    side * stairWidth / 2,
                    (handrailHeight - (b * stepHeight)) / 2 + (b * stepHeight),
                    template.depth / 2 + 2 + b * stepDepth
                );
                baluster.castShadow = true;
                group.add(baluster);
            }
        }
    }

    addStructuralPillars(group, template, materials) {
        // Large dark pillars like in reference image
        const pillarPositions = [
            { x: -template.width * 0.35, z: template.depth / 2 + 1 },
            { x: -template.width * 0.15, z: template.depth / 2 + 1 },
            { x: template.width * 0.15, z: template.depth / 2 + 1 },
            { x: template.width * 0.35, z: template.depth / 2 + 1 }
        ];

        pillarPositions.forEach(pos => {
            // Main structural pillar
            const pillar = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, template.height, 1.2),
                materials.darkMetal
            );
            pillar.position.set(pos.x, template.height / 2, pos.z);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            group.add(pillar);

            // Capital at top
            const capital = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.5, 1.5),
                materials.darkMetal
            );
            capital.position.set(pos.x, template.height, pos.z);
            capital.castShadow = true;
            group.add(capital);

            // Base at bottom
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.5, 1.5),
                materials.darkMetal
            );
            base.position.set(pos.x, 0, pos.z);
            base.castShadow = true;
            group.add(base);
        });
    }

    addInteriorLighting(group, template) {
        // Warm interior lighting visible through glass (like reference at dusk)
        const floors = template.floors || 3;
        const floorHeight = template.height / floors;

        for (let floor = 0; floor < floors; floor++) {
            // Multiple interior lights per floor
            for (let i = -2; i <= 2; i++) {
                const interiorLight = new THREE.PointLight(0xffeecc, 2.0, 15);
                interiorLight.position.set(
                    i * 8,
                    floorHeight / 2 + floor * floorHeight,
                    0
                );
                interiorLight.castShadow = true;
                interiorLight.shadow.mapSize.width = 1024;
                interiorLight.shadow.mapSize.height = 1024;
                group.add(interiorLight);

                // Light glow effect (visible sprite)
                const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffee,
                    transparent: true,
                    opacity: 0.8
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.copy(interiorLight.position);
                group.add(glow);
            }
        }
    }

    addArchitecturalLighting(group, template, materials) {
        // Soffit lighting under overhang (like in reference)
        const overhangY = template.height;
        const overhangZ = template.depth / 2 + 3;
        
        for (let x = -template.width / 2; x <= template.width / 2; x += 3) {
            const soffit = new THREE.PointLight(0xffeeaa, 1.0, 5);
            soffit.position.set(x, overhangY - 0.5, overhangZ);
            group.add(soffit);
        }

        // Ground uplighting on pillars
        const pillarPositions = [
            -template.width * 0.35,
            -template.width * 0.15,
            template.width * 0.15,
            template.width * 0.35
        ];

        pillarPositions.forEach(x => {
            const uplight = new THREE.SpotLight(0xaaccff, 1.5, 20, Math.PI / 6, 0.5);
            uplight.position.set(x, 0.1, template.depth / 2 + 1);
            uplight.target.position.set(x, template.height, template.depth / 2 + 1);
            uplight.castShadow = true;
            group.add(uplight);
            group.add(uplight.target);
        });
    }

    addModernRoof(group, template, materials) {
        // Flat modern roof with overhang
        const roofWidth = template.width + 4;
        const roofDepth = template.depth + 6;
        
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(roofWidth, 0.8, roofDepth),
            materials.darkMetal
        );
        roof.position.set(0, template.height + 0.4, 0);
        roof.castShadow = true;
        roof.receiveShadow = true;
        group.add(roof);

        // Rooftop parapet (low wall around roof edge)
        const parapetHeight = 1.5;
        const parapetThickness = 0.3;
        
        // Front parapet
        const frontParapet = new THREE.Mesh(
            new THREE.BoxGeometry(roofWidth, parapetHeight, parapetThickness),
            materials.smoothConcrete
        );
        frontParapet.position.set(0, template.height + parapetHeight / 2, roofDepth / 2);
        frontParapet.castShadow = true;
        group.add(frontParapet);

        // Back parapet
        const backParapet = new THREE.Mesh(
            new THREE.BoxGeometry(roofWidth, parapetHeight, parapetThickness),
            materials.smoothConcrete
        );
        backParapet.position.set(0, template.height + parapetHeight / 2, -roofDepth / 2);
        backParapet.castShadow = true;
        group.add(backParapet);
    }

    setupControls() {
        // Press 'P' for Photorealistic building placement mode
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'p') {
                this.openBuildingCatalog();
            }
        });
    }

    openBuildingCatalog() {
        // Modern building template matching reference
        const modernBuilding = {
            name: "Modern Academic Building",
            width: 60,
            depth: 40,
            height: 30,
            floors: 3,
            color: 0x3a3a3a,
            features: ['glass_curtain_wall', 'grand_stairs', 'structural_pillars', 'architectural_lighting'],
            description: "Photorealistic modern college building with glass facade, dramatic lighting, and grand entrance"
        };

        // Place building at center
        const building = this.createPhotorealisticBuilding(modernBuilding, new THREE.Vector3(0, 0, 0));
        this.scene.add(building);
        this.placedBuildings.push({
            building: building,
            template: modernBuilding,
            position: { x: 0, y: 0, z: 0 }
        });

        console.log('🏛️ Photorealistic building placed! Use WASD to explore.');
    }

    saveToStorage() {
        const data = this.placedBuildings.map(pb => ({
            template: pb.template,
            position: pb.position
        }));
        localStorage.setItem('photorealistic_buildings', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('photorealistic_buildings');
        if (saved) {
            const data = JSON.parse(saved);
            data.forEach(item => {
                const building = this.createPhotorealisticBuilding(
                    item.template,
                    new THREE.Vector3(item.position.x, item.position.y, item.position.z)
                );
                this.scene.add(building);
                this.placedBuildings.push({
                    building: building,
                    template: item.template,
                    position: item.position
                });
            });
        }
    }
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotorealisticBuildingSystem;
}
