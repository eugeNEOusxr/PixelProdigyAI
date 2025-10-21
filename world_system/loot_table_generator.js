/**
 * Loot Table Generator
 * Creates intelligent loot tables for containers, enemies, and resource nodes
 * JavaScript for JSON compatibility
 */

const fs = require('fs');

class LootTableGenerator {
    constructor(objectMetadata) {
        this.metadata = objectMetadata;
        this.lootTables = {
            containers: {},
            enemies: {},
            resources: {},
            bosses: {},
            quests: {}
        };
    }

    // Generate all loot tables
    generateAllTables() {
        console.log('=== Generating Loot Tables ===\n');
        
        this.generateContainerLoot();
        this.generateEnemyLoot();
        this.generateResourceLoot();
        this.generateBossLoot();
        this.generateQuestLoot();
        
        console.log('\n✓ All loot tables generated');
    }

    // Container loot (chests, barrels, crates)
    generateContainerLoot() {
        console.log('Generating container loot tables...');
        
        const containerTypes = [
            { name: 'common_chest', level: 1, itemCount: [1, 3], goldRange: [10, 50] },
            { name: 'uncommon_chest', level: 10, itemCount: [2, 4], goldRange: [50, 150] },
            { name: 'rare_chest', level: 20, itemCount: [3, 6], goldRange: [150, 500] },
            { name: 'epic_chest', level: 40, itemCount: [4, 8], goldRange: [500, 2000] },
            { name: 'legendary_chest', level: 60, itemCount: [5, 10], goldRange: [2000, 10000] },
            { name: 'barrel', level: 1, itemCount: [1, 2], goldRange: [5, 25] },
            { name: 'crate', level: 1, itemCount: [1, 3], goldRange: [10, 40] },
            { name: 'treasure_chest', level: 50, itemCount: [6, 12], goldRange: [3000, 15000] }
        ];

        containerTypes.forEach(container => {
            const lootTable = {
                type: 'container',
                name: container.name,
                level: container.level,
                goldMin: container.goldRange[0],
                goldMax: container.goldRange[1],
                itemCountMin: container.itemCount[0],
                itemCountMax: container.itemCount[1],
                loot: this.createLootPool(container.level, container.itemCount[1])
            };

            this.lootTables.containers[container.name] = lootTable;
        });

        console.log(`✓ Generated ${Object.keys(this.lootTables.containers).length} container types`);
    }

    // Enemy loot (monsters, NPCs)
    generateEnemyLoot() {
        console.log('Generating enemy loot tables...');
        
        const enemyTypes = [
            { name: 'goblin', level: 3, difficulty: 'common', goldRange: [5, 15] },
            { name: 'orc', level: 8, difficulty: 'common', goldRange: [15, 30] },
            { name: 'skeleton', level: 5, difficulty: 'common', goldRange: [8, 20] },
            { name: 'zombie', level: 6, difficulty: 'common', goldRange: [10, 25] },
            { name: 'wolf', level: 4, difficulty: 'common', goldRange: [5, 12] },
            { name: 'bear', level: 12, difficulty: 'uncommon', goldRange: [25, 60] },
            { name: 'troll', level: 18, difficulty: 'uncommon', goldRange: [50, 120] },
            { name: 'dark_knight', level: 25, difficulty: 'rare', goldRange: [100, 250] },
            { name: 'demon', level: 35, difficulty: 'rare', goldRange: [200, 500] },
            { name: 'dragon_whelp', level: 45, difficulty: 'epic', goldRange: [400, 1000] }
        ];

        enemyTypes.forEach(enemy => {
            const itemCount = this.getItemCountByDifficulty(enemy.difficulty);
            const lootTable = {
                type: 'enemy',
                name: enemy.name,
                level: enemy.level,
                difficulty: enemy.difficulty,
                goldMin: enemy.goldRange[0],
                goldMax: enemy.goldRange[1],
                dropChance: this.getDropChanceByDifficulty(enemy.difficulty),
                loot: this.createLootPool(enemy.level, itemCount, enemy.difficulty)
            };

            this.lootTables.enemies[enemy.name] = lootTable;
        });

        console.log(`✓ Generated ${Object.keys(this.lootTables.enemies).length} enemy types`);
    }

