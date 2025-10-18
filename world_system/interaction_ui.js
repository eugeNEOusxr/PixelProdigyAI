/**
 * Interaction UI System
 * Handles user input, UI prompts, and interaction feedback
 */

class InteractionUI {
    constructor() {
        this.hoveredObject = null;
        this.interactableObjects = [];
        this.promptElement = null;
        this.contextMenuElement = null;
        this.outlineShader = null;
        
        // Key bindings
        this.keyBindings = {
            'KeyE': 'gather',
            'KeyF': 'loot',
            'KeyG': 'use',
            'KeyT': 'talk',
            'KeyM': 'mount',
            'KeyX': 'examine'
        };
        
        // Settings
        this.maxInteractionDistance = 5.0;
        this.raycastDistance = 10.0;
        this.promptFadeTime = 200;
        this.highlightColor = { r: 1.0, g: 0.8, b: 0.2, a: 1.0 };
        
        // State
        this.isContextMenuOpen = false;
        this.lastInteractionTime = 0;
        this.interactionCooldown = 500; // ms
        
        this.init();
    }
    
    init() {
        this.createPromptUI();
        this.createContextMenu();
        this.setupEventListeners();
        console.log('✓ Interaction UI initialized');
    }
    
    createPromptUI() {
        // Create prompt container
        this.promptElement = document.createElement('div');
        this.promptElement.id = 'interaction-prompt';
        this.promptElement.style.cssText = `
            position: fixed;
            bottom: 150px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            pointer-events: none;
            opacity: 0;
            transition: opacity ${this.promptFadeTime}ms ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(255, 200, 50, 0.6);
            min-width: 200px;
            text-align: center;
        `;
        
        document.body.appendChild(this.promptElement);
    }
    
    createContextMenu() {
        // Create context menu for multiple interactions
        this.contextMenuElement = document.createElement('div');
        this.contextMenuElement.id = 'interaction-context-menu';
        this.contextMenuElement.style.cssText = `
            position: fixed;
            background: rgba(20, 20, 20, 0.95);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            display: none;
            z-index: 2000;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            min-width: 180px;
        `;
        
        document.body.appendChild(this.contextMenuElement);
    }
    
    setupEventListeners() {
        // Key press handlers
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Mouse click for context menu
        document.addEventListener('click', (e) => {
            if (this.isContextMenuOpen) {
                this.closeContextMenu();
            }
        });
        
        // Right-click for context menu
        document.addEventListener('contextmenu', (e) => {
            if (this.hoveredObject && this.hoveredObject.secondaryInteractions) {
                e.preventDefault();
                this.openContextMenu(e.clientX, e.clientY);
            }
        });
    }
    
    handleKeyPress(event) {
        // Ignore if typing in input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const action = this.keyBindings[event.code];
        if (action && this.hoveredObject) {
            event.preventDefault();
            this.performInteraction(action);
        }
    }
    
    updateHoveredObject(object) {
        const previousObject = this.hoveredObject;
        this.hoveredObject = object;
        
        if (object !== previousObject) {
            if (previousObject) {
                this.removeHighlight(previousObject);
            }
            if (object) {
                this.addHighlight(object);
                this.showPrompt(object);
            } else {
                this.hidePrompt();
            }
        }
    }
    
    showPrompt(object) {
        if (!object || !this.promptElement) return;
        
        let promptText = '';
        const primaryAction = this.getActionKey(object.primaryInteraction);
        
        // Build prompt text
        promptText = `<div style="font-size: 18px; margin-bottom: 8px; font-weight: bold;">${object.displayName}</div>`;
        
        if (object.primaryInteraction) {
            const actionName = this.getActionName(object.primaryInteraction);
            promptText += `<div style="font-size: 14px; color: #ffc832;">
                [${primaryAction}] ${actionName}
            </div>`;
        }
        
        // Show secondary interactions
        if (object.secondaryInteractions && object.secondaryInteractions.length > 0) {
            promptText += `<div style="font-size: 12px; color: #aaa; margin-top: 5px;">
                [Right-Click] More Options
            </div>`;
        }
        
        // Requirements
        if (object.requiredLevel && object.requiredLevel > 1) {
            promptText += `<div style="font-size: 11px; color: #ff6b6b; margin-top: 5px;">
                Requires Level ${object.requiredLevel}
            </div>`;
        }
        
        this.promptElement.innerHTML = promptText;
        this.promptElement.style.opacity = '1';
    }
    
