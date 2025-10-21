/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                     MINI-MAP SYSTEM v1.0.0                            ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Features:                                                             ║
 * ║  • Real-time top-down mini-map rendering                             ║
 * ║  • Fog of War with exploration tracking                              ║
 * ║  • Player/NPC/Enemy markers with color coding                        ║
 * ║  • Points of Interest (POI) icons                                    ║
 * ║  • Zoom controls (1x-4x)                                             ║
 * ║  • Map rotation (follow player orientation)                          ║
 * ║  • Terrain/object rendering                                          ║
 * ║  • Click-to-set-waypoint                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════
// 1. FOG OF WAR SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class FogOfWar {
  constructor(worldSize = 500, resolution = 256) {
    this.worldSize = worldSize; // World dimensions (-worldSize to +worldSize)
    this.resolution = resolution; // Fog texture resolution
    this.explorationRadius = 30; // Reveal radius around player
    
    // Create fog data (0 = unexplored, 255 = explored)
    this.fogData = new Uint8Array(resolution * resolution);
    this.fogData.fill(0); // Start with everything unexplored
    
    // Create canvas for fog rendering
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.width = resolution;
    this.fogCanvas.height = resolution;
    this.fogCtx = this.fogCanvas.getContext('2d');
    
    this.needsUpdate = true;
  }
  
  // Update fog based on player position
  updateFog(playerX, playerZ) {
    // Convert world position to fog grid coordinates
    const gridX = Math.floor(((playerX + this.worldSize) / (this.worldSize * 2)) * this.resolution);
    const gridZ = Math.floor(((playerZ + this.worldSize) / (this.worldSize * 2)) * this.resolution);
    
    // Reveal area around player
    const revealRadius = Math.floor((this.explorationRadius / (this.worldSize * 2)) * this.resolution);
    
    for (let x = -revealRadius; x <= revealRadius; x++) {
      for (let z = -revealRadius; z <= revealRadius; z++) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist <= revealRadius) {
          const fogX = gridX + x;
          const fogZ = gridZ + z;
          
          if (fogX >= 0 && fogX < this.resolution && fogZ >= 0 && fogZ < this.resolution) {
            const index = fogZ * this.resolution + fogX;
            // Gradually reveal (soft edges)
            const revealAmount = Math.max(0, 255 - (dist / revealRadius) * 100);
            this.fogData[index] = Math.min(255, this.fogData[index] + revealAmount);
            this.needsUpdate = true;
          }
        }
      }
    }
  }
  
  // Render fog to canvas
  renderFog() {
    if (!this.needsUpdate) return;
    
    const imageData = this.fogCtx.createImageData(this.resolution, this.resolution);
    
    for (let i = 0; i < this.fogData.length; i++) {
      const explored = this.fogData[i];
      const pixelIndex = i * 4;
      
      if (explored < 50) {
        // Unexplored - black
        imageData.data[pixelIndex] = 0;
        imageData.data[pixelIndex + 1] = 0;
        imageData.data[pixelIndex + 2] = 0;
        imageData.data[pixelIndex + 3] = 255;
      } else {
        // Explored - transparent
        imageData.data[pixelIndex] = 0;
        imageData.data[pixelIndex + 1] = 0;
        imageData.data[pixelIndex + 2] = 0;
        imageData.data[pixelIndex + 3] = Math.max(0, 255 - explored);
      }
    }
    
    this.fogCtx.putImageData(imageData, 0, 0);
    this.needsUpdate = false;
  }
  
  // Get fog canvas for rendering
  getFogCanvas() {
    this.renderFog();
    return this.fogCanvas;
  }
  
  // Check if position is explored
  isExplored(worldX, worldZ) {
    const gridX = Math.floor(((worldX + this.worldSize) / (this.worldSize * 2)) * this.resolution);
    const gridZ = Math.floor(((worldZ + this.worldSize) / (this.worldSize * 2)) * this.resolution);
    
    if (gridX >= 0 && gridX < this.resolution && gridZ >= 0 && gridZ < this.resolution) {
      const index = gridZ * this.resolution + gridX;
      return this.fogData[index] > 128;
    }
    return false;
  }
  
  // Reset fog (for new game)
  reset() {
    this.fogData.fill(0);
    this.needsUpdate = true;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 2. MAP MARKER SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class MapMarker {
  constructor(type, position, label = '', color = '#fff', icon = null) {
    this.type = type; // 'player', 'npc', 'enemy', 'poi', 'waypoint', 'quest'
    this.position = position; // {x, z}
    this.label = label;
    this.color = color;
    this.icon = icon; // Optional icon character/emoji
    this.visible = true;
    this.blinking = false; // For quest markers
    this.rotation = 0; // For directional markers
  }
  
  render(ctx, screenX, screenY, scale = 1) {
    if (!this.visible) return;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Blinking effect for quests
    if (this.blinking && Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.restore();
      return;
    }
    
    // Rotate for directional markers
    if (this.rotation !== 0) {
      ctx.rotate(this.rotation);
    }
    
    // Draw marker based on type
    switch (this.type) {
      case 'player':
        this.drawPlayerMarker(ctx, scale);
        break;
      case 'npc':
        this.drawCircleMarker(ctx, scale, this.color, 6);
        break;
      case 'enemy':
        this.drawTriangleMarker(ctx, scale, this.color);
        break;
      case 'poi':
        this.drawPOIMarker(ctx, scale, this.color, this.icon);
        break;
      case 'waypoint':
        this.drawWaypointMarker(ctx, scale);
        break;
      case 'quest':
        this.drawQuestMarker(ctx, scale);
        break;
    }
    
    // Draw label if exists
    if (this.label && scale > 0.5) {
      ctx.fillStyle = '#fff';
      ctx.font = `${10 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(this.label, 0, 18 * scale);
    }
    
    ctx.restore();
  }
  
  drawPlayerMarker(ctx, scale) {
    // Arrow pointing up (player direction)
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2 * scale;
    
    ctx.beginPath();
    ctx.moveTo(0, -8 * scale);
    ctx.lineTo(-6 * scale, 8 * scale);
    ctx.lineTo(6 * scale, 8 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  drawCircleMarker(ctx, scale, color, size = 6) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2 * scale;
    
    ctx.beginPath();
    ctx.arc(0, 0, size * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  
  drawTriangleMarker(ctx, scale, color) {
    // Triangle pointing down (enemy)
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2 * scale;
    
    ctx.beginPath();
    ctx.moveTo(0, 8 * scale);
    ctx.lineTo(-6 * scale, -8 * scale);
    ctx.lineTo(6 * scale, -8 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  drawPOIMarker(ctx, scale, color, icon) {
    // Square with icon
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2 * scale;
    
    ctx.fillRect(-6 * scale, -6 * scale, 12 * scale, 12 * scale);
    ctx.strokeRect(-6 * scale, -6 * scale, 12 * scale, 12 * scale);
    
    if (icon) {
      ctx.fillStyle = '#fff';
      ctx.font = `${10 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 0, 0);
    }
  }
  
  drawWaypointMarker(ctx, scale) {
    // Flag marker
    ctx.fillStyle = '#ffff00';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2 * scale;
    
    // Flag
    ctx.beginPath();
    ctx.moveTo(0, -10 * scale);
    ctx.lineTo(10 * scale, -7 * scale);
    ctx.lineTo(0, -4 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Pole
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(0, -10 * scale);
    ctx.lineTo(0, 8 * scale);
    ctx.stroke();
  }
  
  drawQuestMarker(ctx, scale) {
    // Exclamation mark
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2 * scale;
    
    ctx.beginPath();
    ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = `bold ${14 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 3. MINI-MAP RENDERER
// ═══════════════════════════════════════════════════════════════════════

class MiniMap {
  constructor(canvas, scene, player, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scene = scene;
    this.player = player;
    
    // Configuration
    this.worldSize = options.worldSize || 500;
    this.zoom = options.zoom || 2.0; // 1x-4x zoom
    this.size = options.size || 200; // Minimap size in pixels
    this.position = options.position || { x: 10, y: 10 }; // Screen position
    this.rotateWithPlayer = options.rotateWithPlayer !== undefined ? options.rotateWithPlayer : true;
    this.showGrid = options.showGrid !== undefined ? options.showGrid : true;
    this.showFogOfWar = options.showFogOfWar !== undefined ? options.showFogOfWar : true;
    
    // Set canvas size
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    
    // Systems
    this.fogOfWar = new FogOfWar(this.worldSize, 256);
    this.markers = [];
    this.waypoint = null;
    
    // Terrain cache (for performance)
    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = this.size;
    this.terrainCanvas.height = this.size;
    this.terrainCtx = this.terrainCanvas.getContext('2d');
    this.terrainNeedsUpdate = true;
    
    // Add player marker
    this.addMarker('player', { x: 0, z: 0 }, '', '#00ff00');
    
    // Setup click handler for waypoints
    this.setupClickHandler();
  }
  
  // Add marker to map
  addMarker(type, position, label = '', color = '#fff', icon = null) {
    const marker = new MapMarker(type, position, label, color, icon);
    this.markers.push(marker);
    return marker;
  }
  
  // Remove marker
  removeMarker(marker) {
    const index = this.markers.indexOf(marker);
    if (index > -1) {
      this.markers.splice(index, 1);
    }
  }
  
  // Set waypoint
  setWaypoint(worldX, worldZ) {
    // Remove old waypoint
    if (this.waypoint) {
      this.removeMarker(this.waypoint);
    }
    
    // Add new waypoint
    this.waypoint = this.addMarker('waypoint', { x: worldX, z: worldZ }, 'Waypoint', '#ffff00');
  }
  
  // Clear waypoint
  clearWaypoint() {
    if (this.waypoint) {
      this.removeMarker(this.waypoint);
      this.waypoint = null;
    }
  }
  
  // Setup click handler for setting waypoints
  setupClickHandler() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Convert screen coordinates to world coordinates
      const worldPos = this.screenToWorld(x, y);
      
      if (worldPos) {
        this.setWaypoint(worldPos.x, worldPos.z);
        console.log(`Waypoint set at (${worldPos.x.toFixed(1)}, ${worldPos.z.toFixed(1)})`);
      }
    });
  }
  
  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    const centerX = this.size / 2;
    const centerY = this.size / 2;
    
    const dx = screenX - centerX;
    const dy = screenY - centerY;
    
    const scale = (this.worldSize * 2) / (this.size / this.zoom);
    
    const playerX = this.player.position.x;
    const playerZ = this.player.position.z;
    
    // Apply rotation if enabled
    let worldX, worldZ;
    if (this.rotateWithPlayer) {
      const angle = -this.player.rotation.y;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      worldX = playerX + (dx * cos - dy * sin) * scale;
      worldZ = playerZ + (dx * sin + dy * cos) * scale;
    } else {
      worldX = playerX + dx * scale;
      worldZ = playerZ + dy * scale;
    }
    
    // Check if within world bounds
    if (Math.abs(worldX) <= this.worldSize && Math.abs(worldZ) <= this.worldSize) {
      return { x: worldX, z: worldZ };
    }
    
    return null;
  }
  
  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldZ) {
    const playerX = this.player.position.x;
    const playerZ = this.player.position.z;
    
    let dx = worldX - playerX;
    let dz = worldZ - playerZ;
    
    // Apply rotation if enabled
    if (this.rotateWithPlayer) {
      const angle = this.player.rotation.y;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotatedDx = dx * cos - dz * sin;
      const rotatedDz = dx * sin + dz * cos;
      dx = rotatedDx;
      dz = rotatedDz;
    }
    
    const scale = (this.size / this.zoom) / (this.worldSize * 2);
    
    const screenX = this.size / 2 + dx * scale;
    const screenY = this.size / 2 + dz * scale;
    
    return { x: screenX, y: screenY };
  }
  
  // Update terrain cache
  updateTerrain() {
    if (!this.terrainNeedsUpdate) return;
    
    const ctx = this.terrainCtx;
    ctx.clearRect(0, 0, this.size, this.size);
    
    // Draw terrain (simplified - just objects in scene)
    const objects = this.scene.children.filter(obj => 
      obj.geometry && obj.position && 
      (obj.userData.isInteractable || obj.userData.isTerrain)
    );
    
    objects.forEach(obj => {
      const screenPos = this.worldToScreen(obj.position.x, obj.position.z);
      
      // Only draw if within minimap bounds
      if (screenPos.x >= 0 && screenPos.x <= this.size && 
          screenPos.y >= 0 && screenPos.y <= this.size) {
        
        // Choose color based on object type
        let color = '#666';
        if (obj.userData.isInteractable) {
          color = '#888';
        }
        if (obj.userData.isTerrain) {
          color = '#444';
        }
        
        // Draw small square for object
        ctx.fillStyle = color;
        const size = 3;
        ctx.fillRect(screenPos.x - size/2, screenPos.y - size/2, size, size);
      }
    });
    
    this.terrainNeedsUpdate = false;
  }
  
  // Update map (call every frame)
  update() {
    // Update fog of war
    if (this.showFogOfWar) {
      this.fogOfWar.updateFog(this.player.position.x, this.player.position.z);
    }
    
    // Update player marker position (always at center)
    const playerMarker = this.markers.find(m => m.type === 'player');
    if (playerMarker) {
      playerMarker.position.x = this.player.position.x;
      playerMarker.position.z = this.player.position.z;
      playerMarker.rotation = this.rotateWithPlayer ? 0 : this.player.rotation.y;
    }
  }
  
  // Render map
  render() {
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, this.size, this.size);
    
    ctx.save();
    
    // Draw background
    ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
    ctx.fillRect(0, 0, this.size, this.size);
    
    // Draw grid
    if (this.showGrid) {
      this.drawGrid();
    }
    
    // Draw terrain
    this.updateTerrain();
    ctx.drawImage(this.terrainCanvas, 0, 0);
    
    // Draw fog of war
    if (this.showFogOfWar) {
      const fogCanvas = this.fogOfWar.getFogCanvas();
      ctx.drawImage(fogCanvas, 0, 0, this.size, this.size);
    }
    
    // Draw markers (sorted by type for layering)
    const sortedMarkers = [...this.markers].sort((a, b) => {
      const order = { poi: 0, npc: 1, enemy: 2, waypoint: 3, quest: 4, player: 5 };
      return (order[a.type] || 0) - (order[b.type] || 0);
    });
    
    sortedMarkers.forEach(marker => {
      // Skip player marker as it's drawn separately
      if (marker.type === 'player') return;
      
      // Only draw if explored or no fog of war
      if (!this.showFogOfWar || this.fogOfWar.isExplored(marker.position.x, marker.position.z)) {
        const screenPos = this.worldToScreen(marker.position.x, marker.position.z);
        
        // Only draw if within minimap bounds
        if (screenPos.x >= 0 && screenPos.x <= this.size && 
            screenPos.y >= 0 && screenPos.y <= this.size) {
          marker.render(ctx, screenPos.x, screenPos.y, 1.0);
        }
      }
    });
    
    // Always draw player marker last (at center)
    const playerMarker = this.markers.find(m => m.type === 'player');
    if (playerMarker) {
      playerMarker.render(ctx, this.size / 2, this.size / 2, 1.0);
    }
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, this.size - 2, this.size - 2);
    
    // Draw compass (N/S/E/W)
    this.drawCompass();
    
    // Draw zoom level
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(`${this.zoom.toFixed(1)}x`, 5, this.size - 5);
    
    ctx.restore();
  }
  
  // Draw grid
  drawGrid() {
    const ctx = this.ctx;
    const gridSize = 50; // World units per grid line
    const scale = (this.size / this.zoom) / (this.worldSize * 2);
    const gridSpacing = gridSize * scale;
    
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;
    
    const centerX = this.size / 2;
    const centerY = this.size / 2;
    
    // Draw vertical lines
    for (let x = centerX % gridSpacing; x < this.size; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.size);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = centerY % gridSpacing; y < this.size; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.size, y);
      ctx.stroke();
    }
  }
  
  // Draw compass
  drawCompass() {
    const ctx = this.ctx;
    const compassSize = 30;
    const compassX = this.size - compassSize - 5;
    const compassY = 25;
    
    ctx.save();
    ctx.translate(compassX, compassY);
    
    if (this.rotateWithPlayer) {
      ctx.rotate(-this.player.rotation.y);
    }
    
    // Draw N
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -15);
    
    // Draw S
    ctx.fillStyle = '#fff';
    ctx.fillText('S', 0, 15);
    
    // Draw E
    ctx.fillText('E', 15, 0);
    
    // Draw W
    ctx.fillText('W', -15, 0);
    
    ctx.restore();
  }
  
  // Zoom in
  zoomIn() {
    this.zoom = Math.min(4.0, this.zoom + 0.5);
    this.terrainNeedsUpdate = true;
  }
  
  // Zoom out
  zoomOut() {
    this.zoom = Math.max(1.0, this.zoom - 0.5);
    this.terrainNeedsUpdate = true;
  }
  
  // Toggle rotation
  toggleRotation() {
    this.rotateWithPlayer = !this.rotateWithPlayer;
  }
  
  // Toggle fog of war
  toggleFogOfWar() {
    this.showFogOfWar = !this.showFogOfWar;
  }
  
  // Toggle grid
  toggleGrid() {
    this.showGrid = !this.showGrid;
  }
  
  // Update markers from NPC array
  updateNPCMarkers(npcs) {
    // Remove old NPC markers
    this.markers = this.markers.filter(m => m.type !== 'npc' && m.type !== 'enemy');
    
    // Add new NPC markers
    npcs.forEach(npc => {
      if (npc.character && npc.character.position) {
        const color = npc.isHostile ? '#ff0000' : '#00ffff';
        const type = npc.isHostile ? 'enemy' : 'npc';
        this.addMarker(type, 
          { x: npc.character.position.x, z: npc.character.position.z },
          npc.name || '',
          color
        );
      }
    });
  }
  
  // Add quest marker
  addQuestMarker(position, label = 'Quest') {
    const marker = this.addMarker('quest', position, label, '#ffd700');
    marker.blinking = true;
    return marker;
  }
  
  // Add POI marker
  addPOIMarker(position, label, icon = '?', color = '#4080ff') {
    return this.addMarker('poi', position, label, color, icon);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MiniMap, MapMarker, FogOfWar };
}

// Browser export
if (typeof window !== 'undefined') {
  window.MiniMap = MiniMap;
  window.MapMarker = MapMarker;
  window.FogOfWar = FogOfWar;
}
