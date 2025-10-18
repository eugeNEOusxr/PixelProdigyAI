/**
 * Inventory Manager
 * Handles inventory grid, weight, stacking, equipment slots
 * JavaScript for web compatibility
 */

class InventoryManager {
    constructor(rows = 10, cols = 10, maxWeight = 100) {
        this.rows = rows;
        this.cols = cols;
        this.maxWeight = maxWeight;
        this.currentWeight = 0;
        this.gold = 0;
        
        // Grid-based inventory
        this.grid = [];
        for (let i = 0; i < rows * cols; i++) {
            this.grid.push(null);
        }
        
        // Equipment slots
        this.equipment = {
            head: null,
            chest: null,
            legs: null,
            feet: null,
            hands: null,
            shoulders: null,
            waist: null,
            neck: null,
            finger: null,
            weapon_main: null,
            weapon_off: null,
            back: null
        };
        
        // Quick slots (1-9, 0)
        this.quickSlots = Array(10).fill(null);
        
        // Object metadata reference
        this.metadata = null;
    }

    // Load object metadata
    loadMetadata(metadata) {
        this.metadata = metadata;
        console.log(`✓ Loaded ${metadata.objects.length} item definitions`);
    }

    // Get item by ID
    getItem(itemId) {
        if (!this.metadata) return null;
        return this.metadata.objects.find(obj => obj.id === itemId);
    }

    // Add item to inventory
    addItem(itemId, quantity = 1) {
        const item = this.getItem(itemId);
        if (!item) {
            return { success: false, reason: 'Item not found' };
        }

        // Check weight limit
        const totalWeight = item.weight * quantity;
        if (this.currentWeight + totalWeight > this.maxWeight) {
            return { success: false, reason: 'Inventory full (weight limit)' };
        }

        // Try to stack if stackable
        if (item.stackSize > 1) {
            const existingSlot = this.findStackableSlot(itemId);
            if (existingSlot !== -1) {
                const currentStack = this.grid[existingSlot];
                const spaceLeft = item.stackSize - currentStack.quantity;
                
                if (quantity <= spaceLeft) {
                    // Stack fits completely
                    currentStack.quantity += quantity;
                    this.currentWeight += totalWeight;
                    return { 
                        success: true, 
                        slot: existingSlot,
                        stacked: true 
                    };
                } else {
                    // Partial stack
                    currentStack.quantity = item.stackSize;
                    quantity -= spaceLeft;
                    this.currentWeight += item.weight * spaceLeft;
                    // Continue to add remaining items
                }
            }
        }

        // Find empty slot(s)
        while (quantity > 0) {
            const emptySlot = this.findEmptySlot();
            if (emptySlot === -1) {
                return { success: false, reason: 'Inventory full (no slots)' };
            }

            const stackSize = Math.min(quantity, item.stackSize);
            this.grid[emptySlot] = {
                itemId: itemId,
                name: item.name,
                quantity: stackSize,
                weight: item.weight,
                icon: item.textureFile
            };

            this.currentWeight += item.weight * stackSize;
            quantity -= stackSize;
        }

        return { success: true, slot: this.findItem(itemId) };
    }

    // Remove item from inventory
    removeItem(slot, quantity = 1) {
        if (slot < 0 || slot >= this.grid.length) {
            return { success: false, reason: 'Invalid slot' };
        }

        const itemStack = this.grid[slot];
        if (!itemStack) {
            return { success: false, reason: 'Slot is empty' };
        }

        if (quantity >= itemStack.quantity) {
            // Remove entire stack
            this.currentWeight -= itemStack.weight * itemStack.quantity;
            const removedItem = this.grid[slot];
            this.grid[slot] = null;
            return { success: true, removedItem, removedAll: true };
        } else {
            // Remove partial stack
            itemStack.quantity -= quantity;
            this.currentWeight -= itemStack.weight * quantity;
            return { 
                success: true, 
                removedItem: { ...itemStack, quantity }, 
                removedAll: false 
            };
        }
    }

    // Move item between slots
    moveItem(fromSlot, toSlot) {
        if (fromSlot === toSlot) return { success: true };
        
        const fromItem = this.grid[fromSlot];
        const toItem = this.grid[toSlot];

        if (!fromItem) {
            return { success: false, reason: 'Source slot is empty' };
        }

        // If destination is empty, just move
        if (!toItem) {
            this.grid[toSlot] = fromItem;
            this.grid[fromSlot] = null;
            return { success: true, moved: true };
        }

        // If same item type and stackable, try to stack
        if (fromItem.itemId === toItem.itemId) {
            const item = this.getItem(fromItem.itemId);
            if (item.stackSize > 1) {
                const spaceLeft = item.stackSize - toItem.quantity;
                if (spaceLeft >= fromItem.quantity) {
                    // Stack fits completely
                    toItem.quantity += fromItem.quantity;
                    this.grid[fromSlot] = null;
                    return { success: true, stacked: true };
                } else if (spaceLeft > 0) {
                    // Partial stack
                    toItem.quantity = item.stackSize;
                    fromItem.quantity -= spaceLeft;
                    return { success: true, partialStack: true };
                }
            }
        }

        // Swap items
        this.grid[toSlot] = fromItem;
        this.grid[fromSlot] = toItem;
        return { success: true, swapped: true };
    }

