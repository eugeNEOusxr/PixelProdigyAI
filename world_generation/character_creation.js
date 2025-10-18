/**
 * PIXELVERSE CHARACTER CREATION SYSTEM
 * =====================================
 * Handles character customization, preview, validation, and saving
 * Integrates with multiplayer server for character sync
 */

// ==========================================
// CHARACTER DATA MODEL
// ==========================================

class CharacterData {
    constructor() {
        this.id = this.generateId();
        this.name = '';
        this.race = null;
        this.class = null;
        this.appearance = {
            hairStyle: null,
            hairColor: null,
            skinTone: null,
            faceType: null
        };
        this.attributes = {
            base: {
                strength: 10,
                agility: 10,
                vitality: 10,
                intelligence: 10,
                wisdom: 10
            },
            bonuses: {
                strength: 0,
                agility: 0,
                vitality: 0,
                intelligence: 0,
                wisdom: 0
            },
            total: {
                strength: 10,
                agility: 10,
                vitality: 10,
                intelligence: 10,
                wisdom: 10
            }
        };
        this.level = 1;
        this.experience = 0;
        this.gold = 100;
        this.inventory = [];
        this.equipment = {};
        this.createdAt = Date.now();
    }

    generateId() {
        return 'char_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    calculateTotalAttributes() {
        for (let attr in this.attributes.base) {
            this.attributes.total[attr] = this.attributes.base[attr] + this.attributes.bonuses[attr];
        }
    }

    isValid() {
        return this.name.length >= 3 &&
               this.race !== null &&
               this.class !== null &&
               this.appearance.hairStyle !== null &&
               this.appearance.hairColor !== null &&
               this.appearance.skinTone !== null &&
               this.appearance.faceType !== null;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            race: this.race,
            class: this.class,
            appearance: this.appearance,
            attributes: this.attributes,
            level: this.level,
            experience: this.experience,
            gold: this.gold,
            inventory: this.inventory,
            equipment: this.equipment,
            createdAt: this.createdAt
        };
    }
}

// ==========================================
// RACE AND CLASS DEFINITIONS
// ==========================================

const RACES = {
    human: {
        name: 'Human',
        icon: '👨',
        description: 'Versatile and adaptable. +2 to all attributes.',
        bonuses: { strength: 2, agility: 2, vitality: 2, intelligence: 2, wisdom: 2 },
        baseModel: 'humanoid_male.vls'
    },
    elf: {
        name: 'Elf',
        icon: '🧝',
        description: 'Graceful and wise. +4 Agility, +4 Intelligence.',
        bonuses: { strength: 0, agility: 4, vitality: 0, intelligence: 4, wisdom: 0 },
        baseModel: 'elf_male.vls'
    },
    dwarf: {
        name: 'Dwarf',
        icon: '🧔',
        description: 'Sturdy and resilient. +4 Strength, +4 Vitality.',
        bonuses: { strength: 4, agility: 0, vitality: 4, intelligence: 0, wisdom: 0 },
        baseModel: 'dwarf_male.vls'
    },
    orc: {
        name: 'Orc',
        icon: '👹',
        description: 'Fierce and powerful. +6 Strength, +2 Vitality.',
        bonuses: { strength: 6, agility: 0, vitality: 2, intelligence: 0, wisdom: 0 },
        baseModel: 'orc_male.vls'
    }
};

const CLASSES = {
    warrior: {
        name: 'Warrior',
        icon: '🛡️',
        description: 'Master of melee combat. High HP and physical damage.',
        primaryStat: 'strength',
        startingHP: 150,
        startingMana: 50,
        startingEquipment: ['iron_sword', 'wooden_shield', 'leather_armor'],
        abilities: ['power_strike', 'shield_bash', 'battle_cry']
    },
    mage: {
        name: 'Mage',
        icon: '🔮',
        description: 'Wields powerful magic. High spell damage and mana.',
        primaryStat: 'intelligence',
        startingHP: 80,
        startingMana: 200,
        startingEquipment: ['wooden_staff', 'cloth_robe'],
        abilities: ['fireball', 'ice_blast', 'arcane_shield']
    },
    rogue: {
        name: 'Rogue',
        icon: '🗡️',
        description: 'Swift and deadly. High critical chance and evasion.',
        primaryStat: 'agility',
        startingHP: 100,
        startingMana: 100,
        startingEquipment: ['iron_dagger', 'leather_vest'],
        abilities: ['backstab', 'shadow_step', 'poison_blade']
    },
    cleric: {
        name: 'Cleric',
        icon: '✨',
        description: 'Divine healer. Can heal and buff allies.',
        primaryStat: 'wisdom',
        startingHP: 120,
        startingMana: 150,
        startingEquipment: ['wooden_mace', 'holy_symbol', 'cloth_robe'],
        abilities: ['heal', 'smite', 'divine_shield']
    }
};

