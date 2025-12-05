/**
 * 🌐 WordWeaver Content Platform
 * SEO-optimized blog ecosystem with image uploads, CSS styling, and Reader's Wall
 * 
 * Features:
 * - Image document uploads with 3D placement
 * - Visual CSS style editor with live preview
 * - SEO keyword targeting (top Google searches)
 * - Multi-category blog platform (Sports, Health, Wealth, Tech, Entertainment, etc.)
 * - Reader's Wall (gum wall-style story display)
 * - Content discovery and traversal
 * 
 * Eugene Ousos - PixelProdigy AI
 * October 24, 2025
 */

class WordWeaverContentPlatform {
    constructor(scene, camera, formatEngine) {
        this.scene = scene;
        this.camera = camera;
        this.formatEngine = formatEngine;
        
        // Content categories with SEO keywords
        this.contentCategories = {
            sports: {
                name: 'Sports & Athletics',
                icon: '⚽',
                color: '#FF4500',
                seoKeywords: [
                    'nba playoffs', 'world cup', 'super bowl', 'olympics', 
                    'nfl scores', 'premier league', 'champions league', 'mlb standings',
                    'nba highlights', 'soccer news', 'sports betting', 'fantasy football'
                ]
            },
            health: {
                name: 'Health & Wellness',
                icon: '💊',
                color: '#32CD32',
                seoKeywords: [
                    'weight loss', 'diet plan', 'healthy eating', 'mental health',
                    'covid symptoms', 'vaccine side effects', 'vitamins', 'meditation',
                    'sleep better', 'anxiety relief', 'stress management', 'workout routine'
                ]
            },
            wealth: {
                name: 'Wealth & Finance',
                icon: '💰',
                color: '#FFD700',
                seoKeywords: [
                    'stock market', 'bitcoin price', 'cryptocurrency', 'real estate investing',
                    'how to save money', 'passive income', 'retirement planning', 'credit score',
                    'best investments', 'tax deductions', 'mortgage rates', 'financial freedom'
                ]
            },
            fitness: {
                name: 'Fitness & Training',
                icon: '💪',
                color: '#FF6347',
                seoKeywords: [
                    'home workout', 'gym routine', 'build muscle', 'lose belly fat',
                    'yoga for beginners', 'meal prep', 'protein powder', 'cardio exercises',
                    'strength training', 'fitness motivation', 'bodybuilding', 'crossfit'
                ]
            },
            tech: {
                name: 'Technology & Innovation',
                icon: '💻',
                color: '#4169E1',
                seoKeywords: [
                    'ai chatbot', 'iphone review', 'best laptop', 'gaming pc',
                    'chatgpt', 'crypto news', 'vr headset', 'smartphone comparison',
                    'tech news', 'artificial intelligence', 'metaverse', 'web3'
                ]
            },
            cooking: {
                name: 'Cooking & Recipes',
                icon: '🍳',
                color: '#FF8C00',
                seoKeywords: [
                    'easy recipes', 'dinner ideas', 'meal prep', 'instant pot recipes',
                    'healthy dinner', 'air fryer recipes', 'chicken recipes', 'dessert recipes',
                    'keto diet', 'vegan recipes', 'breakfast ideas', 'slow cooker meals'
                ]
            },
            entertainment: {
                name: 'Movies & TV Shows',
                icon: '🎬',
                color: '#9370DB',
                seoKeywords: [
                    'new movies 2025', 'netflix shows', 'marvel movies', 'best series',
                    'movie reviews', 'streaming services', 'oscar winners', 'tv show recommendations',
                    'anime', 'disney plus', 'hbo max', 'prime video'
                ]
            },
            travel: {
                name: 'Travel & Adventure',
                icon: '✈️',
                color: '#20B2AA',
                seoKeywords: [
                    'travel destinations', 'cheap flights', 'vacation spots', 'hotels near me',
                    'things to do', 'travel tips', 'backpacking', 'cruise deals',
                    'airbnb', 'road trip ideas', 'national parks', 'europe travel'
                ]
            },
            outdoor: {
                name: 'Outdoor Activities',
                icon: '🏕️',
                color: '#228B22',
                seoKeywords: [
                    'camping gear', 'hiking trails', 'fishing tips', 'hunting season',
                    'outdoor survival', 'kayaking', 'rock climbing', 'mountain biking',
                    'camping sites', 'backpacking gear', 'trail running', 'outdoor adventures'
                ]
            },
            indoor: {
                name: 'Indoor Living',
                icon: '🏠',
                color: '#8B4513',
                seoKeywords: [
                    'home decor', 'interior design', 'diy projects', 'home improvement',
                    'cleaning tips', 'organization hacks', 'furniture ideas', 'home office setup',
                    'smart home', 'room makeover', 'minimalist living', 'cozy home'
                ]
            },
            gaming: {
                name: 'Gaming & Esports',
                icon: '🎮',
                color: '#FF1493',
                seoKeywords: [
                    'best games 2025', 'ps5 games', 'xbox series x', 'gaming news',
                    'fortnite tips', 'minecraft builds', 'game reviews', 'esports tournaments',
                    'steam sales', 'nintendo switch', 'pc gaming', 'twitch streamers'
                ]
            },
            fashion: {
                name: 'Fashion & Style',
                icon: '👗',
                color: '#FF69B4',
                seoKeywords: [
                    'fashion trends', 'outfit ideas', 'style tips', 'designer brands',
                    'fashion week', 'streetwear', 'sneakers', 'makeup tutorial',
                    'skincare routine', 'beauty products', 'hair styles', 'fashion blogger'
                ]
            }
        };
        
        // Uploaded documents with images and styling
        this.uploadedDocuments = [];
        
        // Reader's Wall documents (featured stories)
        this.readersWall = [];
        
        // CSS style presets for documents
        this.cssStylePresets = {
            minimal: {
                name: 'Minimal White',
                background: '#ffffff',
                text: '#000000',
                border: '1px solid #e0e0e0',
                shadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '8px'
            },
            vibrant: {
                name: 'Vibrant Gradient',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                text: '#ffffff',
                border: 'none',
                shadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                borderRadius: '16px'
            },
            neon: {
                name: 'Neon Glow',
                background: '#0a0a0a',
                text: '#00ff00',
                border: '2px solid #00ff00',
                shadow: '0 0 20px #00ff00, inset 0 0 20px rgba(0, 255, 0, 0.2)',
                borderRadius: '4px'
            },
            paper: {
                name: 'Classic Paper',
                background: '#f9f7f1',
                text: '#2c2c2c',
                border: '1px solid #d4c5a9',
                shadow: '2px 2px 8px rgba(0,0,0,0.15)',
                borderRadius: '2px'
            },
            glass: {
                name: 'Frosted Glass',
                background: 'rgba(255, 255, 255, 0.1)',
                text: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            },
            cyberpunk: {
                name: 'Cyberpunk',
                background: 'linear-gradient(45deg, #ff00ff 0%, #00ffff 100%)',
                text: '#ffffff',
                border: '2px solid #ff00ff',
                shadow: '0 0 30px #ff00ff, 0 0 50px #00ffff',
                borderRadius: '0',
                animation: 'glitch 2s infinite'
            }
        };
        
        // Active CSS editor state
        this.cssEditor = {
            isOpen: false,
            selectedDocument: null,
            customStyles: {}
        };
        
        console.log('🌐 WordWeaver Content Platform initialized');
        console.log(`📚 Loaded ${Object.keys(this.contentCategories).length} content categories`);
    }
    
