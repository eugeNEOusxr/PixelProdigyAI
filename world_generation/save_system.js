// world_generation/save_system.js
// Save System - Save/load player progress, position, inventory, quests, settings

/**
 * SaveData - Structure for save game data
 */
class SaveData {
  constructor() {
    this.version = '1.0.0';
    this.timestamp = Date.now();
    this.playTime = 0;
    
    // Player data
    this.player = {
      position: { x: 0, y: 1, z: 0 },
      rotation: 0,
      characterIndex: 0,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      mana: 100,
      maxMana: 100,
      attack: 10,
      defense: 5,
      speed: 5
    };
    
    // Inventory data
    this.inventory = {
      slots: [],
      equipment: {
        weapon: null,
        shield: null,
        helmet: null,
        chestplate: null,
        leggings: null,
        boots: null,
        ring: null,
        necklace: null
      }
    };
    
    // Quest data
    this.quests = {
      active: [],
      completed: []
    };
    
    // World data
    this.world = {
      timeOfDay: 12,
      weather: 'clear',
      exploredAreas: [],
      defeatedEnemies: []
    };
    
    // Settings
    this.settings = {
      masterVolume: 1.0,
      sfxVolume: 1.0,
      musicVolume: 0.5,
      cameraMode: 'TPS',
      inputBindings: {},
      graphicsQuality: 'high'
    };
    
    // Statistics
    this.stats = {
      enemiesDefeated: 0,
      questsCompleted: 0,
      itemsCollected: 0,
      distanceTraveled: 0,
      damageDealt: 0,
      damageTaken: 0
    };
  }

  serialize() {
    return JSON.stringify(this, null, 2);
  }

  static deserialize(jsonString) {
    const data = JSON.parse(jsonString);
    const saveData = new SaveData();
    Object.assign(saveData, data);
    return saveData;
  }
}

/**
 * SaveSlot - Individual save slot
 */
class SaveSlot {
  constructor(id) {
    this.id = id;
    this.name = `Save ${id}`;
    this.data = null;
    this.screenshot = null; // Base64 screenshot
    this.isEmpty = true;
  }

  save(saveData) {
    this.data = saveData;
    this.isEmpty = false;
    this.data.timestamp = Date.now();
  }

  load() {
    return this.data;
  }

  clear() {
    this.data = null;
    this.screenshot = null;
    this.isEmpty = true;
  }

  getSummary() {
    if (this.isEmpty) {
      return { empty: true, name: this.name };
    }
    
    return {
      empty: false,
      name: this.name,
      timestamp: this.data.timestamp,
      playTime: this.data.playTime,
      characterIndex: this.data.player.characterIndex,
      health: this.data.player.health,
      level: this.data.stats.level || 1,
      location: this.data.player.position
    };
  }
}

/**
 * SaveManager - Manages save slots and persistence
 */
class SaveManager {
  constructor(maxSlots = 5) {
    this.maxSlots = maxSlots;
    this.slots = [];
    this.currentSlot = null;
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 300000; // 5 minutes
    this.autoSaveTimer = null;
    this.storageKey = 'pixelprodigy_saves';
    
    // Initialize slots
    for (let i = 0; i < maxSlots; i++) {
      this.slots.push(new SaveSlot(i + 1));
    }
    
    // Load from storage
    this.loadFromStorage();
  }

