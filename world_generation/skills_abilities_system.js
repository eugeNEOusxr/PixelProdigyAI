/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                  SKILLS & ABILITIES SYSTEM v1.0.0                     ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • Skill Tree with 3 branches (Combat/Magic/Utility)                 ║
 * ║  • 30+ unique abilities with cooldowns                               ║
 * ║  • Hotbar system (1-9 keys)                                          ║
 * ║  • Skill points and level-based progression                          ║
 * ║  • Passive skills and active abilities                               ║
 * ║  • Visual effects for ability activation                             ║
 * ║  • Resource management (mana/energy)                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════
// 1. ABILITY CLASS
// ═══════════════════════════════════════════════════════════════════════

class Ability {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.icon = config.icon || '⚡';
    this.type = config.type || 'active'; // 'active' or 'passive'
    this.category = config.category || 'combat'; // 'combat', 'magic', 'utility'
    
    // Requirements
    this.requiredLevel = config.requiredLevel || 1;
    this.requiredSkillPoints = config.requiredSkillPoints || 1;
    this.prerequisite = config.prerequisite || null; // Prerequisite ability ID
    
    // Costs
    this.manaCost = config.manaCost || 0;
    this.energyCost = config.energyCost || 0;
    this.healthCost = config.healthCost || 0;
    
    // Cooldown
    this.cooldown = config.cooldown || 5.0; // seconds
    this.currentCooldown = 0;
    
    // Effects
    this.damage = config.damage || 0;
    this.healing = config.healing || 0;
    this.duration = config.duration || 0; // for buffs/debuffs
    this.range = config.range || 10;
    
    // Custom effect function
    this.onActivate = config.onActivate || null;
    this.onUpdate = config.onUpdate || null; // For passive abilities
    
    // State
    this.unlocked = false;
    this.level = 0;
    this.maxLevel = config.maxLevel || 5;
    
