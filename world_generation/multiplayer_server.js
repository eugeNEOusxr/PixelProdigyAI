/**
 * PIXELVERSE MULTIPLAYER SYSTEM
 * =======================================================================
 * Real-time multiplayer infrastructure with:
 * - Player synchronization
 * - State management
 * - Chat system
 * - Trading system
 * - Guild mechanics
 * - Authoritative server
 * =======================================================================
 */

const WebSocket = require('ws');
const crypto = require('crypto');

// ==========================================
// PLAYER STATE MANAGEMENT
// ==========================================

class Player {
    constructor(id, username, socketId) {
        this.id = id;
        this.username = username;
        this.socketId = socketId;
        
        // Position and movement
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.isMoving = false;
        
        // Combat stats (from combat_system.cpp integration)
        this.health = 100;
        this.maxHealth = 100;
        this.mana = 100;
        this.maxMana = 100;
        this.level = 1;
        this.experience = 0;
        
        // Inventory
        this.inventory = new Map();
        this.equippedItems = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        // Social
        this.guildId = null;
        this.partyId = null;
        this.friends = [];
        this.friendRequests = []; // pending friend requests
        this.blocked = [];
        this.tradePartner = null;
        this.matchmakingQueue = null; // which queue player is in
        
        // State
        this.isOnline = true;
        this.lastUpdate = Date.now();
        this.chunkId = null;
        this.instanceId = 'world_main';
    }
    
    toNetworkState() {
        return {
            id: this.id,
            username: this.username,
            position: this.position,
            rotation: this.rotation,
            isMoving: this.isMoving,
            health: this.health,
            maxHealth: this.maxHealth,
            level: this.level,
            equippedItems: this.equippedItems,
            guildId: this.guildId
        };
    }
}

// ==========================================
// MULTIPLAYER SERVER
// ==========================================

class MultiplayerServer {
    constructor(port = 8081) {
        this.port = port;
        this.wss = null;
        this.players = new Map(); // playerId -> Player
        this.sockets = new Map(); // socketId -> ws
        this.guilds = new Map(); // guildId -> Guild
        this.parties = new Map(); // partyId -> Party
        this.tradeOffers = new Map(); // tradeId -> Trade
        this.matchmakingQueues = new Map(); // queueType -> Set<playerId>
        this.matches = new Map(); // matchId -> Match
        
        // Spatial optimization
        this.chunks = new Map(); // chunkId -> Set<playerId>
        
        // Rate limiting
        this.messageRates = new Map(); // socketId -> { count, resetTime }
        
        this.initializeServer();
    }
    
    initializeServer() {
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║           PIXELVERSE MULTIPLAYER SERVER                    ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        
        this.wss = new WebSocket.Server({ port: this.port });
        
        this.wss.on('connection', (ws, req) => {
            const socketId = this.generateSocketId();
            this.sockets.set(socketId, ws);
            
            console.log(`[Connect] New connection from ${req.socket.remoteAddress} (${socketId})`);
            
            ws.on('message', (data) => this.handleMessage(socketId, data));
            ws.on('close', () => this.handleDisconnect(socketId));
            ws.on('error', (err) => console.error(`[Error] Socket ${socketId}:`, err));
            
            // Send server info
            this.sendTo(socketId, {
                type: 'server_info',
                data: {
                    version: '1.0.0',
                    playerCount: this.players.size,
                    maxPlayers: 1000,
                    tickRate: 20 // 20 updates per second
                }
            });
        });
        
        // Start game loop
        this.startGameLoop();
        
        console.log(`✓ Multiplayer server listening on port ${this.port}`);
        console.log(`✓ Ready for player connections\n`);
    }
    
    // ==========================================
    // MESSAGE HANDLING
    // ==========================================
    