  // Create save data from game state
  createSaveData(gameState) {
    const saveData = new SaveData();
    
    // Player data
    if (gameState.playerMesh) {
      saveData.player.position = {
        x: gameState.playerMesh.position.x,
        y: gameState.playerMesh.position.y,
        z: gameState.playerMesh.position.z
      };
      saveData.player.rotation = gameState.playerMesh.rotation.y;
    }
    
    if (gameState.characterIndex !== undefined) {
      saveData.player.characterIndex = gameState.characterIndex;
    }
    
    if (gameState.playerCombatStats) {
      const stats = gameState.playerCombatStats;
      saveData.player.health = stats.health;
      saveData.player.maxHealth = stats.maxHealth;
      saveData.player.stamina = stats.stamina;
      saveData.player.maxStamina = stats.maxStamina;
      saveData.player.mana = stats.mana;
      saveData.player.maxMana = stats.maxMana;
      saveData.player.attack = stats.attack;
      saveData.player.defense = stats.defense;
      saveData.player.speed = stats.speed;
    }
    
    // Inventory data
    if (gameState.playerInventory) {
      const inv = gameState.playerInventory;
      saveData.inventory.slots = inv.slots.map(slot => {
        if (slot.item) {
          return {
            item: {
              id: slot.item.id,
              name: slot.item.name,
              type: slot.item.type,
              rarity: slot.item.rarity,
              stats: slot.item.stats,
              stackSize: slot.item.stackSize
            },
            quantity: slot.quantity
          };
        }
        return null;
      });
    }
    
    // Equipment data
    if (gameState.playerEquipment) {
      const eq = gameState.playerEquipment;
      Object.keys(eq.slots).forEach(slotName => {
        const item = eq.slots[slotName];
        if (item) {
          saveData.inventory.equipment[slotName] = {
            id: item.id,
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            stats: item.stats
          };
        }
      });
    }
    
    // Quest data
    if (gameState.questManager) {
      const qm = gameState.questManager;
      
      saveData.quests.active = qm.activeQuests.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        objectives: q.objectives.map(obj => ({
          id: obj.id,
          description: obj.description,
          target: obj.target,
          current: obj.current,
          completed: obj.completed
        })),
        currentObjectiveIndex: q.currentObjectiveIndex
      }));
      
      saveData.quests.completed = qm.completedQuests.map(q => ({
        id: q.id,
        title: q.title
      }));
    }
    
    // World data
    if (gameState.effectsController) {
      saveData.world.timeOfDay = gameState.effectsController.getTimeOfDay();
      saveData.world.weather = gameState.effectsController.getWeather();
    }
    
    if (gameState.aiEnemies) {
      saveData.world.defeatedEnemies = gameState.aiEnemies.map(e => ({
        position: { x: e.position.x, y: e.position.y, z: e.position.z },
        health: e.combatStats ? e.combatStats.health : 0
      }));
    }
    
    // Settings
    if (gameState.audioSystem) {
      saveData.settings.masterVolume = gameState.audioSystem.getMasterVolume();
      saveData.settings.sfxVolume = gameState.audioSystem.getSFXVolume();
      saveData.settings.musicVolume = gameState.audioSystem.getMusicVolume();
    }
    
    if (gameState.cameraController) {
      saveData.settings.cameraMode = gameState.cameraController.mode;
    }
    
    // Play time
    if (gameState.playTime !== undefined) {
      saveData.playTime = gameState.playTime;
    }
    
    return saveData;
  }

  // Save to slot
  saveToSlot(slotId, gameState, screenshot = null) {
    const slot = this.slots[slotId - 1];
    if (!slot) {
      console.error('Invalid slot ID:', slotId);
      return false;
    }
    
    const saveData = this.createSaveData(gameState);
    slot.save(saveData);
    slot.screenshot = screenshot;
    
    this.currentSlot = slotId;
    this.saveToStorage();
    
    console.log(`💾 Game saved to slot ${slotId}`);
    return true;
  }

  // Load from slot
  loadFromSlot(slotId) {
    const slot = this.slots[slotId - 1];
    if (!slot || slot.isEmpty) {
      console.error('Cannot load from empty slot:', slotId);
      return null;
    }
    
    this.currentSlot = slotId;
    console.log(`📁 Game loaded from slot ${slotId}`);
    return slot.load();
  }

  // Delete save slot
  deleteSlot(slotId) {
    const slot = this.slots[slotId - 1];
    if (!slot) {
      console.error('Invalid slot ID:', slotId);
      return false;
    }
    
    slot.clear();
    if (this.currentSlot === slotId) {
      this.currentSlot = null;
    }
    
    this.saveToStorage();
    console.log(`🗑️ Deleted save slot ${slotId}`);
    return true;
  }

  // Get all slot summaries
  getSlotSummaries() {
    return this.slots.map(slot => slot.getSummary());
  }

  // Auto-save
  startAutoSave(gameState) {
    if (!this.autoSaveEnabled) return;
    
    this.stopAutoSave();
    
    this.autoSaveTimer = setInterval(() => {
      if (this.currentSlot) {
        this.saveToSlot(this.currentSlot, gameState);
        console.log('🔄 Auto-saved to slot', this.currentSlot);
      }
    }, this.autoSaveInterval);
  }

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Quick save/load
  quickSave(gameState, screenshot = null) {
    const slotId = this.currentSlot || 1;
    return this.saveToSlot(slotId, gameState, screenshot);
  }

  quickLoad() {
    const slotId = this.currentSlot || 1;
    return this.loadFromSlot(slotId);
  }

  // Persistence (localStorage)
  saveToStorage() {
    try {
      const data = {
        currentSlot: this.currentSlot,
        slots: this.slots.map(slot => ({
          id: slot.id,
          name: slot.name,
          data: slot.data,
          screenshot: slot.screenshot,
          isEmpty: slot.isEmpty
        }))
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  loadFromStorage() {
    try {
      const json = localStorage.getItem(this.storageKey);
      if (!json) return false;
      
      const data = JSON.parse(json);
      this.currentSlot = data.currentSlot;
      
      data.slots.forEach((slotData, index) => {
        const slot = this.slots[index];
        slot.name = slotData.name;
        slot.data = slotData.data;
        slot.screenshot = slotData.screenshot;
        slot.isEmpty = slotData.isEmpty;
      });
      
      console.log('📂 Loaded saves from localStorage');
      return true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  }

  // Export/Import saves
  exportSave(slotId) {
    const slot = this.slots[slotId - 1];
    if (!slot || slot.isEmpty) return null;
    
    return {
      version: '1.0.0',
      exportDate: Date.now(),
      slot: {
        id: slot.id,
        name: slot.name,
        data: slot.data,
        screenshot: slot.screenshot
      }
    };
  }

  importSave(exportData, slotId) {
    try {
      const slot = this.slots[slotId - 1];
      if (!slot) return false;
      
      slot.name = exportData.slot.name;
      slot.data = exportData.slot.data;
      slot.screenshot = exportData.slot.screenshot;
      slot.isEmpty = false;
      
      this.saveToStorage();
      console.log(`📥 Imported save to slot ${slotId}`);
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  // Clear all saves
  clearAllSaves() {
    this.slots.forEach(slot => slot.clear());
    this.currentSlot = null;
    this.saveToStorage();
    console.log('🗑️ All saves cleared');
  }
}

/**
 * GameStateLoader - Applies loaded save data to game state
 */
class GameStateLoader {
  static applyLoadedData(saveData, gameState) {
    // Apply player position
    if (saveData.player && gameState.playerMesh) {
      gameState.playerMesh.position.set(
        saveData.player.position.x,
        saveData.player.position.y,
        saveData.player.position.z
      );
      gameState.playerMesh.rotation.y = saveData.player.rotation;
      
      // Update movement system
      if (gameState.playerMovement) {
        gameState.playerMovement.position.copy(gameState.playerMesh.position);
      }
    }
    
    // Apply character
    if (saveData.player && saveData.player.characterIndex !== undefined) {
      gameState.characterIndex = saveData.player.characterIndex;
      // Trigger character switch if needed
    }
    
    // Apply combat stats
    if (saveData.player && gameState.playerCombatStats) {
      const stats = gameState.playerCombatStats;
      stats.health = saveData.player.health;
      stats.maxHealth = saveData.player.maxHealth;
      stats.stamina = saveData.player.stamina;
      stats.maxStamina = saveData.player.maxStamina;
      stats.mana = saveData.player.mana;
      stats.maxMana = saveData.player.maxMana;
      stats.attack = saveData.player.attack;
      stats.defense = saveData.player.defense;
      stats.speed = saveData.player.speed;
    }
    
    // Apply inventory
    if (saveData.inventory && gameState.playerInventory) {
      const inv = gameState.playerInventory;
      inv.clear();
      
      saveData.inventory.slots.forEach((slotData, index) => {
        if (slotData && slotData.item) {
          // Recreate item from database
          const item = ItemDatabase.createItemFromData(slotData.item);
          if (item) {
            inv.slots[index].item = item;
            inv.slots[index].quantity = slotData.quantity;
          }
        }
      });
      
      // Trigger UI update
      if (gameState.inventoryUI) {
        gameState.inventoryUI.render();
      }
    }
    
    // Apply equipment
    if (saveData.inventory && saveData.inventory.equipment && gameState.playerEquipment) {
      const eq = gameState.playerEquipment;
      
      Object.keys(saveData.inventory.equipment).forEach(slotName => {
        const itemData = saveData.inventory.equipment[slotName];
        if (itemData) {
          const item = ItemDatabase.createItemFromData(itemData);
          if (item) {
            eq.equipItem(item);
          }
        }
      });
    }
    
    // Apply quests
    if (saveData.quests && gameState.questManager) {
      const qm = gameState.questManager;
      
      // Clear existing quests
      qm.activeQuests = [];
      qm.completedQuests = [];
      
      // Restore active quests
      saveData.quests.active.forEach(questData => {
        const quest = qm.getQuest(questData.id);
        if (quest) {
          quest.objectives = questData.objectives;
          quest.currentObjectiveIndex = questData.currentObjectiveIndex;
          quest.status = 'active';
          qm.activeQuests.push(quest);
        }
      });
      
      // Restore completed quests
      saveData.quests.completed.forEach(questData => {
        const quest = qm.getQuest(questData.id);
        if (quest) {
          quest.status = 'completed';
          qm.completedQuests.push(quest);
        }
      });
      
      // Update UI
      if (gameState.questUI) {
        gameState.questUI.update();
      }
    }
    
    // Apply world state
    if (saveData.world && gameState.effectsController) {
      gameState.effectsController.setTimeOfDay(saveData.world.timeOfDay);
      gameState.effectsController.setWeather(saveData.world.weather);
    }
    
    // Apply settings
    if (saveData.settings) {
      if (gameState.audioSystem && gameState.audioSystem.initialized) {
        gameState.audioSystem.setMasterVolume(saveData.settings.masterVolume);
        gameState.audioSystem.setSFXVolume(saveData.settings.sfxVolume);
        gameState.audioSystem.setMusicVolume(saveData.settings.musicVolume);
      }
      
      if (gameState.cameraController) {
        gameState.cameraController.mode = saveData.settings.cameraMode;
      }
    }
    
    console.log('✅ Save data applied to game state');
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.SaveData = SaveData;
  window.SaveSlot = SaveSlot;
  window.SaveManager = SaveManager;
  window.GameStateLoader = GameStateLoader;
}
