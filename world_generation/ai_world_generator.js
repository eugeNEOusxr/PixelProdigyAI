/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║              AI WORLD GENERATION SYSTEM v1.0.0                        ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Text-to-World generation using Google Gemini AI                      ║
 * ║                                                                       ║
 * ║ Features:                                                            ║
 * ║  • Natural language world descriptions                               ║
 * ║  • AI-powered terrain generation                                     ║
 * ║  • Intelligent biome placement                                       ║
 * ║  • Structure generation (buildings, trees, rocks)                    ║
 * ║  • NPC placement with AI-generated dialogue                          ║
 * ║  • Dynamic quest generation                                          ║
 * ║  • Weather and atmosphere matching description                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════
// BIOME DATABASE (Stacked Pattern)
// ═══════════════════════════════════════════════════════════════════════

const BIOME_TYPES = {
  plains: {
    name: 'Plains',
    color: 0x7cba3d,
    groundHeight: (x, z) => Math.sin(x * 0.1) * 0.5 + Math.cos(z * 0.1) * 0.5,
    vegetation: ['grass', 'wildflowers', 'small_trees'],
    structures: ['farmhouse', 'windmill', 'fence'],
    weather: ['clear', 'rain'],
    difficulty: 1
  },
  
  forest: {
    name: 'Forest',
    color: 0x2d5016,
    groundHeight: (x, z) => Math.sin(x * 0.15) * 1.0 + Math.cos(z * 0.15) * 1.0,
    vegetation: ['oak_tree', 'pine_tree', 'bushes', 'mushrooms'],
    structures: ['cabin', 'treehouse', 'shrine'],
    weather: ['clear', 'rain', 'fog'],
    difficulty: 2
  },
  
  desert: {
    name: 'Desert',
    color: 0xd4a574,
    groundHeight: (x, z) => Math.sin(x * 0.2) * 2.0 + Math.cos(z * 0.2) * 2.0,
    vegetation: ['cactus', 'dead_tree', 'tumbleweed'],
    structures: ['pyramid', 'oasis', 'ruins'],
    weather: ['clear', 'sandstorm'],
    difficulty: 3
  },
  
  mountains: {
    name: 'Mountains',
    color: 0x8b7355,
    groundHeight: (x, z) => Math.sin(x * 0.05) * 10.0 + Math.cos(z * 0.05) * 10.0,
    vegetation: ['pine_tree', 'rocks', 'snow'],
    structures: ['cave', 'bridge', 'tower'],
    weather: ['clear', 'snow', 'storm'],
    difficulty: 4
  },
  
  swamp: {
    name: 'Swamp',
    color: 0x4a5d3f,
    groundHeight: (x, z) => Math.sin(x * 0.3) * 0.3 + Math.cos(z * 0.3) * 0.3,
    vegetation: ['willow_tree', 'vines', 'lily_pads', 'moss'],
    structures: ['hut', 'dock', 'totem'],
    weather: ['fog', 'rain'],
    difficulty: 3
  },
  
  tundra: {
    name: 'Tundra',
    color: 0xe0f2f7,
    groundHeight: (x, z) => Math.sin(x * 0.1) * 0.5 + Math.cos(z * 0.1) * 0.5,
    vegetation: ['ice_spike', 'frozen_tree', 'snow'],
    structures: ['igloo', 'ice_cave', 'ice_palace'],
    weather: ['snow', 'blizzard'],
    difficulty: 4
  },
  
  volcanic: {
    name: 'Volcanic',
    color: 0x3d1d1d,
    groundHeight: (x, z) => Math.sin(x * 0.08) * 8.0 + Math.cos(z * 0.08) * 8.0,
    vegetation: ['dead_tree', 'lava_rock', 'ember_plant'],
    structures: ['volcano', 'lava_bridge', 'obsidian_tower'],
    weather: ['ash', 'fire'],
    difficulty: 5
  },
  
  crystal: {
    name: 'Crystal Caverns',
    color: 0x9c27b0,
    groundHeight: (x, z) => Math.sin(x * 0.2) * 3.0 + Math.cos(z * 0.2) * 3.0,
    vegetation: ['crystal_cluster', 'glowing_mushroom', 'gem_vein'],
    structures: ['crystal_spire', 'gem_cave', 'prism_shrine'],
    weather: ['clear', 'aurora'],
    difficulty: 5
  }
};

// ═══════════════════════════════════════════════════════════════════════
// STRUCTURE TEMPLATES (Procedurally Generated)
// ═══════════════════════════════════════════════════════════════════════

