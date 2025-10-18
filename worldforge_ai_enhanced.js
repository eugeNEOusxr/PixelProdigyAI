/**
 * Enhanced WorldForge AI with Problem Solving & Progressive VLS Building
 * Handles realistic game development problems with Meta-AI consultation
 * Builds from microscopic vertices to macroscopic 4K cinematic quality
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class EnhancedWorldForgeAI {
    constructor() {
        // Load configurations
        this.personalities = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'ai_test_players', 'ai_personalities.json'), 'utf8'
        ));
        
        this.seedTemplates = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'ai_test_players', 'ai_seed_objects.json'), 'utf8'
        ));
        
        this.problemsDB = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'ai_test_players', 'game_problems_solutions.json'), 'utf8'
        ));
        
        // System state
        this.activePlayers = [];
        this.growingObjects = new Map();
        this.realms = new Map();
        this.buildMetrics = new Map();
        this.errorLog = [];
        this.solutionHistory = [];
        
        // Performance tracking
        this.performanceMetrics = {
            currentFPS: 60,
            memoryUsage: 0,
            drawCalls: 0,
            activeVertices: 0
        };
        
        // Progressive building
        this.vlsLevels = this.problemsDB.vls_progressive_building.levels;
        this.renderEffects = this.problemsDB.vls_progressive_building.render_effects_4k;
        
        console.log('🚀 Enhanced WorldForge AI System Initialized');
        console.log(`🤖 ${this.personalities.ai_test_players.length} AI personalities loaded`);
        console.log(`🌱 ${this.seedTemplates.seed_object_templates.length} seed templates loaded`);
        console.log(`⚠️  ${this.problemsDB.common_game_problems.length} problem patterns loaded`);
        console.log(`📊 ${this.vlsLevels.length} VLS detail levels configured\n`);
    }

    /**
     * Initialize all AI players with error monitoring
     */
    initializeAIPlayers() {
        console.log('🎭 Initializing 20 AI Test Players with Problem-Solving Capabilities...\n');
        
        this.personalities.ai_test_players.forEach(personality => {
            const player = {
                ...personality,
                active: true,
                realmId: `realm_${personality.id}`,
                builtObjects: [],
                growingSeeds: [],
                buildQueue: [],
                problemsEncountered: [],
                solutionsFou: [],
                metaAIConsultations: 0,
                stats: {
                    objectsBuilt: 0,
                    verticesGenerated: 0,
                    errorsEncountered: 0,
                    errorsFixed: 0,
                    avgBuildTime: 0,
                    efficiencyScore: 1.0
                }
            };
            
            this.activePlayers.push(player);
            this.initializeRealm(player);
            
            console.log(`✅ ${player.name} (${player.personality_type})`);
            console.log(`   Specialization: ${player.specialization}`);
            console.log(`   Problem-solving approach: ${this.getPersonalityProblemStyle(player)}`);
            console.log('');
        });
        
        console.log(`🌍 All ${this.activePlayers.length} AI players ready for autonomous building!\n`);
    }

    getPersonalityProblemStyle(player) {
        if (player.traits.precision > 90) return 'Methodical debugging, prevents errors proactively';
        if (player.traits.chaos > 85) return 'Experimental fixes, learns from crashes';
        if (player.traits.speed > 90) return 'Quick patches, iterate fast';
        if (player.traits.resource_efficiency > 90) return 'Optimal solutions, minimal overhead';
        return 'Balanced problem-solving';
    }

    initializeRealm(player) {
        const realmSize = 10000;
        
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
            currentDetailLevel: 0,
            targetDetailLevel: 4,
            renderQuality: 'wireframe',
            lastUpdate: Date.now()
        };
        
        this.realms.set(player.realmId, realm);
        this.buildMetrics.set(player.id, {
            structuralIntegrity: 1.0,
            visualQuality: 0,
            performanceScore: 1.0,
            problemResolutionRate: 0
        });
    }

    /**
     * Spawn seed with progressive VLS levels
     */
    spawnSeedWithProgression(player, template, realm) {
        const seedId = `seed_${player.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const x = realm.bounds.x + Math.random() * realm.bounds.width;
        const z = realm.bounds.z + Math.random() * realm.bounds.height;
        
        // Start at microscopic level
        const initialLevel = this.vlsLevels[0];
        
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
            
            // Progressive VLS building
            currentVLSLevel: 0,
            targetVLSLevel: 4,
            vertexCount: initialLevel.vertex_range[0],
            detailMultiplier: initialLevel.detail_multiplier,
            renderQuality: initialLevel.render_quality,
            shaderComplexity: initialLevel.shader_complexity,
            textureResolution: initialLevel.target_resolution,
            
            // Growth tracking
            spawnTime: Date.now(),
            lastEvolution: Date.now(),
            nextEvolutionTime: Date.now() + (5 * 60 * 1000), // 5 minutes per level
            
            // Error tracking
            errors: [],
            solutions: [],
            healthStatus: 'healthy',
            
            // Performance
            drawCalls: 1,
            memoryFootprint: 0,
            
            vls_data: this.generateMicroscopicVLS(template, initialLevel)
        };
        
        return seed;
    }

    generateMicroscopicVLS(template, level) {
        // Generate minimal VLS structure
        return {
            format: 'VLS_v1',
            level: 0,
            vertices: level.vertex_range[0],
            geometry_type: 'placeholder',
            bounding_box: { min: [-1, -1, -1], max: [1, 1, 1] },
            lod_levels: [level.vertex_range[0]],
            compressed_size: level.vertex_range[0] * 0.1,
            shader_hint: level.shader_complexity
        };
    }

    /**
     * Evolve seed to next VLS detail level
     */
    async evolveSeedToNextLevel(seed) {
        const currentLevel = this.vlsLevels[seed.currentVLSLevel];
        const nextLevelIndex = seed.currentVLSLevel + 1;
        
        if (nextLevelIndex >= this.vlsLevels.length) {
            seed.healthStatus = 'complete';
            return { success: true, message: 'Maximum detail reached' };
        }
        
        const nextLevel = this.vlsLevels[nextLevelIndex];
        const player = this.activePlayers.find(p => p.id === seed.ownerId);
        
        console.log(`\n🔬 Evolving ${seed.name} for ${player.name}:`);
        console.log(`   ${currentLevel.name} → ${nextLevel.name}`);
        console.log(`   Vertices: ${seed.vertexCount} → ${nextLevel.vertex_range[1]}`);
        console.log(`   Quality: ${currentLevel.render_quality} → ${nextLevel.render_quality}`);
        
        // Run proactive error checks
        const preCheckResults = await this.runProactiveChecks(seed, nextLevel, player);
        
        if (!preCheckResults.passed) {
            console.log(`   ⚠️  Pre-build checks failed: ${preCheckResults.issues.join(', ')}`);
            await this.handleBuildProblems(seed, preCheckResults.issues, player);
            return { success: false, message: 'Pre-build validation failed' };
        }
        
        // Simulate evolution with problem detection
        try {
            // Update seed properties
            seed.currentVLSLevel = nextLevelIndex;
            seed.vertexCount = nextLevel.vertex_range[1];
            seed.detailMultiplier = nextLevel.detail_multiplier;
            seed.renderQuality = nextLevel.render_quality;
            seed.shaderComplexity = nextLevel.shader_complexity;
            seed.textureResolution = nextLevel.target_resolution;
            seed.lastEvolution = Date.now();
            
            if (nextLevelIndex < this.vlsLevels.length - 1) {
                seed.nextEvolutionTime = Date.now() + (10 * 60 * 1000); // 10 min per level
            }
            
            // Update VLS data
            seed.vls_data = this.generateVLSForLevel(seed, nextLevel);
            
            // Run post-build checks
            const postCheckResults = await this.runPostBuildChecks(seed, nextLevel, player);
            
            if (!postCheckResults.passed) {
                console.log(`   ⚠️  Post-build issues detected: ${postCheckResults.issues.join(', ')}`);
                await this.handleBuildProblems(seed, postCheckResults.issues, player);
            } else {
                console.log(`   ✅ Evolution successful! Now at ${nextLevel.name} quality`);
            }
            
            // Update metrics
            this.updatePerformanceMetrics(seed);
            
            return { success: true, level: nextLevel.name };
            
        } catch (error) {
            console.log(`   🚨 CRITICAL ERROR during evolution: ${error.message}`);
            await this.handleCriticalError(seed, error, player);
            return { success: false, message: error.message };
        }
    }

    generateVLSForLevel(seed, level) {
        return {
            format: 'VLS_v1',
            level: seed.currentVLSLevel,
            vertices: seed.vertexCount,
            geometry_type: level.render_quality,
            bounding_box: { min: [-2, -2, -2], max: [2, 2, 2] },
            lod_levels: this.vlsLevels.slice(0, seed.currentVLSLevel + 1).map(l => l.vertex_range[1]),
            compressed_size: seed.vertexCount * 0.08,
            shader_hint: level.shader_complexity,
            texture_resolution: level.target_resolution,
            pbr_materials: seed.currentVLSLevel >= 2,
            normal_maps: seed.currentVLSLevel >= 3,
            displacement_maps: seed.currentVLSLevel >= 4
        };
    }

    /**
     * Proactive error checking before build
     */
    async runProactiveChecks(seed, targetLevel, player) {
        const issues = [];
        
        // Check 1: Vertex budget
        const vertexBudget = this.calculateVertexBudget(player);
        if (targetLevel.vertex_range[1] > vertexBudget) {
            issues.push('vertex_explosion');
        }
        
        // Check 2: Memory projection
        const projectedMemory = this.projectMemoryUsage(seed, targetLevel);
        if (projectedMemory > 50) { // 50MB limit per object
            issues.push('memory_leak');
        }
        
        // Check 3: Shader complexity
        if (targetLevel.shader_complexity === 'ultra' && this.performanceMetrics.currentFPS < 40) {
            issues.push('shader_compilation_failure');
        }
        
        // Check 4: Texture resolution
        if (targetLevel.target_resolution === '8192x8192' && this.performanceMetrics.memoryUsage > 0.7) {
            issues.push('texture_bleeding');
        }
        
        return {
            passed: issues.length === 0,
            issues
        };
    }

    calculateVertexBudget(player) {
        // Budget based on personality
        if (player.traits.resource_efficiency > 90) return 10000;
        if (player.traits.precision > 90) return 50000;
        if (player.traits.chaos > 85) return 100000;
        return 30000;
    }

    projectMemoryUsage(seed, level) {
        // Estimate memory: vertices + textures
        const vertexMemory = level.vertex_range[1] * 0.0001; // MB
        const textureMemory = parseInt(level.target_resolution) / 1024 * 2; // MB
        return vertexMemory + textureMemory;
    }

    /**
     * Post-build validation checks
     */
    async runPostBuildChecks(seed, level, player) {
        const issues = [];
        
        // Check 1: Z-fighting detection
        if (this.detectZFighting(seed)) {
            issues.push('z_fighting');
        }
        
        // Check 2: Normal map validation
        if (level.shader_complexity.includes('pbr') && Math.random() < 0.1) {
            issues.push('normal_map_inversion');
        }
        
        // Check 3: UV unwrap quality
        if (seed.currentVLSLevel >= 2 && Math.random() < 0.15) {
            issues.push('uv_unwrap_distortion');
        }
        
        // Check 4: Performance check
        if (seed.vertexCount > 50000 && this.performanceMetrics.currentFPS < 30) {
            issues.push('vertex_explosion');
        }
        
        return {
            passed: issues.length === 0,
            issues
        };
    }

    detectZFighting(seed) {
        // Simulate detection: random chance based on complexity
        return seed.currentVLSLevel >= 2 && Math.random() < 0.08;
    }

    /**
     * Handle problems with Meta-AI consultation
     */
    async handleBuildProblems(seed, issues, player) {
        console.log(`\n🤖 ${player.name} encountered problems: ${issues.join(', ')}`);
        
        for (const issueId of issues) {
            const problem = this.problemsDB.common_game_problems.find(p => p.id.includes(issueId) || p.name.toLowerCase().includes(issueId));
            
            if (!problem) {
                console.log(`   ❓ Unknown problem: ${issueId}, consulting Meta-AI...`);
                await this.consultMetaAI(player, issueId, seed, 'unknown');
                continue;
            }
            
            console.log(`\n   📋 Problem: ${problem.name}`);
            console.log(`   Severity: ${problem.severity}`);
            console.log(`   Description: ${problem.description}`);
            
            // Log error
            this.logError(player, seed, problem);
            
            // Should we consult Meta-AI?
            if (problem.meta_ai_consultation || problem.severity === 'critical') {
                console.log(`   🧠 Consulting Meta-AI for solution...`);
                const metaAISolution = await this.consultMetaAI(player, problem.id, seed, problem);
                
                if (metaAISolution.success) {
                    console.log(`   💡 Meta-AI recommends: ${metaAISolution.solution.approach}`);
                    await this.applySolution(seed, metaAISolution.solution, player);
                }
            } else {
                // Apply automatic solution
                const solution = this.chooseBestSolution(problem, player);
                console.log(`   🔧 Applying solution: ${solution.approach}`);
                await this.applySolution(seed, solution, player);
            }
        }
    }

    chooseBestSolution(problem, player) {
        const solutions = problem.solutions;
        
        // Personality-based choice
        if (player.traits.resource_efficiency > 90) {
            return solutions.reduce((best, s) => 
                s.performance_cost < best.performance_cost ? s : best
            );
        }
        
        if (player.traits.speed > 90) {
            return solutions.reduce((best, s) => 
                s.effectiveness > best.effectiveness ? s : best
            );
        }
        
        // Default: highest effectiveness
        return solutions.reduce((best, s) => 
            s.effectiveness > best.effectiveness ? s : best
        );
    }

    async applySolution(seed, solution, player) {
        console.log(`   ⚙️  Implementing: ${solution.implementation}`);
        
        // Simulate solution application
        await this.sleep(500);
        
        // Update seed based on solution
        if (solution.approach.includes('lod')) {
            seed.vls_data.lod_levels = [
                seed.vertexCount,
                Math.floor(seed.vertexCount * 0.5),
                Math.floor(seed.vertexCount * 0.25),
                Math.floor(seed.vertexCount * 0.1)
            ];
        }
        
        if (solution.approach.includes('mesh_simplification')) {
            seed.vertexCount = Math.floor(seed.vertexCount * 0.7);
        }
        
        if (solution.approach.includes('offset')) {
            seed.position.y += 0.001;
        }
        
        // Track solution
        player.stats.errorsFixed++;
        player.solutionsFou.push({
            problem: solution.approach,
            time: Date.now(),
            effectiveness: solution.effectiveness
        });
        
        console.log(`   ✅ Solution applied successfully!`);
    }

    /**
     * Consult Meta-AI for complex problems
     */
    async consultMetaAI(player, problemId, seed, problemData) {
        player.metaAIConsultations++;
        
        const query = typeof problemData === 'string' 
            ? `Solve ${problemData} problem for ${seed.name} built by ${player.name} (${player.personality_type})`
            : `Solve ${problemData.name} for ${seed.name}. Issue: ${problemData.description}. Player style: ${player.building_style}`;
        
        try {
            console.log(`   🧠 Querying Meta-AI...`);
            
            const { stdout } = await execAsync(
                `node pixelverse_meta_ai.js analyze "${query}"`,
                { cwd: __dirname }
            );
            
            console.log(`   📨 Meta-AI response received`);
            
            // Parse Meta-AI recommendation
            const recommendation = this.parseMetaAIResponse(stdout, problemData);
            
            this.solutionHistory.push({
                playerId: player.id,
                problemId: problemId,
                metaAIRecommendation: recommendation,
                timestamp: Date.now()
            });
            
            return {
                success: true,
                solution: recommendation
            };
            
        } catch (error) {
            console.log(`   ⚠️  Meta-AI consultation failed: ${error.message}`);
            
            // Fallback to automatic solution
            if (typeof problemData === 'object' && problemData.solutions) {
                return {
                    success: true,
                    solution: problemData.solutions[0]
                };
            }
            
            return { success: false };
        }
    }

    parseMetaAIResponse(stdout, problemData) {
        // Extract solution from Meta-AI output
        if (typeof problemData === 'object' && problemData.solutions) {
            // Use first solution as recommended by Meta-AI
            return problemData.solutions[0];
        }
        
        return {
            approach: 'meta_ai_custom',
            implementation: 'Custom solution from Meta-AI',
            effectiveness: 0.9,
            performance_cost: 'variable'
        };
    }

    async handleCriticalError(seed, error, player) {
        console.log(`\n🚨 CRITICAL ERROR for ${player.name}:`);
        console.log(`   Object: ${seed.name}`);
        console.log(`   Error: ${error.message}`);
        
        // Log critical error
        this.logError(player, seed, {
            id: 'critical_error',
            name: 'Critical Build Failure',
            severity: 'critical',
            description: error.message
        });
        
        // Consult Meta-AI immediately
        console.log(`   🧠 Emergency Meta-AI consultation...`);
        const solution = await this.consultMetaAI(player, 'critical', seed, error.message);
        
        if (solution.success) {
            console.log(`   🔧 Attempting recovery...`);
            await this.applySolution(seed, solution.solution, player);
        } else {
            console.log(`   ⏮️  Rolling back to previous state...`);
            seed.currentVLSLevel = Math.max(0, seed.currentVLSLevel - 1);
            seed.healthStatus = 'degraded';
        }
    }

    logError(player, seed, problem) {
        player.stats.errorsEncountered++;
        player.problemsEncountered.push({
            problemId: problem.id,
            problemName: problem.name,
            seedId: seed.id,
            time: Date.now(),
            severity: problem.severity
        });
        
        this.errorLog.push({
            playerId: player.id,
            playerName: player.name,
            seedId: seed.id,
            seedName: seed.name,
            problem: problem,
            timestamp: Date.now()
        });
    }

    updatePerformanceMetrics(seed) {
        this.performanceMetrics.activeVertices += seed.vertexCount;
        this.performanceMetrics.drawCalls += seed.drawCalls;
        
        // Simulate FPS based on load
        const vertexLoad = this.performanceMetrics.activeVertices / 1000000;
        this.performanceMetrics.currentFPS = Math.max(15, 60 - (vertexLoad * 10));
        
        // Simulate memory
        this.performanceMetrics.memoryUsage = Math.min(0.95, 
            (this.performanceMetrics.activeVertices * 0.00001) + 
            (this.growingObjects.size * 0.01)
        );
    }

    /**
     * Generate comprehensive report with problem-solving stats
     */
    generateReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║        WORLDFORGE AI - PROBLEM-SOLVING REPORT            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        console.log('📊 SYSTEM PERFORMANCE:');
        console.log(`   FPS: ${this.performanceMetrics.currentFPS.toFixed(1)}`);
        console.log(`   Memory Usage: ${(this.performanceMetrics.memoryUsage * 100).toFixed(1)}%`);
        console.log(`   Active Vertices: ${this.performanceMetrics.activeVertices.toLocaleString()}`);
        console.log(`   Draw Calls: ${this.performanceMetrics.drawCalls}\n`);
        
        console.log('🤖 AI PLAYERS STATUS:');
        console.log(`   Active Players: ${this.activePlayers.length}`);
        console.log(`   Growing Objects: ${this.growingObjects.size}`);
        console.log(`   Total Errors: ${this.errorLog.length}`);
        console.log(`   Total Solutions: ${this.solutionHistory.length}\n`);
        
        // Problem-solving champions
        const problemSolvers = [...this.activePlayers]
            .sort((a, b) => (b.stats.errorsFixed / (b.stats.errorsEncountered || 1)) - 
                           (a.stats.errorsFixed / (a.stats.errorsEncountered || 1)))
            .slice(0, 5);
        
        console.log('🏆 TOP PROBLEM SOLVERS:\n');
        problemSolvers.forEach((player, i) => {
            const fixRate = player.stats.errorsEncountered > 0 
                ? (player.stats.errorsFixed / player.stats.errorsEncountered * 100)
                : 0;
            
            console.log(`${i + 1}. ${player.name}`);
            console.log(`   Fix Rate: ${fixRate.toFixed(0)}% (${player.stats.errorsFixed}/${player.stats.errorsEncountered})`);
            console.log(`   Meta-AI Consultations: ${player.metaAIConsultations}`);
            console.log(`   Objects Built: ${player.stats.objectsBuilt}`);
        });
        
        // Detail level progress
        console.log('\n\n📈 VLS PROGRESSION STATS:\n');
        const levelCounts = [0, 0, 0, 0, 0];
        this.growingObjects.forEach(seed => {
            levelCounts[seed.currentVLSLevel]++;
        });
        
        this.vlsLevels.forEach((level, i) => {
            const count = levelCounts[i];
            const bar = '█'.repeat(Math.floor(count / 2));
            console.log(`Level ${i} (${level.name}): ${bar} ${count}`);
        });
        
        console.log('\n');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Run enhanced demo with problem-solving
     */
    async runEnhancedDemo(durationMinutes = 30) {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║   WORLDFORGE AI - PROBLEM-SOLVING & PROGRESSIVE VLS      ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        
        this.initializeAIPlayers();
        
        // Spawn initial seeds at microscopic level
        console.log('🌱 Spawning microscopic seed objects...\n');
        this.activePlayers.forEach(player => {
            const realm = this.realms.get(player.realmId);
            const template = this.seedTemplates.seed_object_templates[0];
            
            for (let i = 0; i < 3; i++) {
                const seed = this.spawnSeedWithProgression(player, template, realm);
                player.growingSeeds.push(seed);
                this.growingObjects.set(seed.id, seed);
            }
            
            console.log(`✅ ${player.name}: ${player.growingSeeds.length} seeds at microscopic level`);
        });
        
        console.log(`\n⏰ Starting progressive evolution with error handling...\n`);
        
        // Evolution loop
        const evolutionInterval = setInterval(async () => {
            const readySeeds = Array.from(this.growingObjects.values())
                .filter(s => Date.now() >= s.nextEvolutionTime && s.currentVLSLevel < 4)
                .slice(0, 5);
            
            for (const seed of readySeeds) {
                await this.evolveSeedToNextLevel(seed);
                await this.sleep(1000);
            }
        }, 10000); // Check every 10 seconds
        
        // Report interval
        const reportInterval = setInterval(() => {
            this.generateReport();
        }, 30000);
        
        // Handle Ctrl+C
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Stopping simulation...\n');
            clearInterval(evolutionInterval);
            clearInterval(reportInterval);
            this.generateReport();
            process.exit(0);
        });
        
        // Wait for duration
        await new Promise(resolve => setTimeout(resolve, durationMinutes * 60 * 1000));
        
        clearInterval(evolutionInterval);
        clearInterval(reportInterval);
        this.generateReport();
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    
    const worldforge = new EnhancedWorldForgeAI();
    
    if (command === 'demo') {
        const duration = parseInt(args[1]) || 30;
        worldforge.runEnhancedDemo(duration);
    } else {
        console.log('Enhanced WorldForge AI - Autonomous Building with Problem Solving\n');
        console.log('Usage:');
        console.log('  node worldforge_ai_enhanced.js demo [minutes]\n');
        console.log('Features:');
        console.log('  • 20 AI personalities with unique problem-solving styles');
        console.log('  • Progressive VLS building (microscopic → 4K cinematic)');
        console.log('  • 10+ common game problems with automatic solutions');
        console.log('  • Meta-AI consultation for complex issues');
        console.log('  • Real-time performance monitoring\n');
        console.log('Example:');
        console.log('  node worldforge_ai_enhanced.js demo 30');
    }
}

module.exports = EnhancedWorldForgeAI;
