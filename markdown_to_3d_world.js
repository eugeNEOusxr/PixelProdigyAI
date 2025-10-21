/**
 * ═══════════════════════════════════════════════════════════
 * MARKDOWN TO 3D VERTICES - THE REVELATION
 * ═══════════════════════════════════════════════════════════
 * 
 * Turn markdown documentation into LIVING 3D vertices
 * Each word becomes a point in space
 * Each asterisk becomes a vertex marker
 * The DOCUMENTATION becomes the WORLD
 */

class MarkdownTo3DWorld {
    constructor(scene) {
        this.scene = scene;
        this.vertices = [];
        this.wordMeshes = [];
        this.connections = [];
        
        console.log('📝→🌍 Markdown to 3D World initialized!');
    }
    
    /**
     * Parse markdown and create 3D vertices for each element
     */
    parseMarkdownToVertices(markdownText) {
        const lines = markdownText.split('\n');
        let vertexIndex = 0;
        let currentY = 0;
        
        lines.forEach((line, lineNum) => {
            // HEADINGS = Major vertex anchors (larger spheres)
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2];
                
                this.createVertexNode({
                    text: text,
                    position: new THREE.Vector3(0, currentY, 0),
                    size: 0.5 - (level * 0.05),  // Bigger for H1, smaller for H6
                    color: 0x00ffff,
                    type: 'heading',
                    level: level,
                    index: vertexIndex++
                });
                
                currentY -= 1.5;  // Space for next line
            }
            
            // ASTERISKS = Vertex markers (small points)
            const asteriskMatches = [...line.matchAll(/\*([^*]+)\*/g)];
            asteriskMatches.forEach((match, i) => {
                const text = match[1];
                const xOffset = (i - asteriskMatches.length / 2) * 2;
                
                this.createVertexNode({
                    text: text,
                    position: new THREE.Vector3(xOffset, currentY, 0),
                    size: 0.15,
                    color: 0xff6600,
                    type: 'asterisk',
                    index: vertexIndex++
                });
            });
            
            // WORDS = Individual vertices
            const words = line.replace(/[#*`]/g, '').trim().split(/\s+/);
            words.forEach((word, i) => {
                if (word.length > 0) {
                    const xOffset = (i - words.length / 2) * 0.8;
                    
                    this.createVertexNode({
                        text: word,
                        position: new THREE.Vector3(xOffset, currentY - 0.5, 0),
                        size: 0.08,
                        color: 0x00ff00,
                        type: 'word',
                        index: vertexIndex++
                    });
                }
            });
            
            currentY -= 0.3;  // Line spacing
        });
        
        // Connect related vertices
        this.createConnections();
        
        console.log(`📊 Created ${this.vertices.length} vertices from markdown`);
        
        return this.vertices;
    }
    
    /**
     * Create a 3D vertex node for a markdown element
     */
    createVertexNode(config) {
        const { text, position, size, color, type, level, index } = config;
        
        // Create sphere for vertex
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            roughness: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        // Store vertex data
        const vertex = {
            mesh: mesh,
            text: text,
            position: position.clone(),
            type: type,
            level: level,
            index: index,
            // Shoulder dynamics stored in each letter!
            dynamics: this.calculateShoulderDynamics(text)
        };
        
        // Add label
        this.addTextLabel(mesh, text, size);
        
        this.scene.add(mesh);
        this.vertices.push(vertex);
        this.wordMeshes.push(mesh);
        
        return vertex;
    }
    
    /**
     * Calculate shoulder dynamics from text
     * Each letter holds a value!
     */
    calculateShoulderDynamics(text) {
        const dynamics = {
            rotation: 0,
            extension: 0,
            breathing: 0
        };
        
        // Each letter contributes to shoulder values
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            
            // Map character to shoulder parameters
            dynamics.rotation += (charCode % 360) / 360;  // 0-1
            dynamics.extension += ((charCode * 7) % 100) / 100;  // 0-1
            dynamics.breathing += Math.sin(charCode / 10) * 0.5 + 0.5;  // 0-1
        }
        
        // Normalize by length
        dynamics.rotation /= text.length;
        dynamics.extension /= text.length;
        dynamics.breathing /= text.length;
        
