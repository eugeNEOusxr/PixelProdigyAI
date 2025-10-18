/**
 * World Object Placement System
 * Distributes 99,640 VLS objects across 100km² world
 * Uses biome-aware procedural placement
 */

const fs = require('fs');

class WorldObjectPlacer {
    constructor(worldSize, objectMetadata, lootTables) {
        this.worldSize = worldSize; // km²
        this.metadata = objectMetadata;
        this.lootTables = lootTables;
        this.placements = [];
        
        // Biome definitions (100km² = 10km x 10km)
        this.biomes = {
            forest: { area: 0.30, objects: ['tree', 'bush', 'herb', 'mushroom', 'furniture'] },
            plains: { area: 0.25, objects: ['herb', 'furniture', 'decorations', 'resources'] },
            mountains: { area: 0.20, objects: ['rock', 'iron_vein', 'gold_vein', 'crystal'] },
            desert: { area: 0.10, objects: ['cactus', 'decorations'] },
            tundra: { area: 0.08, objects: ['tree', 'rock'] },
            swamp: { area: 0.07, objects: ['mushroom', 'herb', 'tree'] }
        };
        
        // Density settings (objects per km²)
        this.density = {
            resources: 200,    // 20,000 total
            furniture: 150,    // 15,000 total
            decorations: 266,  // 26,640 total
            vehicles: 80,      // 8,000 total
            weapons: 120,      // 12,000 total (in containers/enemies)
            armor: 180         // 18,000 total (in containers/enemies)
        };
    }

    // Place all objects in world
    placeAllObjects() {
        console.log('=== Placing Objects in World ===\n');
        
        const start = Date.now();
        
        // Place by category
        this.placeResources();
        this.placeFurniture();
        this.placeDecorations();
        this.placeVehicles();
        this.placeContainers();
        
        const duration = (Date.now() - start) / 1000;
        
        console.log(`\n✓ Placed ${this.placements.length} objects in ${duration.toFixed(2)}s`);
        console.log(`Rate: ${Math.floor(this.placements.length / duration)} objects/sec`);
    }

    // Place resource nodes (trees, rocks, ores)
    placeResources() {
        console.log('Placing resource nodes...');
        
        const resources = this.metadata.objects.filter(obj => obj.category === 'resources');
        const targetCount = 20000;
        
        for (let i = 0; i < targetCount; i++) {
            const resource = resources[Math.floor(Math.random() * resources.length)];
            const biome = resource.biome || this.randomBiome();
            const position = this.getRandomPosition(biome);
            
            this.placements.push({
                id: `placement_resource_${i}`,
                objectId: resource.id,
                name: resource.name,
                category: 'resources',
                position: position,
                rotation: Math.random() * 360,
                scale: 0.8 + Math.random() * 0.4, // 0.8 - 1.2
                biome: biome,
                respawnTime: resource.respawnTime,
                interactionType: resource.interactionType,
                lootTable: this.getLootTableForResource(resource.name)
            });
        }
        
        console.log(`✓ Placed ${targetCount} resource nodes`);
    }

    // Place furniture (buildings, houses)
    placeFurniture() {
        console.log('Placing furniture...');
        
        const furniture = this.metadata.objects.filter(obj => obj.category === 'furniture');
        const targetCount = 15000;
        
        // Cluster furniture in settlements
        const settlementCount = 50;
        const settlementsizes = [100, 200, 300, 500]; // Objects per settlement
        
        let placed = 0;
        for (let i = 0; i < settlementCount && placed < targetCount; i++) {
            const settlementSize = settlementsizes[Math.floor(Math.random() * settlementsizes.length)];
            const settlementCenter = this.getRandomPosition('plains');
            const settlementRadius = Math.sqrt(settlementSize) * 10; // meters
            
            for (let j = 0; j < settlementSize && placed < targetCount; j++) {
                const item = furniture[Math.floor(Math.random() * furniture.length)];
                
                // Place near settlement center
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * settlementRadius;
                const position = {
                    x: settlementCenter.x + Math.cos(angle) * distance,
                    y: 0,
                    z: settlementCenter.z + Math.sin(angle) * distance
                };
                
                this.placements.push({
                    id: `placement_furniture_${placed}`,
                    objectId: item.id,
                    name: item.name,
                    category: 'furniture',
                    position: position,
                    rotation: Math.random() * 360,
                    scale: 1.0,
                    biome: 'plains',
                    settlement: `settlement_${i}`,
                    interactionType: item.interactionType
                });
                
                placed++;
            }
        }
        
        console.log(`✓ Placed ${placed} furniture items in ${settlementCount} settlements`);
    }

