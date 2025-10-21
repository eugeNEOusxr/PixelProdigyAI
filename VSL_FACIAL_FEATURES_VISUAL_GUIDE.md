# 👁️ VSL FACIAL FEATURES - VISUAL REFERENCE

## ASCII Art Representation

### Front View
```
           ╔═══════════════╗
           ║   VSL  FACE   ║
           ╚═══════════════╝

              ___________
            /             \
          /                 \
        /      EYEBROWS       \
       /     ¯¯¯¯¯¯¯¯¯¯¯      \
      |     ───────  ───────    |
      |    /       \/       \   |
      |   | EYE  ||  EYE  |    |
      |   | SOCKET|| SOCKET|    |
      |    \_____/ \_____/     |
      |                         |
      |     ●●●●    ●●●●       |  ← Eyes (sclera)
      |     ●○●●    ●○●●       |  ← Iris (blue)
      |     ●●●●    ●●●●       |  ← Pupil (black)
      |                         |
      |          /\             |  ← Nose (cone)
      |         /  \            |
      |        /____\           |
      |                         |
       \                       /
        \                     /
          \                 /
            \_____________/

```

### Side View (Profile)
```
           ╔═══════════════╗
           ║  SIDE PROFILE ║
           ╚═══════════════╝

                ___________
              /            ----____
            /                      ---___
          /                             \
         |        ─────── EYEBROW        |
        |         ______                 |
        |        /      \  ← Eye Socket  |
        |       |  ●○●  |  ← Eye layers  |
        |        \______/                |
        |            |\                  |
        |            | \  ← Nose         |
        |            |  \  (protrudes)   |
        |            |___\               |
        |                                |
         \                              /
          \                            /
            \                        /
              ----____          ____/
                      ----------

```

## Coordinate Visualization

### Head Center Reference
```
        Y ↑
          |
          |     HEAD CENTER: (0, 1.7, 0)
          |            ●
          |          /   \
          |         /     \
          |        /       \
          +---------------→ X
         /        |       |
        /         |       |
       Z          LEFT    RIGHT
```

### Facial Feature Positions

#### Eyes (Relative to Head Center)
```
Left Eye:  (-0.06,  +0.04,  +0.16)  ← X negative = left
Right Eye: (+0.06,  +0.04,  +0.16)  ← X positive = right
           ↑        ↑        ↑
           Offset   Up       Forward
           6cm      4cm      16cm
```

#### Eye Sockets (Recessed)
```
Left Socket:  (-0.06,  +0.04,  +0.14)  ← Behind eyes (Z=0.14 < 0.16)
Right Socket: (+0.06,  +0.04,  +0.14)
              ↑         ↑        ↑
              Same X    Same Y   2cm back from eye
```

#### Eyebrows (Above Eyes)
```
Left Brow:  (-0.06,  +0.09,  +0.16)  ← Higher Y (+0.09 > +0.04)
Right Brow: (+0.06,  +0.09,  +0.16)
            ↑        ↑        ↑
            Same X   5cm up   Same Z as eyes
```

#### Nose (Center & Forward)
```
Nose: (0.00,  -0.01,  +0.17)  ← Centered, forward from eyes
      ↑       ↑        ↑
      Center  Slightly  Most forward
      X=0     down      feature
```

## Layer Depth (Front to Back)

```
Z-Axis Depth Layers:
←─────────────────────────────→
Back          →          Front

0.14          0.16       0.195      0.196      0.17
 │             │           │          │         │
 │             │           │          │         │
EYE          EYE        IRIS      PUPIL      NOSE
SOCKET       SCLERA     (Circle)  (Circle)   (Cone)
(Recessed)   (Sphere)
```

## Geometry Types

```
╔═══════════════════════════════════════════════════════════╗
║  Feature          │  Geometry Type    │  Special Notes   ║
╠═══════════════════════════════════════════════════════════╣
║  Head Base        │  IcosahedronGeo   │  3 subdivisions  ║
║  Eye Sockets      │  SphereGeometry   │  Scaled 1.2×0.8  ║
║  Eye Sclera       │  SphereGeometry   │  White material  ║
║  Iris             │  CircleGeometry   │  Flat disc       ║
║  Pupil            │  CircleGeometry   │  Black disc      ║
║  Eyebrows         │  BoxGeometry      │  Angled strips   ║
║  Nose             │  ConeGeometry     │  4-sided pyramid ║
╚═══════════════════════════════════════════════════════════╝
```

## Size Comparisons

```
Relative Sizes (radius in meters):
───────────────────────────────────────────────────────────

HEAD:         ████████████████████  0.18m (18cm)
EYE SOCKET:   ██████████            0.045m (4.5cm)
EYE:          ████████              0.035m (3.5cm)
IRIS:         ███                   0.015m (1.5cm)
PUPIL:        ██                    0.008m (0.8cm)
EYEBROW:      ████████ (length)     0.08m x 0.015m
NOSE:         ████                  0.025m base, 0.08m height
```

## Material Color Palette

```
╔════════════════════════════════════════════════════════╗
║                  COLOR SWATCHES                        ║
╠════════════════════════════════════════════════════════╣
║  SKIN:        ████████  0xFFCCAA  (Peachy)            ║
║  EYE SOCKET:  ████████  0xD4A574  (Dark Tan)          ║
║  SCLERA:      ████████  0xFFFFFF  (White)             ║
║  IRIS:        ████████  0x4488CC  (Blue)              ║
║  PUPIL:       ████████  0x000000  (Black)             ║
║  EYEBROW:     ████████  0x4A3728  (Dark Brown)        ║
╚════════════════════════════════════════════════════════╝
```

