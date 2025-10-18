// PixelVerse Multiplayer Client
// Handles WebSocket connection, player sync, social features

class MultiplayerClient {
    constructor() {
        this.ws = null;
        this.playerId = null;
        this.username = null;
        this.player = null;
        this.nearbyPlayers = new Map();
        this.friends = new Map();
        this.party = null;
        this.guild = null;
        this.activeTrade = null;
        this.matchmakingQueue = null;
        
        // UI Elements
        this.loginScreen = document.getElementById('login-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.friendsList = document.getElementById('friends-list');
        this.nearbyPlayersList = document.getElementById('nearby-players-list');
        
        this.setupEventListeners();
        this.startRenderLoop();
    }

    // ===== CONNECTION =====
    
    connect(username) {
        this.username = username;
        this.updateConnectionStatus('Connecting...');
        
        this.ws = new WebSocket('ws://localhost:8081');
        
        this.ws.onopen = () => {
            console.log('Connected to multiplayer server');
            this.authenticate();
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showNotification('Connection error', 'error');
            this.updateConnectionStatus('Connection failed');
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.showNotification('Disconnected from server', 'error');
            this.updateConnectionStatus('Disconnected');
        };
    }
    
    authenticate() {
        this.send({
            type: 'auth',
            data: {
                username: this.username,
                token: 'demo_token_' + Date.now()
            }
        });
    }
    
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
    
    // ===== MESSAGE HANDLING =====
    
    handleMessage(message) {
        const handlers = {
            'server_info': () => this.handleServerInfo(message.data),
            'auth_success': () => this.handleAuthSuccess(message.data),
            'auth_failed': () => this.handleAuthFailed(message.data),
            'player_joined': () => this.handlePlayerJoined(message.data),
            'player_left': () => this.handlePlayerLeft(message.data),
            'player_moved': () => this.handlePlayerMoved(message.data),
            'chat_message': () => this.handleChatMessage(message.data),
            'friend_request': () => this.handleFriendRequest(message.data),
            'friend_accepted': () => this.handleFriendAccepted(message.data),
            'friend_online': () => this.handleFriendOnline(message.data),
            'friend_offline': () => this.handleFriendOffline(message.data),
            'party_invite': () => this.handlePartyInvite(message.data),
            'party_joined': () => this.handlePartyJoined(message.data),
            'party_updated': () => this.handlePartyUpdated(message.data),
            'party_left': () => this.handlePartyLeft(message.data),
            'guild_invite': () => this.handleGuildInvite(message.data),
            'guild_joined': () => this.handleGuildJoined(message.data),
            'guild_updated': () => this.handleGuildUpdated(message.data),
            'trade_request': () => this.handleTradeRequest(message.data),
            'trade_updated': () => this.handleTradeUpdated(message.data),
            'trade_completed': () => this.handleTradeCompleted(message.data),
            'trade_cancelled': () => this.handleTradeCancelled(message.data),
            'matchmaking_joined': () => this.handleMatchmakingJoined(message.data),
            'match_found': () => this.handleMatchFound(message.data),
            'combat_action': () => this.handleCombatAction(message.data),
            'error': () => this.showNotification(message.data.message, 'error')
        };
        
        const handler = handlers[message.type];
        if (handler) {
            handler();
        } else {
            console.warn('Unhandled message type:', message.type);
        }
    }
    
    handleServerInfo(data) {
        console.log('Server info:', data);
        this.updateConnectionStatus(`Server v${data.version} - ${data.playerCount}/${data.maxPlayers} players`);
    }
    
    handleAuthSuccess(data) {
        this.playerId = data.playerId;
        this.player = data.player;
        
        console.log('Authenticated:', data);
        this.showNotification(`Welcome, ${this.username}!`, 'success');
        
        // Switch to game screen
        this.loginScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        // Update HUD
        this.updateHUD();
        
        // Add nearby players
        data.nearbyPlayers.forEach(player => {
            this.nearbyPlayers.set(player.id, player);
        });
        this.renderNearbyPlayers();
        
        // Start movement simulation
        this.startMovementSimulation();
    }
    
    handleAuthFailed(data) {
        this.showNotification('Authentication failed: ' + data.reason, 'error');
    }
    
    handlePlayerJoined(data) {
        this.nearbyPlayers.set(data.id, data);
        this.renderNearbyPlayers();
        this.showNotification(`${data.username} joined`, 'info');
    }
    
    handlePlayerLeft(data) {
        this.nearbyPlayers.delete(data.playerId);
        this.renderNearbyPlayers();
    }
    
    handlePlayerMoved(data) {
        const player = this.nearbyPlayers.get(data.playerId);
        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
            player.isMoving = data.isMoving;
        }
    }
    
