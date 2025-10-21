/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                   BUG TESTING & DIAGNOSTIC SYSTEM v1.0.0              ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • Automated system testing                                           ║
 * ║  • Error detection and logging                                        ║
 * ║  • Performance monitoring                                             ║
 * ║  • Edge case validation                                               ║
 * ║  • Diagnostic reports                                                 ║
 * ║  • Auto-recovery mechanisms                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════
// 1. ERROR LOGGER
// ═══════════════════════════════════════════════════════════════════════

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.maxLogs = 100;
    this.consoleEnabled = true;
    
    // Capture console errors
    this.hookConsoleErrors();
  }
  
  hookConsoleErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      this.logError('Console Error', args.join(' '));
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.logWarning('Console Warning', args.join(' '));
      originalWarn.apply(console, args);
    };
    
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.logError('Unhandled Error', `${event.message} at ${event.filename}:${event.lineno}`);
    });
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
    });
  }
  
  logError(category, message, details = {}) {
    const error = {
      timestamp: Date.now(),
      category,
      message,
      details,
      stack: new Error().stack
    };
    
    this.errors.push(error);
    if (this.errors.length > this.maxLogs) {
      this.errors.shift();
    }
    
    if (this.consoleEnabled) {
      console.error(`[${category}] ${message}`, details);
    }
  }
  
  logWarning(category, message, details = {}) {
    const warning = {
      timestamp: Date.now(),
      category,
      message,
      details
    };
    
    this.warnings.push(warning);
    if (this.warnings.length > this.maxLogs) {
      this.warnings.shift();
    }
    
    if (this.consoleEnabled) {
      console.warn(`[${category}] ${message}`, details);
    }
  }
  
  getErrors() {
    return this.errors;
  }
  
  getWarnings() {
    return this.warnings;
  }
  
  clearLogs() {
    this.errors = [];
    this.warnings = [];
  }
  
  generateReport() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      recentErrors: this.errors.slice(-10),
      recentWarnings: this.warnings.slice(-10),
      errorCategories: this.categorizeIssues(this.errors),
      warningCategories: this.categorizeIssues(this.warnings)
    };
  }
  
  categorizeIssues(issues) {
    const categories = {};
    issues.forEach(issue => {
      if (!categories[issue.category]) {
        categories[issue.category] = 0;
      }
      categories[issue.category]++;
    });
    return categories;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2. SYSTEM TEST SUITE
// ═══════════════════════════════════════════════════════════════════════

class SystemTestSuite {
  constructor(errorLogger) {
    this.errorLogger = errorLogger;
    this.tests = [];
    this.results = [];
    this.systems = {};
  }
  
  // Register a system to test
  registerSystem(name, system, tests) {
    this.systems[name] = {
      system,
      tests,
      lastTestTime: null,
      testResults: []
    };
  }
  
  // Add a test
  addTest(name, testFn, category = 'General') {
    this.tests.push({
      name,
      testFn,
      category,
      enabled: true
    });
  }
  
  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting comprehensive system tests...');
    this.results = [];
    
    for (const test of this.tests) {
      if (!test.enabled) continue;
      
      const result = await this.runTest(test);
      this.results.push(result);
    }
    
    return this.generateTestReport();
  }
  
  // Run a single test
  async runTest(test) {
    const startTime = performance.now();
    let passed = false;
    let error = null;
    let details = {};
    
    try {
      const testResult = await test.testFn();
      passed = testResult.passed !== false;
      details = testResult.details || {};
    } catch (e) {
      passed = false;
      error = e.message;
      this.errorLogger.logError('Test Error', `Test "${test.name}" failed: ${e.message}`);
    }
    
    const duration = performance.now() - startTime;
    
    return {
      name: test.name,
      category: test.category,
      passed,
      error,
      details,
      duration
    };
  }
  
  // Generate test report
  generateTestReport() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    
    const report = {
      timestamp: Date.now(),
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? (passed / total * 100).toFixed(1) : 0
      },
      results: this.results,
      failedTests: this.results.filter(r => !r.passed),
      categories: this.categorizeResults()
    };
    
    this.logReport(report);
    return report;
  }
  
  categorizeResults() {
    const categories = {};
    this.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = { passed: 0, failed: 0 };
      }
      if (result.passed) {
        categories[result.category].passed++;
      } else {
        categories[result.category].failed++;
      }
    });
    return categories;
  }
  
  logReport(report) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST REPORT                                ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║ Total Tests: ${report.summary.total}`);
    console.log(`║ Passed: ${report.summary.passed} ✅`);
    console.log(`║ Failed: ${report.summary.failed} ❌`);
    console.log(`║ Pass Rate: ${report.summary.passRate}%`);
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    
    if (report.failedTests.length > 0) {
      console.log('║ Failed Tests:');
      report.failedTests.forEach(test => {
        console.log(`║   ❌ ${test.name}: ${test.error || 'Failed'}`);
      });
    }
    
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 3. BUG TESTING SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class BugTestingSystem {
  constructor(gameContext) {
    this.gameContext = gameContext;
    this.errorLogger = new ErrorLogger();
    this.testSuite = new SystemTestSuite(this.errorLogger);
    this.isRunning = false;
    this.autoRecovery = true;
    
    // Setup standard tests
    this.setupStandardTests();
  }
  
  setupStandardTests() {
    // ═══════════════════════════════════════════════════════════════════
    // RENDERING TESTS
    // ═══════════════════════════════════════════════════════════════════
    
    this.testSuite.addTest('Renderer Exists', () => {
      return {
        passed: !!this.gameContext.renderer,
        details: { hasRenderer: !!this.gameContext.renderer }
      };
    }, 'Rendering');
    
    this.testSuite.addTest('Scene Exists', () => {
      return {
        passed: !!this.gameContext.scene,
        details: { hasScene: !!this.gameContext.scene }
      };
    }, 'Rendering');
    
    this.testSuite.addTest('Camera Exists', () => {
      return {
        passed: !!this.gameContext.camera,
        details: { hasCamera: !!this.gameContext.camera }
      };
    }, 'Rendering');
    
    this.testSuite.addTest('Render Loop Active', () => {
      const lastFrameTime = this.gameContext.lastFrameTime || 0;
      const timeSinceLastFrame = Date.now() - lastFrameTime;
      return {
        passed: timeSinceLastFrame < 100,
        details: { timeSinceLastFrame }
      };
    }, 'Rendering');
    
    // ═══════════════════════════════════════════════════════════════════
    // PERFORMANCE TESTS
    // ═══════════════════════════════════════════════════════════════════
    
    this.testSuite.addTest('FPS Above 30', () => {
      const fps = this.gameContext.performanceOptimizer?.currentFPS || 0;
      return {
        passed: fps > 30,
        details: { fps }
      };
    }, 'Performance');
    
    this.testSuite.addTest('Memory Usage Normal', () => {
      if (!performance.memory) {
        return { passed: true, details: { note: 'Memory API not available' } };
      }
      const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = performance.memory.jsHeapSizeLimit / 1024 / 1024;
      const usage = (usedMB / limitMB) * 100;
      return {
        passed: usage < 80,
        details: { usedMB: usedMB.toFixed(1), limitMB: limitMB.toFixed(1), usage: usage.toFixed(1) }
      };
    }, 'Performance');
    
    this.testSuite.addTest('Object Pool Working', () => {
      const optimizer = this.gameContext.performanceOptimizer;
      if (!optimizer || !optimizer.objectPools) {
        return { passed: false, details: { error: 'No object pools found' } };
      }
      return {
        passed: true,
        details: { 
          vector3Pool: optimizer.objectPools.vector3Pool?.length || 0,
          quaternionPool: optimizer.objectPools.quaternionPool?.length || 0
        }
      };
    }, 'Performance');
    
    // ═══════════════════════════════════════════════════════════════════
    // AUDIO TESTS
    // ═══════════════════════════════════════════════════════════════════
    
    this.testSuite.addTest('Audio System Initialized', () => {
      return {
        passed: !!this.gameContext.audioSystem && this.gameContext.audioSystem.initialized,
        details: { initialized: this.gameContext.audioSystem?.initialized }
      };
    }, 'Audio');
    
    this.testSuite.addTest('Enhanced Audio Controller Exists', () => {
      return {
        passed: !!this.gameContext.enhancedAudioController,
        details: { exists: !!this.gameContext.enhancedAudioController }
      };
    }, 'Audio');
    
    this.testSuite.addTest('Audio Context Valid', () => {
      const audioCtx = this.gameContext.audioSystem?.audioContext;
      return {
        passed: audioCtx && audioCtx.state !== 'closed',
        details: { state: audioCtx?.state }
      };
    }, 'Audio');
    
    // ═══════════════════════════════════════════════════════════════════
    // CHARACTER TESTS
    // ═══════════════════════════════════════════════════════════════════
    
    this.testSuite.addTest('Player Character Exists', () => {
      return {
        passed: !!this.gameContext.playerCharacter,
        details: { exists: !!this.gameContext.playerCharacter }
      };
    }, 'Character');
    
    this.testSuite.addTest('Player Position Valid', () => {
      const pos = this.gameContext.playerCharacter?.position;
      const isValid = pos && !isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z);
      return {
        passed: isValid,
        details: { position: pos }
      };
    }, 'Character');
    
    this.testSuite.addTest('Player Health Valid', () => {
      const health = this.gameContext.playerCharacter?.health;
      const maxHealth = this.gameContext.playerCharacter?.maxHealth;
      return {
        passed: health > 0 && health <= maxHealth,
        details: { health, maxHealth }
      };
    }, 'Character');
    
    // ═══════════════════════════════════════════════════════════════════
    // UI TESTS
    // ═══════════════════════════════════════════════════════════════════
    
    this.testSuite.addTest('Loading Screen Exists', () => {
      return {
        passed: !!this.gameContext.loadingScreen,
        details: { exists: !!this.gameContext.loadingScreen }
      };
    }, 'UI');
    
    this.testSuite.addTest('Particle Effects System Exists', () => {
      return {
        passed: !!this.gameContext.particleEffects,
        details: { exists: !!this.gameContext.particleEffects }
      };
    }, 'UI');
    
    this.testSuite.addTest('HUD Elements Present', () => {
      const healthBar = document.getElementById('healthBar');
      const stats = document.getElementById('stats');
      return {
        passed: !!healthBar && !!stats,
        details: { healthBar: !!healthBar, stats: !!stats }
      };
    }, 'UI');
    
    // ═══════════════════════════════════════════════════════════════════
    // WORLD TESTS
    // ═══════════════════════════════════════════════════════════════════
    
    this.testSuite.addTest('World Generator Exists', () => {
      return {
        passed: !!this.gameContext.worldGenerator,
        details: { exists: !!this.gameContext.worldGenerator }
      };
    }, 'World');
    
    this.testSuite.addTest('Terrain Generated', () => {
      const hasGround = this.gameContext.scene?.children.some(obj => 
        obj.userData?.isTerrain || obj.geometry?.type === 'PlaneGeometry'
      );
      return {
        passed: hasGround,
        details: { hasGround }
      };
    }, 'World');
    
    this.testSuite.addTest('Scene Object Count Reasonable', () => {
      const count = this.gameContext.scene?.children.length || 0;
      return {
        passed: count > 0 && count < 10000,
        details: { objectCount: count }
      };
    }, 'World');
    
    // ═══════════════════════════════════════════════════════════════════
    // MULTIPLAYER TESTS
    // ═══════════════════════════════════════════════════════════════════
    
    this.testSuite.addTest('Multiplayer Manager Exists', () => {
      return {
        passed: !!this.gameContext.multiplayerManager,
        details: { exists: !!this.gameContext.multiplayerManager }
      };
    }, 'Multiplayer');
    
    this.testSuite.addTest('WebSocket State Valid', () => {
      const ws = this.gameContext.multiplayerManager?.ws;
      if (!ws) {
        return { passed: true, details: { note: 'Not connected (optional)' } };
      }
      return {
        passed: ws.readyState !== 3, // Not closed with error
        details: { readyState: ws.readyState }
      };
    }, 'Multiplayer');
  }
  
  // Run all tests
  async runTests() {
    console.log('🔍 Running bug detection tests...');
    const report = await this.testSuite.runAllTests();
    
    // Check for critical failures
    const criticalFailures = report.failedTests.filter(test => 
      test.category === 'Rendering' || test.category === 'Character'
    );
    
    if (criticalFailures.length > 0 && this.autoRecovery) {
      console.warn('⚠️ Critical failures detected, attempting recovery...');
      await this.attemptRecovery(criticalFailures);
    }
    
    return report;
  }
  
  // Attempt to recover from errors
  async attemptRecovery(failures) {
    for (const failure of failures) {
      console.log(`🔧 Attempting to recover from: ${failure.name}`);
      
      // Specific recovery strategies
      if (failure.name.includes('Renderer')) {
        this.recoverRenderer();
      }
      if (failure.name.includes('Audio')) {
        this.recoverAudio();
      }
      if (failure.name.includes('Character')) {
        this.recoverCharacter();
      }
    }
  }
  
  recoverRenderer() {
    if (!this.gameContext.renderer && this.gameContext.scene && this.gameContext.camera) {
      console.log('🔧 Recreating renderer...');
      try {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          this.gameContext.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
          this.gameContext.renderer.setSize(window.innerWidth, window.innerHeight);
          this.errorLogger.logWarning('Recovery', 'Renderer recreated successfully');
        }
      } catch (e) {
        this.errorLogger.logError('Recovery', 'Failed to recreate renderer', { error: e.message });
      }
    }
  }
  
  recoverAudio() {
    if (this.gameContext.audioSystem && !this.gameContext.audioSystem.initialized) {
      console.log('🔧 Reinitializing audio system...');
      try {
        this.gameContext.audioSystem.init();
        this.errorLogger.logWarning('Recovery', 'Audio system reinitialized');
      } catch (e) {
        this.errorLogger.logError('Recovery', 'Failed to reinitialize audio', { error: e.message });
      }
    }
  }
  
  recoverCharacter() {
    if (!this.gameContext.playerCharacter || !this.gameContext.playerCharacter.position) {
      console.log('🔧 Resetting player character position...');
      try {
        if (this.gameContext.playerCharacter) {
          this.gameContext.playerCharacter.position.set(0, 5, 0);
          this.errorLogger.logWarning('Recovery', 'Player position reset to spawn');
        }
      } catch (e) {
        this.errorLogger.logError('Recovery', 'Failed to reset player', { error: e.message });
      }
    }
  }
  
  // Generate diagnostic report
  generateDiagnosticReport() {
    return {
      timestamp: Date.now(),
      errors: this.errorLogger.generateReport(),
      lastTestResults: this.testSuite.results,
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        memory: performance.memory ? {
          used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + ' MB',
          total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1) + ' MB',
          limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1) + ' MB'
        } : 'Not available',
        fps: this.gameContext.performanceOptimizer?.currentFPS || 0
      }
    };
  }
  
  // Start continuous monitoring
  startMonitoring(interval = 10000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.monitoringInterval = setInterval(() => {
      this.runTests();
    }, interval);
    
    console.log(`🔍 Bug monitoring started (every ${interval/1000}s)`);
  }
  
  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.isRunning = false;
      console.log('🔍 Bug monitoring stopped');
    }
  }
  
  // Export diagnostic data
  exportDiagnostics() {
    const report = this.generateDiagnosticReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('📊 Diagnostic report exported');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BugTestingSystem, ErrorLogger, SystemTestSuite };
}
