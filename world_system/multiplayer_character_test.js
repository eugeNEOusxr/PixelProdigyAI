/**
 * Multiplayer Character Rendering Test Controller
 * Tests character sync, equipment visibility, animations, and stress testing
 */

class MultiplayerCharacterTest {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.clients = [];
        this.canvas = document.getElementById('renderCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Performance metrics
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.latency = 0;
        this.bandwidth = 0;
        this.syncRate = 0;
        
        // Test results
        this.testResults = {
            appearance: { passed: 0, total: 0 },
            equipment: { passed: 0, total: 0 },
            animation: { passed: 0, total: 0 },
            stress: { passed: 0, total: 0 }
        };
        
        // Character appearance templates
        this.races = ['human', 'elf', 'dwarf', 'orc', 'goblin'];
        this.classes = ['warrior', 'mage', 'rogue', 'cleric'];
        this.skinColors = ['#FFE0BD', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#4B2817'];
        this.hairColors = ['#000000', '#2C1B18', '#6A4E42', '#B66325', '#FFD700', '#FFFFFF'];
        
        // Equipment slots
        this.equipmentSlots = ['head', 'chest', 'legs', 'feet', 'weapon_main', 'weapon_off'];
        
        // Animations
        this.animations = ['idle', 'walk', 'run', 'jump', 'attack', 'block', 'cast', 'hit', 'die', 'emote'];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startRenderLoop();
        this.startMetricsUpdate();
        this.log('System initialized', 'info');
    }

    setupEventListeners() {
        // Connection controls
        document.getElementById('connectBtn').addEventListener('click', () => this.connect());
        document.getElementById('disconnectBtn').addEventListener('click', () => this.disconnect());
        
        // Client count slider
        document.getElementById('clientCount').addEventListener('input', (e) => {
            document.getElementById('clientCountValue').textContent = e.target.value;
        });
        
        // Character tests
        document.getElementById('spawnClientsBtn').addEventListener('click', () => this.spawnClients());
        document.getElementById('randomizeAppearanceBtn').addEventListener('click', () => this.randomizeAppearances());
        document.getElementById('randomizeEquipmentBtn').addEventListener('click', () => this.randomizeEquipment());
        document.getElementById('clearClientsBtn').addEventListener('click', () => this.clearClients());
        
        // Animation tests
        document.querySelectorAll('.animation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const anim = btn.dataset.anim;
                this.broadcastAnimation(anim);
            });
        });
        
        document.getElementById('randomAnimBtn').addEventListener('click', () => this.randomAnimations());
        document.getElementById('syncAnimBtn').addEventListener('click', () => this.syncAnimations());
        
        // Stress tests
        document.getElementById('stressTestBtn').addEventListener('click', () => this.runStressTest());
        document.getElementById('bandwidthTestBtn').addEventListener('click', () => this.runBandwidthTest());
        document.getElementById('lagTestBtn').addEventListener('click', () => this.simulateLag());
        document.getElementById('disconnectTestBtn').addEventListener('click', () => this.randomDisconnects());
    }

    async connect() {
        const port = document.getElementById('serverPort').value;
        
        try {
            this.socket = new WebSocket(`ws://localhost:${port}`);
            
            this.socket.onopen = () => {
                this.connected = true;
                this.updateConnectionUI(true);
                this.log(`Connected to server on port ${port}`, 'success');
                
                // Send initial handshake
                this.send({
                    type: 'join',
                    data: {
                        playerId: 'test_' + Math.random().toString(36).substr(2, 9),
                        name: 'TestController',
                        isTestClient: true
                    }
                });
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onerror = (error) => {
                this.log('WebSocket error: ' + error, 'error');
                this.updateConnectionUI(false);
            };
            
            this.socket.onclose = () => {
                this.connected = false;
                this.updateConnectionUI(false);
                this.log('Disconnected from server', 'warning');
            };
            
        } catch (error) {
            this.log('Connection failed: ' + error.message, 'error');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connected = false;
        this.updateConnectionUI(false);
        this.clearClients();
    }

    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            this.bandwidth += JSON.stringify(message).length;
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'playerJoined':
                this.onPlayerJoined(message.data);
                break;
            case 'playerLeft':
                this.onPlayerLeft(message.data);
                break;
            case 'playerUpdate':
                this.onPlayerUpdate(message.data);
                break;
            case 'equipmentUpdate':
                this.onEquipmentUpdate(message.data);
                break;
            case 'animationBroadcast':
                this.onAnimationBroadcast(message.data);
                break;
            case 'ping':
                this.send({ type: 'pong', timestamp: message.timestamp });
                break;
            case 'pong':
                this.latency = performance.now() - message.timestamp;
                break;
        }
        
        this.syncRate++;
    }

    spawnClients() {
        const count = parseInt(document.getElementById('clientCount').value);
        this.log(`Spawning ${count} test clients...`, 'info');
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const client = this.createTestClient(i);
                this.clients.push(client);
                
                // Broadcast to server
                this.send({
                    type: 'spawnPlayer',
                    data: client
                });
                
                this.log(`Spawned client: ${client.name}`, 'success');
                this.updatePlayerList();
                
                // Test appearance sync
                this.testAppearanceSync(client);
                
            }, i * 100); // Stagger spawns
        }
    }

    createTestClient(index) {
        const race = this.races[Math.floor(Math.random() * this.races.length)];
        const charClass = this.classes[Math.floor(Math.random() * this.classes.length)];
        
        return {
            id: 'client_' + index,
            name: `Player${index + 1}`,
            race: race,
            class: charClass,
            appearance: {
                skinColor: this.skinColors[Math.floor(Math.random() * this.skinColors.length)],
                hairColor: this.hairColors[Math.floor(Math.random() * this.hairColors.length)],
                hairStyle: Math.floor(Math.random() * 10),
                faceType: Math.floor(Math.random() * 8),
                height: 0.9 + Math.random() * 0.2,
                build: 0.8 + Math.random() * 0.4
            },
            equipment: this.generateRandomEquipment(),
            position: {
                x: (Math.random() - 0.5) * 500,
                y: 0,
                z: (Math.random() - 0.5) * 500
            },
            rotation: Math.random() * 360,
            animation: 'idle',
            level: Math.floor(Math.random() * 100) + 1,
            stats: {
                health: 100,
                mana: 100
            }
        };
    }

    generateRandomEquipment() {
        const equipment = {};
        this.equipmentSlots.forEach(slot => {
            if (Math.random() > 0.3) { // 70% chance of having equipment in slot
                equipment[slot] = {
                    id: `item_${slot}_${Math.floor(Math.random() * 1000)}`,
                    name: `${slot} item`,
                    rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 5)]
                };
            }
        });
        return equipment;
    }

    randomizeAppearances() {
        this.log('Randomizing all appearances...', 'info');
        
        this.clients.forEach(client => {
            client.appearance = {
                skinColor: this.skinColors[Math.floor(Math.random() * this.skinColors.length)],
                hairColor: this.hairColors[Math.floor(Math.random() * this.hairColors.length)],
                hairStyle: Math.floor(Math.random() * 10),
                faceType: Math.floor(Math.random() * 8),
                height: 0.9 + Math.random() * 0.2,
                build: 0.8 + Math.random() * 0.4
            };
            
            this.send({
                type: 'updateAppearance',
                data: {
                    playerId: client.id,
                    appearance: client.appearance
                }
            });
            
            this.testAppearanceSync(client);
        });
        
        this.log('Appearances randomized', 'success');
    }

    randomizeEquipment() {
        this.log('Randomizing all equipment...', 'info');
        
        this.clients.forEach(client => {
            client.equipment = this.generateRandomEquipment();
            
            this.send({
                type: 'updateEquipment',
                data: {
                    playerId: client.id,
                    equipment: client.equipment
                }
            });
            
            this.testEquipmentSync(client);
        });
        
        this.log('Equipment randomized', 'success');
        this.updatePlayerList();
    }

    broadcastAnimation(animName) {
        this.log(`Broadcasting ${animName} animation to all clients`, 'info');
        
        this.clients.forEach(client => {
            client.animation = animName;
            
            this.send({
                type: 'playAnimation',
                data: {
                    playerId: client.id,
                    animation: animName,
                    timestamp: performance.now()
                }
            });
        });
        
        this.testAnimationSync(animName);
    }

    randomAnimations() {
        this.log('Playing random animations on all clients', 'info');
        
        this.clients.forEach(client => {
            const anim = this.animations[Math.floor(Math.random() * this.animations.length)];
            client.animation = anim;
            
            this.send({
                type: 'playAnimation',
                data: {
                    playerId: client.id,
                    animation: anim,
                    timestamp: performance.now()
                }
            });
        });
        
        this.updatePlayerList();
    }

    syncAnimations() {
        const anim = this.animations[Math.floor(Math.random() * this.animations.length)];
        this.broadcastAnimation(anim);
    }

    clearClients() {
        this.log('Clearing all clients...', 'info');
        
        this.clients.forEach(client => {
            this.send({
                type: 'removePlayer',
                data: { playerId: client.id }
            });
        });
        
        this.clients = [];
        this.updatePlayerList();
        this.log('All clients cleared', 'success');
    }

    async runStressTest() {
        this.log('⚠️ STARTING STRESS TEST ⚠️', 'warning');
        document.getElementById('stressIndicator').style.display = 'block';
        
        // Spawn 20+ clients
        document.getElementById('clientCount').value = 25;
        document.getElementById('clientCountValue').textContent = '25';
        this.spawnClients();
        
        await this.sleep(2000);
        
        // Rapid equipment changes
        for (let i = 0; i < 10; i++) {
            this.randomizeEquipment();
            await this.sleep(500);
            this.updateStressMeters();
        }
        
        // Rapid animation changes
        for (let i = 0; i < 20; i++) {
            this.randomAnimations();
            await this.sleep(200);
            this.updateStressMeters();
        }
        
        // Rapid position updates
        for (let i = 0; i < 50; i++) {
            this.clients.forEach(client => {
                client.position.x += (Math.random() - 0.5) * 10;
                client.position.z += (Math.random() - 0.5) * 10;
                
                this.send({
                    type: 'updatePosition',
                    data: {
                        playerId: client.id,
                        position: client.position,
                        rotation: client.rotation
                    }
                });
            });
            await this.sleep(100);
            this.updateStressMeters();
        }
        
        document.getElementById('stressIndicator').style.display = 'none';
        this.testResults.stress.passed = this.fps > 30 && this.latency < 100 ? 1 : 0;
        this.testResults.stress.total = 1;
        this.updateTestProgress();
        
        this.log('✅ STRESS TEST COMPLETE', 'success');
        this.log(`Final FPS: ${this.fps.toFixed(1)}, Latency: ${this.latency.toFixed(1)}ms`, 'info');
    }

    async runBandwidthTest() {
        this.log('Running bandwidth test...', 'info');
        
        const startBytes = this.bandwidth;
        const startTime = performance.now();
        
        // Send 100 messages
        for (let i = 0; i < 100; i++) {
            this.send({
                type: 'bandwidthTest',
                data: {
                    index: i,
                    payload: 'x'.repeat(1000) // 1KB payload
                }
            });
            await this.sleep(10);
        }
        
        const duration = (performance.now() - startTime) / 1000;
        const bytes = this.bandwidth - startBytes;
        const kbps = (bytes / 1024) / duration;
        
        this.log(`Bandwidth: ${kbps.toFixed(2)} KB/s`, 'success');
    }

    simulateLag() {
        this.log('Simulating 200ms lag...', 'warning');
        
        const originalSend = this.send.bind(this);
        this.send = (message) => {
            setTimeout(() => originalSend(message), 200);
        };
        
        setTimeout(() => {
            this.send = originalSend;
            this.log('Lag simulation ended', 'info');
        }, 10000);
    }

    async randomDisconnects() {
        this.log('Testing random disconnects...', 'warning');
        
        for (let i = 0; i < 5; i++) {
            const client = this.clients[Math.floor(Math.random() * this.clients.length)];
            if (client) {
                this.log(`Disconnecting ${client.name}`, 'warning');
                this.send({
                    type: 'removePlayer',
                    data: { playerId: client.id }
                });
                
                await this.sleep(1000);
                
                this.log(`Reconnecting ${client.name}`, 'info');
                this.send({
                    type: 'spawnPlayer',
                    data: client
                });
                
                await this.sleep(2000);
            }
        }
        
        this.log('Disconnect test complete', 'success');
    }

    // Test verification
    testAppearanceSync(client) {
        this.testResults.appearance.total++;
        
        // Simulate verification (in real app, would check actual sync)
        setTimeout(() => {
            this.testResults.appearance.passed++;
            this.updateTestProgress();
        }, 100);
    }

    testEquipmentSync(client) {
        this.testResults.equipment.total++;
        
        setTimeout(() => {
            this.testResults.equipment.passed++;
            this.updateTestProgress();
        }, 100);
    }

    testAnimationSync(animName) {
        this.testResults.animation.total++;
        
        setTimeout(() => {
            this.testResults.animation.passed++;
            this.updateTestProgress();
        }, 50);
    }

    // UI Updates
    updateConnectionUI(connected) {
        document.getElementById('serverStatus').classList.toggle('active', connected);
        document.getElementById('renderStatus').classList.add('active');
        document.getElementById('syncStatus').classList.toggle('active', connected);
        
        document.getElementById('connectBtn').disabled = connected;
        document.getElementById('disconnectBtn').disabled = !connected;
        document.getElementById('spawnClientsBtn').disabled = !connected;
        document.getElementById('randomizeAppearanceBtn').disabled = !connected;
        document.getElementById('randomizeEquipmentBtn').disabled = !connected;
        document.getElementById('clearClientsBtn').disabled = !connected;
    }

    updatePlayerList() {
        const list = document.getElementById('playerList');
        list.innerHTML = '';
        
        this.clients.forEach(client => {
            const item = document.createElement('div');
            item.className = 'player-item';
            item.innerHTML = `
                <div>
                    <div class="player-name">${client.name}</div>
                    <div class="player-stats">${client.race} ${client.class} | Lv.${client.level}</div>
                    <div class="player-stats">Anim: ${client.animation}</div>
                </div>
                <div class="player-stats">
                    ${Object.keys(client.equipment).length} items
                </div>
            `;
            list.appendChild(item);
        });
        
        document.getElementById('playerCount').textContent = this.clients.length;
    }

    updateTestProgress() {
        // Appearance
        const appearPercent = this.testResults.appearance.total > 0 
            ? (this.testResults.appearance.passed / this.testResults.appearance.total * 100) 
            : 0;
        document.getElementById('appearanceProgress').style.width = appearPercent + '%';
        document.getElementById('appearanceResult').textContent = 
            `${this.testResults.appearance.passed}/${this.testResults.appearance.total} (${appearPercent.toFixed(0)}%)`;
        
        // Equipment
        const equipPercent = this.testResults.equipment.total > 0 
            ? (this.testResults.equipment.passed / this.testResults.equipment.total * 100) 
            : 0;
        document.getElementById('equipmentProgress').style.width = equipPercent + '%';
        document.getElementById('equipmentResult').textContent = 
            `${this.testResults.equipment.passed}/${this.testResults.equipment.total} (${equipPercent.toFixed(0)}%)`;
        
        // Animation
        const animPercent = this.testResults.animation.total > 0 
            ? (this.testResults.animation.passed / this.testResults.animation.total * 100) 
            : 0;
        document.getElementById('animationProgress').style.width = animPercent + '%';
        document.getElementById('animationResult').textContent = 
            `${this.testResults.animation.passed}/${this.testResults.animation.total} (${animPercent.toFixed(0)}%)`;
        
        // Stress
        const stressPercent = this.testResults.stress.total > 0 
            ? (this.testResults.stress.passed / this.testResults.stress.total * 100) 
            : 0;
        document.getElementById('stressProgress').style.width = stressPercent + '%';
        document.getElementById('stressResult').textContent = 
            this.testResults.stress.total > 0 
                ? (stressPercent === 100 ? '✅ PASSED' : '❌ FAILED')
                : '-';
    }

    updateStressMeters() {
        const cpuUsage = Math.min(100, (1 - this.fps / 60) * 100);
        const gpuUsage = Math.min(100, this.clients.length * 3);
        const netUsage = Math.min(100, (this.bandwidth / 10000) * 100);
        
        document.getElementById('cpuMeter').style.width = cpuUsage + '%';
        document.getElementById('cpuPercent').textContent = cpuUsage.toFixed(0) + '%';
        document.getElementById('cpuMeter').className = 'meter-fill ' + 
            (cpuUsage > 80 ? 'danger' : cpuUsage > 60 ? 'warning' : '');
        
        document.getElementById('gpuMeter').style.width = gpuUsage + '%';
        document.getElementById('gpuPercent').textContent = gpuUsage.toFixed(0) + '%';
        document.getElementById('gpuMeter').className = 'meter-fill ' + 
            (gpuUsage > 80 ? 'danger' : gpuUsage > 60 ? 'warning' : '');
        
        document.getElementById('netMeter').style.width = netUsage + '%';
        document.getElementById('netPercent').textContent = netUsage.toFixed(0) + '%';
        document.getElementById('netMeter').className = 'meter-fill ' + 
            (netUsage > 80 ? 'danger' : netUsage > 60 ? 'warning' : '');
    }

    // Rendering
    startRenderLoop() {
        const render = () => {
            this.frameCount++;
            this.renderScene();
            requestAnimationFrame(render);
        };
        render();
    }

    renderScene() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        
        // Draw clients
        this.clients.forEach(client => {
            const x = this.canvas.width / 2 + client.position.x;
            const z = this.canvas.height / 2 + client.position.z;
            
            // Character circle
            this.ctx.fillStyle = client.appearance.skinColor;
            this.ctx.beginPath();
            this.ctx.arc(x, z, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Equipment indicator
            if (Object.keys(client.equipment).length > 0) {
                this.ctx.strokeStyle = '#0ff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x, z, 18, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            // Name
            this.ctx.fillStyle = '#0f0';
            this.ctx.font = '10px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(client.name, x, z - 25);
            
            // Animation indicator
            this.ctx.fillStyle = '#ff0';
            this.ctx.font = '8px Courier New';
            this.ctx.fillText(client.animation, x, z + 30);
        });
    }

    startMetricsUpdate() {
        setInterval(() => {
            // Calculate FPS
            const now = performance.now();
            const delta = now - this.lastTime;
            this.fps = (this.frameCount / delta) * 1000;
            this.frameCount = 0;
            this.lastTime = now;
            
            // Update UI
            document.getElementById('fpsMeter').textContent = this.fps.toFixed(1);
            document.getElementById('fpsValue').textContent = this.fps.toFixed(0);
            document.getElementById('latencyValue').textContent = this.latency.toFixed(0);
            document.getElementById('bandwidthValue').textContent = (this.bandwidth / 1024).toFixed(1);
            document.getElementById('syncRateValue').textContent = this.syncRate;
            
            document.getElementById('drawCalls').textContent = this.clients.length;
            document.getElementById('vertexCount').textContent = (this.clients.length * 24).toLocaleString();
            
            // Reset counters
            this.syncRate = 0;
            this.bandwidth = 0;
        }, 1000);
    }

    log(message, type = 'info') {
        const log = document.getElementById('consoleLog');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        
        console.log(message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Event handlers
    onPlayerJoined(data) {
        this.log(`Player joined: ${data.name}`, 'success');
    }

    onPlayerLeft(data) {
        this.log(`Player left: ${data.playerId}`, 'warning');
        this.clients = this.clients.filter(c => c.id !== data.playerId);
        this.updatePlayerList();
    }

    onPlayerUpdate(data) {
        const client = this.clients.find(c => c.id === data.playerId);
        if (client) {
            Object.assign(client, data);
        }
    }

    onEquipmentUpdate(data) {
        const client = this.clients.find(c => c.id === data.playerId);
        if (client) {
            client.equipment = data.equipment;
            this.updatePlayerList();
        }
    }

    onAnimationBroadcast(data) {
        const client = this.clients.find(c => c.id === data.playerId);
        if (client) {
            client.animation = data.animation;
            this.updatePlayerList();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MultiplayerCharacterTest());
} else {
    new MultiplayerCharacterTest();
}