    handleMessage(socketId, data) {
        try {
            const message = JSON.parse(data);
            
            // Rate limiting
            if (!this.checkRateLimit(socketId)) {
                this.sendTo(socketId, { type: 'error', message: 'Rate limit exceeded' });
                return;
            }
            
            switch (message.type) {
                case 'auth':
                    this.handleAuth(socketId, message.data);
                    break;
                    
                case 'move':
                    this.handleMove(socketId, message.data);
                    break;
                    
                case 'chat':
                    this.handleChat(socketId, message.data);
                    break;
                    
                case 'combat_action':
                    this.handleCombatAction(socketId, message.data);
                    break;
                    
                case 'trade_request':
                    this.handleTradeRequest(socketId, message.data);
                    break;
                    
                case 'guild_action':
                    this.handleGuildAction(socketId, message.data);
                    break;
                    
                case 'friend_request':
                    this.handleFriendRequest(socketId, message.data);
                    break;
                    
                case 'friend_accept':
                    this.handleFriendAccept(socketId, message.data);
                    break;
                    
                case 'friend_decline':
                    this.handleFriendDecline(socketId, message.data);
                    break;
                    
                case 'party_create':
                    this.handlePartyCreate(socketId, message.data);
                    break;
                    
                case 'party_invite':
                    this.handlePartyInvite(socketId, message.data);
                    break;
                    
                case 'party_accept':
                    this.handlePartyAccept(socketId, message.data);
                    break;
                    
                case 'party_decline':
                    this.handlePartyDecline(socketId, message.data);
                    break;
                    
                case 'party_leave':
                    this.handlePartyLeave(socketId, message.data);
                    break;
                    
                case 'matchmaking_join':
                    this.handleMatchmakingJoin(socketId, message.data);
                    break;
                    
                case 'matchmaking_leave':
                    this.handleMatchmakingLeave(socketId, message.data);
                    break;
                    
                case 'inventory_update':
                    this.handleInventoryUpdate(socketId, message.data);
                    break;
                    
                default:
                    console.warn(`[Warning] Unknown message type: ${message.type}`);
            }
        } catch (err) {
            console.error('[Error] Message handling failed:', err);
            this.sendTo(socketId, { type: 'error', message: 'Invalid message format' });
        }
    }
    
    handleAuth(socketId, data) {
        const { username, token } = data;
        
        // TODO: Validate token with auth service
        const playerId = this.generatePlayerId();
        const player = new Player(playerId, username, socketId);
        
        // Spawn at random city
        const spawnPoints = [
            { x: 1000, y: 0, z: 1000 },  // Genesis City
            { x: 5000, y: 0, z: 5000 },  // Crystal Haven
            { x: 9000, y: 0, z: 2000 }   // Ancient Reach
        ];
        player.position = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        
        this.players.set(playerId, player);
        
        // Assign to chunk
        const chunkId = this.getChunkId(player.position);
        this.addPlayerToChunk(playerId, chunkId);
        
        console.log(`[Auth] ${username} joined (${playerId})`);
        
        // Send auth success
        this.sendTo(socketId, {
            type: 'auth_success',
            data: {
                playerId,
                player: player.toNetworkState(),
                nearbyPlayers: this.getNearbyPlayers(playerId)
            }
        });
        
        // Broadcast to nearby players
        this.broadcastToChunk(chunkId, {
            type: 'player_joined',
            data: player.toNetworkState()
        }, playerId);
    }
    
