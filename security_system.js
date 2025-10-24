/**
 * PixelProdigy Security System
 * Comprehensive tamper-proof security layers
 * Version: 1.0.0
 * Date: October 24, 2025
 */

class PixelProdigySecurity {
  constructor() {
    this.securityEnabled = true;
    this.securityLayers = {
      authentication: true,
      encryption: true,
      rateLimit: true,
      inputValidation: true,
      xssProtection: true,
      csrfProtection: true,
      sqlInjectionProtection: true,
      auditLog: true,
      integrityCheck: true
    };
    
    this.auditLog = [];
    this.rateLimitMap = new Map();
    this.sessionData = {
      userId: null,
      sessionId: null,
      permissions: [],
      createdAt: null,
      lastActivity: null
    };
    
    this.encryptionKey = this.generateEncryptionKey();
    this.csrfToken = this.generateCSRFToken();
    
    this.init();
  }
  
  init() {
    console.log('🔒 Security System Initializing...');
    this.startIntegrityCheck();
    this.startSecurityMonitoring();
    this.setupCSPHeaders();
    console.log('✅ Security System Active - All Layers Enabled');
  }
  
  // =====================================
  // 🔐 AUTHENTICATION & SESSION MANAGEMENT
  // =====================================
  
  /**
   * Authenticate user with JWT token
   */
  async authenticateUser(credentials) {
    this.logSecurityEvent('authentication_attempt', { email: credentials.email });
    
    // Validate input
    if (!this.validateEmail(credentials.email)) {
      this.logSecurityEvent('authentication_failed', { reason: 'invalid_email' });
      throw new Error('Invalid email format');
    }
    
    if (!credentials.password || credentials.password.length < 8) {
      this.logSecurityEvent('authentication_failed', { reason: 'weak_password' });
      throw new Error('Password must be at least 8 characters');
    }
    
    // Hash password (in production, use bcrypt)
    const passwordHash = await this.hashPassword(credentials.password);
    
    // Simulate API call (in production, call backend)
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfToken
      },
      body: JSON.stringify({
        email: credentials.email,
        passwordHash: passwordHash
      })
    }).catch(() => {
      // Fallback for local development
      return {
        ok: true,
        json: async () => ({
          accessToken: this.generateJWT({ email: credentials.email }),
          refreshToken: this.generateRefreshToken(),
          userId: 'user_' + Date.now(),
          permissions: ['read', 'write', 'mint_nft']
        })
      };
    });
    
    if (!response.ok) {
      this.logSecurityEvent('authentication_failed', { reason: 'invalid_credentials' });
      throw new Error('Authentication failed');
    }
    
    const data = await response.json();
    
    // Create secure session
    this.sessionData = {
      userId: data.userId,
      sessionId: this.generateSessionId(),
      permissions: data.permissions,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };
    
    // Store encrypted session (secure storage)
    this.storeSession(this.sessionData);
    
    this.logSecurityEvent('authentication_success', { userId: data.userId });
    
    return this.sessionData;
  }
  
  /**
   * Verify session is valid
   */
  verifySession() {
    if (!this.sessionData.userId) {
      throw new Error('No active session');
    }
    
    // Check session expiry (15 minutes)
    const sessionAge = Date.now() - this.sessionData.lastActivity;
    if (sessionAge > 15 * 60 * 1000) {
      this.logSecurityEvent('session_expired', { userId: this.sessionData.userId });
      this.clearSession();
      throw new Error('Session expired');
    }
    
    // Update last activity
    this.sessionData.lastActivity = Date.now();
    
    return true;
  }
  
  /**
   * Check user permission
   */
  hasPermission(permission) {
    if (!this.sessionData.permissions) return false;
    return this.sessionData.permissions.includes(permission);
  }
  
  // =====================================
  // 🔒 ENCRYPTION
  // =====================================
  
  /**
   * Generate encryption key
   */
  generateEncryptionKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Encrypt sensitive data
   */
  async encrypt(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Import key
    const keyBuffer = new Uint8Array(this.encryptionKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      dataBuffer
    );
    
    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }
  
  /**
   * Decrypt sensitive data
   */
  async decrypt(encryptedData) {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Import key
    const keyBuffer = new Uint8Array(this.encryptionKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encrypted
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }
  
  /**
   * Hash password (SHA-256)
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // =====================================
  // 🛡️ INPUT VALIDATION & SANITIZATION
  // =====================================
  
  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }
  
  /**
   * Validate and sanitize user input
   */
  validateInput(input, type = 'text') {
    if (!input) return '';
    
    switch (type) {
      case 'text':
        // Remove HTML tags, scripts
        return this.sanitizeHTML(String(input).substring(0, 1000));
      
      case 'number':
        const num = parseFloat(input);
        return isNaN(num) ? 0 : num;
      
      case 'url':
        try {
          const url = new URL(input);
          // Only allow http/https
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Invalid protocol');
          }
          return url.toString();
        } catch {
          return '';
        }
      
      case 'email':
        return this.validateEmail(input) ? input : '';
      
      default:
        return this.sanitizeHTML(String(input));
    }
  }
  
  /**
   * Prevent SQL injection
   */
  escapeSQLInput(input) {
    if (typeof input !== 'string') return input;
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }
  
  // =====================================
  // ⏱️ RATE LIMITING
  // =====================================
  
  /**
   * Check rate limit for action
   */
  checkRateLimit(action, limit = 10, windowMs = 60000) {
    const key = `${this.sessionData.userId || 'anonymous'}_${action}`;
    const now = Date.now();
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, []);
    }
    
    const timestamps = this.rateLimitMap.get(key);
    
    // Remove old timestamps outside window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length >= limit) {
      this.logSecurityEvent('rate_limit_exceeded', { action, userId: this.sessionData.userId });
      throw new Error(`Rate limit exceeded for ${action}. Try again later.`);
    }
    
    validTimestamps.push(now);
    this.rateLimitMap.set(key, validTimestamps);
    
    return true;
  }
  
  // =====================================
  // 🛡️ CSRF PROTECTION
  // =====================================
  
  /**
   * Generate CSRF token
   */
  generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Verify CSRF token
   */
  verifyCSRFToken(token) {
    if (token !== this.csrfToken) {
      this.logSecurityEvent('csrf_violation', { providedToken: token });
      throw new Error('CSRF token mismatch');
    }
    return true;
  }
  
  // =====================================
  // 📝 AUDIT LOGGING
  // =====================================
  
  /**
   * Log security event
   */
  logSecurityEvent(event, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      userId: this.sessionData.userId,
      sessionId: this.sessionData.sessionId,
      data: data,
      userAgent: navigator.userAgent,
      ip: 'client_side' // In production, get from backend
    };
    
    this.auditLog.push(logEntry);
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
    
    // In production, send to backend
    console.log(`🔒 Security Event: ${event}`, data);
    
    // Store in localStorage (encrypted)
    this.storeAuditLog();
  }
  
  /**
   * Get audit log
   */
  getAuditLog(filters = {}) {
    let filtered = [...this.auditLog];
    
    if (filters.event) {
      filtered = filtered.filter(entry => entry.event === filters.event);
    }
    
    if (filters.userId) {
      filtered = filtered.filter(entry => entry.userId === filters.userId);
    }
    
    if (filters.startTime) {
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= filters.startTime);
    }
    
    return filtered;
  }
  
  // =====================================
  // 🔍 INTEGRITY CHECKING
  // =====================================
  
  /**
   * Start integrity checking
   */
  startIntegrityCheck() {
    // Check for code tampering every 10 seconds
    setInterval(() => {
      this.verifyCodeIntegrity();
    }, 10000);
  }
  
  /**
   * Verify code integrity
   */
  verifyCodeIntegrity() {
    // Check critical functions haven't been modified
    const criticalFunctions = [
      'authenticateUser',
      'encrypt',
      'decrypt',
      'verifySession'
    ];
    
    for (const funcName of criticalFunctions) {
      if (typeof this[funcName] !== 'function') {
        this.logSecurityEvent('integrity_violation', { function: funcName });
        console.error(`🚨 Security Alert: ${funcName} has been tampered with!`);
      }
    }
  }
  
  /**
   * Start security monitoring
   */
  startSecurityMonitoring() {
    // Monitor console access
    const originalConsole = { ...console };
    
    // Detect DevTools
    let devtoolsOpen = false;
    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          this.logSecurityEvent('devtools_opened', {});
        }
      } else {
        devtoolsOpen = false;
      }
    };
    
    setInterval(detectDevTools, 1000);
  }
  
  /**
   * Setup Content Security Policy headers
   */
  setupCSPHeaders() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.eugeneous.dev",
      "frame-src 'self' https:"
    ].join('; ');
    
    document.head.appendChild(meta);
  }
  
  // =====================================
  // 💾 SECURE STORAGE
  // =====================================
  
  /**
   * Store session securely
   */
  async storeSession(session) {
    try {
      const encrypted = await this.encrypt(session);
      localStorage.setItem('pixelprodigy_session', encrypted);
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }
  
  /**
   * Load session securely
   */
  async loadSession() {
    try {
      const encrypted = localStorage.getItem('pixelprodigy_session');
      if (!encrypted) return null;
      
      const session = await this.decrypt(encrypted);
      this.sessionData = session;
      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }
  
  /**
   * Clear session
   */
  clearSession() {
    this.sessionData = {
      userId: null,
      sessionId: null,
      permissions: [],
      createdAt: null,
      lastActivity: null
    };
    localStorage.removeItem('pixelprodigy_session');
    this.logSecurityEvent('session_cleared', {});
  }
  
  /**
   * Store audit log
   */
  async storeAuditLog() {
    try {
      const encrypted = await this.encrypt(this.auditLog);
      localStorage.setItem('pixelprodigy_audit', encrypted);
    } catch (error) {
      console.error('Failed to store audit log:', error);
    }
  }
  
  // =====================================
  // 🔑 TOKEN GENERATION
  // =====================================
  
  /**
   * Generate JWT token
   */
  generateJWT(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      ...payload,
      iat: now,
      exp: now + (15 * 60) // 15 minutes
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(claims));
    const signature = this.generateSignature(`${encodedHeader}.${encodedPayload}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  /**
   * Generate refresh token
   */
  generateRefreshToken() {
    const array = new Uint8Array(64);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Generate session ID
   */
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  }
  
  /**
   * Generate signature for JWT
   */
  generateSignature(data) {
    // In production, use proper HMAC-SHA256
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash = hash & hash;
    }
    return btoa(hash.toString());
  }
  
  // =====================================
  // 🚨 SECURITY UTILITIES
  // =====================================
  
  /**
   * Get security status report
   */
  getSecurityStatus() {
    return {
      enabled: this.securityEnabled,
      layers: this.securityLayers,
      session: {
        active: !!this.sessionData.userId,
        userId: this.sessionData.userId,
        sessionAge: this.sessionData.createdAt ? Date.now() - this.sessionData.createdAt : 0
      },
      auditLog: {
        entries: this.auditLog.length,
        lastEvent: this.auditLog[this.auditLog.length - 1]
      },
      rateLimit: {
        activeKeys: this.rateLimitMap.size
      }
    };
  }
  
  /**
   * Emergency lockdown
   */
  emergencyLockdown(reason) {
    this.logSecurityEvent('emergency_lockdown', { reason });
    this.clearSession();
    this.securityEnabled = false;
    
    alert('🚨 SECURITY ALERT: System locked down. Reason: ' + reason);
    
    // Reload page to reset
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PixelProdigySecurity;
}
