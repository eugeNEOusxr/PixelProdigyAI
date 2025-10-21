#!/usr/bin/env python3
"""
SkyRelics Gaming Object Generator
Creates legendary gaming weapons, armor, and items with subscription tiers
"""

import json
import random
from pathlib import Path
from typing import Dict, List

class SkyRelicsGenerator:
    """Generates gaming objects with FREE/PREMIUM/PRO tiers"""
    
    def __init__(self):
        self.weapon_types = [
            'sword', 'greatsword', 'dagger', 'axe', 'warhammer',
            'spear', 'bow', 'crossbow', 'staff', 'wand',
            'rifle', 'pistol', 'shotgun', 'plasma_cannon', 'laser_sword'
        ]
        
        self.armor_types = [
            'helmet', 'chest', 'gloves', 'boots', 'shield',
            'cape', 'pauldrons', 'greaves', 'bracers', 'belt'
        ]
        
        self.materials = {
            'basic': ['iron', 'bronze', 'copper', 'wood', 'leather'],
            'premium': ['steel', 'mithril', 'gold', 'dragon-scale', 'obsidian'],
            'pro': ['adamantium', 'celestial-steel', 'void-metal', 'star-iron', 'ethereal-crystal']
        }
        
        self.effects = {
            'premium': ['glowing', 'smoking', 'sparkling', 'pulsing'],
            'pro': ['flames', 'frost', 'lightning', 'shadow', 'holy-light', 'void-energy']
        }
    
    def generate_legendary_sword_pro(self):
        """PRO TIER: Legendary Sword of the Celestial Dragon"""
        return {
            'tier': 'PRO',
            'object_id': 'legendary_celestial_dragon_sword_001',
            'name': 'Vyrathis, Fang of the Celestial Dragon',
            'category': 'weapon',
            'sub_category': 'sword',
            'rarity': 'legendary',
            'price_usd': 49.99,
            'price_mpt': 25000,
            'subscription_required': 'pro',
            'gene_code': """
# LEGENDARY: Sword of the Celestial Dragon

SWORD > blade > curved forward 95cm damascus-pattern forged-steel sharp
SWORD > blade > fuller groove forward 70cm blood-channel deep engraved
SWORD > blade > edge razor-sharp double-beveled honed perfect deadly
SWORD > blade > runes engraved glowing celestial-script ancient magical
SWORD > blade > veins energy-channels pulsing blue-light ethereal
SWORD > blade > tip pierce-point armor-penetrating sharp lethal

SWORD > guard > dragon-wings spread 25cm curved protective ornate
SWORD > guard > scales detailed textured metallic embossed decorative
SWORD > guard > eyes gemstone ruby glowing animated magical
SWORD > guard > teeth sharp menacing decorative silver-inlay

SWORD > handle > grip wrapped dragon-leather textured ergonomic balanced
SWORD > handle > wire gold-thread spiral decorative functional binding
SWORD > handle > indents finger-grooves anatomical comfortable precise
SWORD > handle > core steel tang full-length balanced heavy-duty

SWORD > pommel > dragon-head sculpted detailed steel polished ornate
SWORD > pommel > eyes sapphire glowing animated magical intelligent
SWORD > pommel > mouth open fangs showing fierce intimidating
SWORD > pommel > weight balanced counterweight perfect optimal

SWORD > material > base steel forged damascus-pattern flowing beautiful
SWORD > material > roughness 0.3 semi-polished battle-ready functional
SWORD > material > metalness 1.0 pure-metal reflective shining
SWORD > material > normal-map detailed scratches wear authentic realistic
SWORD > material > emission blue-glow magical pulsing animated ethereal

SWORD > particles > trail blue-energy flowing ethereal magical lasting
SWORD > particles > sparks impact-reactive dynamic realistic physics
SWORD > particles > aura celestial-light radius 50cm pulsing intimidating
SWORD > particles > runes glowing-symbols animated scrolling ancient

SWORD > audio > swing whoosh-sound pitch-varied speed-reactive dynamic
SWORD > audio > impact clang-sound metallic resonant powerful dramatic
SWORD > audio > magic hum-sound ethereal continuous ambient mystical
SWORD > audio > special dragon-roar legendary activation-only epic

SWORD > stats > damage 450-520 slashing critical-chance 35% powerful
SWORD > stats > attack-speed 1.2 balanced versatile effective
SWORD > stats > weight 3.5kg heavy two-hand-capable realistic
SWORD > stats > durability 500 legendary self-repairing magical
SWORD > stats > enchantments dragon-breath fire-damage celestial-ward
            """.strip(),
            'vls_code': 'SWORD:A95^12B25C8.DRAG-WING*2.RUNES+GLOW~.PART:TRAIL+SPARK+AURA.AUD:ROAR',
            'polygon_count': 75000,
            'vertex_count': 85000,
            'features': [
                'Animated particle effects (flames, energy trail)',
                'Dynamic audio (swing, impact, activation sounds)',
                'Glowing runes with scrolling animation',
                'Dragon-themed ornate guard and pommel',
                'PBR materials with emission maps',
                'Game stats integrated (damage, speed, durability)',
                'Lore and backstory included',
                'Pre-rigged for Unity/Unreal',
                'Commercial license included'
            ],
            'game_stats': {
                'damage': {'min': 450, 'max': 520, 'type': 'slashing'},
                'critical_chance': 0.35,
                'attack_speed': 1.2,
                'weight': 3.5,
                'durability': 500,
                'enchantments': ['dragon_breath', 'fire_damage', 'celestial_ward'],
                'special_ability': 'Dragon Fury - Summons celestial dragon for 10s'
            },
            'lore': {
                'origin': 'Forged in dragon-fire, cooled in celestial tears',
                'previous_owners': ['Kael the Dragonheart', 'Lyra Starforge', 'Theron the Eternal'],
                'power_source': 'Channels the essence of Vyrathis the Celestial Dragon',
                'legend': 'Said to have slain 1,000 demons in the War of Broken Stars'
            }
        }
    
    def generate_premium_sword(self):
        """PREMIUM TIER: High-quality sword with good detail"""
        return {
            'tier': 'PREMIUM',
            'object_id': f'premium_sword_{random.randint(1000, 9999)}',
            'name': 'Blade of the Crimson Knight',
            'category': 'weapon',
            'sub_category': 'sword',
            'rarity': 'epic',
            'price_usd': 9.99,
            'price_mpt': 5000,
            'subscription_required': 'premium',
            'gene_code': """
SWORD > blade > straight forward 90cm steel sharp polished
SWORD > blade > fuller groove blood-channel centered
SWORD > blade > edge razor-sharp double-beveled honed
SWORD > guard > cross-guard curved steel protective
SWORD > handle > grip leather wrapped ergonomic comfortable
SWORD > pommel > spherical steel weighted balanced
SWORD > material > steel polished reflective battle-ready
SWORD > material > roughness 0.4 semi-glossy realistic
SWORD > material > normal-map scratches wear authentic
            """.strip(),
            'vls_code': 'SWORD:A90B20C6.CROSS-GUARD.LEATHER-GRIP.STEEL+POLISH',
            'polygon_count': 12000,
            'vertex_count': 15000,
            'features': [
                'Detailed blade with fuller groove',
                'PBR materials with normal maps',
                'Ergonomic handle design',
                'Balanced weight distribution',
                'Game stats included'
            ],
            'game_stats': {
                'damage': {'min': 180, 'max': 220, 'type': 'slashing'},
                'critical_chance': 0.15,
                'attack_speed': 1.5,
                'weight': 2.8,
                'durability': 200
            }
        }
    
    def generate_free_sword(self):
        """FREE TIER: Basic sword with simple geometry"""
        return {
            'tier': 'FREE',
            'object_id': f'free_sword_{random.randint(1000, 9999)}',
            'name': 'Iron Longsword',
            'category': 'weapon',
            'sub_category': 'sword',
            'rarity': 'common',
            'price_usd': 0.00,
            'price_mpt': 100,
            'subscription_required': 'free',
            'gene_code': """
SWORD > blade > straight forward 80cm iron basic
SWORD > handle > cylinder 15cm wood grip
SWORD > guard > cross 20cm iron simple
            """.strip(),
            'vls_code': 'SWORD:A80B15C5.SIMPLE',
            'polygon_count': 1500,
            'vertex_count': 2000,
            'features': [
                'Basic geometry',
                'Simple materials',
                'Functional design'
            ],
            'game_stats': {
                'damage': {'min': 50, 'max': 70, 'type': 'slashing'},
                'critical_chance': 0.05,
                'attack_speed': 1.8,
                'weight': 2.2,
                'durability': 100
            }
        }
    
    def generate_plasma_rifle_pro(self):
        """PRO TIER: Sci-fi plasma rifle with advanced effects"""
        return {
            'tier': 'PRO',
            'object_id': 'legendary_plasma_rifle_x9_001',
            'name': 'X9 Voidreaper Plasma Rifle',
            'category': 'weapon',
            'sub_category': 'energy_weapon',
            'rarity': 'legendary',
            'price_usd': 49.99,
            'price_mpt': 25000,
            'subscription_required': 'pro',
            'gene_code': """
RIFLE > body > angular sci-fi forward 95cm polymer black tactical
RIFLE > barrel > energy-conduit glowing-purple cooling-vents repeat 12
RIFLE > stock > collapsible shoulder-mount adjustable ergonomic rubberized
RIFLE > scope > holographic purple-reticle targeting-computer ai-assisted
RIFLE > magazine > energy-cell glowing-purple 60-shots capacity quick-release
RIFLE > grip > textured ergonomic trigger-guard safety-integrated ambidextrous
RIFLE > rail > picatinny top-mounted accessory-ready modular
RIFLE > lights > tactical repeat 2 strobe-capable high-lumens rail-mounted
RIFLE > laser > targeting red-dot adjustable zeroing-capability
RIFLE > particles > muzzle-flash purple-plasma expanding cone-shaped
RIFLE > particles > charge-up energy-gathering glowing-intensifying
RIFLE > particles > trail plasma-bolt purple-streak dissipating
RIFLE > audio > charge-up whine-building pitch-rising tension
RIFLE > audio > fire plasma-burst explosive crackling energy
RIFLE > audio > reload click-whir mechanical smooth efficient
RIFLE > stats > damage 280-340 energy-damage range-200m burst-fire
RIFLE > stats > fire-rate 600rpm magazine-60 reload-2.5s accurate
RIFLE > stats > recoil low-moderate controllable stabilized
            """.strip(),
            'vls_code': 'RIFLE:A95B30C15.PLASMA-BARREL+VENTS*12.HOLO-SCOPE.PART:FLASH+TRAIL',
            'polygon_count': 68000,
            'vertex_count': 78000,
            'game_stats': {
                'damage': {'min': 280, 'max': 340, 'type': 'energy'},
                'fire_rate': 600,
                'magazine': 60,
                'reload_time': 2.5,
                'range': 200,
                'recoil': 0.3,
                'fire_modes': ['single', 'burst', 'auto']
            }
        }
    
    def generate_dragon_mount_pro(self):
        """PRO TIER: Rideable dragon mount with full detail"""
        return {
            'tier': 'PRO',
            'object_id': 'legendary_dragon_mount_crimson_001',
            'name': 'Crimsonwing the Eternal',
            'category': 'mount',
            'sub_category': 'dragon',
            'rarity': 'legendary',
            'price_usd': 49.99,
            'price_mpt': 25000,
            'subscription_required': 'pro',
            'gene_code': """
DRAGON > body > muscular scaled forward 2000cm wingspan 2800cm powerful
DRAGON > head > horned reptilian intelligent eyes-glowing-gold fierce
DRAGON > jaw > articulated teeth-sharp repeat 64 venomous dripping
DRAGON > neck > long flexible muscular scaled mobile protective
DRAGON > wings > membrane leathery veined powerful flight-capable majestic
DRAGON > wing-claws > sharp repeat 4 gripping climbing weapon
DRAGON > legs-front > muscular clawed repeat 2 powerful gripping
DRAGON > legs-rear > muscular clawed repeat 2 powerful jumping
DRAGON > tail > long spiked 1400cm whip-weapon balance counterweight
DRAGON > scales > overlapping armored iridescent red-gold metallic
DRAGON > spines > dorsal ridge repeat 40 defensive intimidating
DRAGON > breath > fire-cone range-30m damage-500 cooldown-10s devastating
DRAGON > saddle > leather reinforced rider-mount harness-straps secure
DRAGON > saddle > stirrups repeat 2 adjustable comfortable stable
DRAGON > particles > flames mouth-glow breathing smoke ambient
DRAGON > particles > embers trailing falling glowing atmospheric
DRAGON > audio > roar deep powerful intimidating echoing territorial
DRAGON > audio > wing-beats whoosh-rhythmic powerful flight-sounds
DRAGON > audio > fire-breath whoosh-crackling intense explosive
DRAGON > stats > health 8000 armor 400 speed-fast rideable-2passengers
DRAGON > stats > abilities fire-breath aerial-combat ground-attack
            """.strip(),
            'vls_code': 'DRAGON:A2000B300C500.WING*2+SPAN2800.SCALES~.FIRE-BREATH.RIDEABLE',
            'polygon_count': 95000,
            'vertex_count': 110000,
            'game_stats': {
                'health': 8000,
                'armor': 400,
                'speed': 'fast',
                'passengers': 2,
                'abilities': {
                    'fire_breath': {'damage': 500, 'range': 30, 'cooldown': 10},
                    'aerial_combat': {'bonus_damage': 0.25, 'evasion': 0.4},
                    'ground_attack': {'aoe_damage': 300, 'knockback': True}
                }
            }
        }
    
    def generate_collection(self, count: int = 100):
        """Generate a collection of gaming objects across all tiers"""
        objects = []
        
        # PRO tier (10%)
        for i in range(int(count * 0.1)):
            if i % 3 == 0:
                objects.append(self.generate_legendary_sword_pro())
            elif i % 3 == 1:
                objects.append(self.generate_plasma_rifle_pro())
            else:
                objects.append(self.generate_dragon_mount_pro())
        
        # PREMIUM tier (30%)
        for i in range(int(count * 0.3)):
            objects.append(self.generate_premium_sword())
        
        # FREE tier (60%)
        for i in range(int(count * 0.6)):
            objects.append(self.generate_free_sword())
        
        return objects


