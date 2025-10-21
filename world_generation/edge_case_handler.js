/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                  EDGE CASE HANDLER & FALLBACK SYSTEM v1.0.0           ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • Graceful degradation for missing features                         ║
 * ║  • Browser compatibility fallbacks                                    ║
 * ║  • Network error handling                                             ║
 * ║  • Memory leak prevention                                             ║
 * ║  • User-friendly error messages                                       ║
 * ║  • Automatic recovery attempts                                        ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class EdgeCaseHandler {
  constructor() {
    this.errorMessages = new Map();
    this.fallbackStrategies = new Map();
    this.setupDefaultFallbacks();
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 1. BROWSER COMPATIBILITY CHECKS
  // ═══════════════════════════════════════════════════════════════════════
  
  checkBrowserCompatibility() {
    const issues = [];
    
    // Check WebGL support
    if (!this.isWebGLSupported()) {
      issues.push({
        severity: 'critical',
        feature: 'WebGL',
        message: 'Your browser does not support WebGL, which is required for 3D graphics.',
        fallback: 'none'
      });
    }
    
    // Check Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
      issues.push({
        severity: 'warning',
        feature: 'Web Audio API',
        message: 'Audio features may not work properly in this browser.',
        fallback: 'silent mode'
      });
    }
    
    // Check WebSocket support
    if (!window.WebSocket) {
      issues.push({
        severity: 'warning',
        feature: 'WebSocket',
        message: 'Multiplayer features will not be available.',
        fallback: 'single-player only'
      });
    }
    
    // Check localStorage
    if (!this.isLocalStorageAvailable()) {
      issues.push({
        severity: 'warning',
        feature: 'localStorage',
        message: 'Game progress cannot be saved locally.',
        fallback: 'session-only saves'
      });
    }
    
    // Check IndexedDB (for larger saves)
    if (!window.indexedDB) {
      issues.push({
        severity: 'info',
        feature: 'IndexedDB',
        message: 'Advanced save features may be limited.',
        fallback: 'basic localStorage saves'
      });
    }
    
    return issues;
  }
  
  isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 2. AUDIO EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════
  
  handleAudioAutoplayBlock(audioSystem) {
    // Modern browsers block autoplay until user interaction
    const unlockAudio = () => {
      if (audioSystem && !audioSystem.initialized) {
        audioSystem.init();
        console.log('🔊 Audio unlocked after user interaction');
      }
      
      // Remove listeners after first interaction
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    
    // Add multiple event listeners for different interaction types
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    
    console.log('🔇 Audio requires user interaction to start (browser policy)');
  }
  
  checkAudioContext(audioContext) {
    if (!audioContext) {
      console.warn('⚠️ No audio context available');
      return { valid: false, reason: 'No audio context' };
    }
    
    if (audioContext.state === 'suspended') {
      // Try to resume
      audioContext.resume().then(() => {
        console.log('🔊 Audio context resumed');
      }).catch(err => {
        console.error('❌ Failed to resume audio context:', err);
      });
      return { valid: false, reason: 'Audio context suspended' };
    }
    
    if (audioContext.state === 'closed') {
      return { valid: false, reason: 'Audio context closed' };
    }
    
    return { valid: true };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 3. NETWORK ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════
  
  handleWebSocketError(ws, reconnectCallback) {
    const maxReconnectAttempts = 5;
    let reconnectAttempts = 0;
    let reconnectTimeout = null;
    
    const attemptReconnect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.showUserMessage('Unable to connect to multiplayer server. Please try again later.', 'error');
        return;
      }
      
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
      
      console.log(`🔄 Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
      
      reconnectTimeout = setTimeout(() => {
        if (reconnectCallback) {
          reconnectCallback();
        }
      }, delay);
    };
    
    ws.addEventListener('error', (event) => {
      console.error('❌ WebSocket error:', event);
      this.showUserMessage('Connection error. Attempting to reconnect...', 'warning');
    });
    
    ws.addEventListener('close', (event) => {
      if (!event.wasClean) {
        console.warn('⚠️ WebSocket closed unexpectedly');
        attemptReconnect();
      }
    });
    
    return {
      cancel: () => {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
      }
    };
  }
  
  handleNetworkOffline(onlineCallback, offlineCallback) {
    window.addEventListener('online', () => {
      console.log('🌐 Network connection restored');
      this.showUserMessage('Connection restored!', 'success');
      if (onlineCallback) onlineCallback();
    });
    
    window.addEventListener('offline', () => {
      console.warn('⚠️ Network connection lost');
      this.showUserMessage('You are offline. Some features may not work.', 'warning');
      if (offlineCallback) offlineCallback();
    });
    
    // Check initial state
    if (!navigator.onLine) {
      console.warn('⚠️ Starting in offline mode');
      this.showUserMessage('You are offline. Some features may not work.', 'warning');
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 4. MEMORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  monitorMemoryUsage(threshold = 0.8) {
    if (!performance.memory) {
      console.warn('⚠️ Memory monitoring not available in this browser');
      return null;
    }
    
    const checkMemory = () => {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      const usage = used / limit;
      
      if (usage > threshold) {
        console.warn(`⚠️ High memory usage: ${(usage * 100).toFixed(1)}%`);
        this.showUserMessage('Memory usage is high. Consider closing other applications.', 'warning');
        return { critical: true, usage };
      }
      
      return { critical: false, usage };
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    
    return {
      stop: () => clearInterval(interval),
      check: checkMemory
    };
  }
  
  cleanupResources(scene, renderer) {
    // Dispose of geometries and materials
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    // Dispose of renderer
    if (renderer) {
      renderer.dispose();
    }
    
    console.log('🧹 Resources cleaned up');
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 5. INPUT VALIDATION & SANITIZATION
  // ═══════════════════════════════════════════════════════════════════════
  
  validatePlayerName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Name must be a string' };
    }
    
    if (name.length < 3) {
      return { valid: false, error: 'Name must be at least 3 characters' };
    }
    
    if (name.length > 20) {
      return { valid: false, error: 'Name must be 20 characters or less' };
    }
    
    // Only allow alphanumeric and basic punctuation
    if (!/^[a-zA-Z0-9_\- ]+$/.test(name)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }
    
    return { valid: true, sanitized: name.trim() };
  }
  
  validateChatMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message must be a string' };
    }
    
    if (message.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }
    
    if (message.length > 500) {
      return { valid: false, error: 'Message too long (max 500 characters)' };
    }
    
    // Remove potentially dangerous HTML/scripts
    const sanitized = message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();
    
    return { valid: true, sanitized };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 6. ERROR RECOVERY STRATEGIES
  // ═══════════════════════════════════════════════════════════════════════
  
  setupDefaultFallbacks() {
    // Renderer failure fallback
    this.addFallbackStrategy('renderer_init_failed', () => {
      console.error('❌ Renderer initialization failed');
      this.showUserMessage(
        'Failed to initialize 3D graphics. Please try:\n' +
        '1. Updating your graphics drivers\n' +
        '2. Using a different browser (Chrome/Firefox recommended)\n' +
        '3. Enabling hardware acceleration in browser settings',
        'error'
      );
      return null;
    });
    
    // Audio failure fallback
    this.addFallbackStrategy('audio_init_failed', () => {
      console.warn('⚠️ Audio initialization failed, continuing without sound');
      this.showUserMessage('Audio unavailable. Game will continue in silent mode.', 'warning');
      return { silent: true };
    });
    
    // Save failure fallback
    this.addFallbackStrategy('save_failed', (error) => {
      console.error('❌ Save failed:', error);
      this.showUserMessage('Failed to save game. Your progress may be lost.', 'error');
      // Try alternative save method (e.g., download as file)
      return { useDownload: true };
    });
    
    // World generation fallback
    this.addFallbackStrategy('world_gen_failed', () => {
      console.warn('⚠️ World generation failed, using default terrain');
      this.showUserMessage('Using simplified world. Some features may be limited.', 'warning');
      return { useSimpleTerrain: true };
    });
  }
  
  addFallbackStrategy(errorType, strategy) {
    this.fallbackStrategies.set(errorType, strategy);
  }
  
  executeFallback(errorType, ...args) {
    const strategy = this.fallbackStrategies.get(errorType);
    if (strategy) {
      return strategy(...args);
    }
    console.warn(`⚠️ No fallback strategy for: ${errorType}`);
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 7. USER MESSAGING
  // ═══════════════════════════════════════════════════════════════════════
  
  showUserMessage(message, type = 'info', duration = 5000) {
    // Create message element if it doesn't exist
    let messageContainer = document.getElementById('user-messages');
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.id = 'user-messages';
      messageContainer.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
      `;
      document.body.appendChild(messageContainer);
    }
    
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      background: ${this.getMessageColor(type)};
      color: white;
      padding: 15px 20px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
      white-space: pre-line;
    `;
    
    // Add icon based on type
    const icon = this.getMessageIcon(type);
    messageEl.innerHTML = `<strong>${icon} ${type.toUpperCase()}</strong><br>${message}`;
    
    messageContainer.appendChild(messageEl);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => messageEl.remove(), 300);
      }, duration);
    }
    
    return messageEl;
  }
  
  getMessageColor(type) {
    const colors = {
      error: '#d32f2f',
      warning: '#f57c00',
      success: '#388e3c',
      info: '#1976d2'
    };
    return colors[type] || colors.info;
  }
  
  getMessageIcon(type) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // 8. PERFORMANCE DEGRADATION
  // ═══════════════════════════════════════════════════════════════════════
  
  suggestPerformanceImprovements(fps) {
    if (fps >= 50) return null;
    
    const suggestions = [];
    
    if (fps < 20) {
      suggestions.push({
        severity: 'critical',
        message: 'Performance is very low. Try these:\n' +
                 '• Close other browser tabs\n' +
                 '• Lower graphics quality (auto-adjusting...)\n' +
                 '• Update graphics drivers\n' +
                 '• Use a more powerful device'
      });
    } else if (fps < 30) {
      suggestions.push({
        severity: 'warning',
        message: 'Performance is below optimal. Graphics quality will be reduced automatically.'
      });
    } else if (fps < 50) {
      suggestions.push({
        severity: 'info',
        message: 'Performance could be improved. Consider closing other applications.'
      });
    }
    
    return suggestions;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EdgeCaseHandler };
}
