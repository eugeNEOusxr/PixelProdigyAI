// meta_ai/self_playing_agent.js
// META-AI: Self-Playing Agent that can explore, learn, and master the game

/**
 * GameState - Captures complete game state for AI decision making
 */
class GameState {
  constructor(game) {
    this.playerPosition = game.playerMesh.position.clone();
    this.playerHealth = game.playerCombatStats.health;
    this.playerMaxHealth = game.playerCombatStats.maxHealth;
    this.playerStamina = game.playerCombatStats.stamina;
    this.playerMana = game.playerCombatStats.mana;
    this.inventoryItems = game.playerInventory.items.filter(item => item !== null).length;
    this.equippedItems = Object.values(game.playerEquipment.slots).filter(item => item !== null).length;
    this.activeQuests = game.questManager.getActiveQuests();
    this.enemiesInView = game.aiEnemies.filter(e => !e.combatStats.isDead);
    this.nearbyInteractables = this.findNearbyInteractables(game);
    this.exploredArea = 0; // Will be calculated
    this.legendaryStatus = 0; // 0-100 scale
  }

  findNearbyInteractables(game) {
    const interactables = [];
    const checkRadius = 15;
    
    // Check for NPCs
    if (game.npcMesh && game.playerMesh.position.distanceTo(game.npcMesh.position) < checkRadius) {
      interactables.push({ type: 'npc', position: game.npcMesh.position, distance: game.playerMesh.position.distanceTo(game.npcMesh.position) });
    }
    
    // Check for items
    if (game.itemMesh && game.playerMesh.position.distanceTo(game.itemMesh.position) < checkRadius) {
      interactables.push({ type: 'item', position: game.itemMesh.position, distance: game.playerMesh.position.distanceTo(game.itemMesh.position) });
    }
    
    // Check for door
    if (game.doorMesh && game.playerMesh.position.distanceTo(game.doorMesh.position) < checkRadius) {
      interactables.push({ type: 'door', position: game.doorMesh.position, distance: game.playerMesh.position.distanceTo(game.doorMesh.position) });
    }
    
    return interactables;
  }
}

/**
 * ActionSpace - All possible actions the AI can take
 */
class ActionSpace {
  static ACTIONS = {
    // Movement
    MOVE_FORWARD: 'move_forward',
    MOVE_BACKWARD: 'move_backward',
    MOVE_LEFT: 'move_left',
    MOVE_RIGHT: 'move_right',
    JUMP: 'jump',
    SPRINT: 'sprint',
    CROUCH: 'crouch',
    
    // Combat
    ATTACK_LIGHT: 'attack_light',
    ATTACK_HEAVY: 'attack_heavy',
    ATTACK_RANGED: 'attack_ranged',
    ATTACK_SPECIAL: 'attack_special',
    DODGE: 'dodge',
    BLOCK: 'block',
    
    // Interaction
    INTERACT: 'interact',
    OPEN_INVENTORY: 'open_inventory',
    USE_ITEM: 'use_item',
    EQUIP_ITEM: 'equip_item',
    
    // Strategy
    EXPLORE: 'explore',
    RETREAT: 'retreat',
    HEAL: 'heal',
    WAIT: 'wait'
  };
}

/**
 * ReinforcementLearner - Q-Learning algorithm for AI decision making
 */
class ReinforcementLearner {
  constructor() {
    this.qTable = new Map(); // State-action value table
    this.learningRate = 0.1;
    this.discountFactor = 0.95;
    this.explorationRate = 1.0; // Start fully exploratory
    this.explorationDecay = 0.995;
    this.minExploration = 0.01;
    this.episodeCount = 0;
    this.totalReward = 0;
  }

  getStateKey(state) {
    // Discretize continuous state into key
    const px = Math.floor(state.playerPosition.x / 5);
    const pz = Math.floor(state.playerPosition.z / 5);
    const hp = Math.floor(state.playerHealth / 20);
    const enemies = state.enemiesInView.length;
    const quests = state.activeQuests.length;
    
    return `${px},${pz},${hp},${enemies},${quests}`;
  }

