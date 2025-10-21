/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    ECONOMY SYSTEM v1.0.0                              ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • Currency system (Gold, Silver, Copper)                            ║
 * ║  • Dynamic pricing with supply/demand                                ║
 * ║  • NPC vendors with unique inventories                               ║
 * ║  • Buy/Sell mechanics with haggling                                  ║
 * ║  • Merchant reputation system                                        ║
 * ║  • Price history and market trends                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════
// 1. CURRENCY SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class Currency {
  constructor(gold = 0, silver = 0, copper = 0) {
    this.copper = copper;
    this.silver = silver;
    this.gold = gold;
    this.normalize(); // Convert overflow (100 copper = 1 silver, 100 silver = 1 gold)
  }
  
  // Normalize currency (handle overflow)
  normalize() {
    // Convert copper to silver
    if (this.copper >= 100) {
      this.silver += Math.floor(this.copper / 100);
      this.copper = this.copper % 100;
    }
    
    // Convert silver to gold
    if (this.silver >= 100) {
      this.gold += Math.floor(this.silver / 100);
      this.silver = this.silver % 100;
    }
  }
  
  // Get total value in copper
  toCopper() {
    return this.copper + (this.silver * 100) + (this.gold * 10000);
  }
  
  // Create from copper amount
  static fromCopper(totalCopper) {
    const gold = Math.floor(totalCopper / 10000);
    const silver = Math.floor((totalCopper % 10000) / 100);
    const copper = totalCopper % 100;
    return new Currency(gold, silver, copper);
  }
  
  // Add currency
  add(other) {
    this.copper += other.copper;
    this.silver += other.silver;
    this.gold += other.gold;
    this.normalize();
    return this;
  }
  
  // Subtract currency (returns false if not enough)
  subtract(other) {
    const totalCopper = this.toCopper();
    const otherCopper = other.toCopper();
    
    if (totalCopper < otherCopper) {
      return false; // Not enough money
    }
    
    const result = Currency.fromCopper(totalCopper - otherCopper);
    this.gold = result.gold;
    this.silver = result.silver;
    this.copper = result.copper;
    return true;
  }
  
  // Check if can afford
  canAfford(other) {
    return this.toCopper() >= other.toCopper();
  }
  
  // Format for display
  toString() {
    const parts = [];
    if (this.gold > 0) parts.push(`${this.gold}g`);
    if (this.silver > 0) parts.push(`${this.silver}s`);
    if (this.copper > 0 || parts.length === 0) parts.push(`${this.copper}c`);
    return parts.join(' ');
  }
  
  // Clone
  clone() {
    return new Currency(this.gold, this.silver, this.copper);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2. ITEM PRICING SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class ItemPricing {
  constructor() {
    // Base prices in copper
    this.basePrices = new Map();
    
    // Price modifiers (supply/demand)
    this.priceModifiers = new Map();
    
    // Transaction history
    this.transactionHistory = [];
    
    this.initializeBasePrices();
  }
  
  initializeBasePrices() {
    // Materials
    this.setBasePrice('wood', 5);
    this.setBasePrice('iron_ore', 15);
    this.setBasePrice('coal', 10);
    this.setBasePrice('rope', 8);
    this.setBasePrice('leather', 20);
    this.setBasePrice('cloth', 12);
    this.setBasePrice('plant_fiber', 2);
    this.setBasePrice('raw_hide', 15);
    this.setBasePrice('raw_meat', 8);
    this.setBasePrice('wheat', 3);
    this.setBasePrice('water', 1);
    this.setBasePrice('glass_bottle', 5);
    
    // Herbs
    this.setBasePrice('red_herb', 10);
    this.setBasePrice('blue_herb', 10);
    this.setBasePrice('yellow_herb', 12);
    
    // Processed materials
    this.setBasePrice('iron_ingot', 50);
    this.setBasePrice('steel_ingot', 150);
    
    // Weapons
    this.setBasePrice('wooden_sword', 100);
    this.setBasePrice('iron_sword', 500);
    this.setBasePrice('steel_sword', 2000);
    this.setBasePrice('bow', 300);
    
    // Armor
    this.setBasePrice('leather_armor', 400);
    this.setBasePrice('iron_armor', 1500);
    
    // Tools
    this.setBasePrice('pickaxe', 350);
    this.setBasePrice('axe', 350);
    
    // Potions
    this.setBasePrice('health_potion', 50);
    this.setBasePrice('mana_potion', 50);
    this.setBasePrice('strength_potion', 100);
    
    // Consumables
    this.setBasePrice('cooked_meat', 15);
    this.setBasePrice('bread', 10);
    
    console.log(`💰 Loaded ${this.basePrices.size} item prices`);
  }
  
  setBasePrice(itemId, copperPrice) {
    this.basePrices.set(itemId, copperPrice);
    this.priceModifiers.set(itemId, 1.0); // Default modifier = 1.0 (no change)
  }
  
  // Get buy price (what player pays to merchant)
  getBuyPrice(itemId, quantity = 1) {
    const basePrice = this.basePrices.get(itemId) || 10;
    const modifier = this.priceModifiers.get(itemId) || 1.0;
    const finalPrice = Math.ceil(basePrice * modifier * quantity);
    return Currency.fromCopper(finalPrice);
  }
  
  // Get sell price (what merchant pays to player - usually 50% of buy price)
  getSellPrice(itemId, quantity = 1, sellRatio = 0.5) {
    const buyPrice = this.getBuyPrice(itemId, quantity);
    const sellCopper = Math.floor(buyPrice.toCopper() * sellRatio);
    return Currency.fromCopper(sellCopper);
  }
  
  // Update price based on transaction (supply/demand)
  recordTransaction(itemId, quantity, isBuy) {
    this.transactionHistory.push({
      itemId: itemId,
      quantity: quantity,
      isBuy: isBuy,
      timestamp: Date.now()
    });
    
    // Adjust price modifier based on demand
    const currentModifier = this.priceModifiers.get(itemId) || 1.0;
    
    if (isBuy) {
      // Player buying = high demand = price increases slightly
      this.priceModifiers.set(itemId, Math.min(2.0, currentModifier + 0.01));
    } else {
      // Player selling = high supply = price decreases slightly
      this.priceModifiers.set(itemId, Math.max(0.5, currentModifier - 0.01));
    }
  }
  
  // Get price trend (for UI display)
  getPriceTrend(itemId) {
    const modifier = this.priceModifiers.get(itemId) || 1.0;
    if (modifier > 1.05) return '📈 High';
    if (modifier < 0.95) return '📉 Low';
    return '➡️ Normal';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 3. MERCHANT/VENDOR SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class Merchant {
  constructor(config) {
    this.id = config.id;
    this.name = config.name || 'Merchant';
    this.type = config.type || 'general'; // 'general', 'blacksmith', 'alchemist', 'tailor'
    this.greeting = config.greeting || 'Welcome to my shop!';
    
    // Inventory
    this.inventory = new Map(); // itemId -> quantity
    this.restockTime = config.restockTime || 300; // seconds
    this.lastRestock = Date.now();
    
    // Pricing
    this.sellRatio = config.sellRatio || 0.5; // How much merchant pays for items (50% of value)
    this.buyMarkup = config.buyMarkup || 1.0; // Price multiplier for items merchant sells
    
    // Reputation
    this.reputation = config.reputation || 0; // -100 to 100
    
    // Initialize stock
    this.initializeStock(config.stock);
  }
  
  initializeStock(stock = []) {
    stock.forEach(item => {
      this.inventory.set(item.id, item.quantity || 1);
    });
    console.log(`🏪 ${this.name} stocked with ${this.inventory.size} items`);
  }
  
  // Check if merchant has item
  hasItem(itemId, quantity = 1) {
    return (this.inventory.get(itemId) || 0) >= quantity;
  }
  
  // Add item to merchant inventory
  addItem(itemId, quantity = 1) {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
  }
  
  // Remove item from merchant inventory
  removeItem(itemId, quantity = 1) {
    const current = this.inventory.get(itemId) || 0;
    if (current >= quantity) {
      this.inventory.set(itemId, current - quantity);
      return true;
    }
    return false;
  }
  
  // Get all items merchant sells
  getStockList() {
    const items = [];
    this.inventory.forEach((quantity, itemId) => {
      if (quantity > 0) {
        items.push({ id: itemId, quantity: quantity });
      }
    });
    return items;
  }
  
  // Restock (happens periodically)
  restock() {
    const now = Date.now();
    if (now - this.lastRestock < this.restockTime * 1000) {
      return false; // Not time to restock yet
    }
    
    // Restock logic (add random quantities)
    this.inventory.forEach((quantity, itemId) => {
      const restockAmount = Math.floor(Math.random() * 5) + 1;
      this.inventory.set(itemId, quantity + restockAmount);
    });
    
    this.lastRestock = now;
    console.log(`📦 ${this.name} restocked!`);
    return true;
  }
  
  // Update reputation
  adjustReputation(amount) {
    this.reputation = Math.max(-100, Math.min(100, this.reputation + amount));
  }
  
  // Get discount based on reputation
  getReputationDiscount() {
    if (this.reputation >= 75) return 0.9; // 10% discount
    if (this.reputation >= 50) return 0.95; // 5% discount
    if (this.reputation <= -50) return 1.1; // 10% markup
    return 1.0; // No change
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 4. SHOP MANAGER
// ═══════════════════════════════════════════════════════════════════════

class ShopManager {
  constructor(playerInventory, playerWallet, pricing) {
    this.playerInventory = playerInventory;
    this.playerWallet = playerWallet; // Currency object
    this.pricing = pricing; // ItemPricing instance
    
    this.merchants = new Map();
    this.currentMerchant = null;
    
    this.initializeMerchants();
  }
  
  initializeMerchants() {
    // General Merchant
    this.addMerchant({
      id: 'general_merchant',
      name: 'Rusty Pete',
      type: 'general',
      greeting: 'Got some rare things on sale, stranger!',
      sellRatio: 0.5,
      buyMarkup: 1.0,
      stock: [
        { id: 'health_potion', quantity: 10 },
        { id: 'mana_potion', quantity: 10 },
        { id: 'bread', quantity: 20 },
        { id: 'rope', quantity: 15 },
        { id: 'glass_bottle', quantity: 20 }
      ]
    });
    
    // Blacksmith
    this.addMerchant({
      id: 'blacksmith',
      name: 'Grimbold Ironforge',
      type: 'blacksmith',
      greeting: 'Need weapons or armor? You came to the right place!',
      sellRatio: 0.6, // Pays more for weapons/armor
      buyMarkup: 1.2, // Charges more
      stock: [
        { id: 'iron_sword', quantity: 3 },
        { id: 'wooden_sword', quantity: 5 },
        { id: 'leather_armor', quantity: 2 },
        { id: 'iron_armor', quantity: 1 },
        { id: 'pickaxe', quantity: 4 },
        { id: 'axe', quantity: 4 },
        { id: 'iron_ingot', quantity: 10 },
        { id: 'coal', quantity: 20 }
      ]
    });
    
    // Alchemist
    this.addMerchant({
      id: 'alchemist',
      name: 'Morgana the Wise',
      type: 'alchemist',
      greeting: 'Potions, herbs, and mystical brews await!',
      sellRatio: 0.55,
      buyMarkup: 1.1,
      stock: [
        { id: 'health_potion', quantity: 15 },
        { id: 'mana_potion', quantity: 15 },
        { id: 'strength_potion', quantity: 5 },
        { id: 'red_herb', quantity: 30 },
        { id: 'blue_herb', quantity: 30 },
        { id: 'yellow_herb', quantity: 20 },
        { id: 'glass_bottle', quantity: 50 }
      ]
    });
    
    // Material Trader
    this.addMerchant({
      id: 'trader',
      name: 'Merchant Caravan',
      type: 'trader',
      greeting: 'Fresh supplies from across the land!',
      sellRatio: 0.4, // Pays less for materials
      buyMarkup: 0.9, // Charges less
      stock: [
        { id: 'wood', quantity: 100 },
        { id: 'iron_ore', quantity: 50 },
        { id: 'coal', quantity: 40 },
        { id: 'rope', quantity: 30 },
        { id: 'cloth', quantity: 20 },
        { id: 'leather', quantity: 15 },
        { id: 'plant_fiber', quantity: 50 },
        { id: 'wheat', quantity: 60 }
      ]
    });
    
    console.log(`🏪 Initialized ${this.merchants.size} merchants`);
  }
  
  addMerchant(config) {
    const merchant = new Merchant(config);
    this.merchants.set(merchant.id, merchant);
    return merchant;
  }
  
  getMerchant(id) {
    return this.merchants.get(id);
  }
  
  // Open shop with specific merchant
  openShop(merchantId) {
    const merchant = this.getMerchant(merchantId);
    if (merchant) {
      this.currentMerchant = merchant;
      console.log(`🏪 Opened shop: ${merchant.name}`);
      console.log(`💬 "${merchant.greeting}"`);
      return true;
    }
    return false;
  }
  
  // Close current shop
  closeShop() {
    this.currentMerchant = null;
  }
  
  // Buy item from merchant
  buyItem(itemId, quantity = 1) {
    if (!this.currentMerchant) {
      console.log('No merchant selected!');
      return false;
    }
    
    // Check if merchant has item
    if (!this.currentMerchant.hasItem(itemId, quantity)) {
      console.log(`${this.currentMerchant.name} doesn't have enough ${itemId}!`);
      return false;
    }
    
    // Calculate price with merchant markup and reputation
    const basePrice = this.pricing.getBuyPrice(itemId, quantity);
    const markup = this.currentMerchant.buyMarkup;
    const repDiscount = this.currentMerchant.getReputationDiscount();
    const finalCopper = Math.ceil(basePrice.toCopper() * markup * repDiscount);
    const finalPrice = Currency.fromCopper(finalCopper);
    
    // Check if player can afford
    if (!this.playerWallet.canAfford(finalPrice)) {
      console.log(`Not enough gold! Need ${finalPrice.toString()}`);
      return false;
    }
    
    // Check if player has inventory space
    const hasSpace = this.playerInventory.hasSpace();
    if (!hasSpace) {
      console.log('Inventory full!');
      return false;
    }
    
    // Execute transaction
    this.playerWallet.subtract(finalPrice);
    this.currentMerchant.removeItem(itemId, quantity);
    
    // Add item to player inventory (get item details from somewhere)
    this.playerInventory.addItem({
      id: itemId,
      name: itemId.replace(/_/g, ' '),
      icon: '📦',
      type: 'item',
      quantity: quantity
    });
    
    // Record transaction for price tracking
    this.pricing.recordTransaction(itemId, quantity, true);
    
    // Small reputation boost
    this.currentMerchant.adjustReputation(1);
    
    console.log(`✅ Bought ${quantity}x ${itemId} for ${finalPrice.toString()}`);
    return true;
  }
  
  // Sell item to merchant
  sellItem(itemId, quantity = 1) {
    if (!this.currentMerchant) {
      console.log('No merchant selected!');
      return false;
    }
    
    // Check if player has item
    const playerHas = this.playerInventory.countItem(itemId);
    if (playerHas < quantity) {
      console.log(`You don't have enough ${itemId}!`);
      return false;
    }
    
    // Calculate sell price with merchant's sell ratio and reputation
    const sellRatio = this.currentMerchant.sellRatio;
    const repDiscount = this.currentMerchant.getReputationDiscount();
    const basePrice = this.pricing.getSellPrice(itemId, quantity, sellRatio);
    const finalCopper = Math.floor(basePrice.toCopper() / repDiscount);
    const finalPrice = Currency.fromCopper(finalCopper);
    
    // Execute transaction
    this.playerInventory.removeItem(itemId, quantity);
    this.currentMerchant.addItem(itemId, quantity);
    this.playerWallet.add(finalPrice);
    
    // Record transaction
    this.pricing.recordTransaction(itemId, quantity, false);
    
    // Small reputation boost
    this.currentMerchant.adjustReputation(1);
    
    console.log(`✅ Sold ${quantity}x ${itemId} for ${finalPrice.toString()}`);
    return true;
  }
  
  // Get current shop info
  getShopInfo() {
    if (!this.currentMerchant) return null;
    
    return {
      name: this.currentMerchant.name,
      type: this.currentMerchant.type,
      greeting: this.currentMerchant.greeting,
      reputation: this.currentMerchant.reputation,
      discount: this.currentMerchant.getReputationDiscount(),
      stock: this.currentMerchant.getStockList()
    };
  }
  
  // Update (for restocking)
  update(deltaTime) {
    this.merchants.forEach(merchant => {
      merchant.restock();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Currency, ItemPricing, Merchant, ShopManager };
}