    // Place decorations (scattered everywhere)
    placeDecorations() {
        console.log('Placing decorations...');
        
        const decorations = this.metadata.objects.filter(obj => obj.category === 'decorations');
        const targetCount = 26640;
        
        for (let i = 0; i < targetCount; i++) {
            const item = decorations[Math.floor(Math.random() * decorations.length)];
            const biome = this.randomBiome();
            const position = this.getRandomPosition(biome);
            
            this.placements.push({
                id: `placement_decoration_${i}`,
                objectId: item.id,
                name: item.name,
                category: 'decorations',
                position: position,
                rotation: Math.random() * 360,
                scale: 0.7 + Math.random() * 0.6, // 0.7 - 1.3
                biome: biome,
                interactionType: 'none'
            });
        }
        
        console.log(`✓ Placed ${targetCount} decorations`);
    }

    // Place vehicles (roads, stables, docks)
    placeVehicles() {
        console.log('Placing vehicles...');
        
        const vehicles = this.metadata.objects.filter(obj => obj.category === 'vehicles');
        const targetCount = 8000;
        
        // Place vehicles in logical locations
        const locations = [
            { type: 'stable', count: 2000, biome: 'plains' },
            { type: 'dock', count: 1500, biome: 'forest' },
            { type: 'road', count: 3000, biome: 'plains' },
            { type: 'garage', count: 1500, biome: 'plains' }
        ];
        
        let placed = 0;
        locations.forEach(location => {
            for (let i = 0; i < location.count; i++) {
                const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
                const position = this.getRandomPosition(location.biome);
                
                this.placements.push({
                    id: `placement_vehicle_${placed}`,
                    objectId: vehicle.id,
                    name: vehicle.name,
                    category: 'vehicles',
                    position: position,
                    rotation: Math.random() * 360,
                    scale: 1.0,
                    biome: location.biome,
                    locationType: location.type,
                    interactionType: 'mount',
                    spawnTime: 300 // 5 minutes
                });
                
                placed++;
            }
        });
        
        console.log(`✓ Placed ${placed} vehicles`);
    }

    // Place containers (chests with loot)
    placeContainers() {
        console.log('Placing containers with loot...');
        
        const containerTypes = Object.keys(this.lootTables.lootTables.containers);
        const targetCount = 5000;
        
        for (let i = 0; i < targetCount; i++) {
            const containerType = containerTypes[Math.floor(Math.random() * containerTypes.length)];
            const lootTable = this.lootTables.lootTables.containers[containerType];
            const biome = this.randomBiome();
            const position = this.getRandomPosition(biome);
            
            this.placements.push({
                id: `placement_container_${i}`,
                objectId: `container_${containerType}`,
                name: containerType.replace(/_/g, ' '),
                category: 'containers',
                position: position,
                rotation: Math.random() * 360,
                scale: 1.0,
                biome: biome,
                interactionType: 'loot',
                lootTable: containerType,
                respawnTime: 1800 // 30 minutes
            });
        }
        
        console.log(`✓ Placed ${targetCount} containers`);
    }

    // Get random position in biome
    getRandomPosition(biome) {
        const worldSizeMeters = this.worldSize * 1000; // km to meters
        
        // Get biome boundaries (simplified)
        const biomeBounds = this.getBiomeBounds(biome);
        
        return {
            x: biomeBounds.minX + Math.random() * (biomeBounds.maxX - biomeBounds.minX),
            y: 0, // Height will be determined by terrain
            z: biomeBounds.minZ + Math.random() * (biomeBounds.maxZ - biomeBounds.minZ)
        };
    }

    // Get biome boundaries
    getBiomeBounds(biome) {
        const worldSize = this.worldSize * 1000; // meters
        
        // Simplified biome regions
        const regions = {
            forest: { minX: 0, maxX: worldSize * 0.5, minZ: 0, maxZ: worldSize * 0.6 },
            plains: { minX: worldSize * 0.5, maxX: worldSize, minZ: 0, maxZ: worldSize * 0.5 },
            mountains: { minX: 0, maxX: worldSize * 0.4, minZ: worldSize * 0.6, maxZ: worldSize },
            desert: { minX: worldSize * 0.5, maxX: worldSize, minZ: worldSize * 0.5, maxZ: worldSize * 0.7 },
            tundra: { minX: worldSize * 0.4, maxX: worldSize * 0.7, minZ: worldSize * 0.7, maxZ: worldSize },
            swamp: { minX: worldSize * 0.7, maxX: worldSize, minZ: worldSize * 0.7, maxZ: worldSize }
        };
        
        return regions[biome] || regions.plains;
    }