  getQValue(state, action) {
    const key = `${this.getStateKey(state)}_${action}`;
    return this.qTable.get(key) || 0;
  }

  setQValue(state, action, value) {
    const key = `${this.getStateKey(state)}_${action}`;
    this.qTable.set(key, value);
  }

  selectAction(state) {
    // Epsilon-greedy strategy
    if (Math.random() < this.explorationRate) {
      // Explore: random action
      const actions = Object.values(ActionSpace.ACTIONS);
      return actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploit: best known action
      return this.getBestAction(state);
    }
  }

  getBestAction(state) {
    const actions = Object.values(ActionSpace.ACTIONS);
    let bestAction = actions[0];
    let bestValue = this.getQValue(state, bestAction);
    
    for (const action of actions) {
      const value = this.getQValue(state, action);
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }
    
    return bestAction;
  }

  update(state, action, reward, nextState) {
    // Q-learning update rule
    const currentQ = this.getQValue(state, action);
    const maxNextQ = Math.max(...Object.values(ActionSpace.ACTIONS).map(a => this.getQValue(nextState, a)));
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    
    this.setQValue(state, action, newQ);
    this.totalReward += reward;
    
    // Decay exploration
    this.explorationRate = Math.max(this.minExploration, this.explorationRate * this.explorationDecay);
  }

  endEpisode() {
    this.episodeCount++;
    console.log(`Episode ${this.episodeCount} complete. Total reward: ${this.totalReward.toFixed(2)}, Exploration: ${(this.explorationRate * 100).toFixed(1)}%`);
  }
}

/**
 * GoalManager - Manages AI goals and priorities
 */
class GoalManager {
  constructor() {
    this.goals = [];
    this.currentGoal = null;
  }

  addGoal(goal) {
    this.goals.push(goal);
    this.goals.sort((a, b) => b.priority - a.priority);
  }

  updateGoals(state) {
    // Dynamic goal generation based on state
    this.goals = [];
    
    // Survival goals (highest priority)
    if (state.playerHealth < state.playerMaxHealth * 0.3) {
      this.addGoal({ type: 'heal', priority: 100, description: 'Heal urgently' });
    }
    
    if (state.enemiesInView.length > 0) {
      const nearestEnemy = state.enemiesInView.reduce((nearest, enemy) => {
        const dist = state.playerPosition.distanceTo(enemy.position);
        return dist < nearest.distance ? { enemy, distance: dist } : nearest;
      }, { distance: Infinity });
      
      if (nearestEnemy.distance < 5) {
        this.addGoal({ type: 'combat', priority: 90, target: nearestEnemy.enemy, description: 'Engage enemy' });
      } else if (nearestEnemy.distance < 10 && state.playerHealth > state.playerMaxHealth * 0.5) {
        this.addGoal({ type: 'approach_enemy', priority: 70, target: nearestEnemy.enemy, description: 'Approach enemy' });
      }
    }
    
    // Quest goals
    state.activeQuests.forEach(quest => {
      this.addGoal({ type: 'quest', priority: 80, quest: quest, description: `Complete: ${quest.title}` });
    });
    
    // Exploration goals
    if (state.nearbyInteractables.length > 0) {
      const nearest = state.nearbyInteractables[0];
      this.addGoal({ type: 'interact', priority: 60, target: nearest, description: `Interact with ${nearest.type}` });
    }
    
    // General exploration
    this.addGoal({ type: 'explore', priority: 50, description: 'Explore new areas' });
    
    // Inventory management
    if (state.inventoryItems < 5) {
      this.addGoal({ type: 'collect_items', priority: 55, description: 'Collect items' });
    }
    
    // Equipment optimization
    if (state.equippedItems < 4) {
      this.addGoal({ type: 'equip_gear', priority: 65, description: 'Equip better gear' });
    }
    
    this.currentGoal = this.goals[0] || null;
  }

  getCurrentGoal() {
    return this.currentGoal;
  }
}

/**
 * StrategyPlanner - High-level strategic thinking
 */
class StrategyPlanner {
  constructor() {
    this.strategies = [];
    this.currentStrategy = null;
    this.strategyHistory = [];
  }

