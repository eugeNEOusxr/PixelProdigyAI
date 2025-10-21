# VSL Character Generator - Extreme Realism Features

## Overview
This document details the extreme anatomical realism features added to the VSL Character System, including skin damage, body conditions, hair systems, bathroom environments, and cleaning mechanics.

---

## Feature Systems

### 1. Skin Damage System
**Method:** `createSkinDamage(character, config)`

Creates realistic skin damage including scars, freckles, moles, birthmarks, and black eyes.

**Configuration Options:**
```javascript
{
    scars: [
        {x: 0, y: 1.6, z: 0.12, length: 0.05, rotation: Math.PI/2, color: 0xffaaaa}
    ],
    freckles: 30,  // Number of freckles (random positions on face)
    moles: [
        {x: -0.05, y: 1.55, z: 0.11, size: 0.005}
    ],
    birthmarks: [
        {x: 0.1, y: 1.4, z: 0.15, width: 0.03, height: 0.02, color: 0x8b4513}
    ],
    blackEye: {
        side: 'left',  // 'left' or 'right'
        stage: 0       // 0=fresh purple, 1=blue, 2=green, 3=brown, 4=yellow
    }
}
```

**Mesh Count:** Variable (5-100+ depending on configuration)

**Materials:**
- Scars: 0xffaaaa (light pink) - raised tissue
- Freckles: 0x8b6f47 (brown) - small spots
- Moles: 0x3d2817 (dark brown) - raised spots
- Birthmarks: 0x8b4513 (saddle brown) - flat pigmentation
- Black eye stages: Purple → Blue → Green → Brown → Yellow

---

### 2. Skin Conditions System
**Method:** `createSkinConditions(character, config)`

Adds environmental skin conditions: sweat, dirt, grease, paint, dead skin, boils.

**Configuration Options:**
```javascript
{
    sweat: 0.5,  // Intensity 0-1 (generates 50 pores per 1.0)
    dirt: [
        {x: 0.1, y: 1.2, z: 0.15}
    ],
    grease: [
        {x: -0.1, y: 1.1, z: 0.16}
    ],
    paint: [
        {
            x: 0, y: 1.3, z: 0.15,
            width: 0.06, height: 0.06, thickness: 0.003,
            color: 0xff0000,
            type: 'polymer'  // 'paint', 'primer', 'polymer', 'metal'
        }
    ],
    deadSkin: [
        {x: 0, y: 1.4, z: 0.14}
    ],
    boils: [
        {x: 0.05, y: 1.3, z: 0.13, size: 0.008}
    ]
}
```

**Mesh Count:** Variable (10-200+ depending on configuration)

**Materials:**
- Sweat: 0xccddff (light blue) - glossy, transparent
- Dirt: 0x4a3f2a (dark brown) - matte
- Grease: 0x1a1a1a (black) - shiny metallic
- Paint: Variable color - roughness depends on type
- Dead skin: 0xddc9b4 (pale tan) - flaky random rotation
- Boils: 0xff6666 (red) - inflamed bumps

---

### 3. Body Hair System
**Method:** `createBodyHair(character, config)`

Adds body hair: chest, soul patch, pubic, gooch, buttcrack.

**Configuration Options:**
```javascript
{
    color: 0x442211,  // Dark brown (default)
    chestHair: 0.8,   // Density 0-1 (30 hairs per 1.0)
    soulPatch: true,  // Below lower lip
    pubicHair: 'trimmed',  // 'trimmed' (15 hairs), 'natural' (40 hairs), false
    goochHair: 0.5    // Density 0-1 (10 hairs per 1.0)
}
```

**Mesh Count:** Variable (8-80+ depending on configuration)
- Chest: 0-30 hairs
- Soul patch: 8 hairs
- Pubic: 15-40 hairs
- Gooch/buttcrack: 0-10+ hairs

**Hair Specifications:**
- Radius: 0.0005-0.0006
- Length: 0.008-0.015
- Geometry: CylinderGeometry (4 segments)
- Material: Brown/black, roughness 0.9

---

### 4. Extremity Wrinkles System
**Method:** `createExtremityWrinkles(character)`

Adds realistic hand/foot wrinkles: 3-layer knuckles, palm lines.

**Features:**
- **Knuckle wrinkles:** 3 rings per finger joint (10 fingers × 3 joints × 3 rings = 90 rings)
- **Palm lines:** 3 major creases per hand (6 lines total)
- **Total meshes:** 96

