/**
 * ═══════════════════════════════════════════════════════════════════
 * AI WORLD GENERATOR - Llama Integration for SkyRelics
 * Allows AI to create 3D worlds autonomously
 * Creator: Jeremy Courson + AI Crew (Solana, Svetlana, Neo, Neomi)
 * ═══════════════════════════════════════════════════════════════════
 */

class AIWorldGenerator {
    constructor() {
        this.useLocal = (window.location.hostname === 'localhost');
        this.ollamaURL = 'http://localhost:11434/api/generate';
        this.togetherURL = 'https://api.together.xyz/inference';
        this.apiKey = null; // Set if using cloud API
        
        // AI Personalities
        this.personalities = {
            mathematician: 'llama3.1:70b',      // Math & geometry
            storyteller: 'llama3.2-vision',     // Quests & narrative
            coder: 'codestral',                  // JavaScript generation
            architect: 'llama3.1:70b',          // World layout
            optimizer: 'llama3.1:8b'            // Performance tweaks
        };
        
        console.log('🤖 AI World Generator Initialized');
        console.log(`   Mode: ${this.useLocal ? 'LOCAL (Ollama)' : 'CLOUD'}`);
        console.log('   Personalities: 5');
    }
    
    /**
     * Main method: Ask AI to generate something
     */
    async ask(personality, prompt, options = {}) {
        try {
            if (this.useLocal) {
                return await this.askLocal(personality, prompt, options);
            } else {
                return await this.askCloud(personality, prompt, options);
            }
        } catch (error) {
            console.error(`❌ AI Error (${personality}):`, error);
            return null;
        }
    }
    