  planStrategy(state, goal) {
    if (!goal) return null;
    
    const strategy = {
      goal: goal,
      steps: [],
      estimatedTime: 0,
      successProbability: 0
    };
    
    switch (goal.type) {
      case 'combat':
        strategy.steps = this.planCombatStrategy(state, goal);
        break;
      case 'quest':
        strategy.steps = this.planQuestStrategy(state, goal);
        break;
      case 'explore':
        strategy.steps = this.planExplorationStrategy(state);
        break;
      case 'heal':
        strategy.steps = this.planHealStrategy(state);
        break;
      case 'interact':
        strategy.steps = this.planInteractionStrategy(state, goal);
        break;
    }
    
    this.currentStrategy = strategy;
    return strategy;
  }

  planCombatStrategy(state, goal) {
    const steps = [];
    
    // Assess combat strength
    const playerStrength = state.playerHealth + (state.playerStamina / 2);
    const enemyCount = state.enemiesInView.length;
    
    if (playerStrength < 50 && enemyCount > 1) {
      steps.push({ action: 'retreat', reason: 'Outnumbered and weak' });
      steps.push({ action: 'heal', reason: 'Recover health' });
    } else {
      steps.push({ action: 'approach', reason: 'Get in range' });
      steps.push({ action: 'attack_light', reason: 'Test enemy' });
      steps.push({ action: 'dodge', reason: 'Avoid damage' });
      steps.push({ action: 'attack_heavy', reason: 'Finish enemy' });
    }
    
    return steps;
  }

  planQuestStrategy(state, goal) {
    const quest = goal.quest;
    const currentObjective = quest.getCurrentObjective();
    
    if (!currentObjective) return [{ action: 'wait', reason: 'No objective' }];
    
    const steps = [];
    
    // Parse objective type
    if (currentObjective.description.includes('Defeat') || currentObjective.description.includes('enemy')) {
      steps.push({ action: 'explore', reason: 'Find enemies' });
      steps.push({ action: 'combat', reason: 'Defeat enemies for quest' });
    } else if (currentObjective.description.includes('Talk') || currentObjective.description.includes('NPC')) {
      steps.push({ action: 'navigate_to_npc', reason: 'Find NPC' });
      steps.push({ action: 'interact', reason: 'Talk to NPC' });
    } else {
      steps.push({ action: 'explore', reason: 'Search for objective' });
    }
    
    return steps;
  }

  planExplorationStrategy(state) {
    return [
      { action: 'move_forward', reason: 'Explore forward' },
      { action: 'look_around', reason: 'Scan area' },
      { action: 'collect_items', reason: 'Gather resources' }
    ];
  }

  planHealStrategy(state) {
    return [
      { action: 'open_inventory', reason: 'Access items' },
      { action: 'use_item', itemType: 'potion', reason: 'Heal' },
      { action: 'retreat', reason: 'Get to safety' }
    ];
  }

  planInteractionStrategy(state, goal) {
    const target = goal.target;
    return [
      { action: 'navigate_to', target: target.position, reason: `Go to ${target.type}` },
      { action: 'interact', reason: `Interact with ${target.type}` }
    ];
  }
}

/**
 * SelfPlayingAgent - Main AI agent that plays the game
 */
class SelfPlayingAgent {
  constructor(game) {
    this.game = game;
    this.learner = new ReinforcementLearner();
    this.goalManager = new GoalManager();
    this.strategyPlanner = new StrategyPlanner();
    this.currentState = null;
    this.previousState = null;
    this.currentAction = null;
    this.isActive = false;
    this.explorationMap = new Map(); // Track explored areas
    this.achievementLog = [];
    this.legendaryStatus = 0;
    this.creationMode = false; // For content generation
  }

  start() {
    this.isActive = true;
    console.log('🤖 Self-Playing AI Agent ACTIVATED');
    console.log('🎯 Goal: Explore, Learn, Conquer, Achieve Legendary Status');
    this.achievementLog.push({ time: Date.now(), event: 'AI Agent Started' });
  }

  stop() {
    this.isActive = false;
    console.log('🤖 Self-Playing AI Agent DEACTIVATED');
    this.learner.endEpisode();
  }

