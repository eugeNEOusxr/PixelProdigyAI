/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                ENHANCED AUDIO CONTROLLER v1.0.0                       ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║ Advanced audio management with music tracks, volume controls, and    ║
 * ║ smooth transitions                                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

class EnhancedAudioController {
  constructor(audioSystem) {
    this.audioSystem = audioSystem;
    
    // Volume controls
    this.volumes = {
      master: 1.0,
      music: 0.6,
      sfx: 0.8,
      ambient: 0.4,
      ui: 0.5
    };
    
    // Music system
    this.currentTrack = null;
    this.musicTracks = {
      menu: { name: 'Menu Theme', duration: 120, tempo: 'calm' },
      exploration: { name: 'Exploration', duration: 180, tempo: 'ambient' },
      combat: { name: 'Combat Theme', duration: 90, tempo: 'intense' },
      victory: { name: 'Victory Fanfare', duration: 15, tempo: 'triumphant' },
      boss: { name: 'Boss Battle', duration: 150, tempo: 'epic' }
    };
    
    // Music state
    this.isMusicPlaying = false;
    this.isMusicMuted = false;
    this.crossfadeDuration = 2.0; // seconds
    
    // Sound categories
    this.soundCategories = {
      ui: ['click', 'hover', 'open', 'close', 'error', 'success'],
      combat: ['hit', 'miss', 'block', 'critical', 'death'],
      magic: ['cast', 'impact', 'buff', 'debuff', 'summon'],
      environment: ['footstep', 'door', 'chest', 'water', 'fire'],
      items: ['pickup', 'drop', 'equip', 'unequip', 'consume']
    };
    
    // Recently played sounds (for cooldown)
    this.soundCooldowns = new Map();
    this.minSoundInterval = 50; // ms
    
    this.createUI();
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UI CREATION
  // ═══════════════════════════════════════════════════════════════════════
  
  createUI() {
    // Create audio control panel
    this.panel = document.createElement('div');
    this.panel.id = 'audio-controls';
    this.panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(20, 20, 30, 0.95);
      border: 2px solid rgba(102, 126, 234, 0.5);
      border-radius: 12px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: white;
      z-index: 1000;
      min-width: 250px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      display: none;
    `;
    
    this.panel.innerHTML = `
      <div style="
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #667eea;
        text-align: center;
      ">🎵 AUDIO CONTROLS</div>
      
      <!-- Master Volume -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Master Volume</span>
          <span id="master-vol-val">100%</span>
        </div>
        <input type="range" id="master-vol" min="0" max="100" value="100" style="width: 100%;">
      </div>
      
      <!-- Music Volume -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Music Volume</span>
          <span id="music-vol-val">60%</span>
        </div>
        <input type="range" id="music-vol" min="0" max="100" value="60" style="width: 100%;">
      </div>
      
      <!-- SFX Volume -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>SFX Volume</span>
          <span id="sfx-vol-val">80%</span>
        </div>
        <input type="range" id="sfx-vol" min="0" max="100" value="80" style="width: 100%;">
      </div>
      
      <!-- Ambient Volume -->
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Ambient Volume</span>
          <span id="ambient-vol-val">40%</span>
        </div>
        <input type="range" id="ambient-vol" min="0" max="100" value="40" style="width: 100%;">
      </div>
      
      <!-- Music Controls -->
      <div style="
        border-top: 1px solid rgba(102, 126, 234, 0.3);
        padding-top: 10px;
        margin-top: 10px;
      ">
        <div style="margin-bottom: 8px; color: #888;">Current Track:</div>
        <div id="current-track" style="
          color: #667eea;
          font-weight: bold;
          margin-bottom: 10px;
        ">None</div>
        
        <div style="display: flex; gap: 5px;">
          <button id="music-play" style="
            flex: 1;
            padding: 8px;
            background: #667eea;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 11px;
          ">▶ Play</button>
          
          <button id="music-stop" style="
            flex: 1;
            padding: 8px;
            background: #ff4444;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 11px;
          ">⏹ Stop</button>
          
          <button id="music-next" style="
            flex: 1;
            padding: 8px;
            background: #44ff44;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 11px;
          ">⏭ Next</button>
        </div>
      </div>
      
      <!-- Quick Mute -->
      <div style="
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid rgba(102, 126, 234, 0.3);
      ">
        <button id="mute-all" style="
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
          font-weight: bold;
        ">🔇 MUTE ALL</button>
      </div>
    `;
    
    document.body.appendChild(this.panel);
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Volume sliders
    const masterVol = document.getElementById('master-vol');
    const musicVol = document.getElementById('music-vol');
    const sfxVol = document.getElementById('sfx-vol');
    const ambientVol = document.getElementById('ambient-vol');
    
    masterVol.oninput = (e) => {
      this.volumes.master = e.target.value / 100;
      document.getElementById('master-vol-val').textContent = e.target.value + '%';
      this.updateAudioSystem();
    };
    
    musicVol.oninput = (e) => {
      this.volumes.music = e.target.value / 100;
      document.getElementById('music-vol-val').textContent = e.target.value + '%';
      this.updateAudioSystem();
    };
    
    sfxVol.oninput = (e) => {
      this.volumes.sfx = e.target.value / 100;
      document.getElementById('sfx-vol-val').textContent = e.target.value + '%';
      this.updateAudioSystem();
    };
    
    ambientVol.oninput = (e) => {
      this.volumes.ambient = e.target.value / 100;
      document.getElementById('ambient-vol-val').textContent = e.target.value + '%';
      this.updateAudioSystem();
    };
    
    // Music controls
    document.getElementById('music-play').onclick = () => this.playMusic('exploration');
    document.getElementById('music-stop').onclick = () => this.stopMusic();
    document.getElementById('music-next').onclick = () => this.nextTrack();
    
    // Mute button
    const muteBtn = document.getElementById('mute-all');
    muteBtn.onclick = () => {
      if (this.volumes.master > 0) {
        this.previousMasterVolume = this.volumes.master;
        this.volumes.master = 0;
        masterVol.value = 0;
        document.getElementById('master-vol-val').textContent = '0%';
        muteBtn.textContent = '🔊 UNMUTE ALL';
      } else {
        this.volumes.master = this.previousMasterVolume || 1.0;
        masterVol.value = this.volumes.master * 100;
        document.getElementById('master-vol-val').textContent = Math.round(this.volumes.master * 100) + '%';
        muteBtn.textContent = '🔇 MUTE ALL';
      }
      this.updateAudioSystem();
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // MUSIC MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  playMusic(trackName) {
    if (!this.musicTracks[trackName]) {
      console.warn('Unknown music track:', trackName);
      return;
    }
    
    const track = this.musicTracks[trackName];
    
    // Update UI
    document.getElementById('current-track').textContent = track.name;
    
    // In a real implementation, you'd load and play actual audio
    // For now, we'll just update state
    this.currentTrack = trackName;
    this.isMusicPlaying = true;
    
    console.log(`🎵 Now playing: ${track.name} (${track.tempo})`);
    
    // Simulate music with audioSystem
    if (this.audioSystem && this.audioSystem.initialized) {
      // Play ambient background sound
      this.audioSystem.playAmbient();
    }
  }
  
  stopMusic() {
    this.isMusicPlaying = false;
    this.currentTrack = null;
    document.getElementById('current-track').textContent = 'None';
    console.log('🎵 Music stopped');
  }
  
  nextTrack() {
    const tracks = Object.keys(this.musicTracks);
    const currentIndex = tracks.indexOf(this.currentTrack);
    const nextIndex = (currentIndex + 1) % tracks.length;
    this.playMusic(tracks[nextIndex]);
  }
  
  crossfadeTo(newTrack, duration = null) {
    const fadeDuration = duration || this.crossfadeDuration;
    
    // Fade out current track
    if (this.currentTrack) {
      console.log(`🎵 Crossfading: ${this.currentTrack} → ${newTrack} (${fadeDuration}s)`);
      // Implement smooth crossfade
      setTimeout(() => {
        this.playMusic(newTrack);
      }, fadeDuration * 500); // Halfway through fade
    } else {
      this.playMusic(newTrack);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // SOUND EFFECTS WITH COOLDOWN
  // ═══════════════════════════════════════════════════════════════════════
  
  playSound(soundName, position = null) {
    const now = Date.now();
    const lastPlayed = this.soundCooldowns.get(soundName);
    
    // Check cooldown
    if (lastPlayed && (now - lastPlayed) < this.minSoundInterval) {
      return; // Skip if played too recently
    }
    
    // Update cooldown
    this.soundCooldowns.set(soundName, now);
    
    // Play through audio system with adjusted volume
    if (this.audioSystem && this.audioSystem.initialized) {
      const effectiveVolume = this.volumes.master * this.volumes.sfx;
      
      // Route to appropriate audio system method
      switch(soundName) {
        case 'footstep':
          this.audioSystem.playFootstep(position);
          break;
        case 'hit':
        case 'sword':
          this.audioSystem.playSwordHit(position);
          break;
        case 'heal':
          this.audioSystem.playHeal();
          break;
        case 'hurt':
          this.audioSystem.playHurt();
          break;
        case 'pickup':
          this.audioSystem.playPickup();
          break;
        default:
          console.log(`🔊 Playing sound: ${soundName}`);
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CONTEXTUAL MUSIC
  // ═══════════════════════════════════════════════════════════════════════
  
  setMusicForContext(context) {
    const contextMusicMap = {
      'idle': 'exploration',
      'exploring': 'exploration',
      'combat': 'combat',
      'boss': 'boss',
      'victory': 'victory',
      'menu': 'menu'
    };
    
    const trackName = contextMusicMap[context] || 'exploration';
    
    if (this.currentTrack !== trackName) {
      this.crossfadeTo(trackName);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // VOLUME CONTROL
  // ═══════════════════════════════════════════════════════════════════════
  
  updateAudioSystem() {
    // Update audio system volumes based on master and category volumes
    if (this.audioSystem && this.audioSystem.masterGain) {
      this.audioSystem.masterGain.gain.value = this.volumes.master;
    }
  }
  
  setMasterVolume(volume) {
    this.volumes.master = Math.max(0, Math.min(1, volume));
    document.getElementById('master-vol').value = this.volumes.master * 100;
    document.getElementById('master-vol-val').textContent = Math.round(this.volumes.master * 100) + '%';
    this.updateAudioSystem();
  }
  
  setMusicVolume(volume) {
    this.volumes.music = Math.max(0, Math.min(1, volume));
    document.getElementById('music-vol').value = this.volumes.music * 100;
    document.getElementById('music-vol-val').textContent = Math.round(this.volumes.music * 100) + '%';
  }
  
  setSFXVolume(volume) {
    this.volumes.sfx = Math.max(0, Math.min(1, volume));
    document.getElementById('sfx-vol').value = this.volumes.sfx * 100;
    document.getElementById('sfx-vol-val').textContent = Math.round(this.volumes.sfx * 100) + '%';
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UI CONTROL
  // ═══════════════════════════════════════════════════════════════════════
  
  toggle() {
    if (this.panel.style.display === 'none') {
      this.panel.style.display = 'block';
    } else {
      this.panel.style.display = 'none';
    }
  }
  
  show() {
    this.panel.style.display = 'block';
  }
  
  hide() {
    this.panel.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedAudioController;
}