// ==========================================
// CHARACTER CREATION CONTROLLER
// ==========================================

class CharacterCreationController {
    constructor() {
        this.character = new CharacterData();
        this.pointsRemaining = 20;
        this.maxAttributePoints = 20;
        this.selectedRace = null;
        this.selectedClass = null;
        
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        // Character name input
        document.getElementById('characterName').addEventListener('input', (e) => {
            this.character.name = e.target.value;
            this.updateStats();
            this.validateCharacter();
        });

        // Race selection
        document.querySelectorAll('[data-race]').forEach(card => {
            card.addEventListener('click', () => {
                this.selectRace(card.dataset.race);
            });
        });

        // Class selection
        document.querySelectorAll('[data-class]').forEach(card => {
            card.addEventListener('click', () => {
                this.selectClass(card.dataset.class);
            });
        });

        // Hair style
        document.querySelectorAll('[data-hair]').forEach(option => {
            option.addEventListener('click', () => {
                this.selectHairStyle(option.dataset.hair);
            });
        });

        // Hair color
        document.querySelectorAll('#hairColors [data-color]').forEach(option => {
            option.addEventListener('click', () => {
                this.selectHairColor(option.dataset.color);
            });
        });

        // Skin tone
        document.querySelectorAll('[data-skin]').forEach(option => {
            option.addEventListener('click', () => {
                this.selectSkinTone(option.dataset.skin);
            });
        });

        // Face type
        document.querySelectorAll('[data-face]').forEach(option => {
            option.addEventListener('click', () => {
                this.selectFaceType(option.dataset.face);
            });
        });

        // Attribute buttons
        document.querySelectorAll('.attribute-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const attr = btn.dataset.attr;
                const action = btn.dataset.action;
                this.modifyAttribute(attr, action === 'increase' ? 1 : -1);
            });
        });
    }

    selectRace(raceKey) {
        // Clear previous selection
        document.querySelectorAll('[data-race]').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new race
        document.querySelector(`[data-race="${raceKey}"]`).classList.add('selected');
        this.selectedRace = raceKey;
        this.character.race = raceKey;

        // Apply race bonuses
        const race = RACES[raceKey];
        this.character.attributes.bonuses = { ...race.bonuses };
        this.character.calculateTotalAttributes();

        this.updateStats();
        this.updateAttributeDisplay();
        this.validateCharacter();
        this.updatePreview();
    }

    selectClass(classKey) {
        // Clear previous selection
        document.querySelectorAll('[data-class]').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new class
        document.querySelector(`[data-class="${classKey}"]`).classList.add('selected');
        this.selectedClass = classKey;
        this.character.class = classKey;

        // Set starting equipment
        const classData = CLASSES[classKey];
        this.character.equipment = {
            weapon_main: classData.startingEquipment[0] || null,
            weapon_off: classData.startingEquipment[1] || null,
            chest: classData.startingEquipment[2] || null
        };

        this.updateStats();
        this.validateCharacter();
        this.updatePreview();
    }

    selectHairStyle(style) {
        document.querySelectorAll('[data-hair]').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-hair="${style}"]`).classList.add('selected');
        this.character.appearance.hairStyle = parseInt(style);
        this.validateCharacter();
        this.updatePreview();
    }

    selectHairColor(color) {
        document.querySelectorAll('#hairColors [data-color]').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`#hairColors [data-color="${color}"]`).classList.add('selected');
        this.character.appearance.hairColor = color;
        this.validateCharacter();
        this.updatePreview();
    }

    selectSkinTone(skin) {
        document.querySelectorAll('[data-skin]').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-skin="${skin}"]`).classList.add('selected');
        this.character.appearance.skinTone = skin;
        this.validateCharacter();
        this.updatePreview();
    }

    selectFaceType(face) {
        document.querySelectorAll('[data-face]').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-face="${face}"]`).classList.add('selected');
        this.character.appearance.faceType = parseInt(face);
        this.validateCharacter();
        this.updatePreview();
    }

    modifyAttribute(attr, change) {
        const current = this.character.attributes.base[attr];
        const newValue = current + change;

        // Validate
        if (change > 0 && this.pointsRemaining <= 0) return;
        if (change < 0 && current <= 10) return; // Min 10
        if (newValue > 30) return; // Max 30

        // Apply change
        this.character.attributes.base[attr] = newValue;
        this.pointsRemaining -= change;
        
        this.character.calculateTotalAttributes();
        this.updateAttributeDisplay();
    }

    updateAttributeDisplay() {
        for (let attr in this.character.attributes.total) {
            const element = document.getElementById(`attr${attr.charAt(0).toUpperCase() + attr.slice(1)}`);
            if (element) {
                element.textContent = this.character.attributes.total[attr];
            }
        }

        document.getElementById('pointsRemaining').textContent = this.pointsRemaining;

        // Update button states
        document.querySelectorAll('.attribute-btn').forEach(btn => {
            const attr = btn.dataset.attr;
            const action = btn.dataset.action;
            
            if (action === 'increase') {
                btn.disabled = this.pointsRemaining <= 0 || this.character.attributes.base[attr] >= 30;
            } else {
                btn.disabled = this.character.attributes.base[attr] <= 10;
            }
        });
    }

    updateStats() {
        document.getElementById('statName').textContent = this.character.name || '-';
        document.getElementById('statRace').textContent = this.selectedRace ? RACES[this.selectedRace].name : '-';
        document.getElementById('statClass').textContent = this.selectedClass ? CLASSES[this.selectedClass].name : '-';
    }

    validateCharacter() {
        const isValid = this.character.isValid() && this.pointsRemaining === 0;
        document.getElementById('createBtn').disabled = !isValid;
    }

    updateUI() {
        this.updateStats();
        this.updateAttributeDisplay();
        this.validateCharacter();
    }

    updatePreview() {
        // Update 3D preview (will be implemented with WebGL)
        // For now, just log the character state
        console.log('Character preview updated:', {
            race: this.selectedRace,
            class: this.selectedClass,
            appearance: this.character.appearance
        });
    }

    saveCharacter() {
        const characterJSON = this.character.toJSON();
        
        // Save to localStorage
        localStorage.setItem('pixelverse_character', JSON.stringify(characterJSON));
        
        console.log('Character saved:', characterJSON);
        return characterJSON;
    }

    loadCharacter(characterData) {
        this.character = Object.assign(new CharacterData(), characterData);
        
        // Restore UI state
        if (this.character.race) {
            this.selectRace(this.character.race);
        }
        if (this.character.class) {
            this.selectClass(this.character.class);
        }
        
        // Restore appearance
        if (this.character.appearance.hairStyle) {
            this.selectHairStyle(this.character.appearance.hairStyle.toString());
        }
        if (this.character.appearance.hairColor) {
            this.selectHairColor(this.character.appearance.hairColor);
        }
        if (this.character.appearance.skinTone) {
            this.selectSkinTone(this.character.appearance.skinTone);
        }
        if (this.character.appearance.faceType) {
            this.selectFaceType(this.character.appearance.faceType.toString());
        }

        // Restore name
        document.getElementById('characterName').value = this.character.name;

        // Calculate remaining points
        let totalSpent = 0;
        for (let attr in this.character.attributes.base) {
            totalSpent += (this.character.attributes.base[attr] - 10);
        }
        this.pointsRemaining = this.maxAttributePoints - totalSpent;

        this.updateUI();
    }
}

