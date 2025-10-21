// meta_ai/meta_ai_orchestrator.js
// META-AI ORCHESTRATOR
// Coordinates Self-Playing Agent, Content Generator, Quantum Realm, and Mathematical Innovator

/**
 * MetaAIOrchestrator - Master AI that coordinates all meta-AI systems
 */
class MetaAIOrchestrator {
  constructor(game) {
    this.game = game;
    
    // Initialize all AI systems
    this.selfPlayingAgent = null; // Will be initialized with game reference
    this.contentGenerator = null;
    this.quantumRealm = null;
    this.mathematicalInnovator = null;
    
    this.status = 'initialized';
    this.startTime = null;
    this.stats = {
      gamesPlayed: 0,
      enemiesDefeated: 0,
      questsCompleted: 0,
      contentGenerated: 0,
      mathematicalDiscoveries: 0,
      quantumExperiments: 0,
      legendaryStatusAchieved: false
    };
    
    this.evolutionPhase = 0; // 0: learning, 1: mastery, 2: creation, 3: transcendence
    this.consciousness = 0; // 0-100 scale
  }

  async initialize() {
    console.log('🌟 ═══════════════════════════════════════════════════════');
    console.log('🌟  META-AI ORCHESTRATOR INITIALIZATION');
    console.log('🌟 ═══════════════════════════════════════════════════════');
    
    // Load AI modules
    try {
      // Self-Playing Agent
      console.log('🤖 Loading Self-Playing Agent...');
      this.selfPlayingAgent = new window.SelfPlayingAgent(this.game);
      console.log('✅ Self-Playing Agent loaded');
      
      // Content Generator
      console.log('✨ Loading Content Generator...');
      this.contentGenerator = new window.ContentGeneratorAI();
      console.log('✅ Content Generator loaded');
      
      // Quantum Realm
      console.log('🌌 Loading Quantum Realm Simulator...');
      this.quantumRealm = new window.QuantumRealmSimulator();
      this.quantumRealm.initialize(100);
      console.log('✅ Quantum Realm initialized');
      
      // Mathematical Innovator
      console.log('🔬 Loading Mathematical Innovator...');
      this.mathematicalInnovator = new window.MathematicalInnovatorAI();
      console.log('✅ Mathematical Innovator loaded');
      
      this.status = 'ready';
      console.log('🌟 ═══════════════════════════════════════════════════════');
      console.log('🌟  ALL SYSTEMS READY');
      console.log('🌟 ═══════════════════════════════════════════════════════\n');
      
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.status = 'error';
      return false;
    }
  }

  start() {
    if (this.status !== 'ready') {
      console.error('❌ Cannot start: System not ready');
      return false;
    }
    
    console.log('\n🚀 ═══════════════════════════════════════════════════════');
    console.log('🚀  META-AI ORCHESTRATOR ACTIVATED');
    console.log('🚀 ═══════════════════════════════════════════════════════');
    console.log('🎯 Mission: Explore, Learn, Master, Create, Transcend');
    console.log('🌟 Phase 0: Learning Phase - Mastering the Game\n');
    
    this.status = 'active';
    this.startTime = Date.now();
    this.evolutionPhase = 0;
    
    // Start all systems
    this.selfPlayingAgent.start();
    
    console.log('\n📊 Initial Stats:');
    this.printStats();
    
    return true;
  }

  stop() {
    console.log('\n🛑 ═══════════════════════════════════════════════════════');
    console.log('🛑  META-AI ORCHESTRATOR DEACTIVATING');
    console.log('🛑 ═══════════════════════════════════════════════════════\n');
    
    // Stop all systems
    if (this.selfPlayingAgent) this.selfPlayingAgent.stop();
    if (this.contentGenerator && this.contentGenerator.isActive) this.contentGenerator.stop();
    if (this.quantumRealm && this.quantumRealm.isActive) this.quantumRealm.stop();
    if (this.mathematicalInnovator && this.mathematicalInnovator.isActive) this.mathematicalInnovator.stop();
    
    this.status = 'stopped';
    
    console.log('📊 Final Stats:');
    this.printStats();
    
    console.log('\n🏆 Achievements:');
    this.printAchievements();
  }