    // Equip item
    equipItem(slot) {
        const itemStack = this.grid[slot];
        if (!itemStack) {
            return { success: false, reason: 'Slot is empty' };
        }

        const item = this.getItem(itemStack.itemId);
        if (!item || item.equipSlot === 'none') {
            return { success: false, reason: 'Item cannot be equipped' };
        }

        // Check requirements
        const reqCheck = this.checkRequirements(item);
        if (!reqCheck.met) {
            return { success: false, reason: reqCheck.reason };
        }

        const equipSlot = item.equipSlot;
        const currentEquipped = this.equipment[equipSlot];

        // Unequip current item if any
        if (currentEquipped) {
            const unequipResult = this.unequipItem(equipSlot);
            if (!unequipResult.success) {
                return { success: false, reason: 'Failed to unequip current item' };
            }
        }

        // Equip new item
        this.equipment[equipSlot] = {
            itemId: itemStack.itemId,
            name: item.name,
            stats: {
                damage: item.damage,
                defense: item.defense,
                strength: item.strength,
                agility: item.agility,
                intelligence: item.intelligence,
                vitality: item.vitality
            },
            icon: item.textureFile,
            vlsFile: item.vlsFile
        };

        // Remove from inventory
        this.removeItem(slot, 1);

        return { 
            success: true, 
            equipped: equipSlot,
            stats: this.calculateTotalStats()
        };
    }

    // Unequip item
    unequipItem(equipSlot) {
        if (!this.equipment[equipSlot]) {
            return { success: false, reason: 'Slot is empty' };
        }

        const equippedItem = this.equipment[equipSlot];
        
        // Add back to inventory
        const addResult = this.addItem(equippedItem.itemId, 1);
        if (!addResult.success) {
            return { success: false, reason: 'Inventory full' };
        }

        this.equipment[equipSlot] = null;

        return { 
            success: true, 
            unequipped: equipSlot,
            stats: this.calculateTotalStats()
        };
    }

    // Set quick slot
    setQuickSlot(quickSlotIndex, inventorySlot) {
        if (quickSlotIndex < 0 || quickSlotIndex >= 10) {
            return { success: false, reason: 'Invalid quick slot' };
        }

        if (inventorySlot === null) {
            // Clear quick slot
            this.quickSlots[quickSlotIndex] = null;
            return { success: true, cleared: true };
        }

        const itemStack = this.grid[inventorySlot];
        if (!itemStack) {
            return { success: false, reason: 'Inventory slot is empty' };
        }

        this.quickSlots[quickSlotIndex] = {
            inventorySlot: inventorySlot,
            itemId: itemStack.itemId,
            name: itemStack.name,
            icon: itemStack.icon
        };

        return { success: true };
    }

    // Use quick slot
    useQuickSlot(quickSlotIndex) {
        const quickSlot = this.quickSlots[quickSlotIndex];
        if (!quickSlot) {
            return { success: false, reason: 'Quick slot is empty' };
        }

        const item = this.getItem(quickSlot.itemId);
        if (!item) {
            return { success: false, reason: 'Item not found' };
        }

        // Handle based on item type
        if (item.equipSlot !== 'none') {
            // Equip item
            return this.equipItem(quickSlot.inventorySlot);
        } else if (item.interactionType === 'use') {
            // Use consumable
            return this.useItem(quickSlot.inventorySlot);
        }

        return { success: false, reason: 'Item cannot be used' };
    }

    // Use item (consumables)
    useItem(slot) {
        const itemStack = this.grid[slot];
        if (!itemStack) {
            return { success: false, reason: 'Slot is empty' };
        }

        const item = this.getItem(itemStack.itemId);
        if (!item || item.interactionType !== 'use') {
            return { success: false, reason: 'Item cannot be used' };
        }

        // Apply item effects (would be implemented by game logic)
        const effects = {
            health: item.vitality * 10,
            mana: item.intelligence * 5,
            duration: 60 // seconds
        };

        // Remove one from stack
        this.removeItem(slot, 1);

        return { 
            success: true, 
            used: item.name,
            effects: effects
        };
    }

