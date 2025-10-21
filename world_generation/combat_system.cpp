/**
 * PIXELVERSE COMBAT SYSTEM (C++)
 * =======================================================================
 * High-performance combat engine with AI-driven behaviors
 * - Real-time damage calculation
 * - Status effects and buffs
 * - Combo system
 * - AI decision making
 * - Physics-based collision
 * =======================================================================
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>
#include <memory>
#include <random>
#include <chrono>
#include <algorithm>
#include <cmath>

namespace pixelverse {

// ==========================================
// ENUMS & CONSTANTS
// ==========================================

enum class DamageType {
    Physical,
    Magical,
    Fire,
    Ice,
    Lightning,
    Poison,
    Holy,
    Dark
};

enum class StatusEffect {
    None,
    Burning,
    Frozen,
    Stunned,
    Poisoned,
    Bleeding,
    Blessed,
    Cursed,
    Enraged,
    Shielded
};

enum class CombatState {
    Idle,
    Attacking,
    Defending,
    Dodging,
    Casting,
    Stunned,
    Dead
};

enum class AIPersonality {
    Aggressive,     // High offense, low defense
    Defensive,      // High defense, wait for openings
    Balanced,       // Mix of offense and defense
    Tactical,       // Uses abilities strategically
    Chaotic,        // Unpredictable patterns
    Berserker,      // Increasing aggression as health drops
    Calculated      // Analyzes weaknesses
};

// ==========================================
// COMBAT STATS
// ==========================================

struct CombatStats {
    float health;
    float maxHealth;
    float mana;
    float maxMana;
    float stamina;
    float maxStamina;
    
    // Offensive stats
    float attackPower;
    float magicPower;
    float criticalChance;
    float criticalMultiplier;
    float attackSpeed;
    
    // Defensive stats
    float defense;
    float magicResist;
    float dodgeChance;
    float blockChance;
    
    // Resistances (0.0 - 1.0, where 1.0 = immune)
    std::unordered_map<DamageType, float> resistances;
    
    CombatStats() : 
        health(100), maxHealth(100),
        mana(100), maxMana(100),
        stamina(100), maxStamina(100),
        attackPower(10), magicPower(10),
        criticalChance(0.05f), criticalMultiplier(1.5f),
        attackSpeed(1.0f), defense(5), magicResist(5),
        dodgeChance(0.05f), blockChance(0.05f) {
        
        // Default resistances
        resistances[DamageType::Physical] = 0.0f;
        resistances[DamageType::Magical] = 0.0f;
        resistances[DamageType::Fire] = 0.0f;
        resistances[DamageType::Ice] = 0.0f;
        resistances[DamageType::Lightning] = 0.0f;
        resistances[DamageType::Poison] = 0.0f;
        resistances[DamageType::Holy] = 0.0f;
        resistances[DamageType::Dark] = 0.0f;
    }
};

// ==========================================
// COMBAT ABILITY
// ==========================================

struct CombatAbility {
    std::string id;
    std::string name;
    DamageType damageType;
    float baseDamage;
    float manaCost;
    float staminaCost;
    float cooldown;
    float castTime;
    float range;
    StatusEffect inflictsStatus;
    float statusDuration;
    bool isAOE;
    float aoeRadius;
    
    CombatAbility(const std::string& _id, const std::string& _name,
                  DamageType _type, float _damage, float _mana, float _cooldown)
        : id(_id), name(_name), damageType(_type), baseDamage(_damage),
          manaCost(_mana), staminaCost(0), cooldown(_cooldown),
          castTime(0), range(5.0f), inflictsStatus(StatusEffect::None),
          statusDuration(0), isAOE(false), aoeRadius(0) {}
};

// ==========================================
// ACTIVE STATUS EFFECT
// ==========================================

struct ActiveStatus {
    StatusEffect type;
    float duration;
    float tickDamage;
    float lastTick;
    
    ActiveStatus(StatusEffect _type, float _duration, float _tickDmg = 0)
        : type(_type), duration(_duration), tickDamage(_tickDmg), lastTick(0) {}
};

// ==========================================
// COMBAT ENTITY
// ==========================================

class CombatEntity {
public:
    std::string entityId;
    std::string name;
    CombatStats stats;
    CombatState state;
    AIPersonality personality;
    
    // Position
    float x, y, z;
    float facingAngle;
    
    // Status effects
    std::vector<ActiveStatus> activeStatuses;
    
    // Abilities
    std::vector<CombatAbility> abilities;
    std::unordered_map<std::string, float> abilityCooldowns;
    
    // Combat tracking
    float comboCounter;
    float lastAttackTime;
    std::string targetId;
    
    CombatEntity(const std::string& id, const std::string& _name, AIPersonality ai)
        : entityId(id), name(_name), personality(ai), state(CombatState::Idle),
          x(0), y(0), z(0), facingAngle(0), comboCounter(0), lastAttackTime(0) {}
    
    bool isAlive() const {
        return stats.health > 0 && state != CombatState::Dead;
    }
    
    float getHealthPercent() const {
        return stats.health / stats.maxHealth;
    }
    
    bool canUseAbility(const CombatAbility& ability) const {
        if (stats.mana < ability.manaCost) return false;
        if (stats.stamina < ability.staminaCost) return false;
        
        auto it = abilityCooldowns.find(ability.id);
        if (it != abilityCooldowns.end() && it->second > 0) return false;
        
        return true;
    }
    
    void addStatusEffect(StatusEffect status, float duration, float tickDamage = 0) {
        activeStatuses.emplace_back(status, duration, tickDamage);
    }
    
    bool hasStatus(StatusEffect status) const {
        return std::any_of(activeStatuses.begin(), activeStatuses.end(),
                          [status](const ActiveStatus& s) { return s.type == status; });
    }
};

// ==========================================
// DAMAGE CALCULATION
// ==========================================

struct DamageResult {
    float damage;
    bool isCritical;
    bool isDodged;
    bool isBlocked;
    DamageType type;
    std::string message;
};

class CombatEngine {
private:
    std::mt19937 rng;
    std::uniform_real_distribution<float> dist{0.0f, 1.0f};
    
public:
    CombatEngine() {
        auto seed = std::chrono::steady_clock::now().time_since_epoch().count();
        rng.seed(static_cast<unsigned int>(seed));
    }
    
    DamageResult calculateDamage(CombatEntity& attacker, CombatEntity& defender,
                                 const CombatAbility& ability) {
        DamageResult result;
        result.type = ability.damageType;
        result.isCritical = false;
        result.isDodged = false;
        result.isBlocked = false;
        
        // Check dodge
        if (dist(rng) < defender.stats.dodgeChance) {
            result.isDodged = true;
            result.damage = 0;
            result.message = defender.name + " dodged!";
            return result;
        }
        
        // Check block
        if (dist(rng) < defender.stats.blockChance) {
            result.isBlocked = true;
            result.damage = 0;
            result.message = defender.name + " blocked!";
            return result;
        }
        
        // Calculate base damage
        float baseDmg = ability.baseDamage;
        if (ability.damageType == DamageType::Physical) {
            baseDmg += attacker.stats.attackPower;
        } else {
            baseDmg += attacker.stats.magicPower;
        }
        
        // Apply combo multiplier
        if (attacker.comboCounter > 0) {
            baseDmg *= (1.0f + (attacker.comboCounter * 0.1f)); // +10% per combo
        }
        
        // Check critical hit
        if (dist(rng) < attacker.stats.criticalChance) {
            result.isCritical = true;
            baseDmg *= attacker.stats.criticalMultiplier;
        }
        
        // Apply defense
        float defense = (ability.damageType == DamageType::Physical) 
                       ? defender.stats.defense 
                       : defender.stats.magicResist;
        float damageReduction = defense / (defense + 100.0f);
        baseDmg *= (1.0f - damageReduction);
        
        // Apply resistance
        float resistance = defender.stats.resistances[ability.damageType];
        baseDmg *= (1.0f - resistance);
        
        // Random variance (±10%)
        baseDmg *= (0.9f + dist(rng) * 0.2f);
        
        result.damage = std::max(1.0f, baseDmg);
        result.message = attacker.name + " dealt " + std::to_string(static_cast<int>(result.damage)) 
                        + " damage!";
        
        if (result.isCritical) {
            result.message += " CRITICAL HIT!";
        }
        
        return result;
    }
    
    void applyDamage(CombatEntity& defender, const DamageResult& result) {
        defender.stats.health -= result.damage;
        if (defender.stats.health <= 0) {
            defender.stats.health = 0;
            defender.state = CombatState::Dead;
        }
    }
    
    void updateStatusEffects(CombatEntity& entity, float deltaTime) {
        for (auto it = entity.activeStatuses.begin(); it != entity.activeStatuses.end();) {
            it->duration -= deltaTime;
            it->lastTick += deltaTime;
            
            // Apply damage over time
            if (it->tickDamage > 0 && it->lastTick >= 1.0f) {
                entity.stats.health -= it->tickDamage;
                it->lastTick = 0;
                std::cout << "[Status] " << entity.name << " took " 
                         << it->tickDamage << " damage from status effect\n";
            }
            
            // Apply status effects
            switch (it->type) {
                case StatusEffect::Frozen:
                    entity.stats.attackSpeed *= 0.5f; // Slow attack speed
                    break;
                case StatusEffect::Enraged:
                    entity.stats.attackPower *= 1.3f; // Increase damage
                    break;
                case StatusEffect::Shielded:
                    entity.stats.defense *= 1.5f; // Increase defense
                    break;
                default:
                    break;
            }
            
            if (it->duration <= 0) {
                it = entity.activeStatuses.erase(it);
            } else {
                ++it;
            }
        }
    }
    
    void updateCooldowns(CombatEntity& entity, float deltaTime) {
        for (auto& [abilityId, cooldown] : entity.abilityCooldowns) {
            cooldown = std::max(0.0f, cooldown - deltaTime);
        }
    }
    
    void regenerateResources(CombatEntity& entity, float deltaTime) {
        // Health regeneration (1% per second when not in combat)
        if (entity.state == CombatState::Idle) {
            entity.stats.health = std::min(entity.stats.maxHealth,
                                          entity.stats.health + entity.stats.maxHealth * 0.01f * deltaTime);
        }
        
        // Mana regeneration (2% per second)
        entity.stats.mana = std::min(entity.stats.maxMana,
                                    entity.stats.mana + entity.stats.maxMana * 0.02f * deltaTime);
        
        // Stamina regeneration (5% per second)
        entity.stats.stamina = std::min(entity.stats.maxStamina,
                                       entity.stats.stamina + entity.stats.maxStamina * 0.05f * deltaTime);
    }
    
    // AI Decision Making
    CombatAbility* selectAbilityAI(CombatEntity& entity, const CombatEntity& target) {
        std::vector<CombatAbility*> usableAbilities;
        
        for (auto& ability : entity.abilities) {
            if (entity.canUseAbility(ability)) {
                usableAbilities.push_back(&ability);
            }
        }
        
        if (usableAbilities.empty()) return nullptr;
        
        // AI personality-based selection
        switch (entity.personality) {
            case AIPersonality::Aggressive:
                // Always pick highest damage ability
                return *std::max_element(usableAbilities.begin(), usableAbilities.end(),
                    [](CombatAbility* a, CombatAbility* b) { return a->baseDamage < b->baseDamage; });
                
            case AIPersonality::Defensive:
                // Pick abilities when enemy is close or health is low
                if (entity.getHealthPercent() < 0.5f) {
                    // Use defensive abilities or healing
                    return usableAbilities[0];
                }
                break;
                
            case AIPersonality::Tactical:
                // Exploit weaknesses based on target resistances
                {
                    float lowestResist = 1.0f;
                    CombatAbility* bestAbility = usableAbilities[0];
                    for (auto* ability : usableAbilities) {
                        float resist = target.stats.resistances.at(ability->damageType);
                        if (resist < lowestResist) {
                            lowestResist = resist;
                            bestAbility = ability;
                        }
                    }
                    return bestAbility;
                }
                
            case AIPersonality::Berserker:
                // More aggressive as health drops
                if (entity.getHealthPercent() < 0.3f) {
                    entity.stats.attackPower *= 1.5f; // Rage boost
                }
                return usableAbilities[dist(rng) * usableAbilities.size()];
                
            case AIPersonality::Chaotic:
                // Random selection
                return usableAbilities[static_cast<size_t>(dist(rng) * usableAbilities.size())];
                
            default:
                // Balanced approach
                return usableAbilities[0];
        }
        
        return usableAbilities[0];
    }
};

} // namespace pixelverse

// ==========================================
// DEMO / TEST HARNESS
// ==========================================

#ifdef PIXELVERSE_COMBAT_DEMO
int main() {
    using namespace pixelverse;
    
    std::cout << "╔════════════════════════════════════════════════════════════╗\n";
    std::cout << "║           PIXELVERSE COMBAT SYSTEM TEST                    ║\n";
    std::cout << "╚════════════════════════════════════════════════════════════╝\n\n";
    
    CombatEngine engine;
    
    // Create combatants
    CombatEntity hero("hero_001", "Warrior", AIPersonality::Aggressive);
    hero.stats.health = 150;
    hero.stats.maxHealth = 150;
    hero.stats.attackPower = 20;
    hero.stats.criticalChance = 0.15f;
    
    CombatEntity villain("villain_001", "Dark Mage", AIPersonality::Tactical);
    villain.stats.health = 120;
    villain.stats.maxHealth = 120;
    villain.stats.magicPower = 25;
    villain.stats.resistances[DamageType::Physical] = 0.3f; // 30% physical resist
    
    // Add abilities
    hero.abilities.emplace_back("slash", "Power Slash", DamageType::Physical, 30, 10, 3.0f);
    hero.abilities.emplace_back("charge", "Shield Charge", DamageType::Physical, 40, 20, 5.0f);
    
    villain.abilities.emplace_back("fireball", "Fireball", DamageType::Fire, 35, 15, 4.0f);
    villain.abilities.emplace_back("lightning", "Chain Lightning", DamageType::Lightning, 45, 25, 6.0f);
    
    // Combat simulation
    std::cout << "⚔️  COMBAT START!\n";
    std::cout << hero.name << " (HP: " << hero.stats.health << ") vs " 
              << villain.name << " (HP: " << villain.stats.health << ")\n\n";
    
    int round = 1;
    while (hero.isAlive() && villain.isAlive() && round <= 10) {
        std::cout << "--- Round " << round << " ---\n";
        
        // Hero's turn
        auto* heroAbility = engine.selectAbilityAI(hero, villain);
        if (heroAbility) {
            auto result = engine.calculateDamage(hero, villain, *heroAbility);
            std::cout << result.message << "\n";
            engine.applyDamage(villain, result);
            hero.comboCounter++;
        }
        
        if (!villain.isAlive()) break;
        
        // Villain's turn
        auto* villainAbility = engine.selectAbilityAI(villain, hero);
        if (villainAbility) {
            auto result = engine.calculateDamage(villain, hero, *villainAbility);
            std::cout << result.message << "\n";
            engine.applyDamage(hero, result);
            villain.comboCounter++;
        }
        
        std::cout << "  " << hero.name << " HP: " << hero.stats.health << "/" << hero.stats.maxHealth << "\n";
        std::cout << "  " << villain.name << " HP: " << villain.stats.health << "/" << villain.stats.maxHealth << "\n\n";
        
        // Update cooldowns
        engine.updateCooldowns(hero, 1.0f);
        engine.updateCooldowns(villain, 1.0f);
        
        round++;
    }
    
    std::cout << "\n🏆 COMBAT END!\n";
    if (hero.isAlive()) {
        std::cout << "WINNER: " << hero.name << " with " << hero.stats.health << " HP remaining!\n";
    } else {
        std::cout << "WINNER: " << villain.name << " with " << villain.stats.health << " HP remaining!\n";
    }
    
    return 0;
}
#endif
