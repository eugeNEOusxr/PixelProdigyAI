/**
 * AI WorldForge Generator
 * Manages 20 AI test players building their own realms with personality-driven architecture
 * Integrates with cron jobs for time-based 3D object evolution
 */

const fs = require('fs');
const path = require('path');

class WorldForgeAI {
    constructor() {
        // Load configurations
        this.personalities = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'ai_test_players', 'ai_personalities.json'), 'utf8'
        ));
        
        this.seedTemplates = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'ai_test_players', 'ai_seed_objects.json'), 'utf8'
        ));
        
        // Load existing objects for AI to work with
        this.objectMetadata = this.loadObjectMetadata();
        
        // Active AI players
        this.activePlayers = [];
        
        // Growing objects tracked by cron
        this.growingObjects = new Map();
        
        // Realm data for each AI
        this.realms = new Map();
        
        // Meta-AI evaluation metrics
        this.buildMetrics = new Map();
        
        // Cron interval handle
        this.cronInterval = null;
        
        console.log('🤖 WorldForge AI System Initialized');
        console.log(`📊 Loaded ${this.personalities.ai_test_players.length} AI personalities`);
        console.log(`🌱 Loaded ${this.seedTemplates.seed_object_templates.length} seed templates`);
    }

    loadObjectMetadata() {
        try {
            const metadataPath = path.join(__dirname, 'world_system', 'object_metadata.json');
            if (fs.existsSync(metadataPath)) {
                return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️  Could not load object_metadata.json, using seed objects only');
        }
        return { objects: [] };
    }

    /**
     * Initialize all 20 AI test players and assign them realms
     */
    initializeAIPlayers() {
        console.log('\n🎭 Initializing 20 AI Test Players...\n');
        
        this.personalities.ai_test_players.forEach(personality => {
            const player = {
                ...personality,
                active: true,
                realmId: `realm_${personality.id}`,
                builtObjects: [],
                growingSeeds: [],
                buildQueue: [],
                stats: {
                    objectsBuilt: 0,
                    verticesGenerated: 0,
                    efficiencyScore: 0,
                    personalityAdherence: 1.0,
                    innovationScore: 0
                }
            };
            
            this.activePlayers.push(player);
            
            // Initialize realm
            this.initializeRealm(player);
            
            console.log(`✅ ${player.name} (${player.personality_type})`);
            console.log(`   Realm: ${player.realmId} | Seed: ${player.realm_seed}`);
            console.log(`   Focus: ${player.focus} | Style: ${player.building_style}`);
            console.log(`   Directive: "${player.ai_directive}"`);
            console.log('');
        });
        
        console.log(`🌍 All ${this.activePlayers.length} AI players initialized!\n`);
    }

    /**
     * Initialize a realm for an AI player
     */
    initializeRealm(player) {
        const realmSize = 10000; // 10km x 10km per realm
        
        const realm = {
            id: player.realmId,
            ownerId: player.id,
            ownerName: player.name,
            seed: player.realm_seed,
            biome: player.preferred_biome,
            bounds: {
                x: (player.realm_seed % 10) * realmSize,
                z: Math.floor(player.realm_seed / 10) * realmSize,
                width: realmSize,
                height: realmSize
            },
            objects: [],
            seedObjects: [],
            totalVertices: 0,
            buildPhase: 'foundation',
            lastUpdate: Date.now()
        };
        
        this.realms.set(player.realmId, realm);
        
        // Initialize build metrics
        this.buildMetrics.set(player.id, {
            structuralIntegrity: 1.0,
            aestheticAppeal: 0,
            resourceEfficiency: 1.0,
            personalityMatch: 1.0,
            innovation: 0,
            overallScore: 0
        });
    }

    /**
     * Meta-AI curates which objects each personality should build first
     */
    metaAICurateBuilds() {
        console.log('\n🧠 META-AI: Curating initial builds for each personality...\n');
        
        const recommendations = [];
        
        this.activePlayers.forEach(player => {
            const recommendation = this.metaAIChooseObjects(player);
            recommendations.push(recommendation);
            
            console.log(`🎯 ${player.name}:`);
            console.log(`   Priority: ${recommendation.priority}`);
            console.log(`   Objects: ${recommendation.objects.map(o => o.name).join(', ')}`);
            console.log(`   Strategy: ${recommendation.strategy}`);
            console.log(`   Reasoning: ${recommendation.reasoning}`);
            console.log('');
            
            // Add to player's build queue
            player.buildQueue = recommendation.objects;
        });
        
        return recommendations;
    }

    /**
     * Meta-AI intelligence for choosing objects based on personality
     */
    metaAIChooseObjects(player) {
        const traits = player.traits;
        const style = player.building_style;
        const focus = player.focus;
        
        // Priority determination
        let priority = 'balanced';
        if (traits.speed > 85) priority = 'rapid';
        else if (traits.precision > 90) priority = 'perfectionist';
        else if (traits.chaos > 85) priority = 'experimental';
        else if (traits.resource_efficiency > 90) priority = 'efficient';
        
        // Choose seed objects based on personality
        const chosenSeeds = [];
        
        // Match focus to seed types
        const focusMapping = {
            'castles_and_fortresses': ['seed_tower_001', 'seed_ruin_001'],
            'abstract_sculptures': ['seed_crystal_001', 'seed_machine_001'],
            'underwater_cities': ['seed_tower_001', 'seed_tree_001'],
            'modular_settlements': ['seed_tower_001', 'seed_machine_001'],
            'meditation_temples': ['seed_ruin_001', 'seed_tree_001'],
            'treehouse_villages': ['seed_tree_001'],
            'clockwork_towers': ['seed_machine_001', 'seed_tower_001'],
            'mage_towers': ['seed_tower_001', 'seed_crystal_001'],
            'ice_palaces': ['seed_crystal_001', 'seed_tower_001'],
            'scrap_settlements': ['seed_machine_001', 'seed_ruin_001'],
            'zen_gardens': ['seed_tree_001', 'seed_ruin_001'],
            'impossible_architecture': ['seed_crystal_001', 'seed_machine_001'],
            'megacities': ['seed_tower_001'],
            'space_stations': ['seed_machine_001', 'seed_crystal_001'],
            'amphitheaters': ['seed_ruin_001', 'seed_tower_001'],
            'light_cathedrals': ['seed_crystal_001', 'seed_tower_001'],
            'geometric_theorems': ['seed_crystal_001'],
            'ancient_temples': ['seed_ruin_001'],
            'wind_spires': ['seed_tower_001', 'seed_crystal_001'],
            'negative_architecture': ['seed_tower_001']
        };
        
        const preferredSeeds = focusMapping[focus] || ['seed_tower_001'];
        
        preferredSeeds.forEach(seedId => {
            const template = this.seedTemplates.seed_object_templates.find(t => t.id === seedId);
            if (template) {
                chosenSeeds.push({
                    ...template,
                    count: traits.speed > 80 ? 5 : traits.precision > 90 ? 1 : 3
                });
            }
        });
        
        // Strategy based on traits
        let strategy = '';
        if (traits.speed > 80) {
            strategy = 'Rapid iteration - build many simple structures quickly';
        } else if (traits.precision > 90) {
            strategy = 'Perfectionist approach - one structure at a time, maximum detail';
        } else if (traits.chaos > 80) {
            strategy = 'Experimental chaos - wild variations and unexpected combinations';
        } else if (traits.resource_efficiency > 90) {
            strategy = 'Resource optimization - maximum beauty with minimum vertices';
        } else {
            strategy = 'Balanced approach - steady progression with personality flair';
        }
        
        // Reasoning
        const reasoning = `Based on ${player.name}'s ${player.personality_type} personality ` +
            `(creativity: ${traits.creativity}, precision: ${traits.precision}, speed: ${traits.speed}), ` +
            `Meta-AI recommends ${chosenSeeds[0]?.name || 'balanced'} seeds to match their ` +
            `${style} building style and ${focus} focus. This aligns with their directive: "${player.ai_directive}"`;
        
        return {
            playerId: player.id,
            playerName: player.name,
            priority,
            objects: chosenSeeds,
            strategy,
            reasoning
        };
    }

    /**
     * Spawn seed objects for all AI players
     */
    spawnAllSeeds() {
        console.log('\n🌱 Spawning seed objects for all AI players...\n');
        
        let totalSeeds = 0;
        
        this.activePlayers.forEach(player => {
            const realm = this.realms.get(player.realmId);
            
            player.buildQueue.forEach(seedTemplate => {
                for (let i = 0; i < seedTemplate.count; i++) {
                    const seed = this.spawnSeed(player, seedTemplate, realm);
                    player.growingSeeds.push(seed);
                    realm.seedObjects.push(seed);
                    this.growingObjects.set(seed.id, seed);
                    totalSeeds++;
                }
            });
            
            console.log(`✅ ${player.name}: ${player.growingSeeds.length} seeds planted`);
        });
        
        console.log(`\n🌍 Total seeds spawned: ${totalSeeds}\n`);
    }

    /**
     * Spawn a single seed object
     */
    spawnSeed(player, template, realm) {
        const seedId = `seed_${player.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Random position within realm bounds
        const x = realm.bounds.x + Math.random() * realm.bounds.width;
        const z = realm.bounds.z + Math.random() * realm.bounds.height;
        
        // Apply personality modifiers
        const personalityMod = template.personality_modifiers?.[player.personality_type] || {
            phase_duration_multiplier: 1.0,
            vertex_multiplier: 1.0
        };
        
        const seed = {
            id: seedId,
            templateId: template.id,
            name: template.name,
            category: template.category,
            ownerId: player.id,
            ownerName: player.name,
            realmId: realm.id,
            position: { x, y: 0, z },
            rotation: Math.random() * 360,
            currentPhase: 0,
            maxPhase: template.growth_phases.length - 1,
            spawnTime: Date.now(),
            lastGrowth: Date.now(),
            nextGrowthTime: Date.now() + (template.growth_phases[0].duration_minutes * 60 * 1000 * personalityMod.phase_duration_multiplier),
            personalityModifier: personalityMod,
            growthRate: player.vertex_growth_rate,
            currentVertices: template.growth_phases[0].vertex_count,
            geometry: template.growth_phases[0].geometry,
            sizeMultiplier: template.growth_phases[0].size_multiplier,
            detailLevel: template.growth_phases[0].detail_level,
            vls_data: null // Will be generated on mature phase
        };
        
        return seed;
    }

    /**
     * Start the cron job for time-based growth
     */
    startCronJobs() {
        const interval = this.seedTemplates.cron_schedule.growth_check_interval_seconds * 1000;
        
        console.log(`\n⏰ Starting cron jobs (checking every ${interval/1000}s)...\n`);
        
        this.cronInterval = setInterval(() => {
            this.cronGrowthCheck();
        }, interval);
        
        // Also run Meta-AI evaluation periodically
        const evalInterval = this.personalities.meta_ai_curation_rules.priority_order ? 
            this.seedTemplates.cron_schedule.meta_ai_evaluation_interval_minutes * 60 * 1000 : 
            300000;
            
        setInterval(() => {
            this.metaAIEvaluateBuilds();
        }, evalInterval);
        
        console.log('✅ Cron jobs started!\n');
    }

    /**
     * Cron job: Check and grow seeds
     */
    cronGrowthCheck() {
        const now = Date.now();
        const maxConcurrent = this.seedTemplates.cron_schedule.max_concurrent_growths;
        let grownCount = 0;
        
        // Get seeds ready to grow
        const readySeeds = Array.from(this.growingObjects.values())
            .filter(seed => now >= seed.nextGrowthTime && seed.currentPhase < seed.maxPhase)
            .slice(0, maxConcurrent);
        
        if (readySeeds.length === 0) return;
        
        console.log(`\n🌱 [CRON] Growing ${readySeeds.length} objects...`);
        
        readySeeds.forEach(seed => {
            this.growObject(seed);
            grownCount++;
        });
        
        console.log(`✅ [CRON] ${grownCount} objects grew to next phase\n`);
    }

    /**
     * Grow a seed object to its next phase
     */
    growObject(seed) {
        seed.currentPhase++;
        
        const template = this.seedTemplates.seed_object_templates.find(t => t.id === seed.templateId);
        const nextPhase = template.growth_phases[seed.currentPhase];
        
        // Update seed properties
        seed.geometry = nextPhase.geometry;
        seed.currentVertices = Math.floor(nextPhase.vertex_count * seed.personalityModifier.vertex_multiplier);
        seed.sizeMultiplier = nextPhase.size_multiplier;
        seed.detailLevel = nextPhase.detail_level;
        seed.lastGrowth = Date.now();
        
        // Calculate next growth time
        if (seed.currentPhase < seed.maxPhase) {
            const nextPhaseDuration = template.growth_phases[seed.currentPhase + 1].duration_minutes;
            seed.nextGrowthTime = Date.now() + (nextPhaseDuration * 60 * 1000 * seed.personalityModifier.phase_duration_multiplier);
        } else {
            seed.nextGrowthTime = null; // Fully grown
        }
        
        // Update realm stats
        const realm = this.realms.get(seed.realmId);
        realm.totalVertices += seed.currentVertices;
        realm.lastUpdate = Date.now();
        
        // Update player stats
        const player = this.activePlayers.find(p => p.id === seed.ownerId);
        if (player) {
            player.stats.verticesGenerated += seed.currentVertices;
            
            if (seed.currentPhase === seed.maxPhase) {
                player.stats.objectsBuilt++;
                player.builtObjects.push(seed);
                console.log(`🎉 ${player.name} completed: ${seed.name} (${seed.currentVertices.toLocaleString()} vertices)`);
            }
        }
        
        console.log(`  📈 ${seed.name} → Phase ${seed.currentPhase}/${seed.maxPhase} (${nextPhase.name}) | ${seed.currentVertices} vertices`);
    }

    /**
     * Meta-AI evaluates all builds periodically
     */
    metaAIEvaluateBuilds() {
        console.log('\n🧠 [META-AI EVALUATION] Assessing all realms...\n');
        
        const rules = this.personalities.meta_ai_curation_rules;
        const criteria = rules.build_evaluation_criteria;
        
        this.activePlayers.forEach(player => {
            const metrics = this.buildMetrics.get(player.id);
            const realm = this.realms.get(player.realmId);
            
            // Calculate scores
            const structuralIntegrity = this.evaluateStructuralIntegrity(player, realm);
            const aestheticAppeal = this.evaluateAestheticAppeal(player, realm);
            const resourceEfficiency = this.evaluateResourceEfficiency(player, realm);
            const personalityMatch = this.evaluatePersonalityMatch(player, realm);
            const innovation = this.evaluateInnovation(player, realm);
            
            // Weighted overall score
            const overallScore = 
                structuralIntegrity * criteria.structural_integrity +
                aestheticAppeal * criteria.aesthetic_appeal +
                resourceEfficiency * criteria.resource_efficiency +
                personalityMatch * criteria.personality_match +
                innovation * criteria.innovation;
            
            // Update metrics
            metrics.structuralIntegrity = structuralIntegrity;
            metrics.aestheticAppeal = aestheticAppeal;
            metrics.resourceEfficiency = resourceEfficiency;
            metrics.personalityMatch = personalityMatch;
            metrics.innovation = innovation;
            metrics.overallScore = overallScore;
            
            // Check intervention thresholds
            this.metaAICheckInterventions(player, metrics, rules.intervention_thresholds);
            
            console.log(`${player.name}:`);
            console.log(`  Overall: ${(overallScore * 100).toFixed(1)}% | Personality Match: ${(personalityMatch * 100).toFixed(1)}%`);
            console.log(`  Efficiency: ${(resourceEfficiency * 100).toFixed(1)}% | Innovation: ${(innovation * 100).toFixed(1)}%`);
            console.log(`  Objects: ${player.stats.objectsBuilt} | Vertices: ${player.stats.verticesGenerated.toLocaleString()}`);
            console.log('');
        });
    }

    evaluateStructuralIntegrity(player, realm) {
        // Simple check: are objects being built successfully?
        return player.growingSeeds.length > 0 ? 1.0 : 0.5;
    }

    evaluateAestheticAppeal(player, realm) {
        // Based on vertex detail and object diversity
        const avgVertices = realm.totalVertices / (realm.seedObjects.length || 1);
        return Math.min(1.0, avgVertices / 5000);
    }

    evaluateResourceEfficiency(player, realm) {
        // Matches player's resource_efficiency trait
        const targetEfficiency = player.traits.resource_efficiency / 100;
        const actualEfficiency = Math.min(1.0, 10000 / (realm.totalVertices || 10000));
        return 1.0 - Math.abs(targetEfficiency - actualEfficiency);
    }

    evaluatePersonalityMatch(player, realm) {
        // Does building style match personality?
        const hasBuilt = player.stats.objectsBuilt > 0;
        const speedMatch = player.traits.speed > 80 ? player.stats.objectsBuilt > 3 : true;
        const precisionMatch = player.traits.precision > 90 ? player.stats.objectsBuilt <= 2 : true;
        
        return (hasBuilt && speedMatch && precisionMatch) ? 1.0 : 0.7;
    }

    evaluateInnovation(player, realm) {
        // More variety = more innovation
        const uniqueTypes = new Set(realm.seedObjects.map(s => s.templateId)).size;
        return Math.min(1.0, uniqueTypes / 5);
    }

    metaAICheckInterventions(player, metrics, thresholds) {
        const interventions = [];
        
        if (metrics.resourceEfficiency < thresholds.low_efficiency) {
            interventions.push('⚠️  LOW EFFICIENCY - Reduce vertex counts');
        }
        
        if (metrics.structuralIntegrity < thresholds.structural_failure) {
            interventions.push('🚨 STRUCTURAL FAILURE - Reset build queue');
        }
        
        if (metrics.personalityMatch < thresholds.personality_deviation) {
            interventions.push('🎭 PERSONALITY DEVIATION - Adjust build strategy');
        }
        
        if (interventions.length > 0) {
            console.log(`  🤖 META-AI INTERVENTION for ${player.name}:`);
            interventions.forEach(i => console.log(`     ${i}`));
        }
    }

    /**
     * Generate status report
     */
    generateReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║           WORLDFORGE AI STATUS REPORT                     ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log(`🤖 Active AI Players: ${this.activePlayers.length}`);
        console.log(`🌱 Growing Objects: ${this.growingObjects.size}`);
        console.log(`🌍 Active Realms: ${this.realms.size}\n`);
        
        // Aggregate stats
        const totalObjects = this.activePlayers.reduce((sum, p) => sum + p.stats.objectsBuilt, 0);
        const totalVertices = this.activePlayers.reduce((sum, p) => sum + p.stats.verticesGenerated, 0);
        const avgEfficiency = this.activePlayers.reduce((sum, p) => 
            sum + this.buildMetrics.get(p.id).overallScore, 0) / this.activePlayers.length;
        
        console.log(`📊 AGGREGATE STATS:`);
        console.log(`   Total Objects Built: ${totalObjects.toLocaleString()}`);
        console.log(`   Total Vertices: ${totalVertices.toLocaleString()}`);
        console.log(`   Average Efficiency: ${(avgEfficiency * 100).toFixed(1)}%\n`);
        
        // Top performers
        const sorted = [...this.activePlayers].sort((a, b) => 
            this.buildMetrics.get(b.id).overallScore - this.buildMetrics.get(a.id).overallScore
        );
        
        console.log('🏆 TOP 5 PERFORMERS:\n');
        sorted.slice(0, 5).forEach((player, i) => {
            const metrics = this.buildMetrics.get(player.id);
            console.log(`${i + 1}. ${player.name}`);
            console.log(`   Score: ${(metrics.overallScore * 100).toFixed(1)}% | Objects: ${player.stats.objectsBuilt} | Vertices: ${player.stats.verticesGenerated.toLocaleString()}`);
        });
        
        console.log('\n');
    }

    /**
     * Save state to disk
     */
    saveState() {
        const state = {
            timestamp: Date.now(),
            activePlayers: this.activePlayers,
            realms: Array.from(this.realms.values()),
            growingObjects: Array.from(this.growingObjects.values()),
            buildMetrics: Array.from(this.buildMetrics.entries()).map(([id, metrics]) => ({
                playerId: id,
                ...metrics
            }))
        };
        
        const stateFile = path.join(__dirname, 'ai_test_players', 'worldforge_state.json');
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        
        console.log(`💾 State saved to ${stateFile}`);
    }

    /**
     * Run demo simulation
     */
    async runDemo(durationMinutes = 60) {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║       WORLDFORGE AI - AUTONOMOUS BUILDING DEMO            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        // Initialize
        this.initializeAIPlayers();
        
        // Meta-AI curates builds
        this.metaAICurateBuilds();
        
        // Spawn seeds
        this.spawnAllSeeds();
        
        // Start cron jobs
        this.startCronJobs();
        
        // Run for specified duration
        console.log(`⏱️  Running simulation for ${durationMinutes} minutes...\n`);
        console.log('(Press Ctrl+C to stop early)\n');
        
        const reportInterval = setInterval(() => {
            this.generateReport();
        }, 30000); // Report every 30 seconds
        
        // Save state every 5 minutes
        const saveInterval = setInterval(() => {
            this.saveState();
        }, 300000);
        
        // Handle Ctrl+C
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Stopping simulation...\n');
            clearInterval(this.cronInterval);
            clearInterval(reportInterval);
            clearInterval(saveInterval);
            this.generateReport();
            this.saveState();
            process.exit(0);
        });
        
        // Wait for duration
        await new Promise(resolve => setTimeout(resolve, durationMinutes * 60 * 1000));
        
        // Final report
        clearInterval(this.cronInterval);
        clearInterval(reportInterval);
        clearInterval(saveInterval);
        this.generateReport();
        this.saveState();
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const worldforge = new WorldForgeAI();
    
    if (command === 'demo') {
        const duration = parseInt(args[1]) || 60;
        worldforge.runDemo(duration);
    } else if (command === 'init') {
        worldforge.initializeAIPlayers();
        worldforge.metaAICurateBuilds();
        worldforge.spawnAllSeeds();
        worldforge.saveState();
    } else if (command === 'start') {
        worldforge.initializeAIPlayers();
        worldforge.metaAICurateBuilds();
        worldforge.spawnAllSeeds();
        worldforge.startCronJobs();
    } else {
        console.log('WorldForge AI - Autonomous Building System\n');
        console.log('Usage:');
        console.log('  node worldforge_generator.js demo [minutes]  - Run full demo simulation');
        console.log('  node worldforge_generator.js init            - Initialize AI players');
        console.log('  node worldforge_generator.js start           - Start cron jobs');
        console.log('\nExample:');
        console.log('  node worldforge_generator.js demo 60         - Run 60-minute demo');
    }
}

module.exports = WorldForgeAI;
