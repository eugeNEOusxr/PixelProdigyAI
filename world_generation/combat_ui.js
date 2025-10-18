// world_generation/combat_ui.js
// Combat UI: Health bars, stamina bars, damage numbers, combat log

/**
 * CombatUI - Visual display for health, stamina, mana, and combat feedback
 */
class CombatUI {
  constructor(combatStats) {
    this.combatStats = combatStats;
    this.damageNumbers = [];
    this.combatLog = [];
    this.maxLogEntries = 5;
    
    this.createUI();
    this.setupEventListeners();
  }

  createUI() {
    // Main combat HUD container
    this.container = document.createElement('div');
    this.container.id = 'combatHUD';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      z-index: 100;
      font-family: 'Segoe UI', Arial, sans-serif;
    `;

    // Health bar
    this.healthBar = this.createBar('Health', '#e53e3e', '#c53030');
    this.container.appendChild(this.healthBar.container);

    // Stamina bar
    this.staminaBar = this.createBar('Stamina', '#48bb78', '#38a169');
    this.container.appendChild(this.staminaBar.container);

    // Mana bar
    this.manaBar = this.createBar('Mana', '#4299e1', '#3182ce');
    this.container.appendChild(this.manaBar.container);

    // Combat log
    this.logContainer = document.createElement('div');
    this.logContainer.style.cssText = `
      position: fixed;
      top: 120px;
      right: 20px;
      width: 300px;
      max-height: 150px;
      overflow: hidden;
      font-size: 13px;
      color: #fff;
      pointer-events: none;
    `;
    document.body.appendChild(this.logContainer);

    // Damage numbers container
    this.damageContainer = document.createElement('div');
    this.damageContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999;
    `;
    document.body.appendChild(this.damageContainer);

    document.body.appendChild(this.container);
    
    this.update();
  }

  createBar(label, color, darkColor) {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 8px;
      background: rgba(20, 20, 30, 0.8);
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;

    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #cbd5e0;
      margin-bottom: 4px;
      font-weight: 600;
    `;
    
    const labelText = document.createElement('span');
    labelText.textContent = label;
    
    const valueText = document.createElement('span');
    valueText.className = 'value-text';
    
    labelDiv.appendChild(labelText);
    labelDiv.appendChild(valueText);
    container.appendChild(labelDiv);

    const barBg = document.createElement('div');
    barBg.style.cssText = `
      width: 100%;
      height: 20px;
      background: ${darkColor};
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    `;

    const barFill = document.createElement('div');
    barFill.className = 'bar-fill';
    barFill.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, ${darkColor} 0%, ${color} 100%);
      transition: width 0.3s ease;
      border-radius: 10px;
      width: 100%;
    `;

    barBg.appendChild(barFill);
    container.appendChild(barBg);

    return {
      container,
      valueText,
      barFill
    };
  }

  update() {
    // Update health bar
    const healthPercent = this.combatStats.getHealthPercent();
    this.healthBar.barFill.style.width = healthPercent + '%';
    this.healthBar.valueText.textContent = 
      `${Math.ceil(this.combatStats.health)}/${this.combatStats.maxHealth}`;

    // Update stamina bar
    const staminaPercent = this.combatStats.getStaminaPercent();
    this.staminaBar.barFill.style.width = staminaPercent + '%';
    this.staminaBar.valueText.textContent = 
      `${Math.ceil(this.combatStats.stamina)}/${this.combatStats.maxStamina}`;

    // Update mana bar
    const manaPercent = this.combatStats.getManaPercent();
    this.manaBar.barFill.style.width = manaPercent + '%';
    this.manaBar.valueText.textContent = 
      `${Math.ceil(this.combatStats.mana)}/${this.combatStats.maxMana}`;

    // Update damage numbers
    this.updateDamageNumbers();
  }

  showDamageNumber(amount, position, isCrit = false, isHeal = false) {
    const damageNum = document.createElement('div');
    damageNum.style.cssText = `
      position: absolute;
      font-size: ${isCrit ? '28px' : '20px'};
      font-weight: bold;
      color: ${isHeal ? '#48bb78' : (isCrit ? '#ffd700' : '#ff4444')};
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      pointer-events: none;
      transition: all 0.8s ease-out;
      opacity: 1;
      z-index: 1000;
    `;
    
    const text = isHeal ? `+${Math.ceil(amount)}` : `-${Math.ceil(amount)}`;
    damageNum.textContent = isCrit ? `${text}!` : text;
    
    // Convert 3D position to screen position
    if (position.x !== undefined) {
      damageNum.style.left = `${window.innerWidth / 2}px`;
      damageNum.style.top = `${window.innerHeight / 2}px`;
    }

    this.damageContainer.appendChild(damageNum);

    // Animate
    const startX = parseFloat(damageNum.style.left);
    const startY = parseFloat(damageNum.style.top);
    const randomX = (Math.random() - 0.5) * 100;
    const randomY = -50 - Math.random() * 50;

    this.damageNumbers.push({
      element: damageNum,
      startTime: performance.now(),
      duration: 800,
      startX,
      startY,
      offsetX: randomX,
      offsetY: randomY
    });
  }

