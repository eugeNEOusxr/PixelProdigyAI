/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    CRAFTING UI v1.0.0                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Beautiful crafting interface with:                                   ║
 * ║  • Recipe browser with search/filter                                 ║
 * ║  • Material requirements display                                     ║
 * ║  • Crafting progress bar                                             ║
 * ║  • Batch crafting controls                                           ║
 * ║  • Station-based filtering                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class CraftingUI {
  constructor(craftingManager, playerLevel = 1) {
    this.craftingManager = craftingManager;
    this.playerLevel = playerLevel;
    this.isOpen = false;
    
    // UI state
    this.selectedRecipe = null;
    this.searchQuery = '';
    this.categoryFilter = 'all';
    this.showOnlyCraftable = false;
    this.craftQuantity = 1;
    
    // UI elements (created dynamically)
    this.container = null;
    this.recipeList = null;
    this.recipeDetails = null;
    this.searchInput = null;
    
    this.createUI();
  }
  
  createUI() {
    // Main container
    this.container = document.createElement('div');
    this.container.id = 'crafting-ui';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 900px;
      height: 600px;
      background: linear-gradient(135deg, #2c1810 0%, #1a0f08 100%);
      border: 3px solid #8b4513;
      border-radius: 15px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.8);
      display: none;
      flex-direction: column;
      z-index: 1000;
      font-family: 'Courier New', monospace;
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px;
      background: rgba(139, 69, 19, 0.3);
      border-bottom: 2px solid #8b4513;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h2 style="margin: 0; color: #ffd700; font-size: 24px;">
        🔨 Crafting Station: <span id="station-name">None</span>
      </h2>
      <button id="close-crafting" style="
        background: #8b0000;
        border: 2px solid #ff0000;
        color: white;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      ">✕</button>
    `;
    this.container.appendChild(header);
    
    // Search and filters
    const controls = document.createElement('div');
    controls.style.cssText = `
      padding: 10px 15px;
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid #8b4513;
      display: flex;
      gap: 10px;
      align-items: center;
    `;
    
    controls.innerHTML = `
      <input 
        type="text" 
        id="recipe-search" 
        placeholder="🔍 Search recipes..."
        style="
          flex: 1;
          padding: 8px;
          background: #1a1a1a;
          border: 2px solid #8b4513;
          border-radius: 5px;
          color: white;
          font-size: 14px;
        "
      />
      
      <select id="category-filter" style="
        padding: 8px;
        background: #1a1a1a;
        border: 2px solid #8b4513;
        border-radius: 5px;
        color: white;
        font-size: 14px;
      ">
        <option value="all">All Categories</option>
        <option value="weapon">⚔️ Weapons</option>
        <option value="armor">🛡️ Armor</option>
        <option value="potion">🧪 Potions</option>
        <option value="tool">⛏️ Tools</option>
        <option value="material">⚙️ Materials</option>
        <option value="consumable">🍖 Consumables</option>
      </select>
      
      <label style="color: #ffd700; display: flex; align-items: center; gap: 5px; cursor: pointer;">
        <input type="checkbox" id="craftable-only" />
        Craftable Only
      </label>
    `;
    this.container.appendChild(controls);
    
    // Main content area
    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      flex: 1;
      overflow: hidden;
    `;
    
    // Recipe list (left side)
    this.recipeList = document.createElement('div');
    this.recipeList.style.cssText = `
      width: 45%;
      overflow-y: auto;
      border-right: 2px solid #8b4513;
      padding: 10px;
    `;
    content.appendChild(this.recipeList);
    
    // Recipe details (right side)
    this.recipeDetails = document.createElement('div');
    this.recipeDetails.style.cssText = `
      width: 55%;
      padding: 20px;
      overflow-y: auto;
    `;
    this.recipeDetails.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        font-size: 18px;
      ">
        Select a recipe to view details
      </div>
    `;
    content.appendChild(this.recipeDetails);
    
    this.container.appendChild(content);
    
    // Progress bar (bottom)
    const progressContainer = document.createElement('div');
    progressContainer.id = 'craft-progress-container';
    progressContainer.style.cssText = `
      padding: 15px;
      background: rgba(0,0,0,0.3);
      border-top: 2px solid #8b4513;
      display: none;
    `;
    progressContainer.innerHTML = `
      <div style="color: #ffd700; margin-bottom: 5px; font-size: 14px;">
        Crafting: <span id="crafting-item-name">-</span>
      </div>
      <div style="
        width: 100%;
        height: 25px;
        background: #1a1a1a;
        border: 2px solid #8b4513;
        border-radius: 5px;
        overflow: hidden;
        position: relative;
      ">
        <div id="craft-progress-bar" style="
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #ff4500, #ffd700);
          transition: width 0.1s linear;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 2px black;
        " id="craft-progress-text">0%</div>
      </div>
    `;
    this.container.appendChild(progressContainer);
    
    document.body.appendChild(this.container);
    
    // Event listeners
    document.getElementById('close-crafting').onclick = () => this.close();
    this.searchInput = document.getElementById('recipe-search');
    this.searchInput.oninput = (e) => {
      this.searchQuery = e.target.value;
      this.updateRecipeList();
    };
    
    document.getElementById('category-filter').onchange = (e) => {
      this.categoryFilter = e.target.value;
      this.updateRecipeList();
    };
    
    document.getElementById('craftable-only').onchange = (e) => {
      this.showOnlyCraftable = e.target.checked;
      this.updateRecipeList();
    };
    
    console.log('🎨 Crafting UI created');
  }
  
  open(stationName = 'none') {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.craftingManager.setStation(stationName);
    
    // Update station name
    document.getElementById('station-name').textContent = 
      stationName.charAt(0).toUpperCase() + stationName.slice(1);
    
    this.updateRecipeList();
  }
  
  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }
  
  toggle(stationName = 'none') {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(stationName);
    }
  }
  
  updateRecipeList() {
    let recipes = this.craftingManager.getAllRecipes();
    
    // Apply search
    if (this.searchQuery) {
      recipes = this.craftingManager.searchRecipes(this.searchQuery);
    }
    
    // Apply category filter
    if (this.categoryFilter !== 'all') {
      recipes = recipes.filter(r => r.category === this.categoryFilter);
    }
    
    // Apply craftable filter
    if (this.showOnlyCraftable) {
      recipes = recipes.filter(r => 
        r.canCraft(this.craftingManager.inventory, this.playerLevel, this.craftingManager.currentStation)
      );
    }
    
    // Sort: craftable first, then by level
    recipes.sort((a, b) => {
      const aCanCraft = a.canCraft(this.craftingManager.inventory, this.playerLevel, this.craftingManager.currentStation);
      const bCanCraft = b.canCraft(this.craftingManager.inventory, this.playerLevel, this.craftingManager.currentStation);
      if (aCanCraft && !bCanCraft) return -1;
      if (!aCanCraft && bCanCraft) return 1;
      return a.requiredLevel - b.requiredLevel;
    });
    
    // Render recipe list
    this.recipeList.innerHTML = '';
    
    if (recipes.length === 0) {
      this.recipeList.innerHTML = `
        <div style="
          text-align: center;
          color: #666;
          padding: 20px;
        ">No recipes found</div>
      `;
      return;
    }
    
    recipes.forEach(recipe => {
      const canCraft = recipe.canCraft(
        this.craftingManager.inventory, 
        this.playerLevel, 
        this.craftingManager.currentStation
      );
      
      const recipeCard = document.createElement('div');
      recipeCard.style.cssText = `
        padding: 10px;
        margin-bottom: 8px;
        background: ${canCraft ? 'rgba(0, 128, 0, 0.2)' : 'rgba(128, 0, 0, 0.2)'};
        border: 2px solid ${canCraft ? '#00ff00' : '#ff0000'};
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      
      recipeCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 32px;">${recipe.icon}</span>
          <div style="flex: 1;">
            <div style="color: #ffd700; font-size: 16px; font-weight: bold;">
              ${recipe.name}
            </div>
            <div style="color: #aaa; font-size: 12px;">
              Lvl ${recipe.requiredLevel} | ${recipe.craftTime}s
            </div>
          </div>
          ${canCraft ? '✅' : '❌'}
        </div>
      `;
      
      recipeCard.onmouseover = () => {
        recipeCard.style.transform = 'translateX(5px)';
        recipeCard.style.background = canCraft ? 'rgba(0, 128, 0, 0.4)' : 'rgba(128, 0, 0, 0.4)';
      };
      
      recipeCard.onmouseout = () => {
        recipeCard.style.transform = 'translateX(0)';
        recipeCard.style.background = canCraft ? 'rgba(0, 128, 0, 0.2)' : 'rgba(128, 0, 0, 0.2)';
      };
      
      recipeCard.onclick = () => this.selectRecipe(recipe);
      
      this.recipeList.appendChild(recipeCard);
    });
  }
  
  selectRecipe(recipe) {
    this.selectedRecipe = recipe;
    
    const canCraft = recipe.canCraft(
      this.craftingManager.inventory, 
      this.playerLevel, 
      this.craftingManager.currentStation
    );
    
    const missing = recipe.getMissingMaterials(this.craftingManager.inventory);
    
    this.recipeDetails.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 64px; margin-bottom: 10px;">${recipe.icon}</div>
        <h2 style="color: #ffd700; margin: 0;">${recipe.name}</h2>
        <p style="color: #aaa; font-style: italic;">${recipe.description}</p>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="color: #ffd700; margin-top: 0;">Requirements</h3>
        <div style="color: white;">
          <div>⭐ Level: ${recipe.requiredLevel}</div>
          <div>🔨 Station: ${recipe.requiredStation}</div>
          <div>⏱️ Time: ${recipe.craftTime}s</div>
          <div>✨ XP: ${recipe.experience}</div>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="color: #ffd700; margin-top: 0;">Materials</h3>
        ${recipe.materials.map(mat => {
          const have = this.craftingManager.inventory.countItem(mat.id);
          const need = mat.amount;
          const hasEnough = have >= need;
          return `
            <div style="
              display: flex;
              justify-content: space-between;
              color: ${hasEnough ? '#00ff00' : '#ff0000'};
              margin-bottom: 5px;
            ">
              <span>${mat.id}</span>
              <span>${have} / ${need}</span>
            </div>
          `;
        }).join('')}
      </div>
      
      ${missing.length > 0 ? `
        <div style="
          background: rgba(128, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          border: 2px solid #ff0000;
        ">
          <h3 style="color: #ff0000; margin-top: 0;">Missing Materials</h3>
          ${missing.map(m => `
            <div style="color: #ff6666;">Need ${m.missing} more ${m.id}</div>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
        <label style="color: #ffd700;">Quantity:</label>
        <button id="qty-minus" style="
          background: #8b4513;
          border: 2px solid #ffd700;
          color: white;
          padding: 5px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 18px;
        ">-</button>
        <input type="number" id="craft-quantity" min="1" max="99" value="1" style="
          width: 60px;
          padding: 5px;
          background: #1a1a1a;
          border: 2px solid #8b4513;
          border-radius: 5px;
          color: white;
          text-align: center;
          font-size: 16px;
        "/>
        <button id="qty-plus" style="
          background: #8b4513;
          border: 2px solid #ffd700;
          color: white;
          padding: 5px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 18px;
        ">+</button>
      </div>
      
      <button id="craft-btn" ${!canCraft ? 'disabled' : ''} style="
        width: 100%;
        padding: 15px;
        background: ${canCraft ? 'linear-gradient(135deg, #ff4500, #ffd700)' : '#333'};
        border: 3px solid ${canCraft ? '#ffd700' : '#666'};
        border-radius: 10px;
        color: white;
        font-size: 20px;
        font-weight: bold;
        cursor: ${canCraft ? 'pointer' : 'not-allowed'};
        transition: all 0.3s;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      ">
        ${canCraft ? '🔨 CRAFT NOW' : '❌ CANNOT CRAFT'}
      </button>
    `;
    
    // Quantity controls
    document.getElementById('qty-minus').onclick = () => {
      const input = document.getElementById('craft-quantity');
      if (input.value > 1) input.value = parseInt(input.value) - 1;
    };
    
    document.getElementById('qty-plus').onclick = () => {
      const input = document.getElementById('craft-quantity');
      input.value = parseInt(input.value) + 1;
    };
    
    // Craft button
    if (canCraft) {
      const craftBtn = document.getElementById('craft-btn');
      craftBtn.onmouseover = () => {
        craftBtn.style.transform = 'scale(1.05)';
        craftBtn.style.boxShadow = '0 5px 20px rgba(255, 215, 0, 0.5)';
      };
      craftBtn.onmouseout = () => {
        craftBtn.style.transform = 'scale(1)';
        craftBtn.style.boxShadow = 'none';
      };
      craftBtn.onclick = () => {
        const quantity = parseInt(document.getElementById('craft-quantity').value) || 1;
        this.craft(recipe, quantity);
      };
    }
  }
  
  craft(recipe, quantity = 1) {
    const success = this.craftingManager.startCraft(recipe.id, this.playerLevel, quantity);
    if (success) {
      // Show progress bar
      const progressContainer = document.getElementById('craft-progress-container');
      progressContainer.style.display = 'block';
      document.getElementById('crafting-item-name').textContent = 
        `${quantity}x ${recipe.name}`;
      
      // Refresh recipe list (materials changed)
      this.updateRecipeList();
      this.selectRecipe(recipe); // Refresh details
    }
  }
  
  update() {
    if (!this.isOpen) return;
    
    // Update progress bar if crafting
    if (this.craftingManager.currentCraft) {
      const progress = this.craftingManager.getCraftProgress();
      const progressBar = document.getElementById('craft-progress-bar');
      const progressText = document.getElementById('craft-progress-text');
      
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.floor(progress)}%`;
      }
    } else if (this.craftingManager.craftQueue.length === 0) {
      // Hide progress bar when done
      const progressContainer = document.getElementById('craft-progress-container');
      if (progressContainer) {
        progressContainer.style.display = 'none';
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CraftingUI };
}