    // Resource loot (trees, rocks, plants)
    generateResourceLoot() {
        console.log('Generating resource loot tables...');
        
        const resourceTypes = [
            { name: 'tree', yields: ['wood', 'stick', 'sap'], level: 1 },
            { name: 'iron_vein', yields: ['iron_ore', 'stone'], level: 10 },
            { name: 'gold_vein', yields: ['gold_ore', 'stone'], level: 30 },
            { name: 'silver_vein', yields: ['silver_ore', 'stone'], level: 20 },
            { name: 'herb', yields: ['healing_herb', 'mana_herb'], level: 5 },
            { name: 'crystal', yields: ['magic_crystal', 'crystal_shard'], level: 40 },
            { name: 'coal_deposit', yields: ['coal', 'stone'], level: 15 },
            { name: 'mushroom', yields: ['mushroom', 'spores'], level: 8 }
        ];

        resourceTypes.forEach(resource => {
            const lootTable = {
                type: 'resource',
                name: resource.name,
                level: resource.level,
                yields: resource.yields,
                quantityMin: 1,
                quantityMax: this.getResourceYield(resource.level),
                gatherTime: this.getGatherTime(resource.level),
                respawnTime: this.getRespawnTime(resource.level)
            };

            this.lootTables.resources[resource.name] = lootTable;
        });

        console.log(`✓ Generated ${Object.keys(this.lootTables.resources).length} resource types`);
    }

    // Boss loot (raid bosses, world bosses)
    generateBossLoot() {
        console.log('Generating boss loot tables...');
        
        const bossTypes = [
            { name: 'forest_guardian', level: 15, guaranteed: 2, bonus: [3, 5] },
            { name: 'mountain_king', level: 30, guaranteed: 3, bonus: [4, 7] },
            { name: 'sea_leviathan', level: 45, guaranteed: 4, bonus: [5, 10] },
            { name: 'ancient_dragon', level: 60, guaranteed: 5, bonus: [7, 15] },
            { name: 'lich_lord', level: 50, guaranteed: 4, bonus: [6, 12] },
            { name: 'demon_overlord', level: 70, guaranteed: 6, bonus: [8, 20] },
            { name: 'world_eater', level: 100, guaranteed: 10, bonus: [15, 30] }
        ];

        bossTypes.forEach(boss => {
            const lootTable = {
                type: 'boss',
                name: boss.name,
                level: boss.level,
                goldMin: boss.level * 100,
                goldMax: boss.level * 500,
                guaranteedDrops: boss.guaranteed,
                bonusItems: boss.bonus,
                guaranteedLoot: this.createGuaranteedLoot(boss.level, boss.guaranteed),
                bonusLoot: this.createLootPool(boss.level, boss.bonus[1], 'epic'),
                uniqueDrops: this.createUniqueBossDrops(boss.name, boss.level)
            };

            this.lootTables.bosses[boss.name] = lootTable;
        });

        console.log(`✓ Generated ${Object.keys(this.lootTables.bosses).length} boss types`);
    }

    // Quest loot (quest rewards)
    generateQuestLoot() {
        console.log('Generating quest loot tables...');
        
        const questTypes = [
            { name: 'tutorial_quest', level: 1, rewards: 2 },
            { name: 'main_story_1', level: 5, rewards: 3 },
            { name: 'main_story_2', level: 15, rewards: 4 },
            { name: 'side_quest', level: 10, rewards: 2 },
            { name: 'epic_quest', level: 30, rewards: 5 },
            { name: 'legendary_quest', level: 50, rewards: 7 },
            { name: 'daily_quest', level: 20, rewards: 2 },
            { name: 'weekly_quest', level: 25, rewards: 4 }
        ];

        questTypes.forEach(quest => {
            const lootTable = {
                type: 'quest',
                name: quest.name,
                level: quest.level,
                goldReward: quest.level * 50,
                experienceReward: quest.level * 100,
                itemRewards: this.createQuestRewards(quest.level, quest.rewards)
            };

            this.lootTables.quests[quest.name] = lootTable;
        });

        console.log(`✓ Generated ${Object.keys(this.lootTables.quests).length} quest types`);
    }

