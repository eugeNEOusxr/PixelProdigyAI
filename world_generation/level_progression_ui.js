/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    LEVEL PROGRESSION UI v1.0.0                        ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Beautiful progression interface with:                                ║
 * ║  • XP bar with percentage                                            ║
 * ║  • Level-up celebration animation                                    ║
 * ║  • Stat comparison (old vs new)                                      ║
 * ║  • Skill points notification                                         ║
 * ║  • Character sheet with all stats                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class LevelProgressionUI {
  constructor(progressionController) {
    this.controller = progressionController;
    
    // UI elements
    this.xpBarContainer = null;
    this.levelUpModal = null;
    this.characterSheetModal = null;
    this.floatingXPText = [];
    
    this.createUI();
    this.setupEventListeners();
  }
  
  createUI() {
    // ═══════════════════════════════════════════════════════════════════
    // XP BAR (Always visible at top of screen)
    // ═══════════════════════════════════════════════════════════════════
    
    this.xpBarContainer = document.createElement('div');
    this.xpBarContainer.id = 'xp-bar-container';
    this.xpBarContainer.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      background: rgba(0,0,0,0.8);
      border: 2px solid #ffd700;
      border-radius: 20px;
      padding: 8px 15px;
      z-index: 900;
      font-family: 'Courier New', monospace;
      box-shadow: 0 4px 20px rgba(255,215,0,0.4);
    `;
    
    this.xpBarContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="color: #ffd700; font-size: 14px; font-weight: bold;">
          ⭐ Level <span id="current-level">1</span> <span id="current-title" style="color: #aaa;">Novice</span>
        </span>
        <span style="color: #00ff00; font-size: 14px;">
          <span id="skill-points-display">0</span> SP
        </span>
      </div>
      
      <div style="
        width: 100%;
        height: 18px;
        background: #1a1a1a;
        border: 2px solid #8b4513;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      ">
        <div id="xp-bar-fill" style="
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #ff4500, #ffd700, #00ff00);
          transition: width 0.5s ease-out;
          box-shadow: 0 0 10px rgba(255,215,0,0.6);
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 11px;
          font-weight: bold;
          text-shadow: 1px 1px 2px black;
        " id="xp-bar-text">0 / 100 (0%)</div>
      </div>
    `;
    
    document.body.appendChild(this.xpBarContainer);
    
    // ═══════════════════════════════════════════════════════════════════
    // LEVEL UP MODAL (Shows on level up)
    // ═══════════════════════════════════════════════════════════════════
    
    this.levelUpModal = document.createElement('div');
    this.levelUpModal.id = 'levelup-modal';
    this.levelUpModal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 500px;
      background: linear-gradient(135deg, #1a0f08 0%, #3d2817 100%);
      border: 5px solid #ffd700;
      border-radius: 20px;
      padding: 30px;
      z-index: 2000;
      font-family: 'Courier New', monospace;
      box-shadow: 0 0 50px rgba(255,215,0,0.8);
      display: none;
      transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    
    this.levelUpModal.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 72px; animation: bounce 0.5s infinite alternate;">
          🎉
        </div>
        <h1 style="
          color: #ffd700;
          font-size: 42px;
          margin: 10px 0;
          text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
        ">LEVEL UP!</h1>
      </div>
      
      <div id="levelup-content"></div>
      
      <button id="levelup-close" style="
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #ff9500, #ffd700);
        border: 3px solid #ffd700;
        border-radius: 10px;
        color: #000;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.3s;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
      ">CONTINUE</button>
      
      <style>
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-20px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
    `;
    
    document.body.appendChild(this.levelUpModal);
    
    // ═══════════════════════════════════════════════════════════════════
    // CHARACTER SHEET (Press P to open)
    // ═══════════════════════════════════════════════════════════════════
    
    this.characterSheetModal = document.createElement('div');
    this.characterSheetModal.id = 'character-sheet';
    this.characterSheetModal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      height: 600px;
      background: linear-gradient(135deg, #1a0f08 0%, #2c1810 100%);
      border: 4px solid #d4af37;
      border-radius: 15px;
      padding: 20px;
      z-index: 1500;
      font-family: 'Courier New', monospace;
      display: none;
      overflow-y: auto;
    `;
    
    this.characterSheetModal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #ffd700; margin: 0;">📊 Character Sheet</h2>
        <button id="character-sheet-close" style="
          background: #8b0000;
          border: 2px solid #ff0000;
          color: white;
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">✕</button>
      </div>
      
      <div id="character-sheet-content"></div>
    `;
    
    document.body.appendChild(this.characterSheetModal);
    
    console.log('⭐ Level Progression UI created');
  }
  
  setupEventListeners() {
    // Level up modal close
    document.getElementById('levelup-close').onclick = () => this.closeLevelUpModal();
    
    // Character sheet close
    document.getElementById('character-sheet-close').onclick = () => this.closeCharacterSheet();
    
    // Controller event hooks
    this.controller.onLevelUp = (info) => this.showLevelUpModal(info);
    this.controller.onXPGain = (xp, source) => this.showFloatingXP(xp, source);
  }
  
  // Update XP bar
  updateXPBar() {
    const progress = this.controller.playerStats.getXPProgress();
    const stats = this.controller.playerStats.getStats();
    
    // Update level and title
    document.getElementById('current-level').textContent = stats.level;
    document.getElementById('current-title').textContent = stats.title;
    document.getElementById('skill-points-display').textContent = stats.skillPoints;
    
    // Update XP bar
    const percentage = Math.min(100, progress.percentage);
    document.getElementById('xp-bar-fill').style.width = `${percentage}%`;
    document.getElementById('xp-bar-text').textContent = 
      `${progress.current} / ${progress.needed} (${Math.floor(percentage)}%)`;
  }
  
  // Show level up modal
  showLevelUpModal(info) {
    const stats = info.stats;
    const oldLevel = stats.level - 1;
    
    // Build content
    let content = `
      <div style="
        background: rgba(0,0,0,0.3);
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
      ">
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          font-size: 36px;
          color: #ffd700;
          margin-bottom: 15px;
        ">
          <span>${oldLevel}</span>
          <span>→</span>
          <span>${stats.level}</span>
        </div>
        
        <div style="text-align: center; color: #aaa; font-size: 18px; margin-bottom: 15px;">
          ${stats.title}
        </div>
        
        <div style="color: #00ff00; text-align: center; font-size: 20px; margin-bottom: 10px;">
          +${stats.skillPoints} Skill Points!
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
        <h3 style="color: #ffd700; margin-top: 0;">New Stats:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: white;">
          <div>❤️ Health: <span style="color: #00ff00;">${stats.stats.maxHealth}</span></div>
          <div>💙 Mana: <span style="color: #00ff00;">${stats.stats.maxMana}</span></div>
          <div>⚡ Stamina: <span style="color: #00ff00;">${stats.stats.maxStamina}</span></div>
          <div>⚔️ Damage: <span style="color: #00ff00;">${stats.stats.baseDamage}</span></div>
          <div>🛡️ Defense: <span style="color: #00ff00;">${stats.stats.baseDefense}</span></div>
          <div>💥 Crit: <span style="color: #00ff00;">${stats.stats.critChance}%</span></div>
        </div>
      </div>
    `;
    
    document.getElementById('levelup-content').innerHTML = content;
    
    // Show modal with animation
    this.levelUpModal.style.display = 'block';
    setTimeout(() => {
      this.levelUpModal.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    
    // Play sound effect (if audio system available)
    if (typeof audioSystem !== 'undefined' && audioSystem.initialized) {
      // audioSystem.playLevelUp();
    }
  }
  
  closeLevelUpModal() {
    this.levelUpModal.style.transform = 'translate(-50%, -50%) scale(0)';
    setTimeout(() => {
      this.levelUpModal.style.display = 'none';
    }, 300);
  }
  
  // Show floating XP text
  showFloatingXP(xp, source) {
    const text = document.createElement('div');
    text.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      color: #00ff00;
      font-size: 18px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1000;
      pointer-events: none;
      animation: floatUp 2s forwards;
    `;
    text.textContent = `+${xp} XP`;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateX(-50%) translateY(-50px);
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(text);
    
    // Remove after animation
    setTimeout(() => {
      text.remove();
      style.remove();
    }, 2000);
  }
  
  // Show character sheet
  showCharacterSheet() {
    const info = this.controller.getPlayerInfo();
    const stats = info.stats;
    const xpStats = info.xpStats;
    
    const content = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Left Column -->
        <div>
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <h3 style="color: #ffd700; margin-top: 0;">Character Info</h3>
            <div style="color: white; line-height: 1.8;">
              <div>⭐ Level: <span style="color: #ffd700;">${stats.level}</span></div>
              <div>👑 Title: <span style="color: #ffd700;">${stats.title}</span></div>
              <div>✨ Skill Points: <span style="color: #00ff00;">${stats.skillPoints}</span></div>
              <div>📊 Total SP: <span style="color: #aaa;">${stats.totalSkillPoints}</span></div>
              ${stats.prestigeLevel > 0 ? `<div>🌟 Prestige: <span style="color: #ff00ff;">${stats.prestigeLevel}</span></div>` : ''}
            </div>
          </div>
          
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
            <h3 style="color: #ffd700; margin-top: 0;">Experience</h3>
            <div style="color: white; line-height: 1.8;">
              <div>Current: <span style="color: #00ff00;">${stats.xp.current}</span></div>
              <div>Needed: <span style="color: #aaa;">${stats.xp.needed}</span></div>
              <div>Progress: <span style="color: #ffd700;">${Math.floor(stats.xp.percentage)}%</span></div>
              <div>Total: <span style="color: #aaa;">${xpStats.totalEarned.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
        
        <!-- Right Column -->
        <div>
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <h3 style="color: #ffd700; margin-top: 0;">Combat Stats</h3>
            <div style="color: white; line-height: 1.8;">
              <div>❤️ Health: <span style="color: #ff0000;">${stats.health} / ${stats.stats.maxHealth}</span></div>
              <div>💙 Mana: <span style="color: #00bfff;">${stats.mana} / ${stats.stats.maxMana}</span></div>
              <div>⚡ Stamina: <span style="color: #ffff00;">${stats.stamina} / ${stats.stats.maxStamina}</span></div>
              <div>⚔️ Damage: <span style="color: #ff4500;">${stats.stats.baseDamage}</span></div>
              <div>🛡️ Defense: <span style="color: #4169e1;">${stats.stats.baseDefense}</span></div>
              <div>💥 Crit: <span style="color: #ffd700;">${stats.stats.critChance.toFixed(1)}%</span></div>
              <div>🏃 Speed: <span style="color: #00ff00;">${stats.stats.moveSpeed.toFixed(2)}x</span></div>
            </div>
          </div>
          
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
            <h3 style="color: #ffd700; margin-top: 0;">XP Sources</h3>
            <div style="color: white; line-height: 1.8; font-size: 13px;">
              <div>⚔️ Combat: <span style="color: #aaa;">${xpStats.bySource.combat.toLocaleString()}</span></div>
              <div>🔨 Crafting: <span style="color: #aaa;">${xpStats.bySource.crafting.toLocaleString()}</span></div>
              <div>📜 Quests: <span style="color: #aaa;">${xpStats.bySource.quests.toLocaleString()}</span></div>
              <div>🗺️ Exploration: <span style="color: #aaa;">${xpStats.bySource.exploration.toLocaleString()}</span></div>
              <div>❓ Other: <span style="color: #aaa;">${xpStats.bySource.other.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-top: 15px;">
        <h3 style="color: #ffd700; margin-top: 0;">Unlocked Titles</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${stats.unlockedTitles.map(title => `
            <span style="
              background: rgba(212,175,55,0.2);
              border: 2px solid #d4af37;
              padding: 5px 12px;
              border-radius: 15px;
              color: ${title === stats.title ? '#ffd700' : '#aaa'};
              font-size: 13px;
            ">${title}</span>
          `).join('')}
        </div>
      </div>
    `;
    
    document.getElementById('character-sheet-content').innerHTML = content;
    this.characterSheetModal.style.display = 'block';
  }
  
  closeCharacterSheet() {
    this.characterSheetModal.style.display = 'none';
  }
  
  toggleCharacterSheet() {
    if (this.characterSheetModal.style.display === 'none') {
      this.showCharacterSheet();
    } else {
      this.closeCharacterSheet();
    }
  }
  
  // Update (call in game loop)
  update() {
    this.updateXPBar();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LevelProgressionUI };
}
