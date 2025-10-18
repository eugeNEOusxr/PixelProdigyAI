/**
 * 🎮 PIXELVERSE INPUT HANDLER
 * ============================
 * Unified input system supporting keyboard, mouse, gamepad, and touch
 */

class InputHandler {
    constructor(options = {}) {
        // Input sources
        this.SOURCES = {
            KEYBOARD: 'keyboard',
            MOUSE: 'mouse',
            GAMEPAD: 'gamepad',
            TOUCH: 'touch'
        };
        
        // Configuration
        this.config = {
            // Mouse settings
            mouse: {
                sensitivity: 1.0,
                invertY: false,
                smoothing: 0.1,
                lockPointer: true
            },
            
            // Keyboard settings
            keyboard: {
                repeatDelay: 0.3,
                repeatRate: 0.05
            },
            
            // Gamepad settings
            gamepad: {
                enabled: true,
                deadzone: 0.15,
                sensitivity: 1.0,
                invertY: false,
                vibrationEnabled: true
            },
            
            // Touch settings
            touch: {
                enabled: true,
                joystickRadius: 80,
                joystickDeadzone: 0.2,
                doubleTapTime: 300,
                swipeSensitivity: 0.5
            },
            
            // Action bindings (default keybindings)
            bindings: {
                // Movement
                'move_forward': ['KeyW', 'ArrowUp'],
                'move_backward': ['KeyS', 'ArrowDown'],
                'move_left': ['KeyA', 'ArrowLeft'],
                'move_right': ['KeyD', 'ArrowRight'],
                
                // Actions
                'jump': ['Space'],
                'crouch': ['KeyC', 'ControlLeft'],
                'sprint': ['ShiftLeft'],
                'interact': ['KeyE'],
                'use': ['Mouse0'], // Left click
                'aim': ['Mouse2'], // Right click
                
                // Combat
                'attack': ['Mouse0'],
                'special_attack': ['KeyQ'],
                'reload': ['KeyR'],
                'switch_weapon': ['KeyX'],
                
                // Camera
                'toggle_camera': ['KeyV'],
                'zoom_in': ['Equal', 'NumpadAdd'],
                'zoom_out': ['Minus', 'NumpadSubtract'],
                
                // UI
                'inventory': ['KeyI', 'Tab'],
                'map': ['KeyM'],
                'menu': ['Escape'],
                'screenshot': ['F12']
            },
            
            ...options
        };
        
        // Input state
        this.state = {
            // Keyboard
            keys: new Map(),
            keysPressed: new Set(),
            keysJustPressed: new Set(),
            keysJustReleased: new Set(),
            
            // Mouse
            mouse: {
                x: 0,
                y: 0,
                deltaX: 0,
                deltaY: 0,
                scrollDelta: 0,
                buttons: new Map(),
                locked: false
            },
            
            // Gamepad
            gamepad: {
                connected: false,
                index: -1,
                axes: [0, 0, 0, 0], // [leftX, leftY, rightX, rightY]
                buttons: new Map(),
                vibrating: false
            },
            
            // Touch
            touch: {
                active: false,
                touches: [],
                joystick: {
                    active: false,
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    deltaX: 0,
                    deltaY: 0
                },
                swipe: {
                    startX: 0,
                    startY: 0,
                    deltaX: 0,
                    deltaY: 0
                },
                lastTapTime: 0
            },
            
            // Actions (mapped from raw inputs)
            actions: new Map()
        };
        
        // Event listeners storage
        this.listeners = [];
        
        this.init();
    }
    
    /**
     * Initialize input handler
     */
    init() {
        console.log('🎮 Input Handler initialized');
        
        // Setup all input sources
        this.setupKeyboard();
        this.setupMouse();
        this.setupGamepad();
        this.setupTouch();
        
        // Start update loop for gamepad
        this.startGamepadPoll();
    }
    