    hidePrompt() {
        if (this.promptElement) {
            this.promptElement.style.opacity = '0';
        }
    }
    
    addHighlight(object) {
        // Send highlight request to renderer
        if (window.gameRenderer) {
            window.gameRenderer.highlightObject(object.id, this.highlightColor);
        }
        
        // Play subtle sound effect
        this.playSound('hover');
    }
    
    removeHighlight(object) {
        if (window.gameRenderer) {
            window.gameRenderer.removeHighlight(object.id);
        }
    }
    
    openContextMenu(x, y) {
        if (!this.hoveredObject) return;
        
        const menu = this.contextMenuElement;
        menu.innerHTML = '';
        
        // Title
        const title = document.createElement('div');
        title.style.cssText = `
            font-weight: bold;
            padding: 5px 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 5px;
            color: #ffc832;
        `;
        title.textContent = this.hoveredObject.displayName;
        menu.appendChild(title);
        
        // Primary interaction
        this.addMenuOption(menu, this.hoveredObject.primaryInteraction, true);
        
        // Secondary interactions
        if (this.hoveredObject.secondaryInteractions) {
            this.hoveredObject.secondaryInteractions.forEach(interaction => {
                this.addMenuOption(menu, interaction, false);
            });
        }
        
        // Position menu
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = 'block';
        
        this.isContextMenuOpen = true;
    }
    
    addMenuOption(menu, interactionType, isPrimary) {
        const option = document.createElement('div');
        option.style.cssText = `
            padding: 8px 15px;
            cursor: pointer;
            transition: background 0.2s;
            border-radius: 4px;
            ${isPrimary ? 'color: #ffc832; font-weight: bold;' : ''}
        `;
        
        const actionName = this.getActionName(interactionType);
        const actionKey = this.getActionKey(interactionType);
        
        option.innerHTML = `
            <span>${actionName}</span>
            <span style="float: right; color: #888; font-size: 12px;">[${actionKey}]</span>
        `;
        
        option.addEventListener('mouseenter', () => {
            option.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
        
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            this.performInteraction(this.getActionFromType(interactionType));
            this.closeContextMenu();
        });
        
        menu.appendChild(option);
    }
    
    closeContextMenu() {
        if (this.contextMenuElement) {
            this.contextMenuElement.style.display = 'none';
        }
        this.isContextMenuOpen = false;
    }
    
    performInteraction(action) {
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) {
            console.log('Interaction on cooldown');
            return false;
        }
        
        if (!this.hoveredObject) {
            console.log('No object to interact with');
            return false;
        }
        
        this.lastInteractionTime = now;
        
        // Play interaction animation
        this.playInteractionAnimation(action);
        
        // Play sound
        this.playSound(action);
        
        // Show feedback
        this.showInteractionFeedback(action);
        
        // Emit interaction event
        if (window.gameClient) {
            window.gameClient.sendInteraction({
                objectId: this.hoveredObject.id,
                action: action,
                timestamp: now
            });
        }
        
