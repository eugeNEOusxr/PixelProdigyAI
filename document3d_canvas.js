/**
 * 🧬 3D Document Canvas System - Enhanced with 3D Letter Geometries
 * Integrated TextWeaver for PixelProdigy3D Universe
 * 
 * Features:
 * - Individual 3D letter geometries (each letter is a separate 3D object)
 * - Multiple font styles (Helvetiker, Optimer, Gentilis, Droid Sans)
 * - Words materialize from center → outward to paragraph positions
 * - PDF/Blog document formatting (header, title, paragraphs with indentation)
 * - Export to PDF functionality
 * - Multiple shape distributions
 * - Material selection
 * 
 * Eugene Ousos - PixelProdigy AI
 * October 24, 2025
 */

class Document3DCanvas {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Document structure
        this.document = {
            header: {
                name: '',
                city: '',
                state: '',
                zipCode: ''
            },
            title: '',
            paragraphs: []
        };
        
        // Letter meshes organized by section
        this.letterGroups = {
            header: [],
            title: [],
            body: []
        };
        
        // Current settings
        this.currentShape = 'sphere';
        this.currentMaterial = 'biblical';
        this.currentColor = '#667eea';
        this.currentFont = 'helvetiker';
        
        // Advanced formatting settings
        this.letterSize = 0.4;
        this.letterSpacing = 0.6;
        this.extrusionDepth = 0.15;
        this.lineSpacing = 0.8;
        this.wordsPerLine = 8;
        this.alignment = 'left';
        this.fontWeight = 'normal';
        this.textDecoration = 'none';
        this.animationSpeed = 1200;
        this.staggerDelay = 50;
        this.rotationEnabled = true;
        
        // Font loader and loaded fonts
        this.fontLoader = new THREE.FontLoader();
        this.loadedFonts = {};
        this.fontsLoading = 0;
        this.fontsReady = false;
        
        // Materials library
        this.materials = this.createMaterials();
        
        // Grid surface (document plane)
        this.gridSurface = null;
        this.createGridSurface();
        
        // Matrix Grid Backwall
        this.matrixGridBackwall = null;
        this.gridBackwallVisible = true;
        this.createMatrixGridBackwall();
        
        // Load fonts
        this.loadFonts();
        