    /**
     * Upload image document to 3D space
     */
    async uploadImageDocument(imageFile, metadata = {}) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const imageData = e.target.result;
                
                // Create texture from image
                const loader = new THREE.TextureLoader();
                loader.load(imageData, (texture) => {
                    // Create plane geometry for document
                    const aspectRatio = texture.image.width / texture.image.height;
                    const width = 4;
                    const height = width / aspectRatio;
                    
                    const geometry = new THREE.PlaneGeometry(width, height);
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide,
                        transparent: true
                    });
                    
                    const documentMesh = new THREE.Mesh(geometry, material);
                    documentMesh.position.set(
                        metadata.position?.x || 0,
                        metadata.position?.y || 2,
                        metadata.position?.z || 0
                    );
                    
                    // Store metadata
                    documentMesh.userData = {
                        type: 'uploadedDocument',
                        filename: imageFile.name,
                        uploadDate: new Date().toISOString(),
                        category: metadata.category || 'uncategorized',
                        tags: metadata.tags || [],
                        cssStyle: metadata.cssStyle || 'minimal',
                        seoKeywords: metadata.seoKeywords || []
                    };
                    
                    this.scene.add(documentMesh);
                    this.uploadedDocuments.push(documentMesh);
                    
                    console.log(`✅ Uploaded image document: ${imageFile.name}`);
                    resolve(documentMesh);
                }, undefined, reject);
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }
    
    /**
     * Apply CSS style to document mesh
     */
    applyCSSStyleToDocument(documentMesh, styleName) {
        const style = this.cssStylePresets[styleName];
        if (!style) {
            console.warn(`Style '${styleName}' not found`);
            return;
        }
        
        // Create CSS-styled overlay (HTML element positioned in 3D)
        const overlayDiv = document.createElement('div');
        overlayDiv.className = 'document-overlay';
        overlayDiv.style.cssText = `
            position: absolute;
            width: 300px;
            height: 400px;
            background: ${style.background};
            color: ${style.text};
            border: ${style.border};
            box-shadow: ${style.shadow};
            border-radius: ${style.borderRadius};
            ${style.backdropFilter ? `backdrop-filter: ${style.backdropFilter};` : ''}
            ${style.animation ? `animation: ${style.animation};` : ''}
            pointer-events: auto;
            overflow: hidden;
        `;
        
        documentMesh.userData.cssStyle = styleName;
        documentMesh.userData.overlayElement = overlayDiv;
        
        console.log(`🎨 Applied CSS style '${style.name}' to document`);
    }
    
    /**
     * Generate SEO-optimized content based on trending keywords
     */
    async generateSEOContent(category, keyword) {
        const categoryData = this.contentCategories[category];
        if (!categoryData) {
            throw new Error(`Category '${category}' not found`);
        }
        
        // Template for SEO-optimized blog post
        const content = {
            title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: Complete Guide 2025`,
            slug: keyword.toLowerCase().replace(/\s+/g, '-'),
            category: category,
            categoryName: categoryData.name,
            seoKeywords: [keyword, ...categoryData.seoKeywords.slice(0, 5)],
            metaDescription: `Everything you need to know about ${keyword}. Expert tips, latest trends, and comprehensive guide updated for 2025.`,
            publishDate: new Date().toISOString(),
            author: 'PixelProdigy AI',
            featured: false,
            readTime: Math.floor(Math.random() * 10) + 5, // 5-15 min
            viewCount: 0,
            shareCount: 0
        };
        
        console.log(`📝 Generated SEO content for: ${keyword}`);
        return content;
    }
    
    /**
     * Create Reader's Wall (gum wall-style story display)
     */
    createReadersWall(position = new THREE.Vector3(0, 0, -10)) {
        const wallGroup = new THREE.Group();
        wallGroup.name = 'ReadersWall';
        
        // Wall surface (brick texture)
        const wallGeometry = new THREE.PlaneGeometry(20, 12);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallGroup.add(wallMesh);
        
        // Title sign
        this.create3DText("READER'S WALL", 'h1', new THREE.Vector3(-5, 6.5, 0.1))
            .then(textMesh => wallGroup.add(textMesh));
        
        wallGroup.position.copy(position);
        this.scene.add(wallGroup);
        
        console.log("📌 Created Reader's Wall at", position);
        return wallGroup;
    }
    
    /**
     * Add story to Reader's Wall (like gum on gum wall)
     */
    addStoryToWall(storyData) {
        // Random position on wall (scattered like gum)
        const x = (Math.random() - 0.5) * 18;
        const y = (Math.random() - 0.5) * 10;
        const z = 0.1 + Math.random() * 0.5; // Slight depth variation
        
        // Random rotation (stories are tilted/overlapping)
        const rotation = (Math.random() - 0.5) * 0.3;
        
        // Random color (vibrant like gum)
        const colors = [0xFF1493, 0x00FF00, 0xFFFF00, 0x00FFFF, 0xFF8C00, 0x9370DB];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create story card geometry
        const cardGeometry = new THREE.PlaneGeometry(1.5, 2);
        const cardMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.6,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        
        const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
        cardMesh.position.set(x, y, z);
        cardMesh.rotation.z = rotation;
        
        // Store story data
        cardMesh.userData = {
            type: 'readerStory',
            title: storyData.title,
            author: storyData.author,
            snippet: storyData.snippet,
            category: storyData.category,
            publishDate: storyData.publishDate,
            url: storyData.url
        };
        
        this.readersWall.push(cardMesh);
        
        const wallGroup = this.scene.getObjectByName('ReadersWall');
        if (wallGroup) {
            wallGroup.add(cardMesh);
        }
        
        console.log(`📌 Added story to wall: ${storyData.title}`);
        return cardMesh;
    }
    
    /**
     * Generate stories for all categories (auto-populate platform)
     */
    async generateAllCategoryStories() {
        const generatedStories = [];
        
        for (const [categoryKey, categoryData] of Object.entries(this.contentCategories)) {
            // Generate 3-5 stories per category
            const storyCount = Math.floor(Math.random() * 3) + 3;
            
            for (let i = 0; i < storyCount; i++) {
                const keyword = categoryData.seoKeywords[i];
                if (keyword) {
                    const content = await this.generateSEOContent(categoryKey, keyword);
                    generatedStories.push(content);
                    
                    // Add to Reader's Wall
                    this.addStoryToWall({
                        title: content.title,
                        author: content.author,
                        snippet: content.metaDescription.substring(0, 100) + '...',
                        category: content.categoryName,
                        publishDate: content.publishDate,
                        url: `/blog/${content.slug}`
                    });
                }
            }
        }
        
        console.log(`✅ Generated ${generatedStories.length} stories across all categories`);
        return generatedStories;
    }
    
    /**
     * Search content by keywords
     */
    searchContent(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        // Search across all categories
        for (const [categoryKey, categoryData] of Object.entries(this.contentCategories)) {
            // Check if query matches any SEO keywords
            const matchingKeywords = categoryData.seoKeywords.filter(kw => 
                kw.toLowerCase().includes(queryLower)
            );
            
            if (matchingKeywords.length > 0) {
                results.push({
                    category: categoryKey,
                    categoryName: categoryData.name,
                    matchingKeywords: matchingKeywords,
                    relevance: matchingKeywords.length
                });
            }
        }
        
        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);
        
        console.log(`🔍 Search for '${query}' found ${results.length} categories`);
        return results;
    }
    
    /**
     * Helper: Create 3D text
     */
    async create3DText(text, elementType, position) {
        if (this.formatEngine) {
            return await this.formatEngine.create3DText(text, elementType, position);
        }
        return null;
    }
    
    /**
     * Export platform statistics
     */
    getStatistics() {
        return {
            totalCategories: Object.keys(this.contentCategories).length,
            totalKeywords: Object.values(this.contentCategories).reduce((sum, cat) => 
                sum + cat.seoKeywords.length, 0),
            uploadedDocuments: this.uploadedDocuments.length,
            readersWallStories: this.readersWall.length,
            cssStylePresets: Object.keys(this.cssStylePresets).length
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordWeaverContentPlatform;
}