        console.log(`✓ Performed ${action} on ${this.hoveredObject.displayName}`);
        return true;
    }
    
    playInteractionAnimation(action) {
        // Trigger character animation based on action
        if (window.characterRenderer) {
            const animationMap = {
                'gather': 'gather',
                'loot': 'crouch',
                'use': 'use',
                'talk': 'emote_wave',
                'mount': 'mount',
                'examine': 'examine'
            };
            
            const animation = animationMap[action];
            if (animation && window.characterRenderer.playAnimation) {
                window.characterRenderer.playAnimation(animation);
            }
        }
    }
    
    playSound(soundName) {
        // Play sound effect (integrate with audio system)
        if (window.audioManager) {
            const soundMap = {
                'hover': 'ui_hover.mp3',
                'gather': 'gather_resource.mp3',
                'loot': 'open_chest.mp3',
                'use': 'door_open.mp3',
                'talk': 'npc_greeting.mp3',
                'mount': 'mount_horse.mp3',
                'examine': 'ui_inspect.mp3'
            };
            
            const soundFile = soundMap[soundName];
            if (soundFile) {
                window.audioManager.play(soundFile, { volume: 0.5 });
            }
        }
    }
    
    showInteractionFeedback(action) {
        // Create floating text feedback
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            color: #4ade80;
            font-size: 24px;
            font-weight: bold;
            font-family: 'Segoe UI', Arial, sans-serif;
            pointer-events: none;
            z-index: 3000;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            animation: feedbackFloat 1s ease-out forwards;
        `;
        
        feedback.textContent = this.getActionName(this.getInteractionTypeFromAction(action));
        document.body.appendChild(feedback);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes feedbackFloat {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                50% {
                    opacity: 1;
                    transform: translate(-50%, -80px) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -120px) scale(1);
                }
            }
        `;
        if (!document.getElementById('feedback-animation-style')) {
            style.id = 'feedback-animation-style';
            document.head.appendChild(style);
        }
        
        // Remove after animation
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }
    
    getActionName(interactionType) {
        const names = {
            'gather': 'Gather',
            'loot': 'Loot',
            'use': 'Use',
            'talk': 'Talk',
            'mount': 'Mount',
            'examine': 'Examine',
            'none': 'Interact'
        };
        return names[interactionType] || 'Interact';
    }
    
    getActionKey(interactionType) {
        const keys = {
            'gather': 'E',
            'loot': 'F',
            'use': 'G',
            'talk': 'T',
            'mount': 'M',
            'examine': 'X'
        };
        return keys[interactionType] || '?';
    }
    
    getActionFromType(interactionType) {
        return interactionType;
    }
    
    getInteractionTypeFromAction(action) {
        return action;
    }
    
    // Update method called each frame
    update(playerPosition, playerDirection, interactableObjects) {
        this.interactableObjects = interactableObjects;
        
        // Perform raycast to find hovered object
        const hoveredObject = this.raycastForObject(playerPosition, playerDirection);
        this.updateHoveredObject(hoveredObject);
    }
    
    raycastForObject(origin, direction) {
        // This should call the C++ raycast system
        // For now, simplified distance check
        let closestObject = null;
        let closestDistance = this.raycastDistance;
        
        for (const obj of this.interactableObjects) {
            // Calculate distance from ray to object
            const toObj = {
                x: obj.position.x - origin.x,
                y: obj.position.y - origin.y,
                z: obj.position.z - origin.z
            };
            
            // Project onto ray direction
            const projection = toObj.x * direction.x + toObj.y * direction.y + toObj.z * direction.z;
            
            if (projection > 0 && projection < closestDistance) {
                // Check if within interaction radius
                const distance = Math.sqrt(toObj.x * toObj.x + toObj.y * toObj.y + toObj.z * toObj.z);
                if (distance <= this.maxInteractionDistance) {
                    closestDistance = projection;
                    closestObject = obj;
                }
            }
        }
        
        return closestObject;
    }
    
    // Clean up
    destroy() {
        if (this.promptElement) {
            this.promptElement.remove();
        }
        if (this.contextMenuElement) {
            this.contextMenuElement.remove();
        }
        console.log('✓ Interaction UI destroyed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InteractionUI };
}

console.log('✓ Interaction UI loaded');