## Mesh Hierarchy

```
VSL_Character
├── Body Parts (skeleton - invisible)
│   └── Head Joint @ (0, 1.7, 0)
│       └── [Invisible cube, controls position]
│
└── Skin Meshes (visible)
    ├── Head_Base [IcosahedronGeometry]
    │   └── Material: Skin (0xFFCCAA)
    │
    ├── Left_Eye_Socket [SphereGeometry - scaled]
    │   └── Material: Dark Skin (0xD4A574)
    │
    ├── Right_Eye_Socket [SphereGeometry - scaled]
    │   └── Material: Dark Skin (0xD4A574)
    │
    ├── Left_Eye [SphereGeometry]
    │   └── Material: White (0xFFFFFF)
    │
    ├── Left_Iris [CircleGeometry]
    │   └── Material: Blue (0x4488CC)
    │
    ├── Left_Pupil [CircleGeometry]
    │   └── Material: Black (0x000000)
    │
    ├── Right_Eye [SphereGeometry]
    │   └── Material: White (0xFFFFFF)
    │
    ├── Right_Iris [CircleGeometry]
    │   └── Material: Blue (0x4488CC)
    │
    ├── Right_Pupil [CircleGeometry]
    │   └── Material: Black (0x000000)
    │
    ├── Left_Eyebrow [BoxGeometry - angled]
    │   └── Material: Dark Brown (0x4A3728)
    │
    ├── Right_Eyebrow [BoxGeometry - angled]
    │   └── Material: Dark Brown (0x4A3728)
    │
    └── Nose [ConeGeometry - rotated]
        └── Material: Skin (0xFFCCAA)
```

## 3D Wireframe View

```
         FRONT VIEW              SIDE VIEW           TOP VIEW
    
    ─────  ─────            ─────               ─────────
   /  ●  \/  ●  \          /  ●─●                ●   ●
  /    │    │    \        /    │                /  ▼  \
 │   ══════════   │      │   ══════            │ NOSE │
 │                │      │     │               │      │
 │       /\       │      │    /│               └──────┘
 │      /  \      │      │   / │
  \    /____\    /        \ /  │
   \            /          │   │
    ──────────             ────┘

   ← Eyebrows              ← Eye               ← Nose
   ← Eyes with iris          Socket              protrudes
   ← Nose pyramid            recessed            forward
```

## Shadow Casting Diagram

```
              LIGHT SOURCE ☀️
                    ↓
         ╔══════════════════╗
         ║                  ║
    ╔════╬════════════════════════╗
    ║ ───║─────  ─────           ║
    ║   ╱║╲   ╱╲    ╱╲           ║  ← Eyebrows cast
    ║  │ ║ ●─●─●  ●─●─●          ║     shadows downward
    ║  │ ║   ║      ║            ║
    ║  │ ║  ╱║╲                  ║  ← Nose casts shadow
    ║  │ ║ ╱ ║ ╲                 ║     on face/upper lip
    ║  │ ║╱  ║  ╲                ║
    ║  │ ║   ║   ╲               ║  ← Eye sockets create
    ║  │ ╚═══║════╬═══════════════╣     depth via shadow
    ║  │     ║    ║   SHADOWS     ║
    ║  └─────║────║───────────────║
    ║        ╚════╝               ║
    ╚════════════════════════════╝
```

## Implementation Checklist

```
✅ Eye Sockets
   ├─ ✅ SphereGeometry created
   ├─ ✅ Darker material applied
   ├─ ✅ Scaled for elongation
   ├─ ✅ Positioned behind eyes
   └─ ✅ Shadow casting enabled

✅ Eyes (Sclera)
   ├─ ✅ White material
   ├─ ✅ Proper size (0.035)
   ├─ ✅ In front of sockets
   └─ ✅ Shadow casting enabled

✅ Iris
   ├─ ✅ Blue material
   ├─ ✅ CircleGeometry flat
   ├─ ✅ Layered on eye
   └─ ✅ Correct size (0.015)

✅ Pupil
   ├─ ✅ Black material
   ├─ ✅ Smallest circle (0.008)
   ├─ ✅ Layered on iris
   └─ ✅ Center of eye

✅ Eyebrows
   ├─ ✅ Dark brown material
   ├─ ✅ BoxGeometry strips
   ├─ ✅ Angled outward
   ├─ ✅ Above eyes
   └─ ✅ Shadow casting enabled

✅ Nose
   ├─ ✅ ConeGeometry pyramid
   ├─ ✅ Skin material
   ├─ ✅ Rotated forward
   ├─ ✅ Centered on face
   └─ ✅ Shadow casting enabled
```

---

## Final Result

```
    ┌─────────────────────────────────┐
    │  BEFORE: Featureless blob 🫥   │
    │  AFTER:  Complete face 👤      │
    │                                 │
    │  ✅ Eye sockets (depth)         │
    │  ✅ Eyes (3 layers)             │
    │  ✅ Eyebrows (expression)       │
    │  ✅ Nose (dimension)            │
    └─────────────────────────────────┘
```

🎭 **VSL Characters are now FULLY HUMAN!**