// ==========================================
// WEBGL CHARACTER PREVIEW
// ==========================================

class CharacterPreviewRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = null;
        this.character = null;
        
        this.initWebGL();
    }

    initWebGL() {
        try {
            this.context = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            
            if (!this.context) {
                console.warn('WebGL not available, using 2D canvas fallback');
                this.context = this.canvas.getContext('2d');
                this.use2DFallback = true;
            } else {
                this.setupWebGL();
            }
        } catch (e) {
            console.error('Error initializing WebGL:', e);
            this.context = this.canvas.getContext('2d');
            this.use2DFallback = true;
        }
    }

    setupWebGL() {
        const gl = this.context;
        
        // Set viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Set clear color (dark background)
        gl.clearColor(0.1, 0.1, 0.15, 1.0);
        
        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        
        // Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    updateCharacter(characterData) {
        this.character = characterData;
        this.render();
    }

    render() {
        if (this.use2DFallback) {
            this.render2D();
        } else {
            this.renderWebGL();
        }
    }

    render2D() {
        const ctx = this.context;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.character) return;

        // Draw character representation (simple for now)
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Race icon
        if (this.character.race) {
            ctx.font = '120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(RACES[this.character.race].icon, centerX, centerY - 50);
        }

        // Class icon
        if (this.character.class) {
            ctx.font = '60px Arial';
            ctx.fillText(CLASSES[this.character.class].icon, centerX, centerY + 80);
        }

        // Appearance indicators
        if (this.character.appearance.hairColor) {
            ctx.fillStyle = this.getColorHex(this.character.appearance.hairColor);
            ctx.fillRect(centerX - 80, centerY - 150, 30, 30);
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.fillText('Hair', centerX - 65, centerY - 160);
        }

        if (this.character.appearance.skinTone) {
            ctx.fillStyle = this.getColorHex(this.character.appearance.skinTone);
            ctx.fillRect(centerX + 50, centerY - 150, 30, 30);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('Skin', centerX + 65, centerY - 160);
        }
    }

    renderWebGL() {
        const gl = this.context;
        
        // Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // TODO: Implement full 3D character rendering
        // For now, fall back to 2D
        this.use2DFallback = true;
        this.render2D();
    }

    getColorHex(colorName) {
        const colors = {
            black: '#1a1a1a',
            brown: '#654321',
            blonde: '#f0e68c',
            red: '#cd5c5c',
            white: '#f5f5f5',
            blue: '#4169e1',
            light: '#ffdfc4',
            medium: '#f0c48c',
            tan: '#c68642',
            dark: '#8d5524',
            pale: '#ffe4e1',
            green: '#90ee90'
        };
        return colors[colorName] || '#ffffff';
    }
}

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