    handleChatMessage(data) {
        this.addChatMessage(data.username, data.message, data.channel);
    }
    
    handleFriendRequest(data) {
        this.showNotification(`${data.username} sent you a friend request`, 'info');
        // Show accept/decline UI
        const notification = this.showNotification(
            `Friend request from ${data.username}`,
            'info',
            [
                { text: 'Accept', action: () => this.acceptFriendRequest(data.playerId) },
                { text: 'Decline', action: () => this.declineFriendRequest(data.playerId) }
            ]
        );
    }
    
    handleFriendAccepted(data) {
        this.friends.set(data.friendId, {
            id: data.friendId,
            username: data.username,
            online: true,
            level: data.level
        });
        this.renderFriendsList();
        this.showNotification(`${data.username} accepted your friend request!`, 'success');
    }
    
    handleFriendOnline(data) {
        const friend = this.friends.get(data.friendId);
        if (friend) {
            friend.online = true;
            this.renderFriendsList();
        }
    }
    
    handleFriendOffline(data) {
        const friend = this.friends.get(data.friendId);
        if (friend) {
            friend.online = false;
            this.renderFriendsList();
        }
    }
    
    handlePartyInvite(data) {
        this.showNotification(
            `${data.leaderName} invited you to a party`,
            'info',
            [
                { text: 'Accept', action: () => this.acceptPartyInvite(data.partyId) },
                { text: 'Decline', action: () => this.declinePartyInvite(data.partyId) }
            ]
        );
    }
    
    handlePartyJoined(data) {
        this.party = data.party;
        this.renderParty();
        this.showNotification('You joined a party!', 'success');
    }
    
    handlePartyUpdated(data) {
        this.party = data.party;
        this.renderParty();
    }
    
    handlePartyLeft(data) {
        this.party = null;
        this.renderParty();
        this.showNotification('You left the party', 'info');
    }
    
    handleGuildInvite(data) {
        this.showNotification(
            `${data.inviterName} invited you to ${data.guildName}`,
            'info',
            [
                { text: 'Accept', action: () => this.acceptGuildInvite(data.guildId) },
                { text: 'Decline', action: () => this.declineGuildInvite(data.guildId) }
            ]
        );
    }
    
    handleGuildJoined(data) {
        this.guild = data.guild;
        this.renderGuild();
        this.showNotification(`You joined ${data.guild.name}!`, 'success');
    }
    
    handleGuildUpdated(data) {
        this.guild = data.guild;
        this.renderGuild();
    }
    
    handleTradeRequest(data) {
        this.showNotification(
            `${data.username} wants to trade`,
            'info',
            [
                { text: 'Accept', action: () => this.acceptTrade(data.tradeId) },
                { text: 'Decline', action: () => this.declineTrade(data.tradeId) }
            ]
        );
    }
    
    handleTradeUpdated(data) {
        this.activeTrade = data.trade;
        this.renderTradeWindow();
    }
    
    handleTradeCompleted(data) {
        this.showNotification('Trade completed!', 'success');
        this.closeTrade();
    }
    
    handleTradeCancelled(data) {
        this.showNotification('Trade cancelled', 'info');
        this.closeTrade();
    }
    
