// world_generation/inventory_ui.js
// Inventory UI with drag-and-drop, tooltips, and visual feedback

/**
 * InventoryUI - Visual inventory interface with drag-and-drop
 */
class InventoryUI {
  constructor(inventory, equipment) {
    this.inventory = inventory;
    this.equipment = equipment;
    this.isOpen = false;
    this.draggedItem = null;
    this.draggedFromSlot = null;
    this.draggedFromType = null; // 'inventory' or 'equipment'
    
    this.createUI();
    this.setupEventListeners();
    
    // Listen to inventory changes
    this.inventory.onChange = () => this.updateInventoryDisplay();
    this.equipment.onChange = () => this.updateEquipmentDisplay();
  }

  createUI() {
    // Main container
    this.container = document.createElement('div');
    this.container.id = 'inventoryUI';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      background: rgba(20, 20, 30, 0.95);
      border: 2px solid #4a5568;
      border-radius: 12px;
      padding: 20px;
      display: none;
      z-index: 1000;
      color: #fff;
      font-family: 'Segoe UI', Arial, sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #4a5568;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Inventory';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: #e53e3e;
      border: none;
      color: white;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
    `;
    closeBtn.onclick = () => this.close();
    
    titleBar.appendChild(title);
    titleBar.appendChild(closeBtn);
    this.container.appendChild(titleBar);

    // Main content area
    const content = document.createElement('div');
    content.style.cssText = `
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    `;

    // Left side: Inventory grid
    const inventoryPanel = document.createElement('div');
    inventoryPanel.style.cssText = `
      background: rgba(30, 30, 40, 0.6);
      border-radius: 8px;
      padding: 15px;
    `;
    
    const invTitle = document.createElement('div');
    invTitle.innerHTML = '<b>Inventory</b>';
    invTitle.style.marginBottom = '10px';
    inventoryPanel.appendChild(invTitle);

    // Weight display
    this.weightDisplay = document.createElement('div');
    this.weightDisplay.style.cssText = `
      font-size: 12px;
      color: #a0aec0;
      margin-bottom: 10px;
    `;
    inventoryPanel.appendChild(this.weightDisplay);

    // Inventory grid
    this.inventoryGrid = document.createElement('div');
    this.inventoryGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    `;
    inventoryPanel.appendChild(this.inventoryGrid);

    // Right side: Equipment
    const equipmentPanel = document.createElement('div');
    equipmentPanel.style.cssText = `
      background: rgba(30, 30, 40, 0.6);
      border-radius: 8px;
      padding: 15px;
    `;
    
    const eqTitle = document.createElement('div');
    eqTitle.innerHTML = '<b>Equipment</b>';
    eqTitle.style.marginBottom = '10px';
    equipmentPanel.appendChild(eqTitle);

    // Equipment slots
    this.equipmentSlots = document.createElement('div');
    this.equipmentSlots.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    equipmentPanel.appendChild(this.equipmentSlots);

    // Stats display
    this.statsDisplay = document.createElement('div');
    this.statsDisplay.style.cssText = `
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #4a5568;
      font-size: 13px;
    `;
    equipmentPanel.appendChild(this.statsDisplay);

    content.appendChild(inventoryPanel);
    content.appendChild(equipmentPanel);
    this.container.appendChild(content);

    // Tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.style.cssText = `
      position: fixed;
      background: rgba(10, 10, 20, 0.95);
      border: 2px solid #4a5568;
      border-radius: 8px;
      padding: 12px;
      display: none;
      z-index: 2000;
      pointer-events: none;
      max-width: 300px;
      font-size: 13px;
      color: #fff;
    `;
    document.body.appendChild(this.tooltip);

    document.body.appendChild(this.container);
    
    // Create slots
    this.createInventorySlots();
    this.createEquipmentSlots();
  }

  createInventorySlots() {
    for (let i = 0; i < this.inventory.size; i++) {
      const slot = this.createSlot(i, 'inventory');
      this.inventoryGrid.appendChild(slot);
    }
  }

  createEquipmentSlots() {
    const slots = ['head', 'chest', 'legs', 'feet', 'weapon', 'shield'];
    const labels = {
      head: '⛑️ Head',
      chest: '🦺 Chest',
      legs: '👖 Legs',
      feet: '👟 Feet',
      weapon: '⚔️ Weapon',
      shield: '🛡️ Shield'
    };

    for (let slotName of slots) {
      const slotContainer = document.createElement('div');
      slotContainer.style.cssText = `
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 8px;
        align-items: center;
      `;

      const label = document.createElement('div');
      label.textContent = labels[slotName];
      label.style.fontSize = '12px';

      const slot = this.createSlot(slotName, 'equipment');
      slot.style.width = '60px';
      slot.style.height = '60px';

      slotContainer.appendChild(label);
      slotContainer.appendChild(slot);
      this.equipmentSlots.appendChild(slotContainer);
    }
  }

  createSlot(index, type) {
    const slot = document.createElement('div');
    slot.className = `inv-slot ${type}-slot`;
    slot.dataset.index = index;
    slot.dataset.type = type;
    slot.style.cssText = `
      width: 60px;
      height: 60px;
      background: rgba(40, 40, 50, 0.8);
      border: 2px solid #4a5568;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    `;

    // Drag and drop events
    slot.addEventListener('mouseenter', (e) => this.showTooltip(e, index, type));
    slot.addEventListener('mouseleave', () => this.hideTooltip());
    slot.addEventListener('mousedown', (e) => this.startDrag(e, index, type));
    slot.addEventListener('mouseup', (e) => this.endDrag(e, index, type));
    slot.addEventListener('mouseover', () => {
      if (!this.draggedItem) {
        slot.style.background = 'rgba(60, 60, 70, 0.9)';
        slot.style.borderColor = '#5a7fab';
      }
    });
    slot.addEventListener('mouseout', () => {
      if (!this.draggedItem) {
        slot.style.background = 'rgba(40, 40, 50, 0.8)';
        slot.style.borderColor = '#4a5568';
      }
    });

    return slot;
  }

