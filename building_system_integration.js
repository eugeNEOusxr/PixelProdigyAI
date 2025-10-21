/**
 * Building System Integration for PixelVerse
 * Adds college building library with persistence (localStorage)
 * 
 * Features:
 * - Press 'C' to open Building Catalog
 * - Click to place buildings in the world
 * - Auto-save/load building positions
 * - Delete mode for removing buildings
 */

class BuildingSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.buildings = [];
        this.placedBuildings = [];
        this.isPlacementMode = false;
        this.selectedBuildingType = null;
        this.previewBuilding = null;
        this.catalogOpen = false;
        
        // Building Templates from college_building_library.html
        this.buildingTemplates = {
            library: {
                name: "Library",
                width: 50, depth: 40, height: 30,
                floors: 3,
                color: 0xd4a574,
                features: ['columns', 'large_windows', 'entrance_steps', 'roof_detail', 'interior', 'library_furniture'],
                icon: '📚',
                category: 'Academic'
            },
            science: {
                name: "Science Lab",
                width: 45, depth: 45, height: 35,
                floors: 3,
                color: 0xb8b8b8,
                features: ['modern_facade', 'lab_windows', 'ventilation', 'interior', 'lab_furniture'],
                icon: '🔬',
                category: 'Academic'
            },
            lecture: {
                name: "Lecture Hall",
                width: 60, depth: 40, height: 25,
                floors: 2,
                color: 0xc19a6b,
                features: ['amphitheater_design', 'large_entrance', 'tiered_interior', 'interior', 'classroom_furniture'],
                icon: '🎓',
                category: 'Academic'
            },
            computer: {
                name: "Computer Lab",
                width: 45, depth: 30, height: 18,
                floors: 2,
                color: 0x9e9e9e,
                features: ['modern_tech', 'glass_facade', 'server_room', 'interior', 'computer_furniture'],
                icon: '💻',
                category: 'Academic'
            },
            admin: {
                name: "Admin Center",
                width: 38, depth: 28, height: 28,
                floors: 3,
                color: 0xdab894,
                features: ['formal_entrance', 'columns', 'executive_design', 'interior', 'office_furniture'],
                icon: '🏢',
                category: 'Administrative'
            },
            student_services: {
                name: "Student Services",
                width: 45, depth: 35, height: 22,
                floors: 2,
                color: 0xc8b896,
                features: ['accessible_entrance', 'open_floor_plan', 'waiting_areas', 'interior', 'office_furniture'],
                icon: '🎯',
                category: 'Administrative'
            },
            cafeteria: {
                name: "Cafeteria",
                width: 45, depth: 35, height: 18,
                floors: 1,
                color: 0xe8d8c8,
                features: ['large_windows', 'outdoor_seating', 'kitchen_area', 'interior'],
                icon: '🍽️',
                category: 'Student Life'
            },
            student_union: {
                name: "Student Union",
                width: 50, depth: 45, height: 25,
                floors: 3,
                color: 0xd8c8b8,
                features: ['multi_purpose', 'social_spaces', 'food_court', 'interior'],
                icon: '🏛️',
                category: 'Student Life'
            },
            gym: {
                name: "Gymnasium",
                width: 60, depth: 45, height: 25,
                floors: 1,
                color: 0xb8a898,
                features: ['high_ceiling', 'large_doors', 'bleachers', 'interior'],
                icon: '🏋️',
                category: 'Student Life'
            },
            dorm: {
                name: "Dormitory",
                width: 35, depth: 20, height: 40,
                floors: 5,
                color: 0xc8b8a8,
                features: ['residential', 'balconies', 'common_areas', 'interior'],
                icon: '🏠',
                category: 'Student Life'
            }
        };

        this.init();
        this.loadBuildings();
    }

    init() {
        // Create UI
        this.createCatalogUI();
        
        // Keyboard listener for catalog toggle
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyC') {
                this.toggleCatalog();
            }
            if (e.code === 'Escape' && this.isPlacementMode) {
                this.cancelPlacement();
            }
        });

        // Mouse click for placement
        document.addEventListener('click', (e) => {
            if (this.isPlacementMode && !e.target.closest('#building-catalog')) {
                this.placeBuilding(e);
            }
        });

        console.log('🏗️ Building System initialized');
    }

    createCatalogUI() {
        const catalog = document.createElement('div');
        catalog.id = 'building-catalog';
        catalog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #667eea;
            color: white;
            display: none;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        `;

        catalog.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #667eea; margin: 0;">🏗️ Building Catalog</h2>
                <button onclick="buildingSystem.closeCatalog()" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">✕ Close</button>
            </div>
            <p style="color: #aaa; margin-bottom: 20px;">Click a building to place it in your world. Press ESC to cancel.</p>
            
            ${this.renderCatalogCategories()}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444;">
                <h3 style="color: #667eea; margin-bottom: 10px;">🎮 Controls</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                    <div><kbd style="background: #333; padding: 3px 8px; border-radius: 3px;">C</kbd> Open/Close Catalog</div>
                    <div><kbd style="background: #333; padding: 3px 8px; border-radius: 3px;">ESC</kbd> Cancel Placement</div>
                    <div><kbd style="background: #333; padding: 3px 8px; border-radius: 3px;">Click</kbd> Place Building</div>
                    <div><kbd style="background: #333; padding: 3px 8px; border-radius: 3px;">Shift+Click</kbd> Delete Building</div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444;">
                <button onclick="buildingSystem.saveBuildings()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-right: 10px;
                ">💾 Save World</button>
                <button onclick="buildingSystem.clearAllBuildings()" style="
                    background: #ff5722;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">🗑️ Clear All</button>
                <span style="margin-left: 15px; color: #4CAF50; font-size: 13px;">
                    ${this.placedBuildings.length} buildings placed
                </span>
            </div>
        `;

        document.body.appendChild(catalog);
    }

    renderCatalogCategories() {
        const categories = {};
        
        // Group by category
        Object.entries(this.buildingTemplates).forEach(([key, template]) => {
            if (!categories[template.category]) {
                categories[template.category] = [];
            }
            categories[template.category].push({ key, ...template });
        });

        let html = '';
        Object.entries(categories).forEach(([category, buildings]) => {
            html += `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #64B5F6; margin-bottom: 10px;">${category}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px;">
                        ${buildings.map(b => `
                            <button onclick="buildingSystem.selectBuilding('${b.key}')" style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                padding: 15px;
                                border-radius: 8px;
                                cursor: pointer;
                                text-align: left;
                                transition: all 0.3s;
                            " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size: 30px; margin-bottom: 5px;">${b.icon}</div>
                                <div style="font-weight: bold; margin-bottom: 3px;">${b.name}</div>
                                <div style="font-size: 11px; opacity: 0.8;">${b.width}×${b.depth}m, ${b.floors} floors</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        return html;
    }

    toggleCatalog() {
        this.catalogOpen = !this.catalogOpen;
        const catalog = document.getElementById('building-catalog');
        catalog.style.display = this.catalogOpen ? 'block' : 'none';
    }

    closeCatalog() {
        this.catalogOpen = false;
        document.getElementById('building-catalog').style.display = 'none';
    }

    selectBuilding(buildingKey) {
        this.selectedBuildingType = buildingKey;
        this.isPlacementMode = true;
        this.closeCatalog();
        
        const template = this.buildingTemplates[buildingKey];
        console.log(`🏗️ Placing ${template.name}. Click to place, ESC to cancel.`);
        
        // Show placement notification
        this.showNotification(`Placing ${template.icon} ${template.name}. Click to place.`);
    }

    cancelPlacement() {
        this.isPlacementMode = false;
        this.selectedBuildingType = null;
        this.showNotification('Placement cancelled');
    }

    placeBuilding(event) {
        if (!this.isPlacementMode) return;

        // Calculate world position from mouse
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, this.camera);
        
        // Raycast to ground (y=0 plane)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);

        if (intersectPoint) {
            const template = this.buildingTemplates[this.selectedBuildingType];
            const building = this.createBuilding(template, intersectPoint);
            
            this.placedBuildings.push({
                type: this.selectedBuildingType,
                position: {
                    x: intersectPoint.x,
                    y: intersectPoint.y,
                    z: intersectPoint.z
                },
                mesh: building
            });

            this.scene.add(building);
            this.saveBuildings();
            
            this.showNotification(`✅ ${template.name} placed!`);
            this.isPlacementMode = false;
            this.selectedBuildingType = null;
        }
    }

    createBuilding(template, position) {
        const group = new THREE.Group();
        group.position.copy(position);

        // Marble floor foundation (white with dark grey veins)
        const marbleFloorMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5, // Marble white
            roughness: 0.2,
            metalness: 0.8,
            map: this.createMarbleTexture()
        });

        const marbleFloor = new THREE.Mesh(
            new THREE.BoxGeometry(template.width + 4, 0.3, template.depth + 4),
            marbleFloorMaterial
        );
        marbleFloor.position.y = 0.15;
        marbleFloor.receiveShadow = true;
        marbleFloor.castShadow = true;
        group.add(marbleFloor);

        // Main building structure (smooth painted finish)
        const buildingGeometry = new THREE.BoxGeometry(template.width, template.height, template.depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: template.color,
            roughness: 0.3, // Smooth paint
            metalness: 0.05,
            clearcoat: 0.5, // Glossy painted finish
            clearcoatRoughness: 0.2
        });
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.y = template.height / 2;
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;
        group.add(buildingMesh);

        // Add detailed classical pillars if specified
        if (template.features.includes('columns')) {
            this.addDetailedPillars(group, template);
        }

        // Add windows
        this.addSimpleWindows(group, template);

        // Add entrance
        this.addEntrance(group, template);

        // Add roof
        this.addRoof(group, template);

        // Metadata for identification
        group.userData = {
            buildingType: template.name,
            template: template
        };

        return group;
    }

    createMarbleTexture() {
        // Create procedural marble texture with dark grey veins
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base marble white
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add dark grey veins (more realistic)
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 80; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            
            // Create flowing vein patterns
            for (let j = 0; j < 5; j++) {
                ctx.quadraticCurveTo(
                    Math.random() * 512, 
                    Math.random() * 512,
                    Math.random() * 512, 
                    Math.random() * 512
                );
            }
            ctx.stroke();
        }
        
        // Add smaller, darker veins
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.2;
        
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            ctx.lineTo(Math.random() * 512, Math.random() * 512);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    addDetailedPillars(group, template) {
        // Classical pillar material (smooth painted)
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            roughness: 0.25,
            metalness: 0.1,
            clearcoat: 0.6,
            clearcoatRoughness: 0.15
        });

        // Torus/capital material (darker accent)
        const capitalMaterial = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            roughness: 0.3,
            metalness: 0.15
        });

        const numPillars = 6;
        const pillarRadius = 0.5;
        const pillarHeight = template.height * 0.7;
        const pillarSpacing = (template.width - 2) / (numPillars - 1);

        for (let i = 0; i < numPillars; i++) {
            const x = (i - (numPillars - 1) / 2) * pillarSpacing;
            const pillarGroup = new THREE.Group();

            // Main cylindrical shaft (smooth, high segments)
            const shaftGeometry = new THREE.CylinderGeometry(
                pillarRadius, 
                pillarRadius, 
                pillarHeight, 
                32 // 32 segments for smooth appearance
            );
            const shaft = new THREE.Mesh(shaftGeometry, pillarMaterial);
            shaft.position.y = pillarHeight / 2;
            shaft.castShadow = true;
            pillarGroup.add(shaft);

            // Bottom torus (base capital) - extruded detail
            const bottomTorusGeo = new THREE.TorusGeometry(
                pillarRadius + 0.15, // Ring radius
                0.12, // Tube radius
                16, // Radial segments
                32  // Tubular segments (splits for detail)
            );
            const bottomTorus = new THREE.Mesh(bottomTorusGeo, capitalMaterial);
            bottomTorus.rotation.x = Math.PI / 2;
            bottomTorus.position.y = 0.3;
            bottomTorus.castShadow = true;
            pillarGroup.add(bottomTorus);

            // Base plinth (square section at bottom)
            const plinthGeo = new THREE.BoxGeometry(
                pillarRadius * 2.5,
                0.4,
                pillarRadius * 2.5
            );
            const plinth = new THREE.Mesh(plinthGeo, capitalMaterial);
            plinth.position.y = 0.05;
            plinth.castShadow = true;
            pillarGroup.add(plinth);

            // Top torus (capital where it meets ceiling)
            const topTorusGeo = new THREE.TorusGeometry(
                pillarRadius + 0.15,
                0.12,
                16,
                32
            );
            const topTorus = new THREE.Mesh(topTorusGeo, capitalMaterial);
            topTorus.rotation.x = Math.PI / 2;
            topTorus.position.y = pillarHeight - 0.3;
            topTorus.castShadow = true;
            pillarGroup.add(topTorus);

            // Abacus (square capital at top where pillar meets ceiling)
            const abacusGeo = new THREE.BoxGeometry(
                pillarRadius * 2.8,
                0.3,
                pillarRadius * 2.8
            );
            const abacus = new THREE.Mesh(abacusGeo, capitalMaterial);
            abacus.position.y = pillarHeight - 0.05;
            abacus.castShadow = true;
            pillarGroup.add(abacus);

            // Fluting (vertical grooves) - adds classical detail
            const flutingCount = 24;
            for (let f = 0; f < flutingCount; f++) {
                const angle = (f / flutingCount) * Math.PI * 2;
                const flutingGeo = new THREE.BoxGeometry(0.03, pillarHeight - 1, 0.08);
                const fluting = new THREE.Mesh(flutingGeo, capitalMaterial);
                fluting.position.set(
                    Math.cos(angle) * (pillarRadius + 0.04),
                    pillarHeight / 2,
                    Math.sin(angle) * (pillarRadius + 0.04)
                );
                fluting.lookAt(new THREE.Vector3(0, pillarHeight / 2, 0));
                pillarGroup.add(fluting);
            }

            pillarGroup.position.set(x, 0.3, template.depth / 2 + 2);
            pillarGroup.castShadow = true;
            group.add(pillarGroup);
        }
    }

    addSimpleWindows(group, template) {
        // Crystal clear glass with shimmer effect
        const windowGlassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xc8e6f5,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.9,
            thickness: 0.5,
            envMapIntensity: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            transparent: true,
            opacity: 0.3,
            reflectivity: 0.9,
            ior: 1.5 // Glass index of refraction
        });

        // Window frame/seal material (smooth painted finish)
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.2,
            metalness: 0.05,
            clearcoat: 0.8, // Smooth paint finish
            clearcoatRoughness: 0.1
        });

        const windowWidth = 2;
        const windowHeight = 2.5;
        const frameThickness = 0.08;
        const frameDepth = 0.15;
        const floorHeight = template.height / template.floors;

        for (let floor = 0; floor < template.floors; floor++) {
            const y = floorHeight * (floor + 0.5);
            const numWindows = Math.floor(template.width / 4);

            for (let i = 0; i < numWindows; i++) {
                const x = (i - numWindows / 2 + 0.5) * 4;
                const windowGroup = new THREE.Group();

                // Glass pane (crystal clear with shimmer)
                const glassPaneGeo = new THREE.BoxGeometry(windowWidth - frameThickness * 2, windowHeight - frameThickness * 2, 0.05);
                const glassPane = new THREE.Mesh(glassPaneGeo, windowGlassMaterial);
                glassPane.position.set(0, 0, frameDepth);
                windowGroup.add(glassPane);

                // Window seal/frame (edging around the window)
                // Top frame
                const topFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(windowWidth, frameThickness, frameDepth),
                    frameMaterial
                );
                topFrame.position.set(0, windowHeight / 2 - frameThickness / 2, frameDepth / 2);
                topFrame.castShadow = true;
                windowGroup.add(topFrame);

                // Bottom frame
                const bottomFrame = topFrame.clone();
                bottomFrame.position.y = -windowHeight / 2 + frameThickness / 2;
                windowGroup.add(bottomFrame);

                // Left frame
                const leftFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(frameThickness, windowHeight, frameDepth),
                    frameMaterial
                );
                leftFrame.position.set(-windowWidth / 2 + frameThickness / 2, 0, frameDepth / 2);
                leftFrame.castShadow = true;
                windowGroup.add(leftFrame);

                // Right frame
                const rightFrame = leftFrame.clone();
                rightFrame.position.x = windowWidth / 2 - frameThickness / 2;
                windowGroup.add(rightFrame);

                // Window sill (bottom ledge)
                const sillGeo = new THREE.BoxGeometry(windowWidth + 0.2, 0.1, 0.2);
                const sill = new THREE.Mesh(sillGeo, frameMaterial);
                sill.position.set(0, -windowHeight / 2 - 0.05, frameDepth / 2);
                sill.castShadow = true;
                windowGroup.add(sill);

                windowGroup.position.set(x, y, template.depth / 2 + 0.15);
                windowGroup.castShadow = true;
                group.add(windowGroup);
            }
        }
    }

    addEntrance(group, template) {
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3020,
            roughness: 0.7,
            metalness: 0.2
        });

        const door = new THREE.Mesh(
            new THREE.BoxGeometry(4, 5, 0.3),
            doorMaterial
        );
        door.position.set(0, 2.5, template.depth / 2 + 0.15);
        door.castShadow = true;
        group.add(door);
    }

    addRoof(group, template) {
        // Roof structure with detailed tiles
        const roofBaseMaterial = new THREE.MeshStandardMaterial({
            color: 0x404040,
            roughness: 0.85,
            metalness: 0.05
        });

        // Create roof base
        const roofBase = new THREE.Mesh(
            new THREE.BoxGeometry(template.width + 2, 0.4, template.depth + 2),
            roofBaseMaterial
        );
        roofBase.position.y = template.height + 0.2;
        roofBase.castShadow = true;
        roofBase.receiveShadow = true;
        group.add(roofBase);

        // Add roof tiles (detailed)
        const tileMaterial = new THREE.MeshStandardMaterial({
            color: 0x505050,
            roughness: 0.9,
            metalness: 0.0
        });

        const tileRows = Math.floor((template.depth + 2) / 0.4);
        const tileCols = Math.floor((template.width + 2) / 0.4);

        for (let row = 0; row < tileRows; row++) {
            for (let col = 0; col < tileCols; col++) {
                const tile = new THREE.Mesh(
                    new THREE.BoxGeometry(0.38, 0.05, 0.38),
                    tileMaterial
                );
                tile.position.set(
                    (col - tileCols / 2 + 0.5) * 0.4,
                    template.height + 0.45,
                    (row - tileRows / 2 + 0.5) * 0.4
                );
                tile.castShadow = true;
                group.add(tile);
            }
        }

        // Roof edge trim
        const trimMaterial = new THREE.MeshStandardMaterial({
            color: 0x606060,
            roughness: 0.6,
            metalness: 0.2
        });

        // Front/back trim
        const frontTrim = new THREE.Mesh(
            new THREE.BoxGeometry(template.width + 2.5, 0.15, 0.15),
            trimMaterial
        );
        frontTrim.position.set(0, template.height + 0.5, template.depth / 2 + 1.1);
        frontTrim.castShadow = true;
        group.add(frontTrim);

        const backTrim = frontTrim.clone();
        backTrim.position.z = -template.depth / 2 - 1.1;
        group.add(backTrim);

        // Left/right trim
        const leftTrim = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.15, template.depth + 2.5),
            trimMaterial
        );
        leftTrim.position.set(-template.width / 2 - 1.1, template.height + 0.5, 0);
        leftTrim.castShadow = true;
        group.add(leftTrim);

        const rightTrim = leftTrim.clone();
        rightTrim.position.x = template.width / 2 + 1.1;
        group.add(rightTrim);
    }

    // ========== PERSISTENCE SYSTEM ==========

    saveBuildings() {
        const buildingData = this.placedBuildings.map(b => ({
            type: b.type,
            position: b.position
        }));

        localStorage.setItem('pixelverse_buildings', JSON.stringify(buildingData));
        console.log(`💾 Saved ${buildingData.length} buildings to localStorage`);
        this.showNotification(`💾 World saved! ${buildingData.length} buildings`);
        
        // Update UI counter
        const counter = document.querySelector('#building-catalog span[style*="4CAF50"]');
        if (counter) {
            counter.textContent = `${this.placedBuildings.length} buildings placed`;
        }
    }

    loadBuildings() {
        const savedData = localStorage.getItem('pixelverse_buildings');
        
        if (!savedData) {
            console.log('📂 No saved buildings found');
            return;
        }

        try {
            const buildingData = JSON.parse(savedData);
            console.log(`📂 Loading ${buildingData.length} buildings from localStorage`);

            buildingData.forEach(data => {
                const template = this.buildingTemplates[data.type];
                if (!template) {
                    console.warn(`⚠️ Unknown building type: ${data.type}`);
                    return;
                }

                const position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
                const building = this.createBuilding(template, position);
                
                this.placedBuildings.push({
                    type: data.type,
                    position: data.position,
                    mesh: building
                });

                this.scene.add(building);
            });

            console.log(`✅ Loaded ${this.placedBuildings.length} buildings`);
            this.showNotification(`📂 Loaded ${this.placedBuildings.length} buildings`);
        } catch (error) {
            console.error('❌ Error loading buildings:', error);
        }
    }

    clearAllBuildings() {
        if (!confirm(`Are you sure you want to delete all ${this.placedBuildings.length} buildings?`)) {
            return;
        }

        this.placedBuildings.forEach(b => {
            this.scene.remove(b.mesh);
        });

        this.placedBuildings = [];
        localStorage.removeItem('pixelverse_buildings');
        
        console.log('🗑️ All buildings cleared');
        this.showNotification('🗑️ All buildings deleted');
        
        // Update UI
        const counter = document.querySelector('#building-catalog span[style*="4CAF50"]');
        if (counter) {
            counter.textContent = '0 buildings placed';
        }
    }

    showNotification(message) {
        // Create or update notification
        let notif = document.getElementById('building-notification');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'building-notification';
            notif.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                border: 2px solid #4CAF50;
                font-weight: bold;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(notif);
        }

        notif.textContent = message;
        notif.style.opacity = '1';

        setTimeout(() => {
            notif.style.opacity = '0';
        }, 3000);
    }

    // Export for game integration
    exportToJSON() {
        const data = {
            buildings: this.placedBuildings.map(b => ({
                type: b.type,
                position: b.position
            })),
            metadata: {
                totalBuildings: this.placedBuildings.length,
                exportDate: new Date().toISOString(),
                version: '1.0'
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pixelverse_buildings_${Date.now()}.json`;
        link.click();

        console.log('📥 Building data exported');
    }
}

// Global reference for onclick handlers
window.buildingSystem = null;

// Auto-initialize when THREE.js scene is ready
console.log('🏗️ Building System Integration loaded');
