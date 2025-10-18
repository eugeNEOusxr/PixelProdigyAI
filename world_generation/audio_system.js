// world_generation/audio_system.js
// Sound & Music System - 3D audio, sound effects, ambient music, footsteps, combat sounds

/**
 * SoundEffect - Individual sound effect with 3D positioning
 */
class SoundEffect {
  constructor(audioContext, config) {
    this.audioContext = audioContext;
    this.url = config.url;
    this.volume = config.volume || 1.0;
    this.loop = config.loop || false;
    this.is3D = config.is3D || false;
    this.buffer = null;
    this.source = null;
    this.gainNode = null;
    this.panner = null;
    this.isPlaying = false;
    this.onEnded = null;
  }

  async load() {
    if (this.buffer) return true;
    
    try {
      // For demo purposes, we'll create synthetic sounds
      // In production, you'd load actual audio files
      this.buffer = this.createSyntheticSound();
      return true;
    } catch (error) {
      console.error('Failed to load sound:', this.url, error);
      return false;
    }
  }

  createSyntheticSound() {
    // Create a simple synthetic sound for demo
    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate a simple tone/noise based on sound type
    if (this.url.includes('footstep')) {
      // Low frequency thump
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() - 0.5) * Math.exp(-i / (sampleRate * 0.1));
      }
    } else if (this.url.includes('sword') || this.url.includes('hit')) {
      // Sharp metallic sound
      for (let i = 0; i < length; i++) {
        data[i] = Math.sin(i * 0.1) * Math.exp(-i / (sampleRate * 0.05));
      }
    } else if (this.url.includes('heal')) {
      // Gentle chime
      for (let i = 0; i < length; i++) {
        data[i] = Math.sin(i * 0.05) * Math.exp(-i / (sampleRate * 0.3));
      }
    } else {
      // Generic sound
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() - 0.5) * 0.3;
      }
    }
    
    return buffer;
  }

  play(position = null) {
    if (!this.buffer) {
      console.warn('Sound not loaded:', this.url);
      return;
    }

    // Stop previous instance if playing
    this.stop();

    // Create source
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = this.loop;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.volume;

    // Connect nodes
    this.source.connect(this.gainNode);

    if (this.is3D && position) {
      // Create 3D panner
      this.panner = this.audioContext.createPanner();
      this.panner.panningModel = 'HRTF';
      this.panner.distanceModel = 'inverse';
      this.panner.refDistance = 1;
      this.panner.maxDistance = 50;
      this.panner.rolloffFactor = 1;
      this.panner.coneInnerAngle = 360;
      this.panner.coneOuterAngle = 0;
      this.panner.coneOuterGain = 0;

      this.setPosition(position);
      
      this.gainNode.connect(this.panner);
      this.panner.connect(this.audioContext.destination);
    } else {
      this.gainNode.connect(this.audioContext.destination);
    }

    // Play
    this.source.start(0);
    this.isPlaying = true;

    // Handle end
    this.source.onended = () => {
      this.isPlaying = false;
      if (this.onEnded) this.onEnded();
    };
  }

  stop() {
    if (this.source && this.isPlaying) {
      try {
        this.source.stop();
      } catch (e) {
        // Already stopped
      }
      this.isPlaying = false;
    }
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  setPosition(position) {
    if (this.panner && position) {
      this.panner.setPosition(position.x, position.y, position.z);
    }
  }
}

/**
 * MusicTrack - Background music track with crossfading
 */
class MusicTrack {
  constructor(audioContext, config) {
    this.audioContext = audioContext;
    this.url = config.url;
    this.volume = config.volume || 0.5;
    this.buffer = null;
    this.source = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.fadeInDuration = 2.0;
    this.fadeOutDuration = 2.0;
  }

  async load() {
    if (this.buffer) return true;
    
    // Create looping ambient music (synthetic)
    this.buffer = this.createAmbientMusic();
    return true;
  }

