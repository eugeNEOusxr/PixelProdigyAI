// world_generation/inventory_system.js
// Complete Inventory & Equipment System with UI

/**
 * Item - Represents an inventory item
 */
class Item {
  constructor(config) {
    this.id = config.id || Math.random().toString(36).substr(2, 9);
    this.name = config.name || 'Unknown Item';
    this.type = config.type || 'misc'; // weapon, armor, consumable, misc, quest
    this.rarity = config.rarity || 'common'; // common, uncommon, rare, epic, legendary
    this.description = config.description || '';
    this.icon = config.icon || '📦';
    this.stackable = config.stackable !== undefined ? config.stackable : true;
    this.maxStack = config.maxStack || 99;
    this.quantity = config.quantity || 1;
    this.weight = config.weight || 1;
    this.value = config.value || 1;
    this.equipSlot = config.equipSlot || null; // head, chest, legs, feet, weapon, shield
    this.stats = config.stats || {}; // { attack: 10, defense: 5, speed: 2 }
    this.effects = config.effects || []; // [ { type: 'heal', value: 50 } ]
    this.usable = config.usable || false;
    this.onUse = config.onUse || null;
  }

  canStackWith(other) {
    return this.stackable && 
           other.stackable && 
           this.id === other.id && 
           this.quantity + other.quantity <= this.maxStack;
  }

  clone() {
    return new Item({...this});
  }

  getRarityColor() {
    const colors = {
      common: '#b0b0b0',
      uncommon: '#5ac95a',
      rare: '#5a9dd5',
      epic: '#b65adf',
      legendary: '#ff8c1a'
    };
    return colors[this.rarity] || colors.common;
  }
}

/**
 * InventorySlot - Represents a single inventory slot
 */
class InventorySlot {
  constructor(index) {
    this.index = index;
    this.item = null;
    this.locked = false;
  }

  isEmpty() {
    return this.item === null;
  }

  canAccept(item) {
    if (this.locked) return false;
    if (this.isEmpty()) return true;
    return this.item.canStackWith(item);
  }

  addItem(item) {
    if (this.isEmpty()) {
      this.item = item;
      return 0; // All added
    } else if (this.item.canStackWith(item)) {
      const space = this.item.maxStack - this.item.quantity;
      const toAdd = Math.min(space, item.quantity);
      this.item.quantity += toAdd;
      return item.quantity - toAdd; // Remainder
    }
    return item.quantity; // Can't add any
  }

  removeItem(quantity = null) {
    if (this.isEmpty()) return null;
    
    if (quantity === null || quantity >= this.item.quantity) {
      const item = this.item;
      this.item = null;
      return item;
    } else {
      const removed = this.item.clone();
      removed.quantity = quantity;
      this.item.quantity -= quantity;
      return removed;
    }
  }

  clear() {
    this.item = null;
  }
}

/**
 * Inventory - Main inventory system
 */
class Inventory {
  constructor(size = 24) {
    this.size = size;
    this.slots = [];
    for (let i = 0; i < size; i++) {
      this.slots.push(new InventorySlot(i));
    }
    this.maxWeight = 100;
    this.onChange = null;
  }

  addItem(item) {
    // Try to stack with existing items first
    for (let slot of this.slots) {
      if (!slot.isEmpty() && slot.item.canStackWith(item)) {
        const remainder = slot.addItem(item);
        if (remainder === 0) {
          this.triggerChange();
          return true;
        }
        item.quantity = remainder;
      }
    }

    // Find empty slot
    for (let slot of this.slots) {
      if (slot.isEmpty()) {
        slot.addItem(item);
        this.triggerChange();
        return true;
      }
    }

    return false; // Inventory full
  }

  removeItem(slotIndex, quantity = null) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return null;
    const item = this.slots[slotIndex].removeItem(quantity);
    if (item) this.triggerChange();
    return item;
  }

  getItem(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.slots.length) return null;
    return this.slots[slotIndex].item;
  }

  swapSlots(index1, index2) {
    if (index1 < 0 || index1 >= this.slots.length) return false;
    if (index2 < 0 || index2 >= this.slots.length) return false;
    
    const temp = this.slots[index1].item;
    this.slots[index1].item = this.slots[index2].item;
    this.slots[index2].item = temp;
    this.triggerChange();
    return true;
  }

  getTotalWeight() {
    return this.slots.reduce((total, slot) => {
      if (!slot.isEmpty()) {
        return total + (slot.item.weight * slot.item.quantity);
      }
      return total;
    }, 0);
  }

  getItemCount(itemId) {
    return this.slots.reduce((count, slot) => {
      if (!slot.isEmpty() && slot.item.id === itemId) {
        return count + slot.item.quantity;
      }
      return count;
    }, 0);
  }

  findItem(itemId) {
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i].isEmpty() && this.slots[i].item.id === itemId) {
        return i;
      }
    }
    return -1;
  }

  clear() {
    this.slots.forEach(slot => slot.clear());
    this.triggerChange();
  }

  triggerChange() {
    if (this.onChange) this.onChange();
  }
}