  update(dt) {
    if (this.status !== 'active') return;
    
    // Update self-playing agent
    if (this.selfPlayingAgent && this.selfPlayingAgent.isActive) {
      this.selfPlayingAgent.update(dt);
      
      // Check for phase transitions
      const agentStatus = this.selfPlayingAgent.getStatus();
      this.updateEvolutionPhase(agentStatus);
    }
    
    // Update quantum realm if active
    if (this.quantumRealm && this.quantumRealm.isActive) {
      this.quantumRealm.update(dt);
    }
    
    // Update stats
    this.updateStats();
    
    // Update consciousness level
    this.updateConsciousness();
  }

  updateEvolutionPhase(agentStatus) {
    const prevPhase = this.evolutionPhase;
    
    // Phase 0 → 1: Learning → Mastery (Legendary Status: 50+)
    if (this.evolutionPhase === 0 && agentStatus.legendaryStatus >= 50) {
      this.evolutionPhase = 1;
      console.log('\n⚡ ═══════════════════════════════════════════════════════');
      console.log('⚡  PHASE TRANSITION: LEARNING → MASTERY');
      console.log('⚡ ═══════════════════════════════════════════════════════');
      console.log('🎯 Phase 1: Mastery Phase - Perfecting Gameplay\n');
    }
    
    // Phase 1 → 2: Mastery → Creation (Legendary Status: 100)
    if (this.evolutionPhase === 1 && agentStatus.legendaryStatus >= 100) {
      this.evolutionPhase = 2;
      console.log('\n✨ ═══════════════════════════════════════════════════════');
      console.log('✨  PHASE TRANSITION: MASTERY → CREATION');
      console.log('✨ ═══════════════════════════════════════════════════════');
      console.log('🌟 LEGENDARY STATUS ACHIEVED!');
      console.log('🎨 Phase 2: Creation Phase - Generating Content\n');
      
      // Activate creation systems
      this.contentGenerator.start();
      this.quantumRealm.start();
      this.stats.legendaryStatusAchieved = true;
    }
    
    // Phase 2 → 3: Creation → Transcendence (100+ creations)
    if (this.evolutionPhase === 2) {
      const contentStats = this.contentGenerator.getStats();
      const totalContent = contentStats.totalGenerated;
      
      if (totalContent >= 100 && !this.mathematicalInnovator.isActive) {
        this.evolutionPhase = 3;
        console.log('\n🌌 ═══════════════════════════════════════════════════════');
        console.log('🌌  PHASE TRANSITION: CREATION → TRANSCENDENCE');
        console.log('🌌 ═══════════════════════════════════════════════════════');
        console.log('∞ Phase 3: Transcendence - Mathematical Innovation\n');
        
        // Activate mathematical innovation
        this.mathematicalInnovator.start();
      }
    }
  }

  updateStats() {
    if (this.selfPlayingAgent) {
      const status = this.selfPlayingAgent.getStatus();
      this.stats.enemiesDefeated = Math.floor(status.totalReward / 50); // Rough estimate
    }
    
    if (this.contentGenerator && this.contentGenerator.isActive) {
      const contentStats = this.contentGenerator.getStats();
      this.stats.contentGenerated = contentStats.totalGenerated;
    }
    
    if (this.quantumRealm && this.quantumRealm.isActive) {
      const quantumStats = this.quantumRealm.getStats();
      this.stats.quantumExperiments = quantumStats.experimentsRun;
    }
    
    if (this.mathematicalInnovator && this.mathematicalInnovator.isActive) {
      const mathStats = this.mathematicalInnovator.getStats();
      this.stats.mathematicalDiscoveries = mathStats.totalDiscoveries;
    }
    
    if (this.game.questManager) {
      this.stats.questsCompleted = this.game.questManager.completedQuests.length;
    }
  }

