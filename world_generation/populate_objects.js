#!/usr/bin/env node

/**
 * OBJECT POPULATION SYSTEM
 * Distributes 99,640 objects across PixelVerse world
 * 
 * Creator: Jeremy
 * Built with: AI Personalities #14 (Naturalist), #25 (Architect), #33 (Industrial Designer)
 * 
 * Strategy:
 * - Biome-based distribution (trees in forests, rocks in mountains, etc.)
 * - City-based placement (furniture in buildings, vehicles on roads)
 * - Procedural scattering with density rules
 * - Resource node placement for gameplay
 */

const fs = require('fs');
const path = require('path');

class ObjectPopulator {
    constructor() {
        this.worldData = null;
        this.objectCatalog = null;
        this.placedObjects = [];
        
        this.stats = {
            totalPlaced: 0,
            byCategory: {},
            byBiome: {},
            byCity: {}
        };

        // Biome-to-object mapping
        this.biomeObjects = {
            forest: {
                categories: ['Nature'],
                density: 0.8,
                subCategories: ['Plants', 'Landscape'],
                types: ['trees', 'bushes', 'flowers', 'rocks']
            },
            mountain: {
                categories: ['Nature', 'Architecture'],
                density: 0.3,
                subCategories: ['Landscape'],
                types: ['rocks', 'boulders', 'crystals', 'caves']
            },
            desert: {
                categories: ['Nature'],
                density: 0.2,
                subCategories: ['Plants', 'Landscape'],
                types: ['cactus', 'rocks', 'sand', 'oasis']
            },
            plains: {
                categories: ['Nature', 'Architecture'],
                density: 0.5,
                subCategories: ['Plants', 'Landscape'],
                types: ['grass', 'flowers', 'trees', 'rocks']
            },
            water: {
                categories: ['Nature', 'Vehicles'],
                density: 0.1,
                subCategories: ['Landscape'],
                types: ['boats', 'docks', 'fish', 'plants']
            }
        };

        // City-to-object mapping
        this.cityObjects = {
            futuristic: {
                categories: ['Furniture', 'Electronics', 'Architecture', 'Vehicles'],
                density: 1.0,
                style: 'modern'
            },
            industrial: {
                categories: ['Tools & Equipment', 'Architecture', 'Vehicles'],
                density: 0.8,
                style: 'industrial'
            },
            organic: {
                categories: ['Furniture', 'Nature', 'Architecture'],
                density: 0.7,
                style: 'natural'
            },
            mystical: {
                categories: ['Art & Decor', 'Architecture', 'Nature'],
                density: 0.6,
                style: 'magical'
            },
            desert: {
                categories: ['Furniture', 'Architecture', 'Food & Beverage'],
                density: 0.5,
                style: 'ancient'
            }
        };
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async init() {
        console.log('🎨 Object Population System Starting...\n');

        // Load world data
        console.log('📦 Loading world data...');
        this.worldData = {
            chunks: JSON.parse(fs.readFileSync('pixelverse_chunks_summary.json', 'utf8')),
            cities: JSON.parse(fs.readFileSync('pixelverse_cities.json', 'utf8')),
            stats: JSON.parse(fs.readFileSync('pixelverse_stats.json', 'utf8'))
        };
        console.log(`  ✓ Loaded ${this.worldData.chunks.length} chunks`);
        console.log(`  ✓ Loaded ${this.worldData.cities.length} cities\n`);

        // Load object catalog
        console.log('📚 Loading object catalog...');
        const catalogPath = path.join(__dirname, '../object_generator/generated_objects/catalog.json');
        this.objectCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        console.log(`  ✓ Loaded ${this.objectCatalog.totalObjects} objects\n`);
    }

    // ==========================================
    // POPULATION PIPELINE
    // ==========================================

    async populateWorld() {
        console.log('🌍 Starting world population...\n');

        // Phase 1: Populate terrain (biome-based)
        console.log('🌲 Phase 1: Populating terrain...');
        await this.populateTerrain();

        // Phase 2: Populate cities (architecture-based)
        console.log('\n🏙️  Phase 2: Populating cities...');
        await this.populateCities();

        // Phase 3: Add special locations
        console.log('\n✨ Phase 3: Adding special locations...');
        await this.addSpecialLocations();

        console.log('\n🎉 Population complete!');
        this.printStatistics();

        // Save results
        await this.saveResults();
    }

    // ==========================================
    // TERRAIN POPULATION
    // ==========================================

    async populateTerrain() {
        let chunkCount = 0;

        for (const chunk of this.worldData.chunks) {
            const biomeConfig = this.biomeObjects[chunk.biome];
            if (!biomeConfig) continue;

            // Calculate how many objects for this chunk
            const objectCount = Math.floor(
                chunk.vertexCount * biomeConfig.density * 0.001 // 0.1% of vertices
            );

            // Place objects
            for (let i = 0; i < objectCount; i++) {
                const obj = this.selectObjectForBiome(chunk.biome);
                if (!obj) continue;

                // Generate random position within chunk
                const position = {
                    x: chunk.chunkX * 1000 + Math.random() * 1000,
                    y: this.estimateTerrainHeight(chunk.chunkX, chunk.chunkZ),
                    z: chunk.chunkZ * 1000 + Math.random() * 1000
                };

                // Random rotation and scale
                const rotation = {
                    x: 0,
                    y: Math.random() * Math.PI * 2,
                    z: 0
                };

                const scale = {
                    x: 0.8 + Math.random() * 0.4,
                    y: 0.8 + Math.random() * 0.4,
                    z: 0.8 + Math.random() * 0.4
                };

                this.placeObject(obj, position, rotation, scale, chunk.biome, 'terrain');
            }

            chunkCount++;
            if (chunkCount % 10 === 0) {
                process.stdout.write(`  Processed ${chunkCount}/${this.worldData.chunks.length} chunks\r`);
            }
        }

        console.log(`  ✓ Populated ${chunkCount} chunks with terrain objects`);
    }

    selectObjectForBiome(biome) {
        const config = this.biomeObjects[biome];
        if (!config) return null;

        // Randomly select category
        const category = config.categories[Math.floor(Math.random() * config.categories.length)];
        
        // Convert category name to path format (e.g., "Nature" -> "nature")
        const categoryPath = category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
        
        // Load objects from this category directory
        const categoryDir = path.join(__dirname, '../object_generator/generated_objects', categoryPath);
        
        try {
            // Get all JSON files in this category recursively
            const files = this.getAllJsonFiles(categoryDir);
            if (files.length === 0) return null;
            
            // Pick random file and load it
            const randomFile = files[Math.floor(Math.random() * files.length)];
            const objects = JSON.parse(fs.readFileSync(randomFile, 'utf8'));
            
            // Return random object from the file
            if (Array.isArray(objects) && objects.length > 0) {
                return objects[Math.floor(Math.random() * objects.length)];
            }
        } catch (err) {
            // Silently skip if category doesn't exist
        }
        
        return null;
    }
    
    getAllJsonFiles(dir) {
        let results = [];
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    results = results.concat(this.getAllJsonFiles(fullPath));
                } else if (file.endsWith('.json') && file !== 'catalog.json') {
                    results.push(fullPath);
                }
            }
        } catch (err) {
            // Return empty if directory doesn't exist
        }
        return results;
    }

    estimateTerrainHeight(chunkX, chunkZ) {
        // Simple height estimation (in production, would query actual terrain)
        const worldX = chunkX * 1000 + 500;
        const worldZ = chunkZ * 1000 + 500;
        return Math.sin(worldX * 0.01) * 50 + Math.cos(worldZ * 0.01) * 30;
    }

    // ==========================================
    // CITY POPULATION
    // ==========================================

    async populateCities() {
        for (const city of this.worldData.cities) {
            console.log(`  🏙️  Populating ${city.name}...`);

            const config = this.cityObjects[city.architecture];
            if (!config) continue;

            // Populate buildings
            for (const building of city.buildings) {
                this.populateBuilding(building, city, config);
            }

            // Populate roads (vehicles, street furniture)
            for (const road of city.roads) {
                this.populateRoad(road, city, config);
            }

            // Populate landmarks
            for (const landmark of city.landmarks) {
                this.populateLandmark(landmark, city, config);
            }

            console.log(`    ✓ Populated ${city.buildings.length} buildings, ${city.roads.length} roads`);
        }
    }

    populateBuilding(building, city, config) {
        // Determine building interior object count based on size
        const volume = building.width * building.depth * building.height;
        const objectCount = Math.floor(volume * 0.01); // 1 object per 100 cubic meters

        for (let i = 0; i < objectCount; i++) {
            const obj = this.selectObjectForCity(city.architecture);
            if (!obj) continue;

            // Place inside building
            const position = {
                x: building.position.x + (Math.random() - 0.5) * building.width,
                y: building.position.y || 0,
                z: building.position.z + (Math.random() - 0.5) * building.depth
            };

            const rotation = {
                x: 0,
                y: Math.random() * Math.PI * 2,
                z: 0
            };

            const scale = { x: 1, y: 1, z: 1 };

            this.placeObject(obj, position, rotation, scale, city.architecture, city.name);
        }
    }

    populateRoad(road, city, config) {
        // Place vehicles and street furniture along roads
        if (road.type === 'ring') {
            const circumference = 2 * Math.PI * road.radius;
            const vehicleCount = Math.floor(circumference / 50); // 1 vehicle per 50m

            for (let i = 0; i < vehicleCount; i++) {
                const angle = (i / vehicleCount) * Math.PI * 2;
                const x = road.center.x + Math.cos(angle) * road.radius;
                const z = road.center.z + Math.sin(angle) * road.radius;

                const obj = this.selectVehicle();
                if (!obj) continue;

                const position = { x, y: 0, z };
                const rotation = { x: 0, y: angle + Math.PI / 2, z: 0 };
                const scale = { x: 1, y: 1, z: 1 };

                this.placeObject(obj, position, rotation, scale, city.architecture, city.name);
            }
        }
    }

    populateLandmark(landmark, city, config) {
        // Place special decorative objects around landmarks
        const decorCount = 20;

        for (let i = 0; i < decorCount; i++) {
            const angle = (i / decorCount) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;

            const position = {
                x: landmark.position.x + Math.cos(angle) * distance,
                y: 0,
                z: landmark.position.z + Math.sin(angle) * distance
            };

            const obj = this.selectDecorativeObject();
            if (!obj) continue;

            const rotation = {
                x: 0,
                y: Math.random() * Math.PI * 2,
                z: 0
            };

            const scale = {
                x: 1.5 + Math.random(),
                y: 1.5 + Math.random(),
                z: 1.5 + Math.random()
            };

            this.placeObject(obj, position, rotation, scale, city.architecture, city.name);
        }
    }

    selectObjectForCity(architecture) {
        const config = this.cityObjects[architecture];
        if (!config) return null;

        const category = config.categories[Math.floor(Math.random() * config.categories.length)];
        return this.selectObjectFromCategory(category);
    }

    selectVehicle() {
        return this.selectObjectFromCategory('Vehicles');
    }

    selectDecorativeObject() {
        return this.selectObjectFromCategory('Art & Decor');
    }
    
    selectObjectFromCategory(category) {
        const categoryPath = category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
        const categoryDir = path.join(__dirname, '../object_generator/generated_objects', categoryPath);
        
        try {
            const files = this.getAllJsonFiles(categoryDir);
            if (files.length === 0) return null;
            
            const randomFile = files[Math.floor(Math.random() * files.length)];
            const objects = JSON.parse(fs.readFileSync(randomFile, 'utf8'));
            
            if (Array.isArray(objects) && objects.length > 0) {
                return objects[Math.floor(Math.random() * objects.length)];
            }
        } catch (err) {
            // Silently skip if category doesn't exist
        }
        
        return null;
    }

    // ==========================================
    // SPECIAL LOCATIONS
    // ==========================================

    async addSpecialLocations() {
        // Add resource gathering locations
        this.addResourceNodes();

        // Add quest locations
        this.addQuestLocations();

        // Add hidden treasures
        this.addTreasureLocations();
    }

    addResourceNodes() {
        // Mining nodes, lumber camps, etc.
        const nodeCount = 100;

        for (let i = 0; i < nodeCount; i++) {
            const position = {
                x: Math.random() * 100000,
                y: 0,
                z: Math.random() * 100000
            };

            const resourceType = ['wood', 'stone', 'crystal', 'ore'][Math.floor(Math.random() * 4)];
            const obj = this.selectObjectForResource(resourceType);

            if (obj) {
                const rotation = { x: 0, y: Math.random() * Math.PI * 2, z: 0 };
                const scale = { x: 2, y: 2, z: 2 }; // Larger for visibility

                this.placeObject(obj, position, rotation, scale, resourceType, 'resource-node');
            }
        }

        console.log(`  ✓ Placed ${nodeCount} resource nodes`);
    }

    addQuestLocations() {
        // Special quest objects
        const questCount = 50;

        for (let i = 0; i < questCount; i++) {
            const position = {
                x: Math.random() * 100000,
                y: 0,
                z: Math.random() * 100000
            };

            const obj = this.selectDecorativeObject();
            if (obj) {
                const rotation = { x: 0, y: Math.random() * Math.PI * 2, z: 0 };
                const scale = { x: 1.5, y: 1.5, z: 1.5 };

                this.placeObject(obj, position, rotation, scale, 'quest', 'quest-location');
            }
        }

        console.log(`  ✓ Placed ${questCount} quest locations`);
    }

    addTreasureLocations() {
        // Hidden treasure chests
        const treasureCount = 25;

        for (let i = 0; i < treasureCount; i++) {
            const position = {
                x: Math.random() * 100000,
                y: 0,
                z: Math.random() * 100000
            };

            // Find treasure chest objects
            const furniture = this.objectCatalog.byCategory['Furniture'];
            if (furniture) {
                const obj = furniture[Math.floor(Math.random() * furniture.length)];
                const rotation = { x: 0, y: Math.random() * Math.PI * 2, z: 0 };
                const scale = { x: 1, y: 1, z: 1 };

                this.placeObject(obj, position, rotation, scale, 'treasure', 'treasure-location');
            }
        }

        console.log(`  ✓ Placed ${treasureCount} treasure locations`);
    }

    selectObjectForResource(resourceType) {
        const nature = this.objectCatalog.byCategory['Nature'];
        if (!nature || nature.length === 0) return null;
        return nature[Math.floor(Math.random() * nature.length)];
    }

    // ==========================================
    // OBJECT PLACEMENT
    // ==========================================

    placeObject(objectTemplate, position, rotation, scale, biome, location) {
        this.placedObjects.push({
            objectId: objectTemplate.objectId,
            category: objectTemplate.category,
            position,
            rotation,
            scale,
            biome,
            location
        });

        // Update stats
        this.stats.totalPlaced++;

        if (!this.stats.byCategory[objectTemplate.category]) {
            this.stats.byCategory[objectTemplate.category] = 0;
        }
        this.stats.byCategory[objectTemplate.category]++;

        if (!this.stats.byBiome[biome]) {
            this.stats.byBiome[biome] = 0;
        }
        this.stats.byBiome[biome]++;

        if (!this.stats.byCity[location]) {
            this.stats.byCity[location] = 0;
        }
        this.stats.byCity[location]++;
    }

    // ==========================================
    // STATISTICS & SAVING
    // ==========================================

    printStatistics() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 POPULATION STATISTICS');
        console.log('='.repeat(60));
        console.log(`Total Objects Placed: ${this.stats.totalPlaced.toLocaleString()}`);
        
        console.log('\nBy Category:');
        for (const [category, count] of Object.entries(this.stats.byCategory)) {
            console.log(`  ${category}: ${count.toLocaleString()}`);
        }

        console.log('\nBy Biome:');
        for (const [biome, count] of Object.entries(this.stats.byBiome)) {
            console.log(`  ${biome}: ${count.toLocaleString()}`);
        }

        console.log('\nTop Locations:');
        const topLocations = Object.entries(this.stats.byCity)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        for (const [location, count] of topLocations) {
            console.log(`  ${location}: ${count.toLocaleString()}`);
        }

        console.log('\n' + '='.repeat(60) + '\n');
    }

    async saveResults() {
        console.log('💾 Saving population data...');

        // Save placed objects (first 10000 for demo - full version would use database)
        const outputPath = 'pixelverse_objects.json';
        fs.writeFileSync(outputPath, JSON.stringify({
            totalPlaced: this.stats.totalPlaced,
            sampleObjects: this.placedObjects.slice(0, 10000),
            stats: this.stats
        }, null, 2));

        console.log(`  ✓ Saved to: ${outputPath}`);
        console.log(`  ℹ️  Showing first 10,000 objects (full ${this.stats.totalPlaced} ready for database)`);
    }
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           PIXELVERSE OBJECT POPULATION SYSTEM              ║');
    console.log('║          Distributing 100K Objects Across World            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        const populator = new ObjectPopulator();
        await populator.init();
        await populator.populateWorld();

        console.log('✨ Population complete! Objects ready for rendering.\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { ObjectPopulator };
