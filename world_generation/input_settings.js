/**
 * ⚙️ PIXELVERSE INPUT SETTINGS MANAGER
 * =====================================
 * Manage input settings, keybindings, and user preferences
 */

class InputSettingsManager {
    constructor(inputHandler) {
        this.inputHandler = inputHandler;
        this.storageKey = 'pixelverse_input_settings';
        
        // Default presets
        this.presets = {
            'default': {
                name: 'Default',
                description: 'Standard PC gaming controls',
                bindings: {
                    'move_forward': ['KeyW'],
                    'move_backward': ['KeyS'],
                    'move_left': ['KeyA'],
                    'move_right': ['KeyD'],
                    'jump': ['Space'],
                    'crouch': ['KeyC'],
                    'sprint': ['ShiftLeft'],
                    'interact': ['KeyE'],
                    'attack': ['Mouse0'],
                    'aim': ['Mouse2']
                }
            },
            
            'arrows': {
                name: 'Arrow Keys',
                description: 'Arrow keys for movement',
                bindings: {
                    'move_forward': ['ArrowUp'],
                    'move_backward': ['ArrowDown'],
                    'move_left': ['ArrowLeft'],
                    'move_right': ['ArrowRight'],
                    'jump': ['Space'],
                    'crouch': ['ControlLeft'],
                    'sprint': ['ShiftLeft'],
                    'interact': ['KeyE'],
                    'attack': ['Mouse0'],
                    'aim': ['Mouse2']
                }
            },
            
            'esdf': {
                name: 'ESDF',
                description: 'ESDF layout (for touch typists)',
                bindings: {
                    'move_forward': ['KeyE'],
                    'move_backward': ['KeyD'],
                    'move_left': ['KeyS'],
                    'move_right': ['KeyF'],
                    'jump': ['Space'],
                    'crouch': ['KeyC'],
                    'sprint': ['ShiftLeft'],
                    'interact': ['KeyR'],
                    'attack': ['Mouse0'],
                    'aim': ['Mouse2']
                }
            },
            
            'left_handed': {
                name: 'Left Handed',
                description: 'Optimized for left-handed mouse users',
                bindings: {
                    'move_forward': ['KeyI'],
                    'move_backward': ['KeyK'],
                    'move_left': ['KeyJ'],
                    'move_right': ['KeyL'],
                    'jump': ['Space'],
                    'crouch': ['KeyN'],
                    'sprint': ['ShiftRight'],
                    'interact': ['KeyO'],
                    'attack': ['Mouse0'],
                    'aim': ['Mouse2']
                }
            }
        };
        
        // Load saved settings
        this.load();
    }
    
    /**
     * Load settings from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const settings = JSON.parse(saved);
                this.applySettings(settings);
                console.log('⚙️ Loaded input settings from storage');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load input settings:', error);
        }
    }
    
    /**
     * Save settings to localStorage
     */
    save() {
        try {
            const settings = {
                bindings: this.inputHandler.config.bindings,
                mouse: {
                    sensitivity: this.inputHandler.config.mouse.sensitivity,
                    invertY: this.inputHandler.config.mouse.invertY
                },
                gamepad: {
                    sensitivity: this.inputHandler.config.gamepad.sensitivity,
                    invertY: this.inputHandler.config.gamepad.invertY,
                    vibrationEnabled: this.inputHandler.config.gamepad.vibrationEnabled
                }
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(settings));
            console.log('💾 Saved input settings');
        } catch (error) {
            console.warn('⚠️ Failed to save input settings:', error);
        }
    }
    
    /**
     * Apply settings
     */
    applySettings(settings) {
        if (settings.bindings) {
            this.inputHandler.config.bindings = settings.bindings;
        }
        
        if (settings.mouse) {
            Object.assign(this.inputHandler.config.mouse, settings.mouse);
        }
        
        if (settings.gamepad) {
            Object.assign(this.inputHandler.config.gamepad, settings.gamepad);
        }
    }
    
    /**
     * Load a preset
     */
    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn(`⚠️ Preset '${presetName}' not found`);
            return false;
        }
        
        this.inputHandler.config.bindings = { ...preset.bindings };
        this.save();
        console.log(`✅ Loaded preset: ${preset.name}`);
        return true;
    }
    
    /**
     * Reset to defaults
     */
    resetToDefaults() {
        this.loadPreset('default');
        this.inputHandler.config.mouse.sensitivity = 1.0;
        this.inputHandler.config.mouse.invertY = false;
        this.inputHandler.config.gamepad.sensitivity = 1.0;
        this.inputHandler.config.gamepad.invertY = false;
        this.save();
        console.log('🔄 Reset to default settings');
    }
    
    /**
     * Get all presets
     */
    getPresets() {
        return Object.entries(this.presets).map(([id, preset]) => ({
            id,
            name: preset.name,
            description: preset.description
        }));
    }
    
    /**
     * Get current bindings
     */
    getBindings() {
        return { ...this.inputHandler.config.bindings };
    }
    
    /**
     * Set a binding
     */
    setBinding(action, keys) {
        this.inputHandler.rebindAction(action, keys);
        this.save();
    }
    
    /**
     * Get setting value
     */
    getSetting(category, key) {
        return this.inputHandler.config[category]?.[key];
    }
    
    /**
     * Set setting value
     */
    setSetting(category, key, value) {
        if (this.inputHandler.config[category]) {
            this.inputHandler.config[category][key] = value;
            this.save();
        }
    }
}

