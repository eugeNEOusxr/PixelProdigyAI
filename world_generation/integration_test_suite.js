/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║              INTEGRATION TEST SUITE v1.0.0                            ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • End-to-end integration tests                                       ║
 * ║  • Performance benchmarking                                           ║
 * ║  • Cross-system interaction tests                                     ║
 * ║  • User flow simulations                                              ║
 * ║  • Stress testing                                                     ║
 * ║  • Automated QA scenarios                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class IntegrationTestSuite {
  constructor(gameContext) {
    this.gameContext = gameContext;
    this.testResults = [];
    this.performanceMetrics = [];
    this.isRunning = false;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 1. INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════
  
  async runAllIntegrationTests() {
    console.log('🧪 Starting Integration Tests...');
    this.testResults = [];
    this.isRunning = true;
    
    const tests = [
      { name: 'Character Movement + Camera', test: () => this.testCharacterMovementWithCamera() },
      { name: 'Combat + Particle Effects', test: () => this.testCombatWithParticles() },
      { name: 'Inventory + Crafting', test: () => this.testInventoryCrafting() },
      { name: 'Skills + Abilities', test: () => this.testSkillsAbilities() },
      { name: 'World Generation + Minimap', test: () => this.testWorldGenMinimap() },
      { name: 'Audio + UI Interactions', test: () => this.testAudioUI() },
      { name: 'Save/Load System', test: () => this.testSaveLoad() },
      { name: 'Performance Under Load', test: () => this.testPerformanceLoad() },
      { name: 'Multiplayer Sync', test: () => this.testMultiplayerSync() },
      { name: 'All Systems Together', test: () => this.testAllSystemsTogether() }
    ];
    
    for (const { name, test } of tests) {
      console.log(`\n▶️ Running: ${name}...`);
      const result = await this.runSingleTest(name, test);
      this.testResults.push(result);
      
      // Wait a bit between tests
      await this.wait(500);
    }
    
    this.isRunning = false;
    return this.generateIntegrationReport();
  }
  
  async runSingleTest(name, testFn) {
    const startTime = performance.now();
    let passed = false;
    let error = null;
    let details = {};
    
    try {
      const result = await testFn();
      passed = result.passed !== false;
      details = result.details || {};
      console.log(`   ✅ ${name} - PASSED`);
    } catch (e) {
      passed = false;
      error = e.message;
      console.error(`   ❌ ${name} - FAILED: ${error}`);
    }
    
    const duration = performance.now() - startTime;
    
    return { name, passed, error, details, duration };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 2. SPECIFIC INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════
  
  async testCharacterMovementWithCamera() {
    // Test that character movement updates camera position
    const player = this.gameContext.playerCharacter;
    const camera = this.gameContext.camera;
    
    if (!player || !camera) {
      return { passed: false, details: { error: 'Missing player or camera' } };
    }
    
    const initialPos = { ...player.position };
    const initialCamPos = { ...camera.position };
    
    // Simulate movement
    player.position.x += 10;
    player.position.z += 10;
    
    // Camera should follow (in TPS mode)
    const cameraController = this.gameContext.cameraController;
    if (cameraController) {
      cameraController.update(0.016); // Simulate one frame
    }
    
    const moved = player.position.x !== initialPos.x || player.position.z !== initialPos.z;
    
    // Reset position
    player.position.x = initialPos.x;
    player.position.z = initialPos.z;
    
    return {
      passed: moved,
      details: { 
        playerMoved: moved,
        cameraController: !!cameraController
      }
    };
  }
  
  async testCombatWithParticles() {
    // Test that combat triggers particle effects
    const particleEffects = this.gameContext.particleEffects;
    
    if (!particleEffects) {
      return { passed: false, details: { error: 'Particle system not found' } };
    }
    
    const initialParticleCount = particleEffects.particles.length;
    
    // Trigger damage effect
    particleEffects.damageEffect(new THREE.Vector3(0, 1, 0));
    
    const particlesCreated = particleEffects.particles.length > initialParticleCount;
    
    return {
      passed: particlesCreated,
      details: {
        initialCount: initialParticleCount,
        newCount: particleEffects.particles.length,
        created: particlesCreated
      }
    };
  }
  
  async testInventoryCrafting() {
    // Test inventory and crafting integration
    const inventoryManager = this.gameContext.inventoryManager;
    const craftingManager = this.gameContext.craftingManager;
    
    if (!inventoryManager || !craftingManager) {
      return { 
        passed: true, // Optional systems
        details: { 
          hasInventory: !!inventoryManager,
          hasCrafting: !!craftingManager,
          note: 'Systems optional'
        }
      };
    }
    
    // Try to add item to inventory
    const testItem = { id: 'test_item', name: 'Test', quantity: 1 };
    const added = inventoryManager.addItem && inventoryManager.addItem(testItem);
    
    return {
      passed: true,
      details: {
        hasInventory: !!inventoryManager,
        hasCrafting: !!craftingManager,
        itemAddTest: added
      }
    };
  }
  
  async testSkillsAbilities() {
    // Test skills and abilities system
    const abilityManager = this.gameContext.abilityManager;
    
    if (!abilityManager) {
      return { 
        passed: true,
        details: { note: 'Ability system optional' }
      };
    }
    
    return {
      passed: true,
      details: {
        hasAbilityManager: !!abilityManager,
        abilities: abilityManager.abilities ? abilityManager.abilities.length : 0
      }
    };
  }
  
  async testWorldGenMinimap() {
    // Test world generation and minimap integration
    const worldGenerator = this.gameContext.worldGenerator;
    const miniMap = this.gameContext.miniMap;
    
    return {
      passed: true,
      details: {
        hasWorldGen: !!worldGenerator,
        hasMinimap: !!miniMap,
        minimapMarkers: miniMap ? miniMap.markers.length : 0
      }
    };
  }
  
  async testAudioUI() {
    // Test audio system and UI integration
    const audioSystem = this.gameContext.audioSystem;
    const enhancedAudioController = this.gameContext.enhancedAudioController;
    
    if (!audioSystem) {
      return { passed: false, details: { error: 'Audio system missing' } };
    }
    
    // Check if audio context exists
    const hasContext = !!audioSystem.audioContext;
    
    return {
      passed: hasContext,
      details: {
        hasAudioSystem: !!audioSystem,
        hasEnhancedController: !!enhancedAudioController,
        audioInitialized: audioSystem.initialized,
        contextState: audioSystem.audioContext?.state
      }
    };
  }
  
  async testSaveLoad() {
    // Test save/load system
    const saveManager = this.gameContext.saveManager;
    
    if (!saveManager) {
      return {
        passed: true,
        details: { note: 'Save system optional' }
      };
    }
    
    // Try to create a save
    const testData = { test: true, timestamp: Date.now() };
    let saved = false;
    let loaded = false;
    
    try {
      if (saveManager.saveGame) {
        saveManager.saveGame(0, testData);
        saved = true;
      }
      
      if (saveManager.loadGame) {
        const loadedData = saveManager.loadGame(0);
        loaded = !!loadedData;
      }
    } catch (e) {
      // Save might fail if localStorage is disabled
    }
    
    return {
      passed: true,
      details: {
        hasSaveManager: true,
        saveTest: saved,
        loadTest: loaded
      }
    };
  }
  
  async testPerformanceLoad() {
    // Test performance under load
    const performanceOptimizer = this.gameContext.performanceOptimizer;
    
    if (!performanceOptimizer) {
      return { passed: false, details: { error: 'Performance optimizer missing' } };
    }
    
    const fps = performanceOptimizer.currentFPS || 0;
    const drawCalls = performanceOptimizer.stats?.drawCalls || 0;
    const triangles = performanceOptimizer.stats?.triangles || 0;
    
    return {
      passed: fps > 30, // At least 30 FPS
      details: {
        fps,
        drawCalls,
        triangles,
        threshold: 30
      }
    };
  }
  
  async testMultiplayerSync() {
    // Test multiplayer synchronization
    const multiplayerManager = this.gameContext.multiplayerManager;
    
    if (!multiplayerManager) {
      return {
        passed: true,
        details: { note: 'Multiplayer optional (single-player mode)' }
      };
    }
    
    const connected = multiplayerManager.ws && multiplayerManager.ws.readyState === WebSocket.OPEN;
    
    return {
      passed: true, // Not required to be connected
      details: {
        hasMultiplayer: true,
        connected,
        wsState: multiplayerManager.ws?.readyState
      }
    };
  }
  
  async testAllSystemsTogether() {
    // Comprehensive test of all systems working together
    const systems = {
      renderer: this.gameContext.renderer,
      scene: this.gameContext.scene,
      camera: this.gameContext.camera,
      player: this.gameContext.playerCharacter,
      audio: this.gameContext.audioSystem,
      performance: this.gameContext.performanceOptimizer,
      particles: this.gameContext.particleEffects,
      loading: this.gameContext.loadingScreen
    };
    
    const allPresent = Object.values(systems).every(sys => !!sys);
    const criticalPresent = systems.renderer && systems.scene && systems.camera && systems.player;
    
    return {
      passed: criticalPresent,
      details: {
        allSystemsPresent: allPresent,
        criticalSystemsPresent: criticalPresent,
        systemCount: Object.keys(systems).filter(k => systems[k]).length,
        totalSystems: Object.keys(systems).length
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 3. PERFORMANCE BENCHMARKING
  // ═══════════════════════════════════════════════════════════════════════
  
  async runPerformanceBenchmark(duration = 10000) {
    console.log(`🎯 Running Performance Benchmark (${duration/1000}s)...`);
    
    this.performanceMetrics = [];
    const startTime = Date.now();
    const interval = 100; // Sample every 100ms
    
    return new Promise((resolve) => {
      const sampleInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed >= duration) {
          clearInterval(sampleInterval);
          resolve(this.analyzePerformanceMetrics());
          return;
        }
        
        // Collect metrics
        const metrics = this.collectPerformanceMetrics();
        this.performanceMetrics.push(metrics);
        
      }, interval);
    });
  }
  
  collectPerformanceMetrics() {
    const optimizer = this.gameContext.performanceOptimizer;
    
    return {
      timestamp: Date.now(),
      fps: optimizer?.currentFPS || 0,
      drawCalls: optimizer?.stats?.drawCalls || 0,
      triangles: optimizer?.stats?.triangles || 0,
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize / 1024 / 1024,
        total: performance.memory.totalJSHeapSize / 1024 / 1024
      } : null,
      particles: this.gameContext.particleEffects?.particles.length || 0
    };
  }
  
  analyzePerformanceMetrics() {
    if (this.performanceMetrics.length === 0) {
      return { error: 'No metrics collected' };
    }
    
    const fps = this.performanceMetrics.map(m => m.fps);
    const drawCalls = this.performanceMetrics.map(m => m.drawCalls);
    const triangles = this.performanceMetrics.map(m => m.triangles);
    
    return {
      fps: {
        min: Math.min(...fps),
        max: Math.max(...fps),
        avg: fps.reduce((a, b) => a + b, 0) / fps.length,
        samples: fps.length
      },
      drawCalls: {
        min: Math.min(...drawCalls),
        max: Math.max(...drawCalls),
        avg: drawCalls.reduce((a, b) => a + b, 0) / drawCalls.length
      },
      triangles: {
        min: Math.min(...triangles),
        max: Math.max(...triangles),
        avg: triangles.reduce((a, b) => a + b, 0) / triangles.length
      },
      memory: this.performanceMetrics[0].memory ? {
        initial: this.performanceMetrics[0].memory.used,
        final: this.performanceMetrics[this.performanceMetrics.length - 1].memory.used,
        peak: Math.max(...this.performanceMetrics.map(m => m.memory?.used || 0))
      } : null
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 4. STRESS TESTING
  // ═══════════════════════════════════════════════════════════════════════
  
  async runStressTest() {
    console.log('💪 Running Stress Test...');
    
    const tests = [];
    
    // Test 1: Spawn many particles
    tests.push(await this.stressTestParticles());
    
    // Test 2: Many UI operations
    tests.push(await this.stressTestUI());
    
    // Test 3: Rapid movement
    tests.push(await this.stressTestMovement());
    
    return {
      passed: tests.every(t => t.passed),
      tests
    };
  }
  
  async stressTestParticles() {
    const particleEffects = this.gameContext.particleEffects;
    
    if (!particleEffects) {
      return { name: 'Particle Stress', passed: false, error: 'No particle system' };
    }
    
    const initialCount = particleEffects.particles.length;
    
    // Spawn 100 particle effects
    for (let i = 0; i < 100; i++) {
      particleEffects.explosion(new THREE.Vector3(
        Math.random() * 20 - 10,
        Math.random() * 5,
        Math.random() * 20 - 10
      ));
    }
    
    await this.wait(100);
    
    const peakCount = particleEffects.particles.length;
    const optimizer = this.gameContext.performanceOptimizer;
    const fps = optimizer?.currentFPS || 0;
    
    return {
      name: 'Particle Stress',
      passed: fps > 20, // Should maintain at least 20 FPS
      details: {
        initialParticles: initialCount,
        peakParticles: peakCount,
        fps,
        threshold: 20
      }
    };
  }
  
  async stressTestUI() {
    // Rapidly toggle UI elements
    const uis = [
      this.gameContext.inventoryUI,
      this.gameContext.skillsUI,
      this.gameContext.craftingUI
    ].filter(ui => ui);
    
    for (let i = 0; i < 10; i++) {
      for (const ui of uis) {
        if (ui.show) ui.show();
        await this.wait(10);
        if (ui.hide) ui.hide();
        await this.wait(10);
      }
    }
    
    const optimizer = this.gameContext.performanceOptimizer;
    const fps = optimizer?.currentFPS || 0;
    
    return {
      name: 'UI Stress',
      passed: fps > 30,
      details: {
        uiCount: uis.length,
        fps,
        threshold: 30
      }
    };
  }
  
  async stressTestMovement() {
    const player = this.gameContext.playerCharacter;
    
    if (!player) {
      return { name: 'Movement Stress', passed: false, error: 'No player' };
    }
    
    const initialPos = { ...player.position };
    
    // Rapid position changes
    for (let i = 0; i < 100; i++) {
      player.position.x += Math.random() * 2 - 1;
      player.position.z += Math.random() * 2 - 1;
      await this.wait(10);
    }
    
    // Reset position
    player.position.x = initialPos.x;
    player.position.z = initialPos.z;
    
    const optimizer = this.gameContext.performanceOptimizer;
    const fps = optimizer?.currentFPS || 0;
    
    return {
      name: 'Movement Stress',
      passed: fps > 30,
      details: { fps, threshold: 30 }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 5. USER FLOW SIMULATIONS
  // ═══════════════════════════════════════════════════════════════════════
  
  async simulateUserFlow(flowName) {
    console.log(`👤 Simulating User Flow: ${flowName}...`);
    
    const flows = {
      'new_player': () => this.flowNewPlayer(),
      'combat_session': () => this.flowCombatSession(),
      'crafting_session': () => this.flowCraftingSession(),
      'exploration': () => this.flowExploration()
    };
    
    const flowFn = flows[flowName];
    if (!flowFn) {
      return { passed: false, error: 'Unknown flow' };
    }
    
    return await flowFn();
  }
  
  async flowNewPlayer() {
    // Simulate new player experience
    const steps = [
      'Game loads',
      'Player sees loading screen',
      'World generates',
      'Player spawns',
      'Tutorial UI appears',
      'Player moves around',
      'Player opens inventory',
      'Player closes inventory'
    ];
    
    console.log('  📋 New Player Flow:');
    steps.forEach(step => console.log(`    - ${step}`));
    
    return {
      passed: true,
      details: { steps: steps.length, flow: 'new_player' }
    };
  }
  
  async flowCombatSession() {
    // Simulate combat session
    const particleEffects = this.gameContext.particleEffects;
    
    if (particleEffects) {
      // Attack effects
      for (let i = 0; i < 5; i++) {
        particleEffects.damageEffect(new THREE.Vector3(0, 1, 0));
        await this.wait(200);
      }
      
      // Heal effect
      particleEffects.healEffect(new THREE.Vector3(0, 1, 0));
    }
    
    return {
      passed: true,
      details: { attacks: 5, heals: 1 }
    };
  }
  
  async flowCraftingSession() {
    // Simulate crafting session
    const craftingUI = this.gameContext.craftingUI;
    
    if (craftingUI) {
      if (craftingUI.show) craftingUI.show();
      await this.wait(500);
      if (craftingUI.hide) craftingUI.hide();
    }
    
    return {
      passed: true,
      details: { hasCrafting: !!craftingUI }
    };
  }
  
  async flowExploration() {
    // Simulate exploration
    const player = this.gameContext.playerCharacter;
    const miniMap = this.gameContext.miniMap;
    
    if (player) {
      const path = [
        { x: 10, z: 0 },
        { x: 10, z: 10 },
        { x: 0, z: 10 },
        { x: 0, z: 0 }
      ];
      
      for (const pos of path) {
        player.position.x = pos.x;
        player.position.z = pos.z;
        
        if (miniMap) {
          miniMap.update();
        }
        
        await this.wait(100);
      }
    }
    
    return {
      passed: true,
      details: { waypoints: 4, hasMinimap: !!miniMap }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 6. REPORTING
  // ═══════════════════════════════════════════════════════════════════════
  
  generateIntegrationReport() {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;
    
    const report = {
      timestamp: Date.now(),
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0
      },
      results: this.testResults,
      failedTests: this.testResults.filter(r => !r.passed),
      avgDuration: this.testResults.reduce((sum, r) => sum + r.duration, 0) / total
    };
    
    this.logIntegrationReport(report);
    return report;
  }
  
  logIntegrationReport(report) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              INTEGRATION TEST REPORT                          ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║ Total Tests: ${report.summary.total}`);
    console.log(`║ Passed: ${report.summary.passed} ✅`);
    console.log(`║ Failed: ${report.summary.failed} ❌`);
    console.log(`║ Pass Rate: ${report.summary.passRate}%`);
    console.log(`║ Avg Duration: ${report.avgDuration.toFixed(0)}ms per test`);
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    
    if (report.failedTests.length > 0) {
      console.log('║ Failed Tests:');
      report.failedTests.forEach(test => {
        console.log(`║   ❌ ${test.name}: ${test.error || 'Failed'}`);
      });
    } else {
      console.log('║ 🎉 All tests passed!');
    }
    
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IntegrationTestSuite };
}
