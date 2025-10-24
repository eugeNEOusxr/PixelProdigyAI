/**
 * 🧬 WordWeaver Document Format Engine
 * Applies Word/Google Docs formatting preferences to 3D text universe
 * 
 * Supports:
 * - Microsoft Word (.docx) formatting
 * - Google Docs styling
 * - PDF document layout
 * - TXT/MD plain text
 * - Writer's procedural formatting preferences
 * 
 * Eugene Ousos - PixelProdigy AI
 * October 24, 2025
 */

class WordWeaverFormatEngine {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Document format profiles
        this.formatProfiles = {
            // Microsoft Word style
            word: {
                name: 'Microsoft Word',
                pageWidth: 8.5, // inches in 3D units
                pageHeight: 11,
                marginTop: 1.0,
                marginBottom: 1.0,
                marginLeft: 1.0,
                marginRight: 1.0,
                fontSize: 0.4,
                lineHeight: 1.15, // Word default
                paragraphSpacing: 0.5,
                indentFirstLine: 0.5,
                fontFamily: 'Calibri', // Word default
                alignment: 'left',
                headingScale: {
                    h1: 2.0,
                    h2: 1.5,
                    h3: 1.17
                },
                colors: {
                    body: '#000000',
                    heading: '#2E75B6',
                    link: '#0563C1'
                }
            },
            
            // Google Docs style
            google: {
                name: 'Google Docs',
                pageWidth: 8.5,
                pageHeight: 11,
                marginTop: 1.0,
                marginBottom: 1.0,
                marginLeft: 1.0,
                marginRight: 1.0,
                fontSize: 0.36, // 11pt
                lineHeight: 1.15,
                paragraphSpacing: 0.4,
                indentFirstLine: 0,
                fontFamily: 'Arial',
                alignment: 'left',
                headingScale: {
                    h1: 1.82,
                    h2: 1.45,
                    h3: 1.27
                },
                colors: {
                    body: '#000000',
                    heading: '#000000',
                    link: '#1155CC'
                }
            },
            
            // Blog/Web format
            blog: {
                name: 'Blog Post',
                pageWidth: 12,
                pageHeight: 20,
                marginTop: 1.5,
                marginBottom: 1.5,
                marginLeft: 2.0,
                marginRight: 2.0,
                fontSize: 0.38,
                lineHeight: 1.6, // Better readability for web
                paragraphSpacing: 0.8,
                indentFirstLine: 0,
                fontFamily: 'Georgia',
                alignment: 'left',
                headingScale: {
                    h1: 2.5,
                    h2: 1.8,
                    h3: 1.4
                },
                colors: {
                    body: '#333333',
                    heading: '#1a1a1a',
                    link: '#0066cc'
                }
            },
            
            // Academic/PDF format
            pdf: {
                name: 'PDF Document',
                pageWidth: 8.5,
                pageHeight: 11,
                marginTop: 1.0,
                marginBottom: 1.0,
                marginLeft: 1.25,
                marginRight: 1.25,
                fontSize: 0.4,
                lineHeight: 2.0, // Double spaced
                paragraphSpacing: 0,
                indentFirstLine: 0.5,
                fontFamily: 'Times New Roman',
                alignment: 'justified',
                headingScale: {
                    h1: 1.5,
                    h2: 1.3,
                    h3: 1.15
                },
                colors: {
                    body: '#000000',
                    heading: '#000000',
                    link: '#000000'
                }
            },
            
            // Creative/Manuscript format
            manuscript: {
                name: 'Manuscript',
                pageWidth: 8.5,
                pageHeight: 11,
                marginTop: 1.0,
                marginBottom: 1.0,
                marginLeft: 1.5,
                marginRight: 1.0,
                fontSize: 0.42, // 12pt Courier
                lineHeight: 2.0, // Double spaced
                paragraphSpacing: 0,
                indentFirstLine: 0.5,
                fontFamily: 'Courier New',
                alignment: 'left',
                headingScale: {
                    h1: 1.0, // Same size as body in manuscripts
                    h2: 1.0,
                    h3: 1.0
                },
                colors: {
                    body: '#000000',
                    heading: '#000000',
                    link: '#000000'
                }
            }
        };
        
        // Current active format
        this.currentFormat = 'word';
        this.customPreferences = {};
        