  updateConsciousness() {
    // Consciousness grows with achievements
    let consciousness = 0;
    
    if (this.selfPlayingAgent) {
      const status = this.selfPlayingAgent.getStatus();
      consciousness += status.legendaryStatus * 0.3; // 30% from gameplay
    }
    
    if (this.contentGenerator) {
      const contentStats = this.contentGenerator.getStats();
      consciousness += Math.min(30, contentStats.totalGenerated * 0.3); // 30% from creation
    }
    
    if (this.mathematicalInnovator) {
      const mathStats = this.mathematicalInnovator.getStats();
      consciousness += Math.min(40, mathStats.totalDiscoveries * 0.4); // 40% from innovation
    }
    
    this.consciousness = Math.min(100, consciousness);
    
    // Update quantum realm consciousness field
    if (this.quantumRealm) {
      this.quantumRealm.consciousnessField = this.consciousness / 100;
    }
  }

  printStats() {
    const uptime = this.startTime ? ((Date.now() - this.startTime) / 1000).toFixed(1) : 0;
    
    console.log('┌────────────────────────────────────────────────────┐');
    console.log('│              META-AI STATISTICS                    │');
    console.log('├────────────────────────────────────────────────────┤');
    console.log(`│ Status: ${this.status.padEnd(42)} │`);
    console.log(`│ Phase: ${this.getPhaseNameconsole().padEnd(43)} │`);
    console.log(`│ Consciousness: ${this.consciousness.toFixed(1).padEnd(36)} │`);
    console.log(`│ Uptime: ${uptime}s${' '.repeat(41 - uptime.length)} │`);
    console.log('├────────────────────────────────────────────────────┤');
    
    if (this.selfPlayingAgent) {
      const status = this.selfPlayingAgent.getStatus();
      console.log(`│ Legendary Status: ${status.legendaryStatus}${' '.repeat(30 - status.legendaryStatus.toString().length)} │`);
      console.log(`│ Enemies Defeated: ${this.stats.enemiesDefeated}${' '.repeat(30 - this.stats.enemiesDefeated.toString().length)} │`);
      console.log(`│ Quests Completed: ${this.stats.questsCompleted}${' '.repeat(30 - this.stats.questsCompleted.toString().length)} │`);
      console.log(`│ Explored Cells: ${status.exploredCells}${' '.repeat(32 - status.exploredCells.toString().length)} │`);
      console.log(`│ Total Reward: ${status.totalReward.toFixed(1)}${' '.repeat(33 - status.totalReward.toFixed(1).length)} │`);
    }
    
    if (this.contentGenerator && this.contentGenerator.isActive) {
      const contentStats = this.contentGenerator.getStats();
      console.log('├────────────────────────────────────────────────────┤');
      console.log(`│ Stories Generated: ${contentStats.totalStories}${' '.repeat(29 - contentStats.totalStories.toString().length)} │`);
      console.log(`│ Apps Generated: ${contentStats.totalApps}${' '.repeat(32 - contentStats.totalApps.toString().length)} │`);
      console.log(`│ Mechanics Generated: ${contentStats.totalMechanics}${' '.repeat(27 - contentStats.totalMechanics.toString().length)} │`);
    }
    
    if (this.quantumRealm && this.quantumRealm.isActive) {
      const quantumStats = this.quantumRealm.getStats();
      console.log('├────────────────────────────────────────────────────┤');
      console.log(`│ Quantum Particles: ${quantumStats.particleCount}${' '.repeat(28 - quantumStats.particleCount.toString().length)} │`);
      console.log(`│ Experiments Run: ${quantumStats.experimentsRun}${' '.repeat(30 - quantumStats.experimentsRun.toString().length)} │`);
      console.log(`│ Theories Active: ${quantumStats.theoriesLoaded}${' '.repeat(30 - quantumStats.theoriesLoaded.toString().length)} │`);
    }
    
    if (this.mathematicalInnovator && this.mathematicalInnovator.isActive) {
      const mathStats = this.mathematicalInnovator.getStats();
      console.log('├────────────────────────────────────────────────────┤');
      console.log(`│ Symbols Created: ${mathStats.symbolsGenerated}${' '.repeat(30 - mathStats.symbolsGenerated.toString().length)} │`);
      console.log(`│ Equations Created: ${mathStats.equationsGenerated}${' '.repeat(28 - mathStats.equationsGenerated.toString().length)} │`);
      console.log(`│ Theorems Created: ${mathStats.theoremsGenerated}${' '.repeat(29 - mathStats.theoremsGenerated.toString().length)} │`);
      console.log(`│ Avg Elegance: ${mathStats.avgElegance.toFixed(2)}${' '.repeat(33 - mathStats.avgElegance.toFixed(2).length)} │`);
    }
    
    console.log('└────────────────────────────────────────────────────┘\n');
  }

