/**
 * Inventory UI Controller
 * Handles drag-and-drop, tooltips, and visual interactions
 */

class InventoryUI {
    constructor() {
        this.inventory = new InventoryManager(10, 10, 100);
        this.metadata = null;
        this.draggedSlot = null;
        this.draggedFrom = null; // 'inventory' or 'equipment'
        
        this.init();
    }

    async init() {
        // Load object metadata
        await this.loadMetadata();
        
        // Initialize inventory with test items
        this.populateTestInventory();
        
        // Setup UI
        this.setupInventoryGrid();
        this.setupEquipmentSlots();
        this.setupQuickSlots();
        this.setupEventListeners();
        this.setupKeyBindings();
        
        // Update displays
        this.updateStats();
        this.updateInventoryInfo();
        this.renderInventory();
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'flex';
        
        console.log('✓ Inventory UI initialized');
    }

    async loadMetadata() {
        try {
            const response = await fetch('../world_system/object_metadata.json');
            this.metadata = await response.json();
            this.inventory.loadMetadata(this.metadata);
            console.log(`✓ Loaded ${this.metadata.totalObjects} items`);
        } catch (error) {
            console.error('Failed to load metadata:', error);
            this.showNotification('Error loading item data', 'error');
        }
    }

    populateTestInventory() {
        // Add some test items
        const testItems = [
            { id: 'weapon_1', quantity: 1 },
            { id: 'weapon_50', quantity: 1 },
            { id: 'armor_1', quantity: 1 },
            { id: 'armor_100', quantity: 1 },
            { id: 'armor_500', quantity: 1 },
            { id: 'resource_1', quantity: 10 },
            { id: 'resource_50', quantity: 5 },
            { id: 'furniture_1', quantity: 1 },
            { id: 'decoration_1', quantity: 20 },
            { id: 'vehicle_1', quantity: 1 }
        ];

        testItems.forEach(item => {
            this.inventory.addItem(item.id, item.quantity);
        });

        this.inventory.gold = 1500;
    }

    setupInventoryGrid() {
        const grid = document.getElementById('inventoryGrid');
        grid.innerHTML = '';

        for (let i = 0; i < this.inventory.rows * this.inventory.cols; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slot = i;
            
            slot.addEventListener('dragstart', (e) => this.onDragStart(e, i, 'inventory'));
            slot.addEventListener('dragover', (e) => this.onDragOver(e));
            slot.addEventListener('drop', (e) => this.onDrop(e, i, 'inventory'));
            slot.addEventListener('dragend', (e) => this.onDragEnd(e));
            slot.addEventListener('mouseenter', (e) => this.onMouseEnter(e, i, 'inventory'));
            slot.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
            slot.addEventListener('contextmenu', (e) => this.onContextMenu(e, i, 'inventory'));
            slot.addEventListener('dblclick', (e) => this.onDoubleClick(i, 'inventory'));
            
            grid.appendChild(slot);
        }
    }

    setupEquipmentSlots() {
        const slots = document.querySelectorAll('.equipment-slot');
        slots.forEach(slot => {
            const slotName = slot.dataset.slot;
            
            slot.addEventListener('dragover', (e) => this.onDragOver(e));
            slot.addEventListener('drop', (e) => this.onDrop(e, slotName, 'equipment'));
            slot.addEventListener('mouseenter', (e) => this.onMouseEnter(e, slotName, 'equipment'));
            slot.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
            slot.addEventListener('contextmenu', (e) => this.onContextMenu(e, slotName, 'equipment'));
            slot.addEventListener('dblclick', (e) => this.onDoubleClick(slotName, 'equipment'));
        });
    }