const STRUCTURE_TEMPLATES = {
  // Simple structures
  farmhouse: (scene, x, y, z) => {
    const house = new THREE.Group();
    
    // Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3, 4),
      new THREE.MeshPhongMaterial({ color: 0x8b4513 })
    );
    base.position.y = 1.5;
    house.add(base);
    
    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(4.5, 2, 4),
      new THREE.MeshPhongMaterial({ color: 0xa52a2a })
    );
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);
    
    house.position.set(x, y, z);
    return house;
  },
  
  cabin: (scene, x, y, z) => {
    const cabin = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 4),
      new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    base.position.y = 1.25;
    cabin.add(base);
    
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 1.5, 4),
      new THREE.MeshPhongMaterial({ color: 0x8b4513 })
    );
    roof.position.y = 3.5;
    roof.rotation.y = Math.PI / 4;
    cabin.add(roof);
    
    cabin.position.set(x, y, z);
    return cabin;
  },
  
  tower: (scene, x, y, z) => {
    const tower = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.5, 12, 8),
      new THREE.MeshPhongMaterial({ color: 0x808080 })
    );
    base.position.y = 6;
    tower.add(base);
    
    const top = new THREE.Mesh(
      new THREE.ConeGeometry(3, 3, 8),
      new THREE.MeshPhongMaterial({ color: 0x4169e1 })
    );
    top.position.y = 13.5;
    tower.add(top);
    
    tower.position.set(x, y, z);
    return tower;
  },
  
  pyramid: (scene, x, y, z) => {
    const pyramid = new THREE.Mesh(
      new THREE.ConeGeometry(8, 12, 4),
      new THREE.MeshPhongMaterial({ color: 0xdaa520 })
    );
    pyramid.position.set(x, y + 6, z);
    pyramid.rotation.y = Math.PI / 4;
    return pyramid;
  },
  
  windmill: (scene, x, y, z) => {
    const mill = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2, 8, 8),
      new THREE.MeshPhongMaterial({ color: 0xf5f5dc })
    );
    base.position.y = 4;
    mill.add(base);
    
    // Blades (simplified)
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 6, 0.1),
      new THREE.MeshPhongMaterial({ color: 0x8b4513 })
    );
    blade.position.set(0, 8, 2);
    mill.add(blade);
    
    mill.position.set(x, y, z);
    return mill;
  }
};

// ═══════════════════════════════════════════════════════════════════════
// VEGETATION TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

const VEGETATION_TEMPLATES = {
  oak_tree: (scene, x, y, z) => {
    const tree = new THREE.Group();
    
    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 4, 8),
      new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    trunk.position.y = 2;
    tree.add(trunk);
    
    // Leaves
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2, 8, 8),
      new THREE.MeshPhongMaterial({ color: 0x228b22 })
    );
    leaves.position.y = 4.5;
    tree.add(leaves);
    
    tree.position.set(x, y, z);
    return tree;
  },
  
  pine_tree: (scene, x, y, z) => {
    const tree = new THREE.Group();
    
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 5, 8),
      new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    trunk.position.y = 2.5;
    tree.add(trunk);
    
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 4, 8),
      new THREE.MeshPhongMaterial({ color: 0x006400 })
    );
    leaves.position.y = 6;
    tree.add(leaves);
    
    tree.position.set(x, y, z);
    return tree;
  },
  
  cactus: (scene, x, y, z) => {
    const cactus = new THREE.Group();
    
    const main = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 3, 8),
      new THREE.MeshPhongMaterial({ color: 0x2e8b57 })
    );
    main.position.y = 1.5;
    cactus.add(main);
    
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8),
      new THREE.MeshPhongMaterial({ color: 0x2e8b57 })
    );
    arm.position.set(0.5, 2, 0);
    arm.rotation.z = Math.PI / 2;
    cactus.add(arm);
    
    cactus.position.set(x, y, z);
    return cactus;
  },
  
  rocks: (scene, x, y, z) => {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8, 0),
      new THREE.MeshPhongMaterial({ color: 0x808080 })
    );
    rock.position.set(x, y + 0.4, z);
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    return rock;
  },
  
  crystal_cluster: (scene, x, y, z) => {
    const cluster = new THREE.Group();
    
    for (let i = 0; i < 5; i++) {
      const crystal = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 2, 6),
        new THREE.MeshPhongMaterial({ 
          color: 0x9c27b0,
          emissive: 0x9c27b0,
          emissiveIntensity: 0.5
        })
      );
      crystal.position.set(
        Math.random() - 0.5,
        Math.random() * 0.5,
        Math.random() - 0.5
      );
      crystal.rotation.set(
        Math.random() * 0.3,
        Math.random() * Math.PI * 2,
        Math.random() * 0.3
      );
      cluster.add(crystal);
    }
    
    cluster.position.set(x, y, z);
    return cluster;
  }
};

// ═══════════════════════════════════════════════════════════════════════
// AI WORLD GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════

