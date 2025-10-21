#!/usr/bin/env node

/**
 * 🎮 PIXELVERSE MULTIPLAYER SERVER
 * =================================
 * WebSocket server for real-time multiplayer gameplay
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// State management
const players = new Map();
const worlds = new Map();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        players: players.size,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json({
        players: players.size,
        worlds: worlds.size,
        uptime: process.uptime()
    });
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    const playerId = generateId();
    
    console.log(`✅ Player connected: ${playerId}`);
    
    // Initialize player
    players.set(playerId, {
        id: playerId,
        ws,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        character: null,
        equipment: {},
        state: 'idle',
        connectedAt: Date.now()
    });
    
    // Send welcome message
    send(ws, {
        type: 'welcome',
        data: {
            playerId,
            players: Array.from(players.values())
                .filter(p => p.id !== playerId)
                .map(p => ({
                    id: p.id,
                    character: p.character,
                    position: p.position,
                    rotation: p.rotation,
                    equipment: p.equipment
                }))
        }
    });
    
    // Broadcast player joined
    broadcast({
        type: 'player_joined',
        data: {
            playerId,
            character: null,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        }
    }, playerId);
    
    // Handle messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(playerId, data);
        } catch (error) {
            console.error('❌ Error parsing message:', error);
        }
    });
    
    // Handle disconnect
    ws.on('close', () => {
        console.log(`🔌 Player disconnected: ${playerId}`);
        players.delete(playerId);
        
        broadcast({
            type: 'player_left',
            data: { playerId }
        });
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${playerId}:`, error);
    });
});

// Message handler
function handleMessage(playerId, message) {
    const player = players.get(playerId);
    if (!player) return;
    
    console.log(`📨 Message from ${playerId}:`, message.type);
    
    switch (message.type) {
        case 'join':
        case 'handshake':
            // Handle both join and handshake messages
            console.log(`👋 Player ${playerId} sent handshake/join`);
            send(player.ws, {
                type: 'welcome',
                data: {
                    playerId,
                    message: 'Welcome to PixelVerse!'
                }
            });
            break;
            
        case 'state_update':
            player.position = message.data.position || player.position;
            player.rotation = message.data.rotation || player.rotation;
            player.state = message.data.state || player.state;
            
            broadcast({
                type: 'state_update',
                data: {
                    playerId,
                    position: player.position,
                    rotation: player.rotation,
                    state: player.state
                }
            }, playerId);
            break;
            
        case 'character_update':
            player.character = message.data.character;
            
            broadcast({
                type: 'character_update',
                data: {
                    playerId,
                    character: player.character
                }
            }, playerId);
            break;
            
        case 'equipment_update':
            player.equipment = message.data.equipment;
            
            broadcast({
                type: 'equipment_update',
                data: {
                    playerId,
                    equipment: player.equipment
                }
            }, playerId);
            break;
            
        case 'animation':
            broadcast({
                type: 'animation',
                data: {
                    playerId,
                    animation: message.data.animation
                }
            }, playerId);
            break;
            
        case 'chat':
            broadcast({
                type: 'chat',
                data: {
                    playerId,
                    message: message.data.message,
                    timestamp: Date.now()
                }
            });
            break;
            
        case 'ping':
            send(player.ws, {
                type: 'pong',
                data: { pingId: message.data.pingId }
            });
            break;
            
        default:
            console.warn(`⚠️ Unknown message type: ${message.type}`);
    }
}

// Send message to specific player
function send(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

// Broadcast message to all players (optionally excluding sender)
function broadcast(message, excludeId = null) {
    players.forEach((player, id) => {
        if (id !== excludeId) {
            send(player.ws, message);
        }
    });
}

// Generate unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Start server
server.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('🎮 PIXELVERSE MULTIPLAYER SERVER');
    console.log('='.repeat(70));
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`\n⏳ Waiting for players...\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    
    // Close all connections
    wss.clients.forEach(client => {
        client.close();
    });
    
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});