/**
 * Equipment - Character equipment system
 */
class Equipment {
  constructor() {
    this.slots = {
      head: null,
      chest: null,
      legs: null,
      feet: null,
      weapon: null,
      shield: null,
      accessory1: null,
      accessory2: null
    };
    this.onChange = null;
  }

  canEquip(item, slot) {
    if (!item || !item.equipSlot) return false;
    return item.equipSlot === slot;
  }

  equip(item, slot) {
    if (!this.canEquip(item, slot)) return null;
    
    const unequipped = this.slots[slot];
    this.slots[slot] = item;
    this.triggerChange();
    return unequipped;
  }

  unequip(slot) {
    if (!this.slots[slot]) return null;
    
    const item = this.slots[slot];
    this.slots[slot] = null;
    this.triggerChange();
    return item;
  }

  getSlot(slot) {
    return this.slots[slot];
  }

  getTotalStats() {
    const stats = {};
    for (let slot in this.slots) {
      const item = this.slots[slot];
      if (item && item.stats) {
        for (let stat in item.stats) {
          stats[stat] = (stats[stat] || 0) + item.stats[stat];
        }
      }
    }
    return stats;
  }

  clear() {
    for (let slot in this.slots) {
      this.slots[slot] = null;
    }
    this.triggerChange();
  }

  triggerChange() {
    if (this.onChange) this.onChange();
  }
}

/**
 * ItemDatabase - Pre-defined items for the game
 */
class ItemDatabase {
  static createPotion() {
    return new Item({
      id: 'potion_health',
      name: 'Health Potion',
      type: 'consumable',
      rarity: 'common',
      description: 'Restores 50 HP',
      icon: '🧪',
      stackable: true,
      maxStack: 20,
      usable: true,
      value: 25,
      effects: [{ type: 'heal', value: 50 }]
    });
  }

  static createSword() {
    return new Item({
      id: 'sword_iron',
      name: 'Iron Sword',
      type: 'weapon',
      rarity: 'common',
      description: 'A basic iron sword',
      icon: '⚔️',
      stackable: false,
      equipSlot: 'weapon',
      value: 100,
      stats: { attack: 10, speed: 5 }
    });
  }

  static createShield() {
    return new Item({
      id: 'shield_wooden',
      name: 'Wooden Shield',
      type: 'armor',
      rarity: 'common',
      description: 'A sturdy wooden shield',
      icon: '🛡️',
      stackable: false,
      equipSlot: 'shield',
      value: 50,
      stats: { defense: 8 }
    });
  }

  static createHelmet() {
    return new Item({
      id: 'helmet_iron',
      name: 'Iron Helmet',
      type: 'armor',
      rarity: 'uncommon',
      description: 'Protects your head',
      icon: '⛑️',
      stackable: false,
      equipSlot: 'head',
      value: 75,
      stats: { defense: 5 }
    });
  }

  static createChestplate() {
    return new Item({
      id: 'chest_iron',
      name: 'Iron Chestplate',
      type: 'armor',
      rarity: 'uncommon',
      description: 'Heavy iron armor',
      icon: '🦺',
      stackable: false,
      equipSlot: 'chest',
      value: 150,
      stats: { defense: 12 }
    });
  }

  static createCoin() {
    return new Item({
      id: 'coin_gold',
      name: 'Gold Coin',
      type: 'misc',
      rarity: 'common',
      description: 'Currency',
      icon: '💰',
      stackable: true,
      maxStack: 999,
      value: 1
    });
  }

  static createGem() {
    return new Item({
      id: 'gem_ruby',
      name: 'Ruby',
      type: 'misc',
      rarity: 'rare',
      description: 'A precious gemstone',
      icon: '💎',
      stackable: true,
      maxStack: 99,
      value: 500
    });
  }

  // Recreate item from saved data
  static createItemFromData(data) {
    // Try to match by ID first
    const itemCreators = {
      'potion_health': this.createPotion,
      'weapon_sword': this.createSword,
      'armor_shield': this.createShield,
      'armor_helmet': this.createHelmet,
      'armor_chestplate': this.createChestplate,
      'armor_leggings': this.createLeggings,
      'armor_boots': this.createBoots,
      'coin_gold': this.createCoin,
      'gem_ruby': this.createGem
    };

    if (itemCreators[data.id]) {
      const item = itemCreators[data.id].call(this);
      if (data.stackSize) item.stackSize = data.stackSize;
      return item;
    }

    // Fallback: create generic item from data
    return new Item({
      id: data.id,
      name: data.name,
      type: data.type,
      rarity: data.rarity,
      description: data.description || '',
      icon: data.icon || '📦',
      stats: data.stats || {},
      stackable: data.stackable || false,
      maxStack: data.maxStack || 1,
      value: data.value || 0
    });
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.Item = Item;
  window.InventorySlot = InventorySlot;
  window.Inventory = Inventory;
  window.Equipment = Equipment;
  window.ItemDatabase = ItemDatabase;
}