    handleMove(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        const { position, rotation, velocity, isMoving } = data;
        
        // Validate movement (anti-cheat)
        const distance = this.calculateDistance(player.position, position);
        const maxSpeed = 10; // units per second
        const deltaTime = (Date.now() - player.lastUpdate) / 1000;
        const maxDistance = maxSpeed * deltaTime;
        
        if (distance > maxDistance * 2) {
            console.warn(`[Cheat] ${player.username} moved too fast: ${distance} > ${maxDistance}`);
            // Reset to last valid position
            this.sendTo(socketId, {
                type: 'position_correction',
                data: { position: player.position }
            });
            return;
        }
        
        // Update old chunk
        const oldChunkId = player.chunkId;
        
        // Update player state
        player.position = position;
        player.rotation = rotation;
        player.velocity = velocity;
        player.isMoving = isMoving;
        player.lastUpdate = Date.now();
        
        // Check chunk change
        const newChunkId = this.getChunkId(position);
        if (oldChunkId !== newChunkId) {
            this.movePlayerToChunk(player.id, oldChunkId, newChunkId);
        }
        
        // Broadcast to nearby players
        this.broadcastToChunk(player.chunkId, {
            type: 'player_moved',
            data: {
                playerId: player.id,
                position,
                rotation,
                isMoving
            }
        }, player.id);
    }
    
    handleChat(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        const { message, channel } = data; // channel: 'global', 'guild', 'whisper', 'local'
        
        // Filter profanity
        const filtered = this.filterProfanity(message);
        
        const chatMessage = {
            type: 'chat_message',
            data: {
                playerId: player.id,
                username: player.username,
                message: filtered,
                channel,
                timestamp: Date.now()
            }
        };
        
        switch (channel) {
            case 'global':
                this.broadcast(chatMessage);
                break;
                
            case 'guild':
                if (player.guildId) {
                    this.broadcastToGuild(player.guildId, chatMessage);
                }
                break;
                
            case 'local':
                this.broadcastToChunk(player.chunkId, chatMessage);
                break;
                
            case 'whisper':
                const targetPlayer = this.players.get(data.targetPlayerId);
                if (targetPlayer) {
                    this.sendToPlayer(targetPlayer.id, chatMessage);
                    this.sendToPlayer(player.id, chatMessage); // Echo back
                }
                break;
        }
        
        console.log(`[Chat] ${player.username} (${channel}): ${filtered}`);
    }
    
    handleCombatAction(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        const { action, targetId, abilityId } = data;
        
        // Forward to C++ combat system via gameplay_bridge
        // This integrates with combat_system.cpp
        
        console.log(`[Combat] ${player.username} -> ${action} -> ${targetId}`);
        
        // Broadcast combat action to nearby players
        this.broadcastToChunk(player.chunkId, {
            type: 'combat_action',
            data: {
                attackerId: player.id,
                targetId,
                action,
                abilityId,
                timestamp: Date.now()
            }
        });
    }
    
    handleTradeRequest(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        const { action, targetPlayerId, items, gold } = data;
        
        switch (action) {
            case 'initiate':
                const targetPlayer = this.players.get(targetPlayerId);
                if (!targetPlayer) return;
                
                const tradeId = this.generateTradeId();
                this.tradeOffers.set(tradeId, {
                    id: tradeId,
                    player1: player.id,
                    player2: targetPlayerId,
                    player1Ready: false,
                    player2Ready: false,
                    player1Items: [],
                    player2Items: [],
                    player1Gold: 0,
                    player2Gold: 0,
                    status: 'pending'
                });
                
                this.sendToPlayer(targetPlayerId, {
                    type: 'trade_request',
                    data: {
                        tradeId,
                        from: player.toNetworkState()
                    }
                });
                
                console.log(`[Trade] ${player.username} -> ${targetPlayer.username}`);
                break;
                
            case 'accept':
            case 'decline':
            case 'update':
            case 'confirm':
                this.processTradeAction(player, action, data);
                break;
        }
    }
    
    handleGuildAction(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        const { action, guildId, guildName, targetPlayerId } = data;
        
        switch (action) {
            case 'create':
                const newGuildId = this.generateGuildId();
                const guild = {
                    id: newGuildId,
                    name: guildName,
                    leaderId: player.id,
                    members: [{
                        id: player.id,
                        username: player.username,
                        rank: 'Leader',
                        level: player.level,
                        online: true
                    }],
                    level: 1,
                    bank: 0
                };
                
                this.guilds.set(newGuildId, guild);
                player.guildId = newGuildId;
                
                this.sendToPlayer(player, {
                    type: 'guild_joined',
                    data: { guild }
                });
                break;
                
            default:
                this.processGuildAction(player, action, data);
        }
    }
    