/**
 * 🎨 PIXELVERSE INPUT UI
 * ======================
 * UI for configuring input settings
 */

class InputUI {
    constructor(inputHandler, settingsManager) {
        this.inputHandler = inputHandler;
        this.settingsManager = settingsManager;
        this.isVisible = false;
        this.waitingForInput = null;
        
        this.createUI();
        this.setupEventListeners();
    }
    
    /**
     * Create UI elements
     */
    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'input-settings-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.95);
            border-radius: 15px;
            padding: 30px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 10000;
            display: none;
            overflow-y: auto;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8);
        `;
        
        // Title
        const title = document.createElement('h2');
        title.textContent = '⚙️ Input Settings';
        title.style.cssText = 'margin: 0 0 20px 0; color: #00ff88;';
        this.container.appendChild(title);
        
        // Tabs
        this.createTabs();
        
        // Tab content
        this.tabContent = document.createElement('div');
        this.tabContent.id = 'tab-content';
        this.container.appendChild(this.tabContent);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close';
        closeBtn.style.cssText = `
            margin-top: 20px;
            padding: 10px 20px;
            background: #ff4444;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 14px;
        `;
        closeBtn.onclick = () => this.hide();
        this.container.appendChild(closeBtn);
        
        document.body.appendChild(this.container);
    }
    
    /**
     * Create tabs
     */
    createTabs() {
        const tabsContainer = document.createElement('div');
        tabsContainer.style.cssText = 'display: flex; gap: 10px; margin-bottom: 20px;';
        
        const tabs = [
            { id: 'keybindings', label: 'Keybindings' },
            { id: 'mouse', label: 'Mouse' },
            { id: 'gamepad', label: 'Gamepad' },
            { id: 'presets', label: 'Presets' }
        ];
        
        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.textContent = tab.label;
            btn.style.cssText = `
                padding: 10px 20px;
                background: #333;
                border: none;
                border-radius: 5px;
                color: white;
                cursor: pointer;
            `;
            btn.onclick = () => this.showTab(tab.id);
            btn.dataset.tab = tab.id;
            tabsContainer.appendChild(btn);
        });
        
        this.container.appendChild(tabsContainer);
    }
    
    /**
     * Show a specific tab
     */
    showTab(tabId) {
        // Update tab buttons
        const buttons = this.container.querySelectorAll('[data-tab]');
        buttons.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.style.background = '#00ff88';
                btn.style.color = '#000';
            } else {
                btn.style.background = '#333';
                btn.style.color = '#fff';
            }
        });
        
        // Show tab content
        this.tabContent.innerHTML = '';
        
        switch (tabId) {
            case 'keybindings':
                this.showKeybindingsTab();
                break;
            case 'mouse':
                this.showMouseTab();
                break;
            case 'gamepad':
                this.showGamepadTab();
                break;
            case 'presets':
                this.showPresetsTab();
                break;
        }
    }
    
    /**
     * Show keybindings tab
     */
    showKeybindingsTab() {
        const bindings = this.settingsManager.getBindings();
        
        for (const [action, keys] of Object.entries(bindings)) {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;';
            
            const label = document.createElement('span');
            label.textContent = action.replace(/_/g, ' ').toUpperCase();
            
            const keyDisplay = document.createElement('button');
            keyDisplay.textContent = keys[0] || 'Not bound';
            keyDisplay.style.cssText = 'padding: 5px 15px; background: #444; border: none; border-radius: 3px; color: white; cursor: pointer;';
            keyDisplay.onclick = () => this.rebindKey(action, keyDisplay);
            
            row.appendChild(label);
            row.appendChild(keyDisplay);
            this.tabContent.appendChild(row);
        }
    }
    
    /**
     * Show mouse settings tab
     */
    showMouseTab() {
        // Sensitivity slider
        this.addSlider('Mouse Sensitivity', 'mouse', 'sensitivity', 0.1, 5.0, 0.1);
        
        // Invert Y checkbox
        this.addCheckbox('Invert Y Axis', 'mouse', 'invertY');
    }
    
    /**
     * Show gamepad settings tab
     */
    showGamepadTab() {
        // Sensitivity slider
        this.addSlider('Gamepad Sensitivity', 'gamepad', 'sensitivity', 0.1, 5.0, 0.1);
        
        // Invert Y checkbox
        this.addCheckbox('Invert Y Axis', 'gamepad', 'invertY');
        
        // Vibration checkbox
        this.addCheckbox('Vibration', 'gamepad', 'vibrationEnabled');
        
        // Test vibration button
        const testBtn = document.createElement('button');
        testBtn.textContent = '🎮 Test Vibration';
        testBtn.style.cssText = 'margin-top: 10px; padding: 10px 20px; background: #00ff88; border: none; border-radius: 5px; color: black; cursor: pointer;';
        testBtn.onclick = () => this.inputHandler.vibrateGamepad(500, 0.5, 1.0);
        this.tabContent.appendChild(testBtn);
    }
    
    /**
     * Show presets tab
     */
    showPresetsTab() {
        const presets = this.settingsManager.getPresets();
        
        presets.forEach(preset => {
            const row = document.createElement('div');
            row.style.cssText = 'margin: 10px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 5px;';
            
            const name = document.createElement('div');
            name.textContent = preset.name;
            name.style.cssText = 'font-weight: bold; margin-bottom: 5px;';
            
            const desc = document.createElement('div');
            desc.textContent = preset.description;
            desc.style.cssText = 'font-size: 12px; color: #aaa; margin-bottom: 10px;';
            
            const loadBtn = document.createElement('button');
            loadBtn.textContent = 'Load Preset';
            loadBtn.style.cssText = 'padding: 5px 15px; background: #00ff88; border: none; border-radius: 3px; color: black; cursor: pointer;';
            loadBtn.onclick = () => {
                this.settingsManager.loadPreset(preset.id);
                alert(`Loaded preset: ${preset.name}`);
                this.showTab('keybindings');
            };
            
            row.appendChild(name);
            row.appendChild(desc);
            row.appendChild(loadBtn);
            this.tabContent.appendChild(row);
        });
        
        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 Reset to Defaults';
        resetBtn.style.cssText = 'margin-top: 20px; padding: 10px 20px; background: #ff8800; border: none; border-radius: 5px; color: white; cursor: pointer;';
        resetBtn.onclick = () => {
            if (confirm('Reset all settings to defaults?')) {
                this.settingsManager.resetToDefaults();
                alert('Settings reset!');
                this.showTab('keybindings');
            }
        };
        this.tabContent.appendChild(resetBtn);
    }
    
    /**
     * Add slider control
     */
    addSlider(label, category, key, min, max, step) {
        const container = document.createElement('div');
        container.style.cssText = 'margin: 15px 0;';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = 'display: block; margin-bottom: 5px;';
        
        const value = this.settingsManager.getSetting(category, key);
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = value.toFixed(1);
        valueDisplay.style.cssText = 'float: right; color: #00ff88;';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;
        slider.style.cssText = 'width: 100%; margin-top: 5px;';
        slider.oninput = () => {
            valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
            this.settingsManager.setSetting(category, key, parseFloat(slider.value));
        };
        
        labelEl.appendChild(valueDisplay);
        container.appendChild(labelEl);
        container.appendChild(slider);
        this.tabContent.appendChild(container);
    }
    
    /**
     * Add checkbox control
     */
    addCheckbox(label, category, key) {
        const container = document.createElement('div');
        container.style.cssText = 'margin: 15px 0;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.settingsManager.getSetting(category, key);
        checkbox.onchange = () => {
            this.settingsManager.setSetting(category, key, checkbox.checked);
        };
        
        const labelEl = document.createElement('label');
        labelEl.textContent = ` ${label}`;
        labelEl.style.cssText = 'cursor: pointer;';
        labelEl.insertBefore(checkbox, labelEl.firstChild);
        
        container.appendChild(labelEl);
        this.tabContent.appendChild(container);
    }
    
    /**
     * Rebind a key
     */
    rebindKey(action, button) {
        button.textContent = 'Press any key...';
        button.style.background = '#ff8800';
        this.waitingForInput = { action, button };
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for key press when rebinding
        document.addEventListener('keydown', (e) => {
            if (this.waitingForInput) {
                e.preventDefault();
                const { action, button } = this.waitingForInput;
                
                this.settingsManager.setBinding(action, [e.code]);
                button.textContent = e.code;
                button.style.background = '#444';
                this.waitingForInput = null;
            }
        });
    }
    
    /**
     * Show UI
     */
    show() {
        this.container.style.display = 'block';
        this.isVisible = true;
        this.showTab('keybindings');
    }
    
    /**
     * Hide UI
     */
    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }
    
    /**
     * Toggle UI
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InputSettingsManager, InputUI };
}
