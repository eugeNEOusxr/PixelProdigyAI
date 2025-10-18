// world_generation/combat_system.js
// Complete Combat System with melee, ranged, hit detection, and damage

/**
 * CombatStats - Character combat statistics
 */
class CombatStats {
  constructor(config = {}) {
    this.maxHealth = config.maxHealth || 100;
    this.health = config.health || this.maxHealth;
    this.maxStamina = config.maxStamina || 100;
    this.stamina = config.stamina || this.maxStamina;
    this.maxMana = config.maxMana || 100;
    this.mana = config.mana || this.maxMana;
    
    // Base stats
    this.attack = config.attack || 10;
    this.defense = config.defense || 5;
    this.speed = config.speed || 5;
    this.critChance = config.critChance || 0.1; // 10%
    this.critMultiplier = config.critMultiplier || 2.0;
    
    // Regeneration rates (per second)
    this.healthRegen = config.healthRegen || 1;
    this.staminaRegen = config.staminaRegen || 10;
    this.manaRegen = config.manaRegen || 5;
    
    // Status
    this.isAlive = true;
    this.isDead = false;
    this.statusEffects = [];
    
    // Callbacks
    this.onDamage = null;
    this.onHeal = null;
    this.onDeath = null;
  }

  takeDamage(amount, source = null) {
    if (this.isDead) return 0;
    
    const actualDamage = Math.max(0, amount - this.defense * 0.5);
    this.health = Math.max(0, this.health - actualDamage);
    
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.isAlive = false;
      if (this.onDeath) this.onDeath(source);
    }
    
    if (this.onDamage) this.onDamage(actualDamage, source);
    return actualDamage;
  }

  heal(amount) {
    if (this.isDead) return 0;
    
    const oldHealth = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    const healed = this.health - oldHealth;
    
    if (this.onHeal) this.onHeal(healed);
    return healed;
  }

  useStamina(amount) {
    if (this.stamina >= amount) {
      this.stamina -= amount;
      return true;
    }
    return false;
  }

  useMana(amount) {
    if (this.mana >= amount) {
      this.mana -= amount;
      return true;
    }
    return false;
  }

  regenerate(dt) {
    if (this.isDead) return;
    
    this.health = Math.min(this.maxHealth, this.health + this.healthRegen * dt);
    this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegen * dt);
    this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);
  }

  getHealthPercent() {
    return (this.health / this.maxHealth) * 100;
  }

  getStaminaPercent() {
    return (this.stamina / this.maxStamina) * 100;
  }

  getManaPercent() {
    return (this.mana / this.maxMana) * 100;
  }

  getTotalStats() {
    return {
      attack: this.attack,
      defense: this.defense,
      speed: this.speed,
      critChance: this.critChance,
      critMultiplier: this.critMultiplier
    };
  }

  applyEquipmentStats(equipmentStats) {
    // Apply bonus stats from equipment
    this.attack = 10 + (equipmentStats.attack || 0);
    this.defense = 5 + (equipmentStats.defense || 0);
    this.speed = 5 + (equipmentStats.speed || 0);
  }
}

/**
 * Attack - Represents a single attack action
 */
class Attack {
  constructor(config) {
    this.type = config.type || 'melee'; // melee, ranged, magic
    this.damage = config.damage || 10;
    this.range = config.range || 2; // meters
    this.staminaCost = config.staminaCost || 10;
    this.manaCost = config.manaCost || 0;
    this.cooldown = config.cooldown || 0.5; // seconds
    this.knockback = config.knockback || 0;
    this.hitboxSize = config.hitboxSize || 1;
    this.projectileSpeed = config.projectileSpeed || 20; // for ranged
    this.animation = config.animation || 'attack';
    this.lastUsed = 0;
  }

  canUse(combatStats, currentTime) {
    if (currentTime - this.lastUsed < this.cooldown) return false;
    if (this.staminaCost > 0 && combatStats.stamina < this.staminaCost) return false;
    if (this.manaCost > 0 && combatStats.mana < this.manaCost) return false;
    return true;
  }

  use(currentTime) {
    this.lastUsed = currentTime;
  }

  getCooldownPercent(currentTime) {
    const elapsed = currentTime - this.lastUsed;
    return Math.min(100, (elapsed / this.cooldown) * 100);
  }
}

/**
 * Projectile - Ranged attack projectile
 */