        // Document structure
        this.document = {
            title: '',
            subtitle: '',
            author: '',
            date: '',
            sections: []
        };
        
        // 3D text meshes organized by section
        this.textMeshes = [];
        
        // Font loader
        this.fontLoader = new THREE.FontLoader();
        this.loadedFonts = {};
        
        console.log('🧬 WordWeaver Format Engine initialized');
        console.log(`📋 Loaded ${Object.keys(this.formatProfiles).length} format profiles`);
    }
    
    /**
     * Set document format profile
     */
    setFormat(formatName) {
        if (!this.formatProfiles[formatName]) {
            console.warn(`⚠️ Format '${formatName}' not found, using 'word' default`);
            formatName = 'word';
        }
        
        this.currentFormat = formatName;
        console.log(`✅ Format set to: ${this.formatProfiles[formatName].name}`);
        
        return this.formatProfiles[formatName];
    }
    
    /**
     * Apply custom writer preferences (overrides format profile)
     */
    applyWriterPreferences(preferences) {
        this.customPreferences = {
            ...this.formatProfiles[this.currentFormat],
            ...preferences
        };
        
        console.log('✅ Custom writer preferences applied:', preferences);
    }
    
    /**
     * Get active format settings (profile + custom overrides)
     */
    getActiveFormat() {
        return {
            ...this.formatProfiles[this.currentFormat],
            ...this.customPreferences
        };
    }
    
    /**
     * Create 3D document page (visual reference plane)
     */
    createDocumentPage(pageNumber = 1, positionZ = 0) {
        const format = this.getActiveFormat();
        
        // Page geometry
        const pageGeometry = new THREE.PlaneGeometry(
            format.pageWidth,
            format.pageHeight
        );
        
        // Page material (white paper)
        const pageMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            roughness: 0.8,
            metalness: 0.0
        });
        
        const pageMesh = new THREE.Mesh(pageGeometry, pageMaterial);
        pageMesh.position.set(0, 0, positionZ);
        pageMesh.name = `Page_${pageNumber}`;
        
        // Add subtle shadow
        pageMesh.castShadow = true;
        pageMesh.receiveShadow = true;
        
        // Margin guide lines (optional visual aid)
        const marginLines = this.createMarginGuides(format);
        marginLines.position.z = positionZ + 0.01; // Slightly in front
        
        const pageGroup = new THREE.Group();
        pageGroup.add(pageMesh);
        pageGroup.add(marginLines);
        pageGroup.name = `PageGroup_${pageNumber}`;
        
        this.scene.add(pageGroup);
        
        console.log(`📄 Created page ${pageNumber} (${format.name} format)`);
        
        return pageGroup;
    }
    
    /**
     * Create margin guide lines
     */
    createMarginGuides(format) {
        const group = new THREE.Group();
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.3
        });
        
        // Calculate margin boundaries
        const contentWidth = format.pageWidth - format.marginLeft - format.marginRight;
        const contentHeight = format.pageHeight - format.marginTop - format.marginBottom;
        
        const leftX = -format.pageWidth / 2 + format.marginLeft;
        const rightX = format.pageWidth / 2 - format.marginRight;
        const topY = format.pageHeight / 2 - format.marginTop;
        const bottomY = -format.pageHeight / 2 + format.marginBottom;
        
        // Top margin line
        const topPoints = [
            new THREE.Vector3(leftX, topY, 0),
            new THREE.Vector3(rightX, topY, 0)
        ];
        const topGeom = new THREE.BufferGeometry().setFromPoints(topPoints);
        group.add(new THREE.Line(topGeom, lineMaterial));
        
        // Bottom margin line
        const bottomPoints = [
            new THREE.Vector3(leftX, bottomY, 0),
            new THREE.Vector3(rightX, bottomY, 0)
        ];
        const bottomGeom = new THREE.BufferGeometry().setFromPoints(bottomPoints);
        group.add(new THREE.Line(bottomGeom, lineMaterial));
        
        // Left margin line
        const leftPoints = [
            new THREE.Vector3(leftX, topY, 0),
            new THREE.Vector3(leftX, bottomY, 0)
        ];
        const leftGeom = new THREE.BufferGeometry().setFromPoints(leftPoints);
        group.add(new THREE.Line(leftGeom, lineMaterial));
        
        // Right margin line
        const rightPoints = [
            new THREE.Vector3(rightX, topY, 0),
            new THREE.Vector3(rightX, bottomY, 0)
        ];
        const rightGeom = new THREE.BufferGeometry().setFromPoints(rightPoints);
        group.add(new THREE.Line(rightGeom, lineMaterial));
        
        return group;
    }
    
    /**
     * Position text according to document format
     */
    calculateTextPosition(lineNumber, columnPosition, elementType = 'body') {
        const format = this.getActiveFormat();
        
        // Starting position (top-left of content area)
        const startX = -format.pageWidth / 2 + format.marginLeft;
        const startY = format.pageHeight / 2 - format.marginTop;
        
        // Calculate Y position (line by line from top)
        let y = startY;
        
        // Apply heading spacing
        if (elementType.startsWith('h')) {
            const headingSize = format.headingScale[elementType] || 1.0;
            y -= lineNumber * (format.fontSize * headingSize * format.lineHeight);
        } else {
            y -= lineNumber * (format.fontSize * format.lineHeight);
            
            // Apply paragraph spacing
            y -= Math.floor(lineNumber / this.calculateWordsPerLine(format)) * format.paragraphSpacing;
        }
        
        // Calculate X position (character by character from left)
        let x = startX;
        
        // Apply first-line indent for paragraphs
        if (elementType === 'body' && columnPosition === 0) {
            x += format.indentFirstLine;
        }
        
        // Add character spacing
        x += columnPosition * (format.fontSize * 0.6); // Approximate character width
        
        return new THREE.Vector3(x, y, 0);
    }
    
    /**
     * Calculate words per line based on format
     */
    calculateWordsPerLine(format) {
        const contentWidth = format.pageWidth - format.marginLeft - format.marginRight - format.indentFirstLine;
        const avgWordWidth = format.fontSize * 5; // Approximate: 5 characters per word
        return Math.floor(contentWidth / avgWordWidth);
    }
    
    /**
     * Create 3D text with proper formatting
     */
    async create3DText(text, elementType = 'body', position = new THREE.Vector3()) {
        const format = this.getActiveFormat();
        
        // Load font if not already loaded
        if (!this.loadedFonts[format.fontFamily]) {
            await this.loadFont(format.fontFamily);
        }
        
        // Determine size and color
        let size = format.fontSize;
        let color = format.colors.body;
        
        if (elementType.startsWith('h')) {
            size *= format.headingScale[elementType] || 1.0;
            color = format.colors.heading;
        }
        
        // Create text geometry
        const textGeometry = new THREE.TextGeometry(text, {
            font: this.loadedFonts[format.fontFamily],
            size: size,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.01,
            bevelSegments: 5
        });
        
        // Create material
        const textMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.5,
            metalness: 0.1
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);
        textMesh.castShadow = true;
        
        this.scene.add(textMesh);
        this.textMeshes.push(textMesh);
        
        return textMesh;
    }
    
    /**
     * Load font asynchronously
     */
    loadFont(fontName) {
        return new Promise((resolve, reject) => {
            const fontMap = {
                'Calibri': 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
                'Arial': 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
                'Georgia': 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json',
                'Times New Roman': 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json',
                'Courier New': 'https://threejs.org/examples/fonts/droid/droid_sans_mono_regular.typeface.json'
            };
            
            const fontPath = fontMap[fontName] || fontMap['Arial'];
            
            this.fontLoader.load(
                fontPath,
                (font) => {
                    this.loadedFonts[fontName] = font;
                    console.log(`✅ Font loaded: ${fontName}`);
                    resolve(font);
                },
                undefined,
                (error) => {
                    console.error(`❌ Failed to load font: ${fontName}`, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Clear all 3D text meshes
     */
    clearDocument() {
        this.textMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        
        this.textMeshes = [];
        console.log('🗑️ Document cleared');
    }
    
    /**
     * Export current format settings as JSON
     */
    exportFormatSettings() {
        return JSON.stringify(this.getActiveFormat(), null, 2);
    }
    
    /**
     * Import format settings from JSON
     */
    importFormatSettings(jsonString) {
        try {
            const settings = JSON.parse(jsonString);
            this.applyWriterPreferences(settings);
            console.log('✅ Format settings imported');
            return true;
        } catch (error) {
            console.error('❌ Failed to import format settings:', error);
            return false;
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordWeaverFormatEngine;
}