    // Calculate total stats from equipment
    calculateTotalStats() {
        const stats = {
            damage: 0,
            defense: 0,
            strength: 0,
            agility: 0,
            intelligence: 0,
            vitality: 0
        };

        for (const slot in this.equipment) {
            const equipped = this.equipment[slot];
            if (equipped && equipped.stats) {
                stats.damage += equipped.stats.damage || 0;
                stats.defense += equipped.stats.defense || 0;
                stats.strength += equipped.stats.strength || 0;
                stats.agility += equipped.stats.agility || 0;
                stats.intelligence += equipped.stats.intelligence || 0;
                stats.vitality += equipped.stats.vitality || 0;
            }
        }

        return stats;
    }

    // Check if player meets item requirements
    checkRequirements(item, playerLevel = 1, playerClass = null) {
        if (item.requiredLevel && playerLevel < item.requiredLevel) {
            return { 
                met: false, 
                reason: `Requires level ${item.requiredLevel}` 
            };
        }

        if (item.requiredClass && playerClass !== item.requiredClass) {
            return { 
                met: false, 
                reason: `Requires ${item.requiredClass} class` 
            };
        }

        return { met: true };
    }

    // Find empty slot
    findEmptySlot() {
        return this.grid.findIndex(slot => slot === null);
    }

    // Find stackable slot for item
    findStackableSlot(itemId) {
        const item = this.getItem(itemId);
        if (!item || item.stackSize <= 1) return -1;

        return this.grid.findIndex(slot => 
            slot && 
            slot.itemId === itemId && 
            slot.quantity < item.stackSize
        );
    }

    // Find item in inventory
    findItem(itemId) {
        return this.grid.findIndex(slot => slot && slot.itemId === itemId);
    }

    // Get inventory stats
    getStats() {
        const totalSlots = this.grid.length;
        const usedSlots = this.grid.filter(slot => slot !== null).length;
        const emptySlots = totalSlots - usedSlots;

        return {
            totalSlots,
            usedSlots,
            emptySlots,
            currentWeight: this.currentWeight.toFixed(1),
            maxWeight: this.maxWeight,
            weightPercent: ((this.currentWeight / this.maxWeight) * 100).toFixed(1),
            gold: this.gold,
            totalStats: this.calculateTotalStats()
        };
    }

    // Sort inventory
    sortInventory(sortBy = 'name') {
        const items = this.grid.filter(slot => slot !== null);
        
        items.sort((a, b) => {
            const itemA = this.getItem(a.itemId);
            const itemB = this.getItem(b.itemId);

            switch (sortBy) {
                case 'name':
                    return itemA.name.localeCompare(itemB.name);
                case 'rarity':
                    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                    return rarityOrder.indexOf(itemB.rarity) - rarityOrder.indexOf(itemA.rarity);
                case 'level':
                    return itemB.level - itemA.level;
                case 'price':
                    return itemB.price - itemA.price;
                case 'category':
                    return itemA.category.localeCompare(itemB.category);
                default:
                    return 0;
            }
        });

        // Clear grid and refill with sorted items
        this.grid.fill(null);
        items.forEach((item, index) => {
            this.grid[index] = item;
        });

        return { success: true, sortedBy: sortBy };
    }

    // Export inventory state
    exportState() {
        return {
            grid: this.grid,
            equipment: this.equipment,
            quickSlots: this.quickSlots,
            gold: this.gold,
            currentWeight: this.currentWeight,
            maxWeight: this.maxWeight
        };
    }

    // Import inventory state
    importState(state) {
        this.grid = state.grid || this.grid;
        this.equipment = state.equipment || this.equipment;
        this.quickSlots = state.quickSlots || this.quickSlots;
        this.gold = state.gold || 0;
        this.currentWeight = state.currentWeight || 0;
        this.maxWeight = state.maxWeight || this.maxWeight;

        return { success: true };
    }

    // Print inventory (debug)
    print() {
        console.log('\n=== INVENTORY ===');
        console.log(`Gold: ${this.gold}`);
        console.log(`Weight: ${this.currentWeight.toFixed(1)}/${this.maxWeight}`);
        console.log('\nItems:');
        
        this.grid.forEach((slot, index) => {
            if (slot) {
                console.log(`  [${index}] ${slot.name} x${slot.quantity}`);
            }
        });

        console.log('\nEquipment:');
        for (const [slot, item] of Object.entries(this.equipment)) {
            if (item) {
                console.log(`  ${slot}: ${item.name}`);
            }
        }

        console.log('\nStats:', this.calculateTotalStats());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventoryManager;
}