  createAmbientMusic() {
    // Create a simple ambient loop
    const duration = 10.0; // 10 second loop
    const sampleRate = this.audioContext.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(2, length, sampleRate);
    
    // Generate ambient drone
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Layered sine waves for ambient effect
        data[i] = 
          Math.sin(t * Math.PI * 2 * 110) * 0.1 +
          Math.sin(t * Math.PI * 2 * 165) * 0.08 +
          Math.sin(t * Math.PI * 2 * 220) * 0.06 +
          (Math.random() - 0.5) * 0.02;
      }
    }
    
    return buffer;
  }

  play() {
    if (!this.buffer || this.isPlaying) return;

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0; // Start silent for fade in

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.source.start(0);
    this.isPlaying = true;

    // Fade in
    this.fadeIn();
  }

  fadeIn() {
    if (!this.gainNode) return;
    
    const currentTime = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(currentTime);
    this.gainNode.gain.setValueAtTime(0, currentTime);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, currentTime + this.fadeInDuration);
  }

  fadeOut(callback) {
    if (!this.gainNode) return;
    
    const currentTime = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, currentTime + this.fadeOutDuration);

    setTimeout(() => {
      this.stop();
      if (callback) callback();
    }, this.fadeOutDuration * 1000);
  }

  stop() {
    if (this.source && this.isPlaying) {
      try {
        this.source.stop();
      } catch (e) {
        // Already stopped
      }
      this.isPlaying = false;
    }
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.gainNode && this.isPlaying) {
      const currentTime = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.5);
    }
  }
}

/**
 * FootstepManager - Procedural footstep sounds based on movement
 */
class FootstepManager {
  constructor(audioSystem) {
    this.audioSystem = audioSystem;
    this.stepInterval = 0.5; // seconds between steps
    this.stepAccumulator = 0;
    this.lastSurface = 'ground';
    this.isMoving = false;
  }

  update(dt, velocity, position) {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    this.isMoving = speed > 0.1;

    if (!this.isMoving) {
      this.stepAccumulator = 0;
      return;
    }

    // Adjust step rate based on speed
    const speedMultiplier = Math.min(speed / 5, 2); // Faster steps when sprinting
    const currentInterval = this.stepInterval / speedMultiplier;

    this.stepAccumulator += dt;

    if (this.stepAccumulator >= currentInterval) {
      this.playFootstep(position);
      this.stepAccumulator = 0;
    }
  }

  playFootstep(position) {
    // Alternate between left/right foot (subtle volume variation)
    const volume = 0.3 + Math.random() * 0.1;
    this.audioSystem.playSound('footstep', position, volume);
  }

  setSurface(surface) {
    this.lastSurface = surface;
    // Could load different footstep sounds per surface type
  }
}

/**
 * AudioSystem - Main audio manager
 */
class AudioSystem {
  constructor(listener) {
    this.listener = listener; // THREE.js camera for 3D audio
    this.audioContext = null;
    this.sounds = new Map();
    this.music = new Map();
    this.currentMusic = null;
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.musicVolume = 0.5;
    this.footstepManager = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create AudioContext (requires user interaction)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create listener (for 3D audio)
      if (this.audioContext.listener) {
        // Set initial listener position
        this.updateListener(this.listener.position, this.listener.quaternion);
      }

      // Load default sounds
      await this.loadDefaultSounds();
      
      // Create footstep manager
      this.footstepManager = new FootstepManager(this);

      this.initialized = true;
      console.log('🔊 Audio System initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  async loadDefaultSounds() {
    // Define default sound library
    const soundList = [
      { id: 'footstep', url: 'sounds/footstep.mp3', volume: 0.3, is3D: true },
      { id: 'sword_swing', url: 'sounds/sword_swing.mp3', volume: 0.5, is3D: true },
      { id: 'sword_hit', url: 'sounds/sword_hit.mp3', volume: 0.6, is3D: true },
      { id: 'arrow_shoot', url: 'sounds/arrow_shoot.mp3', volume: 0.4, is3D: true },
      { id: 'arrow_hit', url: 'sounds/arrow_hit.mp3', volume: 0.5, is3D: true },
      { id: 'heal', url: 'sounds/heal.mp3', volume: 0.5, is3D: false },
      { id: 'hurt', url: 'sounds/hurt.mp3', volume: 0.6, is3D: false },
      { id: 'item_pickup', url: 'sounds/item_pickup.mp3', volume: 0.4, is3D: false },
      { id: 'door_open', url: 'sounds/door_open.mp3', volume: 0.5, is3D: true },
      { id: 'door_close', url: 'sounds/door_close.mp3', volume: 0.5, is3D: true },
      { id: 'enemy_death', url: 'sounds/enemy_death.mp3', volume: 0.6, is3D: true },
      { id: 'level_up', url: 'sounds/level_up.mp3', volume: 0.7, is3D: false },
      { id: 'ui_click', url: 'sounds/ui_click.mp3', volume: 0.3, is3D: false },
      { id: 'quest_complete', url: 'sounds/quest_complete.mp3', volume: 0.6, is3D: false }
    ];

    // Load all sounds
    for (const soundConfig of soundList) {
      const sound = new SoundEffect(this.audioContext, soundConfig);
      await sound.load();
      this.sounds.set(soundConfig.id, sound);
    }

    // Load music tracks
    const musicList = [
      { id: 'ambient_day', url: 'music/ambient_day.mp3', volume: 0.3 },
      { id: 'ambient_night', url: 'music/ambient_night.mp3', volume: 0.3 },
      { id: 'combat', url: 'music/combat.mp3', volume: 0.4 },
      { id: 'menu', url: 'music/menu.mp3', volume: 0.3 }
    ];

    for (const musicConfig of musicList) {
      const track = new MusicTrack(this.audioContext, musicConfig);
      await track.load();
      this.music.set(musicConfig.id, track);
    }

    console.log(`Loaded ${this.sounds.size} sounds and ${this.music.size} music tracks`);
  }

  playSound(soundId, position = null, volumeMultiplier = 1.0) {
    if (!this.initialized) return;

    const sound = this.sounds.get(soundId);
    if (!sound) {
      console.warn('Sound not found:', soundId);
      return;
    }

    // Create new instance for overlapping sounds
    const instance = new SoundEffect(this.audioContext, {
      url: sound.url,
      volume: sound.volume * volumeMultiplier * this.sfxVolume * this.masterVolume,
      loop: sound.loop,
      is3D: sound.is3D
    });
    instance.buffer = sound.buffer;
    instance.play(position);
  }

  playMusic(trackId) {
    if (!this.initialized) return;

    const track = this.music.get(trackId);
    if (!track) {
      console.warn('Music track not found:', trackId);
      return;
    }

    // Crossfade if music is already playing
    if (this.currentMusic && this.currentMusic !== track) {
      this.currentMusic.fadeOut(() => {
        track.setVolume(this.musicVolume * this.masterVolume);
        track.play();
        this.currentMusic = track;
      });
    } else {
      track.setVolume(this.musicVolume * this.masterVolume);
      track.play();
      this.currentMusic = track;
    }
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.fadeOut();
      this.currentMusic = null;
    }
  }

