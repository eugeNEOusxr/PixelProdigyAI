// world_generation/dialogue_quest_system.js
// Dialogue and Quest System for NPCs

/**
 * DialogueNode - Single dialogue entry
 */
class DialogueNode {
  constructor(config) {
    this.id = config.id;
    this.text = config.text;
    this.speaker = config.speaker || 'NPC';
    this.responses = config.responses || [];
    this.onEnter = config.onEnter || null;
    this.onExit = config.onExit || null;
    this.condition = config.condition || null;
  }

  canShow(context) {
    if (this.condition) {
      return this.condition(context);
    }
    return true;
  }
}

/**
 * DialogueTree - Manages dialogue flow
 */
class DialogueTree {
  constructor(config) {
    this.id = config.id;
    this.nodes = new Map();
    this.startNodeId = config.startNodeId || 'start';
    this.currentNode = null;
    
    // Add nodes
    if (config.nodes) {
      config.nodes.forEach(node => this.addNode(node));
    }
  }

  addNode(nodeConfig) {
    const node = new DialogueNode(nodeConfig);
    this.nodes.set(node.id, node);
  }

  start(context = {}) {
    this.currentNode = this.nodes.get(this.startNodeId);
    if (this.currentNode && this.currentNode.onEnter) {
      this.currentNode.onEnter(context);
    }
    return this.currentNode;
  }

  selectResponse(responseIndex, context = {}) {
    if (!this.currentNode || !this.currentNode.responses[responseIndex]) {
      return null;
    }

    const response = this.currentNode.responses[responseIndex];
    
    // Execute response action
    if (response.onSelect) {
      response.onSelect(context);
    }

    // Exit current node
    if (this.currentNode.onExit) {
      this.currentNode.onExit(context);
    }

    // Move to next node
    if (response.nextNodeId) {
      this.currentNode = this.nodes.get(response.nextNodeId);
      if (this.currentNode && this.currentNode.onEnter) {
        this.currentNode.onEnter(context);
      }
    } else {
      this.currentNode = null; // End dialogue
    }

    return this.currentNode;
  }

  getCurrentNode() {
    return this.currentNode;
  }

  reset() {
    this.currentNode = null;
  }
}

/**
 * Quest - Represents a quest with objectives
 */
class Quest {
  constructor(config) {
    this.id = config.id;
    this.title = config.title;
    this.description = config.description;
    this.objectives = config.objectives || [];
    this.rewards = config.rewards || {};
    this.status = 'available'; // available, active, completed, failed
    this.currentObjectiveIndex = 0;
    this.onStart = config.onStart || null;
    this.onComplete = config.onComplete || null;
    this.onFail = config.onFail || null;
  }

  start(player) {
    this.status = 'active';
    this.currentObjectiveIndex = 0;
    if (this.onStart) {
      this.onStart(player);
    }
  }

  updateObjective(objectiveId, progress) {
    const objective = this.objectives.find(obj => obj.id === objectiveId);
    if (objective) {
      objective.current = Math.min(objective.target, (objective.current || 0) + progress);
      
      if (objective.current >= objective.target) {
        objective.completed = true;
        
        // Check if all objectives complete
        if (this.objectives.every(obj => obj.completed)) {
          this.complete();
        } else {
          // Move to next objective
          this.currentObjectiveIndex++;
        }
      }
    }
  }

  complete(player) {
    this.status = 'completed';
    if (this.onComplete) {
      this.onComplete(player);
    }
  }

  fail(player) {
    this.status = 'failed';
    if (this.onFail) {
      this.onFail(player);
    }
  }

  getCurrentObjective() {
    return this.objectives[this.currentObjectiveIndex];
  }

  getProgress() {
    const completed = this.objectives.filter(obj => obj.completed).length;
    return `${completed}/${this.objectives.length}`;
  }
}

/**
 * QuestManager - Manages player quests
 */
class QuestManager {
  constructor() {
    this.quests = new Map();
    this.activeQuests = [];
    this.completedQuests = [];
    this.onChange = null;
  }

  addQuest(quest) {
    this.quests.set(quest.id, quest);
    this.triggerChange();
  }

  startQuest(questId, player) {
    const quest = this.quests.get(questId);
    if (quest && quest.status === 'available') {
      quest.start(player);
      this.activeQuests.push(quest);
      this.triggerChange();
      return true;
    }
    return false;
  }

  updateQuestObjective(questId, objectiveId, progress = 1) {
    const quest = this.quests.get(questId);
    if (quest && quest.status === 'active') {
      quest.updateObjective(objectiveId, progress);
      this.triggerChange();
    }
  }

  completeQuest(questId, player) {
    const quest = this.quests.get(questId);
    if (quest && quest.status === 'active') {
      quest.complete(player);
      const index = this.activeQuests.indexOf(quest);
      if (index !== -1) {
        this.activeQuests.splice(index, 1);
      }
      this.completedQuests.push(quest);
      this.triggerChange();
      
      // Apply rewards
      this.applyRewards(quest.rewards, player);
    }
  }

  applyRewards(rewards, player) {
    if (rewards.experience) {
      // Apply XP (if system exists)
    }
    if (rewards.gold) {
      // Apply gold
    }
    if (rewards.items) {
      // Give items to player inventory
      rewards.items.forEach(item => {
        if (player.inventory) {
          player.inventory.addItem(item);
        }
      });
    }
  }

  getActiveQuests() {
    return this.activeQuests;
  }

