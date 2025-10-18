/**
 * PIXELVERSE GAMEPLAY SYSTEM
 * Core gameplay mechanics - building, placing objects, inventory, interaction
 * 
 * Creator: Jeremy
 * Following: NEW_WORLD_CONSULTATION.md - Week 3-4 Core Gameplay
 * Built with: AI Personalities #99 (Game Designer), #25 (Architect), #30 (UX Designer)
 * 
 * Features:
 * - Object placement system (100K objects)
 * - Building mechanics (snap to grid, rotation, scaling)
 * - Resource gathering (trees, rocks, ores)
 * - Crafting system (combine resources)
 * - Inventory management
 * - Player interaction
 */

class GameplaySystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.player = null;
        this.inventory = null;
        this.buildMode = false;
        this.selectedObject = null;
        this.placementPreview = null;
        this.objectsInWorld = [];
        
        // Gameplay settings
        this.settings = {
            buildSnapGrid: 1.0, // meter grid
            maxPlacementDistance: 20, // meters
            gatherDistance: 5, // meters
            interactDistance: 3, // meters
            inventorySize: 40,
            hotbarSize: 10
        };

        this.init();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    init() {
        console.log('🎮 Initializing Gameplay System...');

        // Initialize player
        this.player = new Player(
            [50000, 10, 50000], // spawn at Genesis City
            this.settings
        );

        // Initialize inventory
        this.inventory = new Inventory(
            this.settings.inventorySize,
            this.settings.hotbarSize
        );

        // Add starter items
        this.giveStarterItems();

        console.log('✅ Gameplay system ready');
    }

    giveStarterItems() {
        // Give player some starter resources
        this.inventory.addItem('wood', 50);
        this.inventory.addItem('stone', 30);
        this.inventory.addItem('fiber', 20);
        
        console.log('🎁 Starter items added to inventory');
    }

    // ==========================================
    // BUILDING SYSTEM
    // ==========================================

    enterBuildMode(objectId) {
        this.buildMode = true;
        this.selectedObject = objectId;
        this.createPlacementPreview();
        
        console.log(`🔨 Build mode: ${objectId}`);
    }

    exitBuildMode() {
        this.buildMode = false;
        this.selectedObject = null;
        this.removePlacementPreview();
        
        console.log('✅ Exited build mode');
    }

    createPlacementPreview() {
        // Create ghost preview of object
        this.placementPreview = {
            objectId: this.selectedObject,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            isValid: false,
            opacity: 0.5
        };
    }

    removePlacementPreview() {
        this.placementPreview = null;
    }

    updatePlacementPreview(mousePosition, raycaster) {
        if (!this.placementPreview) return;

        // Raycast from camera through mouse position
        const hit = raycaster.intersectTerrain(mousePosition);
        
        if (hit && hit.distance < this.settings.maxPlacementDistance) {
            // Snap to grid
            const snapped = this.snapToGrid(hit.position);
            this.placementPreview.position = snapped;
            this.placementPreview.isValid = this.isValidPlacement(snapped);
        } else {
            this.placementPreview.isValid = false;
        }
    }

    snapToGrid(position) {
        const grid = this.settings.buildSnapGrid;
        return [
            Math.round(position[0] / grid) * grid,
            position[1], // Don't snap Y (follow terrain)
            Math.round(position[2] / grid) * grid
        ];
    }

    isValidPlacement(position) {
        // Check if position is within build range
        const distance = this.calculateDistance(
            this.player.position,
            position
        );
        
        if (distance > this.settings.maxPlacementDistance) {
            return false;
        }

        // Check for collisions with other objects
        for (const obj of this.objectsInWorld) {
            const objDistance = this.calculateDistance(obj.position, position);
            if (objDistance < 2) { // 2 meter minimum spacing
                return false;
            }
        }

        // Check terrain slope (can't build on steep slopes)
        // TODO: Implement terrain slope check

        return true;
    }

    placeObject() {
        if (!this.placementPreview || !this.placementPreview.isValid) {
            console.log('❌ Invalid placement');
            return false;
        }

        // Create actual object in world
        const newObject = {
            id: this.generateObjectId(),
            objectId: this.selectedObject,
            position: [...this.placementPreview.position],
            rotation: [...this.placementPreview.rotation],
            scale: [...this.placementPreview.scale],
            owner: this.player.id,
            placedAt: Date.now()
        };

        this.objectsInWorld.push(newObject);
        
        console.log(`✅ Placed object: ${newObject.id}`);
        
        // Exit build mode or continue based on settings
        // this.exitBuildMode();
        
        return true;
    }

    rotatePlacementPreview(angle) {
        if (!this.placementPreview) return;
        this.placementPreview.rotation[1] += angle;
    }

    scalePlacementPreview(factor) {
        if (!this.placementPreview) return;
        const s = this.placementPreview.scale;
        this.placementPreview.scale = [
            Math.max(0.5, Math.min(2.0, s[0] * factor)),
            Math.max(0.5, Math.min(2.0, s[1] * factor)),
            Math.max(0.5, Math.min(2.0, s[2] * factor))
        ];
    }

    // ==========================================
    // RESOURCE GATHERING
    // ==========================================

    gatherResource(resourceNode) {
        const distance = this.calculateDistance(
            this.player.position,
            resourceNode.position
        );

        if (distance > this.settings.gatherDistance) {
            console.log('❌ Too far to gather');
            return false;
        }

        // Get resource type and yield
        const resourceType = resourceNode.type;
        const yield = resourceNode.yield || 10;

        // Add to inventory
        const added = this.inventory.addItem(resourceType, yield);

        if (added) {
            console.log(`✅ Gathered ${yield} ${resourceType}`);
            
            // Mark resource as depleted (will respawn later)
            resourceNode.depleted = true;
            resourceNode.respawnTime = Date.now() + resourceNode.respawnDelay;
            
            // Play gathering animation/sound
            this.playGatherAnimation(resourceNode);
            
            return true;
        }

        console.log('❌ Inventory full');
        return false;
    }

    playGatherAnimation(resourceNode) {
        // TODO: Implement gathering animation
        console.log(`🎬 Playing gather animation for ${resourceNode.type}`);
    }

    // ==========================================
    // CRAFTING SYSTEM
    // ==========================================

    craftItem(recipeId) {
        const recipe = CraftingRecipes[recipeId];
        
        if (!recipe) {
            console.log('❌ Unknown recipe');
            return false;
        }

        // Check if player has required materials
        for (const [material, amount] of Object.entries(recipe.materials)) {
            if (!this.inventory.hasItem(material, amount)) {
                console.log(`❌ Missing: ${amount} ${material}`);
                return false;
            }
        }

        // Remove materials from inventory
        for (const [material, amount] of Object.entries(recipe.materials)) {
            this.inventory.removeItem(material, amount);
        }

        // Add crafted item to inventory
        this.inventory.addItem(recipe.result, recipe.resultAmount || 1);

        console.log(`✅ Crafted: ${recipe.result}`);
        return true;
    }

    // ==========================================
    // INTERACTION SYSTEM
    // ==========================================

    interactWithObject(object) {
        const distance = this.calculateDistance(
            this.player.position,
            object.position
        );

        if (distance > this.settings.interactDistance) {
            console.log('❌ Too far to interact');
            return false;
        }

        // Determine interaction type
        if (object.type === 'door') {
            this.toggleDoor(object);
        } else if (object.type === 'chest') {
            this.openChest(object);
        } else if (object.type === 'npc') {
            this.talkToNPC(object);
        } else {
            console.log(`Interacted with: ${object.name}`);
        }

        return true;
    }

    toggleDoor(door) {
        door.open = !door.open;
        console.log(door.open ? '🚪 Door opened' : '🚪 Door closed');
    }

    openChest(chest) {
        console.log('📦 Opening chest...');
        // Show chest inventory UI
        // TODO: Implement chest UI
    }

    talkToNPC(npc) {
        console.log(`💬 Talking to ${npc.name}...`);
        // Show dialogue UI
        // TODO: Implement dialogue system
    }

    // ==========================================
    // PLAYER MOVEMENT & ACTIONS
    // ==========================================

    update(deltaTime, input) {
        // Update player position based on input
        this.player.update(deltaTime, input);

        // Update placement preview if in build mode
        if (this.buildMode && input.mousePosition) {
            this.updatePlacementPreview(input.mousePosition, input.raycaster);
        }

        // Check for nearby interactable objects
        this.updateNearbyObjects();
    }

    updateNearbyObjects() {
        // Find objects within interact distance
        this.player.nearbyObjects = this.objectsInWorld.filter(obj => {
            const distance = this.calculateDistance(
                this.player.position,
                obj.position
            );
            return distance < this.settings.interactDistance * 2;
        });
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    calculateDistance(pos1, pos2) {
        const dx = pos1[0] - pos2[0];
        const dy = pos1[1] - pos2[1];
        const dz = pos1[2] - pos2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    generateObjectId() {
        return 'obj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getStats() {
        return {
            buildMode: this.buildMode,
            objectsPlaced: this.objectsInWorld.length,
            inventoryUsed: this.inventory.getUsedSlots(),
            inventoryTotal: this.inventory.size,
            playerPosition: this.player.position
        };
    }
}

// ==========================================
// PLAYER CLASS
// ==========================================

class Player {
    constructor(position, settings) {
        this.id = 'player_' + Date.now();
        this.position = position;
        this.velocity = [0, 0, 0];
        this.rotation = [0, 0];
        this.settings = settings;
        this.nearbyObjects = [];
        
        this.stats = {
            health: 100,
            maxHealth: 100,
            stamina: 100,
            maxStamina: 100
        };

        this.movement = {
            speed: 10, // meters per second
            sprintMultiplier: 2,
            jumpForce: 15
        };
    }

    update(deltaTime, input) {
        const dt = deltaTime / 1000; // Convert to seconds

        // Movement
        let moveSpeed = this.movement.speed;
        if (input.sprint) moveSpeed *= this.movement.sprintMultiplier;

        if (input.forward) this.velocity[2] -= moveSpeed * dt;
        if (input.backward) this.velocity[2] += moveSpeed * dt;
        if (input.left) this.velocity[0] -= moveSpeed * dt;
        if (input.right) this.velocity[0] += moveSpeed * dt;

        // Jump
        if (input.jump && this.isOnGround()) {
            this.velocity[1] = this.movement.jumpForce;
        }

        // Apply gravity
        this.velocity[1] -= 9.8 * dt;

        // Update position
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
        this.position[2] += this.velocity[2];

        // Friction
        this.velocity[0] *= 0.8;
        this.velocity[2] *= 0.8;

        // Ground collision
        if (this.position[1] < 10) {
            this.position[1] = 10;
            this.velocity[1] = 0;
        }

        // Update camera rotation
        if (input.mouseDelta) {
            this.rotation[0] += input.mouseDelta[0] * 0.002;
            this.rotation[1] = Math.max(-Math.PI/2, Math.min(Math.PI/2, 
                this.rotation[1] + input.mouseDelta[1] * 0.002));
        }
    }

    isOnGround() {
        return this.position[1] <= 10.1;
    }
}

// ==========================================
// INVENTORY CLASS
// ==========================================

class Inventory {
    constructor(size, hotbarSize) {
        this.size = size;
        this.hotbarSize = hotbarSize;
        this.slots = new Array(size).fill(null);
        this.selectedSlot = 0;
    }

    addItem(itemId, amount = 1) {
        // Try to stack with existing items
        for (let i = 0; i < this.size; i++) {
            const slot = this.slots[i];
            if (slot && slot.id === itemId) {
                slot.amount += amount;
                return true;
            }
        }

        // Find empty slot
        for (let i = 0; i < this.size; i++) {
            if (!this.slots[i]) {
                this.slots[i] = {
                    id: itemId,
                    amount: amount,
                    addedAt: Date.now()
                };
                return true;
            }
        }

        return false; // Inventory full
    }

    removeItem(itemId, amount = 1) {
        for (let i = 0; i < this.size; i++) {
            const slot = this.slots[i];
            if (slot && slot.id === itemId) {
                slot.amount -= amount;
                if (slot.amount <= 0) {
                    this.slots[i] = null;
                }
                return true;
            }
        }
        return false;
    }

    hasItem(itemId, amount = 1) {
        let total = 0;
        for (const slot of this.slots) {
            if (slot && slot.id === itemId) {
                total += slot.amount;
            }
        }
        return total >= amount;
    }

    getUsedSlots() {
        return this.slots.filter(slot => slot !== null).length;
    }

    getHotbarItems() {
        return this.slots.slice(0, this.hotbarSize);
    }
}

// ==========================================
// CRAFTING RECIPES
// ==========================================

const CraftingRecipes = {
    'wooden_wall': {
        materials: { wood: 10 },
        result: 'wall_wooden',
        resultAmount: 1,
        category: 'Architecture'
    },
    'wooden_door': {
        materials: { wood: 5 },
        result: 'door_wooden',
        resultAmount: 1,
        category: 'Architecture'
    },
    'stone_wall': {
        materials: { stone: 15 },
        result: 'wall_stone',
        resultAmount: 1,
        category: 'Architecture'
    },
    'wooden_chair': {
        materials: { wood: 4 },
        result: 'chair_wooden',
        resultAmount: 1,
        category: 'Furniture'
    },
    'wooden_table': {
        materials: { wood: 8 },
        result: 'table_wooden',
        resultAmount: 1,
        category: 'Furniture'
    },
    'torch': {
        materials: { wood: 1, fiber: 2 },
        result: 'light_torch',
        resultAmount: 4,
        category: 'Lighting'
    },
    'storage_chest': {
        materials: { wood: 20 },
        result: 'chest_wooden',
        resultAmount: 1,
        category: 'Storage'
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameplaySystem, Player, Inventory, CraftingRecipes };
}