    /**
     * LOCAL: Use Ollama (must have it running)
     */
    async askLocal(personality, prompt, options) {
        const model = this.personalities[personality] || this.personalities.mathematician;
        
        const response = await fetch(`${this.ollamaURL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false,
                temperature: options.temperature || 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
    }
    
    /**
     * CLOUD: Use Together.ai or other cloud provider
     */
    async askCloud(personality, prompt, options) {
        if (!this.apiKey) {
            console.warn('⚠️ Cloud API key not set. Using fallback...');
            return this.generateFallback(personality, prompt);
        }
        
        const response = await fetch(this.togetherURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.1-405B-Instruct',
                prompt: prompt,
                temperature: options.temperature || 0.7
            })
        });
        
        const data = await response.json();
        return data.output || data.choices[0]?.message?.content;
    }
    
    /**
     * FALLBACK: Generate procedurally if AI unavailable
     */
    generateFallback(personality, prompt) {
        console.log(`📦 Using fallback for ${personality}`);
        
        if (personality === 'mathematician') {
            return this.generateMathFallback(prompt);
        } else if (personality === 'storyteller') {
            return this.generateStoryFallback(prompt);
        }
        
        return "AI unavailable. Please install Ollama or set API key.";
    }
    
    generateMathFallback(prompt) {
        // Simple Fibonacci spiral as fallback
        return `
// Fibonacci spiral (fallback generation)
const points = [];
const goldenAngle = 2.399963;
const radius = 10;
for (let i = 0; i < 500; i++) {
    const theta = i * goldenAngle;
    const r = radius * Math.sqrt(i / 500);
    points.push(
        r * Math.cos(theta),
        Math.random() * 2,
        r * Math.sin(theta)
    );
}
        `.trim();
    }
    
    generateStoryFallback(prompt) {
        const quests = [
            "Discover the ancient library hidden in the forest.",
            "Help the village elder recover stolen artifacts.",
            "Investigate strange lights near the mountain cave."
        ];
        return quests[Math.floor(Math.random() * quests.length)];
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HIGH-LEVEL WORLD GENERATION METHODS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Generate 3D geometry code from description
     */
    async generateGeometry(description) {
        console.log(`🔷 Mathematician AI: Generating geometry for "${description}"`);
        
        const prompt = `
You are a mathematical genius specialized in 3D geometry.

Task: Generate Three.js JavaScript code for: ${description}

Requirements:
- Use BufferGeometry
- Return positions as Float32Array
- Include vertex count
- Use golden ratio (1.618) or Fibonacci where applicable

Return ONLY JavaScript code, no explanations.
        `.trim();
        
        const code = await this.ask('mathematician', prompt, { temperature: 0.2 });
        return this.extractCode(code);
    }
    
    /**
     * Generate a quest/story
     */
    async generateQuest(theme, location) {
        console.log(`📖 Storyteller AI: Creating ${theme} quest at ${location}`);
        
        const prompt = `
You are a creative game designer.

Task: Create a quest for a 3D RPG game.

Theme: ${theme}
Location: ${location}

Include:
- Quest name
- Objective (1 sentence)
- 2-3 NPCs involved
- Reward
- Optional: Moral choice

Return as JSON with keys: name, objective, npcs, reward, choice
        `.trim();
        
        const response = await this.ask('storyteller', prompt, { temperature: 0.8 });
        return this.extractJSON(response);
    }
    
    /**
     * Generate building layout
     */
    async generateVillage(biome, buildingCount) {
        console.log(`🏘️ Architect AI: Designing ${buildingCount} building ${biome} village`);
        
        const prompt = `
You are an architect and city planner.

Task: Design a village layout.

Biome: ${biome}
Buildings: ${buildingCount}

Rules:
- Town square at center (0, 0)
- Use golden ratio for spacing (1.618)
- Roads connect logically
- Resources (water, farms) placed realistically

Return as JSON:
{
  "name": "village name",
  "center": [0, 0],
  "buildings": [
    {"type": "town_hall", "position": [x, z], "rotation": degrees, "scale": [w, h, d]}
  ]
}
        `.trim();
        
        const response = await this.ask('architect', prompt, { temperature: 0.5 });
        return this.extractJSON(response);
    }
    
    /**
     * Optimize scene performance
     */
    async optimizeScene(sceneStats) {
        console.log(`⚡ Optimizer AI: Analyzing performance (${sceneStats.fps} FPS)`);
        
        const prompt = `
You are a 3D graphics optimization expert.

Current Performance:
- FPS: ${sceneStats.fps}
- Vertices: ${sceneStats.vertices.toLocaleString()}
- Draw Calls: ${sceneStats.drawCalls}
- Textures: ${sceneStats.textures} MB

Goal: 60 FPS

Provide 5 specific optimization suggestions.
Return as JSON array of strings.
        `.trim();
        
        const response = await this.ask('optimizer', prompt, { temperature: 0.1 });
        return this.extractJSON(response);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * PLAYER COMMAND SYSTEM
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Handle player commands like "/create forest village"
     */
    async handlePlayerCommand(command) {
        console.log(`🎮 Processing command: "${command}"`);
        
        // Parse intent
        const intent = await this.parseIntent(command);
        
        if (intent.action === 'create') {
            return await this.createWorld(intent);
        } else if (intent.action === 'quest') {
            return await this.generateQuest(intent.theme, intent.location);
        } else if (intent.action === 'optimize') {
            return await this.optimizeScene(intent.stats);
        }
        
        return { error: "Unknown command" };
    }
    
    async parseIntent(command) {
        const prompt = `
Parse this game command: "${command}"

Extract:
- action (create, quest, optimize)
- biome (forest, desert, mountain, etc.)
- structures (village, castle, city, etc.)
- count (number)
- theme (fantasy, sci-fi, medieval, etc.)

Return as JSON.
        `.trim();
        
        const response = await this.ask('mathematician', prompt, { temperature: 0.3 });
        return this.extractJSON(response) || { action: 'unknown' };
    }
    
    async createWorld(intent) {
        // 1. Generate village layout
        const village = await this.generateVillage(intent.biome, intent.count || 10);
        
        // 2. Generate quest for this location
        const quest = await this.generateQuest(intent.theme || 'adventure', village.name);
        
        // 3. Generate geometry code for buildings (optional)
        // const buildingCode = await this.generateGeometry('medieval house');
        
        return {
            village: village,
            quest: quest,
            message: `✅ Created ${village.name} in ${intent.biome} biome!`
        };
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * UTILITY METHODS
     * ═══════════════════════════════════════════════════════════════
     */
    
    extractCode(response) {
        // Extract JavaScript code from markdown code blocks
        const match = response.match(/```(?:javascript|js)?\n([\s\S]+?)\n```/);
        return match ? match[1].trim() : response;
    }
    
    extractJSON(response) {
        try {
            // Try to parse as JSON directly
            return JSON.parse(response);
        } catch {
            // Extract JSON from markdown code blocks
            const match = response.match(/```(?:json)?\n([\s\S]+?)\n```/);
            if (match) {
                return JSON.parse(match[1]);
            }
            // Try to find JSON object in text
            const jsonMatch = response.match(/\{[\s\S]+\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        }
    }
    
    /**
     * Check if Ollama is running
     */
    async checkOllamaStatus() {
        try {
            const response = await fetch(`${this.ollamaURL}/tags`, {
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Ollama connected!');
                console.log('   Available models:', data.models.map(m => m.name).join(', '));
                return true;
            }
        } catch (error) {
            console.log('❌ Ollama not running. Install: https://ollama.com');
            console.log('   Will use fallback generation.');
            return false;
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIWorldGenerator;
}
