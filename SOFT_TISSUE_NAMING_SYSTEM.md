# 🧬 Soft Tissue Naming & Layering System

## 📋 Overview

This document defines the proper anatomical terminology and naming conventions for all soft tissue layers that surround the skeletal system, from deepest (periosteum) to most superficial (epidermis).

**Creation Date:** October 24, 2025  
**Purpose:** Enable anatomically accurate layering system for PixelProdigy3D body builder  
**Related Files:** `pixelprodigy3d.html`, `BONE_NAMING_COMPLETE.md`

---

## 🏗️ Layer Architecture (Deep → Superficial)

```
LAYER 0: Bone Core (Complete ✅)
    ↓
LAYER 1: Periosteum & Joint Structures
    ↓
LAYER 2: Tendons & Ligaments
    ↓
LAYER 3: Muscles (with Fascicles & Fibers)
    ↓
LAYER 4: Deep Fascia
    ↓
LAYER 5: Neurovascular Bundle (Nerves + Vessels)
    ↓
LAYER 6: Superficial Fascia & Adipose
    ↓
LAYER 7: Dermis
    ↓
LAYER 8: Epidermis (Skin Surface)
```

---

## 🦴 LAYER 1: Periosteum & Joint Structures

### **Periosteum (Bone Membrane)**

**Definition:** Dense fibrous membrane covering all bone surfaces except joints

**Naming Convention:**
```javascript
{
  name: 'Periosteum (Bone)',
  type: 'Connective Tissue Membrane',
  layers: ['Outer Fibrous Layer', 'Inner Osteogenic Layer'],
  attachments: ['Sharpey\'s Fibers (tendon/ligament anchorage)'],
  function: 'Bone nutrition, growth, repair, pain sensation',
  bloodSupply: 'Periosteal arteries',
  innervation: 'Highly innervated (pain receptors)'
}
```

**Examples by Bone:**
- `Femoral Periosteum` - Covers femur shaft
- `Humeral Periosteum` - Covers humerus shaft
- `Cranial Periosteum (Pericranium)` - Covers skull bones

### **Articular Cartilage**

**Definition:** Smooth hyaline cartilage at joint surfaces (no periosteum here)

**Naming Convention:**
```javascript
{
  name: 'Articular Cartilage (Joint)',
  type: 'Hyaline Cartilage',
  thickness: '2-4mm',
  location: 'Joint surface',
  function: 'Friction reduction, shock absorption',
  properties: ['Avascular (no blood supply)', 'Aneural (no nerves)']
}
```

**Examples:**
- `Femoral Head Articular Cartilage` - Hip socket surface
- `Tibial Plateau Articular Cartilage` - Knee joint surface
- `Humeral Head Articular Cartilage` - Shoulder ball surface

### **Ligaments (Bone-to-Bone)**

**Naming Convention:**
```javascript
{
  name: 'Ligament Name',
  type: 'Dense Regular Connective Tissue',
  attachments: ['Bone A', 'Bone B'],
  function: 'Joint stability, limit excessive motion',
  composition: 'Type I Collagen (70-80%)',
  elasticity: 'Low (prevents overstretching)'
}
```

**Major Ligaments to Name:**

**Knee:**
- `Anterior Cruciate Ligament (ACL)` - Prevents anterior tibial translation
- `Posterior Cruciate Ligament (PCL)` - Prevents posterior tibial translation
- `Medial Collateral Ligament (MCL)` - Medial knee stability
- `Lateral Collateral Ligament (LCL)` - Lateral knee stability

**Ankle:**
- `Deltoid Ligament` - Medial ankle stability
- `Anterior Talofibular Ligament (ATFL)` - Most commonly sprained
- `Calcaneofibular Ligament (CFL)` - Lateral ankle stability

**Spine:**
- `Anterior Longitudinal Ligament` - Anterior vertebral bodies
- `Posterior Longitudinal Ligament` - Posterior vertebral bodies
- `Ligamentum Flavum` - Yellow elastic ligament between vertebrae

**Shoulder:**
- `Glenohumeral Ligaments (Superior/Middle/Inferior)` - Shoulder capsule
- `Coracoclavicular Ligament` - Clavicle to scapula

---

## 💪 LAYER 2: Tendons (Muscle-to-Bone)

**Definition:** Tough fibrous cords connecting muscles to bones

**Naming Convention:**
```javascript
{
  name: 'Muscle Name + Tendon',
  type: 'Dense Regular Connective Tissue',
  origin: 'Muscle belly',
  insertion: 'Bone attachment site',
  function: 'Force transmission from muscle to bone',
  composition: 'Type I Collagen (85-95%)',
  structure: 'Parallel collagen fiber bundles'
}
```

