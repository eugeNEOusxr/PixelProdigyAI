/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                      SHOP UI v1.0.0                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Beautiful shop interface with:                                       ║
 * ║  • Merchant inventory display                                        ║
 * ║  • Player inventory for selling                                      ║
 * ║  • Buy/Sell tabs                                                     ║
 * ║  • Price display with trends                                         ║
 * ║  • Reputation and discounts                                          ║
 * ║  • Quantity controls                                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class ShopUI {
  constructor(shopManager) {
    this.shopManager = shopManager;
    this.isOpen = false;
    
    // UI state
    this.currentTab = 'buy'; // 'buy' or 'sell'
    this.selectedItem = null;
    this.quantity = 1;
    
    // UI elements
    this.container = null;
    this.merchantStock = null;
    this.playerInventoryView = null;
    this.itemDetails = null;
    
    this.createUI();
  }
  
  createUI() {
    // Main container
    this.container = document.createElement('div');
    this.container.id = 'shop-ui';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1000px;
      height: 650px;
      background: linear-gradient(135deg, #1a0f08 0%, #2c1810 100%);
      border: 4px solid #d4af37;
      border-radius: 15px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.9);
      display: none;
      flex-direction: column;
      z-index: 1000;
      font-family: 'Courier New', monospace;
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px;
      background: rgba(212, 175, 55, 0.2);
      border-bottom: 3px solid #d4af37;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <div>
        <h2 style="margin: 0; color: #ffd700; font-size: 26px; text-shadow: 2px 2px 4px #000;">
          🏪 <span id="merchant-name">Shop</span>
        </h2>
        <p style="margin: 5px 0 0 0; color: #aaa; font-size: 14px; font-style: italic;">
          "<span id="merchant-greeting">Welcome!</span>"
        </p>
      </div>
      <div style="text-align: right;">
        <div style="color: #ffd700; font-size: 18px; margin-bottom: 5px;">
          💰 <span id="player-gold">0</span>
        </div>
        <div style="color: #aaa; font-size: 12px;">
          Reputation: <span id="merchant-reputation" style="color: #00ff00;">0</span>
        </div>
        <button id="close-shop" style="
          background: #8b0000;
          border: 2px solid #ff0000;
          color: white;
          padding: 5px 12px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 5px;
        ">✕ Close</button>
      </div>
    `;
    this.container.appendChild(header);
    
    // Tab buttons
    const tabs = document.createElement('div');
    tabs.style.cssText = `
      display: flex;
      background: rgba(0,0,0,0.3);
      border-bottom: 2px solid #d4af37;
    `;
    tabs.innerHTML = `
      <button id="buy-tab" class="shop-tab active" style="
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #2a7cff 0%, #1850a8 100%);
        border: none;
        border-right: 1px solid #d4af37;
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      ">🛒 BUY</button>
      <button id="sell-tab" class="shop-tab" style="
        flex: 1;
        padding: 12px;
        background: rgba(0,0,0,0.5);
        border: none;
        color: #aaa;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      ">💰 SELL</button>
    `;
    this.container.appendChild(tabs);
    
    // Main content area
    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      flex: 1;
      overflow: hidden;
    `;
    
    // Item list (left side)
    const listContainer = document.createElement('div');
    listContainer.style.cssText = `
      width: 55%;
      overflow-y: auto;
      border-right: 3px solid #d4af37;
      padding: 15px;
      background: rgba(0,0,0,0.2);
    `;
    listContainer.innerHTML = `
      <div id="shop-items-list"></div>
    `;
    content.appendChild(listContainer);
    
    // Item details (right side)
    this.itemDetails = document.createElement('div');
    this.itemDetails.style.cssText = `
      width: 45%;
      padding: 20px;
      overflow-y: auto;
    `;
    this.itemDetails.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        font-size: 18px;
      ">
        Select an item to view details
      </div>
    `;
    content.appendChild(this.itemDetails);
    
    this.container.appendChild(content);
    
    document.body.appendChild(this.container);
    
    // Event listeners
    document.getElementById('close-shop').onclick = () => this.close();
    document.getElementById('buy-tab').onclick = () => this.switchTab('buy');
    document.getElementById('sell-tab').onclick = () => this.switchTab('sell');
    
    console.log('🏪 Shop UI created');
  }
  
  open(merchantId) {
    if (!this.shopManager.openShop(merchantId)) {
      console.log('Failed to open shop');
      return;
    }
    
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.currentTab = 'buy';
    this.selectedItem = null;
    
    this.updateShopInfo();
    this.updateItemList();
    
    console.log('🏪 Shop opened');
  }
  
  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.shopManager.closeShop();
  }
  
  toggle(merchantId) {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(merchantId);
    }
  }
  
  switchTab(tab) {
    this.currentTab = tab;
    this.selectedItem = null;
    
    // Update tab styles
    const buyTab = document.getElementById('buy-tab');
    const sellTab = document.getElementById('sell-tab');
    
    if (tab === 'buy') {
      buyTab.style.background = 'linear-gradient(135deg, #2a7cff 0%, #1850a8 100%)';
      buyTab.style.color = 'white';
      sellTab.style.background = 'rgba(0,0,0,0.5)';
      sellTab.style.color = '#aaa';
    } else {
      sellTab.style.background = 'linear-gradient(135deg, #ff9500 0%, #ff6000 100%)';
      sellTab.style.color = 'white';
      buyTab.style.background = 'rgba(0,0,0,0.5)';
      buyTab.style.color = '#aaa';
    }
    
    this.updateItemList();
    this.itemDetails.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        font-size: 18px;
      ">
        Select an item to view details
      </div>
    `;
  }
  
  updateShopInfo() {
    const info = this.shopManager.getShopInfo();
    if (!info) return;
    
    document.getElementById('merchant-name').textContent = info.name;
    document.getElementById('merchant-greeting').textContent = info.greeting;
    
    const wallet = this.shopManager.playerWallet;
    document.getElementById('player-gold').textContent = wallet.toString();
    
    const repSpan = document.getElementById('merchant-reputation');
    repSpan.textContent = info.reputation;
    repSpan.style.color = info.reputation >= 50 ? '#00ff00' : 
                          info.reputation <= -50 ? '#ff0000' : '#ffff00';
  }
  
  updateItemList() {
    const listDiv = document.getElementById('shop-items-list');
    listDiv.innerHTML = '';
    
    let items = [];
    
    if (this.currentTab === 'buy') {
      // Show merchant's stock
      const info = this.shopManager.getShopInfo();
      if (!info) return;
      
      items = info.stock.map(stock => {
        const price = this.shopManager.pricing.getBuyPrice(stock.id, 1);
        const trend = this.shopManager.pricing.getPriceTrend(stock.id);
        return {
          id: stock.id,
          quantity: stock.quantity,
          price: price,
          trend: trend
        };
      });
    } else {
      // Show player's inventory
      const inventory = this.shopManager.playerInventory;
      if (!inventory.items) return;
      
      items = inventory.items.filter(item => item !== null).map(item => {
        const price = this.shopManager.pricing.getSellPrice(item.id, 1, this.shopManager.currentMerchant.sellRatio);
        const trend = this.shopManager.pricing.getPriceTrend(item.id);
        return {
          id: item.id,
          quantity: item.quantity || 1,
          price: price,
          trend: trend
        };
      });
    }
    
    if (items.length === 0) {
      listDiv.innerHTML = `
        <div style="text-align: center; color: #666; padding: 20px;">
          ${this.currentTab === 'buy' ? 'Merchant has no items' : 'No items to sell'}
        </div>
      `;
      return;
    }
    
    items.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.style.cssText = `
        padding: 12px;
        margin-bottom: 10px;
        background: rgba(212, 175, 55, 0.1);
        border: 2px solid #d4af37;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      
      const icon = this.getItemIcon(item.id);
      
      itemCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 32px;">${icon}</span>
          <div style="flex: 1;">
            <div style="color: #ffd700; font-size: 16px; font-weight: bold;">
              ${this.formatItemName(item.id)}
            </div>
            <div style="color: #aaa; font-size: 13px;">
              Stock: ${item.quantity} | ${item.trend}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="color: #00ff00; font-size: 16px; font-weight: bold;">
              ${item.price.toString()}
            </div>
            <div style="color: #888; font-size: 11px;">
              ${this.currentTab === 'buy' ? 'per item' : 'you get'}
            </div>
          </div>
        </div>
      `;
      
      itemCard.onmouseover = () => {
        itemCard.style.transform = 'translateX(5px)';
        itemCard.style.background = 'rgba(212, 175, 55, 0.3)';
      };
      
      itemCard.onmouseout = () => {
        itemCard.style.transform = 'translateX(0)';
        itemCard.style.background = 'rgba(212, 175, 55, 0.1)';
      };
      
      itemCard.onclick = () => this.selectItem(item);
      
      listDiv.appendChild(itemCard);
    });
  }
  
  selectItem(item) {
    this.selectedItem = item;
    this.quantity = 1;
    
    const icon = this.getItemIcon(item.id);
    const price = this.currentTab === 'buy' ? 
      this.shopManager.pricing.getBuyPrice(item.id, 1) :
      this.shopManager.pricing.getSellPrice(item.id, 1, this.shopManager.currentMerchant.sellRatio);
    
    this.itemDetails.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 80px; margin-bottom: 10px;">${icon}</div>
        <h2 style="color: #ffd700; margin: 0;">${this.formatItemName(item.id)}</h2>
        <p style="color: #aaa; font-style: italic; font-size: 14px;">
          ${this.getItemDescription(item.id)}
        </p>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">
          ${this.currentTab === 'buy' ? '💰 Price' : '💵 You Receive'}
        </div>
        <div style="color: #00ff00; font-size: 24px; font-weight: bold;">
          ${price.toString()}
        </div>
        <div style="color: #888; font-size: 12px; margin-top: 5px;">
          ${item.trend}
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="color: #ffd700; margin-bottom: 10px;">Quantity</div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button id="qty-minus" style="
            background: #8b4513;
            border: 2px solid #ffd700;
            color: white;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
          ">-</button>
          <input type="number" id="trade-quantity" min="1" max="${item.quantity}" value="1" style="
            width: 80px;
            padding: 10px;
            background: #1a1a1a;
            border: 2px solid #8b4513;
            border-radius: 5px;
            color: white;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
          "/>
          <button id="qty-plus" style="
            background: #8b4513;
            border: 2px solid #ffd700;
            color: white;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
          ">+</button>
          <button id="qty-max" style="
            background: #2a7cff;
            border: 2px solid #ffd700;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          ">MAX</button>
        </div>
        <div style="color: #aaa; font-size: 13px; margin-top: 8px;">
          Available: ${item.quantity}
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="color: #ffd700; margin-bottom: 8px;">Total</div>
        <div id="total-price" style="color: #00ff00; font-size: 28px; font-weight: bold;">
          ${price.toString()}
        </div>
      </div>
      
      <button id="trade-btn" style="
        width: 100%;
        padding: 18px;
        background: linear-gradient(135deg, #ff9500, #ffd700);
        border: 3px solid #ffd700;
        border-radius: 10px;
        color: #000;
        font-size: 22px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
      ">
        ${this.currentTab === 'buy' ? '🛒 BUY NOW' : '💰 SELL NOW'}
      </button>
    `;
    
    // Quantity controls
    const qtyInput = document.getElementById('trade-quantity');
    const updateTotal = () => {
      const qty = parseInt(qtyInput.value) || 1;
      this.quantity = Math.max(1, Math.min(item.quantity, qty));
      qtyInput.value = this.quantity;
      
      const totalPrice = this.currentTab === 'buy' ?
        this.shopManager.pricing.getBuyPrice(item.id, this.quantity) :
        this.shopManager.pricing.getSellPrice(item.id, this.quantity, this.shopManager.currentMerchant.sellRatio);
      
      document.getElementById('total-price').textContent = totalPrice.toString();
    };
    
    document.getElementById('qty-minus').onclick = () => {
      qtyInput.value = Math.max(1, this.quantity - 1);
      updateTotal();
    };
    
    document.getElementById('qty-plus').onclick = () => {
      qtyInput.value = Math.min(item.quantity, this.quantity + 1);
      updateTotal();
    };
    
    document.getElementById('qty-max').onclick = () => {
      qtyInput.value = item.quantity;
      updateTotal();
    };
    
    qtyInput.oninput = updateTotal;
    
    // Trade button
    const tradeBtn = document.getElementById('trade-btn');
    tradeBtn.onmouseover = () => {
      tradeBtn.style.transform = 'scale(1.05)';
      tradeBtn.style.boxShadow = '0 5px 25px rgba(255, 215, 0, 0.6)';
    };
    tradeBtn.onmouseout = () => {
      tradeBtn.style.transform = 'scale(1)';
      tradeBtn.style.boxShadow = 'none';
    };
    tradeBtn.onclick = () => this.executeTrade();
  }
  
  executeTrade() {
    if (!this.selectedItem) return;
    
    let success = false;
    
    if (this.currentTab === 'buy') {
      success = this.shopManager.buyItem(this.selectedItem.id, this.quantity);
    } else {
      success = this.shopManager.sellItem(this.selectedItem.id, this.quantity);
    }
    
    if (success) {
      // Update UI
      this.updateShopInfo();
      this.updateItemList();
      this.selectedItem = null;
      this.itemDetails.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #00ff00;
          font-size: 20px;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
          <div>Trade Successful!</div>
        </div>
      `;
      
      // Auto-clear success message after 2 seconds
      setTimeout(() => {
        if (!this.selectedItem) {
          this.itemDetails.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #666;
              font-size: 18px;
            ">
              Select an item to view details
            </div>
          `;
        }
      }, 2000);
    }
  }
  
  getItemIcon(itemId) {
    const icons = {
      wood: '🪵', iron_ore: '⛏️', coal: '⚫', rope: '🧵', leather: '🧰',
      cloth: '🧶', iron_ingot: '⚙️', steel_ingot: '⚙️',
      wooden_sword: '🗡️', iron_sword: '⚔️', steel_sword: '⚔️', bow: '🏹',
      leather_armor: '🛡️', iron_armor: '🛡️',
      pickaxe: '⛏️', axe: '🪓',
      health_potion: '❤️', mana_potion: '💙', strength_potion: '💪',
      cooked_meat: '🍖', bread: '🍞',
      red_herb: '🌿', blue_herb: '🌿', yellow_herb: '🌿',
      glass_bottle: '🧪', plant_fiber: '🌾', wheat: '🌾'
    };
    return icons[itemId] || '📦';
  }
  
  formatItemName(itemId) {
    return itemId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  getItemDescription(itemId) {
    const descriptions = {
      health_potion: 'Restores 50 HP instantly',
      mana_potion: 'Restores 50 mana instantly',
      strength_potion: '+25% damage for 60 seconds',
      iron_sword: 'A sturdy iron blade for combat',
      steel_sword: 'A high-quality steel blade',
      wooden_sword: 'A basic wooden sword',
      bow: 'A wooden bow for ranged combat',
      leather_armor: 'Basic protection from leather',
      iron_armor: 'Heavy iron plate armor'
    };
    return descriptions[itemId] || 'A useful item';
  }
  
  update() {
    if (!this.isOpen) return;
    // Update gold display
    this.updateShopInfo();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShopUI };
}