    // Create loot pool based on level and difficulty
    createLootPool(level, maxItems, difficulty = 'common') {
        const pool = [];
        const categories = ['weapons', 'armor', 'resources', 'furniture'];
        
        // Filter objects by level range
        const levelRange = 10;
        const validObjects = this.metadata.objects.filter(obj => 
            categories.includes(obj.category) &&
            obj.level >= level - levelRange &&
            obj.level <= level + levelRange
        );

        // Group by rarity
        const byRarity = {
            common: validObjects.filter(o => o.rarity === 'common'),
            uncommon: validObjects.filter(o => o.rarity === 'uncommon'),
            rare: validObjects.filter(o => o.rarity === 'rare'),
            epic: validObjects.filter(o => o.rarity === 'epic'),
            legendary: validObjects.filter(o => o.rarity === 'legendary')
        };

        // Weight distribution based on difficulty
        const weights = this.getRarityWeights(difficulty);

        // Add items to pool
        for (const [rarity, weight] of Object.entries(weights)) {
            if (byRarity[rarity] && byRarity[rarity].length > 0) {
                const count = Math.min(5, byRarity[rarity].length);
                const selected = this.randomSample(byRarity[rarity], count);
                
                selected.forEach(obj => {
                    pool.push({
                        itemId: obj.id,
                        name: obj.name,
                        rarity: obj.rarity,
                        dropChance: weight,
                        quantity: obj.stackSize > 1 ? [1, obj.stackSize] : 1
                    });
                });
            }
        }

        return pool;
    }

    // Create guaranteed boss drops
    createGuaranteedLoot(level, count) {
        const guaranteed = [];
        const rareLoot = this.metadata.objects.filter(obj => 
            (obj.category === 'weapons' || obj.category === 'armor') &&
            obj.level >= level - 5 &&
            obj.level <= level + 5 &&
            (obj.rarity === 'rare' || obj.rarity === 'epic' || obj.rarity === 'legendary')
        );

        const selected = this.randomSample(rareLoot, count);
        selected.forEach(obj => {
            guaranteed.push({
                itemId: obj.id,
                name: obj.name,
                rarity: obj.rarity,
                guaranteed: true
            });
        });

        return guaranteed;
    }

    // Create unique boss drops
    createUniqueBossDrops(bossName, level) {
        // Create 2-3 unique items per boss
        const uniqueCount = Math.floor(Math.random() * 2) + 2;
        const uniqueItems = [];

        for (let i = 0; i < uniqueCount; i++) {
            const itemType = ['weapon', 'armor', 'accessory'][Math.floor(Math.random() * 3)];
            uniqueItems.push({
                itemId: `${bossName}_unique_${i + 1}`,
                name: `${this.capitalize(bossName)}'s ${itemType === 'weapon' ? 'Blade' : itemType === 'armor' ? 'Armor' : 'Amulet'}`,
                rarity: 'legendary',
                dropChance: 0.05, // 5% chance
                unique: true,
                level: level,
                description: `A legendary item once wielded by ${this.capitalize(bossName)}`
            });
        }

        return uniqueItems;
    }

    // Create quest rewards
    createQuestRewards(level, count) {
        const rewards = [];
        const validItems = this.metadata.objects.filter(obj => 
            obj.level >= level - 3 &&
            obj.level <= level + 3
        );

        const selected = this.randomSample(validItems, count);
        selected.forEach(obj => {
            rewards.push({
                itemId: obj.id,
                name: obj.name,
                rarity: obj.rarity,
                quantity: 1,
                choice: false // Set to true if player can choose
            });
        });

        return rewards;
    }