  getQuest(questId) {
    return this.quests.get(questId);
  }

  triggerChange() {
    if (this.onChange) {
      this.onChange();
    }
  }
}

/**
 * DialogueUI - Visual dialogue interface
 */
class DialogueUI {
  constructor() {
    this.isOpen = false;
    this.currentTree = null;
    this.context = {};
    this.createUI();
  }

  createUI() {
    // Main dialogue container
    this.container = document.createElement('div');
    this.container.id = 'dialogueUI';
    this.container.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
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

    // Speaker name
    this.speakerName = document.createElement('div');
    this.speakerName.style.cssText = `
      font-weight: bold;
      font-size: 16px;
      color: #4299e1;
      margin-bottom: 10px;
    `;
    this.container.appendChild(this.speakerName);

    // Dialogue text
    this.dialogueText = document.createElement('div');
    this.dialogueText.style.cssText = `
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 15px;
      min-height: 60px;
    `;
    this.container.appendChild(this.dialogueText);

    // Responses container
    this.responsesContainer = document.createElement('div');
    this.responsesContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    this.container.appendChild(this.responsesContainer);

    document.body.appendChild(this.container);
  }

  open(dialogueTree, context = {}) {
    this.currentTree = dialogueTree;
    this.context = context;
    this.isOpen = true;
    this.container.style.display = 'block';
    
    const node = dialogueTree.start(context);
    this.displayNode(node);
  }

  displayNode(node) {
    if (!node) {
      this.close();
      return;
    }

    this.speakerName.textContent = node.speaker;
    this.dialogueText.textContent = node.text;

    // Clear previous responses
    this.responsesContainer.innerHTML = '';

    // Add response buttons
    node.responses.forEach((response, index) => {
      const btn = document.createElement('button');
      btn.textContent = response.text;
      btn.style.cssText = `
        background: #2d3748;
        border: 2px solid #4a5568;
        color: #fff;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      `;
      btn.onmouseover = () => {
        btn.style.background = '#4a5568';
        btn.style.borderColor = '#5a7fab';
      };
      btn.onmouseout = () => {
        btn.style.background = '#2d3748';
        btn.style.borderColor = '#4a5568';
      };
      btn.onclick = () => this.selectResponse(index);
      this.responsesContainer.appendChild(btn);
    });

    // Add exit button if no responses
    if (node.responses.length === 0) {
      const exitBtn = document.createElement('button');
      exitBtn.textContent = 'Exit';
      exitBtn.style.cssText = `
        background: #e53e3e;
        border: 2px solid #c53030;
        color: #fff;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      `;
      exitBtn.onclick = () => this.close();
      this.responsesContainer.appendChild(exitBtn);
    }
  }

  selectResponse(index) {
    if (!this.currentTree) return;
    
    const nextNode = this.currentTree.selectResponse(index, this.context);
    this.displayNode(nextNode);
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    if (this.currentTree) {
      this.currentTree.reset();
    }
    this.currentTree = null;
  }
}

/**
 * QuestUI - Visual quest tracker
 */
class QuestUI {
  constructor(questManager) {
    this.questManager = questManager;
    this.createUI();
    
    this.questManager.onChange = () => this.update();
  }

  createUI() {
    // Quest tracker container
    this.container = document.createElement('div');
    this.container.id = 'questTracker';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      width: 280px;
      background: rgba(20, 20, 30, 0.9);
      border: 2px solid #4a5568;
      border-radius: 8px;
      padding: 12px;
      color: #fff;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      z-index: 100;
      max-height: 300px;
      overflow-y: auto;
    `;

    const title = document.createElement('div');
    title.textContent = 'Active Quests';
    title.style.cssText = `
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      color: #4299e1;
      border-bottom: 1px solid #4a5568;
      padding-bottom: 5px;
    `;
    this.container.appendChild(title);

    this.questList = document.createElement('div');
    this.container.appendChild(this.questList);

    document.body.appendChild(this.container);
  }

  update() {
    this.questList.innerHTML = '';
    
    const activeQuests = this.questManager.getActiveQuests();
    
    if (activeQuests.length === 0) {
      this.questList.innerHTML = '<div style="color:#888;font-style:italic;">No active quests</div>';
      return;
    }

    activeQuests.forEach(quest => {
      const questDiv = document.createElement('div');
      questDiv.style.cssText = `
        background: rgba(30, 30, 40, 0.6);
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 8px;
      `;

      const questTitle = document.createElement('div');
      questTitle.textContent = quest.title;
      questTitle.style.cssText = `
        font-weight: bold;
        color: #48bb78;
        margin-bottom: 4px;
      `;
      questDiv.appendChild(questTitle);

      const currentObj = quest.getCurrentObjective();
      if (currentObj) {
        const objDiv = document.createElement('div');
        objDiv.textContent = `• ${currentObj.description} (${currentObj.current || 0}/${currentObj.target})`;
        objDiv.style.fontSize = '12px';
        objDiv.style.color = '#cbd5e0';
        questDiv.appendChild(objDiv);
      }

      this.questList.appendChild(questDiv);
    });
  }

  hide() {
    this.container.style.display = 'none';
  }

  show() {
    this.container.style.display = 'block';
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.DialogueNode = DialogueNode;
  window.DialogueTree = DialogueTree;
  window.Quest = Quest;
  window.QuestManager = QuestManager;
  window.DialogueUI = DialogueUI;
  window.QuestUI = QuestUI;
}