class Projectile {
  constructor(config) {
    this.position = config.position.clone();
    this.direction = config.direction.clone().normalize();
    this.speed = config.speed || 20;
    this.damage = config.damage || 10;
    this.owner = config.owner;
    this.range = config.range || 50;
    this.traveled = 0;
    this.active = true;
    this.mesh = config.mesh || null;
    this.onHit = config.onHit || null;
  }

  update(dt) {
    if (!this.active) return;
    
    const movement = this.direction.clone().multiplyScalar(this.speed * dt);
    this.position.add(movement);
    this.traveled += movement.length();
    
    if (this.mesh) {
      this.mesh.position.copy(this.position);
    }
    
    // Deactivate if traveled too far
    if (this.traveled >= this.range) {
      this.active = false;
    }
  }

  checkHit(target, hitRadius = 0.5) {
    if (!this.active || !target) return false;
    
    const distance = this.position.distanceTo(target);
    if (distance <= hitRadius) {
      this.active = false;
      if (this.onHit) this.onHit(target);
      return true;
    }
    return false;
  }

  destroy() {
    this.active = false;
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}

/**
 * HitDetection - Handles hit detection for melee and ranged
 */
class HitDetection {
  static checkMeleeHit(attacker, target, range = 2, angle = Math.PI / 3) {
    // Check if target is in front of attacker within range and angle
    const attackerPos = attacker.position || attacker;
    const targetPos = target.position || target;
    const attackerRot = attacker.rotation ? attacker.rotation.y : 0;
    
    const distance = attackerPos.distanceTo(targetPos);
    if (distance > range) return false;
    
    // Calculate angle to target
    const dx = targetPos.x - attackerPos.x;
    const dz = targetPos.z - attackerPos.z;
    const angleToTarget = Math.atan2(dx, dz);
    
    // Normalize angles
    let angleDiff = angleToTarget - attackerRot;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    return Math.abs(angleDiff) <= angle / 2;
  }

  static checkRangedHit(projectile, targets, hitRadius = 0.5) {
    const hits = [];
    for (let target of targets) {
      if (projectile.owner !== target && projectile.checkHit(target.position, hitRadius)) {
        hits.push(target);
      }
    }
    return hits;
  }

  static calculateDamage(attack, attackerStats, isCrit = false) {
    let baseDamage = attack.damage + attackerStats.attack;
    
    if (isCrit) {
      baseDamage *= attackerStats.critMultiplier;
    }
    
    // Add randomness (±10%)
    const variance = baseDamage * 0.1;
    baseDamage += (Math.random() - 0.5) * 2 * variance;
    
    return Math.round(baseDamage);
  }

  static rollCrit(critChance) {
    return Math.random() < critChance;
  }
}

/**
 * CombatController - Main combat system controller
 */
class CombatController {
  constructor(character, stats) {
    this.character = character;
    this.stats = stats;
    this.attacks = new Map();
    this.activeProjectiles = [];
    this.targets = [];
    this.isAttacking = false;
    this.currentAttack = null;
    this.attackAnimationTime = 0;
    this.comboCount = 0;
    this.lastAttackTime = 0;
    this.comboWindow = 1.0; // 1 second combo window
    
    // Setup default attacks
    this.setupDefaultAttacks();
  }

  setupDefaultAttacks() {
    // Light melee attack
    this.addAttack('melee_light', new Attack({
      type: 'melee',
      damage: 10,
      range: 2,
      staminaCost: 10,
      cooldown: 0.5,
      animation: 'attack_light'
    }));

    // Heavy melee attack
    this.addAttack('melee_heavy', new Attack({
      type: 'melee',
      damage: 25,
      range: 2.5,
      staminaCost: 25,
      cooldown: 1.5,
      knockback: 5,
      animation: 'attack_heavy'
    }));

    // Ranged attack
    this.addAttack('ranged', new Attack({
      type: 'ranged',
      damage: 15,
      range: 50,
      staminaCost: 15,
      cooldown: 1.0,
      projectileSpeed: 30,
      animation: 'attack_ranged'
    }));

    // Magic attack
    this.addAttack('magic', new Attack({
      type: 'magic',
      damage: 30,
      range: 40,
      manaCost: 20,
      cooldown: 2.0,
      projectileSpeed: 25,
      animation: 'attack_magic'
    }));
  }

  addAttack(name, attack) {
    this.attacks.set(name, attack);
  }

