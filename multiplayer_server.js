#!/usr/bin/env node

/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║              PIXELPRODIGY MULTIPLAYER SERVER v1.0.0                   ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ WebSocket server for multiplayer gameplay                            ║
 * ║                                                                       ║
 * ║ Usage:                                                               ║
 * ║   node multiplayer_server.js                                         ║
 * ║   or                                                                 ║
 * ║   ./multiplayer_server.js                                            ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

const WebSocket = require('ws');

// ═══════════════════════════════════════════════════════════════════════
// SECURITY UTILITIES - Server-side validation
// ═══════════════════════════════════════════════════════════════════════

/**
 * Sanitizes username - removes HTML and limits length
 */
function sanitizeUsername(username) {
  if (typeof username !== 'string') return 'Guest';
  
  // Remove HTML tags
  username = username.replace(/<[^>]*>/g, '');
  
  // Remove special characters except spaces, letters, numbers, and basic punctuation
  username = username.replace(/[^\w\s\-_.]/g, '');
  
  // Trim whitespace
  username = username.trim();
  
  // Limit length (3-20 characters)
  if (username.length < 3) return 'Guest' + Math.floor(Math.random() * 1000);
  if (username.length > 20) username = username.substring(0, 20);
  
  return username;
}

/**
 * Sanitizes chat message - prevents XSS and injection
 */
function sanitizeChatMessage(message) {
  if (typeof message !== 'string') return null;
  
  // Remove HTML tags
  message = message.replace(/<[^>]*>/g, '');
  
  // Remove script tags even if obfuscated
  message = message.replace(/javascript:/gi, '');
  message = message.replace(/on\w+\s*=/gi, ''); // Remove event handlers
  
  // Trim whitespace
  message = message.trim();
  
  // Check length (1-500 characters)
  if (message.length < 1) return null;
  if (message.length > 500) message = message.substring(0, 500);
  
  return message;
}

/**
 * Sanitizes room name
 */
