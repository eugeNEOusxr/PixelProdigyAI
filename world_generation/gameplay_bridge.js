#!/usr/bin/env node

/**
 * PIXELVERSE GAMEPLAY INTEGRATION BRIDGE
 * =======================================================================
 * Node.js interface layer connecting:
 * - C++ resource_gathering backend (via child_process)
 * - C# crafting_system (via .NET SDK or Unity bridge)
 * - JavaScript WebGL renderer + gameplay systems
 * 
 * This bridge enables the compiled-language backends to power the
 * browser-based gameplay while maintaining performance.
 * =======================================================================
 */

const { spawn } = require('child_process');
const path = require('path');
const WebSocket = require('ws');

class GameplayBridge {
    constructor() {
        this.cppProcess = null;
        this.wsServer = null;
        this.clients = new Set();
        
        // Resource state synced from C++
        this.resourceState = {
            nodes: new Map(),
            playerInventories: new Map(),
            harvestEvents: []
        };
        
        // Crafting state (will integrate C# later)
        this.craftingState = {
            recipes: new Map(),
            activeJobs: []
        };
    }

    // ==========================================
    // C++ BACKEND INTEGRATION
    // ==========================================

    async startCppBackend() {
        console.log('🔧 Starting C++ resource gathering backend...');
        
        const cppBinary = path.join(__dirname, 'resource_gathering');
        
        // For now, we'll use a simple stdin/stdout interface
        // In production, consider shared memory or ZeroMQ
        this.cppProcess = spawn(cppBinary, ['--server-mode']);
        
        this.cppProcess.stdout.on('data', (data) => {
            this.handleCppOutput(data.toString());
        });
        
        this.cppProcess.stderr.on('data', (data) => {
            console.error(`[C++ Backend] ${data}`);
        });
        
        this.cppProcess.on('close', (code) => {
            console.log(`[C++ Backend] Process exited with code ${code}`);
        });
        
        console.log('  ✓ C++ backend initialized');
    }

    handleCppOutput(output) {
        // Parse C++ output (assumes JSON lines protocol)
        const lines = output.trim().split('\n');
        
        for (const line of lines) {
            try {
                const message = JSON.parse(line);
                this.processCppMessage(message);
            } catch (err) {
                // Non-JSON output, treat as log
                console.log(`[C++] ${line}`);
            }
        }
    }

    processCppMessage(message) {
        switch (message.type) {
            case 'harvest_event':
                this.resourceState.harvestEvents.push(message.data);
                this.broadcastToClients({
                    type: 'resource_gathered',
                    data: message.data
                });
                break;
                
            case 'resource_node_update':
                this.resourceState.nodes.set(message.data.nodeId, message.data);
                break;
                
            case 'inventory_update':
                this.resourceState.playerInventories.set(message.data.playerId, message.data.inventory);
                this.broadcastToClients({
                    type: 'inventory_changed',
                    data: message.data
                });
                break;
        }
    }

    sendToCpp(message) {
        if (this.cppProcess && this.cppProcess.stdin.writable) {
            this.cppProcess.stdin.write(JSON.stringify(message) + '\n');
        }
    }

    // ==========================================
    // C# CRAFTING INTEGRATION (PLACEHOLDER)
    // ==========================================

    async startCSharpBridge() {
        console.log('🔧 Initializing C# crafting system bridge...');
        
        // Option 1: Call C# via .NET SDK
        // this.csharpProcess = spawn('dotnet', ['run', '--project', 'crafting_system.csproj']);
        
        // Option 2: Load compiled DLL via edge.js or similar
        // const edge = require('edge-js');
        // this.craftingSystem = edge.func({ ... });
        
        // Option 3: HTTP/gRPC service
        // this.craftingApiUrl = 'http://localhost:5000/crafting';
        
        console.log('  ⚠️  C# bridge placeholder - implement via dotnet SDK or Unity integration');
    }

