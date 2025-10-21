// Interactive item (pickup)
class InteractiveItem {
  constructor(mesh, options = {}) {
    this.mesh = mesh;
    this.pickedUp = false;
    this.interactionRadius = options.interactionRadius || 1.5;
    this.prompt = options.prompt || 'Press [E] to Pick Up';
    this.lastPlayerInRange = false;
    this.onPickup = options.onPickup || (() => {});
    this.name = options.name || 'Item';
  }

  update(playerPosition, interactPressed) {
    if (this.pickedUp) return;
    const dist = this.mesh.position.distanceTo(playerPosition);
    const inRange = dist < this.interactionRadius;
    this.lastPlayerInRange = inRange;
    if (inRange && interactPressed) {
      this.pickedUp = true;
      this.mesh.visible = false;
      this.onPickup(this.name);
    }
  }

  getPrompt() {
    if (this.pickedUp) return '';
    if (this.lastPlayerInRange) return this.prompt;
    return '';
  }
}

// Interactive NPC (dialogue)
class InteractiveNPC {
  constructor(mesh, options = {}) {
    this.mesh = mesh;
    this.interactionRadius = options.interactionRadius || 2.2;
    this.prompt = options.prompt || 'Press [E] to Talk';
    this.dialogue = options.dialogue || ['Hello!'];
    this.dialogueIndex = 0;
    this.talking = false;
    this.lastPlayerInRange = false;
  }

  update(playerPosition, interactPressed) {
    const dist = this.mesh.position.distanceTo(playerPosition);
    const inRange = dist < this.interactionRadius;
    this.lastPlayerInRange = inRange;
    if (inRange && interactPressed) {
      this.talking = !this.talking;
      if (this.talking) this.dialogueIndex = 0;
    }
  }

  getPrompt() {
    if (this.talking) return this.dialogue[this.dialogueIndex] || '';
    if (this.lastPlayerInRange) return this.prompt;
    return '';
  }
}

if (typeof window !== 'undefined') {
  window.InteractiveItem = InteractiveItem;
  window.InteractiveNPC = InteractiveNPC;
}
// world_generation/object_interaction.js
// Simple 3D object interaction system: doors, items, NPCs

class InteractiveDoor {
  constructor(mesh, options = {}) {
    this.mesh = mesh;
    this.isOpen = false;
    this.isLocked = options.locked || false;
    this.openAngle = options.openAngle || Math.PI / 2;
    this.closedAngle = options.closedAngle || 0;
    this.openSpeed = options.openSpeed || 2.5;
    this.currentAngle = this.closedAngle;
    this.interactionRadius = options.interactionRadius || 2.0;
    this.prompt = options.prompt || 'Press [E] to Open';
    this.lastPlayerInRange = false;
  }

  update(playerPosition, interactPressed) {
    // Proximity check
    const dist = this.mesh.position.distanceTo(playerPosition);
    const inRange = dist < this.interactionRadius;
    this.lastPlayerInRange = inRange;

    // Handle interaction
    if (inRange && interactPressed && !this.isLocked) {
      this.isOpen = !this.isOpen;
    }

    // Animate door
    const target = this.isOpen ? this.openAngle : this.closedAngle;
    this.currentAngle += (target - this.currentAngle) * 0.2;
    this.mesh.rotation.y = this.currentAngle;
  }

  getPrompt() {
    if (this.isLocked) return 'Locked';
    if (this.lastPlayerInRange) return this.isOpen ? 'Press [E] to Close' : this.prompt;
    return '';
  }
}

// Export for use in test page
if (typeof window !== 'undefined') window.InteractiveDoor = InteractiveDoor;
