/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                  LOADING SCREEN SYSTEM v1.0.0                         ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Beautiful loading screens with progress tracking and animations      ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class LoadingScreen {
  constructor() {
    this.overlay = null;
    this.progressBar = null;
    this.progressText = null;
    this.statusText = null;
    this.progress = 0;
    this.isVisible = true;
    
    this.createUI();
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UI CREATION
  // ═══════════════════════════════════════════════════════════════════════
  
  createUI() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'loading-screen';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: 'Courier New', monospace;
      transition: opacity 1s ease-out;
    `;
    
    // Create logo/title
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 48px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 40px;
      text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
      animation: pulse 2s ease-in-out infinite;
    `;
    title.textContent = '🎮 PIXELPRODIGY';
    
    // Create subtitle
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      font-size: 18px;
      color: #a0a0a0;
      margin-bottom: 60px;
      letter-spacing: 3px;
    `;
    subtitle.textContent = 'LOADING YOUR ADVENTURE...';
    
    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      width: 400px;
      max-width: 80%;
    `;
    
    // Create progress bar background
    const progressBg = document.createElement('div');
    progressBg.style.cssText = `
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
    `;
    
    // Create progress bar fill
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      transition: width 0.3s ease-out;
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
    `;
    
    // Create progress text
    this.progressText = document.createElement('div');
    this.progressText.style.cssText = `
      color: white;
      font-size: 24px;
      margin-top: 20px;
      text-align: center;
      font-weight: bold;
    `;
    this.progressText.textContent = '0%';
    
    // Create status text
    this.statusText = document.createElement('div');
    this.statusText.style.cssText = `
      color: #888;
      font-size: 14px;
      margin-top: 10px;
      text-align: center;
      min-height: 20px;
    `;
    this.statusText.textContent = 'Initializing...';
    
    // Create spinning loader
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 60px;
      height: 60px;
      border: 4px solid rgba(102, 126, 234, 0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-top: 40px;
    `;
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    // Assemble UI
    progressBg.appendChild(this.progressBar);
    progressContainer.appendChild(progressBg);
    progressContainer.appendChild(this.progressText);
    progressContainer.appendChild(this.statusText);
    
    this.overlay.appendChild(title);
    this.overlay.appendChild(subtitle);
    this.overlay.appendChild(progressContainer);
    this.overlay.appendChild(spinner);
    
    document.body.appendChild(this.overlay);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PROGRESS CONTROL
  // ═══════════════════════════════════════════════════════════════════════
  
  setProgress(progress, status = '') {
    this.progress = Math.min(100, Math.max(0, progress));
    
    if (this.progressBar) {
      this.progressBar.style.width = this.progress + '%';
    }
    
    if (this.progressText) {
      this.progressText.textContent = Math.round(this.progress) + '%';
    }
    
    if (status && this.statusText) {
      this.statusText.textContent = status;
    }
  }
  
  updateStatus(status) {
    if (this.statusText) {
      this.statusText.textContent = status;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VISIBILITY CONTROL
  // ═══════════════════════════════════════════════════════════════════════
  
  hide() {
    if (!this.overlay) return;
    
    this.overlay.style.opacity = '0';
    
    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      this.isVisible = false;
    }, 1000); // Wait for fade out
  }
  
  show() {
    if (this.overlay && !this.overlay.parentNode) {
      document.body.appendChild(this.overlay);
      this.overlay.style.opacity = '1';
      this.isVisible = true;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingScreen;
}