**Major Tendons to Name:**

**Lower Limb:**
- `Achilles Tendon (Calcaneal Tendon)` - Gastrocnemius/Soleus → Calcaneus
- `Patellar Tendon` - Patella → Tibial tuberosity
- `Quadriceps Tendon` - Quadriceps → Patella
- `Hamstring Tendons` - Biceps femoris, Semitendinosus, Semimembranosus → Tibia/Fibula

**Upper Limb:**
- `Biceps Tendon (Long Head)` - Biceps → Supraglenoid tubercle
- `Triceps Tendon` - Triceps → Olecranon process
- `Rotator Cuff Tendons` - Supraspinatus, Infraspinatus, Teres minor, Subscapularis → Humerus

**Hand:**
- `Flexor Digitorum Tendons` - Forearm flexors → Finger phalanges
- `Extensor Digitorum Tendons` - Forearm extensors → Finger phalanges

---

## 🏋️ LAYER 3: Muscles (Contractile Tissue)

### **Muscle Belly Structure**

**Naming Convention:**
```javascript
{
  name: 'Muscle Latin Name (Common Name)',
  type: 'Skeletal Muscle',
  origin: 'Fixed attachment bone + landmark',
  insertion: 'Movable attachment bone + landmark',
  action: 'Primary movement(s)',
  innervation: 'Nerve supplying motor control',
  bloodSupply: 'Arteries supplying oxygen',
  structure: {
    fascicles: 'Bundles of muscle fibers',
    fibers: 'Individual muscle cells (multinucleated)',
    myofibrils: 'Contractile proteins (actin/myosin)',
    sarcomeres: 'Functional contractile unit'
  }
}
```

**Major Muscles by Region:**

### **Upper Limb Muscles:**

**Shoulder:**
- `Deltoid (Shoulder Cap)` - Clavicle/Scapula → Deltoid tuberosity (humerus) - Arm abduction
- `Supraspinatus` - Supraspinous fossa → Greater tubercle - Arm abduction initiation
- `Infraspinatus` - Infraspinous fossa → Greater tubercle - External rotation
- `Teres Minor` - Lateral scapula → Greater tubercle - External rotation
- `Subscapularis` - Subscapular fossa → Lesser tubercle - Internal rotation

**Arm:**
- `Biceps Brachii (Biceps)` - Scapula → Radial tuberosity - Elbow flexion, supination
  - Long head, Short head
- `Triceps Brachii (Triceps)` - Scapula/Humerus → Olecranon - Elbow extension
  - Long head, Lateral head, Medial head
- `Brachialis` - Anterior humerus → Ulnar tuberosity - Elbow flexion
- `Coracobrachialis` - Coracoid process → Medial humerus - Shoulder flexion

**Forearm (Anterior/Flexors):**
- `Flexor Carpi Radialis` - Medial epicondyle → 2nd/3rd metacarpals - Wrist flexion
- `Flexor Carpi Ulnaris` - Medial epicondyle → Pisiform/5th metacarpal - Wrist flexion
- `Flexor Digitorum Superficialis` - Medial epicondyle → Middle phalanges - Finger flexion
- `Flexor Digitorum Profundus` - Ulna → Distal phalanges - Finger flexion

**Forearm (Posterior/Extensors):**
- `Extensor Carpi Radialis Longus/Brevis` - Lateral epicondyle → Metacarpals - Wrist extension
- `Extensor Carpi Ulnaris` - Lateral epicondyle → 5th metacarpal - Wrist extension
- `Extensor Digitorum` - Lateral epicondyle → Phalanges - Finger extension

### **Lower Limb Muscles:**

**Thigh (Anterior):**
- `Quadriceps Femoris (Quads)` - Ilium/Femur → Patella → Tibia - Knee extension
  - `Rectus Femoris` - AIIS → Patella
  - `Vastus Lateralis` - Lateral femur → Patella
  - `Vastus Medialis` - Medial femur → Patella
  - `Vastus Intermedius` - Anterior femur → Patella

**Thigh (Posterior/Hamstrings):**
- `Biceps Femoris` - Ischial tuberosity → Fibular head - Knee flexion, hip extension
- `Semitendinosus` - Ischial tuberosity → Medial tibia - Knee flexion, hip extension
- `Semimembranosus` - Ischial tuberosity → Medial tibia - Knee flexion, hip extension