  updateListener(position, quaternion) {
    if (!this.initialized || !this.audioContext.listener) return;

    const listener = this.audioContext.listener;

    // Update position
    if (listener.positionX) {
      // Modern API
      listener.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
      listener.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
      listener.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
    } else {
      // Legacy API
      listener.setPosition(position.x, position.y, position.z);
    }

    // Update orientation
    const forward = new THREE.Vector3(0, 0, -1);
    const up = new THREE.Vector3(0, 1, 0);
    forward.applyQuaternion(quaternion);
    up.applyQuaternion(quaternion);

    if (listener.forwardX) {
      // Modern API
      listener.forwardX.setValueAtTime(forward.x, this.audioContext.currentTime);
      listener.forwardY.setValueAtTime(forward.y, this.audioContext.currentTime);
      listener.forwardZ.setValueAtTime(forward.z, this.audioContext.currentTime);
      listener.upX.setValueAtTime(up.x, this.audioContext.currentTime);
      listener.upY.setValueAtTime(up.y, this.audioContext.currentTime);
      listener.upZ.setValueAtTime(up.z, this.audioContext.currentTime);
    } else {
      // Legacy API
      listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  update(dt, velocity, position) {
    if (!this.initialized) return;

    // Update listener position based on camera
    this.updateListener(this.listener.position, this.listener.quaternion);

    // Update footsteps
    if (this.footstepManager) {
      this.footstepManager.update(dt, velocity, position);
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    // Update current music volume
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }
  }

  getMasterVolume() { return this.masterVolume; }
  getSFXVolume() { return this.sfxVolume; }
  getMusicVolume() { return this.musicVolume; }

  // Utility methods for common game sounds
  playFootstep(position) {
    this.playSound('footstep', position);
  }

  playSwordSwing(position) {
    this.playSound('sword_swing', position);
  }

  playSwordHit(position) {
    this.playSound('sword_hit', position);
  }

  playArrowShoot(position) {
    this.playSound('arrow_shoot', position);
  }

  playArrowHit(position) {
    this.playSound('arrow_hit', position);
  }

  playHeal() {
    this.playSound('heal');
  }

  playHurt() {
    this.playSound('hurt');
  }

  playItemPickup() {
    this.playSound('item_pickup');
  }

  playDoorOpen(position) {
    this.playSound('door_open', position);
  }

  playDoorClose(position) {
    this.playSound('door_close', position);
  }

  playEnemyDeath(position) {
    this.playSound('enemy_death', position);
  }

  playLevelUp() {
    this.playSound('level_up');
  }

  playUIClick() {
    this.playSound('ui_click');
  }

  playQuestComplete() {
    this.playSound('quest_complete');
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.SoundEffect = SoundEffect;
  window.MusicTrack = MusicTrack;
  window.FootstepManager = FootstepManager;
  window.AudioSystem = AudioSystem;
}