  updateInventoryDisplay() {
    const slots = this.inventoryGrid.querySelectorAll('.inv-slot');
    slots.forEach((slotElement, index) => {
      const item = this.inventory.getItem(index);
      this.updateSlotDisplay(slotElement, item);
    });
    
    // Update weight
    const weight = this.inventory.getTotalWeight();
    const maxWeight = this.inventory.maxWeight;
    const percentage = (weight / maxWeight * 100).toFixed(0);
    this.weightDisplay.innerHTML = `Weight: <b>${weight.toFixed(1)}/${maxWeight}</b> (${percentage}%)`;
  }

  updateEquipmentDisplay() {
    const slots = this.equipmentSlots.querySelectorAll('.equipment-slot');
    slots.forEach((slotElement) => {
      const slotName = slotElement.dataset.index;
      const item = this.equipment.getSlot(slotName);
      this.updateSlotDisplay(slotElement, item);
    });

    // Update stats
    const stats = this.equipment.getTotalStats();
    let statsHTML = '<b>Total Stats:</b><br>';
    if (Object.keys(stats).length === 0) {
      statsHTML += '<i style="color:#888">No equipment</i>';
    } else {
      for (let stat in stats) {
        statsHTML += `${stat}: <b style="color:#5ac95a">+${stats[stat]}</b><br>`;
      }
    }
    this.statsDisplay.innerHTML = statsHTML;
  }

  updateSlotDisplay(slotElement, item) {
    slotElement.innerHTML = '';
    
    if (item) {
      // Icon
      const icon = document.createElement('div');
      icon.style.cssText = `
        font-size: 32px;
        user-select: none;
      `;
      icon.textContent = item.icon;
      slotElement.appendChild(icon);

      // Quantity
      if (item.stackable && item.quantity > 1) {
        const qty = document.createElement('div');
        qty.style.cssText = `
          position: absolute;
          bottom: 2px;
          right: 4px;
          font-size: 11px;
          font-weight: bold;
          background: rgba(0,0,0,0.7);
          padding: 2px 4px;
          border-radius: 3px;
        `;
        qty.textContent = item.quantity;
        slotElement.appendChild(qty);
      }

      // Rarity border
      slotElement.style.borderColor = item.getRarityColor();
    }
  }