  updateDamageNumbers() {
    const now = performance.now();
    
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dmg = this.damageNumbers[i];
      const elapsed = now - dmg.startTime;
      const progress = Math.min(1, elapsed / dmg.duration);
      
      if (progress >= 1) {
        dmg.element.remove();
        this.damageNumbers.splice(i, 1);
        continue;
      }

      // Easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      dmg.element.style.left = (dmg.startX + dmg.offsetX * easeOut) + 'px';
      dmg.element.style.top = (dmg.startY + dmg.offsetY * easeOut) + 'px';
      dmg.element.style.opacity = 1 - progress;
    }
  }

  addCombatLog(message, color = '#fff') {
    const entry = document.createElement('div');
    entry.style.cssText = `
      background: rgba(20, 20, 30, 0.9);
      padding: 6px 10px;
      margin-bottom: 4px;
      border-radius: 6px;
      border-left: 3px solid ${color};
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;
    entry.textContent = message;

    this.logContainer.insertBefore(entry, this.logContainer.firstChild);
    this.combatLog.unshift(entry);

    // Remove old entries
    if (this.combatLog.length > this.maxLogEntries) {
      const old = this.combatLog.pop();
      old.remove();
    }

    // Auto-fade after 5 seconds
    setTimeout(() => {
      entry.style.transition = 'opacity 0.5s';
      entry.style.opacity = '0';
      setTimeout(() => entry.remove(), 500);
    }, 5000);
  }

  setupEventListeners() {
    // Listen to combat stats events
    this.combatStats.onDamage = (amount, source) => {
      this.showDamageNumber(amount, { x: 0, y: 0, z: 0 }, false, false);
      this.addCombatLog(`Took ${Math.ceil(amount)} damage`, '#e53e3e');
    };

    this.combatStats.onHeal = (amount) => {
      this.showDamageNumber(amount, { x: 0, y: 0, z: 0 }, false, true);
      this.addCombatLog(`Healed ${Math.ceil(amount)} HP`, '#48bb78');
    };

    this.combatStats.onDeath = (source) => {
      this.addCombatLog('You died!', '#9b2c2c');
    };
  }

  hide() {
    this.container.style.display = 'none';
  }

  show() {
    this.container.style.display = 'block';
  }
}

/**
 * TargetHealthBar - Health bar that appears above enemies
 */
class TargetHealthBar {
  constructor(target, combatStats, camera) {
    this.target = target;
    this.combatStats = combatStats;
    this.camera = camera;
    this.visible = false;
    
    this.createBar();
  }

  createBar() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      width: 100px;
      background: rgba(20, 20, 30, 0.9);
      border-radius: 6px;
      padding: 4px;
      display: none;
      z-index: 500;
      pointer-events: none;
    `;

    const name = document.createElement('div');
    name.textContent = this.target.name || 'Enemy';
    name.style.cssText = `
      font-size: 11px;
      color: #cbd5e0;
      text-align: center;
      margin-bottom: 3px;
      font-weight: 600;
    `;
    this.container.appendChild(name);

    const barBg = document.createElement('div');
    barBg.style.cssText = `
      width: 100%;
      height: 8px;
      background: #9b2c2c;
      border-radius: 4px;
      overflow: hidden;
    `;

    this.barFill = document.createElement('div');
    this.barFill.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #c53030, #e53e3e);
      width: 100%;
      transition: width 0.3s ease;
      border-radius: 4px;
    `;

    barBg.appendChild(this.barFill);
    this.container.appendChild(barBg);

    document.body.appendChild(this.container);
  }

  update() {
    if (!this.visible || !this.target || this.combatStats.isDead) {
      this.container.style.display = 'none';
      return;
    }

    // Update bar width
    const healthPercent = this.combatStats.getHealthPercent();
    this.barFill.style.width = healthPercent + '%';

    // Convert 3D position to screen position
    const targetPos = this.target.position.clone();
    targetPos.y += 2; // Above head

    const screenPos = targetPos.project(this.camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

    this.container.style.left = (x - 50) + 'px'; // Center
    this.container.style.top = (y - 40) + 'px';
    this.container.style.display = 'block';
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.container.style.display = 'none';
  }

  destroy() {
    this.container.remove();
  }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Export
if (typeof window !== 'undefined') {
  window.CombatUI = CombatUI;
  window.TargetHealthBar = TargetHealthBar;
}