    handleMatchmakingJoined(data) {
        this.matchmakingQueue = data.queueType;
        const button = document.querySelector(`[data-queue="${data.queueType}"]`);
        if (button) {
            button.classList.add('active');
            button.textContent = 'Searching...';
        }
        document.getElementById('queue-status').innerHTML = `
            <div class="loading">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p style="margin-top: 10px;">Searching for opponents...</p>
        `;
    }
    
    handleMatchFound(data) {
        this.showNotification('Match found!', 'success');
        document.getElementById('queue-status').innerHTML = `
            <p style="color: #4CAF50; font-size: 18px; font-weight: bold;">Match Found!</p>
            <p>Opponents: ${data.players.map(p => p.username).join(', ')}</p>
        `;
        // Clear queue state after 3 seconds
        setTimeout(() => {
            this.matchmakingQueue = null;
            document.querySelector('.matchmaking-button.active')?.classList.remove('active');
            document.getElementById('queue-status').innerHTML = '';
        }, 3000);
    }
    
    handleCombatAction(data) {
        console.log('Combat action:', data);
        // Visualize combat in 3D view
    }
    
    // ===== ACTIONS =====
    
    sendMove(position, rotation, velocity, isMoving) {
        this.send({
            type: 'move',
            data: { position, rotation, velocity, isMoving }
        });
    }
    
    sendChat(message, channel = 'global') {
        if (!message.trim()) return;
        
        this.send({
            type: 'chat',
            data: { message, channel }
        });
    }
    
    sendFriendRequest(username) {
        this.send({
            type: 'friend_request',
            data: { targetUsername: username }
        });
        this.showNotification(`Friend request sent to ${username}`, 'info');
    }
    
    acceptFriendRequest(playerId) {
        this.send({
            type: 'friend_accept',
            data: { playerId }
        });
    }
    
    declineFriendRequest(playerId) {
        this.send({
            type: 'friend_decline',
            data: { playerId }
        });
    }
    
    createParty() {
        this.send({
            type: 'party_create',
            data: {}
        });
    }
    
    inviteToParty(playerId) {
        this.send({
            type: 'party_invite',
            data: { playerId }
        });
        this.showNotification('Party invite sent!', 'info');
    }
    
    acceptPartyInvite(partyId) {
        this.send({
            type: 'party_accept',
            data: { partyId }
        });
    }
    
    declinePartyInvite(partyId) {
        this.send({
            type: 'party_decline',
            data: { partyId }
        });
    }
    
    leaveParty() {
        this.send({
            type: 'party_leave',
            data: {}
        });
    }
    
    createGuild(guildName) {
        this.send({
            type: 'guild_action',
            data: { action: 'create', guildName }
        });
    }
    
    inviteToGuild(playerId) {
        this.send({
            type: 'guild_action',
            data: { action: 'invite', targetPlayerId: playerId }
        });
    }
    
    acceptGuildInvite(guildId) {
        this.send({
            type: 'guild_accept',
            data: { guildId }
        });
    }
    
    declineGuildInvite(guildId) {
        this.send({
            type: 'guild_decline',
            data: { guildId }
        });
    }
    
    requestTrade(playerId) {
        this.send({
            type: 'trade_request',
            data: { action: 'initiate', targetPlayerId: playerId }
        });
    }
    
    acceptTrade(tradeId) {
        this.send({
            type: 'trade_accept',
            data: { tradeId }
        });
    }
    
    declineTrade(tradeId) {
        this.send({
            type: 'trade_decline',
            data: { tradeId }
        });
    }
    
    confirmTrade() {
        this.send({
            type: 'trade_request',
            data: { action: 'confirm' }
        });
    }
    
    joinMatchmaking(queueType) {
        if (this.matchmakingQueue) {
            this.leaveMatchmaking();
            return;
        }
        
        this.send({
            type: 'matchmaking_join',
            data: { queueType }
        });
    }
    
    leaveMatchmaking() {
        this.send({
            type: 'matchmaking_leave',
            data: {}
        });
        this.matchmakingQueue = null;
        document.querySelector('.matchmaking-button.active')?.classList.remove('active');
        document.getElementById('queue-status').innerHTML = '';
    }
    