    async craft(playerId, recipeId) {
        // For now, implement in JS; migrate to C# call later
        console.log(`[Crafting] Player ${playerId} attempting to craft ${recipeId}`);
        
        // TODO: Forward to C# system
        // const result = await this.callCSharp('StartCraft', { playerId, recipeId });
        
        return {
            success: true,
            message: 'Crafting started (JS placeholder)'
        };
    }

    // ==========================================
    // WEBSOCKET SERVER FOR BROWSER CLIENTS
    // ==========================================

    startWebSocketServer(port = 8080) {
        console.log(`🌐 Starting WebSocket server on port ${port}...`);
        
        this.wsServer = new WebSocket.Server({ port });
        
        this.wsServer.on('connection', (ws, req) => {
            console.log(`  ✓ Client connected from ${req.socket.remoteAddress}`);
            this.clients.add(ws);
            
            // Send current state to new client
            ws.send(JSON.stringify({
                type: 'initial_state',
                data: {
                    resourceNodes: Array.from(this.resourceState.nodes.values()),
                    recipes: Array.from(this.craftingState.recipes.values())
                }
            }));
            
            ws.on('message', (data) => {
                this.handleClientMessage(ws, data);
            });
            
            ws.on('close', () => {
                this.clients.delete(ws);
                console.log('  ✗ Client disconnected');
            });
        });
        
        console.log(`  ✓ WebSocket server listening`);
    }

    handleClientMessage(ws, data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'harvest':
                    this.sendToCpp({
                        type: 'harvest_request',
                        playerId: message.playerId,
                        nodeId: message.nodeId,
                        toolPower: message.toolPower || 10
                    });
                    break;
                    
                case 'craft':
                    this.craft(message.playerId, message.recipeId)
                        .then(result => {
                            ws.send(JSON.stringify({
                                type: 'craft_response',
                                data: result
                            }));
                        });
                    break;
                    
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
            }
        } catch (err) {
            console.error('[WebSocket] Error handling message:', err);
        }
    }

    broadcastToClients(message) {
        const data = JSON.stringify(message);
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        }
    }

    // ==========================================
    // INITIALIZATION & MAIN LOOP
    // ==========================================

    async start() {
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║           PIXELVERSE GAMEPLAY BRIDGE STARTING              ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        
        // Start C++ backend
        await this.startCppBackend();
        
        // Start C# bridge (placeholder)
        await this.startCSharpBridge();
        
        // Start WebSocket server for browser clients
        this.startWebSocketServer(8080);
        
        console.log('\n🎮 Gameplay bridge ready! Connect browser clients to ws://localhost:8080\n');
        
        // Game loop for updates
        this.startGameLoop();
    }

    startGameLoop() {
        setInterval(() => {
            // Update crafting jobs
            this.updateCraftingJobs();
            
            // Update resource node regeneration (ask C++)
            this.sendToCpp({ type: 'update', deltaTime: 1.0 });
        }, 1000);
    }

    updateCraftingJobs() {
        // Check for completed crafting jobs
        const now = Date.now();
        const completed = this.craftingState.activeJobs.filter(job => job.finishTime <= now);
        
        for (const job of completed) {
            this.broadcastToClients({
                type: 'craft_completed',
                data: {
                    playerId: job.playerId,
                    recipeId: job.recipeId,
                    result: job.result
                }
            });
        }
        
        this.craftingState.activeJobs = this.craftingState.activeJobs.filter(job => job.finishTime > now);
    }

    shutdown() {
        console.log('\n🛑 Shutting down gameplay bridge...');
        
        if (this.cppProcess) {
            this.cppProcess.kill();
        }
        
        if (this.wsServer) {
            this.wsServer.close();
        }
        
        console.log('  ✓ Shutdown complete');
    }
}

// ==========================================
// CLI ENTRY POINT
// ==========================================

if (require.main === module) {
    const bridge = new GameplayBridge();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        bridge.shutdown();
        process.exit(0);
    });
    
    bridge.start().catch(err => {
        console.error('Failed to start gameplay bridge:', err);
        process.exit(1);
    });
}

module.exports = GameplayBridge;
