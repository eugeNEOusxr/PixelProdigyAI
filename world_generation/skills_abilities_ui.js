/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    SKILLS & ABILITIES UI v1.0.0                       ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • Skill tree visualization                                          ║
 * ║  • Hotbar display with keybindings                                   ║
 * ║  • Cooldown animations                                               ║
 * ║  • Tooltip system                                                    ║
 * ║  • Drag-and-drop ability assignment                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class SkillsUI {
  constructor(abilityManager, containerId = 'skills-ui-container') {
    this.abilityManager = abilityManager;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      // Create container if it doesn't exist
      this.container = document.createElement('div');
      this.container.id = containerId;
      this.container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(20, 20, 30, 0.95);
        border: 3px solid #4080ff;
        border-radius: 12px;
        padding: 20px;
        width: 900px;
        max-height: 80vh;
        overflow-y: auto;
        display: none;
        z-index: 1000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.8);
      `;
      document.body.appendChild(this.container);
    }
    
    this.visible = false;
    this.selectedBranch = 'combat';
    
    this.initializeUI();
  }
  
  initializeUI() {
    this.container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #fff; margin: 0 0 10px 0;">⚡ Skills & Abilities ⚡</h2>
        <div style="color: #ffd700; font-size: 18px;">
          Skill Points: <span id="skill-points-display">0</span>
        </div>
      </div>
      
      <!-- Branch Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: center;">
        <button class="skill-branch-btn" data-branch="combat" style="background: #ff4444;">
          ⚔️ Combat
        </button>
        <button class="skill-branch-btn" data-branch="magic" style="background: #4444ff;">
          🔮 Magic
        </button>
        <button class="skill-branch-btn" data-branch="utility" style="background: #44ff44;">
          ⚙️ Utility
        </button>
      </div>
      
      <!-- Skill Tree Display -->
      <div id="skill-tree-display" style="min-height: 400px; margin-bottom: 20px;">
        <!-- Skills will be rendered here -->
      </div>
      
      <!-- Close Button -->
      <div style="text-align: center;">
        <button id="close-skills-ui" style="
          background: #666;
          color: #fff;
          border: none;
          padding: 10px 30px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
        ">Close (K)</button>
      </div>
    `;
    
    // Add event listeners
    this.container.querySelectorAll('.skill-branch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedBranch = e.target.dataset.branch;
        this.render();
      });
    });
    
    this.container.querySelector('#close-skills-ui').addEventListener('click', () => {
      this.hide();
    });
  }
  
  show() {
    this.container.style.display = 'block';
    this.visible = true;
    this.render();
  }
  
  hide() {
    this.container.style.display = 'none';
    this.visible = false;
  }
  
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  render() {
    // Update skill points display
    const pointsDisplay = this.container.querySelector('#skill-points-display');
    if (pointsDisplay) {
      pointsDisplay.textContent = this.abilityManager.skillTree.skillPoints;
    }
    
    // Highlight selected branch
    this.container.querySelectorAll('.skill-branch-btn').forEach(btn => {
      if (btn.dataset.branch === this.selectedBranch) {
        btn.style.border = '3px solid #ffd700';
        btn.style.transform = 'scale(1.1)';
      } else {
        btn.style.border = '2px solid #333';
        btn.style.transform = 'scale(1.0)';
      }
    });
    
    // Render skill tree
    this.renderSkillTree();
  }
  
  renderSkillTree() {
    const treeDisplay = this.container.querySelector('#skill-tree-display');
    if (!treeDisplay) return;
    
    const abilities = this.abilityManager.skillTree.getBranchAbilities(this.selectedBranch);
    
    let html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">';
    
    abilities.forEach(ability => {
      const canUnlock = this.abilityManager.skillTree.canUnlock(ability.id);
      const isMaxLevel = ability.level >= ability.maxLevel;
      
      // Determine button color
      let bgColor = '#333';
      let borderColor = '#666';
      if (ability.unlocked) {
        bgColor = '#228822';
        borderColor = '#44ff44';
      } else if (canUnlock) {
        bgColor = '#444488';
        borderColor = '#4080ff';
      }
      
      html += `
        <div class="skill-card" style="
          background: ${bgColor};
          border: 2px solid ${borderColor};
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        " data-ability-id="${ability.id}">
          <div style="font-size: 32px; text-align: center;">${ability.icon}</div>
          <div style="color: #fff; font-weight: bold; text-align: center; margin: 8px 0;">
            ${ability.name}
          </div>
          ${ability.unlocked ? `
            <div style="color: #ffd700; text-align: center; font-size: 12px;">
              Level ${ability.level}/${ability.maxLevel}
            </div>
          ` : `
            <div style="color: #aaa; text-align: center; font-size: 12px;">
              Locked
            </div>
          `}
          <div style="color: #ccc; font-size: 12px; margin-top: 8px;">
            ${ability.description}
          </div>
          <div style="color: #aaf; font-size: 11px; margin-top: 8px;">
            Cooldown: ${ability.cooldown}s
            ${ability.manaCost > 0 ? `<br>Mana: ${ability.manaCost}` : ''}
            ${ability.damage > 0 ? `<br>Damage: ${ability.damage}` : ''}
            ${ability.healing > 0 ? `<br>Healing: ${ability.healing}` : ''}
          </div>
          ${ability.prerequisite ? `
            <div style="color: #ff8800; font-size: 10px; margin-top: 4px;">
              Requires: ${this.abilityManager.skillTree.getAbility(ability.prerequisite).name}
            </div>
          ` : ''}
          <div style="margin-top: 8px; text-align: center;">
            ${!ability.unlocked && canUnlock ? `
              <button class="unlock-btn" data-ability-id="${ability.id}" style="
                background: #4080ff;
                color: #fff;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Unlock (${ability.requiredSkillPoints} SP)</button>
            ` : ''}
            ${ability.unlocked && !isMaxLevel ? `
              <button class="upgrade-btn" data-ability-id="${ability.id}" style="
                background: #ffd700;
                color: #000;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              ">Upgrade (1 SP)</button>
            ` : ''}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    treeDisplay.innerHTML = html;
    
    // Add hover effects
    treeDisplay.querySelectorAll('.skill-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1.0)';
      });
    });
    
    // Add unlock button listeners
    treeDisplay.querySelectorAll('.unlock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const abilityId = e.target.dataset.abilityId;
        if (this.abilityManager.skillTree.unlockAbility(abilityId)) {
          this.render();
        }
      });
    });
    
    // Add upgrade button listeners
    treeDisplay.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const abilityId = e.target.dataset.abilityId;
        if (this.abilityManager.skillTree.upgradeAbility(abilityId)) {
          this.render();
        }
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// HOTBAR UI
// ═══════════════════════════════════════════════════════════════════════

class HotbarUI {
  constructor(abilityManager, containerId = 'hotbar-ui-container') {
    this.abilityManager = abilityManager;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      // Create container if it doesn't exist
      this.container = document.createElement('div');
      this.container.id = containerId;
      this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 999;
      `;
      document.body.appendChild(this.container);
    }
    
    this.initializeUI();
  }
  
  initializeUI() {
    // Create 9 hotbar slots
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';
      slot.dataset.slot = i;
      slot.style.cssText = `
        width: 60px;
        height: 60px;
        background: rgba(20, 20, 30, 0.9);
        border: 2px solid #4080ff;
        border-radius: 8px;
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      `;
      
      // Key number
      const keyLabel = document.createElement('div');
      keyLabel.textContent = i + 1;
      keyLabel.style.cssText = `
        position: absolute;
        top: 2px;
        right: 4px;
        font-size: 10px;
        color: #fff;
        background: rgba(0,0,0,0.5);
        padding: 2px 4px;
        border-radius: 3px;
      `;
      slot.appendChild(keyLabel);
      
      // Ability icon container
      const iconContainer = document.createElement('div');
      iconContainer.className = 'hotbar-icon';
      iconContainer.style.cssText = 'font-size: 32px;';
      slot.appendChild(iconContainer);
      
      // Cooldown overlay
      const cooldownOverlay = document.createElement('div');
      cooldownOverlay.className = 'hotbar-cooldown';
      cooldownOverlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        height: 0%;
        transition: height 0.1s linear;
        border-radius: 6px;
      `;
      slot.appendChild(cooldownOverlay);
      
      // Cooldown text
      const cooldownText = document.createElement('div');
      cooldownText.className = 'hotbar-cooldown-text';
      cooldownText.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 2px 2px 4px #000;
        display: none;
      `;
      slot.appendChild(cooldownText);
      
      // Click handler
      slot.addEventListener('click', () => {
        this.abilityManager.useHotbarSlot(i);
      });
      
      // Drag and drop support
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.style.background = 'rgba(64, 128, 255, 0.3)';
      });
      
      slot.addEventListener('dragleave', () => {
        slot.style.background = 'rgba(20, 20, 30, 0.9)';
      });
      
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        const abilityId = e.dataTransfer.getData('abilityId');
        if (abilityId) {
          this.abilityManager.hotbar.setSlot(i, abilityId);
          this.update();
        }
        slot.style.background = 'rgba(20, 20, 30, 0.9)';
      });
      
      this.container.appendChild(slot);
    }
  }
  
  update() {
    const hotbarState = this.abilityManager.getHotbarState();
    
    hotbarState.forEach((state, index) => {
      const slot = this.container.querySelector(`[data-slot="${index}"]`);
      if (!slot) return;
      
      const iconContainer = slot.querySelector('.hotbar-icon');
      const cooldownOverlay = slot.querySelector('.hotbar-cooldown');
      const cooldownText = slot.querySelector('.hotbar-cooldown-text');
      
      if (state.empty) {
        iconContainer.textContent = '';
        cooldownOverlay.style.height = '0%';
        cooldownText.style.display = 'none';
        slot.style.opacity = '0.5';
      } else {
        iconContainer.textContent = state.icon;
        slot.style.opacity = '1.0';
        
        // Update cooldown display
        if (state.currentCooldown > 0) {
          const percent = state.cooldownPercent;
          cooldownOverlay.style.height = `${percent}%`;
          cooldownText.style.display = 'block';
          cooldownText.textContent = Math.ceil(state.currentCooldown);
          slot.style.opacity = '0.6';
        } else {
          cooldownOverlay.style.height = '0%';
          cooldownText.style.display = 'none';
          
          // Check if can activate (enough mana)
          if (state.canActivate) {
            slot.style.border = '2px solid #44ff44';
          } else {
            slot.style.border = '2px solid #ff4444';
            slot.style.opacity = '0.7';
          }
        }
      }
    });
  }
  
  // Highlight slot briefly (for activation feedback)
  highlightSlot(slotIndex) {
    const slot = this.container.querySelector(`[data-slot="${slotIndex}"]`);
    if (!slot) return;
    
    slot.style.background = 'rgba(255, 255, 100, 0.5)';
    slot.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
      slot.style.background = 'rgba(20, 20, 30, 0.9)';
      slot.style.transform = 'scale(1.0)';
    }, 200);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SkillsUI, HotbarUI };
}