**Thigh (Medial/Adductors):**
- `Adductor Longus` - Pubis → Linea aspera - Hip adduction
- `Adductor Magnus` - Pubis/Ischium → Linea aspera - Hip adduction
- `Gracilis` - Pubis → Medial tibia - Hip adduction, knee flexion

**Leg (Posterior/Calf):**
- `Gastrocnemius (Calf Muscle)` - Femoral condyles → Calcaneus (via Achilles) - Plantar flexion
  - Medial head, Lateral head
- `Soleus` - Tibia/Fibula → Calcaneus (via Achilles) - Plantar flexion
- `Plantaris` - Lateral femur → Calcaneus - Weak plantar flexion

**Leg (Anterior):**
- `Tibialis Anterior` - Lateral tibia → 1st cuneiform/metatarsal - Dorsiflexion
- `Extensor Digitorum Longus` - Tibia/Fibula → Toe phalanges - Toe extension

### **Torso Muscles:**

**Chest:**
- `Pectoralis Major (Pecs)` - Clavicle/Sternum → Humerus - Shoulder adduction
- `Pectoralis Minor` - Ribs 3-5 → Coracoid process - Scapula depression

**Back:**
- `Latissimus Dorsi (Lats)` - Spine/Ilium → Humerus - Shoulder adduction, extension
- `Trapezius (Traps)` - Skull/Spine → Clavicle/Scapula - Scapula elevation
- `Rhomboid Major/Minor` - Spine → Medial scapula - Scapula retraction
- `Erector Spinae` - Sacrum → Ribs/Spine - Spine extension

**Abdomen:**
- `Rectus Abdominis (Abs)` - Pubis → Ribs/Sternum - Trunk flexion
- `External Obliques` - Ribs → Ilium/Linea alba - Trunk rotation
- `Internal Obliques` - Ilium → Ribs - Trunk rotation
- `Transversus Abdominis` - Ribs/Ilium → Linea alba - Core stability

---

## 🧵 LAYER 4: Fascia (Connective Tissue Wrapping)

### **Deep Fascia**

**Definition:** Dense connective tissue wrapping individual muscles and muscle groups

**Naming Convention:**
```javascript
{
  name: 'Region + Fascia',
  type: 'Dense Irregular Connective Tissue',
  function: 'Muscle compartmentalization, force transmission',
  structure: 'Collagen sheets with some elastin',
  continuity: 'Connected to adjacent fasciae'
}
```

**Examples:**
- `Fascia Lata` - Deep fascia of thigh (includes IT band)
- `Crural Fascia` - Deep fascia of leg
- `Brachial Fascia` - Deep fascia of arm
- `Thoracolumbar Fascia` - Deep back fascia

### **Superficial Fascia (Hypodermis)**

**Definition:** Loose areolar and adipose tissue layer beneath skin

**Naming Convention:**
```javascript
{
  name: 'Superficial Fascia (Hypodermis)',
  type: 'Loose Connective Tissue + Adipose',
  function: 'Insulation, energy storage, shock absorption',
  thickness: 'Variable (0.5cm - 3cm+ depending on body region/fitness)',
  bloodSupply: 'Rich vascular network'
}
```

---

## 🩸 LAYER 5: Neurovascular Structures

### **Nerves (Motor & Sensory)**

**Naming Convention:**
```javascript
{
  name: 'Nerve Name',
  type: 'Peripheral Nerve',
  origin: 'Nerve root (e.g., C5-C6 for musculocutaneous)',
  branches: ['Branch names'],
  innervation: {
    motor: ['Muscles controlled'],
    sensory: ['Skin regions with sensation']
  },
  pathway: 'Anatomical course description'
}
```

**Major Nerves:**

**Upper Limb:**
- `Median Nerve` - C6-T1 → Hand (thumb side) - Flexor muscles, thumb opposition
- `Ulnar Nerve` - C8-T1 → Hand (pinky side) - Intrinsic hand muscles
- `Radial Nerve` - C5-T1 → Posterior arm/forearm - Extensors
- `Musculocutaneous Nerve` - C5-C7 → Biceps, brachialis, coracobrachialis
- `Axillary Nerve` - C5-C6 → Deltoid, teres minor

**Lower Limb:**
- `Sciatic Nerve` - L4-S3 → Divides into tibial/common fibular - Largest nerve
- `Femoral Nerve` - L2-L4 → Anterior thigh - Quadriceps
- `Obturator Nerve` - L2-L4 → Medial thigh - Adductors
- `Tibial Nerve` - L4-S3 → Posterior leg - Plantarflexors
- `Common Fibular Nerve` - L4-S2 → Anterior/lateral leg - Dorsiflexors