  update(dt) {
    if (!this.isActive) return;
    
    // Capture current game state
    this.currentState = new GameState(this.game);
    
    // Update goals based on current state
    this.goalManager.updateGoals(this.currentState);
    const goal = this.goalManager.getCurrentGoal();
    
    // Plan strategy for current goal
    const strategy = this.strategyPlanner.planStrategy(this.currentState, goal);
    
    // Select action using reinforcement learning
    this.currentAction = this.learner.selectAction(this.currentState);
    
    // Execute action
    this.executeAction(this.currentAction, dt);
    
    // Calculate reward
    const reward = this.calculateReward();
    
    // Update Q-learning
    if (this.previousState) {
      this.learner.update(this.previousState, this.currentAction, reward, this.currentState);
    }
    
    // Track exploration
    this.trackExploration();
    
    // Check for achievements
    this.checkAchievements();
    
    // Update legendary status
    this.updateLegendaryStatus();
    
    this.previousState = this.currentState;
  }

  executeAction(action, dt) {
    const inputHandler = this.game.inputHandler;
    const playerCombat = this.game.playerCombat;
    const inventoryUI = this.game.inventoryUI;
    
    // Reset all inputs first
    if (inputHandler.state) {
      inputHandler.state.axes.moveX = 0;
      inputHandler.state.axes.moveY = 0;
    }
    
    switch (action) {
      case ActionSpace.ACTIONS.MOVE_FORWARD:
        if (inputHandler.state) inputHandler.state.axes.moveY = 1;
        break;
      case ActionSpace.ACTIONS.MOVE_BACKWARD:
        if (inputHandler.state) inputHandler.state.axes.moveY = -1;
        break;
      case ActionSpace.ACTIONS.MOVE_LEFT:
        if (inputHandler.state) inputHandler.state.axes.moveX = -1;
        break;
      case ActionSpace.ACTIONS.MOVE_RIGHT:
        if (inputHandler.state) inputHandler.state.axes.moveX = 1;
        break;
      case ActionSpace.ACTIONS.SPRINT:
        if (inputHandler.state) {
          inputHandler.state.axes.moveY = 1;
          inputHandler.state.actions.set('sprint', true);
        }
        break;
      case ActionSpace.ACTIONS.JUMP:
        if (inputHandler.state) inputHandler.state.actions.set('jump', true);
        break;
      case ActionSpace.ACTIONS.ATTACK_LIGHT:
        if (playerCombat && this.game.scene) {
          playerCombat.performAttack('melee_light', performance.now() / 1000, this.game.scene);
        }
        break;
      case ActionSpace.ACTIONS.ATTACK_HEAVY:
        if (playerCombat && this.game.scene) {
          playerCombat.performAttack('melee_heavy', performance.now() / 1000, this.game.scene);
        }
        break;
      case ActionSpace.ACTIONS.HEAL:
        if (this.game.playerCombatStats) {
          this.game.playerCombatStats.heal(20);
        }
        break;
      case ActionSpace.ACTIONS.INTERACT:
        if (inputHandler.state) inputHandler.state.actions.set('interact', true);
        break;
      case ActionSpace.ACTIONS.EXPLORE:
        // Random exploration movement
        const angle = Math.random() * Math.PI * 2;
        if (inputHandler.state) {
          inputHandler.state.axes.moveX = Math.cos(angle);
          inputHandler.state.axes.moveY = Math.sin(angle);
        }
        break;
    }
  }

