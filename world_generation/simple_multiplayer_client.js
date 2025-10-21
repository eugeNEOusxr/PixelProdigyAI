/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║            SIMPLE MULTIPLAYER CLIENT v1.0.0                           ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Lightweight WebSocket client for multiplayer                         ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class SimpleMultiplayerClient {
  constructor(scene, localPlayer) {
    this.scene = scene;
    this.localPlayer = localPlayer;
    
    this.ws = null;
    this.isConnected = false;
    this.playerId = null;
    this.playerName = 'Player_' + Math.floor(Math.random() * 1000);
    this.roomId = null;
    
    this.remotePlayers = new Map();
    this.latency = 0;
    this.lastPingTime = 0;
    
    this.onConnect = null;
    this.onDisconnect = null;
    this.onPlayerJoin = null;
    this.onPlayerLeave = null;
    this.onChatMessage = null;
    this.onRoomList = null;
    
    console.log('🌐 Simple Multiplayer Client initialized');
  }
  
  connect(serverUrl, playerName) {
    if (this.isConnected) {
      console.log('⚠️ Already connected');
      return;
    }
    
    this.playerName = playerName || this.playerName;
    
    console.log(`🔌 Connecting to ${serverUrl}...`);
    
    this.ws = new WebSocket(serverUrl);
    
    this.ws.onopen = () => {
      console.log('✅ Connected!');
      this.isConnected = true;
      
      this.send('connect', {
        playerName: this.playerName,
        version: '1.0.0'
      });
      
      if (this.onConnect) this.onConnect();
      this.startPing();
    };
    
    this.ws.onclose = () => {
      console.log('🔌 Disconnected');
      this.isConnected = false;
      this.clearRemotePlayers();
      if (this.onDisconnect) this.onDisconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('❌ Error:', error);
    };
    
    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      this.handleMessage(type, data);
    };
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.isConnected = false;
    this.playerId = null;
    this.clearRemotePlayers();
  }
  
  handleMessage(type, data) {
    switch (type) {
      case 'connect':
        this.playerId = data.playerId;
        console.log(`✅ Player ID: ${this.playerId}`);
        break;
        
      case 'player_join':
        if (data.playerId !== this.playerId) {
          this.createRemotePlayer(data);
          if (this.onPlayerJoin) this.onPlayerJoin(data);
        }
        break;
        
      case 'player_leave':
        this.removeRemotePlayer(data.playerId);
        if (this.onPlayerLeave) this.onPlayerLeave(data);
        break;
        
      case 'player_update':
        if (data.playerId !== this.playerId) {
          this.updateRemotePlayer(data);
        }
        break;
        
      case 'chat_message':
        if (this.onChatMessage) this.onChatMessage(data);
        break;
        
      case 'room_list':
        if (this.onRoomList) this.onRoomList(data);
        break;
        
      case 'pong':
        this.latency = performance.now() - this.lastPingTime;
        break;
    }
  }
  
  send(type, data = {}) {
    if (!this.isConnected || !this.ws) return;
    this.ws.send(JSON.stringify({ type, data }));
  }
  
  sendPlayerUpdate() {
    if (!this.localPlayer) return;
    
    const pos = this.localPlayer.position;
    const rot = this.localPlayer.rotation;
    
    this.send('player_update', {
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z },
      animation: 'idle',
      health: 100
    });
  }
  
  sendChatMessage(message) {
    this.send('chat_message', { message, timestamp: Date.now() });
  }
  
  createRoom(roomName, maxPlayers = 8) {
    this.send('create_room', { roomName, maxPlayers });
  }
  
  joinRoom(roomId) {
    this.send('join_room', { roomId });
  }
  
  leaveRoom() {
    this.send('leave_room', {});
  }
  
  requestRoomList() {
    this.send('room_list', {});
  }
  
  createRemotePlayer(data) {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const material = new THREE.MeshPhongMaterial({ 
      color: this.getPlayerColor(data.playerId)
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.rotation.y = data.rotation.y;
    mesh.castShadow = true;
    
    // Name tag
    const nameTag = this.createNameTag(data.playerName);
    nameTag.position.y = 1.5;
    mesh.add(nameTag);
    
    this.scene.add(mesh);
    
    this.remotePlayers.set(data.playerId, {
      mesh,
      playerName: data.playerName,
      targetPosition: mesh.position.clone(),
      targetRotation: data.rotation.y,
      health: 100,
      maxHealth: 100
    });
  }
  
  updateRemotePlayer(data) {
    const player = this.remotePlayers.get(data.playerId);
    if (!player) return;
    
    player.targetPosition = new THREE.Vector3(
      data.position.x,
      data.position.y,
      data.position.z
    );
    player.targetRotation = data.rotation.y;
    player.health = data.health || 100;
  }
  
  removeRemotePlayer(playerId) {
    const player = this.remotePlayers.get(playerId);
    if (!player) return;
    
    this.scene.remove(player.mesh);
    if (player.mesh.geometry) player.mesh.geometry.dispose();
    if (player.mesh.material) player.mesh.material.dispose();
    
    this.remotePlayers.delete(playerId);
  }
  
  clearRemotePlayers() {
    this.remotePlayers.forEach((_, playerId) => {
      this.removeRemotePlayer(playerId);
    });
  }
  
  createNameTag(playerName) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.fillText(playerName, canvas.width / 2, canvas.height / 2 + 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 0.5, 1);
    
    return sprite;
  }
  
  getPlayerColor(playerId) {
    const colors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00,
      0xff00ff, 0x00ffff, 0xff8800, 0x8800ff
    ];
    const hash = playerId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }
  
  update(deltaTime) {
    if (!this.isConnected) return;
    
    // Send updates
    if (performance.now() % 50 < 16) {
      this.sendPlayerUpdate();
    }
    
    // Interpolate remote players
    this.remotePlayers.forEach((player) => {
      if (!player.mesh || !player.targetPosition) return;
      
      player.mesh.position.lerp(player.targetPosition, 0.15);
      
      const currentRot = player.mesh.rotation.y;
      player.mesh.rotation.y = THREE.MathUtils.lerp(
        currentRot,
        player.targetRotation,
        0.15
      );
    });
  }
  
  startPing() {
    setInterval(() => {
      if (!this.isConnected) return;
      this.lastPingTime = performance.now();
      this.send('ping', {});
    }, 2000);
  }
  
  getRemotePlayers() {
    return Array.from(this.remotePlayers.values());
  }
  
  getLatency() {
    return Math.round(this.latency);
  }
  
  setPlayerName(name) {
    this.playerName = name;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimpleMultiplayerClient };
}