def main():
    print("⚔️  SkyRelics Gaming Object Generator")
    print("=" * 60)
    print()
    
    generator = SkyRelicsGenerator()
    
    # Generate legendary sword
    print("🗡️  Generating Legendary Sword (PRO TIER)...")
    legendary_sword = generator.generate_legendary_sword_pro()
    
    print(f"✅ {legendary_sword['name']}")
    print(f"   Tier: {legendary_sword['tier']}")
    print(f"   Price: ${legendary_sword['price_usd']:.2f} or {legendary_sword['price_mpt']:,} MPT")
    print(f"   Polygons: {legendary_sword['polygon_count']:,}")
    print(f"   Damage: {legendary_sword['game_stats']['damage']['min']}-{legendary_sword['game_stats']['damage']['max']}")
    print(f"   GENE Code: {len(legendary_sword['gene_code']):,} characters")
    print()
    
    # Generate plasma rifle
    print("🔫 Generating Plasma Rifle (PRO TIER)...")
    plasma_rifle = generator.generate_plasma_rifle_pro()
    
    print(f"✅ {plasma_rifle['name']}")
    print(f"   Polygons: {plasma_rifle['polygon_count']:,}")
    print(f"   Damage: {plasma_rifle['game_stats']['damage']['min']}-{plasma_rifle['game_stats']['damage']['max']}")
    print()
    
    # Generate dragon mount
    print("🐉 Generating Dragon Mount (PRO TIER)...")
    dragon = generator.generate_dragon_mount_pro()
    
    print(f"✅ {dragon['name']}")
    print(f"   Polygons: {dragon['polygon_count']:,}")
    print(f"   Health: {dragon['game_stats']['health']}")
    print(f"   Passengers: {dragon['game_stats']['passengers']}")
    print()
    
    # Save collection
    print("📦 Generating collection of 100 objects...")
    collection = generator.generate_collection(100)
    
    output_dir = Path('generated_objects/skyrelics')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_dir / 'skyrelics_collection.json', 'w') as f:
        json.dump(collection, f, indent=2)
    
    # Save individual legendary items
    with open(output_dir / 'legendary_celestial_sword.json', 'w') as f:
        json.dump(legendary_sword, f, indent=2)
    
    with open(output_dir / 'legendary_plasma_rifle.json', 'w') as f:
        json.dump(plasma_rifle, f, indent=2)
    
    with open(output_dir / 'legendary_dragon_mount.json', 'w') as f:
        json.dump(dragon, f, indent=2)
    
    # Statistics
    pro_count = sum(1 for obj in collection if obj['tier'] == 'PRO')
    premium_count = sum(1 for obj in collection if obj['tier'] == 'PREMIUM')
    free_count = sum(1 for obj in collection if obj['tier'] == 'FREE')
    
    print()
    print("📊 Collection Statistics:")
    print(f"   PRO Tier: {pro_count} objects (${pro_count * 49.99:.2f} value)")
    print(f"   PREMIUM Tier: {premium_count} objects (${premium_count * 9.99:.2f} value)")
    print(f"   FREE Tier: {free_count} objects ($0.00)")
    print(f"   Total Value: ${(pro_count * 49.99) + (premium_count * 9.99):.2f}")
    print()
    
    print("💰 Subscription Value:")
    print(f"   Pro Subscription ($49.99/mo): Access to ${(pro_count * 49.99) + (premium_count * 9.99):.2f} worth")
    print(f"   Savings: {((pro_count * 49.99) + (premium_count * 9.99) - 49.99) / 49.99 * 100:.0f}x value")
    print()
    
    print("✅ Saved to: generated_objects/skyrelics/")
    print()
    print("🎯 Next Steps:")
    print("   1. Load legendary_celestial_sword.json in pixelprodigy.html")
    print("   2. Test PRO tier particle effects and audio")
    print("   3. Compare FREE vs PREMIUM vs PRO quality")
    print("   4. Export to Unity/Unreal for game testing")
    print()


if __name__ == "__main__":
    main()