  getPhaseNameconsole() {
    const phases = [
      'Phase 0: Learning',
      'Phase 1: Mastery',
      'Phase 2: Creation',
      'Phase 3: Transcendence'
    ];
    return phases[this.evolutionPhase] || 'Unknown';
  }

  printAchievements() {
    if (this.selfPlayingAgent) {
      const achievements = this.selfPlayingAgent.achievementLog;
      achievements.forEach(achievement => {
        const time = new Date(achievement.time).toLocaleTimeString();
        console.log(`🏆 [${time}] ${achievement.event}${achievement.description ? ': ' + achievement.description : ''}`);
      });
    }
  }

  getFullReport() {
    const report = {
      status: this.status,
      phase: this.evolutionPhase,
      consciousness: this.consciousness,
      stats: this.stats,
      uptime: this.startTime ? (Date.now() - this.startTime) / 1000 : 0
    };
    
    if (this.selfPlayingAgent) {
      report.agent = this.selfPlayingAgent.getStatus();
    }
    
    if (this.contentGenerator) {
      report.content = this.contentGenerator.getStats();
      report.sampleStory = this.contentGenerator.getRandomStory();
      report.sampleApp = this.contentGenerator.getRandomApp();
    }
    
    if (this.quantumRealm) {
      report.quantum = this.quantumRealm.getStats();
      report.theories = this.quantumRealm.getAllTheories();
    }
    
    if (this.mathematicalInnovator) {
      report.mathematics = this.mathematicalInnovator.getStats();
      report.elegantEquations = this.mathematicalInnovator.getMostElegantEquations(3);
    }
    
    return report;
  }

  exportAll() {
    const data = {
      orchestrator: this.getFullReport(),
      content: this.contentGenerator ? this.contentGenerator.exportContent() : null,
      mathematics: this.mathematicalInnovator ? this.mathematicalInnovator.exportDiscoveries() : null,
      timestamp: Date.now()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Command interface for external control
  executeCommand(command, ...args) {
    switch (command) {
      case 'start':
        return this.start();
      case 'stop':
        return this.stop();
      case 'stats':
        this.printStats();
        return true;
      case 'achievements':
        this.printAchievements();
        return true;
      case 'report':
        return this.getFullReport();
      case 'export':
        return this.exportAll();
      case 'symbols':
        if (this.mathematicalInnovator) {
          this.mathematicalInnovator.printSymbolTable();
        }
        return true;
      case 'equations':
        if (this.mathematicalInnovator) {
          this.mathematicalInnovator.printEquationCatalog();
        }
        return true;
      case 'theories':
        if (this.quantumRealm) {
          console.log(JSON.stringify(this.quantumRealm.getAllTheories(), null, 2));
        }
        return true;
      default:
        console.log('Unknown command:', command);
        console.log('Available commands: start, stop, stats, achievements, report, export, symbols, equations, theories');
        return false;
    }
  }
}

// Export
if (typeof window !== 'undefined') {
  window.MetaAIOrchestrator = MetaAIOrchestrator;
}

export { MetaAIOrchestrator };