### **Blood Vessels (Arteries & Veins)**

**Naming Convention:**
```javascript
{
  name: 'Vessel Name + Artery/Vein',
  type: 'Artery (oxygenated) / Vein (deoxygenated)',
  origin: 'Parent vessel',
  branches: ['Daughter vessels'],
  supplies: ['Tissues/muscles supplied'],
  course: 'Anatomical pathway'
}
```

**Major Arteries:**

**Upper Limb:**
- `Subclavian Artery` → `Axillary Artery` → `Brachial Artery` → `Radial/Ulnar Arteries`
- `Radial Artery` - Forearm lateral → Wrist pulse location
- `Ulnar Artery` - Forearm medial → Deep palmar arch

**Lower Limb:**
- `Femoral Artery` - Inguinal ligament → Adductor hiatus - Main leg blood supply
- `Popliteal Artery` - Behind knee - Branches to leg
- `Anterior/Posterior Tibial Arteries` - Leg compartments
- `Dorsalis Pedis Artery` - Foot dorsum - Pulse location

---

## 🧴 LAYER 6: Adipose Tissue (Fat)

**Definition:** Specialized connective tissue for energy storage

**Naming Convention:**
```javascript
{
  name: 'Adipose Tissue (Region)',
  type: 'White Adipose Tissue (WAT) / Brown Adipose Tissue (BAT)',
  function: 'Energy storage, insulation, endocrine (leptin/adiponectin)',
  location: 'Subcutaneous (under skin) / Visceral (around organs)',
  composition: 'Adipocytes (fat cells) with lipid droplets'
}
```

**Distribution by Region:**
- `Subcutaneous Abdominal Adipose` - Belly fat
- `Gluteal Adipose` - Buttocks fat
- `Subcutaneous Thigh Adipose` - Thigh fat
- `Facial Adipose (Buccal Fat Pad)` - Cheek fullness

**Thickness Variations:**
- Lean athlete: 5-10mm subcutaneous fat
- Average: 10-25mm subcutaneous fat
- Higher body fat: 25mm+ subcutaneous fat

---

## 🧽 LAYER 7: Dermis (Deep Skin Layer)

**Definition:** Thick connective tissue layer containing blood vessels, nerves, hair follicles

**Naming Convention:**
```javascript
{
  name: 'Dermis (Region)',
  type: 'Dense Irregular Connective Tissue',
  layers: ['Papillary Dermis (superficial)', 'Reticular Dermis (deep)'],
  thickness: '1-4mm (varies by location)',
  contains: [
    'Blood vessels (capillary networks)',
    'Lymphatic vessels',
    'Nerve endings (touch, pressure, pain, temperature)',
    'Hair follicles',
    'Sebaceous glands (oil)',
    'Sweat glands (eccrine, apocrine)'
  ],
  function: 'Strength, elasticity, sensation, thermoregulation'
}
```

**Components:**
- `Papillary Dermis` - Loose connective tissue with dermal papillae (fingerprints)
- `Reticular Dermis` - Dense collagen/elastin network (skin strength)

---

## 🧴 LAYER 8: Epidermis (Outer Skin Surface)

**Definition:** Stratified squamous epithelium (no blood vessels)

**Naming Convention:**
```javascript
{
  name: 'Epidermis (Region)',
  type: 'Stratified Squamous Keratinized Epithelium',
  layers: [
    'Stratum Basale (deepest - stem cells)',
    'Stratum Spinosum (spiny layer)',
    'Stratum Granulosum (granular layer)',
    'Stratum Lucidum (only in thick skin - palms/soles)',
    'Stratum Corneum (superficial - dead keratinized cells)'
  ],
  thickness: '0.05mm (eyelids) to 1.5mm (palms/soles)',
  turnoverRate: '28-40 days',
  cellTypes: [
    'Keratinocytes (95% - produce keratin)',
    'Melanocytes (melanin pigment production)',
    'Langerhans cells (immune defense)',
    'Merkel cells (touch receptors)'
  ],
  function: 'Waterproofing, UV protection, pathogen barrier, sensation'
}
```

**Skin Types:**
- `Thin Skin` - Most of body, has hair, 4 epidermal layers
- `Thick Skin` - Palms/soles, no hair, 5 epidermal layers (includes stratum lucidum)

---

## 🎨 Implementation Strategy for PixelProdigy3D

### **Phase 1: Muscle System (Priority)**
1. Create major muscle groups as separate meshes
2. Attach to bone insertion/origin points
3. Name using `Muscle Latin Name (Common Name)` convention
4. Add userData with origin, insertion, action, innervation

