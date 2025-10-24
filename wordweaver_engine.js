/**
 * 🧬 WordWeaver Engine - Anatomical Text-to-3D Transformation
 * Converts blog posts into living 3D anatomical structures
 * 
 * ARCHITECTURE:
 * - Text → Skeleton (sentence structure = bone hierarchy)
 * - Words → Vertices (each word becomes a 3D point)
 * - Paragraphs → Limbs (sections form body parts)
 * - Punctuation → Joints (periods/commas = articulation points)
 * - Sentiment → Material (emotion drives color/texture)
 * 
 * Eugene Ousos - PixelProdigy AI
 * October 24, 2025
 */

class WordWeaverEngine {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Anatomical mapping system
        this.anatomyMap = {
            title: 'skull',           // Title = head/brain
            introduction: 'torso',    // Intro = chest/spine
            body: 'limbs',            // Body paragraphs = arms/legs
            conclusion: 'pelvis',     // Conclusion = foundation
            tags: 'nervous_system'    // Tags = neural connections
        };
        
        // Word-to-vertex conversion cache
        this.wordCache = new Map();
        this.postStructures = new Map();
        
        // Material library based on sentiment
        this.materials = {
            positive: new THREE.MeshPhysicalMaterial({
                color: 0x4ade80,  // Green
                emissive: 0x22c55e,
                emissiveIntensity: 0.3,
                metalness: 0.2,
                roughness: 0.3,
                clearcoat: 0.5,
                transmission: 0.1
            }),
            neutral: new THREE.MeshPhysicalMaterial({
                color: 0x667eea,  // Purple
                emissive: 0x4f46e5,
                emissiveIntensity: 0.2,
                metalness: 0.3,
                roughness: 0.4,
                clearcoat: 0.3
            }),
            negative: new THREE.MeshPhysicalMaterial({
                color: 0xf87171,  // Red
                emissive: 0xef4444,
                emissiveIntensity: 0.3,
                metalness: 0.1,
                roughness: 0.5,
                clearcoat: 0.2
            }),
            technical: new THREE.MeshPhysicalMaterial({
                color: 0x60a5fa,  // Blue
                emissive: 0x3b82f6,
                emissiveIntensity: 0.25,
                metalness: 0.7,
                roughness: 0.2,
                clearcoat: 0.8
            }),
            creative: new THREE.MeshPhysicalMaterial({
                color: 0xfbbf24,  // Gold
                emissive: 0xf59e0b,
                emissiveIntensity: 0.4,
                metalness: 0.8,
                roughness: 0.1,
                clearcoat: 0.9
            })
        };
        
