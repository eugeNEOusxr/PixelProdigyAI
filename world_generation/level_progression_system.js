/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                 LEVEL PROGRESSION SYSTEM v1.0.0                       ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • XP system with level scaling                                      ║
 * ║  • Stat progression (HP, Mana, Stamina, Damage, Defense)            ║
 * ║  • Skill points on level-up                                          ║
 * ║  • Level-up rewards and bonuses                                      ║
 * ║  • XP sources (combat, crafting, quests, exploration)                ║
 * ║  • Prestige system for max-level players                             ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════
// 1. XP CALCULATION & LEVEL DATABASE (Stacked Pattern!)
// ═══════════════════════════════════════════════════════════════════════

const XP_SOURCES = {
  // Combat XP
  kill_enemy: (enemyLevel) => 50 * enemyLevel,
  kill_boss: (bossLevel) => 500 * bossLevel,
  deal_damage: (damage) => Math.floor(damage / 10),
  
  // Crafting XP (from recipes)
  craft_item: (itemLevel) => 10 * itemLevel,
  
  // Quest XP
  complete_quest: (questDifficulty) => 100 * questDifficulty,
  discover_location: () => 25,
  
  // Exploration XP
  explore_area: () => 15,
  find_treasure: () => 50,
  unlock_achievement: () => 100
};