**Mesh Specifications:**
- Knuckle rings: TorusGeometry(0.006, 0.0008, 6, 12)
- Palm lines: CylinderGeometry(0.0008, 0.0008, 0.06, 8)
- Color: 0xcc9966 (skin tone darker)
- Roughness: 0.9

---

### 5. Eye Conditions System
**Method:** `createEyeConditions(character, config)`

Adds eye conditions: red veins (sleep deprivation), colored retinas.

**Configuration Options:**
```javascript
{
    tired: true,  // Adds red veins radiating from pupils
    retinas: 'green'  // 'blue', 'green', 'brown', 'hazel', 'gray'
}
```

**Features:**
- **Red veins:** 6 veins per eye radiating from pupil
- **Retina colors:**
  - Blue: 0x4488ff
  - Green: 0x44ff88
  - Brown: 0x6d4c41
  - Hazel: 0x8b7355
  - Gray: 0x708090

**Mesh Count:** 12 veins (if tired), 0 for retina color change

---

### 6. Body Details System
**Method:** `createBodyDetails(character)`

Adds anatomical body details: belly button, nipples, asshole.

**Features:**
- **Belly button:** Cauliflower-shaped TorusGeometry with lint particle
- **Nipples:** Cylindrical protrusion + spherical tip (2 meshes per nipple)
- **Asshole:** Cauliflower TorusGeometry (hidden by default)

**Mesh Count:** 7 total
- Belly button: 1 mesh + 1 lint
- Nipples: 4 meshes (2 per side)
- Asshole: 1 mesh (visible=false)

**Mesh Specifications:**
- Belly button: TorusGeometry(0.015, 0.008, 8, 16), color 0xcc8866
- Lint: SphereGeometry(0.003, 6, 6), color 0x4a4a4a
- Nipple base: CylinderGeometry(0.008, 0.01, 0.005, 12), color 0xcc7766
- Nipple tip: SphereGeometry(0.006, 12, 12)
- Asshole: TorusGeometry(0.008, 0.004, 8, 12), color 0x8b6f47

---

## 7. Bathroom Environment System
**Method:** `createBathroom(position)`

Creates complete bathroom with bathtub, faucet, shower, tiles.

**Components:**
- **Bathtub:** 1.5×0.6×0.7 white porcelain with shine
- **Bathtub rim:** Rounded torus edge
- **Faucet:** Chrome metal with curved spout
- **Shower curtain:** Semi-transparent fabric (opacity 0.7)
- **Shower rod:** Metal cylinder
- **Tiled walls:** 8×8 grid (64 tiles) with grout lines
- **Tiled floor:** 6×6 grid (36 tiles)
- **Shower cap:** Plastic cap on hook

**Total Objects:** 200+ (tiles, grout lines, fixtures)

**Materials:**
- Bathtub: 0xffffff, roughness 0.3, metalness 0.2
- Faucet: 0xcccccc, roughness 0.2, metalness 0.9 (chrome)
- Tiles: 0xe8f4f8 (light blue), roughness 0.4
- Grout: 0x888888 (gray), roughness 0.9
- Curtain: 0xaaccff, transparent, opacity 0.7

**Example Usage:**
```javascript
const vslGen = new VSLCharacterGenerator(scene);
const bathroom = vslGen.createBathroom({x: 5, y: 0, z: 5});
```

---

## 8. Cleaning Mechanics System

### Clean Character Method
**Method:** `cleanCharacter(character, options)`

Removes dirt, grease, paint from character skin.

**Options:**
```javascript
{
    method: 'soap',  // 'soap', 'water', 'bath'
    intensity: 0.8   // 0-1 (probability of removing each stain)
}
```

**Process:**
1. Scans all character meshes
2. Identifies dirt/grease/paint by material color
3. Randomly removes each based on intensity
4. Returns count of removed meshes

### Bath Character Method
**Method:** `bathCharacter(character, bathtub)`

Character takes full bath with 100% cleaning.

**Process:**
1. Moves character into bathtub position
2. Calls cleanCharacter with intensity 1.0
3. Removes all dirt, grease, paint