        console.log('📄 3D Document Canvas initialized with 3D letter geometries!');
        console.log('🌐 Matrix grid backwall active for spatial reference');
    }
    
    /**
     * Load font files for 3D text
     */
    loadFonts() {
        const fontPaths = {
            helvetiker: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            optimer: 'https://threejs.org/examples/fonts/optimer_regular.typeface.json',
            gentilis: 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json',
            droid: 'https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json'
        };
        
        this.fontsLoading = Object.keys(fontPaths).length;
        
        Object.entries(fontPaths).forEach(([name, path]) => {
            this.fontLoader.load(
                path,
                (font) => {
                    this.loadedFonts[name] = font;
                    this.fontsLoading--;
                    console.log(`✅ Font loaded: ${name} (${Object.keys(this.loadedFonts).length}/4)`);
                    
                    if (this.fontsLoading === 0) {
                        this.fontsReady = true;
                        console.log('🎨 All fonts ready for 3D letter materialization!');
                    }
                },
                undefined,
                (error) => {
                    console.warn(`⚠️ Failed to load font: ${name}`, error);
                    this.fontsLoading--;
                    // Fallback to helvetiker if available
                    if (this.fontsLoading === 0 && Object.keys(this.loadedFonts).length > 0) {
                        this.fontsReady = true;
                        console.log('⚠️ Some fonts failed, using available fonts');
                    }
                }
            );
        });
    }
    
    /**
     * Create material library
     */
    createMaterials() {
        return {
            biblical: new THREE.MeshPhysicalMaterial({
                color: 0xd4a574,
                roughness: 0.9,
                metalness: 0.1,
                side: THREE.DoubleSide
            }),
            chrome: new THREE.MeshStandardMaterial({
                color: 0xe0e0e0,
                roughness: 0.1,
                metalness: 1.0,
                side: THREE.DoubleSide
            }),
            rubber: new THREE.MeshPhysicalMaterial({
                color: 0xf5f5f5,
                roughness: 0.8,
                metalness: 0,
                clearcoat: 0.3,
                side: THREE.DoubleSide
            }),
            magnetic: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.4,
                metalness: 0.8,
                emissive: 0x475569,
                emissiveIntensity: 0.2,
                side: THREE.DoubleSide
            }),
            holographic: new THREE.MeshPhysicalMaterial({
                color: 0x667eea,
                roughness: 0.2,
                metalness: 0.5,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide,
                emissive: 0x764ba2,
                emissiveIntensity: 0.3
            })
        };
    }
    
    /**
     * Create grid surface (document plane)
     */
    createGridSurface() {
        const geometry = new THREE.PlaneGeometry(30, 40, 50, 50);
        const material = this.materials[this.currentMaterial].clone();
        material.transparent = true;
        material.opacity = 0.3;
        
        this.gridSurface = new THREE.Mesh(geometry, material);
        this.gridSurface.rotation.x = -Math.PI / 2;
        this.gridSurface.position.y = 0;
        this.gridSurface.receiveShadow = true;
        
        // Add grid lines
        const gridHelper = new THREE.GridHelper(30, 30, 0x667eea, 0x334477);
        gridHelper.position.y = 0.01;
        
        this.scene.add(this.gridSurface);
        this.scene.add(gridHelper);
    }
    
    /**
     * 🌐 Create Matrix Grid Backwall - Spatial Reference for Letter Materialization
     * Provides a structured backdrop so users don't lose orientation in 3D space
     * 
     * THREE MODES:
     * 1. PAPERBACK (default) - Solid grid with clean lines
     * 2. MAGNETIC - Letters stick to grid with field lines and particle attraction
     * 3. HOLOGRAPHIC - Transparent structure with sphere projector emitting light upward
     */
    createMatrixGridBackwall() {
        // Create group to hold all grid elements
        this.matrixGridBackwall = new THREE.Group();
        this.matrixGridBackwall.name = 'MatrixGridBackwall';
        
        // Matrix wall modes
        this.matrixWallMode = 'paperback'; // 'paperback', 'magnetic', 'holographic'
        
        // Material-to-Matrix correlation system
        this.materialMatrixMap = {
            biblical: { mode: 'paperback', intensity: 1.0, description: 'Ancient parchment texture' },
            glossy: { mode: 'holographic', intensity: 1.2, description: 'Reflective holographic display' },
            matte: { mode: 'paperback', intensity: 0.8, description: 'Soft matte surface' },
            metallic: { mode: 'magnetic', intensity: 1.0, description: 'Metallic field attraction' },
            glass: { mode: 'holographic', intensity: 0.9, description: 'Transparent projection system' },
            rubber: { mode: 'paperback', intensity: 0.7, description: 'Textured solid grid' },
            magnetic: { mode: 'magnetic', intensity: 1.3, description: 'Strong magnetic field' },
            holographic: { mode: 'holographic', intensity: 1.4, description: 'Full holographic projection' }
        };
        
        // Transition state for smooth mode changes
        this.transitionState = {
            isTransitioning: false,
            progress: 0,
            fromMode: null,
            toMode: null,
            duration: 1500 // milliseconds
        };
        
        // Grid dimensions
        const width = 50;
        const height = 30;
        const divisions = 40;
        const zPosition = -8; // Behind the text (text spawns at z=0)
        
        // 1. Create main grid plane (subtle glowing backdrop)
        const planeGeometry = new THREE.PlaneGeometry(width, height);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x0a0a1a,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const backPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        backPlane.position.z = zPosition - 0.1;
        this.matrixGridBackwall.add(backPlane);
        
        // 2. Create vertical grid lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.4,
            linewidth: 1
        });
        
        const cellWidth = width / divisions;
        const cellHeight = height / divisions;
        
        // Vertical lines
        for (let i = 0; i <= divisions; i++) {
            const x = -width / 2 + i * cellWidth;
            const points = [
                new THREE.Vector3(x, -height / 2, zPosition),
                new THREE.Vector3(x, height / 2, zPosition)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.matrixGridBackwall.add(line);
        }
        
        // Horizontal lines
        for (let i = 0; i <= divisions; i++) {
            const y = -height / 2 + i * cellHeight;
            const points = [
                new THREE.Vector3(-width / 2, y, zPosition),
                new THREE.Vector3(width / 2, y, zPosition)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.matrixGridBackwall.add(line);
        }
        
        // 3. Add glowing center crosshair (origin marker)
        const crosshairMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        // Horizontal crosshair
        const hPoints = [
            new THREE.Vector3(-2, 0, zPosition + 0.1),
            new THREE.Vector3(2, 0, zPosition + 0.1)
        ];
        const hGeometry = new THREE.BufferGeometry().setFromPoints(hPoints);
        const hLine = new THREE.Line(hGeometry, crosshairMaterial);
        this.matrixGridBackwall.add(hLine);
        
        // Vertical crosshair
        const vPoints = [
            new THREE.Vector3(0, -2, zPosition + 0.1),
            new THREE.Vector3(0, 2, zPosition + 0.1)
        ];
        const vGeometry = new THREE.BufferGeometry().setFromPoints(vPoints);
        const vLine = new THREE.Line(vGeometry, crosshairMaterial);
        this.matrixGridBackwall.add(vLine);
        
        // 4. Add corner markers for spatial reference
        const markerGeometry = new THREE.CircleGeometry(0.2, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.6
        });
        
        const corners = [
            { x: -width / 2 + 1, y: height / 2 - 1 },  // Top-left
            { x: width / 2 - 1, y: height / 2 - 1 },   // Top-right
            { x: -width / 2 + 1, y: -height / 2 + 1 }, // Bottom-left
            { x: width / 2 - 1, y: -height / 2 + 1 }   // Bottom-right
        ];
        
        corners.forEach(corner => {
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(corner.x, corner.y, zPosition + 0.1);
            this.matrixGridBackwall.add(marker);
        });
        
        // 5. Add pulsing glow effect to center (animated in update loop)
        const glowGeometry = new THREE.CircleGeometry(1, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const centerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        centerGlow.position.z = zPosition + 0.05;
        centerGlow.name = 'centerGlow';
        this.matrixGridBackwall.add(centerGlow);
        
        // ========================================
        // 🧲 MAGNETIC MODE COMPONENTS
        // ========================================
        this.createMagneticField(width, height, zPosition);
        
        // ========================================
        // 🔮 HOLOGRAPHIC MODE COMPONENTS
        // ========================================
        this.createHolographicProjector(width, height, zPosition);
        
        // Position grid backwall
        this.matrixGridBackwall.position.y = 8; // Center vertically with text
        
        // Add to scene
        this.scene.add(this.matrixGridBackwall);
        
        console.log('🌐 Matrix Grid Backwall created: 50x30 units, 40x40 divisions');
        console.log('   ✓ PAPERBACK mode: Solid grid structure (default)');
        console.log('   ✓ MAGNETIC mode: Field lines with particle attraction');
        console.log('   ✓ HOLOGRAPHIC mode: Transparent structure with sphere projector');
        console.log('   ✓ Letters spawn from center (0,0,0) and materialize to grid');
    }
    
    /**
     * 🧲 Create Magnetic Field Components
     * Letters appear to be magnetically attracted to the grid
     */
    createMagneticField(width, height, zPosition) {
        const magneticGroup = new THREE.Group();
        magneticGroup.name = 'MagneticField';
        magneticGroup.visible = false; // Hidden by default
        
        // Magnetic field lines (curved lines emanating from grid points)
        const fieldLineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            linewidth: 2
        });
        
        // Create field lines from grid intersections
        const fieldLineCount = 20;
        for (let i = 0; i < fieldLineCount; i++) {
            const angle = (i / fieldLineCount) * Math.PI * 2;
            const radius = Math.random() * 15 + 10;
            
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, zPosition + 2),
                new THREE.Vector3(
                    Math.cos(angle) * radius * 0.3,
                    Math.sin(angle) * radius * 0.3,
                    zPosition + 1
                ),
                new THREE.Vector3(
                    Math.cos(angle) * radius * 0.7,
                    Math.sin(angle) * radius * 0.7,
                    zPosition + 0.5
                ),
                new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    zPosition
                )
            );
            
            const points = curve.getPoints(30);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, fieldLineMaterial);
            line.name = `fieldLine_${i}`;
            magneticGroup.add(line);
        }
        
        // Magnetic particles (small glowing spheres that move along field lines)
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        this.magneticParticles = [];
        for (let i = 0; i < 40; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 20;
            particle.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                zPosition + Math.random() * 2
            );
            particle.userData.angle = angle;
            particle.userData.radius = radius;
            particle.userData.speed = 0.5 + Math.random() * 1;
            particle.userData.phase = Math.random() * Math.PI * 2;
            magneticGroup.add(particle);
            this.magneticParticles.push(particle);
        }
        
        // Magnetic core (central attraction point)
        const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        const magneticCore = new THREE.Mesh(coreGeometry, coreMaterial);
        magneticCore.position.z = zPosition + 1;
        magneticCore.name = 'magneticCore';
        magneticGroup.add(magneticCore);
        
        // Add magnetic grid overlay (hexagonal pattern)
        this.createHexagonalGrid(magneticGroup, width, height, zPosition);
        
        this.matrixGridBackwall.add(magneticGroup);
    }
    
    /**
     * Create hexagonal grid pattern for magnetic mode
     */
    createHexagonalGrid(parent, width, height, zPosition) {
        const hexMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        
        const hexSize = 2;
        const hexHeight = hexSize * Math.sqrt(3) / 2;
        
        for (let row = 0; row < height / hexHeight; row++) {
            for (let col = 0; col < width / hexSize; col++) {
                const x = col * hexSize * 1.5 - width / 2;
                const y = row * hexHeight * 2 - height / 2 + (col % 2 === 0 ? 0 : hexHeight);
                
                const points = [];
                for (let i = 0; i < 7; i++) {
                    const angle = (Math.PI / 3) * i;
                    points.push(new THREE.Vector3(
                        x + Math.cos(angle) * hexSize,
                        y + Math.sin(angle) * hexSize,
                        zPosition
                    ));
                }
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const hex = new THREE.Line(geometry, hexMaterial);
                parent.add(hex);
            }
        }
    }
    
    /**
     * 🔮 Create Holographic Projector System
     * Transparent grid structure with sphere projector emitting light particles upward
     */
    createHolographicProjector(width, height, zPosition) {
        const holoGroup = new THREE.Group();
        holoGroup.name = 'HolographicProjector';
        holoGroup.visible = false; // Hidden by default
        
        // 1. HOLOGRAPHIC GRID (see-through with scan lines)
        const holoGridMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            wireframe: false
        });
        
        const holoPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height, 40, 40),
            holoGridMaterial
        );
        holoPlane.position.z = zPosition;
        holoGroup.add(holoPlane);
        
        // Holographic scan lines (horizontal moving lines)
        this.holoScanLines = [];
        for (let i = 0; i < 5; i++) {
            const scanGeometry = new THREE.PlaneGeometry(width, 0.2);
            const scanMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const scanLine = new THREE.Mesh(scanGeometry, scanMaterial);
            scanLine.position.set(0, -height / 2 + (i * height / 4), zPosition + 0.1);
            scanLine.userData.speed = 0.5 + Math.random() * 0.5;
            scanLine.userData.startY = scanLine.position.y;
            holoGroup.add(scanLine);
            this.holoScanLines.push(scanLine);
        }
        
        // 2. SPHERE PROJECTOR (main light source at bottom center)
        const projectorSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            })
        );
        projectorSphere.position.set(0, -height / 2 - 3, zPosition + 2);
        projectorSphere.name = 'projectorSphere';
        holoGroup.add(projectorSphere);
        
        // Inner core glow
        const innerCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9
            })
        );
        innerCore.position.copy(projectorSphere.position);
        innerCore.name = 'innerCore';
        holoGroup.add(innerCore);
        
        // 3. LIGHT PARTICLE STREAM (particles emitted upward from sphere)
        this.holoParticles = [];
        const particleCount = 200;
        const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        
        for (let i = 0; i < particleCount; i++) {
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 1, 0.5),
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Start at projector sphere
            const angle = Math.random() * Math.PI * 2;
            const spreadRadius = Math.random() * 2;
            particle.position.set(
                Math.cos(angle) * spreadRadius,
                projectorSphere.position.y,
                projectorSphere.position.z + Math.random() * 1
            );
            
            // Particle movement properties
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                0.05 + Math.random() * 0.1, // Upward velocity
                (Math.random() - 0.5) * 0.02
            );
            particle.userData.startY = projectorSphere.position.y;
            particle.userData.maxHeight = height / 2 + 5;
            particle.userData.life = Math.random(); // 0-1 lifecycle
            
            holoGroup.add(particle);
            this.holoParticles.push(particle);
        }
        
        // 4. PROJECTION CONE (light beam visualization)
        const coneGeometry = new THREE.ConeGeometry(25, 35, 32, 1, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide
        });
        const projectionCone = new THREE.Mesh(coneGeometry, coneMaterial);
        projectionCone.position.set(0, projectorSphere.position.y + 17.5, zPosition);
        projectionCone.rotation.x = Math.PI;
        projectionCone.name = 'projectionCone';
        holoGroup.add(projectionCone);
        
        // 5. GRID STRUCTURE EDGES (clear outline of the display area)
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.6,
            linewidth: 3
        });
        
        const edgePoints = [
            new THREE.Vector3(-width / 2, -height / 2, zPosition),
            new THREE.Vector3(width / 2, -height / 2, zPosition),
            new THREE.Vector3(width / 2, height / 2, zPosition),
            new THREE.Vector3(-width / 2, height / 2, zPosition),
            new THREE.Vector3(-width / 2, -height / 2, zPosition)
        ];
        const edgeGeometry = new THREE.BufferGeometry().setFromPoints(edgePoints);
        const edgeOutline = new THREE.Line(edgeGeometry, edgeMaterial);
        holoGroup.add(edgeOutline);
        
        this.matrixGridBackwall.add(holoGroup);
        
        console.log('🔮 Holographic projector created:');
        console.log('   ✓ Sphere projector at bottom center');
        console.log('   ✓ 200 light particles streaming upward');
        console.log('   ✓ Transparent grid with scan lines');
        console.log('   ✓ Projection cone visualization');
    }
    
    /**
     * Toggle matrix grid backwall visibility
     */
    toggleMatrixGridBackwall(visible) {
        if (this.matrixGridBackwall) {
            this.matrixGridBackwall.visible = visible !== undefined ? visible : !this.matrixGridBackwall.visible;
            this.gridBackwallVisible = this.matrixGridBackwall.visible;
            console.log(`🌐 Matrix grid backwall: ${this.gridBackwallVisible ? 'VISIBLE' : 'HIDDEN'}`);
        }
    }
    
    /**
     * Switch Matrix Wall Mode with smooth transition
     * @param {string} mode - 'paperback', 'magnetic', or 'holographic'
     * @param {boolean} immediate - Skip transition animation if true
     */
    switchMatrixWallMode(mode, immediate = false) {
        if (!this.matrixGridBackwall) return;
        
        const validModes = ['paperback', 'magnetic', 'holographic'];
        if (!validModes.includes(mode)) {
            console.error(`❌ Invalid mode: ${mode}. Use: paperback, magnetic, or holographic`);
            return;
        }
        
        // Don't transition if already in this mode
        if (this.matrixWallMode === mode && !this.transitionState.isTransitioning) {
            return;
        }
        
        // Setup transition
        if (!immediate) {
            this.transitionState.isTransitioning = true;
            this.transitionState.progress = 0;
            this.transitionState.fromMode = this.matrixWallMode;
            this.transitionState.toMode = mode;
            this.transitionState.startTime = Date.now();
        }
        
        this.matrixWallMode = mode;
        
        // Get mode groups
        const paperbackGroup = this.matrixGridBackwall.children.filter(
            child => !['MagneticField', 'HolographicProjector'].includes(child.name)
        );
        const magneticGroup = this.matrixGridBackwall.getObjectByName('MagneticField');
        const holoGroup = this.matrixGridBackwall.getObjectByName('HolographicProjector');
        
        if (immediate) {
            // Instant switch
            this.applyModeVisibility(mode, paperbackGroup, magneticGroup, holoGroup, 1.0);
        } else {
            // Fade out old mode first
            this.fadeOutOldMode(paperbackGroup, magneticGroup, holoGroup);
        }
        
        console.log(`🎨 Matrix Wall Mode: ${mode.toUpperCase()}`);
    }
    
    /**
     * Apply mode visibility with opacity control
     */
    applyModeVisibility(mode, paperbackGroup, magneticGroup, holoGroup, opacity) {
        switch(mode) {
            case 'paperback':
                paperbackGroup.forEach(obj => {
                    obj.visible = true;
                    if (obj.material && obj.material.opacity !== undefined) {
                        obj.material.opacity = Math.min(obj.material.opacity, opacity * 0.6);
                    }
                });
                if (magneticGroup) magneticGroup.visible = false;
                if (holoGroup) holoGroup.visible = false;
                break;
                
            case 'magnetic':
                paperbackGroup.forEach(obj => obj.visible = false);
                if (magneticGroup) {
                    magneticGroup.visible = true;
                    magneticGroup.traverse(child => {
                        if (child.material && child.material.opacity !== undefined) {
                            child.material.opacity = Math.min(child.material.opacity, opacity * 0.8);
                        }
                    });
                }
                if (holoGroup) holoGroup.visible = false;
                break;
                
            case 'holographic':
                paperbackGroup.forEach(obj => obj.visible = false);
                if (magneticGroup) magneticGroup.visible = false;
                if (holoGroup) {
                    holoGroup.visible = true;
                    holoGroup.traverse(child => {
                        if (child.material && child.material.opacity !== undefined) {
                            child.material.opacity = Math.min(child.material.opacity, opacity * 0.7);
                        }
                    });
                }
                break;
        }
    }
    
    /**
     * Fade out old mode before transitioning
     */
    fadeOutOldMode(paperbackGroup, magneticGroup, holoGroup) {
        const fadeOutDuration = 300; // milliseconds
        const startTime = Date.now();
        
        const fadeOut = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / fadeOutDuration, 1.0);
            const opacity = 1.0 - progress;
            
            // Apply opacity to all groups
            paperbackGroup.forEach(obj => {
                if (obj.material && obj.material.opacity !== undefined) {
                    obj.material.opacity = opacity * 0.6;
                }
            });
            
            if (magneticGroup) {
                magneticGroup.traverse(child => {
                    if (child.material && child.material.opacity !== undefined) {
                        child.material.opacity = opacity * 0.8;
                    }
                });
            }
            
            if (holoGroup) {
                holoGroup.traverse(child => {
                    if (child.material && child.material.opacity !== undefined) {
                        child.material.opacity = opacity * 0.7;
                    }
                });
            }
            
            if (progress < 1.0) {
                requestAnimationFrame(fadeOut);
            }
        };
        
        fadeOut();
    }
    
    /**
     * Automatically switch matrix mode based on text material
     * Creates contextually appropriate visual environment
     */
    autoSwitchMatrixForMaterial(materialName) {
        if (!this.materialMatrixMap[materialName]) {
            console.warn(`⚠️ No matrix mapping for material: ${materialName}`);
            return;
        }
        
        const mapping = this.materialMatrixMap[materialName];
        
        console.log(`� Auto-switching matrix mode for "${materialName}" material`);
        console.log(`   → Mode: ${mapping.mode}`);
        console.log(`   → Intensity: ${mapping.intensity}x`);
        console.log(`   → Context: ${mapping.description}`);
        
        // Switch to appropriate mode
        this.switchMatrixWallMode(mapping.mode, false);
        
        // Store intensity for animation scaling
        this.currentMatrixIntensity = mapping.intensity;
        
        // Return mapping info for UI updates
        return mapping;
    }
    
    /**
     * Set text material and auto-correlate matrix background
     */
    setMaterialWithMatrixCorrelation(materialName) {
        // Update current material
        this.currentMaterial = materialName;
        
        // Auto-switch matrix mode
        const mapping = this.autoSwitchMatrixForMaterial(materialName);
        
        // Apply material to existing letters
        Object.values(this.letterGroups).forEach(group => {
            group.forEach(letterMesh => {
                if (letterMesh && letterMesh.material && this.materials[materialName]) {
                    letterMesh.material = this.materials[materialName].clone();
                }
            });
        });
        
        console.log(`✅ Material "${materialName}" applied with correlated matrix background`);
        
        return mapping;
    }
    
    /**
     * Update matrix grid backwall (animate center glow)
     * Call this in your animation loop
     */
    updateMatrixGridBackwall() {
        if (!this.matrixGridBackwall || !this.gridBackwallVisible) return;
        
        const time = Date.now() * 0.001;
        
        // Get intensity multiplier (default 1.0)
        const intensity = this.currentMatrixIntensity || 1.0;
        
        // ========================================
        // SMOOTH TRANSITION HANDLING
        // ========================================
        if (this.transitionState.isTransitioning) {
            const elapsed = Date.now() - this.transitionState.startTime;
            this.transitionState.progress = Math.min(elapsed / this.transitionState.duration, 1.0);
            
            // Easing function (ease-in-out)
            const easeProgress = this.transitionState.progress < 0.5
                ? 2 * this.transitionState.progress * this.transitionState.progress
                : 1 - Math.pow(-2 * this.transitionState.progress + 2, 2) / 2;
            
            // Get mode groups
            const paperbackGroup = this.matrixGridBackwall.children.filter(
                child => !['MagneticField', 'HolographicProjector'].includes(child.name)
            );
            const magneticGroup = this.matrixGridBackwall.getObjectByName('MagneticField');
            const holoGroup = this.matrixGridBackwall.getObjectByName('HolographicProjector');
            
            // Fade in new mode
            if (easeProgress > 0.5) {
                const fadeInProgress = (easeProgress - 0.5) * 2; // 0 to 1
                this.applyModeVisibility(
                    this.transitionState.toMode,
                    paperbackGroup,
                    magneticGroup,
                    holoGroup,
                    fadeInProgress
                );
            }
            
            // Complete transition
            if (this.transitionState.progress >= 1.0) {
                this.transitionState.isTransitioning = false;
                console.log(`✅ Transition complete: ${this.transitionState.toMode} mode active`);
            }
        }
        
        // ========================================
        // PAPERBACK MODE ANIMATIONS
        // ========================================
        if (this.matrixWallMode === 'paperback') {
            const centerGlow = this.matrixGridBackwall.getObjectByName('centerGlow');
            if (centerGlow) {
                const scale = 1 + Math.sin(time * 2 * intensity) * (0.2 * intensity);
                centerGlow.scale.set(scale, scale, 1);
                centerGlow.material.opacity = (0.2 + Math.sin(time * 2 * intensity) * 0.1) * intensity;
            }
        }
        
        // ========================================
        // MAGNETIC MODE ANIMATIONS (Intensity-Scaled)
        // ========================================
        if (this.matrixWallMode === 'magnetic' && this.magneticParticles) {
            const magneticCore = this.matrixGridBackwall.getObjectByName('magneticCore');
            
            // Animate magnetic core pulsing (stronger with higher intensity)
            if (magneticCore) {
                const coreScale = 1 + Math.sin(time * 3 * intensity) * (0.3 * intensity);
                magneticCore.scale.set(coreScale, coreScale, coreScale);
                magneticCore.material.opacity = (0.4 + Math.sin(time * 3 * intensity) * 0.2) * intensity;
            }
            
            // Animate magnetic particles spiraling (faster with higher intensity)
            this.magneticParticles.forEach(particle => {
                particle.userData.phase += 0.02 * particle.userData.speed * intensity;
                
                const angle = particle.userData.angle + particle.userData.phase;
                const radius = particle.userData.radius + Math.sin(particle.userData.phase * 2) * 2 * intensity;
                
                particle.position.x = Math.cos(angle) * radius;
                particle.position.y = Math.sin(angle) * radius;
                particle.position.z += Math.sin(particle.userData.phase * 4) * 0.05;
                
                // Pulse opacity
                particle.material.opacity = 0.5 + Math.sin(particle.userData.phase * 3) * 0.3;
                
                // Change color based on distance from center
                const distanceFromCenter = Math.sqrt(
                    particle.position.x ** 2 + particle.position.y ** 2
                );
                const hue = 0.5 + (distanceFromCenter / 30) * 0.2;
                particle.material.color.setHSL(hue, 1, 0.5);
            });
            
            // Rotate field lines
            const magneticGroup = this.matrixGridBackwall.getObjectByName('MagneticField');
            if (magneticGroup) {
                magneticGroup.rotation.z += 0.001;
            }
        }
        
        // ========================================
        // HOLOGRAPHIC MODE ANIMATIONS
        // ========================================
        if (this.matrixWallMode === 'holographic') {
            // Animate projector sphere pulsing
            const projectorSphere = this.matrixGridBackwall.getObjectByName('projectorSphere');
            const innerCore = this.matrixGridBackwall.getObjectByName('innerCore');
            
            if (projectorSphere) {
                const sphereScale = 1 + Math.sin(time * 2) * 0.15;
                projectorSphere.scale.set(sphereScale, sphereScale, sphereScale);
                projectorSphere.material.opacity = 0.7 + Math.sin(time * 2) * 0.1;
            }
            
            if (innerCore) {
                const coreScale = 1 + Math.sin(time * 4) * 0.2;
                innerCore.scale.set(coreScale, coreScale, coreScale);
            }
            
            // Animate scan lines moving up (speed scales with intensity)
            if (this.holoScanLines) {
                this.holoScanLines.forEach(scanLine => {
                    scanLine.position.y += scanLine.userData.speed * 0.1 * intensity;
                    
                    // Reset when reaching top
                    if (scanLine.position.y > 15) {
                        scanLine.position.y = -15;
                    }
                    
                    // Pulse opacity (brighter with higher intensity)
                    scanLine.material.opacity = (0.4 + Math.sin(time * 3 + scanLine.position.y) * 0.2) * intensity;
                });
            }
            
            // Animate light particles streaming upward (more particles/faster with intensity)
            if (this.holoParticles) {
                this.holoParticles.forEach(particle => {
                    // Move particle (velocity scaled by intensity)
                    const velocityMultiplier = new THREE.Vector3(
                        particle.userData.velocity.x * intensity,
                        particle.userData.velocity.y * intensity,
                        particle.userData.velocity.z * intensity
                    );
                    particle.position.add(velocityMultiplier);
                    
                    // Update lifecycle (faster with higher intensity)
                    particle.userData.life += 0.005 * intensity;
                    
                    // Reset particle when it reaches top or dies
                    if (particle.position.y > particle.userData.maxHeight || particle.userData.life > 1) {
                        // Respawn at projector sphere
                        const angle = Math.random() * Math.PI * 2;
                        const spreadRadius = Math.random() * 2;
                        particle.position.set(
                            Math.cos(angle) * spreadRadius,
                            particle.userData.startY,
                            -8 + Math.random() * 1
                        );
                        particle.userData.life = 0;
                        
                        // Randomize velocity slightly
                        particle.userData.velocity.y = 0.05 + Math.random() * 0.1;
                    }
                    
                    // Fade based on lifecycle (brighter with intensity)
                    particle.material.opacity = Math.sin(particle.userData.life * Math.PI) * 0.8 * Math.min(intensity, 1.2);
                    
                    // Change color as particle rises
                    const heightRatio = (particle.position.y - particle.userData.startY) / 
                                       (particle.userData.maxHeight - particle.userData.startY);
                    particle.material.color.setHSL(0.5 + heightRatio * 0.2, 1, 0.5);
                    
                    // Scale particle as it rises (larger with intensity)
                    const scale = (1 + heightRatio * 0.5) * Math.min(intensity, 1.3);
                    particle.scale.set(scale, scale, scale);
                });
            }
            
            // Rotate projection cone slowly (speed scales with intensity)
            const projectionCone = this.matrixGridBackwall.getObjectByName('projectionCone');
            if (projectionCone) {
                projectionCone.rotation.z += 0.002 * intensity;
                projectionCone.material.opacity = 0.05 + Math.sin(time) * 0.03;
            }
            
            // Pulse holographic grid
            const holoGroup = this.matrixGridBackwall.getObjectByName('HolographicProjector');
            if (holoGroup) {
                const gridPlane = holoGroup.children.find(child => 
                    child.geometry && child.geometry.type === 'PlaneGeometry'
                );
                if (gridPlane) {
                    gridPlane.material.opacity = 0.1 + Math.sin(time * 1.5) * 0.05;
                }
            }
        }
    }
    
    /**
     * Materialize header section (top-left)
     */
    materializeHeader(headerData) {
        this.document.header = headerData;
        
        // Clear existing header words
        this.clearSection('header');
        
        const headerText = `${headerData.name}\n${headerData.city}, ${headerData.state} ${headerData.zipCode}`;
        const lines = headerText.split('\n');
        
        lines.forEach((line, lineIndex) => {
            const words = line.match(/\b\w+\b/g) || [];
            words.forEach((word, wordIndex) => {
                const position = new THREE.Vector3(
                    -12 + (wordIndex * 1.5),  // Top-left positioning
                    15 - (lineIndex * 1.2),   // Stack downward
                    0
                );
                
                this.materializeWord(word, position, 'header', wordIndex * 200);
            });
        });
    }
    
    /**
     * Materialize title section (center-top)
     */
    materializeTitle(titleText) {
        this.document.title = titleText;
        
        // Clear existing title words
        this.clearSection('title');
        
        const words = titleText.match(/\b\w+\b/g) || [];
        const titleY = 12;
        
        words.forEach((word, i) => {
            const totalWidth = words.length * 2;
            const position = new THREE.Vector3(
                -totalWidth / 2 + (i * 2),  // Center horizontally
                titleY,                      // Top position
                0
            );
            
            this.materializeWord(word, position, 'title', i * 200, 1.5);  // Larger scale for title
        });
    }
    
    /**
     * Materialize paragraph with indentation
     */
    materializeParagraph(paragraphText, paragraphIndex) {
        this.document.paragraphs.push(paragraphText);
        
        const words = paragraphText.match(/\b\w+\b/g) || [];
        const startY = 8 - (paragraphIndex * 3);  // Stack paragraphs
        
        // Calculate word positions based on current shape
        words.forEach((word, i) => {
            let position;
            
            // First word has indentation
            const indent = (i === 0) ? 1 : 0;
            
            switch(this.currentShape) {
                case 'sphere':
                    position = this.calculateSpherePosition(i, words.length);
                    position.y += startY;
                    break;
                    
                case 'cube':
                    position = this.calculateCubePosition(i, words.length);
                    position.y += startY;
                    break;
                    
                case 'pyramid':
                    position = this.calculatePyramidPosition(i, words.length);
                    position.y += startY;
                    break;
                    
                case 'sine':
                    position = this.calculateSinePosition(i, words.length);
                    position.y += startY;
                    break;
                    
                case 'helix':
                    position = this.calculateHelixPosition(i, words.length);
                    position.y += startY;
                    break;
                    
                case 'linear':
                default:
                    // Linear text flow (like a document) - use configurable settings
                    const lineIndex = Math.floor(i / this.wordsPerLine);
                    const posInLine = i % this.wordsPerLine;
                    
                    let xOffset = 0;
                    if (this.alignment === 'center') {
                        xOffset = -(this.wordsPerLine * 2.5) / 2;
                    } else if (this.alignment === 'right') {
                        xOffset = -(this.wordsPerLine * 2.5);
                    } else {
                        xOffset = -10;  // left alignment
                    }
                    
                    position = new THREE.Vector3(
                        xOffset + (posInLine * 2.5) + indent,
                        startY - (lineIndex * this.lineSpacing),
                        0
                    );
                    break;
            }
            
            this.materializeWord(word, position, 'body', i * 150);
        });
    }
    
    /**
     * Materialize single word with individual 3D letter geometries
     * Each letter is a separate 3D mesh that materializes from center
     */
    materializeWord(word, targetPosition, section, delay = 0, scale = 1) {
        if (!this.fontsReady) {
            console.warn('⏳ Fonts not ready yet, queuing word:', word);
            setTimeout(() => this.materializeWord(word, targetPosition, section, delay, scale), 500);
            return;
        }
        
        setTimeout(() => {
            const font = this.loadedFonts[this.currentFont] || this.loadedFonts['helvetiker'];
            if (!font) {
                console.error('❌ No fonts available!');
                return;
            }
            
            const letters = word.split('');
            const spacing = this.letterSpacing * scale;  // Use configurable spacing
            const totalWidth = (letters.length - 1) * spacing;
            
            // Create each letter as a separate 3D geometry
            letters.forEach((char, letterIndex) => {
                const letterGroup = new THREE.Group();
                
                // Calculate letter position within the word
                const letterOffsetX = (letterIndex * spacing) - (totalWidth / 2);
                
                // Create 3D text geometry for this letter - use configurable settings
                const textGeometry = new THREE.TextGeometry(char, {
                    font: font,
                    size: this.letterSize * scale,
                    height: this.extrusionDepth * scale,  // Use configurable 3D depth
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.02 * scale,
                    bevelSize: 0.01 * scale,
                    bevelOffset: 0,
                    bevelSegments: 5
                });
                
                // Center the geometry
                textGeometry.computeBoundingBox();
                const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
                textGeometry.translate(centerOffset, 0, 0);
                
                // Apply material with configurable settings
                const material = this.materials[this.currentMaterial].clone();
                material.color = new THREE.Color(this.currentColor);
                
                // Font weight simulation (adjust material properties)
                if (this.fontWeight === 'bold' || this.fontWeight === 'bolder') {
                    material.metalness = Math.min(material.metalness + 0.2, 1.0);
                }
                
                if (material.emissive) {
                    material.emissive = new THREE.Color(this.currentColor);
                    material.emissiveIntensity = 0.3;
                }
                
                const letterMesh = new THREE.Mesh(textGeometry, material);
                letterMesh.castShadow = true;
                letterMesh.receiveShadow = true;
                letterGroup.add(letterMesh);
                
                // Add underline if decoration is set
                if (this.textDecoration === 'underline') {
                    const underlineGeom = new THREE.BoxGeometry(this.letterSize * scale, 0.02, 0.02);
                    const underlineMesh = new THREE.Mesh(underlineGeom, material.clone());
                    underlineMesh.position.y = -this.letterSize * scale * 0.3;
                    letterGroup.add(underlineMesh);
                }
                
                // Store letter data
                const finalPosition = targetPosition.clone();
                finalPosition.x += letterOffsetX;
                
                letterGroup.userData = {
                    letter: char,
                    word: word,
                    letterIndex: letterIndex,
                    section: section,
                    targetPosition: finalPosition,
                    targetScale: scale
                };
                
                // ✨ START AT CENTER (0, 0, 0) - Micro size
                letterGroup.position.set(0, 0, 0);
                letterGroup.scale.set(0.001, 0.001, 0.001);
                
                // Micro → Macro animation (staggered per letter) - use configurable delay
                this.animateLetterMaterialization(letterGroup, letterIndex * this.staggerDelay);
                
                this.scene.add(letterGroup);
                this.letterGroups[section].push(letterGroup);
            });
            
        }, delay);
    }
    
    /**
     * Animate single letter from micro to macro scale with zoom effect
     */
    animateLetterMaterialization(letterGroup, additionalDelay = 0) {
        setTimeout(() => {
            const duration = this.animationSpeed;  // Use configurable speed
            const startTime = Date.now();
            const startPos = letterGroup.position.clone();
            const targetPos = letterGroup.userData.targetPosition;
            const targetScale = letterGroup.userData.targetScale;
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-cubic)
                const eased = 1 - Math.pow(1 - progress, 3);
                
                // Interpolate position from center outward
                letterGroup.position.lerpVectors(startPos, targetPos, eased);
                
                // Scale from 0.001 to targetScale
                const currentScale = 0.001 + (targetScale - 0.001) * eased;
                letterGroup.scale.set(currentScale, currentScale, currentScale);
                
                // Add rotation and wobble during materialization (if enabled)
                if (this.rotationEnabled) {
                    letterGroup.rotation.y = (1 - progress) * Math.PI * 2;
                    letterGroup.rotation.x = Math.sin(progress * Math.PI) * 0.2;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Final position reached - settle
                    letterGroup.rotation.set(0, 0, 0);
                }
            };
            
            animate();
        }, additionalDelay);
    }
    
    /**
     * Animate word from micro to macro scale with zoom effect
     */
    animateWordMaterialization(wordGroup) {
        const duration = 1500;  // 1.5 seconds
        const startTime = Date.now();
        const startPos = wordGroup.position.clone();
        const targetPos = wordGroup.userData.targetPosition;
        const targetScale = wordGroup.userData.targetScale;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate position
            wordGroup.position.lerpVectors(startPos, targetPos, eased);
            
            // Scale from 0.001 to targetScale
            const currentScale = 0.001 + (targetScale - 0.001) * eased;
            wordGroup.scale.set(currentScale, currentScale, currentScale);
            
            // Add slight rotation during materialization
            wordGroup.rotation.y = (1 - progress) * Math.PI * 2;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Final position reached
                wordGroup.rotation.y = 0;
            }
        };
        
        animate();
    }
    
    /**
     * Create word geometry based on shape
     */
    createWordGeometry(shape) {
        switch(shape) {
            case 'sphere':
                return new THREE.SphereGeometry(0.3, 16, 16);
            case 'cube':
                return new THREE.BoxGeometry(0.5, 0.5, 0.5);
            case 'pyramid':
                return new THREE.ConeGeometry(0.3, 0.6, 4);
            case 'diamond':
                return new THREE.OctahedronGeometry(0.3);
            case 'sine':
                return this.createSineGeometry();
            case 'helix':
                return this.createHelixGeometry();
            default:
                return new THREE.SphereGeometry(0.3, 16, 16);
        }
    }
    
    createSineGeometry() {
        const curve = new THREE.Curve();
        curve.getPoint = function(t) {
            return new THREE.Vector3(
                (t * 2 - 1) * 0.5,
                Math.sin(t * Math.PI * 4) * 0.15,
                0
            );
        };
        return new THREE.TubeGeometry(curve, 32, 0.05, 8, false);
    }
    
    createHelixGeometry() {
        const curve = new THREE.Curve();
        curve.getPoint = function(t) {
            const angle = t * Math.PI * 4;
            return new THREE.Vector3(
                Math.cos(angle) * 0.2,
                (t * 2 - 1) * 0.3,
                Math.sin(angle) * 0.2
            );
        };
        return new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
    }
    
    /**
     * Create text sprite
     */
    createTextSprite(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, 256, 64);
        
        context.font = 'bold 24px Arial';
        context.fillStyle = this.currentColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text.substring(0, 15), 128, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.5, 0.375, 1);
        
        return sprite;
    }
    
    /**
     * Position calculation methods
     */
    calculateSpherePosition(index, total) {
        const phi = Math.acos(-1 + (2 * index) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        const radius = 5;
        
        return new THREE.Vector3(
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.cos(phi),
            radius * Math.sin(theta) * Math.sin(phi)
        );
    }
    
    calculateCubePosition(index, total) {
        const gridSize = Math.ceil(Math.cbrt(total));
        const x = (index % gridSize) - gridSize / 2;
        const y = Math.floor(index / gridSize) % gridSize;
        const z = Math.floor(index / (gridSize * gridSize)) - gridSize / 2;
        
        return new THREE.Vector3(x * 1.5, y * 1.5, z * 1.5);
    }
    
    calculatePyramidPosition(index, total) {
        const layer = Math.floor(Math.sqrt(index));
        const posInLayer = index - layer * layer;
        
        return new THREE.Vector3(
            (posInLayer - layer) * 1.5,
            -layer * 1.2,
            0
        );
    }
    
    calculateSinePosition(index, total) {
        const t = index / total;
        return new THREE.Vector3(
            (t * 15) - 7.5,
            Math.sin(t * Math.PI * 4) * 2,
            0
        );
    }
    
    calculateHelixPosition(index, total) {
        const t = index / total;
        const angle = t * Math.PI * 6;
        return new THREE.Vector3(
            Math.cos(angle) * 4,
            (t * 15) - 7.5,
            Math.sin(angle) * 4
        );
    }
    
    /**
     * Clear section
     */
    clearSection(section) {
        this.letterGroups[section].forEach(letter => {
            this.scene.remove(letter);
        });
        this.letterGroups[section] = [];
    }
    
    /**
     * Clear entire document
     */
    clearDocument() {
        Object.keys(this.letterGroups).forEach(section => {
            this.clearSection(section);
        });
        
        this.document = {
            header: { name: '', city: '', state: '', zipCode: '' },
            title: '',
            paragraphs: []
        };
    }
    
    /**
     * Export to PDF format (generates PDF-ready data)
     */
    exportToPDF() {
        const pdfData = {
            header: this.document.header,
            title: this.document.title,
            body: this.document.paragraphs.join('\n\n'),
            metadata: {
                wordCount: this.getTotalWordCount(),
                created: new Date().toISOString(),
                shape: this.currentShape,
                material: this.currentMaterial
            }
        };
        
        console.log('📄 PDF Export Data:', pdfData);
        
        // Create formatted text for download
        const formattedText = this.formatForPDF(pdfData);
        this.downloadTextFile(formattedText, 'document_3d.txt');
        
        return pdfData;
    }
    
    /**
     * Format document for PDF/text export
     */
    formatForPDF(data) {
        let text = '';
        
        // Header
        text += `${data.header.name}\n`;
        text += `${data.header.city}, ${data.header.state} ${data.header.zipCode}\n\n\n`;
        
        // Title
        text += `${data.title.toUpperCase()}\n\n`;
        
        // Body
        data.body.split('\n\n').forEach(paragraph => {
            text += `    ${paragraph}\n\n`;  // Indentation
        });
        
        // Metadata
        text += `\n\n---\n`;
        text += `Word Count: ${data.metadata.wordCount}\n`;
        text += `Created: ${data.metadata.created}\n`;
        text += `3D Shape: ${data.metadata.shape}\n`;
        text += `Material: ${data.metadata.material}\n`;
        
        return text;
    }
    
    /**
     * Download text file
     */
    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Get total word count
     */
    getTotalWordCount() {
        const headerWords = Object.values(this.document.header).join(' ').match(/\b\w+\b/g) || [];
        const titleWords = this.document.title.match(/\b\w+\b/g) || [];
        const bodyWords = this.document.paragraphs.join(' ').match(/\b\w+\b/g) || [];
        
        return headerWords.length + titleWords.length + bodyWords.length;
    }
    
    /**
     * Update material
     */
    setMaterial(materialName) {
        this.currentMaterial = materialName;
        if (this.gridSurface) {
            this.gridSurface.material = this.materials[materialName].clone();
            this.gridSurface.material.transparent = true;
            this.gridSurface.material.opacity = 0.3;
        }
    }
    
    /**
     * Update shape
     */
    setShape(shapeName) {
        this.currentShape = shapeName;
    }
    
    /**
     * Update color
     */
    setColor(color) {
        this.currentColor = color;
    }
    
    /**
     * Update font style for 3D letters
     */
    setFont(fontName) {
        if (this.loadedFonts[fontName]) {
            this.currentFont = fontName;
            console.log(`🎨 Font changed to: ${fontName}`);
        } else {
            console.warn(`⚠️ Font not available: ${fontName}`);
        }
    }
    
    /**
     * Advanced formatting setters
     */
    setLetterSize(size) {
        this.letterSize = size;
        console.log(`📏 Letter size: ${size}`);
    }
    
    setLetterSpacing(spacing) {
        this.letterSpacing = spacing;
        console.log(`↔️ Letter spacing: ${spacing}`);
    }
    
    setExtrusionDepth(depth) {
        this.extrusionDepth = depth;
        console.log(`📐 Extrusion depth: ${depth}`);
    }
    
    setLineSpacing(spacing) {
        this.lineSpacing = spacing;
        console.log(`↕️ Line spacing: ${spacing}`);
    }
    
    setWordsPerLine(count) {
        this.wordsPerLine = count;
        console.log(`📝 Words per line: ${count}`);
    }
    
    setAlignment(align) {
        this.alignment = align;
        console.log(`📍 Alignment: ${align}`);
    }
    
    setFontWeight(weight) {
        this.fontWeight = weight;
        console.log(`💪 Font weight: ${weight}`);
    }
    
    setTextDecoration(decoration) {
        this.textDecoration = decoration;
        console.log(`✏️ Text decoration: ${decoration}`);
    }
    
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
        console.log(`⏱️ Animation speed: ${speed}ms`);
    }
    
    setStaggerDelay(delay) {
        this.staggerDelay = delay;
        console.log(`⏳ Stagger delay: ${delay}ms`);
    }
    
    setRotationEnabled(enabled) {
        this.rotationEnabled = enabled;
        console.log(`🔄 Rotation animation: ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Document3DCanvas;
}