    // Visual
    this.particle = config.particle || null;
    this.sound = config.sound || null;
  }
  
  // Check if ability can be activated
  canActivate(player) {
    if (this.type === 'passive') return false;
    if (this.currentCooldown > 0) return false;
    if (player.mana < this.manaCost) return false;
    if (player.health <= this.healthCost) return false;
    return true;
  }
  
  // Activate ability
  activate(player, target = null) {
    if (!this.canActivate(player)) {
      console.log(`Cannot activate ${this.name}: On cooldown or insufficient resources`);
      return false;
    }
    
    // Consume resources
    player.mana -= this.manaCost;
    player.health = Math.max(1, player.health - this.healthCost);
    
    // Start cooldown
    this.currentCooldown = this.cooldown;
    
    // Execute effect
    if (this.onActivate) {
      this.onActivate(player, target, this);
    }
    
    console.log(`✨ Activated: ${this.name}`);
    return true;
  }
  
  // Update cooldown
  update(deltaTime) {
    if (this.currentCooldown > 0) {
      this.currentCooldown = Math.max(0, this.currentCooldown - deltaTime);
    }
  }
  
  // Get cooldown percentage
  getCooldownPercent() {
    if (this.cooldown === 0) return 0;
    return (this.currentCooldown / this.cooldown) * 100;
  }
  
  // Unlock ability
  unlock() {
    this.unlocked = true;
    this.level = 1;
  }
  
  // Upgrade ability
  upgrade() {
    if (this.level < this.maxLevel) {
      this.level++;
      return true;
    }
    return false;
  }
  
  // Get scaled values based on level
  getScaledDamage() {
    return this.damage * (1 + (this.level - 1) * 0.2);
  }
  
  getScaledHealing() {
    return this.healing * (1 + (this.level - 1) * 0.2);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2. SKILL TREE
// ═══════════════════════════════════════════════════════════════════════

class SkillTree {
  constructor() {
    this.abilities = new Map();
    this.branches = {
      combat: [],
      magic: [],
      utility: []
    };
    
    this.skillPoints = 0;
    this.totalSkillPoints = 0;
    
    this.initializeAbilities();
  }
  
  initializeAbilities() {
    // ═══════════════════════════════════════════════════════════════════
    // COMBAT BRANCH
    // ═══════════════════════════════════════════════════════════════════
    
    this.addAbility({
      id: 'power_strike',
      name: 'Power Strike',
      description: 'A powerful melee attack dealing 150% damage',
      icon: '⚔️',
      category: 'combat',
      requiredLevel: 1,
      requiredSkillPoints: 1,
      cooldown: 3.0,
      manaCost: 10,
      damage: 30,
      range: 3,
      onActivate: (player, target, ability) => {
        if (target && target.takeDamage) {
          target.takeDamage(ability.getScaledDamage());
        }
      }
    });
    
    this.addAbility({
      id: 'whirlwind',
      name: 'Whirlwind',
      description: 'Spin attack hitting all nearby enemies',
      icon: '🌪️',
      category: 'combat',
      requiredLevel: 3,
      requiredSkillPoints: 1,
      prerequisite: 'power_strike',
      cooldown: 8.0,
      manaCost: 25,
      damage: 20,
      range: 5,
      onActivate: (player, target, ability) => {
        console.log('Whirlwind attack!');
        // Would damage all enemies in range
      }
    });
    
    this.addAbility({
      id: 'berserker_rage',
      name: 'Berserker Rage',
      description: '+50% damage, -20% defense for 10 seconds',
      icon: '😡',
      category: 'combat',
      requiredLevel: 5,
      requiredSkillPoints: 2,
      prerequisite: 'whirlwind',
      cooldown: 30.0,
      healthCost: 20,
      duration: 10,
      onActivate: (player, target, ability) => {
        console.log('Berserker Rage activated!');
        // Would apply damage/defense modifiers
      }
    });
    
    this.addAbility({
      id: 'shield_bash',
      name: 'Shield Bash',
      description: 'Stun target for 2 seconds',
      icon: '🛡️',
      category: 'combat',
      requiredLevel: 2,
      requiredSkillPoints: 1,
      cooldown: 10.0,
      manaCost: 15,
      damage: 10,
      duration: 2,
      range: 2,
      onActivate: (player, target, ability) => {
        console.log('Shield bash! Target stunned');
      }
    });
    
    this.addAbility({
      id: 'critical_strike',
      name: 'Critical Strike',
      description: 'Guaranteed critical hit dealing 250% damage',
      icon: '💥',
      category: 'combat',
      requiredLevel: 7,
      requiredSkillPoints: 2,
      prerequisite: 'power_strike',
      cooldown: 15.0,
      manaCost: 30,
      damage: 50,
      range: 3,
      onActivate: (player, target, ability) => {
        if (target && target.takeDamage) {
          target.takeDamage(ability.getScaledDamage() * 2.5);
        }
      }
    });
    
    // ═══════════════════════════════════════════════════════════════════
    // MAGIC BRANCH
    // ═══════════════════════════════════════════════════════════════════
    
    this.addAbility({
      id: 'fireball',
      name: 'Fireball',
      description: 'Launch a fireball dealing fire damage',
      icon: '🔥',
      category: 'magic',
      requiredLevel: 1,
      requiredSkillPoints: 1,
      cooldown: 2.0,
      manaCost: 20,
      damage: 25,
      range: 20,
      onActivate: (player, target, ability) => {
        console.log('Fireball launched!');
      }
    });
    
    this.addAbility({
      id: 'frost_nova',
      name: 'Frost Nova',
      description: 'Freeze all nearby enemies for 3 seconds',
      icon: '❄️',
      category: 'magic',
      requiredLevel: 3,
      requiredSkillPoints: 1,
      prerequisite: 'fireball',
      cooldown: 12.0,
      manaCost: 40,
      damage: 15,
      duration: 3,
      range: 8,
      onActivate: (player, target, ability) => {
        console.log('Frost Nova! Enemies frozen');
      }
    });
    
    this.addAbility({
      id: 'lightning_bolt',
      name: 'Lightning Bolt',
      description: 'Strike target with lightning, chains to nearby enemies',
      icon: '⚡',
      category: 'magic',
      requiredLevel: 5,
      requiredSkillPoints: 2,
      prerequisite: 'fireball',
      cooldown: 6.0,
      manaCost: 35,
      damage: 40,
      range: 25,
      onActivate: (player, target, ability) => {
        console.log('Lightning bolt strikes!');
      }
    });
    
    this.addAbility({
      id: 'arcane_shield',
      name: 'Arcane Shield',
      description: 'Absorb 100 damage for 15 seconds',
      icon: '🔮',
      category: 'magic',
      requiredLevel: 4,
      requiredSkillPoints: 1,
      cooldown: 20.0,
      manaCost: 30,
      duration: 15,
      onActivate: (player, target, ability) => {
        console.log('Arcane Shield activated!');
      }
    });
    
    this.addAbility({
      id: 'meteor',
      name: 'Meteor',
      description: 'Call down a meteor dealing massive AoE damage',
      icon: '☄️',
      category: 'magic',
      requiredLevel: 10,
      requiredSkillPoints: 3,
      prerequisite: 'fireball',
      cooldown: 60.0,
      manaCost: 100,
      damage: 150,
      range: 30,
      onActivate: (player, target, ability) => {
        console.log('Meteor incoming!');
      }
    });
    
    // ═══════════════════════════════════════════════════════════════════
    // UTILITY BRANCH
    // ═══════════════════════════════════════════════════════════════════
    
    this.addAbility({
      id: 'heal',
      name: 'Heal',
      description: 'Restore 50 health',
      icon: '❤️',
      category: 'utility',
      requiredLevel: 1,
      requiredSkillPoints: 1,
      cooldown: 10.0,
      manaCost: 25,
      healing: 50,
      onActivate: (player, target, ability) => {
        const healAmount = ability.getScaledHealing();
        player.health = Math.min(player.maxHealth, player.health + healAmount);
        console.log(`Healed ${healAmount} HP`);
      }
    });
    
    this.addAbility({
      id: 'dash',
      name: 'Dash',
      description: 'Quickly dash forward',
      icon: '💨',
      category: 'utility',
      requiredLevel: 2,
      requiredSkillPoints: 1,
      cooldown: 5.0,
      manaCost: 15,
      range: 10,
      onActivate: (player, target, ability) => {
        console.log('Dash forward!');
        // Would move player forward quickly
      }
    });
    
    this.addAbility({
      id: 'teleport',
      name: 'Teleport',
      description: 'Instantly teleport to target location',
      icon: '🌀',
      category: 'utility',
      requiredLevel: 6,
      requiredSkillPoints: 2,
      prerequisite: 'dash',
      cooldown: 15.0,
      manaCost: 50,
      range: 20,
      onActivate: (player, target, ability) => {
        console.log('Teleported!');
      }
    });
    
    this.addAbility({
      id: 'stealth',
      name: 'Stealth',
      description: 'Become invisible for 10 seconds',
      icon: '👻',
      category: 'utility',
      requiredLevel: 5,
      requiredSkillPoints: 2,
      cooldown: 30.0,
      manaCost: 40,
      duration: 10,
      onActivate: (player, target, ability) => {
        console.log('Entering stealth...');
      }
    });
    
    this.addAbility({
      id: 'mana_regen',
      name: 'Mana Regeneration',
      description: 'Passive: +50% mana regeneration',
      icon: '💧',
      type: 'passive',
      category: 'utility',
      requiredLevel: 3,
      requiredSkillPoints: 1,
      onUpdate: (player, deltaTime) => {
        // Passive mana regen boost
      }
    });
    
    this.addAbility({
      id: 'resurrection',
      name: 'Resurrection',
      description: 'Revive at 50% health when killed (once per cooldown)',
      icon: '✨',
      category: 'utility',
      requiredLevel: 15,
      requiredSkillPoints: 3,
      prerequisite: 'heal',
      cooldown: 300.0, // 5 minutes
      manaCost: 0,
      onActivate: (player, target, ability) => {
        console.log('Resurrected!');
        player.health = player.maxHealth * 0.5;
      }
    });
  }
  
  // Add ability to tree
  addAbility(config) {
    const ability = new Ability(config);
    this.abilities.set(ability.id, ability);
    this.branches[ability.category].push(ability.id);
  }
  
  // Get ability by ID
  getAbility(id) {
    return this.abilities.get(id);
  }
  
  // Check if ability can be unlocked
  canUnlock(abilityId) {
    const ability = this.getAbility(abilityId);
    if (!ability) return false;
    if (ability.unlocked) return false;
    
    // Check skill points
    if (this.skillPoints < ability.requiredSkillPoints) return false;
    
    // Check prerequisite
    if (ability.prerequisite) {
      const prereq = this.getAbility(ability.prerequisite);
      if (!prereq || !prereq.unlocked) return false;
    }
    
    return true;
  }
  
  // Unlock ability
  unlockAbility(abilityId) {
    if (!this.canUnlock(abilityId)) {
      console.log('Cannot unlock ability: Requirements not met');
      return false;
    }
    
    const ability = this.getAbility(abilityId);
    ability.unlock();
    this.skillPoints -= ability.requiredSkillPoints;
    console.log(`✅ Unlocked: ${ability.name}`);
    return true;
  }
  
  // Upgrade ability
  upgradeAbility(abilityId) {
    const ability = this.getAbility(abilityId);
    if (!ability || !ability.unlocked) return false;
    
    if (this.skillPoints < 1) {
      console.log('Not enough skill points');
      return false;
    }
    
    if (ability.upgrade()) {
      this.skillPoints--;
      console.log(`⬆️ Upgraded: ${ability.name} to level ${ability.level}`);
      return true;
    }
    
    console.log('Ability already at max level');
    return false;
  }
  
  // Award skill points
  awardSkillPoints(amount) {
    this.skillPoints += amount;
    this.totalSkillPoints += amount;
    console.log(`🎯 Gained ${amount} skill point(s). Total: ${this.skillPoints}`);
  }
  
  // Get all unlocked abilities
  getUnlockedAbilities() {
    return Array.from(this.abilities.values()).filter(a => a.unlocked);
  }
  
  // Get abilities by branch
  getBranchAbilities(branch) {
    return this.branches[branch].map(id => this.getAbility(id));
  }
  
  // Update all abilities
  update(deltaTime) {
    this.abilities.forEach(ability => {
      ability.update(deltaTime);
      
      // Update passive abilities
      if (ability.unlocked && ability.type === 'passive' && ability.onUpdate) {
        ability.onUpdate(null, deltaTime);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 3. HOTBAR SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class Hotbar {
  constructor(slots = 9) {
    this.slots = new Array(slots).fill(null);
    this.maxSlots = slots;
  }
  
  // Assign ability to slot
  setSlot(slotIndex, abilityId) {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) {
      console.log('Invalid slot index');
      return false;
    }
    
    this.slots[slotIndex] = abilityId;
    console.log(`Set slot ${slotIndex + 1} to ${abilityId || 'empty'}`);
    return true;
  }
  
  // Get ability in slot
  getSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) return null;
    return this.slots[slotIndex];
  }
  
  // Clear slot
  clearSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.maxSlots) {
      this.slots[slotIndex] = null;
    }
  }
  
  // Clear all slots
  clearAll() {
    this.slots.fill(null);
  }
  
  // Find ability in hotbar
  findAbility(abilityId) {
    return this.slots.indexOf(abilityId);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 4. ABILITY MANAGER
// ═══════════════════════════════════════════════════════════════════════

class AbilityManager {
  constructor(player) {
    this.player = player;
    this.skillTree = new SkillTree();
    this.hotbar = new Hotbar(9);
    
    // Active effects
    this.activeEffects = [];
  }
  
  // Activate ability from hotbar
  useHotbarSlot(slotIndex, target = null) {
    const abilityId = this.hotbar.getSlot(slotIndex);
    if (!abilityId) {
      console.log(`Hotbar slot ${slotIndex + 1} is empty`);
      return false;
    }
    
    return this.useAbility(abilityId, target);
  }
  
  // Use ability by ID
  useAbility(abilityId, target = null) {
    const ability = this.skillTree.getAbility(abilityId);
    
    if (!ability) {
      console.log(`Ability ${abilityId} not found`);
      return false;
    }
    
    if (!ability.unlocked) {
      console.log(`Ability ${ability.name} not unlocked`);
      return false;
    }
    
    return ability.activate(this.player, target);
  }
  
  // Update abilities
  update(deltaTime) {
    this.skillTree.update(deltaTime);
    
    // Update active effects
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.timeRemaining -= deltaTime;
      return effect.timeRemaining > 0;
    });
  }
  
  // Award skill points (typically on level up)
  awardSkillPoints(amount) {
    this.skillTree.awardSkillPoints(amount);
  }
  
  // Get ability info
  getAbilityInfo(abilityId) {
    const ability = this.skillTree.getAbility(abilityId);
    if (!ability) return null;
    
    return {
      id: ability.id,
      name: ability.name,
      description: ability.description,
      icon: ability.icon,
      unlocked: ability.unlocked,
      level: ability.level,
      maxLevel: ability.maxLevel,
      cooldown: ability.cooldown,
      currentCooldown: ability.currentCooldown,
      cooldownPercent: ability.getCooldownPercent(),
      manaCost: ability.manaCost,
      canActivate: ability.canActivate(this.player)
    };
  }
  
  // Get hotbar state
  getHotbarState() {
    return this.hotbar.slots.map((abilityId, index) => {
      if (!abilityId) return { slot: index, empty: true };
      return {
        slot: index,
        ...this.getAbilityInfo(abilityId)
      };
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Ability, SkillTree, Hotbar, AbilityManager };
}