    // ===== UI RENDERING =====
    
    updateHUD() {
        if (!this.player) return;
        
        document.getElementById('player-hp').textContent = this.player.health;
        document.getElementById('player-level').textContent = this.player.level;
        document.getElementById('player-gold').textContent = this.player.gold || 0;
        document.getElementById('player-position').textContent = 
            `${Math.round(this.player.position.x)}, ${Math.round(this.player.position.y)}, ${Math.round(this.player.position.z)}`;
    }
    
    addChatMessage(username, message, channel = 'global') {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${channel}`;
        messageEl.innerHTML = `
            <span class="username">[${username}]</span>
            <span class="message">${this.escapeHtml(message)}</span>
        `;
        
        this.chatMessages.appendChild(messageEl);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Limit messages
        while (this.chatMessages.children.length > 100) {
            this.chatMessages.removeChild(this.chatMessages.firstChild);
        }
    }
    
    renderNearbyPlayers() {
        this.nearbyPlayersList.innerHTML = '';
        
        this.nearbyPlayers.forEach((player, playerId) => {
            if (playerId === this.playerId) return;
            
            const playerEl = document.createElement('div');
            playerEl.className = 'player-item';
            playerEl.innerHTML = `
                <div class="player-avatar">${player.username[0].toUpperCase()}</div>
                <div class="player-details">
                    <div class="player-username">${player.username}</div>
                    <div class="player-level">Level ${player.level}</div>
                </div>
            `;
            
            playerEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e.clientX, e.clientY, playerId);
            });
            
            this.nearbyPlayersList.appendChild(playerEl);
        });
    }
    
    renderFriendsList() {
        this.friendsList.innerHTML = '';
        
        if (this.friends.size === 0) {
            this.friendsList.innerHTML = '<p style="padding: 20px; text-align: center; opacity: 0.7;">No friends yet</p>';
            return;
        }
        
        this.friends.forEach((friend, friendId) => {
            const friendEl = document.createElement('div');
            friendEl.className = 'friend-item';
            friendEl.innerHTML = `
                <div class="friend-status ${friend.online ? 'online' : 'offline'}"></div>
                <div class="friend-name">
                    <div>${friend.username}</div>
                    <div style="font-size: 12px; opacity: 0.7;">Level ${friend.level}</div>
                </div>
                <div class="friend-actions">
                    ${friend.online ? '<button data-action="whisper">Whisper</button>' : ''}
                    ${friend.online ? '<button data-action="invite">Invite</button>' : ''}
                </div>
            `;
            
            friendEl.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    if (action === 'whisper') {
                        document.getElementById('chat-channel-select').value = 'whisper';
                        document.getElementById('chat-input').focus();
                        document.getElementById('chat-input').placeholder = `Whisper to ${friend.username}...`;
                    } else if (action === 'invite') {
                        this.inviteToParty(friendId);
                    }
                });
            });
            
            this.friendsList.appendChild(friendEl);
        });
    }
    
    renderParty() {
        const partyContent = document.getElementById('party-content');
        
        if (!this.party) {
            partyContent.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="margin-bottom: 15px;">You are not in a party</p>
                    <button class="matchmaking-button" id="create-party-btn">Create Party</button>
                </div>
            `;
            document.getElementById('create-party-btn').addEventListener('click', () => this.createParty());
            return;
        }
        
        partyContent.innerHTML = `
            <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-bottom: 15px;">
                <h3 style="margin-bottom: 10px;">Party (${this.party.members.length}/5)</h3>
                <button class="matchmaking-button" id="leave-party-btn" style="width: 100%; padding: 10px;">Leave Party</button>
            </div>
        `;
        
        this.party.members.forEach(member => {
            const memberEl = document.createElement('div');
            memberEl.className = 'party-member';
            memberEl.innerHTML = `
                <div class="party-member-avatar">${member.username[0].toUpperCase()}</div>
                <div class="party-member-info">
                    <div class="party-member-name">${member.username} ${member.isLeader ? '👑' : ''}</div>
                    <div class="party-member-level">Level ${member.level}</div>
                    <div class="health-bar">
                        <div class="health-bar-fill" style="width: ${(member.health / 100) * 100}%"></div>
                    </div>
                </div>
            `;
            partyContent.appendChild(memberEl);
        });
        