    // Get rarity weights by difficulty
    getRarityWeights(difficulty) {
        const weights = {
            common: {
                common: 0.80,
                uncommon: 0.15,
                rare: 0.04,
                epic: 0.01,
                legendary: 0.001
            },
            uncommon: {
                common: 0.60,
                uncommon: 0.30,
                rare: 0.08,
                epic: 0.02,
                legendary: 0.002
            },
            rare: {
                common: 0.40,
                uncommon: 0.35,
                rare: 0.18,
                epic: 0.06,
                legendary: 0.01
            },
            epic: {
                common: 0.20,
                uncommon: 0.30,
                rare: 0.30,
                epic: 0.15,
                legendary: 0.05
            },
            legendary: {
                common: 0.10,
                uncommon: 0.20,
                rare: 0.30,
                epic: 0.30,
                legendary: 0.10
            }
        };

        return weights[difficulty] || weights.common;
    }

    // Get item count by difficulty
    getItemCountByDifficulty(difficulty) {
        const counts = {
            common: 2,
            uncommon: 3,
            rare: 4,
            epic: 6,
            legendary: 10
        };
        return counts[difficulty] || 2;
    }

    // Get drop chance by difficulty
    getDropChanceByDifficulty(difficulty) {
        const chances = {
            common: 0.40,
            uncommon: 0.60,
            rare: 0.75,
            epic: 0.90,
            legendary: 1.00
        };
        return chances[difficulty] || 0.40;
    }

    // Get resource yield by level
    getResourceYield(level) {
        return Math.floor(1 + (level / 10));
    }

    // Get gather time by level
    getGatherTime(level) {
        return 3.0 + (level / 20); // 3-8 seconds
    }

    // Get respawn time by level
    getRespawnTime(level) {
        return 60 + (level * 5); // 1-10 minutes
    }

    // Random sample from array
    randomSample(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }

    // Capitalize string
    capitalize(str) {
        return str.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Export to JSON
    exportToJSON(filename) {
        console.log('\nExporting loot tables...');
        
        const output = {
            version: '1.0',
            generated: new Date().toISOString(),
            totalTables: Object.keys(this.lootTables.containers).length +
                        Object.keys(this.lootTables.enemies).length +
                        Object.keys(this.lootTables.resources).length +
                        Object.keys(this.lootTables.bosses).length +
                        Object.keys(this.lootTables.quests).length,
            lootTables: this.lootTables
        };

        fs.writeFileSync(filename, JSON.stringify(output, null, 2));
        console.log(`✓ Exported to ${filename}`);
    }

    // Print statistics
    printStatistics() {
        console.log('\n=== Loot Table Statistics ===');
        console.log(`\nContainer types: ${Object.keys(this.lootTables.containers).length}`);
        console.log(`Enemy types: ${Object.keys(this.lootTables.enemies).length}`);
        console.log(`Resource types: ${Object.keys(this.lootTables.resources).length}`);
        console.log(`Boss types: ${Object.keys(this.lootTables.bosses).length}`);
        console.log(`Quest types: ${Object.keys(this.lootTables.quests).length}`);
        
        const totalTables = Object.keys(this.lootTables.containers).length +
                           Object.keys(this.lootTables.enemies).length +
                           Object.keys(this.lootTables.resources).length +
                           Object.keys(this.lootTables.bosses).length +
                           Object.keys(this.lootTables.quests).length;
        
        console.log(`\nTotal loot tables: ${totalTables}`);
    }
}

// Main execution
if (require.main === module) {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║      Loot Table Generator                 ║');
    console.log('║      Intelligent Reward Distribution      ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Load object metadata
    console.log('Loading object metadata...');
    const metadata = JSON.parse(fs.readFileSync('object_metadata.json', 'utf8'));
    console.log(`✓ Loaded ${metadata.totalObjects} objects\n`);

    // Generate loot tables
    const generator = new LootTableGenerator(metadata);
    generator.generateAllTables();
    
    // Print statistics
    generator.printStatistics();
    
    // Export
    generator.exportToJSON('loot_tables.json');
    
    console.log('\n✓ Loot table generation complete!');
}

module.exports = LootTableGenerator;
