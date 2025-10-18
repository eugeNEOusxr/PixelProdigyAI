/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║              AI WORLD GENERATION UI v1.0.0                            ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Beautiful interface for text-to-world generation                     ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class AIWorldGeneratorUI {
  constructor(worldGenerator) {
    this.generator = worldGenerator;
    this.modal = null;
    this.isOpen = false;
    
    this.createUI();
    this.setupEventListeners();
  }
  
  createUI() {
    // ═══════════════════════════════════════════════════════════════════
    // MAIN MODAL
    // ═══════════════════════════════════════════════════════════════════
    
    this.modal = document.createElement('div');
    this.modal.id = 'ai-world-generator-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-height: 700px;
      background: linear-gradient(135deg, #1a0f2e 0%, #2d1b3d 100%);
      border: 3px solid #9c27b0;
      border-radius: 20px;
      padding: 30px;
      z-index: 2500;
      font-family: 'Courier New', monospace;
      box-shadow: 0 0 50px rgba(156,39,176,0.8);
      display: none;
      overflow-y: auto;
    `;
    
    this.modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="font-size: 64px; margin-bottom: 10px;">🌍✨</div>
        <h1 style="
          color: #9c27b0;
          font-size: 32px;
          margin: 10px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        ">AI World Generator</h1>
        <p style="color: #aaa; font-size: 14px;">Describe your world in natural language</p>
      </div>
      
      <!-- API Key Section -->
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <span style="color: #9c27b0; font-size: 18px;">🔑</span>
          <label style="color: white; font-weight: bold;">Google Gemini API Key (Optional)</label>
        </div>
        <input 
          type="password" 
          id="gemini-api-key" 
          placeholder="Enter your Gemini API key for AI-powered generation..."
          style="
            width: 100%;
            padding: 10px;
            background: rgba(0,0,0,0.5);
            border: 2px solid #9c27b0;
            border-radius: 8px;
            color: white;
            font-family: monospace;
            font-size: 13px;
          "
        />
        <div style="color: #888; font-size: 11px; margin-top: 8px;">
          💡 Without API key: Uses pattern matching. With key: Full AI parsing.
          <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color: #9c27b0; text-decoration: none;">Get API Key →</a>
        </div>
      </div>
      
      <!-- World Description Input -->
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <span style="color: #9c27b0; font-size: 18px;">📝</span>
          <label style="color: white; font-weight: bold;">World Description</label>
        </div>
        <textarea 
          id="world-description" 
          placeholder="Example: A mystical forest at dawn with ancient ruins and glowing crystals..."
          style="
            width: 100%;
            height: 120px;
            padding: 12px;
            background: rgba(0,0,0,0.5);
            border: 2px solid #9c27b0;
            border-radius: 8px;
            color: white;
            font-family: monospace;
            font-size: 14px;
            resize: vertical;
          "
        ></textarea>
      </div>
      
      <!-- Quick Templates -->
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <div style="color: white; font-weight: bold; margin-bottom: 10px;">⚡ Quick Templates:</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button class="world-template" data-template="peaceful_plains" style="
            padding: 8px;
            background: rgba(124,186,61,0.3);
            border: 2px solid #7cba3d;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
          ">🌾 Peaceful Plains</button>
          
          <button class="world-template" data-template="dark_forest" style="
            padding: 8px;
            background: rgba(45,80,22,0.3);
            border: 2px solid #2d5016;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
          ">🌲 Dark Forest</button>
          
          <button class="world-template" data-template="desert_ruins" style="
            padding: 8px;
            background: rgba(212,165,116,0.3);
            border: 2px solid #d4a574;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
          ">🏜️ Desert Ruins</button>
          
          <button class="world-template" data-template="mountain_peaks" style="
            padding: 8px;
            background: rgba(139,115,85,0.3);
            border: 2px solid #8b7355;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
          ">⛰️ Mountain Peaks</button>
          
          <button class="world-template" data-template="volcanic_wasteland" style="
            padding: 8px;
            background: rgba(61,29,29,0.3);
            border: 2px solid #3d1d1d;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
          ">🌋 Volcanic Wasteland</button>
          
          <button class="world-template" data-template="crystal_caverns" style="
            padding: 8px;
            background: rgba(156,39,176,0.3);
            border: 2px solid #9c27b0;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s;
          ">💎 Crystal Caverns</button>
        </div>
      </div>
      
      <!-- Progress Section -->
      <div id="generation-progress" style="display: none; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <div style="color: #9c27b0; font-weight: bold; margin-bottom: 10px; text-align: center;">
          <span id="progress-text">Generating world...</span>
        </div>
        <div style="
          width: 100%;
          height: 20px;
          background: rgba(0,0,0,0.5);
          border: 2px solid #9c27b0;
          border-radius: 10px;
          overflow: hidden;
        ">
          <div id="progress-bar" style="
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #9c27b0, #e91e63);
            transition: width 0.5s;
          "></div>
        </div>
        <div style="color: #888; font-size: 12px; margin-top: 8px; text-align: center;" id="progress-detail">
          Initializing...
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px;">
        <button id="generate-world-btn" style="
          flex: 1;
          padding: 15px;
          background: linear-gradient(135deg, #9c27b0, #e91e63);
          border: 3px solid #9c27b0;
          border-radius: 10px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        ">🚀 Generate World</button>
        
        <button id="clear-world-btn" style="
          padding: 15px 20px;
          background: rgba(255,0,0,0.3);
          border: 3px solid #ff0000;
          border-radius: 10px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        ">🧹</button>
        
        <button id="close-generator-btn" style="
          padding: 15px 20px;
          background: rgba(128,128,128,0.3);
          border: 3px solid #808080;
          border-radius: 10px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        ">✕</button>
      </div>
      
      <style>
        #ai-world-generator-modal button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(156,39,176,0.6);
        }
        
        .world-template:hover {
          transform: scale(1.05);
        }
        
        #ai-world-generator-modal::-webkit-scrollbar {
          width: 8px;
        }
        
        #ai-world-generator-modal::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
        }
        
        #ai-world-generator-modal::-webkit-scrollbar-thumb {
          background: #9c27b0;
          border-radius: 10px;
        }
      </style>
    `;
    
    document.body.appendChild(this.modal);
    
    console.log('🎨 AI World Generator UI created');
  }
  
  setupEventListeners() {
    // Close button
    document.getElementById('close-generator-btn').onclick = () => this.close();
    
    // Generate button
    document.getElementById('generate-world-btn').onclick = () => this.handleGenerate();
    
    // Clear button
    document.getElementById('clear-world-btn').onclick = () => this.handleClear();
    
    // API key input
    document.getElementById('gemini-api-key').onchange = (e) => {
      this.generator.setApiKey(e.target.value || null);
    };
    
    // Template buttons
    const templates = {
      peaceful_plains: "A peaceful grassland at noon with rolling hills, wildflowers, and scattered farms",
      dark_forest: "A mysterious dark forest at dusk with ancient trees, fog, and hidden ruins",
      desert_ruins: "An ancient desert with massive pyramids, sandstorms, and buried treasures",
      mountain_peaks: "Snow-capped mountains at dawn with icy peaks, frozen lakes, and caves",
      volcanic_wasteland: "A dangerous volcanic wasteland with flowing lava, ash clouds, and obsidian structures",
      crystal_caverns: "A magical underground cavern filled with glowing crystals and mystical energy"
    };
    
    document.querySelectorAll('.world-template').forEach(btn => {
      btn.onclick = () => {
        const template = btn.dataset.template;
        document.getElementById('world-description').value = templates[template];
      };
    });
  }
  
  async handleGenerate() {
    const description = document.getElementById('world-description').value.trim();
    
    if (!description) {
      alert('⚠️ Please enter a world description');
      return;
    }
    
    // Show progress
    this.showProgress();
    
    try {
      // Step 1: Parse
      this.updateProgress(20, 'Parsing description...', 'Analyzing your world...');
      await this.delay(500);
      
      // Step 2: Terrain
      this.updateProgress(40, 'Generating terrain...', 'Creating landscape...');
      await this.delay(500);
      
      // Start actual generation
      const result = await this.generator.generateWorld(description);
      
      if (result) {
        this.updateProgress(100, 'Complete!', 'World generated successfully!');
        await this.delay(1000);
        this.hideProgress();
        
        // Show success message
        alert('✅ World generated successfully! Explore your creation!');
      } else {
        this.hideProgress();
        alert('❌ World generation failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Generation error:', error);
      this.hideProgress();
      alert(`❌ Error: ${error.message}`);
    }
  }
  
  handleClear() {
    if (confirm('🧹 Clear the current world?')) {
      this.generator.clearWorld();
      document.getElementById('world-description').value = '';
    }
  }
  
  showProgress() {
    document.getElementById('generation-progress').style.display = 'block';
    document.getElementById('generate-world-btn').disabled = true;
    document.getElementById('generate-world-btn').style.opacity = '0.5';
  }
  
  hideProgress() {
    document.getElementById('generation-progress').style.display = 'none';
    document.getElementById('generate-world-btn').disabled = false;
    document.getElementById('generate-world-btn').style.opacity = '1';
    this.updateProgress(0, '', '');
  }
  
  updateProgress(percent, text, detail) {
    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.getElementById('progress-text').textContent = text;
    document.getElementById('progress-detail').textContent = detail;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.modal.style.display = 'block';
    this.isOpen = true;
  }
  
  close() {
    this.modal.style.display = 'none';
    this.isOpen = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIWorldGeneratorUI };
}
