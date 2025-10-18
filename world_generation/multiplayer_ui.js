/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    MULTIPLAYER UI v1.0.0                              ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Beautiful interface for multiplayer features                         ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class MultiplayerUI {
  constructor(multiplayerClient) {
    this.client = multiplayerClient;
    this.isOpen = false;
    
    // UI Elements
    this.modal = null;
    this.chatPanel = null;
    this.playerListPanel = null;
    this.lobbyPanel = null;
    
    // 🔒 SECURITY: Create rate limiter for chat (5 messages per second)
    this.chatRateLimiter = SecurityUtils.createRateLimiter(5, 1000);
    
    this.createUI();
    this.setupEventListeners();
    this.setupClientCallbacks();
  }
  
  createUI() {
    // ═══════════════════════════════════════════════════════════════════
    // MAIN MULTIPLAYER MODAL
    // ═══════════════════════════════════════════════════════════════════
    
    this.modal = document.createElement('div');
    this.modal.id = 'multiplayer-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      height: 600px;
      background: linear-gradient(135deg, #0a1628 0%, #1a2332 100%);
      border: 3px solid #4a9eff;
      border-radius: 20px;
      padding: 25px;
      z-index: 2000;
      font-family: 'Courier New', monospace;
      box-shadow: 0 0 50px rgba(74,158,255,0.6);
      display: none;
    `;
    
    this.modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🌐</div>
        <h1 style="
          color: #4a9eff;
          font-size: 28px;
          margin: 10px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        ">Multiplayer</h1>
        <div id="connection-status" style="
          color: #888;
          font-size: 14px;
          margin-top: 5px;
        ">
          <span id="status-indicator" style="
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #888;
            margin-right: 5px;
          "></span>
          <span id="status-text">Disconnected</span>
          <span id="latency-display" style="margin-left: 10px;"></span>
        </div>
      </div>
      
      <!-- Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #2a3a4a;">
        <button class="mp-tab active" data-tab="connect" style="
          flex: 1;
          padding: 12px;
          background: rgba(74,158,255,0.3);
          border: none;
          border-bottom: 3px solid #4a9eff;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        ">🔌 Connect</button>
        
        <button class="mp-tab" data-tab="lobby" style="
          flex: 1;
          padding: 12px;
          background: rgba(74,158,255,0.1);
          border: none;
          border-bottom: 3px solid transparent;
          color: #888;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        ">🏠 Lobby</button>
        
        <button class="mp-tab" data-tab="players" style="
          flex: 1;
          padding: 12px;
          background: rgba(74,158,255,0.1);
          border: none;
          border-bottom: 3px solid transparent;
          color: #888;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        ">👥 Players</button>
        
        <button class="mp-tab" data-tab="chat" style="
          flex: 1;
          padding: 12px;
          background: rgba(74,158,255,0.1);
          border: none;
          border-bottom: 3px solid transparent;
          color: #888;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        ">💬 Chat</button>
      </div>
      
      <!-- Tab Content -->
      <div id="tab-content" style="height: 400px; overflow-y: auto;">
        <!-- Connect Tab -->
        <div id="connect-tab" class="tab-panel">
          <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
            <label style="color: white; font-weight: bold; display: block; margin-bottom: 10px;">
              Server Address:
            </label>
            <input 
              type="text" 
              id="server-url" 
              value="ws://localhost:8765"
              placeholder="ws://localhost:8765"
              style="
                width: 100%;
                padding: 12px;
                background: rgba(0,0,0,0.5);
                border: 2px solid #4a9eff;
                border-radius: 8px;
                color: white;
                font-family: monospace;
                font-size: 14px;
                margin-bottom: 15px;
              "
            />
            
            <label style="color: white; font-weight: bold; display: block; margin-bottom: 10px;">
              Player Name:
            </label>
            <input 
              type="text" 
              id="player-name" 
              placeholder="Enter your name..."
              style="
                width: 100%;
                padding: 12px;
                background: rgba(0,0,0,0.5);
                border: 2px solid #4a9eff;
                border-radius: 8px;
                color: white;
                font-family: monospace;
                font-size: 14px;
              "
            />
          </div>
          
          <button id="connect-btn" style="
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #4a9eff, #00bfff);
            border: 3px solid #4a9eff;
            border-radius: 10px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          ">🚀 Connect to Server</button>
          
          <button id="disconnect-btn" style="
            width: 100%;
            padding: 15px;
            background: rgba(255,0,0,0.3);
            border: 3px solid #ff0000;
            border-radius: 10px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
            display: none;
          ">🔌 Disconnect</button>
          
          <div style="margin-top: 20px; padding: 15px; background: rgba(255,165,0,0.2); border-radius: 8px; border: 2px solid #ffa500;">
            <div style="color: #ffa500; font-weight: bold; margin-bottom: 8px;">ℹ️ Note:</div>
            <div style="color: #ddd; font-size: 13px; line-height: 1.6;">
              You need a WebSocket server running to use multiplayer features.
              <br/>
              Default: ws://localhost:8765
              <br/><br/>
              <a href="https://github.com" target="_blank" style="color: #4a9eff; text-decoration: none;">
                📘 Server Setup Guide →
              </a>
            </div>
          </div>
        </div>
        
        <!-- Lobby Tab -->
        <div id="lobby-tab" class="tab-panel" style="display: none;">
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <h3 style="color: #4a9eff; margin-top: 0;">Create Room</h3>
            <input 
              type="text" 
              id="room-name" 
              placeholder="Room Name..."
              style="
                width: 100%;
                padding: 10px;
                background: rgba(0,0,0,0.5);
                border: 2px solid #4a9eff;
                border-radius: 6px;
                color: white;
                font-family: monospace;
                margin-bottom: 10px;
              "
            />
            <button id="create-room-btn" style="
              width: 100%;
              padding: 12px;
              background: #4a9eff;
              border: 2px solid #4a9eff;
              border-radius: 6px;
              color: white;
              font-weight: bold;
              cursor: pointer;
            ">+ Create Room</button>
          </div>
          
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="color: #4a9eff; margin: 0;">Available Rooms</h3>
              <button id="refresh-rooms-btn" style="
                padding: 6px 12px;
                background: rgba(74,158,255,0.3);
                border: 2px solid #4a9eff;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 12px;
              ">🔄 Refresh</button>
            </div>
            <div id="room-list" style="
              max-height: 200px;
              overflow-y: auto;
              color: white;
            ">
              <div style="text-align: center; color: #888; padding: 20px;">
                No rooms available
              </div>
            </div>
          </div>
        </div>
        
        <!-- Players Tab -->
        <div id="players-tab" class="tab-panel" style="display: none;">
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
            <h3 style="color: #4a9eff; margin-top: 0;">
              Online Players (<span id="player-count">0</span>)
            </h3>
            <div id="player-list" style="
              max-height: 350px;
              overflow-y: auto;
            ">
              <!-- Dynamic player list -->
            </div>
          </div>
        </div>
        
        <!-- Chat Tab -->
        <div id="chat-tab" class="tab-panel" style="display: none;">
          <div id="chat-messages" style="
            height: 320px;
            overflow-y: auto;
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            color: white;
            font-size: 13px;
            line-height: 1.8;
          ">
            <div style="color: #888; text-align: center; padding: 20px;">
              No messages yet
            </div>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <input 
              type="text" 
              id="chat-input" 
              placeholder="Type a message..."
              style="
                flex: 1;
                padding: 12px;
                background: rgba(0,0,0,0.5);
                border: 2px solid #4a9eff;
                border-radius: 8px;
                color: white;
                font-family: monospace;
              "
            />
            <button id="send-chat-btn" style="
              padding: 12px 20px;
              background: #4a9eff;
              border: 2px solid #4a9eff;
              border-radius: 8px;
              color: white;
              font-weight: bold;
              cursor: pointer;
            ">Send</button>
          </div>
        </div>
      </div>
      
      <!-- Close Button -->
      <button id="close-mp-btn" style="
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 8px 12px;
        background: rgba(255,0,0,0.3);
        border: 2px solid #ff0000;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-size: 16px;
      ">✕</button>
      
      <style>
        .tab-panel {
          animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .mp-tab:hover {
          background: rgba(74,158,255,0.4) !important;
        }
        
        .mp-tab.active {
          background: rgba(74,158,255,0.3) !important;
          border-bottom-color: #4a9eff !important;
          color: white !important;
        }
        
        #multiplayer-modal button:hover {
          transform: scale(1.02);
        }
        
        #tab-content::-webkit-scrollbar {
          width: 8px;
        }
        
        #tab-content::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
        }
        
        #tab-content::-webkit-scrollbar-thumb {
          background: #4a9eff;
          border-radius: 10px;
        }
      </style>
    `;
    
    document.body.appendChild(this.modal);
    
    console.log('🎨 Multiplayer UI created');
  }
  
  setupEventListeners() {
    // Close button
    document.getElementById('close-mp-btn').onclick = () => this.close();
    
    // Tab switching
    document.querySelectorAll('.mp-tab').forEach(tab => {
      tab.onclick = () => this.switchTab(tab.dataset.tab);
    });
    
    // Connect button
    document.getElementById('connect-btn').onclick = () => this.handleConnect();
    
    // Disconnect button
    document.getElementById('disconnect-btn').onclick = () => this.handleDisconnect();
    
    // Create room
    document.getElementById('create-room-btn').onclick = () => this.handleCreateRoom();
    
    // Refresh rooms
    document.getElementById('refresh-rooms-btn').onclick = () => this.handleRefreshRooms();
    
    // Send chat
    document.getElementById('send-chat-btn').onclick = () => this.handleSendChat();
    
    // Chat input enter key
    document.getElementById('chat-input').onkeydown = (e) => {
      if (e.key === 'Enter') this.handleSendChat();
    };
  }
  
  setupClientCallbacks() {
    if (!this.client) return;
    
    this.client.onConnect = () => this.updateConnectionStatus(true);
    this.client.onDisconnect = () => this.updateConnectionStatus(false);
    
    this.client.onPlayerJoin = (data) => {
      this.addChatMessage('System', `${data.playerName} joined`, '#4a9eff');
      this.updatePlayerList();
    };
    
    this.client.onPlayerLeave = (data) => {
      this.addChatMessage('System', `${data.playerName} left`, '#4a9eff');
      this.updatePlayerList();
    };
    
    this.client.onChatMessage = (data) => {
      this.addChatMessage(data.playerName, data.message);
    };
    
    this.client.onRoomList = (data) => {
      this.updateRoomList(data.rooms);
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // TAB MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.mp-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.style.background = 'rgba(74,158,255,0.1)';
      tab.style.borderBottomColor = 'transparent';
      tab.style.color = '#888';
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    
    // Activate selected tab button
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    activeTab.classList.add('active');
    activeTab.style.background = 'rgba(74,158,255,0.3)';
    activeTab.style.borderBottomColor = '#4a9eff';
    activeTab.style.color = 'white';
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CONNECTION HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  handleConnect() {
    const serverUrl = document.getElementById('server-url').value;
    const playerName = document.getElementById('player-name').value.trim();
    
    if (!playerName) {
      alert('⚠️ Please enter a player name');
      return;
    }
    
    if (!this.client) {
      alert('❌ Multiplayer client not initialized');
      return;
    }
    
    this.client.connect(serverUrl, playerName);
  }
  
  handleDisconnect() {
    if (this.client) {
      this.client.disconnect();
    }
  }
  
  updateConnectionStatus(connected) {
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    
    if (connected) {
      indicator.style.background = '#00ff00';
      statusText.textContent = 'Connected';
      connectBtn.style.display = 'none';
      disconnectBtn.style.display = 'block';
    } else {
      indicator.style.background = '#888';
      statusText.textContent = 'Disconnected';
      connectBtn.style.display = 'block';
      disconnectBtn.style.display = 'none';
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // ROOM MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  handleCreateRoom() {
    const roomName = document.getElementById('room-name').value.trim();
    
    if (!roomName) {
      alert('⚠️ Please enter a room name');
      return;
    }
    
    if (this.client) {
      this.client.createRoom(roomName);
      document.getElementById('room-name').value = '';
    }
  }
  
  handleRefreshRooms() {
    if (this.client) {
      this.client.requestRoomList();
    }
  }
  
  updateRoomList(rooms) {
    const roomList = document.getElementById('room-list');
    
    if (!rooms || rooms.length === 0) {
      roomList.innerHTML = `
        <div style="text-align: center; color: #888; padding: 20px;">
          No rooms available
        </div>
      `;
      return;
    }
    
    roomList.innerHTML = rooms.map(room => `
      <div style="
        background: rgba(74,158,255,0.2);
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <div style="color: white; font-weight: bold;">${room.name}</div>
          <div style="color: #888; font-size: 12px;">
            ${room.players}/${room.maxPlayers} players
          </div>
        </div>
        <button 
          onclick="multiplayerUI.client.joinRoom('${room.id}')"
          style="
            padding: 6px 12px;
            background: #4a9eff;
            border: 2px solid #4a9eff;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-weight: bold;
          "
        >Join</button>
      </div>
    `).join('');
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PLAYER LIST
  // ═══════════════════════════════════════════════════════════════════════
  
  updatePlayerList() {
    const playerList = document.getElementById('player-list');
    const playerCount = document.getElementById('player-count');
    
    if (!this.client) return;
    
    const players = this.client.getRemotePlayers();
    playerCount.textContent = players.length + 1; // +1 for self
    
    // 🔒 SECURITY: Clear list safely
    playerList.innerHTML = '';
    
    // Add self (current player)
    const selfCard = document.createElement('div');
    selfCard.style.cssText = `
      background: rgba(74,158,255,0.3);
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      border: 2px solid #4a9eff;
    `;
    
    const selfContent = document.createElement('div');
    selfContent.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    
    const selfAvatar = document.createElement('div');
    selfAvatar.style.cssText = `
      width: 40px;
      height: 40px;
      background: #4a9eff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    `;
    selfAvatar.textContent = '👤';
    
    const selfInfo = document.createElement('div');
    selfInfo.style.flex = '1';
    
    const selfName = document.createElement('div');
    selfName.style.cssText = 'color: white; font-weight: bold;';
    // 🔒 SECURITY: Use textContent instead of innerHTML
    selfName.textContent = `${SecurityUtils.sanitizeUsername(this.client.playerName)} (You)`;
    
    const selfStatus = document.createElement('div');
    selfStatus.style.cssText = 'color: #888; font-size: 12px;';
    selfStatus.textContent = 'Online';
    
    selfInfo.appendChild(selfName);
    selfInfo.appendChild(selfStatus);
    selfContent.appendChild(selfAvatar);
    selfContent.appendChild(selfInfo);
    selfCard.appendChild(selfContent);
    playerList.appendChild(selfCard);
    
    // 🔒 SECURITY: Add remote players using safe methods
    players.forEach(player => {
      const healthPercent = (player.health / player.maxHealth) * 100;
      
      const playerCard = document.createElement('div');
      playerCard.style.cssText = `
        background: rgba(0,0,0,0.3);
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 8px;
      `;
      
      const playerContent = document.createElement('div');
      playerContent.style.cssText = 'display: flex; align-items: center; gap: 10px;';
      
      const avatar = document.createElement('div');
      avatar.style.cssText = `
        width: 40px;
        height: 40px;
        background: ${this.getPlayerColorHex(player.mesh.material.color.getHex())};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      `;
      avatar.textContent = '👤';
      
      const playerInfo = document.createElement('div');
      playerInfo.style.flex = '1';
      
      const playerName = document.createElement('div');
      playerName.style.cssText = 'color: white; font-weight: bold;';
      // 🔒 SECURITY: Sanitize and use textContent
      playerName.textContent = SecurityUtils.sanitizeUsername(player.playerName);
      
      const healthBarContainer = document.createElement('div');
      healthBarContainer.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(0,0,0,0.5);
        border-radius: 2px;
        margin-top: 5px;
        overflow: hidden;
      `;
      
      const healthBar = document.createElement('div');
      healthBar.style.cssText = `
        width: ${healthPercent}%;
        height: 100%;
        background: linear-gradient(90deg, #ff0000, #00ff00);
        transition: width 0.3s;
      `;
      
      healthBarContainer.appendChild(healthBar);
      playerInfo.appendChild(playerName);
      playerInfo.appendChild(healthBarContainer);
      playerContent.appendChild(avatar);
      playerContent.appendChild(playerInfo);
      playerCard.appendChild(playerContent);
      playerList.appendChild(playerCard);
    });
  }
  
  getPlayerColorHex(color) {
    return '#' + color.toString(16).padStart(6, '0');
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CHAT
  // ═══════════════════════════════════════════════════════════════════════
  
  handleSendChat() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // 🔒 SECURITY: Rate limit chat messages (prevent spam)
    if (!this.chatRateLimiter.isAllowed()) {
      alert('⚠️ Slow down! You are sending messages too quickly.');
      return;
    }
    
    // 🔒 SECURITY: Sanitize message before sending
    const sanitizedMessage = SecurityUtils.sanitizeChatMessage(message);
    
    if (!sanitizedMessage) {
      alert('⚠️ Invalid message. Please avoid special characters.');
      return;
    }
    
    if (this.client && this.client.isConnected) {
      this.client.sendChatMessage(sanitizedMessage);
      chatInput.value = '';
    } else {
      alert('⚠️ Not connected to server');
    }
  }
  
  addChatMessage(playerName, message, color = '#ffffff') {
    const chatMessages = document.getElementById('chat-messages');
    
    // Remove "no messages" placeholder
    if (chatMessages.querySelector('[style*="text-align: center"]')) {
      chatMessages.innerHTML = '';
    }
    
    const timestamp = new Date().toLocaleTimeString();
    
    // 🔒 SECURITY: Use SecurityUtils to create safe chat message (prevents XSS)
    const messageEl = SecurityUtils.createSafeChatMessage(playerName, message, color, timestamp);
    
    if (messageEl) {
      chatMessages.appendChild(messageEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // MODAL CONTROL
  // ═══════════════════════════════════════════════════════════════════════
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.modal.style.display = 'block';
    this.isOpen = true;
    
    // Update player list if connected
    if (this.client && this.client.isConnected) {
      this.updatePlayerList();
    }
  }
  
  close() {
    this.modal.style.display = 'none';
    this.isOpen = false;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UPDATE LOOP
  // ═══════════════════════════════════════════════════════════════════════
  
  update() {
    if (!this.client || !this.client.isConnected) return;
    
    // Update latency display
    const latencyDisplay = document.getElementById('latency-display');
    if (latencyDisplay) {
      latencyDisplay.textContent = `${this.client.getLatency()}ms`;
    }
    
    // Update player list periodically
    if (this.isOpen && performance.now() % 1000 < 16) {
      this.updatePlayerList();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MultiplayerUI };
}