    /**
     * Setup keyboard input
     */
    setupKeyboard() {
        const onKeyDown = (e) => {
            const code = e.code;
            
            // Check if already pressed (for repeat detection)
            if (!this.state.keys.get(code)) {
                this.state.keysJustPressed.add(code);
            }
            
            this.state.keys.set(code, true);
            this.state.keysPressed.add(code);
            
            // Update actions
            this.updateActions();
            
            // Prevent default for game keys
            if (this.isGameKey(code)) {
                e.preventDefault();
            }
        };
        
        const onKeyUp = (e) => {
            const code = e.code;
            
            this.state.keys.set(code, false);
            this.state.keysPressed.delete(code);
            this.state.keysJustReleased.add(code);
            
            // Update actions
            this.updateActions();
            
            if (this.isGameKey(code)) {
                e.preventDefault();
            }
        };
        
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        this.listeners.push(() => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        });
    }
    
    /**
     * Setup mouse input
     */
    setupMouse() {
        // Mouse movement
        const onMouseMove = (e) => {
            if (this.state.mouse.locked) {
                this.state.mouse.deltaX += e.movementX * this.config.mouse.sensitivity;
                this.state.mouse.deltaY += e.movementY * this.config.mouse.sensitivity;
            }
            
            this.state.mouse.x = e.clientX;
            this.state.mouse.y = e.clientY;
        };
        
        // Mouse buttons
        const onMouseDown = (e) => {
            const button = `Mouse${e.button}`;
            this.state.mouse.buttons.set(button, true);
            this.updateActions();
            
            // Request pointer lock on click
            if (this.config.mouse.lockPointer && !this.state.mouse.locked) {
                document.body.requestPointerLock();
            }
        };
        
        const onMouseUp = (e) => {
            const button = `Mouse${e.button}`;
            this.state.mouse.buttons.set(button, false);
            this.updateActions();
        };
        
        // Mouse wheel
        const onWheel = (e) => {
            this.state.mouse.scrollDelta += e.deltaY;
            e.preventDefault();
        };
        
        // Pointer lock
        const onPointerLockChange = () => {
            this.state.mouse.locked = document.pointerLockElement === document.body;
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('wheel', onWheel, { passive: false });
        document.addEventListener('pointerlockchange', onPointerLockChange);
        
        this.listeners.push(() => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('wheel', onWheel);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
        });
    }
    
    /**
     * Setup gamepad input
     */
    setupGamepad() {
        if (!this.config.gamepad.enabled) return;
        
        const onGamepadConnected = (e) => {
            console.log(`🎮 Gamepad connected: ${e.gamepad.id}`);
            this.state.gamepad.connected = true;
            this.state.gamepad.index = e.gamepad.index;
        };
        
        const onGamepadDisconnected = (e) => {
            console.log(`🎮 Gamepad disconnected: ${e.gamepad.id}`);
            this.state.gamepad.connected = false;
            this.state.gamepad.index = -1;
        };
        
        window.addEventListener('gamepadconnected', onGamepadConnected);
        window.addEventListener('gamepaddisconnected', onGamepadDisconnected);
        
        this.listeners.push(() => {
            window.removeEventListener('gamepadconnected', onGamepadConnected);
            window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
        });
    }
    
    /**
     * Setup touch input
     */
    setupTouch() {
        if (!this.config.touch.enabled) return;
        
        const onTouchStart = (e) => {
            this.state.touch.active = true;
            const touch = e.touches[0];
            
            // Virtual joystick
            if (touch.clientX < window.innerWidth / 2) {
                this.state.touch.joystick.active = true;
                this.state.touch.joystick.startX = touch.clientX;
                this.state.touch.joystick.startY = touch.clientY;
            }
            
            // Camera look (right side)
            if (touch.clientX >= window.innerWidth / 2) {
                this.state.touch.swipe.startX = touch.clientX;
                this.state.touch.swipe.startY = touch.clientY;
            }
            
            // Double tap detection
            const now = Date.now();
            if (now - this.state.touch.lastTapTime < this.config.touch.doubleTapTime) {
                this.onDoubleTap();
            }
            this.state.touch.lastTapTime = now;
            
            e.preventDefault();
        };
        
        const onTouchMove = (e) => {
            const touch = e.touches[0];
            
            // Update joystick
            if (this.state.touch.joystick.active) {
                this.state.touch.joystick.currentX = touch.clientX;
                this.state.touch.joystick.currentY = touch.clientY;
                
                const dx = touch.clientX - this.state.touch.joystick.startX;
                const dy = touch.clientY - this.state.touch.joystick.startY;
                
                this.state.touch.joystick.deltaX = dx / this.config.touch.joystickRadius;
                this.state.touch.joystick.deltaY = dy / this.config.touch.joystickRadius;
            }
            
            // Update camera swipe
            if (touch.clientX >= window.innerWidth / 2) {
                const dx = touch.clientX - this.state.touch.swipe.startX;
                const dy = touch.clientY - this.state.touch.swipe.startY;
                
                this.state.touch.swipe.deltaX = dx * this.config.touch.swipeSensitivity;
                this.state.touch.swipe.deltaY = dy * this.config.touch.swipeSensitivity;
                
                this.state.touch.swipe.startX = touch.clientX;
                this.state.touch.swipe.startY = touch.clientY;
            }
            
            e.preventDefault();
        };
        
        const onTouchEnd = (e) => {
            this.state.touch.joystick.active = false;
            this.state.touch.joystick.deltaX = 0;
            this.state.touch.joystick.deltaY = 0;
            
            this.state.touch.swipe.deltaX = 0;
            this.state.touch.swipe.deltaY = 0;
            
            if (e.touches.length === 0) {
                this.state.touch.active = false;
            }
        };
        
        document.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
        
        this.listeners.push(() => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        });
    }
    
    /**
     * Poll gamepad state (called every frame)
     */
    pollGamepad() {
        if (!this.config.gamepad.enabled || !this.state.gamepad.connected) return;
        
        const gamepad = navigator.getGamepads()[this.state.gamepad.index];
        if (!gamepad) return;
        
        // Update axes
        const deadzone = this.config.gamepad.deadzone;
        for (let i = 0; i < gamepad.axes.length && i < 4; i++) {
            let value = gamepad.axes[i];
            // Apply deadzone
            if (Math.abs(value) < deadzone) value = 0;
            this.state.gamepad.axes[i] = value;
        }
        
        // Update buttons
        for (let i = 0; i < gamepad.buttons.length; i++) {
            const button = gamepad.buttons[i];
            this.state.gamepad.buttons.set(i, button.pressed);
        }
        
        // Update actions from gamepad
        this.updateActionsFromGamepad();
    }
    
    /**
     * Start gamepad polling loop
     */
    startGamepadPoll() {
        const poll = () => {
            this.pollGamepad();
            requestAnimationFrame(poll);
        };
        poll();
    }
    
    /**
     * Update action states from current inputs
     */
    updateActions() {
        // Check each action binding
        for (const [action, keys] of Object.entries(this.config.bindings)) {
            let active = false;
            
            // Check keyboard
            for (const key of keys) {
                if (this.state.keys.get(key) || this.state.keysPressed.has(key)) {
                    active = true;
                    break;
                }
                
                // Check mouse buttons
                if (this.state.mouse.buttons.get(key)) {
                    active = true;
                    break;
                }
            }
            
            this.state.actions.set(action, active);
        }
    }
    
    /**
     * Update actions from gamepad
     */
    updateActionsFromGamepad() {
        if (!this.state.gamepad.connected) return;
        
        // Map gamepad buttons to actions
        // Button 0 (A/Cross) = jump
        if (this.state.gamepad.buttons.get(0)) {
            this.state.actions.set('jump', true);
        }
        
        // Button 1 (B/Circle) = crouch
        if (this.state.gamepad.buttons.get(1)) {
            this.state.actions.set('crouch', true);
        }
        
        // Button 2 (X/Square) = interact
        if (this.state.gamepad.buttons.get(2)) {
            this.state.actions.set('interact', true);
        }
        
        // Button 3 (Y/Triangle) = special
        if (this.state.gamepad.buttons.get(3)) {
            this.state.actions.set('special_attack', true);
        }
        
        // Shoulder buttons
        if (this.state.gamepad.buttons.get(6)) { // L2/LT
            this.state.actions.set('aim', true);
        }
        if (this.state.gamepad.buttons.get(7)) { // R2/RT
            this.state.actions.set('attack', true);
        }
        
        // Sprint (Left stick click)
        if (this.state.gamepad.buttons.get(10)) {
            this.state.actions.set('sprint', true);
        }
    }
    
    /**
     * Get movement input (-1 to 1 for each axis)
     */
    getMovement() {
        let x = 0, y = 0;
        
        // Keyboard
        if (this.isActionActive('move_forward')) y += 1;
        if (this.isActionActive('move_backward')) y -= 1;
        if (this.isActionActive('move_right')) x += 1;
        if (this.isActionActive('move_left')) x -= 1;
        
        // Gamepad (left stick)
        if (this.state.gamepad.connected) {
            x += this.state.gamepad.axes[0];
            y -= this.state.gamepad.axes[1]; // Inverted Y
        }
        
        // Touch (virtual joystick)
        if (this.state.touch.joystick.active) {
            x += this.state.touch.joystick.deltaX;
            y -= this.state.touch.joystick.deltaY;
        }
        
        // Clamp to -1 to 1
        x = Math.max(-1, Math.min(1, x));
        y = Math.max(-1, Math.min(1, y));
        
        return { x, y };
    }
    
    /**
     * Get camera look delta
     */
    getLookDelta() {
        let x = this.state.mouse.deltaX;
        let y = this.state.mouse.deltaY * (this.config.mouse.invertY ? 1 : -1);
        
        // Add gamepad right stick
        if (this.state.gamepad.connected) {
            x += this.state.gamepad.axes[2] * this.config.gamepad.sensitivity * 5;
            y += this.state.gamepad.axes[3] * this.config.gamepad.sensitivity * 5 * 
                (this.config.gamepad.invertY ? 1 : -1);
        }
        
        // Add touch swipe
        if (this.state.touch.active) {
            x += this.state.touch.swipe.deltaX;
            y += this.state.touch.swipe.deltaY;
        }
        
        return { x, y };
    }
    
    /**
     * Check if action is currently active
     */
    isActionActive(action) {
        return this.state.actions.get(action) || false;
    }
    
    /**
     * Check if action was just pressed this frame
     */
    isActionJustPressed(action) {
        const keys = this.config.bindings[action] || [];
        for (const key of keys) {
            if (this.state.keysJustPressed.has(key)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if key is a game control key
     */
    isGameKey(code) {
        for (const keys of Object.values(this.config.bindings)) {
            if (keys.includes(code)) return true;
        }
        return false;
    }
    
    /**
     * Handle double tap event
     */
    onDoubleTap() {
        // Double tap could trigger sprint or special action
        this.state.actions.set('sprint', true);
        console.log('📱 Double tap detected');
    }
    
    /**
     * Rebind an action
     */
    rebindAction(action, newKeys) {
        if (this.config.bindings[action]) {
            this.config.bindings[action] = Array.isArray(newKeys) ? newKeys : [newKeys];
            console.log(`🔄 Rebound ${action} to ${newKeys}`);
        }
    }
    
    /**
     * Set mouse sensitivity
     */
    setMouseSensitivity(value) {
        this.config.mouse.sensitivity = Math.max(0.1, Math.min(5.0, value));
    }
    
    /**
     * Vibrate gamepad
     */
    vibrateGamepad(duration = 200, weakMagnitude = 0.5, strongMagnitude = 0.5) {
        if (!this.config.gamepad.vibrationEnabled || !this.state.gamepad.connected) return;
        
        const gamepad = navigator.getGamepads()[this.state.gamepad.index];
        if (gamepad && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                duration,
                weakMagnitude,
                strongMagnitude
            });
            this.state.gamepad.vibrating = true;
            
            setTimeout(() => {
                this.state.gamepad.vibrating = false;
            }, duration);
        }
    }
    
    /**
     * Reset frame-specific input states (call at end of frame)
     */
    resetFrameState() {
        this.state.keysJustPressed.clear();
        this.state.keysJustReleased.clear();
        this.state.mouse.deltaX = 0;
        this.state.mouse.deltaY = 0;
        this.state.mouse.scrollDelta = 0;
        this.state.touch.swipe.deltaX = 0;
        this.state.touch.swipe.deltaY = 0;
    }
    
    /**
     * Get debug info
     */
    getInfo() {
        const movement = this.getMovement();
        const look = this.getLookDelta();
        
        return {
            keyboard: this.state.keysPressed.size > 0,
            mouse: this.state.mouse.locked,
            gamepad: this.state.gamepad.connected,
            touch: this.state.touch.active,
            movement: `${movement.x.toFixed(2)}, ${movement.y.toFixed(2)}`,
            look: `${look.x.toFixed(2)}, ${look.y.toFixed(2)}`,
            actions: Array.from(this.state.actions.entries())
                .filter(([_, active]) => active)
                .map(([action]) => action)
        };
    }
    
    /**
     * Cleanup
     */
    destroy() {
        // Remove all event listeners
        this.listeners.forEach(remove => remove());
        this.listeners = [];
        console.log('🎮 Input Handler destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}
