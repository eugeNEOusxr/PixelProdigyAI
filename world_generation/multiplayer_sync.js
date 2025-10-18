/**
 * 🌐 MULTIPLAYER SYNCHRONIZATION MODULE
 * ======================================
 * Real-time multiplayer synchronization for PixelVerse
 * Handles player state, character data, and network optimization
 */

class MultiplayerSync {
    constructor(options = {}) {
        this.socket = null;
        this.connected = false;
        this.playerId = null;
        this.players = new Map();
        
        // Configuration
        this.config = {
            updateRate: options.updateRate || 20, // Updates per second
            interpolationDelay: options.interpolationDelay || 100, // ms
            compressionEnabled: options.compressionEnabled !== false,
            deltaCompression: options.deltaCompression !== false,
            maxPlayersVisible: options.maxPlayersVisible || 50,
            syncDistance: options.syncDistance || 100, // meters
            ...options
        };
        
        // Performance metrics
        this.metrics = {
            latency: 0,
            bandwidth: 0,
            syncRate: 0,
            packetsPerSecond: 0,
            droppedPackets: 0
        };
        
        // State management
        this.lastUpdate = Date.now();
        this.updateQueue = [];
        this.pendingAcks = new Map();
        
        this.init();
    }
    
    init() {
        console.log('🌐 MultiplayerSync initialized');
        console.log('📊 Config:', this.config);
    }
    
