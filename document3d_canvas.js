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
        
        // Load fonts
        this.loadFonts();
        
        console.log('📄 3D Document Canvas initialized with 3D letter geometries!');
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