**Example Usage:**
```javascript
const vslGen = new VSLCharacterGenerator(scene);
const bathroom = vslGen.createBathroom({x: 5, y: 0, z: 5});
const bathtub = bathroom.children[0]; // First child is bathtub

// Character takes a bath
vslGen.bathCharacter(character, bathtub);
```

---

## Character Creation with Extreme Features

### Example 1: Dirty Fighter Character
```javascript
const vslGen = new VSLCharacterGenerator(scene);

const fighter = vslGen.createCharacter({
    name: 'Dirty_Fighter',
    position: {x: 0, y: 0, z: 0},
    
    // Extreme realism features
    skinDamage: {
        scars: [
            {x: 0.03, y: 1.58, z: 0.12, length: 0.04, rotation: Math.PI/4, color: 0xffaaaa}
        ],
        blackEye: {side: 'left', stage: 1}  // Blue stage
    },
    
    skinConditions: {
        sweat: 0.7,
        dirt: [
            {x: 0.1, y: 1.2, z: 0.15},
            {x: -0.08, y: 1.25, z: 0.14}
        ]
    },
    
    bodyHair: {
        chestHair: 0.8,
        soulPatch: true
    },
    
    extremityWrinkles: true,
    
    eyeConditions: {
        tired: true,
        retinas: 'brown'
    },
    
    bodyDetails: true
});
```

### Example 2: Painter Character
```javascript
const painter = vslGen.createCharacter({
    name: 'Painter',
    position: {x: 2, y: 0, z: 0},
    
    skinConditions: {
        paint: [
            {
                x: 0.15, y: 1.1, z: 0.16,
                width: 0.08, height: 0.08, thickness: 0.004,
                color: 0xff0000,
                type: 'paint'
            },
            {
                x: -0.12, y: 1.15, z: 0.15,
                width: 0.06, height: 0.06, thickness: 0.003,
                color: 0x0000ff,
                type: 'polymer'
            }
        ],
        dirt: [
            {x: 0, y: 0.5, z: 0.1}  // Dirty hands
        ]
    },
    
    bodyDetails: true
});

// Later: Clean the painter
vslGen.cleanCharacter(painter, {method: 'soap', intensity: 0.9});
```

### Example 3: Clean Character with Full Details
```javascript
const clean = vslGen.createCharacter({
    name: 'Clean_Person',
    position: {x: -2, y: 0, z: 0},
    
    skinDamage: {
        freckles: 20,
        moles: [
            {x: 0.05, y: 1.55, z: 0.11, size: 0.004}
        ]
    },
    
    bodyHair: {
        pubicHair: 'trimmed',
        color: 0x442211
    },
    
    extremityWrinkles: true,
    
    eyeConditions: {
        retinas: 'green'
    },
    
    bodyDetails: true
});
```

---

## Feature Toggle System

All extreme realism features are **optional** and **config-driven**. To create a basic character without extreme features, simply omit the config options:

```javascript
// Basic character (366 meshes)
const basic = vslGen.createCharacter({
    name: 'Basic_Character',
    position: {x: 0, y: 0, z: 0}
});

// Ultra-detailed character (500+ meshes)
const ultra = vslGen.createCharacter({
    name: 'Ultra_Detailed',
    position: {x: 3, y: 0, z: 0},
    skinDamage: {scars: [...], freckles: 30, blackEye: {...}},
    skinConditions: {sweat: 0.8, dirt: [...]},
    bodyHair: {chestHair: 1.0, soulPatch: true, pubicHair: 'natural'},
    extremityWrinkles: true,
    eyeConditions: {tired: true, retinas: 'hazel'},
    bodyDetails: true
});
```

---

## Performance Considerations

### Mesh Counts by Feature Level
- **Basic character:** 366 meshes
- **+ Skin damage:** +50 meshes (scars, freckles, moles)
- **+ Skin conditions:** +100 meshes (sweat, dirt, paint)
- **+ Body hair:** +80 meshes (chest, pubic, soul patch)
- **+ Extremity wrinkles:** +96 meshes (knuckles, palm lines)
- **+ Eye conditions:** +12 meshes (red veins)
- **+ Body details:** +7 meshes (belly button, nipples, asshole)
- **Total ultra-detailed:** ~711 meshes per character

### Bathroom Environment
- **Bathroom objects:** 200+ meshes (tiles, grout, fixtures)
- **Recommendation:** Create 1-2 bathrooms per scene, reuse for multiple characters