    // New handler implementations
    handleFriendRequest(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        this.processFriendRequest(player, data.targetUsername);
    }
    
    handleFriendAccept(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        this.acceptFriendRequest(player, data.playerId);
    }
    
    handleFriendDecline(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        player.friendRequests = player.friendRequests.filter(id => id !== data.playerId);
    }
    
    handlePartyCreate(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        if (player.partyId) {
            this.sendToPlayer(player, {
                type: 'error',
                data: { message: 'Already in a party' }
            });
            return;
        }
        
        this.createParty(player);
    }
    
    handlePartyInvite(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        this.inviteToParty(player, data.playerId);
    }
    
    handlePartyAccept(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        this.acceptPartyInvite(player, data.partyId);
    }
    
    handlePartyDecline(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        // Just ignore the invite - no action needed
    }
    
    handlePartyLeave(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        this.leaveParty(player);
    }
    
    handleMatchmakingJoin(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        this.joinMatchmaking(player, data.queueType);
    }
    
    handleMatchmakingLeave(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        this.leaveMatchmaking(player);
    }
    
    handleInventoryUpdate(socketId, data) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        const { action, itemId, quantity, slotId } = data;
        
        // Validate with authoritative server
        // Prevent item duping
        
        console.log(`[Inventory] ${player.username}: ${action} ${itemId} x${quantity}`);
    }
    
    // ==========================================
    // SPATIAL OPTIMIZATION
    // ==========================================
    
    getChunkId(position) {
        const chunkSize = 1000; // 1km chunks
        const cx = Math.floor(position.x / chunkSize);
        const cz = Math.floor(position.z / chunkSize);
        return `${cx},${cz}`;
    }
    
    addPlayerToChunk(playerId, chunkId) {
        const player = this.players.get(playerId);
        if (!player) return;
        
        if (!this.chunks.has(chunkId)) {
            this.chunks.set(chunkId, new Set());
        }
        
        this.chunks.get(chunkId).add(playerId);
        player.chunkId = chunkId;
    }
    
    movePlayerToChunk(playerId, oldChunkId, newChunkId) {
        if (oldChunkId === newChunkId) return;
        
        // Remove from old chunk
        if (oldChunkId && this.chunks.has(oldChunkId)) {
            this.chunks.get(oldChunkId).delete(playerId);
        }
        
        // Add to new chunk
        this.addPlayerToChunk(playerId, newChunkId);
        
        const player = this.players.get(playerId);
        
        // Notify about nearby players in new chunk
        this.sendToPlayer(playerId, {
            type: 'chunk_changed',
            data: {
                chunkId: newChunkId,
                nearbyPlayers: this.getNearbyPlayers(playerId)
            }
        });
    }
    
    getNearbyPlayers(playerId) {
        const player = this.players.get(playerId);
        if (!player || !player.chunkId) return [];
        
        const nearby = [];
        const playersInChunk = this.chunks.get(player.chunkId) || new Set();
        
        for (const otherPlayerId of playersInChunk) {
            if (otherPlayerId !== playerId) {
                const otherPlayer = this.players.get(otherPlayerId);
                if (otherPlayer) {
                    nearby.push(otherPlayer.toNetworkState());
                }
            }
        }
        
        return nearby;
    }
    
    // ==========================================
    // BROADCASTING
    // ==========================================
    
    sendTo(socketId, message) {
        const ws = this.sockets.get(socketId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    
    sendToPlayer(playerId, message) {
        const player = this.players.get(playerId);
        if (player) {
            this.sendTo(player.socketId, message);
        }
    }
    
    broadcast(message, excludePlayerId = null) {
        for (const [playerId, player] of this.players) {
            if (playerId !== excludePlayerId) {
                this.sendToPlayer(playerId, message);
            }
        }
    }
    
    broadcastToChunk(chunkId, message, excludePlayerId = null) {
        const playersInChunk = this.chunks.get(chunkId);
        if (!playersInChunk) return;
        
        for (const playerId of playersInChunk) {
            if (playerId !== excludePlayerId) {
                this.sendToPlayer(playerId, message);
            }
        }
    }
    
    broadcastToGuild(guildId, message) {
        const guild = this.guilds.get(guildId);
        if (!guild) return;
        
        for (const memberId of guild.members) {
            this.sendToPlayer(memberId, message);
        }
    }
    
    // ==========================================
    // GAME LOOP
    // ==========================================
    
    startGameLoop() {
        this.tickRate = 50; // 20 ticks per second
        
        setInterval(() => {
            this.gameTick();
        }, this.tickRate);
    }
    
    gameTick() {
        // Update all player states
        const now = Date.now();
        
        for (const [playerId, player] of this.players) {
            // Check for timeout
            if (now - player.lastUpdate > 30000) { // 30 seconds
                console.log(`[Timeout] ${player.username} disconnected`);
                this.handleDisconnect(player.socketId);
                continue;
            }
            
            // Regenerate resources
            if (player.health < player.maxHealth) {
                player.health = Math.min(player.maxHealth, player.health + 0.1);
            }
            if (player.mana < player.maxMana) {
                player.mana = Math.min(player.maxMana, player.mana + 0.2);
            }
        }
        
        // Broadcast periodic state updates (every second)
        if (now % 1000 < this.tickRate) {
            this.broadcastPlayerStates();
        }
    }
    
    broadcastPlayerStates() {
        for (const [chunkId, playerIds] of this.chunks) {
            const states = [];
            for (const playerId of playerIds) {
                const player = this.players.get(playerId);
                if (player) {
                    states.push(player.toNetworkState());
                }
            }
            
            if (states.length > 0) {
                this.broadcastToChunk(chunkId, {
                    type: 'player_states',
                    data: states
                });
            }
        }
    }
    
    // ==========================================
    // DISCONNECTION
    // ==========================================
    
    handleDisconnect(socketId) {
        const player = this.getPlayerBySocket(socketId);
        if (!player) return;
        
        console.log(`[Disconnect] ${player.username} (${player.id})`);
        
        // Remove from chunk
        if (player.chunkId && this.chunks.has(player.chunkId)) {
            this.chunks.get(player.chunkId).delete(player.id);
            
            // Notify nearby players
            this.broadcastToChunk(player.chunkId, {
                type: 'player_left',
                data: { playerId: player.id }
            });
        }
        
        // Remove from collections
        this.players.delete(player.id);
        this.sockets.delete(socketId);
    }
    
    // ==========================================
    // UTILITY METHODS
    // ==========================================
    
    getPlayerBySocket(socketId) {
        for (const [playerId, player] of this.players) {
            if (player.socketId === socketId) {
                return player;
            }
        }
        return null;
    }
    
    checkRateLimit(socketId) {
        const now = Date.now();
        const limit = 100; // messages per second
        
        if (!this.messageRates.has(socketId)) {
            this.messageRates.set(socketId, { count: 1, resetTime: now + 1000 });
            return true;
        }
        
        const rate = this.messageRates.get(socketId);
        
        if (now > rate.resetTime) {
            rate.count = 1;
            rate.resetTime = now + 1000;
            return true;
        }
        
        rate.count++;
        return rate.count <= limit;
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    filterProfanity(text) {
        // TODO: Implement proper profanity filter
        return text;
    }
    
    generatePlayerId() {
        return 'player_' + crypto.randomBytes(8).toString('hex');
    }
    
    generateSocketId() {
        return 'socket_' + crypto.randomBytes(8).toString('hex');
    }
    
    generateTradeId() {
        return 'trade_' + crypto.randomBytes(8).toString('hex');
    }
    
    generateGuildId() {
        return 'guild_' + crypto.randomBytes(8).toString('hex');
    }
    
    generatePartyId() {
        return 'party_' + crypto.randomBytes(8).toString('hex');
    }
    
    generateMatchId() {
        return 'match_' + crypto.randomBytes(8).toString('hex');
    }
    
    // ==========================================
    // FRIENDS SYSTEM
    // ==========================================
    
    processFriendRequest(player, targetUsername) {
        // Find target player by username
        let targetPlayer = null;
        for (const [id, p] of this.players) {
            if (p.username === targetUsername) {
                targetPlayer = p;
                break;
            }
        }
        
        if (!targetPlayer) {
            this.sendToPlayer(player, {
                type: 'error',
                data: { message: 'Player not found' }
            });
            return;
        }
        
        if (player.friends.includes(targetPlayer.id)) {
            this.sendToPlayer(player, {
                type: 'error',
                data: { message: 'Already friends' }
            });
            return;
        }
        
        // Add to target's friend requests
        if (!targetPlayer.friendRequests.includes(player.id)) {
            targetPlayer.friendRequests.push(player.id);
        }
        
        this.sendToPlayer(targetPlayer, {
            type: 'friend_request',
            data: {
                playerId: player.id,
                username: player.username,
                level: player.level
            }
        });
    }
    
    acceptFriendRequest(player, friendId) {
        const friend = this.players.get(friendId);
        if (!friend) return;
        
        // Add to both friend lists
        if (!player.friends.includes(friendId)) {
            player.friends.push(friendId);
        }
        if (!friend.friends.includes(player.id)) {
            friend.friends.push(player.id);
        }
        
        // Remove from pending requests
        player.friendRequests = player.friendRequests.filter(id => id !== friendId);
        
        // Notify both players
        this.sendToPlayer(player, {
            type: 'friend_accepted',
            data: {
                friendId: friend.id,
                username: friend.username,
                level: friend.level
            }
        });
        
        this.sendToPlayer(friend, {
            type: 'friend_accepted',
            data: {
                friendId: player.id,
                username: player.username,
                level: player.level
            }
        });
    }
    
    // ==========================================
    // PARTY SYSTEM
    // ==========================================
    
    createParty(player) {
        const partyId = this.generatePartyId();
        const party = {
            id: partyId,
            leaderId: player.id,
            members: [{
                id: player.id,
                username: player.username,
                level: player.level,
                health: player.health,
                isLeader: true
            }],
            maxMembers: 5
        };
        
        this.parties.set(partyId, party);
        player.partyId = partyId;
        
        this.sendToPlayer(player, {
            type: 'party_joined',
            data: { party }
        });
    }
    
    inviteToParty(player, targetPlayerId) {
        if (!player.partyId) {
            this.createParty(player);
        }
        
        const party = this.parties.get(player.partyId);
        const target = this.players.get(targetPlayerId);
        
        if (!target) return;
        
        if (target.partyId) {
            this.sendToPlayer(player, {
                type: 'error',
                data: { message: 'Player already in a party' }
            });
            return;
        }
        
        if (party.members.length >= party.maxMembers) {
            this.sendToPlayer(player, {
                type: 'error',
                data: { message: 'Party is full' }
            });
            return;
        }
        
        this.sendToPlayer(target, {
            type: 'party_invite',
            data: {
                partyId: party.id,
                leaderName: player.username
            }
        });
    }
    
    acceptPartyInvite(player, partyId) {
        const party = this.parties.get(partyId);
        if (!party) return;
        
        if (party.members.length >= party.maxMembers) {
            this.sendToPlayer(player, {
                type: 'error',
                data: { message: 'Party is full' }
            });
            return;
        }
        
        party.members.push({
            id: player.id,
            username: player.username,
            level: player.level,
            health: player.health,
            isLeader: false
        });
        
        player.partyId = partyId;
        
        // Notify all party members
        party.members.forEach(member => {
            const memberPlayer = this.players.get(member.id);
            if (memberPlayer) {
                this.sendToPlayer(memberPlayer, {
                    type: 'party_updated',
                    data: { party }
                });
            }
        });
    }
    
    leaveParty(player) {
        if (!player.partyId) return;
        
        const party = this.parties.get(player.partyId);
        if (!party) return;
        
        party.members = party.members.filter(m => m.id !== player.id);
        
        // If party is empty, delete it
        if (party.members.length === 0) {
            this.parties.delete(player.partyId);
        } else if (player.id === party.leaderId) {
            // Transfer leadership
            party.leaderId = party.members[0].id;
            party.members[0].isLeader = true;
        }
        
        player.partyId = null;
        
        this.sendToPlayer(player, {
            type: 'party_left',
            data: {}
        });
        
        // Update remaining members
        if (party.members.length > 0) {
            party.members.forEach(member => {
                const memberPlayer = this.players.get(member.id);
                if (memberPlayer) {
                    this.sendToPlayer(memberPlayer, {
                        type: 'party_updated',
                        data: { party }
                    });
                }
            });
        }
    }
    
    // ==========================================
    // MATCHMAKING SYSTEM
    // ==========================================
    
    joinMatchmaking(player, queueType) {
        // Valid queue types: '1v1', '3v3', '5v5', 'tournament'
        if (!['1v1', '3v3', '5v5', 'tournament'].includes(queueType)) {
            return;
        }
        
        if (player.matchmakingQueue) {
            this.leaveMatchmaking(player);
        }
        
        if (!this.matchmakingQueues.has(queueType)) {
            this.matchmakingQueues.set(queueType, new Set());
        }
        
        this.matchmakingQueues.get(queueType).add(player.id);
        player.matchmakingQueue = queueType;
        
        this.sendToPlayer(player, {
            type: 'matchmaking_joined',
            data: { queueType }
        });
        
        // Try to find match immediately
        this.checkForMatches(queueType);
    }
    
    leaveMatchmaking(player) {
        if (!player.matchmakingQueue) return;
        
        const queue = this.matchmakingQueues.get(player.matchmakingQueue);
        if (queue) {
            queue.delete(player.id);
        }
        
        player.matchmakingQueue = null;
        
        this.sendToPlayer(player, {
            type: 'matchmaking_left',
            data: {}
        });
    }
    
    checkForMatches(queueType) {
        const queue = this.matchmakingQueues.get(queueType);
        if (!queue) return;
        
        const requiredPlayers = {
            '1v1': 2,
            '3v3': 6,
            '5v5': 10,
            'tournament': 8
        }[queueType];
        
        if (queue.size >= requiredPlayers) {
            const matchId = this.generateMatchId();
            const players = Array.from(queue).slice(0, requiredPlayers);
            
            // Create match
            const match = {
                id: matchId,
                type: queueType,
                players: players.map(id => {
                    const p = this.players.get(id);
                    queue.delete(id);
                    p.matchmakingQueue = null;
                    return {
                        id: p.id,
                        username: p.username,
                        level: p.level
                    };
                }),
                startTime: Date.now()
            };
            
            this.matches.set(matchId, match);
            
            // Notify all matched players
            players.forEach(playerId => {
                const player = this.players.get(playerId);
                if (player) {
                    this.sendToPlayer(player, {
                        type: 'match_found',
                        data: match
                    });
                }
            });
        }
    }
    
    processTradeAction(player, action, data) {
        // TODO: Implement trade logic
        console.log(`[Trade] ${player.username}: ${action}`);
    }
    
    processGuildAction(player, action, data) {
        // TODO: Implement guild logic
        console.log(`[Guild] ${player.username}: ${action}`);
    }
}

// ==========================================
// STARTUP
// ==========================================

if (require.main === module) {
    const server = new MultiplayerServer(8081);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down multiplayer server...');
        process.exit(0);
    });
}

module.exports = MultiplayerServer;