  performAttack(attackName, currentTime, scene = null) {
    const attack = this.attacks.get(attackName);
    if (!attack || !attack.canUse(this.stats, currentTime)) {
      return false;
    }

    // Use resources
    if (attack.staminaCost > 0) this.stats.useStamina(attack.staminaCost);
    if (attack.manaCost > 0) this.stats.useMana(attack.manaCost);
    
    attack.use(currentTime);
    this.isAttacking = true;
    this.currentAttack = attack;
    this.attackAnimationTime = 0;
    
    // Update combo
    if (currentTime - this.lastAttackTime < this.comboWindow) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastAttackTime = currentTime;

    // Handle attack type
    if (attack.type === 'melee') {
      this.performMeleeAttack(attack, currentTime);
    } else if (attack.type === 'ranged' || attack.type === 'magic') {
      this.performRangedAttack(attack, currentTime, scene);
    }

    return true;
  }

  performMeleeAttack(attack, currentTime) {
    // Check for hits on all targets in range
    const isCrit = HitDetection.rollCrit(this.stats.critChance);
    const damage = HitDetection.calculateDamage(attack, this.stats, isCrit);
    
    for (let target of this.targets) {
      if (HitDetection.checkMeleeHit(this.character, target, attack.range)) {
        if (target.combatStats) {
          target.combatStats.takeDamage(damage, this.character);
          
          // Apply knockback
          if (attack.knockback > 0 && target.applyKnockback) {
            const direction = new THREE.Vector3()
              .subVectors(target.position, this.character.position)
              .normalize();
            target.applyKnockback(direction, attack.knockback);
          }
        }
      }
    }
  }

  performRangedAttack(attack, currentTime, scene) {
    // Create projectile
    const position = this.character.position.clone();
    position.y += 1.5; // Spawn at chest height
    
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.character.rotation.y);
    
    // Create projectile mesh
    let projectileMesh = null;
    if (scene) {
      const geometry = attack.type === 'magic' 
        ? new THREE.SphereGeometry(0.2, 16, 16)
        : new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: attack.type === 'magic' ? 0x9966ff : 0xffaa00,
        emissive: attack.type === 'magic' ? 0x9966ff : 0xffaa00
      });
      projectileMesh = new THREE.Mesh(geometry, material);
      projectileMesh.position.copy(position);
      scene.add(projectileMesh);
    }

    const projectile = new Projectile({
      position: position,
      direction: direction,
      speed: attack.projectileSpeed,
      damage: attack.damage,
      range: attack.range,
      owner: this.character,
      mesh: projectileMesh,
      onHit: (target) => {
        const isCrit = HitDetection.rollCrit(this.stats.critChance);
        const damage = HitDetection.calculateDamage(attack, this.stats, isCrit);
        if (target.combatStats) {
          target.combatStats.takeDamage(damage, this.character);
        }
      }
    });

    this.activeProjectiles.push(projectile);
  }

  update(dt, currentTime) {
    // Regenerate stats
    this.stats.regenerate(dt);

    // Update attack animation
    if (this.isAttacking) {
      this.attackAnimationTime += dt;
      if (this.attackAnimationTime > 0.5) { // Animation duration
        this.isAttacking = false;
        this.currentAttack = null;
      }
    }

    // Update projectiles
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i];
      projectile.update(dt);

      // Check hits against targets
      for (let target of this.targets) {
        if (target !== this.character) {
          projectile.checkHit(target.position, 0.5);
        }
      }

      // Remove inactive projectiles
      if (!projectile.active) {
        projectile.destroy();
        this.activeProjectiles.splice(i, 1);
      }
    }

    // Reset combo if too much time passed
    if (currentTime - this.lastAttackTime > this.comboWindow) {
      this.comboCount = 0;
    }
  }

  addTarget(target) {
    if (!this.targets.includes(target)) {
      this.targets.push(target);
    }
  }

  removeTarget(target) {
    const index = this.targets.indexOf(target);
    if (index !== -1) {
      this.targets.splice(index, 1);
    }
  }

  getAttackCooldown(attackName, currentTime) {
    const attack = this.attacks.get(attackName);
    return attack ? attack.getCooldownPercent(currentTime) : 100;
  }
}

// Export classes
if (typeof window !== 'undefined') {
  window.CombatStats = CombatStats;
  window.Attack = Attack;
  window.Projectile = Projectile;
  window.HitDetection = HitDetection;
  window.CombatController = CombatController;
}
