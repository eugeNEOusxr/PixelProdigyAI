/**
 * ADVANCED ARCHITECTURAL DETAIL SYSTEM
 * Vertex-level geometry control for photorealistic buildings
 * 
 * Features:
 * - Marble walls with light reflectivity
 * - Black trim edging (doorways, windows, gutters)
 * - Hard cuts with rounded corners (chamfered edges)
 * - Dynamic roof extrusion (lightning bolt pattern)
 * - Precise vertex manipulation for sharp details
 */

class ArchitecturalDetailSystem {
    constructor() {
        this.materials = this.createAdvancedMaterials();
    }

    createAdvancedMaterials() {
        return {
            // Marble with high light reflectivity
            marble: new THREE.MeshStandardMaterial({
                color: 0xf5f5f5,
                roughness: 0.15,
                metalness: 0.2,
                map: this.createMarbleTexture(),
                envMapIntensity: 1.5,
                clearcoat: 0.8,
                clearcoatRoughness: 0.1
            }),

            // Black trim (sharp, glossy)
            blackTrim: new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                roughness: 0.2,
                metalness: 0.3,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05
            }),

            // Glass with proper reflectivity
            reflectiveGlass: new THREE.MeshStandardMaterial({
                color: 0xaaddff,
                roughness: 0.05,
                metalness: 0.1,
                transparent: true,
                opacity: 0.35,
                side: THREE.DoubleSide
            })
        };
    }

    createMarbleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Base marble white
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(0, 0, 1024, 1024);

        // Black veining (dramatic contrast)
        ctx.strokeStyle = 'rgba(10, 10, 10, 0.4)';
        ctx.lineWidth = 2;

        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
            
            for (let j = 0; j < 4; j++) {
                ctx.bezierCurveTo(
                    Math.random() * 1024, Math.random() * 1024,
                    Math.random() * 1024, Math.random() * 1024,
                    Math.random() * 1024, Math.random() * 1024
                );
            }
            ctx.stroke();
        }

        // Subtle grey veins
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i < 60; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
            ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    // Create doorway with black trim edging
    createDoorwayWithTrim(width, height, depth) {
        const group = new THREE.Group();

        // Door opening (negative space - just frame)
        const doorFrameThickness = 0.15;
        const trimWidth = 0.12;

        // Main door frame (marble)
        const frameVertices = [];
        const frameIndices = [];

        // Build frame with sharp corners and rounded edges
        this.createFrameGeometry(width, height, doorFrameThickness, frameVertices, frameIndices);

        const frameGeometry = new THREE.BufferGeometry();
        frameGeometry.setAttribute('position', new THREE.Float32BufferAttribute(frameVertices, 3));
        frameGeometry.setIndex(frameIndices);
        frameGeometry.computeVertexNormals();

        const frame = new THREE.Mesh(frameGeometry, this.materials.marble);
        frame.castShadow = true;
        group.add(frame);

        // Black trim (top, sides, bottom)
        this.addBlackTrimToDoorway(group, width, height, depth, trimWidth);

        return group;
    }

    createFrameGeometry(width, height, thickness, vertices, indices) {
        // Door frame with chamfered edges (hard cuts that round off)
        const chamferSize = 0.04;
        
        // Outer rectangle
        const hw = width / 2;
        const hh = height / 2;

        // Create vertices with chamfered corners
        // This creates the "hard cuts that still round off but sharpen on corners" effect
        
        // Outer perimeter with chamfers
        const outerPoints = [
            // Top right corner (chamfered)
            [hw - chamferSize, hh, 0],
            [hw, hh - chamferSize, 0],
            
            // Bottom right corner (chamfered)
            [hw, -hh + chamferSize, 0],
            [hw - chamferSize, -hh, 0],
            
            // Bottom left corner (chamfered)
            [-hw + chamferSize, -hh, 0],
            [-hw, -hh + chamferSize, 0],
            
            // Top left corner (chamfered)
            [-hw, hh - chamferSize, 0],
            [-hw + chamferSize, hh, 0]
        ];

        // Inner rectangle (door opening)
        const innerWidth = width - thickness * 2;
        const innerHeight = height - thickness * 2;
        const ihw = innerWidth / 2;
        const ihh = innerHeight / 2;

        const innerPoints = [
            [ihw - chamferSize, ihh, 0],
            [ihw, ihh - chamferSize, 0],
            [ihw, -ihh + chamferSize, 0],
            [ihw - chamferSize, -ihh, 0],
            [-ihw + chamferSize, -ihh, 0],
            [-ihw, -ihh + chamferSize, 0],
            [-ihw, ihh - chamferSize, 0],
            [-ihw + chamferSize, ihh, 0]
        ];

        // Add vertices
        outerPoints.forEach(p => vertices.push(...p));
        innerPoints.forEach(p => vertices.push(...p));

        // Create faces (frame between outer and inner)
        for (let i = 0; i < 8; i++) {
            const next = (i + 1) % 8;
            
            // Quad between outer and inner rings
            indices.push(i, next, i + 8);
            indices.push(next, next + 8, i + 8);
        }
    }

    addBlackTrimToDoorway(group, width, height, depth, trimWidth) {
        // Top trim (horizontal)
        const topTrim = new THREE.Mesh(
            new THREE.BoxGeometry(width + trimWidth * 2, trimWidth, depth + 0.05),
            this.materials.blackTrim
        );
        topTrim.position.y = height / 2 + trimWidth / 2;
        topTrim.castShadow = true;
        group.add(topTrim);

        // Left trim (vertical)
        const leftTrim = new THREE.Mesh(
            new THREE.BoxGeometry(trimWidth, height, depth + 0.05),
            this.materials.blackTrim
        );
        leftTrim.position.x = -width / 2 - trimWidth / 2;
        leftTrim.castShadow = true;
        group.add(leftTrim);

        // Right trim (vertical)
        const rightTrim = new THREE.Mesh(
            new THREE.BoxGeometry(trimWidth, height, depth + 0.05),
            this.materials.blackTrim
        );
        rightTrim.position.x = width / 2 + trimWidth / 2;
        rightTrim.castShadow = true;
        group.add(rightTrim);

        // Bottom trim (horizontal)
        const bottomTrim = new THREE.Mesh(
            new THREE.BoxGeometry(width + trimWidth * 2, trimWidth, depth + 0.05),
            this.materials.blackTrim
        );
        bottomTrim.position.y = -height / 2 - trimWidth / 2;
        bottomTrim.castShadow = true;
        group.add(bottomTrim);
    }

    // Create window with black seal trim
    createWindowWithSeal(width, height, depth) {
        const group = new THREE.Group();

        // Glass pane
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 0.05),
            this.materials.reflectiveGlass
        );
        glass.receiveShadow = true;
        group.add(glass);

        // Black window seal (trim around glass)
        const sealThickness = 0.08;
        
        // Top seal
        const topSeal = new THREE.Mesh(
            new THREE.BoxGeometry(width + sealThickness * 2, sealThickness, depth),
            this.materials.blackTrim
        );
        topSeal.position.y = height / 2 + sealThickness / 2;
        topSeal.castShadow = true;
        group.add(topSeal);

        // Bottom seal
        const bottomSeal = new THREE.Mesh(
            new THREE.BoxGeometry(width + sealThickness * 2, sealThickness, depth),
            this.materials.blackTrim
        );
        bottomSeal.position.y = -height / 2 - sealThickness / 2;
        bottomSeal.castShadow = true;
        group.add(bottomSeal);

        // Left seal
        const leftSeal = new THREE.Mesh(
            new THREE.BoxGeometry(sealThickness, height, depth),
            this.materials.blackTrim
        );
        leftSeal.position.x = -width / 2 - sealThickness / 2;
        leftSeal.castShadow = true;
        group.add(leftSeal);

        // Right seal
        const rightSeal = new THREE.Mesh(
            new THREE.BoxGeometry(sealThickness, height, depth),
            this.materials.blackTrim
        );
        rightSeal.position.x = width / 2 + sealThickness / 2;
        rightSeal.castShadow = true;
        group.add(rightSeal);

        return group;
    }

    // Create gutter rail with black underskirt trim
    createGutterWithUnderskirt(length, position) {
        const group = new THREE.Group();

        // Main gutter (marble)
        const gutterDepth = 0.3;
        const gutterHeight = 0.15;

        const gutter = new THREE.Mesh(
            new THREE.BoxGeometry(length, gutterHeight, gutterDepth),
            this.materials.marble
        );
        gutter.position.copy(position);
        gutter.castShadow = true;
        group.add(gutter);

        // Black underskirt trim (hangs below gutter)
        const underskirtHeight = 0.08;
        const underskirt = new THREE.Mesh(
            new THREE.BoxGeometry(length, underskirtHeight, gutterDepth + 0.05),
            this.materials.blackTrim
        );
        underskirt.position.copy(position);
        underskirt.position.y -= (gutterHeight / 2 + underskirtHeight / 2);
        underskirt.castShadow = true;
        group.add(underskirt);

        return group;
    }

    // Create dynamic lightning bolt roof pattern
    createLightningBoltRoof(buildingWidth, buildingDepth, buildingHeight) {
        const group = new THREE.Group();

        // Base roof that extrudes past main wall
        const roofOverhang = 3.0; // Extrudes significantly
        const baseRoofWidth = buildingWidth + roofOverhang * 2;
        const baseRoofDepth = buildingDepth + roofOverhang * 2;
        const roofThickness = 0.4;

        // Create vertices for lightning bolt pattern
        const roofVertices = [];
        const roofIndices = [];

        // Three angled dynamics creating lightning bolt pattern
        // Main roof sections that interlock at angles

        const section1Angle = Math.PI / 8;   // 22.5 degrees
        const section2Angle = -Math.PI / 6;  // -30 degrees
        const section3Angle = Math.PI / 10;  // 18 degrees

        const sections = [
            {
                width: baseRoofWidth / 3,
                depth: baseRoofDepth,
                angle: section1Angle,
                offsetX: -baseRoofWidth / 3,
                offsetZ: 0
            },
            {
                width: baseRoofWidth / 3,
                depth: baseRoofDepth * 0.8,
                angle: section2Angle,
                offsetX: 0,
                offsetZ: baseRoofDepth * 0.1
            },
            {
                width: baseRoofWidth / 3,
                depth: baseRoofDepth,
                angle: section3Angle,
                offsetX: baseRoofWidth / 3,
                offsetZ: 0
            }
        ];

        // Create each roof section with angular dynamics
        sections.forEach((section, idx) => {
            const roofSection = this.createAngledRoofSection(
                section.width,
                section.depth,
                roofThickness,
                section.angle
            );
            
            roofSection.position.set(
                section.offsetX,
                buildingHeight + roofThickness / 2,
                section.offsetZ
            );
            
            // Black trim on edges of each section
            this.addRoofEdgeTrim(roofSection, section.width, section.depth, roofThickness);
            
            group.add(roofSection);
        });

        return group;
    }

    createAngledRoofSection(width, depth, thickness, angle) {
        const geometry = new THREE.BoxGeometry(width, thickness, depth);
        
        // Apply angular rotation for lightning bolt effect
        const vertices = geometry.attributes.position.array;
        const centerY = 0;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            // Rotate around Y axis with angle
            const rotatedX = x * Math.cos(angle) - z * Math.sin(angle);
            const rotatedZ = x * Math.sin(angle) + z * Math.cos(angle);
            
            vertices[i] = rotatedX;
            vertices[i + 2] = rotatedZ;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        const mesh = new THREE.Mesh(geometry, this.materials.marble);
        mesh.castShadow = true;
        return mesh;
    }

    addRoofEdgeTrim(roofSection, width, depth, thickness) {
        const trimHeight = 0.12;
        const trimDepth = 0.08;

        // Front edge trim
        const frontTrim = new THREE.Mesh(
            new THREE.BoxGeometry(width, trimHeight, trimDepth),
            this.materials.blackTrim
        );
        frontTrim.position.z = depth / 2 + trimDepth / 2;
        frontTrim.position.y = -thickness / 2 - trimHeight / 2;
        frontTrim.castShadow = true;
        roofSection.add(frontTrim);

        // Back edge trim
        const backTrim = new THREE.Mesh(
            new THREE.BoxGeometry(width, trimHeight, trimDepth),
            this.materials.blackTrim
        );
        backTrim.position.z = -depth / 2 - trimDepth / 2;
        backTrim.position.y = -thickness / 2 - trimHeight / 2;
        backTrim.castShadow = true;
        roofSection.add(backTrim);
    }

    // Create complete building with all architectural details
    createDetailedBuilding(config) {
        const group = new THREE.Group();

        const { width, depth, height, floors } = config;

        // Main marble walls
        const walls = this.createMarbleWalls(width, depth, height);
        group.add(walls);

        // Doorway with black trim (centered on front)
        const doorway = this.createDoorwayWithTrim(4, 8, 0.3);
        doorway.position.set(0, 4, depth / 2);
        group.add(doorway);

        // Windows with black seals (grid pattern)
        const windowsPerFloor = 5;
        const floorHeight = height / floors;
        const windowSpacing = (width - 4) / windowsPerFloor;

        for (let floor = 0; floor < floors; floor++) {
            for (let i = 0; i < windowsPerFloor; i++) {
                const window = this.createWindowWithSeal(2.5, 3, 0.2);
                window.position.set(
                    -width / 2 + 2 + i * windowSpacing + windowSpacing / 2,
                    floorHeight / 2 + floor * floorHeight + 2,
                    depth / 2
                );
                group.add(window);
            }
        }

        // Gutter rails with black underskirts (top of walls)
        const frontGutter = this.createGutterWithUnderskirt(
            width,
            new THREE.Vector3(0, height - 0.2, depth / 2 + 0.2)
        );
        group.add(frontGutter);

        // Lightning bolt roof (three angled dynamics)
        const roof = this.createLightningBoltRoof(width, depth, height);
        group.add(roof);

        return group;
    }

    createMarbleWalls(width, depth, height) {
        const group = new THREE.Group();

        // Front wall (with cutouts for door/windows handled separately)
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 0.3),
            this.materials.marble
        );
        frontWall.position.set(0, height / 2, depth / 2);
        frontWall.castShadow = true;
        frontWall.receiveShadow = true;
        group.add(frontWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, height, depth),
            this.materials.marble
        );
        leftWall.position.set(-width / 2, height / 2, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        group.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, height, depth),
            this.materials.marble
        );
        rightWall.position.set(width / 2, height / 2, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        group.add(rightWall);

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 0.3),
            this.materials.marble
        );
        backWall.position.set(0, height / 2, -depth / 2);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        group.add(backWall);

        return group;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArchitecturalDetailSystem;
}