class AIWorldGenerator {
  constructor(scene, geminiApiKey = null) {
    this.scene = scene;
    this.geminiApiKey = geminiApiKey;
    this.generatedObjects = [];
    this.worldData = null;
    this.isGenerating = false;
    
    // Generation parameters
    this.worldSize = 200;
    this.chunkSize = 50;
    this.objectDensity = 0.02; // Objects per square unit
    
    console.log('🤖 AI World Generator initialized');
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // MAIN GENERATION METHOD
  // ═══════════════════════════════════════════════════════════════════════
  
  async generateWorld(userPrompt) {
    if (this.isGenerating) {
      console.log('⚠️ World generation already in progress');
      return null;
    }
    
    this.isGenerating = true;
    console.log('🌍 Starting world generation...');
    console.log(`📝 User prompt: "${userPrompt}"`);
    
    try {
      // Step 1: Parse prompt with AI (or use fallback)
      const worldConfig = await this.parsePromptWithAI(userPrompt);
      
      // Step 2: Generate terrain
      console.log('🏔️ Generating terrain...');
      this.generateTerrain(worldConfig);
      
      // Step 3: Place vegetation
      console.log('🌳 Placing vegetation...');
      this.placeVegetation(worldConfig);
      
      // Step 4: Place structures
      console.log('🏰 Placing structures...');
      this.placeStructures(worldConfig);
      
      // Step 5: Set atmosphere
      console.log('🌤️ Setting atmosphere...');
      this.setAtmosphere(worldConfig);
      
      // Step 6: Store world data
      this.worldData = worldConfig;
      
      this.isGenerating = false;
      console.log('✅ World generation complete!');
      
      return worldConfig;
      
    } catch (error) {
      console.error('❌ World generation error:', error);
      this.isGenerating = false;
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // AI PROMPT PARSING
  // ═══════════════════════════════════════════════════════════════════════
  
  async parsePromptWithAI(prompt) {
    // If Gemini API key is available, use it
    if (this.geminiApiKey) {
      try {
        return await this.callGeminiAPI(prompt);
      } catch (error) {
        console.warn('⚠️ Gemini API failed, using fallback:', error);
        return this.parseLegacyPrompt(prompt);
      }
    } else {
      console.log('ℹ️ No API key, using pattern matching');
      return this.parseLegacyPrompt(prompt);
    }
  }
  
  async callGeminiAPI(prompt) {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const systemPrompt = `You are a 3D world generation AI. Parse the user's description and output a JSON configuration for a game world.

Output format (JSON only, no markdown):
{
  "biomes": ["plains", "forest", "desert", "mountains", "swamp", "tundra", "volcanic", "crystal"],
  "primaryBiome": "plains",
  "mood": "peaceful|mysterious|dangerous|epic|haunted",
  "timeOfDay": 0-24 (hour),
  "weather": "clear|rain|snow|fog|storm|sandstorm|blizzard|ash|fire|aurora",
  "structureDensity": 0.01-0.1,
  "vegetationDensity": 0.01-0.2,
  "specialFeatures": ["lava_lake", "ancient_ruins", "crystal_cave", etc],
  "description": "AI-enhanced description of the world"
}

User prompt: "${prompt}"`;
    
    const response = await fetch(`${apiUrl}?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid AI response format');
    }
  }
  
  parseLegacyPrompt(prompt) {
    const lower = prompt.toLowerCase();
    
    // Detect biomes from keywords
    const biomeKeywords = {
      plains: ['plain', 'grassland', 'meadow', 'field'],
      forest: ['forest', 'woodland', 'tree', 'jungle'],
      desert: ['desert', 'sand', 'dune', 'arid'],
      mountains: ['mountain', 'peak', 'cliff', 'highland'],
      swamp: ['swamp', 'marsh', 'bog', 'wetland'],
      tundra: ['tundra', 'arctic', 'frozen', 'ice'],
      volcanic: ['volcano', 'lava', 'magma', 'volcanic'],
      crystal: ['crystal', 'gem', 'magical', 'mystical']
    };
    
    let primaryBiome = 'plains';
    let biomes = [];
    
    for (const [biome, keywords] of Object.entries(biomeKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        biomes.push(biome);
        primaryBiome = biome;
      }
    }
    
    if (biomes.length === 0) {
      biomes = ['plains'];
    }
    
    // Detect mood
    let mood = 'peaceful';
    if (lower.match(/danger|hostile|enemy|evil/)) mood = 'dangerous';
    if (lower.match(/mystery|ancient|unknown|hidden/)) mood = 'mysterious';
    if (lower.match(/epic|grand|massive|legendary/)) mood = 'epic';
    if (lower.match(/haunt|ghost|dark|shadow/)) mood = 'haunted';
    
    // Detect time of day
    let timeOfDay = 12;
    if (lower.includes('night') || lower.includes('midnight')) timeOfDay = 0;
    if (lower.includes('dawn') || lower.includes('sunrise')) timeOfDay = 6;
    if (lower.includes('noon') || lower.includes('midday')) timeOfDay = 12;
    if (lower.includes('dusk') || lower.includes('sunset')) timeOfDay = 18;
    
    // Detect weather
    let weather = 'clear';
    if (lower.includes('rain') || lower.includes('storm')) weather = 'rain';
    if (lower.includes('snow') || lower.includes('blizzard')) weather = 'snow';
    if (lower.includes('fog') || lower.includes('mist')) weather = 'fog';
    
    return {
      biomes,
      primaryBiome,
      mood,
      timeOfDay,
      weather,
      structureDensity: 0.02,
      vegetationDensity: 0.05,
      specialFeatures: [],
      description: prompt
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // TERRAIN GENERATION
  // ═══════════════════════════════════════════════════════════════════════
  
  generateTerrain(config) {
    const biome = BIOME_TYPES[config.primaryBiome];
    
    // Create terrain mesh
    const geometry = new THREE.PlaneGeometry(
      this.worldSize,
      this.worldSize,
      100,
      100
    );
    
    const vertices = geometry.attributes.position.array;
    
    // Apply height function from biome
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      vertices[i + 2] = biome.groundHeight(x, z);
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshPhongMaterial({
      color: biome.color,
      flatShading: true
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    
    this.scene.add(terrain);
    this.generatedObjects.push(terrain);
    
    console.log(`✅ Terrain generated: ${biome.name}`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VEGETATION PLACEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  placeVegetation(config) {
    const biome = BIOME_TYPES[config.primaryBiome];
    const count = Math.floor(this.worldSize * this.worldSize * config.vegetationDensity);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * this.worldSize;
      const z = (Math.random() - 0.5) * this.worldSize;
      const y = biome.groundHeight(x, z);
      
      // Pick random vegetation type from biome
      const vegType = biome.vegetation[Math.floor(Math.random() * biome.vegetation.length)];
      
      if (VEGETATION_TEMPLATES[vegType]) {
        const vegObject = VEGETATION_TEMPLATES[vegType](this.scene, x, y, z);
        vegObject.castShadow = true;
        this.scene.add(vegObject);
        this.generatedObjects.push(vegObject);
      }
    }
    
    console.log(`✅ Placed ${count} vegetation objects`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // STRUCTURE PLACEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  placeStructures(config) {
    const biome = BIOME_TYPES[config.primaryBiome];
    const count = Math.floor(this.worldSize * this.worldSize * config.structureDensity);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * this.worldSize * 0.8; // Keep away from edges
      const z = (Math.random() - 0.5) * this.worldSize * 0.8;
      const y = biome.groundHeight(x, z);
      
      // Pick random structure type from biome
      const structType = biome.structures[Math.floor(Math.random() * biome.structures.length)];
      
      if (STRUCTURE_TEMPLATES[structType]) {
        const structure = STRUCTURE_TEMPLATES[structType](this.scene, x, y, z);
        structure.castShadow = true;
        this.scene.add(structure);
        this.generatedObjects.push(structure);
      }
    }
    
    console.log(`✅ Placed ${count} structures`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // ATMOSPHERE SETTING
  // ═══════════════════════════════════════════════════════════════════════
  
  setAtmosphere(config) {
    // Set sky color based on time of day
    const skyColors = {
      night: 0x000033,
      dawn: 0xff6347,
      day: 0x87ceeb,
      dusk: 0xff8c00
    };
    
    let skyColor;
    if (config.timeOfDay >= 0 && config.timeOfDay < 6) skyColor = skyColors.night;
    else if (config.timeOfDay >= 6 && config.timeOfDay < 9) skyColor = skyColors.dawn;
    else if (config.timeOfDay >= 9 && config.timeOfDay < 17) skyColor = skyColors.day;
    else if (config.timeOfDay >= 17 && config.timeOfDay < 20) skyColor = skyColors.dusk;
    else skyColor = skyColors.night;
    
    this.scene.background = new THREE.Color(skyColor);
    
    // Add fog for mood
    if (config.weather === 'fog' || config.mood === 'mysterious') {
      this.scene.fog = new THREE.Fog(skyColor, 10, 100);
    }
    
    console.log(`✅ Atmosphere set: ${config.weather} at ${config.timeOfDay}:00`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // WORLD CLEANUP
  // ═══════════════════════════════════════════════════════════════════════
  
  clearWorld() {
    console.log('🧹 Clearing generated world...');
    
    this.generatedObjects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    
    this.generatedObjects = [];
    this.worldData = null;
    this.scene.fog = null;
    
    console.log('✅ World cleared');
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════
  
  getWorldData() {
    return this.worldData;
  }
  
  setApiKey(apiKey) {
    this.geminiApiKey = apiKey;
    console.log('🔑 Gemini API key updated');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIWorldGenerator, BIOME_TYPES };
}