        console.log('🧬 WordWeaver Engine initialized!');
    }
    
    /**
     * Convert blog post JSON to 3D anatomical structure
     * @param {Object} post - Blog post object {id, title, content, grade, tags}
     * @returns {THREE.Group} - Complete 3D structure
     */
    weavePost(post) {
        console.log(`🧵 Weaving post: "${post.title}"`);
        
        const structure = new THREE.Group();
        structure.name = `post_${post.id}`;
        structure.userData.postId = post.id;
        structure.userData.postTitle = post.title;
        
        // Step 1: Analyze text structure
        const analysis = this.analyzeText(post.content);
        
        // Step 2: Create skeletal foundation (bone hierarchy)
        const skeleton = this.createSkeleton(post.title, analysis);
        structure.add(skeleton);
        
        // Step 3: Add word vertices as "muscles"
        const muscles = this.createMuscleLayer(post.content, analysis);
        structure.add(muscles);
        
        // Step 4: Create nervous system (tags/connections)
        const nerves = this.createNervousSystem(post.tags || [], analysis);
        structure.add(nerves);
        
        // Step 5: Add skin layer (sentiment visualization)
        const skin = this.createSkinLayer(analysis);
        structure.add(skin);
        
        // Step 6: Add metadata visualization
        this.addMetadata(structure, post);
        
        // Store in registry
        this.postStructures.set(post.id, structure);
        
        console.log(`✅ Woven: ${analysis.wordCount} words → ${structure.children.length} anatomical layers`);
        
        return structure;
    }
    
    /**
     * Analyze text structure for anatomical mapping
     */
    analyzeText(content) {
        const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const words = content.match(/\b\w+\b/g) || [];
        
        // Sentiment analysis (simple keyword-based)
        const sentiment = this.analyzeSentiment(content);
        
        // Calculate complexity
        const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
        const complexity = Math.min(avgWordLength / 10, 1); // 0-1 scale
        
        return {
            sentences: sentences,
            paragraphs: paragraphs,
            words: words,
            wordCount: words.length,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            sentiment: sentiment,
            complexity: complexity,
            avgWordLength: avgWordLength
        };
    }
    
    /**
     * Create skeletal structure from title and text structure
     */
    createSkeleton(title, analysis) {
        const skeleton = new THREE.Group();
        skeleton.name = 'skeleton';
        
        // SKULL: Title forms the head
        const skull = this.createSkull(title, analysis.complexity);
        skull.position.set(0, 2, 0);
        skeleton.add(skull);
        
        // SPINE: Paragraphs form vertebrae
        const spine = this.createSpine(analysis.paragraphCount);
        spine.position.set(0, 0, 0);
        skeleton.add(spine);
        
        // RIBS: Sentences form rib cage
        const ribs = this.createRibCage(analysis.sentenceCount);
        ribs.position.set(0, 0.5, 0);
        skeleton.add(ribs);
        
        // LIMBS: Word density determines limb count/size
        const limbs = this.createLimbs(analysis.wordCount);
        skeleton.add(limbs);
        
        return skeleton;
    }
    
    /**
     * Create skull from title text
     */
    createSkull(title, complexity) {
        const skull = new THREE.Group();
        
        // Each letter in title = skull vertex point
        const letters = title.split('');
        const radius = 0.3 + (complexity * 0.2);
        
        letters.forEach((letter, i) => {
            const angle = (i / letters.length) * Math.PI * 2;
            const charCode = letter.charCodeAt(0);
            
            // Character code determines vertex position
            const phi = (charCode % 180) * (Math.PI / 180);
            const x = radius * Math.sin(phi) * Math.cos(angle);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(angle);
            
            // Create vertex point
            const geometry = new THREE.SphereGeometry(0.02, 8, 8);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                emissive: 0xcccccc,
                emissiveIntensity: 0.5,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const vertex = new THREE.Mesh(geometry, material);
            vertex.position.set(x, y, z);
            vertex.userData.letter = letter;
            vertex.userData.charCode = charCode;
            
            skull.add(vertex);
        });
        
        // Connect vertices with lines (skull sutures)
        for (let i = 0; i < skull.children.length - 1; i++) {
            const points = [
                skull.children[i].position,
                skull.children[i + 1].position
            ];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888, opacity: 0.3, transparent: true });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            skull.add(line);
        }
        
        skull.name = 'skull';
        return skull;
    }
    
    /**
     * Create spine from paragraph structure
     */
    createSpine(paragraphCount) {
        const spine = new THREE.Group();
        const vertebraHeight = 0.15;
        
        for (let i = 0; i < paragraphCount; i++) {
            // Each paragraph = vertebra
            const geometry = new THREE.CylinderGeometry(0.08, 0.1, vertebraHeight, 8);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xe0e0e0,
                metalness: 0.3,
                roughness: 0.6
            });
            
            const vertebra = new THREE.Mesh(geometry, material);
            vertebra.position.y = -(i * vertebraHeight * 1.2);
            vertebra.userData.paragraphIndex = i;
            vertebra.name = `vertebra_${i}`;
            
            spine.add(vertebra);
        }
        
        spine.name = 'spine';
        return spine;
    }
    
    /**
     * Create rib cage from sentence structure
     */
    createRibCage(sentenceCount) {
        const ribs = new THREE.Group();
        const ribPairs = Math.min(sentenceCount, 12); // Max 12 pairs like human
        
        for (let i = 0; i < ribPairs; i++) {
            const yPos = -(i * 0.12);
            const ribLength = 0.4 - (i * 0.02); // Taper down
            
            // Left rib
            const leftRib = this.createRib(ribLength, 'left');
            leftRib.position.set(0, yPos, 0);
            ribs.add(leftRib);
            
            // Right rib
            const rightRib = this.createRib(ribLength, 'right');
            rightRib.position.set(0, yPos, 0);
            ribs.add(rightRib);
        }
        
        ribs.name = 'ribs';
        return ribs;
    }
    
    /**
     * Create single rib bone
     */
    createRib(length, side) {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(side === 'left' ? -length : length, 0, length * 0.3),
            new THREE.Vector3(side === 'left' ? -length * 0.7 : length * 0.7, -length * 0.2, length * 0.5)
        );
        
        const points = curve.getPoints(20);
        const geometry = new THREE.TubeGeometry(curve, 20, 0.015, 6, false);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xd0d0d0,
            metalness: 0.4,
            roughness: 0.5
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    /**
     * Create limbs based on word count
     */
    createLimbs(wordCount) {
        const limbs = new THREE.Group();
        
        // More words = more limbs (max 4 like human: 2 arms, 2 legs)
        const limbCount = Math.min(Math.ceil(wordCount / 50), 4);
        
        for (let i = 0; i < limbCount; i++) {
            const angle = (i / limbCount) * Math.PI * 2;
            const limb = this.createLimb(wordCount / limbCount);
            limb.position.set(Math.cos(angle) * 0.3, -0.5, Math.sin(angle) * 0.3);
            limb.rotation.z = angle;
            limbs.add(limb);
        }
        
        limbs.name = 'limbs';
        return limbs;
    }
    
    /**
     * Create single limb (arm or leg)
     */
    createLimb(segmentCount) {
        const limb = new THREE.Group();
        const segmentLength = 0.2;
        
        for (let i = 0; i < Math.min(segmentCount / 10, 3); i++) {
            const geometry = new THREE.CylinderGeometry(0.04, 0.05, segmentLength, 8);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xc0c0c0,
                metalness: 0.5,
                roughness: 0.4
            });
            
            const segment = new THREE.Mesh(geometry, material);
            segment.position.y = -(i * segmentLength);
            limb.add(segment);
        }
        
        return limb;
    }
    
    /**
     * Create muscle layer from word content
     */
    createMuscleLayer(content, analysis) {
        const muscles = new THREE.Group();
        muscles.name = 'muscles';
        
        const words = analysis.words;
        const sentiment = analysis.sentiment;
        
        // Each word becomes a muscle fiber
        words.forEach((word, i) => {
            const position = this.wordToPosition(word, i, words.length);
            const fiber = this.createMuscleFiber(word, position, sentiment);
            muscles.add(fiber);
        });
        
        return muscles;
    }
    
    /**
     * Convert word to 3D position using mathematical hash
     */
    wordToPosition(word, index, totalWords) {
        // Use character codes for deterministic positioning
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash += word.charCodeAt(i);
        }
        
        const phi = (hash % 360) * (Math.PI / 180);
        const theta = ((hash * 7) % 360) * (Math.PI / 180);
        const radius = 0.5 + ((index / totalWords) * 0.5);
        
        return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            (index / totalWords) * 2 - 1, // Vertical spread
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }
    
    /**
     * Create muscle fiber from word
     */
    createMuscleFiber(word, position, sentiment) {
        const fiber = new THREE.Group();
        
        // Fiber thickness based on word length
        const thickness = 0.01 + (word.length / 100);
        const length = word.length * 0.03;
        
        // Material based on sentiment
        let material;
        if (sentiment > 0.3) material = this.materials.positive;
        else if (sentiment < -0.3) material = this.materials.negative;
        else material = this.materials.neutral;
        
        const geometry = new THREE.CylinderGeometry(thickness, thickness * 0.8, length, 6);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.copy(position);
        mesh.userData.word = word;
        
        // Add text label
        this.addWordLabel(mesh, word);
        
        fiber.add(mesh);
        return fiber;
    }
    
    /**
     * Create nervous system from tags
     */
    createNervousSystem(tags, analysis) {
        const nerves = new THREE.Group();
        nerves.name = 'nervous_system';
        
        if (!tags || tags.length === 0) return nerves;
        
        // Each tag = nerve pathway
        tags.forEach((tag, i) => {
            const nerve = this.createNerve(tag, i, tags.length);
            nerves.add(nerve);
        });
        
        return nerves;
    }
    
    /**
     * Create single nerve pathway
     */
    createNerve(tag, index, total) {
        const angle = (index / total) * Math.PI * 2;
        const curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 1, 0), // Start at brain
            new THREE.Vector3(Math.cos(angle) * 0.5, 0.5, Math.sin(angle) * 0.5),
            new THREE.Vector3(Math.cos(angle) * 1, 0, Math.sin(angle) * 1),
            new THREE.Vector3(Math.cos(angle) * 1.5, -1, Math.sin(angle) * 1.5) // End at extremity
        );
        
        const geometry = new THREE.TubeGeometry(curve, 30, 0.005, 6, false);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xfbbf24,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.6,
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: 0.7
        });
        
        const nerve = new THREE.Mesh(geometry, material);
        nerve.userData.tag = tag;
        
        return nerve;
    }
    
    /**
     * Create skin layer (sentiment visualization)
     */
    createSkinLayer(analysis) {
        const skin = new THREE.Group();
        skin.name = 'skin';
        
        // Create translucent envelope based on sentiment
        const sentiment = analysis.sentiment;
        let material;
        
        if (Math.abs(sentiment) < 0.2) material = this.materials.neutral;
        else if (sentiment > 0) material = this.materials.positive;
        else material = this.materials.negative;
        
        // Clone material and make it translucent
        const skinMaterial = material.clone();
        skinMaterial.transparent = true;
        skinMaterial.opacity = 0.15;
        skinMaterial.side = THREE.DoubleSide;
        
        // Create organic envelope
        const geometry = new THREE.SphereGeometry(1.2, 32, 32);
        const mesh = new THREE.Mesh(geometry, skinMaterial);
        
        skin.add(mesh);
        return skin;
    }
    
    /**
     * Analyze sentiment of text (-1 to 1)
     */
    analyzeSentiment(text) {
        const positiveWords = ['love', 'great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'awesome', 'beautiful', 'perfect', 'best', 'happy', 'joy', 'brilliant', 'outstanding'];
        const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'sad', 'angry', 'disappointing', 'fail', 'wrong', 'problem', 'issue'];
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });
        
        const totalSentiment = positiveCount - negativeCount;
        return Math.max(-1, Math.min(1, totalSentiment / Math.max(words.length / 10, 1)));
    }
    
    /**
     * Add word label as sprite
     */
    addWordLabel(mesh, word) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 32;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, 128, 32);
        
        context.font = '14px Arial';
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.fillText(word.substring(0, 12), 64, 20);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.3, 0.075, 1);
        sprite.position.y = 0.1;
        
        mesh.add(sprite);
    }
    
    /**
     * Add metadata visualization (views, likes, date)
     */
    addMetadata(structure, post) {
        const metadata = new THREE.Group();
        metadata.name = 'metadata';
        
        // Views = orbit radius
        const viewRadius = Math.log(post.views + 1) * 0.1;
        
        // Likes = particle count
        const likeCount = post.likes || 0;
        
        // Date = orbit speed
        const date = new Date(post.date);
        const recency = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24); // Days ago
        
        // Create orbit visualization
        const orbitGeometry = new THREE.TorusGeometry(2 + viewRadius, 0.02, 16, 100);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        
        metadata.add(orbit);
        
        // Store in userData for animation
        structure.userData.metadata = {
            views: post.views,
            likes: likeCount,
            recency: recency,
            orbitRadius: 2 + viewRadius
        };
        
        structure.add(metadata);
    }
    
    /**
     * Animate all woven structures
     */
    animate(time) {
        this.postStructures.forEach((structure, postId) => {
            // Rotate entire structure slowly
            structure.rotation.y += 0.002;
            
            // Pulse skin layer based on sentiment
            const skin = structure.children.find(c => c.name === 'skin');
            if (skin && skin.children[0]) {
                const pulse = Math.sin(time * 0.001) * 0.05;
                skin.children[0].scale.setScalar(1 + pulse);
            }
            
            // Glow nerve system
            const nerves = structure.children.find(c => c.name === 'nervous_system');
            if (nerves) {
                nerves.children.forEach((nerve, i) => {
                    if (nerve.material) {
                        nerve.material.emissiveIntensity = 0.3 + Math.sin(time * 0.002 + i) * 0.3;
                    }
                });
            }
        });
    }
    
    /**
     * Get woven structure by post ID
     */
    getStructure(postId) {
        return this.postStructures.get(postId);
    }
    
    /**
     * Remove structure from scene
     */
    removeStructure(postId) {
        const structure = this.postStructures.get(postId);
        if (structure) {
            this.scene.remove(structure);
            this.postStructures.delete(postId);
            console.log(`🗑️ Removed post structure: ${postId}`);
        }
    }
    
    /**
     * Clear all structures
     */
    clearAll() {
        this.postStructures.forEach((structure, postId) => {
            this.scene.remove(structure);
        });
        this.postStructures.clear();
        console.log('🧹 Cleared all WordWeaver structures');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordWeaverEngine;
}