### **Phase 2: Tendons & Ligaments**
1. Model as cylindrical/ribbon geometries
2. Connect muscles to bones (tendons) or bones to bones (ligaments)
3. Use actual anatomical tendon/ligament names
4. Add tension visualization (stretch indicators)

### **Phase 3: Fascia & Fat**
1. Create fascia as thin mesh layers wrapping muscle groups
2. Add adipose layer with variable thickness slider
3. Use transparency to see through layers
4. Enable layer visibility toggles

### **Phase 4: Skin (Dermis + Epidermis)**
1. Create smooth outer skin mesh
2. Apply skin material with subsurface scattering
3. Add skin tone variation
4. Model hair follicles, pores for detail

### **Phase 5: Neurovascular (Advanced)**
1. Model major nerve pathways as tube geometries
2. Add arterial/venous networks
3. Color-code: nerves (yellow), arteries (red), veins (blue)
4. Animate blood flow for visualization

---

## 📊 Metadata Structure Template

```javascript
// Example: Biceps Brachii Muscle
const bicepsBrachii = {
  // Mesh naming
  mesh.name: 'Biceps Brachii (Biceps)',
  
  // Metadata
  mesh.userData = {
    tissueType: 'Skeletal Muscle',
    layer: 3, // Layer number (1-8)
    
    anatomical: {
      type: 'Fusiform Muscle (Long Muscle)',
      heads: ['Long Head', 'Short Head'],
      origin: {
        longHead: 'Supraglenoid Tubercle (Scapula)',
        shortHead: 'Coracoid Process (Scapula)'
      },
      insertion: 'Radial Tuberosity (Radius)',
      action: ['Elbow Flexion', 'Forearm Supination', 'Shoulder Flexion (weak)'],
      innervation: 'Musculocutaneous Nerve (C5-C6)',
      bloodSupply: 'Brachial Artery',
      attachments: {
        proximal: ['Long Head Tendon', 'Short Head Tendon'],
        distal: ['Biceps Tendon']
      }
    },
    
    physicalProperties: {
      volume: '200-300 cm³',
      optimalLength: '~30cm',
      pennationAngle: '0° (parallel fibers)',
      fiberType: 'Mixed (Type I: 40%, Type II: 60%)'
    },
    
    clinicalNotes: [
      'Can rupture at long head tendon (Popeye deformity)',
      'Common site for intramuscular injections',
      'Visible when elbow flexed'
    ]
  }
};
```

---

## 🚀 Quick Reference: Tissue Layer Names

| Layer | Name | Material Type | Thickness | Vertices Needed |
|-------|------|---------------|-----------|----------------|
| 0 | Skeleton | Bone | N/A | 15,000+ ✅ |
| 1 | Periosteum | Membrane | 0.1-0.5mm | 5,000 |
| 1 | Cartilage | Hyaline | 2-4mm | 3,000 |
| 1 | Ligaments | Dense Regular CT | 5-20mm | 2,000 |
| 2 | Tendons | Dense Regular CT | 3-15mm | 2,000 |
| 3 | Muscles | Contractile | 1-10cm | 50,000+ |
| 4 | Deep Fascia | Dense Irregular CT | 0.5-2mm | 10,000 |
| 5 | Nerves | Neural | 1-5mm | 5,000 |
| 5 | Arteries/Veins | Vascular | 1-10mm | 5,000 |
| 6 | Adipose | Fat | 0.5-5cm | 20,000 |
| 7 | Dermis | Connective Tissue | 1-4mm | 30,000 |
| 8 | Epidermis | Epithelium | 0.05-1.5mm | 100,000 |
| **TOTAL** | **Complete Body** | **All Layers** | **Variable** | **~250,000V** |

---

## 📚 References

- **Gray's Anatomy** (42nd Edition) - Classic anatomical reference
- **Netter's Atlas of Human Anatomy** (8th Edition) - Visual muscle/nerve atlas
- **Clinically Oriented Anatomy** (Moore, Dalley, Agur) - Clinical applications
- **Terminologia Anatomica** - International anatomical terminology standards
- **Visible Human Project** - 3D anatomical imaging dataset

---

## ✅ Next Steps

1. **Implement muscle system first** - Most visually important layer
2. **Add tendon connections** - Link muscles to bones at proper insertion points
3. **Create fascia wrapping** - Smooth outer muscle appearance
4. **Add skin layer** - Final outer surface with skin tones
5. **Layer visibility controls** - Toggle each layer on/off for education

---

**Ready to build the complete anatomically accurate human body with all tissue layers!** 🧬💪🩸