const LEVEL_DATABASE = {
  // XP required for each level (exponential curve)
  getXPForLevel: (level) => {
    return Math.floor(100 * Math.pow(level, 1.5));
  },
  
  // Total XP needed to reach a level
  getTotalXPForLevel: (targetLevel) => {
    let total = 0;
    for (let i = 1; i < targetLevel; i++) {
      total += LEVEL_DATABASE.getXPForLevel(i);
    }
    return total;
  },
  
  // Calculate level from total XP
  getLevelFromXP: (totalXP) => {
    let level = 1;
    let xpNeeded = 0;
    
    while (xpNeeded <= totalXP) {
      level++;
      xpNeeded += LEVEL_DATABASE.getXPForLevel(level);
    }
    
    return level - 1;
  },
  
  // Stat bonuses per level (stacked!)
  statGains: {
    maxHealth: 10,      // +10 HP per level
    maxMana: 8,         // +8 mana per level
    maxStamina: 5,      // +5 stamina per level
    baseDamage: 2,      // +2 damage per level
    baseDefense: 1,     // +1 defense per level
    critChance: 0.5,    // +0.5% crit chance per level
    moveSpeed: 0.01     // +1% move speed per level
  },
  
  // Rewards per level milestone
  levelRewards: {
    5: { skillPoints: 2, title: 'Apprentice' },
    10: { skillPoints: 3, title: 'Journeyman', gold: 1000 },
    15: { skillPoints: 3, title: 'Expert' },
    20: { skillPoints: 5, title: 'Master', gold: 5000 },
    25: { skillPoints: 5, title: 'Champion' },
    30: { skillPoints: 7, title: 'Hero', gold: 10000 },
    40: { skillPoints: 10, title: 'Legend', gold: 25000 },
    50: { skillPoints: 15, title: 'Grandmaster', gold: 50000, prestige: true }
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. PLAYER STATS CLASS
// ═══════════════════════════════════════════════════════════════════════

class PlayerStats {
  constructor() {
    // Core attributes
    this.level = 1;
    this.currentXP = 0;
    this.prestigeLevel = 0; // For endgame
    
    // Base stats (at level 1)
    this.baseStats = {
      maxHealth: 100,
      maxMana: 50,
      maxStamina: 100,
      baseDamage: 10,
      baseDefense: 5,
      critChance: 5,
      moveSpeed: 1.0
    };
    
    // Current stats (base + level bonuses + equipment)
    this.currentStats = { ...this.baseStats };
    
    // Resources
    this.health = this.currentStats.maxHealth;
    this.mana = this.currentStats.maxMana;
    this.stamina = this.currentStats.maxStamina;
    
    // Skill points
    this.skillPoints = 0;
    this.totalSkillPoints = 0;
    
    // Titles & achievements
    this.currentTitle = 'Novice';
    this.unlockedTitles = ['Novice'];
    
    this.recalculateStats();
  }
  
  // Recalculate all stats based on level
  recalculateStats() {
    const gains = LEVEL_DATABASE.statGains;
    const levelBonus = this.level - 1;
    
    this.currentStats.maxHealth = this.baseStats.maxHealth + (gains.maxHealth * levelBonus);
    this.currentStats.maxMana = this.baseStats.maxMana + (gains.maxMana * levelBonus);
    this.currentStats.maxStamina = this.baseStats.maxStamina + (gains.maxStamina * levelBonus);
    this.currentStats.baseDamage = this.baseStats.baseDamage + (gains.baseDamage * levelBonus);
    this.currentStats.baseDefense = this.baseStats.baseDefense + (gains.baseDefense * levelBonus);
    this.currentStats.critChance = this.baseStats.critChance + (gains.critChance * levelBonus);
    this.currentStats.moveSpeed = this.baseStats.moveSpeed + (gains.moveSpeed * levelBonus);
    
    // Heal to full on level up
    this.health = this.currentStats.maxHealth;
    this.mana = this.currentStats.maxMana;
    this.stamina = this.currentStats.maxStamina;
  }
  
  // Award XP
  awardXP(amount, source = 'unknown') {
    const oldLevel = this.level;
    this.currentXP += amount;
    
    console.log(`+${amount} XP (${source})`);
    
    // Check for level up
    const newLevel = LEVEL_DATABASE.getLevelFromXP(this.currentXP);
    
    if (newLevel > oldLevel) {
      this.levelUp(newLevel);
    }
    
    return newLevel > oldLevel; // Returns true if leveled up
  }
  
  // Level up!
  levelUp(newLevel) {
    const oldLevel = this.level;
    this.level = newLevel;
    
    // Recalculate stats
    this.recalculateStats();
    
    // Award skill points (1 per level + milestone bonuses)
    let skillPointsGained = newLevel - oldLevel;
    
    // Check for milestone rewards
    for (let level = oldLevel + 1; level <= newLevel; level++) {
      const reward = LEVEL_DATABASE.levelRewards[level];
      if (reward) {
        if (reward.skillPoints) {
          skillPointsGained += reward.skillPoints;
        }
        if (reward.title) {
          this.currentTitle = reward.title;
          this.unlockedTitles.push(reward.title);
        }
        if (reward.gold) {
          // Award gold (would integrate with currency system)
          console.log(`🏆 Milestone reward: ${reward.gold} gold!`);
        }
        if (reward.prestige) {
          console.log('🌟 MAX LEVEL! Prestige system unlocked!');
        }
      }
    }
    
    this.skillPoints += skillPointsGained;
    this.totalSkillPoints += skillPointsGained;
    
    console.log(`
╔═══════════════════════════════════════╗
║           🎉 LEVEL UP! 🎉            ║
╠═══════════════════════════════════════╣
║  Level ${oldLevel} → ${newLevel}                      ║
║  Title: ${this.currentTitle.padEnd(25)}║
║  Health: ${this.currentStats.maxHealth.toString().padEnd(23)}║
║  Mana: ${this.currentStats.maxMana.toString().padEnd(25)}║
║  Damage: ${this.currentStats.baseDamage.toString().padEnd(23)}║
║  Defense: ${this.currentStats.baseDefense.toString().padEnd(22)}║
║  Skill Points: +${skillPointsGained.toString().padEnd(17)}║
╚═══════════════════════════════════════╝
    `);
    
    return {
      oldLevel,
      newLevel,
      skillPointsGained,
      newTitle: this.currentTitle,
      newStats: { ...this.currentStats }
    };
  }
  
  // Get XP progress to next level
  getXPProgress() {
    const currentLevelXP = LEVEL_DATABASE.getTotalXPForLevel(this.level);
    const nextLevelXP = LEVEL_DATABASE.getTotalXPForLevel(this.level + 1);
    const xpIntoCurrentLevel = this.currentXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    
    return {
      current: xpIntoCurrentLevel,
      needed: xpNeededForLevel,
      percentage: (xpIntoCurrentLevel / xpNeededForLevel) * 100,
      total: this.currentXP
    };
  }
  
  // Spend skill point
  spendSkillPoint() {
    if (this.skillPoints > 0) {
      this.skillPoints--;
      return true;
    }
    return false;
  }
  
  // Prestige (reset to level 1 but keep bonuses)
  prestige() {
    if (this.level < 50) {
      console.log('Must be level 50 to prestige!');
      return false;
    }
    
    this.prestigeLevel++;
    this.level = 1;
    this.currentXP = 0;
    this.skillPoints = 0;
    
    // Increase base stats permanently
    const prestigeBonus = this.prestigeLevel * 0.1; // 10% per prestige
    Object.keys(this.baseStats).forEach(stat => {
      this.baseStats[stat] = Math.floor(this.baseStats[stat] * (1 + prestigeBonus));
    });
    
    this.recalculateStats();
    
    console.log(`🌟 PRESTIGE ${this.prestigeLevel}! All base stats increased by ${prestigeBonus * 100}%!`);
    return true;
  }
  
  // Get stat info
  getStats() {
    return {
      level: this.level,
      prestigeLevel: this.prestigeLevel,
      title: this.currentTitle,
      xp: this.getXPProgress(),
      skillPoints: this.skillPoints,
      stats: { ...this.currentStats },
      health: this.health,
      mana: this.mana,
      stamina: this.stamina
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 3. XP MANAGER (Handles all XP sources)
// ═══════════════════════════════════════════════════════════════════════

class XPManager {
  constructor(playerStats) {
    this.playerStats = playerStats;
    this.xpMultiplier = 1.0; // Can be boosted by items/buffs
    this.recentXPGains = []; // For UI display
    this.totalXPEarned = 0;
    
    // XP source tracking (for statistics)
    this.xpBySource = {
      combat: 0,
      crafting: 0,
      quests: 0,
      exploration: 0,
      other: 0
    };
  }
  
  // Award XP from any source
  award(source, ...args) {
    const xpFunction = XP_SOURCES[source];
    
    if (!xpFunction) {
      console.warn(`Unknown XP source: ${source}`);
      return 0;
    }
    
    const baseXP = xpFunction(...args);
    const finalXP = Math.floor(baseXP * this.xpMultiplier);
    
    // Track XP by category
    const category = this.getSourceCategory(source);
    this.xpBySource[category] += finalXP;
    this.totalXPEarned += finalXP;
    
    // Add to recent gains (for UI)
    this.recentXPGains.push({
      source,
      amount: finalXP,
      timestamp: Date.now()
    });
    
    // Keep only last 10 gains
    if (this.recentXPGains.length > 10) {
      this.recentXPGains.shift();
    }
    
    // Award to player
    const leveledUp = this.playerStats.awardXP(finalXP, source);
    
    return { xp: finalXP, leveledUp };
  }
  
  getSourceCategory(source) {
    if (source.includes('kill') || source.includes('damage')) return 'combat';
    if (source.includes('craft')) return 'crafting';
    if (source.includes('quest')) return 'quests';
    if (source.includes('explore') || source.includes('discover')) return 'exploration';
    return 'other';
  }
  
  // Set XP multiplier (from buffs, events, etc.)
  setMultiplier(multiplier) {
    this.xpMultiplier = multiplier;
    console.log(`XP multiplier set to ${multiplier}x`);
  }
  
  // Get recent XP gains (for UI)
  getRecentGains() {
    // Filter out old gains (older than 5 seconds)
    const now = Date.now();
    return this.recentXPGains.filter(gain => now - gain.timestamp < 5000);
  }
  
  // Get XP statistics
  getStats() {
    return {
      totalEarned: this.totalXPEarned,
      multiplier: this.xpMultiplier,
      bySource: { ...this.xpBySource },
      recentGains: this.getRecentGains()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 4. LEVEL PROGRESSION CONTROLLER
// ═══════════════════════════════════════════════════════════════════════

class LevelProgressionController {
  constructor() {
    this.playerStats = new PlayerStats();
    this.xpManager = new XPManager(this.playerStats);
    
    // Event callbacks
    this.onLevelUp = null;
    this.onXPGain = null;
    this.onPrestige = null;
    
    console.log('⭐ Level Progression System initialized');
    console.log(`Starting level: ${this.playerStats.level}`);
  }
  
  // Main XP award function
  awardXP(source, ...args) {
    const result = this.xpManager.award(source, ...args);
    
    if (this.onXPGain) {
      this.onXPGain(result.xp, source);
    }
    
    if (result.leveledUp && this.onLevelUp) {
      const levelUpInfo = this.playerStats.getStats();
      this.onLevelUp(levelUpInfo);
    }
    
    return result;
  }
  
  // Get current player info
  getPlayerInfo() {
    return {
      stats: this.playerStats.getStats(),
      xpStats: this.xpManager.getStats()
    };
  }
  
  // Spend skill point (integrates with skill tree)
  spendSkillPoint() {
    return this.playerStats.spendSkillPoint();
  }
  
  // Save/Load
  save() {
    return {
      playerStats: {
        level: this.playerStats.level,
        currentXP: this.playerStats.currentXP,
        prestigeLevel: this.playerStats.prestigeLevel,
        skillPoints: this.playerStats.skillPoints,
        totalSkillPoints: this.playerStats.totalSkillPoints,
        currentTitle: this.playerStats.currentTitle,
        unlockedTitles: this.playerStats.unlockedTitles,
        baseStats: this.playerStats.baseStats
      },
      xpStats: {
        totalXPEarned: this.xpManager.totalXPEarned,
        xpBySource: this.xpManager.xpBySource
      }
    };
  }
  
  load(data) {
    if (data.playerStats) {
      Object.assign(this.playerStats, data.playerStats);
      this.playerStats.recalculateStats();
    }
    
    if (data.xpStats) {
      Object.assign(this.xpManager, data.xpStats);
    }
    
    console.log(`Loaded player: Level ${this.playerStats.level} ${this.playerStats.currentTitle}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    LevelProgressionController, 
    PlayerStats, 
    XPManager,
    XP_SOURCES,
    LEVEL_DATABASE
  };
} else if (typeof window !== 'undefined') {
  window.LevelProgressionController = LevelProgressionController;
  window.PlayerStats = PlayerStats;
  window.XPManager = XPManager;
  window.XP_SOURCES = XP_SOURCES;
  window.LEVEL_DATABASE = LEVEL_DATABASE;
}