function sanitizeRoomName(roomName) {
  if (typeof roomName !== 'string') return 'Room';
  
  // Remove HTML tags
  roomName = roomName.replace(/<[^>]*>/g, '');
  
  // Remove special characters except spaces, letters, numbers
  roomName = roomName.replace(/[^\w\s\-#]/g, '');
  
  // Trim and limit length
  roomName = roomName.trim().substring(0, 50);
  
  return roomName || 'Room';
}

/**
 * Validates numeric input
 */
function sanitizeNumber(value, min = 0, max = 100, defaultValue = 0) {
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

// ═══════════════════════════════════════════════════════════════════════
// SERVER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

// Server configuration
const PORT = 8765;
const MAX_PLAYERS_PER_ROOM = 8;

// Data structures
const clients = new Map(); // ws -> playerData
const rooms = new Map(); // roomId -> roomData
const playersByRoom = new Map(); // roomId -> Set<playerId>

// Message types
const MSG = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  PLAYER_JOIN: 'player_join',
  PLAYER_LEAVE: 'player_leave',
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_LIST: 'room_list',
  PLAYER_UPDATE: 'player_update',
  PLAYER_ACTION: 'player_action',
  PLAYER_ATTACK: 'player_attack',
  PLAYER_DAMAGE: 'player_damage',
  CHAT_MESSAGE: 'chat_message',
  PING: 'ping',
  PONG: 'pong'
};

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║       PixelProdigy Multiplayer Server v1.0.0                 ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log(`🌐 Server started on ws://localhost:${PORT}`);
console.log(`📊 Max players per room: ${MAX_PLAYERS_PER_ROOM}`);
console.log('⏳ Waiting for connections...\n');

wss.on('connection', (ws) => {
  const playerId = generateId();
  
  console.log(`🔌 New connection: ${playerId}`);
  
  // Initialize player data
  clients.set(ws, {
    id: playerId,
    name: null,
    roomId: null,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    health: 100
  });
  
  // Handle messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(ws, message);
    } catch (error) {
      console.error('❌ Message parse error:', error);
    }
  });
  
  // Handle disconnect
  ws.on('close', () => {
    handleDisconnect(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// MESSAGE HANDLERS
// ═══════════════════════════════════════════════════════════════════════

function handleMessage(ws, message) {
  const { type, data } = message;
  const player = clients.get(ws);
  
  if (!player) return;
  
  switch (type) {
    case MSG.CONNECT:
      handleConnect(ws, data);
      break;
    case MSG.CREATE_ROOM:
      handleCreateRoom(ws, data);
      break;
    case MSG.JOIN_ROOM:
      handleJoinRoom(ws, data);
      break;
    case MSG.LEAVE_ROOM:
      handleLeaveRoom(ws);
      break;
    case MSG.ROOM_LIST:
      handleRoomList(ws);
      break;
    case MSG.PLAYER_UPDATE:
      handlePlayerUpdate(ws, data);
      break;
    case MSG.CHAT_MESSAGE:
      handleChatMessage(ws, data);
      break;
    case MSG.PING:
      send(ws, MSG.PONG, {});
      break;
    default:
      console.log(`⚠️ Unknown message type: ${type}`);
  }
}

function handleConnect(ws, data) {
  const player = clients.get(ws);
  // 🔒 SECURITY: Sanitize player username
  player.name = sanitizeUsername(data.playerName) || `Player_${player.id.slice(0, 4)}`;
  
  console.log(`👤 Player connected: ${player.name} (${player.id})`);
  
  // Send connection confirmation
  send(ws, MSG.CONNECT, {
    playerId: player.id,
    playerName: player.name
  });
}

function handleCreateRoom(ws, data) {
  const player = clients.get(ws);
  const roomId = generateId();
  // 🔒 SECURITY: Sanitize room name
  const roomName = sanitizeRoomName(data.roomName) || `Room ${roomId.slice(0, 4)}`;
  
  rooms.set(roomId, {
    id: roomId,
    name: roomName,
    hostId: player.id,
    maxPlayers: sanitizeNumber(data.maxPlayers, 2, MAX_PLAYERS_PER_ROOM, MAX_PLAYERS_PER_ROOM),
    players: 0,
    createdAt: Date.now()
  });
  
  playersByRoom.set(roomId, new Set());
  
  console.log(`🏠 Room created: ${roomName} (${roomId})`);
  
  // Join the creator to the room
  handleJoinRoom(ws, { roomId });
}

function handleJoinRoom(ws, data) {
  const player = clients.get(ws);
  const { roomId } = data;
  
  const room = rooms.get(roomId);
  if (!room) {
    send(ws, MSG.SYSTEM_MESSAGE, { message: 'Room not found' });
    return;
  }
  
  if (room.players >= room.maxPlayers) {
    send(ws, MSG.SYSTEM_MESSAGE, { message: 'Room is full' });
    return;
  }
  
  // Leave current room if any
  if (player.roomId) {
    handleLeaveRoom(ws);
  }
  
  // Join new room
  player.roomId = roomId;
  playersByRoom.get(roomId).add(player.id);
  room.players++;
  
  console.log(`📥 ${player.name} joined room: ${room.name}`);
  
  // Notify all players in room
  broadcast(roomId, MSG.PLAYER_JOIN, {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    rotation: player.rotation
  }, ws);
  
  // Send existing players to new player
  playersByRoom.get(roomId).forEach(pid => {
    if (pid === player.id) return;
    
    const existingPlayer = Array.from(clients.entries())
      .find(([, p]) => p.id === pid)?.[1];
    
    if (existingPlayer) {
      send(ws, MSG.PLAYER_JOIN, {
        playerId: existingPlayer.id,
        playerName: existingPlayer.name,
        position: existingPlayer.position,
        rotation: existingPlayer.rotation
      });
    }
  });
}

function handleLeaveRoom(ws) {
  const player = clients.get(ws);
  if (!player.roomId) return;
  
  const room = rooms.get(player.roomId);
  if (room) {
    room.players--;
    
    // Remove player from room
    playersByRoom.get(player.roomId).delete(player.id);
    
    // Notify other players
    broadcast(player.roomId, MSG.PLAYER_LEAVE, {
      playerId: player.id,
      playerName: player.name
    });
    
    console.log(`📤 ${player.name} left room: ${room.name}`);
    
    // Delete room if empty
    if (room.players === 0) {
      rooms.delete(player.roomId);
      playersByRoom.delete(player.roomId);
      console.log(`🗑️ Room deleted: ${room.name}`);
    }
  }
  
  player.roomId = null;
}

function handleRoomList(ws) {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    players: room.players,
    maxPlayers: room.maxPlayers
  }));
  
  send(ws, MSG.ROOM_LIST, { rooms: roomList });
}

function handlePlayerUpdate(ws, data) {
  const player = clients.get(ws);
  
  // Update player state
  if (data.position) player.position = data.position;
  if (data.rotation) player.rotation = data.rotation;
  if (data.health !== undefined) player.health = data.health;
  
  // Broadcast to room
  if (player.roomId) {
    broadcast(player.roomId, MSG.PLAYER_UPDATE, {
      playerId: player.id,
      position: player.position,
      rotation: player.rotation,
      animation: data.animation,
      health: player.health
    }, ws);
  }
}

function handleChatMessage(ws, data) {
  const player = clients.get(ws);
  
  // 🔒 SECURITY: Sanitize chat message before broadcasting
  const sanitizedMessage = sanitizeChatMessage(data.message);
  
  if (!sanitizedMessage) {
    send(ws, 'error', { message: 'Invalid chat message' });
    return;
  }
  
  console.log(`💬 [${player.name}]: ${sanitizedMessage}`);
  
  // Broadcast to room or global
  const targetRoom = player.roomId || null;
  
  broadcast(targetRoom, MSG.CHAT_MESSAGE, {
    playerId: player.id,
    playerName: sanitizeUsername(player.name), // 🔒 SECURITY: Sanitize username too
    message: sanitizedMessage,
    timestamp: data.timestamp || Date.now()
  }, targetRoom ? ws : null); // Exclude self if in room
}

function handleDisconnect(ws) {
  const player = clients.get(ws);
  if (!player) return;
  
  console.log(`🔌 Disconnected: ${player.name} (${player.id})`);
  
  // Leave room if in one
  if (player.roomId) {
    handleLeaveRoom(ws);
  }
  
  // Remove from clients
  clients.delete(ws);
}

// ═══════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function send(ws, type, data) {
  if (ws.readyState !== WebSocket.OPEN) return;
  
  try {
    ws.send(JSON.stringify({ type, data }));
  } catch (error) {
    console.error('❌ Send error:', error);
  }
}

function broadcast(roomId, type, data, excludeWs = null) {
  clients.forEach((player, ws) => {
    if (ws === excludeWs) return;
    
    // If roomId specified, only send to players in that room
    if (roomId && player.roomId !== roomId) return;
    
    send(ws, type, data);
  });
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// ═══════════════════════════════════════════════════════════════════════
// SERVER STATUS
// ═══════════════════════════════════════════════════════════════════════

setInterval(() => {
  console.log(`\n📊 Server Status:`);
  console.log(`   👥 Connected players: ${clients.size}`);
  console.log(`   🏠 Active rooms: ${rooms.size}`);
  
  if (rooms.size > 0) {
    console.log(`\n   Rooms:`);
    rooms.forEach(room => {
      console.log(`   - ${room.name}: ${room.players}/${room.maxPlayers} players`);
    });
  }
  
  console.log('');
}, 30000); // Every 30 seconds

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  
  // Notify all clients
  clients.forEach((player, ws) => {
    send(ws, MSG.SYSTEM_MESSAGE, { message: 'Server shutting down' });
    ws.close();
  });
  
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

console.log('✅ Server ready!\n');