### Optimization Tips
1. Use `extremityWrinkles: false` for distant characters (saves 96 meshes)
2. Use `sweat: 0` instead of `sweat: 0.8` (saves 40 meshes)
3. Limit body hair density for crowd scenes
4. Hide asshole mesh by default (`visible: false`)
5. Create bathroom as separate scene, load only when needed

---

## Material Summary

| Feature | Color Code | Roughness | Metalness | Transparency |
|---------|-----------|-----------|-----------|--------------|
| Scars | 0xffaaaa | 0.9 | 0.0 | No |
| Freckles | 0x8b6f47 | 0.9 | 0.0 | No |
| Moles | 0x3d2817 | 0.8 | 0.0 | No |
| Black eye | Variable | 0.7 | 0.0 | Yes (0.7) |
| Sweat | 0xccddff | 0.1 | 0.3 | Yes (0.8) |
| Dirt | 0x4a3f2a | 1.0 | 0.0 | No |
| Grease | 0x1a1a1a | 0.2 | 0.4 | No |
| Paint | Variable | 0.3-0.7 | 0.0-0.8 | No |
| Dead skin | 0xddc9b4 | 1.0 | 0.0 | No |
| Boils | 0xff6666 | 0.9 | 0.0 | No |
| Body hair | 0x442211 | 0.9 | 0.0 | No |
| Wrinkles | 0xcc9966 | 0.9 | 0.0 | No |
| Red veins | 0xff3333 | 0.8 | 0.0 | No |
| Belly button | 0xcc8866 | 0.9 | 0.0 | No |
| Nipples | 0xcc7766 | 0.8 | 0.0 | No |
| Bathtub | 0xffffff | 0.3 | 0.2 | No |
| Faucet | 0xcccccc | 0.2 | 0.9 | No |
| Tiles | 0xe8f4f8 | 0.4 | 0.1 | No |
| Grout | 0x888888 | 0.9 | 0.0 | No |

---

## Console Output Examples

```
Adding skin damage to Dirty_Fighter
Skin damage added: 1 scars, 0 freckles, 0 moles

Adding skin conditions to Dirty_Fighter
Skin conditions added: 35 sweat pores, 2 dirt patches

Adding body hair to Dirty_Fighter
Body hair added: chest=0.8, soulPatch=true

Adding extremity wrinkles to Dirty_Fighter
Extremity wrinkles added: 30 knuckle rings, 6 palm lines

Adding eye conditions to Dirty_Fighter
Eye conditions added: tired=true, retinas=brown

Adding body details to Dirty_Fighter
Body details added: belly button, nipples, asshole

Creating bathroom at (5, 0, 5)
Bathroom created with 214 objects

Cleaning Dirty_Fighter with soap
Cleaned 2 dirt/grease patches from Dirty_Fighter

Dirty_Fighter is taking a bath
Cleaned 2 dirt/grease patches from Dirty_Fighter
Dirty_Fighter is now clean!
```

---

## Future Enhancements (Potential Phase 5)

1. **Animated sweat dripping** (particle system)
2. **Dynamic dirt accumulation** (based on environment interaction)
3. **Paint brush tool** (player can paint characters)
4. **Soap bubbles in bathtub** (foam particle system)
5. **Steam effect** (from hot bath water)
6. **Towel drying animation**
7. **Clothing removal** (for bathing)
8. **Water puddles** (after bath)
9. **Skin tone variation** (tan lines, sunburn)
10. **Tattoo system** (permanent ink patterns)

---

## Summary

The VSL Character System now supports **extreme anatomical realism** with:
- ✅ Skin damage (scars, freckles, moles, birthmarks, black eyes)
- ✅ Skin conditions (sweat, dirt, grease, paint, dead skin, boils)
- ✅ Body hair (chest, soul patch, pubic, gooch)
- ✅ Hand/foot wrinkles (3-layer knuckles, palm lines)
- ✅ Eye conditions (red veins, colored retinas)
- ✅ Body details (belly button, nipples, asshole)
- ✅ Bathroom environment (bathtub, faucet, shower, tiles)
- ✅ Cleaning mechanics (soap, water, bath)
- ✅ Feature toggle system (all optional via config)

**Total capability:** Up to **711 meshes per character** + **200+ bathroom objects**

All features are **chooseable** and can be toggled on/off per character through the configuration object passed to `createCharacter()`.