    /**
     * Connect to multiplayer server
     */
    async connect(url, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(url);
                
                this.socket.onopen = () => {
                    this.connected = true;
                    console.log('✅ Connected to multiplayer server:', url);
                    
                    // Send initial handshake
                    this.send({
                        type: 'handshake',
                        data: {
                            version: '1.0.0',
                            features: ['character_sync', 'equipment_sync', 'animation_sync'],
                            ...options
                        }
                    });
                    
                    resolve();
                };
                
                this.socket.onmessage = (event) => this.handleMessage(event);
                this.socket.onerror = (error) => reject(error);
                this.socket.onclose = () => this.handleDisconnect();
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.connected = false;
            console.log('🔌 Disconnected from multiplayer server');
        }
    }
    
    /**
     * Handle incoming messages
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'welcome':
                    this.handleWelcome(message.data);
                    break;
                    
                case 'player_joined':
                    this.handlePlayerJoined(message.data);
                    break;
                    
                case 'player_left':
                    this.handlePlayerLeft(message.data);
                    break;
                    
                case 'state_update':
                    this.handleStateUpdate(message.data);
                    break;
                    
                case 'character_update':
                    this.handleCharacterUpdate(message.data);
                    break;
                    
                case 'equipment_update':
                    this.handleEquipmentUpdate(message.data);
                    break;
                    
                case 'animation':
                    this.handleAnimation(message.data);
                    break;
                    
                case 'chat':
                    this.handleChat(message.data);
                    break;
                    
                case 'pong':
                    this.handlePong(message.data);
                    break;
                    
                default:
                    console.warn('⚠️ Unknown message type:', message.type);
            }
            
            // Update metrics
            this.metrics.packetsPerSecond++;
            
        } catch (error) {
            console.error('❌ Error parsing message:', error);
            this.metrics.droppedPackets++;
        }
    }
    
    /**
     * Handle welcome message (server assigns player ID)
     */
    handleWelcome(data) {
        this.playerId = data.playerId;
        console.log('👋 Welcome! Player ID:', this.playerId);
        
        // Load existing players
        if (data.players) {
            data.players.forEach(player => {
                this.players.set(player.id, player);
            });
            console.log(`📊 Loaded ${this.players.size} existing players`);
        }
    }
    
    /**
     * Handle player joined
     */
    handlePlayerJoined(data) {
        this.players.set(data.playerId, {
            id: data.playerId,
            character: data.character,
            position: data.position || { x: 0, y: 0, z: 0 },
            rotation: data.rotation || { x: 0, y: 0, z: 0 },
            animation: 'idle',
            equipment: data.equipment || {},
            state: 'idle'
        });
        
        console.log('➕ Player joined:', data.playerId);
    }
    
    /**
     * Handle player left
     */
    handlePlayerLeft(data) {
        this.players.delete(data.playerId);
        console.log('➖ Player left:', data.playerId);
    }
    
    /**
     * Handle state update (position, rotation)
     */
    handleStateUpdate(data) {
        const player = this.players.get(data.playerId);
        if (player) {
            // Apply interpolation
            if (this.config.interpolationDelay > 0) {
                player.targetPosition = data.position;
                player.targetRotation = data.rotation;
            } else {
                player.position = data.position;
                player.rotation = data.rotation;
            }
            
            player.state = data.state || 'idle';
        }
    }
    
    /**
     * Handle character update (appearance change)
     */
    handleCharacterUpdate(data) {
        const player = this.players.get(data.playerId);
        if (player) {
            player.character = data.character;
            console.log('👤 Character updated for:', data.playerId);
        }
    }
    
    /**
     * Handle equipment update
     */
    handleEquipmentUpdate(data) {
        const player = this.players.get(data.playerId);
        if (player) {
            player.equipment = data.equipment;
            console.log('⚔️ Equipment updated for:', data.playerId);
        }
    }
    
    /**
     * Handle animation
     */
    handleAnimation(data) {
        const player = this.players.get(data.playerId);
        if (player) {
            player.animation = data.animation;
            player.animationTime = Date.now();
        }
    }
    
    /**
     * Handle chat message
     */
    handleChat(data) {
        console.log(`💬 ${data.playerId}: ${data.message}`);
    }
    
    /**
     * Handle pong response (for latency measurement)
     */
    handlePong(data) {
        const sendTime = this.pendingAcks.get(data.pingId);
        if (sendTime) {
            this.metrics.latency = Date.now() - sendTime;
            this.pendingAcks.delete(data.pingId);
        }
    }
    
    /**
     * Handle disconnect
     */
    handleDisconnect() {
        this.connected = false;
        this.players.clear();
        console.log('🔌 Disconnected from server');
    }
    
    /**
     * Send message to server
     */
    send(message) {
        if (this.connected && this.socket) {
            try {
                const json = JSON.stringify(message);
                this.socket.send(json);
                this.metrics.bandwidth += json.length;
            } catch (error) {
                console.error('❌ Error sending message:', error);
            }
        } else {
            console.warn('⚠️ Not connected to server');
        }
    }
    
    /**
     * Update local player state
     */
    updateLocalPlayer(position, rotation, state = 'idle') {
        this.send({
            type: 'state_update',
            data: {
                position,
                rotation,
                state,
                timestamp: Date.now()
            }
        });
    }
    
    /**
     * Update local character appearance
     */
    updateCharacter(character) {
        this.send({
            type: 'character_update',
            data: { character }
        });
    }
    
    /**
     * Update equipment
     */
    updateEquipment(equipment) {
        this.send({
            type: 'equipment_update',
            data: { equipment }
        });
    }
    
    /**
     * Play animation
     */
    playAnimation(animation) {
        this.send({
            type: 'animation',
            data: { animation }
        });
    }
    
    /**
     * Send chat message
     */
    sendChat(message) {
        this.send({
            type: 'chat',
            data: { message }
        });
    }
    
    /**
     * Ping server (for latency measurement)
     */
    ping() {
        const pingId = Math.random().toString(36).substring(7);
        this.pendingAcks.set(pingId, Date.now());
        
        this.send({
            type: 'ping',
            data: { pingId }
        });
    }
    
    /**
     * Interpolate player positions (smooth movement)
     */
    interpolatePlayers(deltaTime) {
        if (this.config.interpolationDelay === 0) return;
        
        const factor = Math.min(deltaTime / this.config.interpolationDelay, 1);
        
        this.players.forEach(player => {
            if (player.targetPosition) {
                player.position = {
                    x: this.lerp(player.position.x, player.targetPosition.x, factor),
                    y: this.lerp(player.position.y, player.targetPosition.y, factor),
                    z: this.lerp(player.position.z, player.targetPosition.z, factor)
                };
            }
            
            if (player.targetRotation) {
                player.rotation = {
                    x: this.lerp(player.rotation.x, player.targetRotation.x, factor),
                    y: this.lerp(player.rotation.y, player.targetRotation.y, factor),
                    z: this.lerp(player.rotation.z, player.targetRotation.z, factor)
                };
            }
        });
    }
    
    /**
     * Linear interpolation
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    /**
     * Get nearby players (for culling distant players)
     */
    getNearbyPlayers(position, maxDistance = null) {
        const distance = maxDistance || this.config.syncDistance;
        const nearby = [];
        
        this.players.forEach(player => {
            if (player.id === this.playerId) return;
            
            const dx = player.position.x - position.x;
            const dy = player.position.y - position.y;
            const dz = player.position.z - position.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (dist <= distance) {
                nearby.push(player);
            }
        });
        
        return nearby;
    }
    
    /**
     * Get all players
     */
    getAllPlayers() {
        return Array.from(this.players.values());
    }
    
    /**
     * Get player by ID
     */
    getPlayer(playerId) {
        return this.players.get(playerId);
    }
    
    /**
     * Get metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            connected: this.connected,
            playerCount: this.players.size
        };
    }
    
    /**
     * Update (call every frame)
     */
    update(deltaTime) {
        // Interpolate player positions
        this.interpolatePlayers(deltaTime);
        
        // Send periodic ping for latency measurement
        const now = Date.now();
        if (now - this.lastUpdate > 1000) {
            this.ping();
            
            // Reset per-second metrics
            this.metrics.syncRate = this.metrics.packetsPerSecond;
            this.metrics.packetsPerSecond = 0;
            this.metrics.bandwidth = 0;
            
            this.lastUpdate = now;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerSync;
}