        return dynamics;
    }
    
    /**
     * Add text label to vertex
     */
    addTextLabel(mesh, text, size) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, 256, 64);
        
        context.font = '24px Arial';
        context.fillStyle = '#00ff00';
        context.textAlign = 'center';
        context.fillText(text.substring(0, 20), 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(size * 4, size, 1);
        sprite.position.y = size + 0.2;
        
        mesh.add(sprite);
    }
    
    /**
     * Create connections between related vertices
     */
    createConnections() {
        // Connect headings to their asterisks
        this.vertices.forEach((v1, i) => {
            if (v1.type === 'heading') {
                // Find asterisks below this heading
                for (let j = i + 1; j < this.vertices.length; j++) {
                    const v2 = this.vertices[j];
                    
                    if (v2.type === 'heading') break;  // Next heading
                    
                    if (v2.type === 'asterisk') {
                        this.createConnection(v1, v2, 0x00ffff);
                    }
                }
            }
        });
        
        // Connect asterisks to words
        this.vertices.forEach((v1, i) => {
            if (v1.type === 'asterisk') {
                // Find nearby words
                for (let j = i + 1; j < Math.min(i + 10, this.vertices.length); j++) {
                    const v2 = this.vertices[j];
                    
                    if (v2.type === 'word') {
                        this.createConnection(v1, v2, 0xff6600);
                    }
                }
            }
        });
    }
    
    /**
     * Create visible connection between two vertices
     */
    createConnection(v1, v2, color) {
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        
        const geometry = new THREE.BufferGeometry().setFromPoints([
            v1.position,
            v2.position
        ]);
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.connections.push({ v1, v2, line });
    }
    
    /**
     * Animate vertices based on their shoulder dynamics
     */
    animate(time) {
        this.vertices.forEach((vertex, i) => {
            const { dynamics } = vertex;
            const { mesh } = vertex;
            
            // Apply shoulder dynamics to vertex position
            mesh.position.y = vertex.position.y + Math.sin(time * dynamics.breathing) * 0.1;
            mesh.position.x = vertex.position.x + Math.cos(time * dynamics.rotation) * 0.05;
            mesh.position.z = vertex.position.z + Math.sin(time * dynamics.extension) * 0.05;
            
            // Pulse emissive
            mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + i * 0.1) * 0.2;
        });
        
        // Update connection lines
        this.connections.forEach(({ v1, v2, line }) => {
            const positions = line.geometry.attributes.position.array;
            positions[0] = v1.mesh.position.x;
            positions[1] = v1.mesh.position.y;
            positions[2] = v1.mesh.position.z;
            positions[3] = v2.mesh.position.x;
            positions[4] = v2.mesh.position.y;
            positions[5] = v2.mesh.position.z;
            line.geometry.attributes.position.needsUpdate = true;
        });
    }
    
    /**
     * Get shoulder values from specific word
     */
    getShoulderFromWord(word) {
        const vertex = this.vertices.find(v => v.text.toLowerCase() === word.toLowerCase());
        
        if (vertex) {
            return {
                rotation: vertex.dynamics.rotation * Math.PI * 2,  // 0 to 2π
                extension: vertex.dynamics.extension,  // 0 to 1
                breathing: vertex.dynamics.breathing   // 0 to 1
            };
        }
        
        return null;
    }
    
    /**
     * Apply markdown vertices to actual 3D shoulder
     */
    applyToShoulder(shoulderMesh, word) {
        const dynamics = this.getShoulderFromWord(word);
        
        if (dynamics && shoulderMesh) {
            // The WORD controls the SHOULDER!
            shoulderMesh.rotation.y = dynamics.rotation;
            shoulderMesh.scale.setScalar(0.8 + dynamics.extension * 0.4);
            shoulderMesh.position.y += Math.sin(Date.now() * 0.001) * dynamics.breathing * 0.1;
            
            console.log(`📝 Word "${word}" controls shoulder:`, dynamics);
        }
    }
}

// ═══════════════════════════════════════════════════════════
// EXAMPLE: Turn documentation into living world
// ═══════════════════════════════════════════════════════════

const exampleMarkdown = `
# Shoulder Anatomy

The shoulder is composed of multiple *joints* and *muscles*.

## Rotation System

- *Rotation* controls the angle
- *Extension* controls the reach
- *Breathing* modulates all movement

### Dynamics

Each *letter* holds a *value* that controls shoulder behavior.

The *skin* acts as the function box boundary.
`;

// Usage in game:
// const mdWorld = new MarkdownTo3DWorld(scene);
// mdWorld.parseMarkdownToVertices(exampleMarkdown);
// 
// In animation loop:
// mdWorld.animate(time);
// mdWorld.applyToShoulder(playerShoulder, 'rotation');

if (typeof window !== 'undefined') {
    window.MarkdownTo3DWorld = MarkdownTo3DWorld;
}

/**
 * ═══════════════════════════════════════════════════════════
 * THE REVELATION EXPLAINED:
 * ═══════════════════════════════════════════════════════════
 * 
 * 1. VERTICES LIVE IN THE WORLD:
 *    Each markdown element becomes a 3D vertex
 *    Words, asterisks, headings = points in space
 * 
 * 2. LETTERS HOLD SHOULDER VALUES:
 *    "rotation" = r+o+t+a+t+i+o+n = shoulder angle
 *    Character codes map to dynamics
 *    Text IS data!
 * 
 * 3. SKIN = FUNCTION BOX:
 *    Smooth rendering = function boundary
 *    Cubic mesh hidden inside = code block
 *    Skin closes the function!
 * 
 * 4. MARKDOWN = NODE LANGUAGE:
 *    # Heading = Node
 *    * Asterisk = Input port
 *    Text = Data flow
 *    Visual programming in text form!
 * 
 * 5. DOESN'T BREAK EFFICIENCY:
 *    Markdown parsed once → creates vertices
 *    Vertices cached → reused every frame
 *    Words control parameters → no recalculation
 *    EFFICIENT!
 * 
 * THE DOCUMENTATION BECOMES THE ENGINE!
 * ═══════════════════════════════════════════════════════════
 */