let characterController;
let previewRenderer;

window.addEventListener('DOMContentLoaded', () => {
    // Initialize controller
    characterController = new CharacterCreationController();
    
    // Initialize preview renderer
    previewRenderer = new CharacterPreviewRenderer('previewCanvas');
    
    // Check for saved character
    const savedCharacter = localStorage.getItem('pixelverse_character');
    if (savedCharacter) {
        const shouldLoad = confirm('Load previously saved character?');
        if (shouldLoad) {
            try {
                const characterData = JSON.parse(savedCharacter);
                characterController.loadCharacter(characterData);
            } catch (e) {
                console.error('Error loading character:', e);
            }
        }
    }
});

function randomizeCharacter() {
    // Random race
    const races = Object.keys(RACES);
    const randomRace = races[Math.floor(Math.random() * races.length)];
    characterController.selectRace(randomRace);

    // Random class
    const classes = Object.keys(CLASSES);
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    characterController.selectClass(randomClass);

    // Random appearance
    characterController.selectHairStyle((Math.floor(Math.random() * 5) + 1).toString());
    
    const hairColors = ['black', 'brown', 'blonde', 'red', 'white', 'blue'];
    characterController.selectHairColor(hairColors[Math.floor(Math.random() * hairColors.length)]);
    
    const skinTones = ['light', 'medium', 'tan', 'dark', 'pale', 'green'];
    characterController.selectSkinTone(skinTones[Math.floor(Math.random() * skinTones.length)]);
    
    characterController.selectFaceType((Math.floor(Math.random() * 5) + 1).toString());

    // Random attributes (distribute points randomly)
    characterController.pointsRemaining = 20;
    const attrs = ['strength', 'agility', 'vitality', 'intelligence', 'wisdom'];
    
    // Reset to base
    for (let attr of attrs) {
        characterController.character.attributes.base[attr] = 10;
    }

    // Distribute points
    while (characterController.pointsRemaining > 0) {
        const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
        if (characterController.character.attributes.base[randomAttr] < 30) {
            characterController.modifyAttribute(randomAttr, 1);
        }
    }

    // Random name
    const namePrefix = ['Azar', 'Bron', 'Cael', 'Dara', 'Eris', 'Finn', 'Gwen', 'Holt'];
    const nameSuffix = ['ion', 'or', 'an', 'is', 'el', 'us', 'eth', 'yn'];
    const randomName = namePrefix[Math.floor(Math.random() * namePrefix.length)] + 
                       nameSuffix[Math.floor(Math.random() * nameSuffix.length)];
    
    document.getElementById('characterName').value = randomName;
    characterController.character.name = randomName;
    
    characterController.updateUI();
    previewRenderer.updateCharacter(characterController.character);
}

function resetCharacter() {
    if (confirm('Reset all customization?')) {
        // Clear selections
        document.querySelectorAll('.selection-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelectorAll('.appearance-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Reset character data
        characterController.character = new CharacterData();
        characterController.selectedRace = null;
        characterController.selectedClass = null;
        characterController.pointsRemaining = 20;

        // Reset name input
        document.getElementById('characterName').value = '';

        characterController.updateUI();
        previewRenderer.updateCharacter(null);
    }
}

function createCharacter() {
    if (!characterController.character.isValid()) {
        alert('Please complete all character customization steps.');
        return;
    }

    if (characterController.pointsRemaining !== 0) {
        alert(`You have ${characterController.pointsRemaining} attribute points remaining.`);
        return;
    }

    // Save character
    const characterJSON = characterController.saveCharacter();

    console.log('✓ Character created successfully!');
    console.log(characterJSON);

    // Show success message
    alert(`Character "${characterJSON.name}" created successfully!\n\nRace: ${RACES[characterJSON.race].name}\nClass: ${CLASSES[characterJSON.class].name}\nLevel: ${characterJSON.level}`);

    // Redirect to game (or show character in multiplayer)
    const shouldPlay = confirm('Start playing now?');
    if (shouldPlay) {
        // Redirect to multiplayer client with character data
        window.location.href = `multiplayer_client.html?character=${characterJSON.id}`;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CharacterData,
        CharacterCreationController,
        CharacterPreviewRenderer,
        RACES,
        CLASSES
    };
}