    setupQuickSlots() {
        const slots = document.querySelectorAll('.quickslot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.useQuickSlot(index));
            slot.addEventListener('dragover', (e) => this.onDragOver(e));
            slot.addEventListener('drop', (e) => this.assignQuickSlot(e, index));
        });
    }

    setupEventListeners() {
        // Sort
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.inventory.sortInventory(e.target.value);
            this.renderInventory();
            this.showNotification(`Sorted by ${e.target.value}`, 'success');
        });

        // Save
        document.getElementById('saveBtn').addEventListener('click', () => {
            const state = this.inventory.exportState();
            localStorage.setItem('pixelverse_inventory', JSON.stringify(state));
            this.showNotification('Inventory saved', 'success');
        });

        // Load
        document.getElementById('loadBtn').addEventListener('click', () => {
            const saved = localStorage.getItem('pixelverse_inventory');
            if (saved) {
                this.inventory.importState(JSON.parse(saved));
                this.renderInventory();
                this.updateStats();
                this.updateInventoryInfo();
                this.showNotification('Inventory loaded', 'success');
            } else {
                this.showNotification('No saved inventory found', 'error');
            }
        });

        // Close context menu on click elsewhere
        document.addEventListener('click', () => {
            document.getElementById('contextMenu').classList.remove('show');
        });
    }

    setupKeyBindings() {
        document.addEventListener('keydown', (e) => {
            // Quick slots (1-9, 0)
            if (e.key >= '1' && e.key <= '9') {
                this.useQuickSlot(parseInt(e.key) - 1);
            } else if (e.key === '0') {
                this.useQuickSlot(9);
            }
            
            // Inventory toggle (I)
            if (e.key === 'i' || e.key === 'I') {
                const container = document.getElementById('mainContainer');
                container.style.display = container.style.display === 'none' ? 'flex' : 'none';
            }
        });
    }

    // Drag and Drop handlers
    onDragStart(e, slot, from) {
        this.draggedSlot = slot;
        this.draggedFrom = from;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', slot);
    }

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    onDrop(e, targetSlot, targetType) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (this.draggedFrom === 'inventory' && targetType === 'inventory') {
            // Move within inventory
            const result = this.inventory.moveItem(this.draggedSlot, targetSlot);
            if (result.success) {
                this.renderInventory();
                this.showNotification('Item moved', 'success');
            }
        } else if (this.draggedFrom === 'inventory' && targetType === 'equipment') {
            // Equip item
            const result = this.inventory.equipItem(this.draggedSlot);
            if (result.success) {
                this.renderInventory();
                this.renderEquipment();
                this.updateStats();
                this.showNotification(`Equipped ${result.equipped}`, 'success');
            } else {
                this.showNotification(result.reason, 'error');
            }
        } else if (this.draggedFrom === 'equipment' && targetType === 'inventory') {
            // Unequip item (not fully implemented in this drop handler)
            this.showNotification('Drag to unequip', 'success');
        }

        this.updateInventoryInfo();
    }

    onDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    onMouseEnter(e, slot, type) {
        let item = null;

        if (type === 'inventory') {
            const itemStack = this.inventory.grid[slot];
            if (itemStack) {
                item = this.inventory.getItem(itemStack.itemId);
                this.showTooltip(e, item, itemStack.quantity);
            }
        } else if (type === 'equipment') {
            const equipped = this.inventory.equipment[slot];
            if (equipped) {
                item = this.inventory.getItem(equipped.itemId);
                this.showTooltip(e, item, 1);
            }
        }
    }

    onMouseLeave(e) {
        this.hideTooltip();
    }

    onContextMenu(e, slot, type) {
        e.preventDefault();
        
        const menu = document.getElementById('contextMenu');
        menu.innerHTML = '';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';

        if (type === 'inventory') {
            const itemStack = this.inventory.grid[slot];
            if (itemStack) {
                const item = this.inventory.getItem(itemStack.itemId);
                
                if (item.equipSlot !== 'none') {
                    this.addContextItem(menu, '⚔️ Equip', () => {
                        const result = this.inventory.equipItem(slot);
                        if (result.success) {
                            this.renderInventory();
                            this.renderEquipment();
                            this.updateStats();
                            this.showNotification(`Equipped ${item.name}`, 'success');
                        } else {
                            this.showNotification(result.reason, 'error');
                        }
                    });
                }
                
                if (item.interactionType === 'use') {
                    this.addContextItem(menu, '🔮 Use', () => {
                        const result = this.inventory.useItem(slot);
                        if (result.success) {
                            this.renderInventory();
                            this.showNotification(`Used ${result.used}`, 'success');
                        }
                    });
                }
                
                this.addContextItem(menu, '🗑️ Drop', () => {
                    this.inventory.removeItem(slot, 1);
                    this.renderInventory();
                    this.updateInventoryInfo();
                    this.showNotification('Item dropped', 'success');
                });

                this.addContextItem(menu, '📌 Quick Slot', () => {
                    this.showNotification('Drag to quick slot', 'success');
                });
            }
        } else if (type === 'equipment') {
            const equipped = this.inventory.equipment[slot];
            if (equipped) {
                this.addContextItem(menu, '↩️ Unequip', () => {
                    const result = this.inventory.unequipItem(slot);
                    if (result.success) {
                        this.renderInventory();
                        this.renderEquipment();
                        this.updateStats();
                        this.showNotification('Item unequipped', 'success');
                    } else {
                        this.showNotification(result.reason, 'error');
                    }
                });
            }
        }

        menu.classList.add('show');
    }

    onDoubleClick(slot, type) {
        if (type === 'inventory') {
            const itemStack = this.inventory.grid[slot];
            if (itemStack) {
                const item = this.inventory.getItem(itemStack.itemId);
                
                if (item.equipSlot !== 'none') {
                    // Equip on double-click
                    const result = this.inventory.equipItem(slot);
                    if (result.success) {
                        this.renderInventory();
                        this.renderEquipment();
                        this.updateStats();
                        this.showNotification(`Equipped ${item.name}`, 'success');
                    }
                } else if (item.interactionType === 'use') {
                    // Use on double-click
                    const result = this.inventory.useItem(slot);
                    if (result.success) {
                        this.renderInventory();
                        this.showNotification(`Used ${result.used}`, 'success');
                    }
                }
            }
        } else if (type === 'equipment') {
            // Unequip on double-click
            const result = this.inventory.unequipItem(slot);
            if (result.success) {
                this.renderInventory();
                this.renderEquipment();
                this.updateStats();
                this.showNotification('Item unequipped', 'success');
            }
        }
    }

    addContextItem(menu, text, callback) {
        const item = document.createElement('div');
        item.className = 'context-item';
        item.textContent = text;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            callback();
            menu.classList.remove('show');
        });
        menu.appendChild(item);
    }

    useQuickSlot(index) {
        const result = this.inventory.useQuickSlot(index);
        if (result.success) {
            this.renderInventory();
            this.renderEquipment();
            this.updateStats();
        }
    }

    assignQuickSlot(e, quickSlotIndex) {
        e.preventDefault();
        
        if (this.draggedFrom === 'inventory') {
            const result = this.inventory.setQuickSlot(quickSlotIndex, this.draggedSlot);
            if (result.success) {
                this.renderQuickSlots();
                this.showNotification(`Quick slot ${quickSlotIndex + 1} assigned`, 'success');
            }
        }
    }

    // Rendering
    renderInventory() {
        const grid = document.getElementById('inventoryGrid');
        const slots = grid.querySelectorAll('.inventory-slot');

        slots.forEach((slotElement, index) => {
            const itemStack = this.inventory.grid[index];
            
            // Clear slot
            slotElement.innerHTML = '';
            slotElement.classList.remove('filled');
            slotElement.draggable = false;

            if (itemStack) {
                const item = this.inventory.getItem(itemStack.itemId);
                if (item) {
                    slotElement.classList.add('filled');
                    slotElement.draggable = true;

                    // Rarity indicator
                    const rarity = document.createElement('div');
                    rarity.className = `item-rarity rarity-${item.rarity}`;
                    slotElement.appendChild(rarity);

                    // Icon
                    const icon = document.createElement('div');
                    icon.className = 'item-icon';
                    icon.style.backgroundImage = `url('placeholder_icon.png')`; // Would use actual texture
                    slotElement.appendChild(icon);

                    // Quantity
                    if (itemStack.quantity > 1) {
                        const quantity = document.createElement('div');
                        quantity.className = 'item-quantity';
                        quantity.textContent = itemStack.quantity;
                        slotElement.appendChild(quantity);
                    }
                }
            }
        });
    }

    renderEquipment() {
        const slots = document.querySelectorAll('.equipment-slot');
        
        slots.forEach(slotElement => {
            const slotName = slotElement.dataset.slot;
            const equipped = this.inventory.equipment[slotName];
            
            slotElement.classList.remove('filled');
            const iconElement = slotElement.querySelector('.slot-icon');
            iconElement.style.backgroundImage = '';

            if (equipped) {
                slotElement.classList.add('filled');
                iconElement.style.backgroundImage = `url('placeholder_icon.png')`;
            }
        });
    }

    renderQuickSlots() {
        const slots = document.querySelectorAll('.quickslot');
        
        slots.forEach((slotElement, index) => {
            const quickSlot = this.inventory.quickSlots[index];
            slotElement.innerHTML = `<span class="quickslot-number">${index === 9 ? '0' : index + 1}</span>`;
            
            if (quickSlot) {
                const icon = document.createElement('div');
                icon.className = 'slot-icon';
                icon.style.backgroundImage = `url('placeholder_icon.png')`;
                slotElement.appendChild(icon);
            }
        });
    }

    updateStats() {
        const stats = this.inventory.calculateTotalStats();
        
        document.getElementById('statDamage').textContent = stats.damage;
        document.getElementById('statDefense').textContent = stats.defense;
        document.getElementById('statStrength').textContent = stats.strength;
        document.getElementById('statAgility').textContent = stats.agility;
        document.getElementById('statIntelligence').textContent = stats.intelligence;
        document.getElementById('statVitality').textContent = stats.vitality;
    }

    updateInventoryInfo() {
        const stats = this.inventory.getStats();
        
        document.getElementById('goldAmount').textContent = this.inventory.gold;
        document.getElementById('slotsUsed').textContent = `${stats.usedSlots}/${stats.totalSlots}`;
        document.getElementById('weightAmount').textContent = `${stats.currentWeight}/${stats.maxWeight}`;
        
        const weightFill = document.getElementById('weightFill');
        weightFill.style.width = `${stats.weightPercent}%`;
        
        if (parseFloat(stats.weightPercent) > 80) {
            weightFill.classList.add('warning');
        } else {
            weightFill.classList.remove('warning');
        }
    }

    // Tooltip
    showTooltip(e, item, quantity) {
        const tooltip = document.getElementById('tooltip');
        
        let html = `
            <div class="tooltip-name" style="color: ${this.getRarityColor(item.rarity)}">${item.name}</div>
            <div class="tooltip-rarity">${item.rarity.toUpperCase()} - Level ${item.level}</div>
        `;

        if (item.damage || item.defense) {
            html += '<div class="tooltip-stats">';
            if (item.damage) html += `<div class="tooltip-stat"><span>⚔️ Damage</span><span>${item.damage}</span></div>`;
            if (item.defense) html += `<div class="tooltip-stat"><span>🛡️ Defense</span><span>${item.defense}</span></div>`;
            if (item.strength) html += `<div class="tooltip-stat"><span>💪 Strength</span><span>+${item.strength}</span></div>`;
            if (item.agility) html += `<div class="tooltip-stat"><span>🏃 Agility</span><span>+${item.agility}</span></div>`;
            if (item.intelligence) html += `<div class="tooltip-stat"><span>🧠 Intelligence</span><span>+${item.intelligence}</span></div>`;
            if (item.vitality) html += `<div class="tooltip-stat"><span>❤️ Vitality</span><span>+${item.vitality}</span></div>`;
            html += '</div>';
        }

        html += `<div class="tooltip-description">${item.description}</div>`;

        if (item.requiredLevel > 1 || item.requiredClass) {
            html += '<div class="tooltip-requirements">';
            if (item.requiredLevel > 1) html += `Requires level ${item.requiredLevel}<br>`;
            if (item.requiredClass) html += `Requires ${item.requiredClass}`;
            html += '</div>';
        }

        if (item.price > 0) {
            html += `<div class="tooltip-price">💰 ${item.price} gold</div>`;
        }

        if (quantity > 1) {
            html += `<div style="margin-top: 10px; color: #4a90e2">Quantity: ${quantity}</div>`;
        }

        tooltip.innerHTML = html;
        tooltip.style.left = (e.pageX + 15) + 'px';
        tooltip.style.top = (e.pageY + 15) + 'px';
        tooltip.classList.add('show');
    }

    hideTooltip() {
        document.getElementById('tooltip').classList.remove('show');
    }

    getRarityColor(rarity) {
        const colors = {
            common: '#fff',
            uncommon: '#2ecc71',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12',
            mythic: '#e74c3c'
        };
        return colors[rarity] || '#fff';
    }

    // Notifications
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${type === 'success' ? '✓' : '✗'} ${type.toUpperCase()}</div>
            <div>${message}</div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new InventoryUI());
} else {
    new InventoryUI();
}