  showTooltip(event, index, type) {
    let item = null;
    if (type === 'inventory') {
      item = this.inventory.getItem(index);
    } else if (type === 'equipment') {
      item = this.equipment.getSlot(index);
    }

    if (!item) {
      this.hideTooltip();
      return;
    }

    // Build tooltip HTML
    let html = `
      <div style="color:${item.getRarityColor()};font-weight:bold;font-size:14px;margin-bottom:5px;">
        ${item.icon} ${item.name}
      </div>
      <div style="color:#a0aec0;font-size:11px;margin-bottom:8px;">
        ${item.type} - ${item.rarity}
      </div>
      <div style="margin-bottom:8px;">${item.description}</div>
    `;

    if (item.stats && Object.keys(item.stats).length > 0) {
      html += '<div style="border-top:1px solid #4a5568;padding-top:5px;margin-top:5px;">';
      for (let stat in item.stats) {
        html += `<div style="color:#5ac95a;">${stat}: +${item.stats[stat]}</div>`;
      }
      html += '</div>';
    }

    html += `
      <div style="border-top:1px solid #4a5568;padding-top:5px;margin-top:8px;font-size:11px;color:#888;">
        Weight: ${item.weight} | Value: ${item.value}g
      </div>
    `;

    this.tooltip.innerHTML = html;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = (event.pageX + 15) + 'px';
    this.tooltip.style.top = (event.pageY - 10) + 'px';
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  startDrag(event, index, type) {
    event.preventDefault();
    
    let item = null;
    if (type === 'inventory') {
      item = this.inventory.getItem(index);
    } else if (type === 'equipment') {
      item = this.equipment.getSlot(index);
    }

    if (!item) return;

    this.draggedItem = item;
    this.draggedFromSlot = index;
    this.draggedFromType = type;

    // Visual feedback
    event.target.style.opacity = '0.5';
    document.body.style.cursor = 'grabbing';
  }

  endDrag(event, toIndex, toType) {
    if (!this.draggedItem) return;

    // Handle the drop
    if (this.draggedFromType === 'inventory' && toType === 'inventory') {
      // Inventory to inventory
      this.inventory.swapSlots(this.draggedFromSlot, toIndex);
    } else if (this.draggedFromType === 'inventory' && toType === 'equipment') {
      // Inventory to equipment
      const item = this.inventory.removeItem(this.draggedFromSlot);
      if (item && this.equipment.canEquip(item, toIndex)) {
        const unequipped = this.equipment.equip(item, toIndex);
        if (unequipped) {
          this.inventory.addItem(unequipped);
        }
      } else if (item) {
        this.inventory.addItem(item); // Put it back
      }
    } else if (this.draggedFromType === 'equipment' && toType === 'inventory') {
      // Equipment to inventory
      const item = this.equipment.unequip(this.draggedFromSlot);
      if (item) {
        if (!this.inventory.addItem(item)) {
          // If inventory full, re-equip
          this.equipment.equip(item, this.draggedFromSlot);
        }
      }
    } else if (this.draggedFromType === 'equipment' && toType === 'equipment') {
      // Equipment to equipment (swap)
      const item1 = this.equipment.unequip(this.draggedFromSlot);
      const item2 = this.equipment.unequip(toIndex);
      if (item1 && this.equipment.canEquip(item1, toIndex)) {
        this.equipment.equip(item1, toIndex);
      } else if (item1) {
        this.equipment.equip(item1, this.draggedFromSlot);
      }
      if (item2 && this.equipment.canEquip(item2, this.draggedFromSlot)) {
        this.equipment.equip(item2, this.draggedFromSlot);
      } else if (item2) {
        this.equipment.equip(item2, toIndex);
      }
    }

    // Reset
    const allSlots = document.querySelectorAll('.inv-slot, .equipment-slot');
    allSlots.forEach(slot => slot.style.opacity = '1');
    document.body.style.cursor = 'default';
    
    this.draggedItem = null;
    this.draggedFromSlot = null;
    this.draggedFromType = null;

    this.updateInventoryDisplay();
    this.updateEquipmentDisplay();
  }

  open() {
    this.isOpen = true;
    this.container.style.display = 'block';
    this.updateInventoryDisplay();
    this.updateEquipmentDisplay();
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.hideTooltip();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  setupEventListeners() {
    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
}

// Export
if (typeof window !== 'undefined') {
  window.InventoryUI = InventoryUI;
}