        document.getElementById('leave-party-btn').addEventListener('click', () => this.leaveParty());
    }
    
    renderGuild() {
        const guildContent = document.getElementById('guild-content');
        
        if (!this.guild) {
            guildContent.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="margin-bottom: 15px;">You are not in a guild</p>
                    <input type="text" id="guild-name-input" placeholder="Guild name..." 
                           style="width: 100%; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.1); border: 1px solid #667eea; color: #fff; margin-bottom: 10px;">
                    <button class="matchmaking-button" id="create-guild-btn">Create Guild</button>
                </div>
            `;
            document.getElementById('create-guild-btn').addEventListener('click', () => {
                const guildName = document.getElementById('guild-name-input').value.trim();
                if (guildName) this.createGuild(guildName);
            });
            return;
        }
        
        guildContent.innerHTML = `
            <div class="guild-header">
                <div class="guild-name">${this.guild.name}</div>
                <div class="guild-level">Level ${this.guild.level} • ${this.guild.members.length} members</div>
            </div>
        `;
        
        this.guild.members.forEach(member => {
            const memberEl = document.createElement('div');
            memberEl.className = 'friend-item';
            memberEl.innerHTML = `
                <div class="friend-status ${member.online ? 'online' : 'offline'}"></div>
                <div class="friend-name">
                    <div>${member.username} ${member.rank}</div>
                    <div style="font-size: 12px; opacity: 0.7;">Level ${member.level}</div>
                </div>
            `;
            guildContent.appendChild(memberEl);
        });
    }
    
    renderTradeWindow() {
        if (!this.activeTrade) return;
        
        const tradeWindow = document.getElementById('trade-window');
        tradeWindow.style.display = 'block';
        
        document.getElementById('trade-player2-name').textContent = this.activeTrade.otherPlayerName;
        // Render items and gold
    }
    
    closeTrade() {
        document.getElementById('trade-window').style.display = 'none';
        this.activeTrade = null;
    }
    
    showContextMenu(x, y, playerId) {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        contextMenu.querySelectorAll('.context-item').forEach(item => {
            item.onclick = () => {
                const action = item.dataset.action;
                const player = this.nearbyPlayers.get(playerId);
                
                switch(action) {
                    case 'invite-party':
                        this.inviteToParty(playerId);
                        break;
                    case 'add-friend':
                        this.sendFriendRequest(player.username);
                        break;
                    case 'trade':
                        this.requestTrade(playerId);
                        break;
                    case 'whisper':
                        document.getElementById('chat-channel-select').value = 'whisper';
                        document.getElementById('chat-input').focus();
                        break;
                    case 'challenge':
                        this.showNotification('Challenge system coming soon!', 'info');
                        break;
                }
                
                contextMenu.style.display = 'none';
            };
        });
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                contextMenu.style.display = 'none';
            }, { once: true });
        }, 0);
    }
    
    showNotification(message, type = 'info', actions = null) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<div>${message}</div>`;
        
        if (actions) {
            const actionsDiv = document.createElement('div');
            actionsDiv.style.marginTop = '10px';
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '10px';
            
            actions.forEach(action => {
                const btn = document.createElement('button');
                btn.textContent = action.text;
                btn.style.padding = '5px 15px';
                btn.style.borderRadius = '5px';
                btn.style.border = 'none';
                btn.style.background = '#667eea';
                btn.style.color = '#fff';
                btn.style.cursor = 'pointer';
                btn.onclick = () => {
                    action.action();
                    notification.remove();
                };
                actionsDiv.appendChild(btn);
            });
            
            notification.appendChild(actionsDiv);
        }
        
        document.getElementById('notifications').appendChild(notification);
        
        if (!actions) {
            setTimeout(() => notification.remove(), 4000);
        }
        
        return notification;
    }
    
    updateConnectionStatus(status) {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    setupEventListeners() {
        // Login
        document.getElementById('connect-btn').addEventListener('click', () => {
            const username = document.getElementById('username-input').value.trim();
            if (username) {
                this.connect(username);
            }
        });
        
        document.getElementById('username-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('connect-btn').click();
            }
        });
        
        // Chat
        document.getElementById('chat-send').addEventListener('click', () => {
            const message = this.chatInput.value.trim();
            const channel = document.getElementById('chat-channel-select').value;
            if (message) {
                this.sendChat(message, channel);
                this.chatInput.value = '';
            }
        });
        
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('chat-send').click();
            }
        });
        
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
        
        // Friend search
        document.getElementById('friend-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const username = e.target.value.trim();
                if (username) {
                    this.sendFriendRequest(username);
                    e.target.value = '';
                }
            }
        });
        
        // Matchmaking
        document.getElementById('queue-1v1').addEventListener('click', () => this.joinMatchmaking('1v1'));
        document.getElementById('queue-3v3').addEventListener('click', () => this.joinMatchmaking('3v3'));
        document.getElementById('queue-5v5').addEventListener('click', () => this.joinMatchmaking('5v5'));
        document.getElementById('queue-tournament').addEventListener('click', () => this.joinMatchmaking('tournament'));
        
        // Trade
        document.getElementById('trade-accept-btn').addEventListener('click', () => this.confirmTrade());
        document.getElementById('trade-decline-btn').addEventListener('click', () => this.closeTrade());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName === 'INPUT') return;
            
            // Movement keys (WASD)
            const speed = 5;
            if (this.player) {
                let moved = false;
                
                if (e.key === 'w' || e.key === 'W') {
                    this.player.position.z -= speed;
                    moved = true;
                }
                if (e.key === 's' || e.key === 'S') {
                    this.player.position.z += speed;
                    moved = true;
                }
                if (e.key === 'a' || e.key === 'A') {
                    this.player.position.x -= speed;
                    moved = true;
                }
                if (e.key === 'd' || e.key === 'D') {
                    this.player.position.x += speed;
                    moved = true;
                }
                
                if (moved) {
                    this.sendMove(
                        this.player.position,
                        this.player.rotation || { x: 0, y: 0, z: 0 },
                        { x: 0, y: 0, z: 0 },
                        true
                    );
                    this.updateHUD();
                }
            }
        });
    }
    
    // ===== SIMULATION =====
    
    startMovementSimulation() {
        // Simulate random movement for demo
        setInterval(() => {
            if (!this.player) return;
            
            // Random walk
            const dx = (Math.random() - 0.5) * 2;
            const dz = (Math.random() - 0.5) * 2;
            
            this.player.position.x += dx;
            this.player.position.z += dz;
            
            // Send update every 100ms
            if (Math.random() < 0.3) { // 30% chance
                this.sendMove(
                    this.player.position,
                    this.player.rotation || { x: 0, y: 0, z: 0 },
                    { x: dx * 10, y: 0, z: dz * 10 },
                    true
                );
            }
            
            this.updateHUD();
        }, 100);
    }
    
    startRenderLoop() {
        const render = () => {
            // 3D rendering would go here
            // For now, just update minimap
            this.renderMinimap();
            
            requestAnimationFrame(render);
        };
        render();
    }
    
    renderMinimap() {
        const canvas = document.getElementById('minimap');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!this.player) return;
        
        // Draw nearby players
        this.nearbyPlayers.forEach((player, playerId) => {
            const dx = player.position.x - this.player.position.x;
            const dz = player.position.z - this.player.position.z;
            
            const x = 100 + dx / 10;
            const y = 100 + dz / 10;
            
            if (playerId === this.playerId) {
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#FF5722';
                ctx.fillRect(x - 3, y - 3, 6, 6);
            }
        });
    }
    
    // ===== UTILITIES =====
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize client
const client = new MultiplayerClient();