  calculateReward() {
    if (!this.currentState || !this.previousState) return 0;
    
    let reward = 0;
    
    // Health rewards
    const healthDelta = this.currentState.playerHealth - this.previousState.playerHealth;
    reward += healthDelta * 0.5; // Positive for healing, negative for damage
    
    // Combat rewards
    const enemiesDefeated = this.previousState.enemiesInView.length - this.currentState.enemiesInView.length;
    reward += enemiesDefeated * 50; // Big reward for defeating enemies
    
    // Quest rewards
    const questProgress = this.currentState.activeQuests.reduce((sum, q) => {
      const obj = q.getCurrentObjective();
      return sum + (obj ? obj.current : 0);
    }, 0);
    const prevQuestProgress = this.previousState.activeQuests.reduce((sum, q) => {
      const obj = q.getCurrentObjective();
      return sum + (obj ? obj.current : 0);
    }, 0);
    reward += (questProgress - prevQuestProgress) * 100; // Huge reward for quest progress
    
    // Exploration rewards
    const exploredNew = this.explorationMap.size;
    reward += exploredNew * 0.1;
    
    // Survival penalty
    if (this.currentState.playerHealth <= 0) {
      reward -= 500; // Huge penalty for dying
    }
    
    // Inventory rewards
    const itemsGained = this.currentState.inventoryItems - this.previousState.inventoryItems;
    reward += itemsGained * 10;
    
    // Equipment rewards
    const equipmentGained = this.currentState.equippedItems - this.previousState.equippedItems;
    reward += equipmentGained * 20;
    
    return reward;
  }

  trackExploration() {
    const pos = this.currentState.playerPosition;
    const gridKey = `${Math.floor(pos.x / 2)},${Math.floor(pos.z / 2)}`;
    if (!this.explorationMap.has(gridKey)) {
      this.explorationMap.set(gridKey, Date.now());
    }
  }

  checkAchievements() {
    const state = this.currentState;
    
    // First enemy defeated
    if (state.enemiesInView.length < this.previousState?.enemiesInView.length) {
      this.logAchievement('First Blood', 'Defeated an enemy');
      this.legendaryStatus += 5;
    }
    
    // Explored large area
    if (this.explorationMap.size > 50 && !this.hasAchievement('Explorer')) {
      this.logAchievement('Explorer', 'Explored over 50 grid cells');
      this.legendaryStatus += 10;
    }
    
    // Full equipment
    if (state.equippedItems >= 6 && !this.hasAchievement('Fully Equipped')) {
      this.logAchievement('Fully Equipped', 'Equipped 6+ items');
      this.legendaryStatus += 15;
    }
    
    // Quest master
    if (this.game.questManager.completedQuests.length > 0 && !this.hasAchievement('Quest Master')) {
      this.logAchievement('Quest Master', 'Completed first quest');
      this.legendaryStatus += 20;
    }
    
    // Legendary status achieved
    if (this.legendaryStatus >= 100 && !this.hasAchievement('Legendary')) {
      this.logAchievement('LEGENDARY', 'Achieved Legendary Status!');
      this.enterCreationMode();
    }
  }

  hasAchievement(name) {
    return this.achievementLog.some(a => a.event === name);
  }

  logAchievement(name, description) {
    console.log(`🏆 ACHIEVEMENT UNLOCKED: ${name} - ${description}`);
    this.achievementLog.push({ time: Date.now(), event: name, description });
  }

  updateLegendaryStatus() {
    // Base status on various factors
    const explorationScore = Math.min(30, this.explorationMap.size / 2);
    const combatScore = Math.min(30, this.learner.totalReward / 100);
    const achievementScore = Math.min(40, this.achievementLog.length * 5);
    
    this.legendaryStatus = Math.floor(explorationScore + combatScore + achievementScore);
  }

  enterCreationMode() {
    console.log('✨ LEGENDARY STATUS ACHIEVED! Entering Creation Mode...');
    this.creationMode = true;
    // This will trigger the content generator and quantum realm
  }

  getStatus() {
    return {
      isActive: this.isActive,
      legendaryStatus: this.legendaryStatus,
      exploredCells: this.explorationMap.size,
      achievements: this.achievementLog.length,
      totalReward: this.learner.totalReward,
      qTableSize: this.learner.qTable.size,
      explorationRate: this.learner.explorationRate,
      currentGoal: this.goalManager.currentGoal,
      creationMode: this.creationMode
    };
  }
}

// Export
if (typeof window !== 'undefined') {
  window.SelfPlayingAgent = SelfPlayingAgent;
  window.GameState = GameState;
  window.ActionSpace = ActionSpace;
}

export { SelfPlayingAgent, GameState, ActionSpace };