    // Random biome weighted by area
    randomBiome() {
        const roll = Math.random();
        let cumulative = 0;
        
        for (const [biome, data] of Object.entries(this.biomes)) {
            cumulative += data.area;
            if (roll <= cumulative) {
                return biome;
            }
        }
        
        return 'plains';
    }

    // Get loot table for resource
    getLootTableForResource(resourceName) {
        const resourceType = resourceName.toLowerCase().split(' ').pop();
        return this.lootTables.lootTables.resources[resourceType] || null;
    }

    // Export to JSON
    exportToJSON(filename) {
        console.log('\nExporting placement data...');
        
        const output = {
            version: '1.0',
            worldSize: this.worldSize,
            generated: new Date().toISOString(),
            totalPlacements: this.placements.length,
            biomes: this.biomes,
            placements: this.placements
        };

        fs.writeFileSync(filename, JSON.stringify(output, null, 2));
        console.log(`✓ Exported to ${filename}`);
    }

    // Export spatial index (for fast lookup)
    exportSpatialIndex(filename) {
        console.log('Generating spatial index...');
        
        const gridSize = 100; // 100m cells
        const worldSize = this.worldSize * 1000;
        const gridWidth = Math.ceil(worldSize / gridSize);
        const grid = {};
        
        // Initialize grid
        for (let x = 0; x < gridWidth; x++) {
            for (let z = 0; z < gridWidth; z++) {
                const key = `${x}_${z}`;
                grid[key] = [];
            }
        }
        
        // Place objects in grid cells
        this.placements.forEach(placement => {
            const gridX = Math.floor(placement.position.x / gridSize);
            const gridZ = Math.floor(placement.position.z / gridSize);
            const key = `${gridX}_${gridZ}`;
            
            if (grid[key]) {
                grid[key].push({
                    id: placement.id,
                    objectId: placement.objectId,
                    category: placement.category,
                    position: placement.position
                });
            }
        });
        
        const output = {
            version: '1.0',
            gridSize: gridSize,
            gridWidth: gridWidth,
            worldSize: worldSize,
            totalCells: gridWidth * gridWidth,
            grid: grid
        };
        
        fs.writeFileSync(filename, JSON.stringify(output, null, 2));
        console.log(`✓ Spatial index exported to ${filename}`);
    }

    // Print statistics
    printStatistics() {
        console.log('\n=== Placement Statistics ===');
        
        // Count by category
        const byCategory = {};
        this.placements.forEach(p => {
            byCategory[p.category] = (byCategory[p.category] || 0) + 1;
        });
        
        console.log('\nObjects by Category:');
        for (const [cat, count] of Object.entries(byCategory)) {
            console.log(`  ${cat}: ${count}`);
        }
        
        // Count by biome
        const byBiome = {};
        this.placements.forEach(p => {
            byBiome[p.biome] = (byBiome[p.biome] || 0) + 1;
        });
        
        console.log('\nObjects by Biome:');
        for (const [biome, count] of Object.entries(byBiome)) {
            console.log(`  ${biome}: ${count}`);
        }
        
        // Density
        const density = this.placements.length / this.worldSize;
        console.log(`\nDensity: ${Math.floor(density)} objects per km²`);
    }
}

// Main execution
if (require.main === module) {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║    World Object Placement System          ║');
    console.log('║    100km² Biome-Aware Distribution        ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Load metadata and loot tables
    console.log('Loading data...');
    const metadata = JSON.parse(fs.readFileSync('object_metadata.json', 'utf8'));
    const lootTables = JSON.parse(fs.readFileSync('loot_tables.json', 'utf8'));
    console.log(`✓ Loaded ${metadata.totalObjects} objects`);
    console.log(`✓ Loaded ${lootTables.totalTables} loot tables\n`);

    // Place objects
    const placer = new WorldObjectPlacer(100, metadata, lootTables);
    placer.placeAllObjects();
    
    // Print statistics
    placer.printStatistics();
    
    // Export
    placer.exportToJSON('world_object_placements.json');
    placer.exportSpatialIndex('world_spatial_index.json');
    
    console.log('\n✓ World object placement complete!');
}

module.exports = WorldObjectPlacer;
