// ═══════════════════════════════════════════════════════════════════════
// SECURITY UTILITIES - XSS Prevention & Input Sanitization
// ═══════════════════════════════════════════════════════════════════════
//
// This module provides security utilities to prevent Cross-Site Scripting (XSS)
// attacks and other injection vulnerabilities in user-generated content.
//
// Key Principles:
// 1. NEVER use innerHTML with user input
// 2. ALWAYS sanitize user input before display
// 3. Use textContent for plain text
// 4. Use createElement + setAttribute for HTML generation
// 5. Validate and limit input lengths
//
// ═══════════════════════════════════════════════════════════════════════

class SecurityUtils {
  
  // ═══════════════════════════════════════════════════════════════════════
  // HTML ESCAPING - Prevent XSS via HTML injection
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Escapes HTML special characters to prevent XSS attacks
   * @param {string} str - The string to escape
   * @returns {string} - HTML-safe string
   */
  static escapeHTML(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  /**
   * Alternative HTML escape using character replacement
   * Faster than DOM method but same security
   * @param {string} str - The string to escape
   * @returns {string} - HTML-safe string
   */
  static escapeHTMLFast(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // INPUT VALIDATION - Prevent malicious input
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Validates and sanitizes a username
   * @param {string} username - The username to validate
   * @returns {string} - Sanitized username or default
   */
  static sanitizeUsername(username) {
    if (typeof username !== 'string') return 'Guest';
    
    // Remove HTML tags
    username = username.replace(/<[^>]*>/g, '');
    
    // Remove special characters except spaces, letters, numbers, and basic punctuation
    username = username.replace(/[^\w\s\-_.]/g, '');
    
    // Trim whitespace
    username = username.trim();
    
    // Limit length (3-20 characters)
    if (username.length < 3) return 'Guest';
    if (username.length > 20) username = username.substring(0, 20);
    
    return username;
  }
  
  /**
   * Validates and sanitizes a chat message
   * @param {string} message - The message to validate
   * @returns {string|null} - Sanitized message or null if invalid
   */
  static sanitizeChatMessage(message) {
    if (typeof message !== 'string') return null;
    
    // Remove HTML tags
    message = message.replace(/<[^>]*>/g, '');
    
    // Remove script tags even if obfuscated
    message = message.replace(/javascript:/gi, '');
    message = message.replace(/on\w+\s*=/gi, ''); // Remove event handlers
    
    // Trim whitespace
    message = message.trim();
    
    // Check length (1-500 characters)
    if (message.length < 1) return null;
    if (message.length > 500) message = message.substring(0, 500);
    
    return message;
  }
  
  /**
   * Validates and sanitizes a room name
   * @param {string} roomName - The room name to validate
   * @returns {string} - Sanitized room name
   */
  static sanitizeRoomName(roomName) {
    if (typeof roomName !== 'string') return 'Unnamed Room';
    
    // Remove HTML tags
    roomName = roomName.replace(/<[^>]*>/g, '');
    
    // Remove special characters except spaces, letters, numbers
    roomName = roomName.replace(/[^\w\s\-#]/g, '');
    
    // Trim and limit length
    roomName = roomName.trim().substring(0, 50);
    
    return roomName || 'Unnamed Room';
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // SAFE DOM MANIPULATION - Prevent innerHTML XSS
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Safely set text content (prevents XSS)
   * @param {HTMLElement} element - The element to update
   * @param {string} text - The text to set
   */
  static safeSetText(element, text) {
    if (!element) return;
    element.textContent = text || '';
  }
  
  /**
   * Creates a safe text node
   * @param {string} text - The text content
   * @returns {Text} - Text node
   */
  static createSafeTextNode(text) {
    return document.createTextNode(text || '');
  }
  
  /**
   * Safely append text to an element
   * @param {HTMLElement} parent - The parent element
   * @param {string} text - The text to append
   * @returns {Text} - The created text node
   */
  static appendSafeText(parent, text) {
    if (!parent) return null;
    const textNode = this.createSafeTextNode(text);
    parent.appendChild(textNode);
    return textNode;
  }
  
  /**
   * Creates a safe HTML element with text content
   * @param {string} tagName - The tag name (e.g., 'div', 'span')
   * @param {string} text - The text content
   * @param {Object} styles - Optional CSS styles
   * @returns {HTMLElement} - The created element
   */
  static createSafeElement(tagName, text = '', styles = {}) {
    const element = document.createElement(tagName);
    element.textContent = text;
    
    Object.entries(styles).forEach(([key, value]) => {
      element.style[key] = value;
    });
    
    return element;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CHAT MESSAGE CREATION - Secure chat rendering
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Creates a safe chat message element
   * @param {string} playerName - The player's name
   * @param {string} message - The chat message
   * @param {string} color - The player's color
   * @param {string} timestamp - Optional timestamp
   * @returns {HTMLElement} - Safe chat message element
   */
  static createSafeChatMessage(playerName, message, color = '#ffffff', timestamp = null) {
    // Sanitize all inputs
    playerName = this.sanitizeUsername(playerName);
    message = this.sanitizeChatMessage(message);
    
    if (!message) return null;
    
    // Create container
    const container = document.createElement('div');
    container.style.marginBottom = '8px';
    
    // Create timestamp
    if (timestamp) {
      const timeSpan = document.createElement('span');
      timeSpan.style.color = '#888';
      timeSpan.style.fontSize = '11px';
      timeSpan.textContent = `[${timestamp}] `;
      container.appendChild(timeSpan);
    }
    
    // Create player name
    const nameSpan = document.createElement('span');
    nameSpan.style.color = color;
    nameSpan.style.fontWeight = 'bold';
    nameSpan.textContent = `${playerName}: `;
    container.appendChild(nameSpan);
    
    // Create message
    const messageSpan = document.createElement('span');
    messageSpan.style.color = 'white';
    messageSpan.textContent = message;
    container.appendChild(messageSpan);
    
    return container;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PLAYER CARD CREATION - Secure player list rendering
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Creates a safe player list item element
   * @param {Object} player - Player data
   * @returns {HTMLElement} - Safe player card element
   */
  static createSafePlayerCard(player) {
    // Sanitize player name
    const safeName = this.sanitizeUsername(player.playerName || player.name);
    const healthPercent = Math.max(0, Math.min(100, player.health || 100));
    const isReady = player.ready || false;
    
    // Create container
    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(168,85,247,0.1));
      border: 1px solid rgba(124,58,237,0.3);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.style.cssText = `
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    `;
    avatar.textContent = '👤';
    card.appendChild(avatar);
    
    // Create info container
    const infoContainer = document.createElement('div');
    infoContainer.style.flex = '1';
    
    // Create name
    const nameDiv = document.createElement('div');
    nameDiv.style.color = 'white';
    nameDiv.style.fontWeight = 'bold';
    nameDiv.textContent = safeName;
    infoContainer.appendChild(nameDiv);
    
    // Create health bar container
    const healthBarBg = document.createElement('div');
    healthBarBg.style.cssText = `
      width: 100%;
      height: 4px;
      background: rgba(0,0,0,0.5);
      border-radius: 2px;
      margin-top: 5px;
      overflow: hidden;
    `;
    
    // Create health bar fill
    const healthBarFill = document.createElement('div');
    healthBarFill.style.cssText = `
      width: ${healthPercent}%;
      height: 100%;
      background: linear-gradient(90deg, #ff0000, #00ff00);
      transition: width 0.3s;
    `;
    healthBarBg.appendChild(healthBarFill);
    infoContainer.appendChild(healthBarBg);
    
    card.appendChild(infoContainer);
    
    // Add ready indicator if ready
    if (isReady) {
      const readyIndicator = document.createElement('div');
      readyIndicator.style.cssText = `
        color: #00ff00;
        font-weight: bold;
        font-size: 12px;
      `;
      readyIndicator.textContent = '✓ Ready';
      card.appendChild(readyIndicator);
    }
    
    return card;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // URL & DATA VALIDATION
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Validates a WebSocket URL
   * @param {string} url - The URL to validate
   * @returns {boolean} - True if valid
   */
  static isValidWebSocketURL(url) {
    if (typeof url !== 'string') return false;
    return /^wss?:\/\/.+/.test(url);
  }
  
  /**
   * Sanitizes a number input
   * @param {*} value - The value to sanitize
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} defaultValue - Default if invalid
   * @returns {number} - Safe number
   */
  static sanitizeNumber(value, min = 0, max = 100, defaultValue = 0) {
    const num = parseFloat(value);
    if (isNaN(num)) return defaultValue;
    return Math.max(min, Math.min(max, num));
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // RATE LIMITING - Prevent spam
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Creates a rate limiter
   * @param {number} maxCalls - Maximum calls allowed
   * @param {number} timeWindowMs - Time window in milliseconds
   * @returns {Object} - Rate limiter object
   */
  static createRateLimiter(maxCalls = 5, timeWindowMs = 1000) {
    const calls = [];
    
    return {
      isAllowed: function() {
        const now = Date.now();
        
        // Remove old calls outside time window
        while (calls.length > 0 && calls[0] < now - timeWindowMs) {
          calls.shift();
        }
        
        // Check if we're over the limit
        if (calls.length >= maxCalls) {
          return false;
        }
        
        // Add this call
        calls.push(now);
        return true;
      },
      reset: function() {
        calls.length = 0;
      },
      getRemaining: function() {
        const now = Date.now();
        
        // Remove old calls
        while (calls.length > 0 && calls[0] < now - timeWindowMs) {
          calls.shift();
        }
        
        return Math.max(0, maxCalls - calls.length);
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityUtils;
}
