// PixelProdigy AI - Universal Object Generator
// Generates 100,000+ 3D objects from base templates

const fs = require('fs').promises;
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  outputDir: './generated_objects',
  templatesDir: './templates',
  categoriesFile: './categories.json',
  
  generation: {
    variantsPerBase: 212,  // 471 base types × 212 variants = ~99,852 objects ≈ 100K
    totalCategories: 10,
    subCategoriesPerCategory: 100,
    totalObjects: 100000
  },
  
  aiPersonalities: {
    industrialDesigner: 33,
    modeler3D: 22,
    colorTheory: 28,
    materialScientist: 35,
    qualityAssurance: 55
  }
};

// ============================================
// BASE OBJECT TEMPLATE
// ============================================

class ObjectTemplate {
  constructor(category, subCategory, type, subType) {
    this.category = category;
    this.subCategory = subCategory;
    this.type = type;
    this.subType = subType;
  }
  
  generateBase() {
    const objectId = this.generateObjectId(0);
    
    return {
      objectId,
      category: this.category,
      subCategory: this.subCategory,
      type: this.type,
      subType: this.subType,
      
      metadata: this.generateMetadata(),
      visual: this.generateVisual(),
      physical: this.generatePhysical(),
      placement: this.generatePlacement(),
      features: this.generateFeatures(),
      customization: this.generateCustomization(),
      aiGeneration: this.generateAIInfo(),
      performance: this.generatePerformance()
    };
  }
  
  generateObjectId(variant = 0) {
    const cat = this.category.toLowerCase().replace(/\s+/g, '_');
    const sub = this.subCategory.toLowerCase().replace(/\s+/g, '_');
    const type = this.type.toLowerCase().replace(/\s+/g, '_');
    const subtype = this.subType.toLowerCase().replace(/\s+/g, '_');
    const variantStr = variant.toString().padStart(3, '0');
    
    return `obj_${cat}_${sub}_${type}_${subtype}_${variantStr}`;
  }
  
  generateMetadata() {
    return {
      name: `${this.subType} - ${this.type}`,
      description: `High-quality ${this.subType.toLowerCase()} ${this.type.toLowerCase()} for your MyPlace property`,
      tags: [
        this.category.toLowerCase(),
        this.subCategory.toLowerCase(),
        this.type.toLowerCase()
      ],
      rarity: this.determineRarity(),
      price: this.generatePrice(),
      popularity: Math.random() * 10,
      userRating: 4 + Math.random()
    };
  }
  
  determineRarity() {
    const rand = Math.random();
    if (rand < 0.60) return 'common';
    if (rand < 0.85) return 'rare';
    if (rand < 0.95) return 'epic';
    return 'legendary';
  }
  
  generatePrice() {
    const rarityPrices = {
      common: { coins: 50, usd: 0.99 },
      rare: { coins: 150, usd: 2.99 },
      epic: { coins: 500, usd: 9.99 },
      legendary: { coins: 2000, usd: 49.99 }
    };
    
    return {
      myplaceCoins: rarityPrices[this.metadata?.rarity || 'common'].coins,
      usd: rarityPrices[this.metadata?.rarity || 'common'].usd
    };
  }
  
  generateVisual() {
    const modelPath = this.generateModelPath();
    
    return {
      model: {
        format: 'GLTF',
        path: modelPath,
        polyCount: 5000 + Math.floor(Math.random() * 15000),
        textureResolution: '2048x2048',
        lod: [
          { distance: 0, polyCount: 15000 },
          { distance: 10, polyCount: 5000 },
          { distance: 50, polyCount: 1000 }
        ]
      },
      materials: this.generateMaterials(),
      colors: this.generateColors(),
      thumbnail: modelPath.replace('.gltf', '_thumb.jpg'),
      preview360: modelPath.replace('.gltf', '_preview/')
    };
  }
  
  generateModelPath() {
    const cat = this.category.toLowerCase().replace(/\s+/g, '_');
    const sub = this.subCategory.toLowerCase().replace(/\s+/g, '_');
    const type = this.type.toLowerCase().replace(/\s+/g, '_');
    return `/models/${cat}/${sub}/${type}.gltf`;
  }
  
  generateMaterials() {
    return [
      {
        name: 'Primary Material',
        type: 'PBR',
        baseColor: this.generateHexColor(),
        metallic: Math.random() * 0.5,
        roughness: 0.3 + Math.random() * 0.5
      }
    ];
  }
  
  generateColors() {
    return {
      primary: this.generateHexColor(),
      secondary: this.generateHexColor(),
      accent: this.generateHexColor()
    };
  }
  
  generateHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }
  
  generatePhysical() {
    const width = 0.5 + Math.random() * 2;
    const height = 0.5 + Math.random() * 2;
    const depth = 0.5 + Math.random() * 2;
    
    return {
      dimensions: {
        width,
        height,
        depth,
        unit: 'meters'
      },
      weight: width * height * depth * 10, // Approximate kg
      boundingBox: {
        min: { x: -width/2, y: 0, z: -depth/2 },
        max: { x: width/2, y: height, z: depth/2 }
      },
      collisionMesh: 'simplified',
      mass: width * height * depth * 10,
      friction: 0.5 + Math.random() * 0.3,
      restitution: 0.1 + Math.random() * 0.2
    };
  }
  
  generatePlacement() {
    return {
      surface: 'floor',
      wallMountable: Math.random() > 0.7,
      ceilingMountable: Math.random() > 0.9,
      stackable: Math.random() > 0.8,
      rotatable: true,
      snapToGrid: true,
      gridSize: 0.1,
      allowedRooms: this.determineAllowedRooms(),
      minimumSpacing: 0.2 + Math.random() * 0.5
    };
  }
  
  determineAllowedRooms() {
    const allRooms = [
      'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 
      'Office', 'Dining Room', 'Game Room', 'Observatory',
      'Rooftop', 'Entryway', 'Garage'
    ];
    
    // Return 3-8 random rooms
    const count = 3 + Math.floor(Math.random() * 6);
    return allRooms.sort(() => Math.random() - 0.5).slice(0, count);
  }
  
  generateFeatures() {
    return {
      adjustable: Math.random() > 0.7,
      interactive: Math.random() > 0.5,
      animated: Math.random() > 0.6,
      animations: this.generateAnimations(),
      sounds: this.generateSounds()
    };
  }
  
  generateAnimations() {
    if (Math.random() > 0.6) return [];
    
    return [
      { name: 'idle', duration: 2.0, loop: true },
      { name: 'interact', duration: 1.0, loop: false }
    ];
  }
  
  generateSounds() {
    if (Math.random() > 0.7) return [];
    
    return [
      { action: 'place', sound: '/sounds/place.mp3' },
      { action: 'interact', sound: '/sounds/interact.mp3' }
    ];
  }
  
  generateCustomization() {
    return {
      customizable: Math.random() > 0.5,
      options: [
        {
          property: 'color',
          type: 'palette',
          choices: this.generateColorChoices(5),
          default: 0
        },
        {
          property: 'material',
          type: 'selection',
          choices: ['Default', 'Wood', 'Metal', 'Glass', 'Fabric'],
          default: 'Default'
        }
      ]
    };
  }
  
  generateColorChoices(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(this.generateHexColor());
    }
    return colors;
  }
  
  generateAIInfo() {
    return {
      generatedBy: [
        `AI Personality #${CONFIG.aiPersonalities.industrialDesigner} (Industrial Designer)`,
        `AI Personality #${CONFIG.aiPersonalities.modeler3D} (3D Modeler)`
      ],
      procedural: true,
      baseTemplate: this.generateObjectId(0),
      variations: CONFIG.generation.variantsPerBase,
      generationDate: new Date().toISOString().split('T')[0],
      qualityScore: 7 + Math.random() * 3
    };
  }
  
  generatePerformance() {
    return {
      gpuInstancing: true,
      occlusionCulling: true,
      frustumCulling: true,
      renderOrder: 0,
      castShadows: true,
      receiveShadows: true
    };
  }
  
  // ============================================
  // VARIANT GENERATION
  // ============================================
  
  generateVariants(count = 100) {
    const baseObject = this.generateBase();
    const variants = [baseObject]; // Include base as variant 0
    
    const colorPalettes = this.generateMultipleColorPalettes(20);
    const materials = ['leather', 'mesh', 'fabric', 'velvet', 'vinyl', 'wood', 'metal', 'glass', 'plastic', 'rubber'];
    const styles = ['modern', 'classic', 'industrial', 'minimalist', 'rustic', 'vintage', 'contemporary', 'traditional', 'scandinavian', 'bohemian'];
    const sizes = ['xs', 'small', 'medium', 'large', 'xl'];
    
    for (let i = 1; i < count; i++) {
      const variant = JSON.parse(JSON.stringify(baseObject)); // Deep clone
      
      // Update variant-specific properties
      variant.objectId = this.generateObjectId(i);
      variant.metadata.name = `${baseObject.metadata.name} - Variant ${i}`;
      
      // Apply color variation
      const colorIndex = i % colorPalettes.length;
      variant.visual.colors = colorPalettes[colorIndex];
      variant.visual.materials[0].baseColor = colorPalettes[colorIndex].primary;
      
      // Apply material variation
      const materialIndex = Math.floor(i / 10) % materials.length;
      variant.metadata.material = materials[materialIndex];
      variant.metadata.tags.push(materials[materialIndex]);
      
      // Apply style variation
      const styleIndex = Math.floor(i / 20) % styles.length;
      variant.metadata.style = styles[styleIndex];
      variant.metadata.tags.push(styles[styleIndex]);
      
      // Apply size variation
      const sizeIndex = Math.floor(i / 25) % sizes.length;
      const sizeMultiplier = [0.7, 0.85, 1.0, 1.15, 1.3][sizeIndex];
      variant.metadata.size = sizes[sizeIndex];
      variant.physical.dimensions.width *= sizeMultiplier;
      variant.physical.dimensions.height *= sizeMultiplier;
      variant.physical.dimensions.depth *= sizeMultiplier;
      variant.physical.weight *= (sizeMultiplier ** 3);
      
      variants.push(variant);
    }
    
    return variants;
  }
  
  generateMultipleColorPalettes(count) {
    const palettes = [];
    for (let i = 0; i < count; i++) {
      palettes.push({
        primary: this.generateHexColor(),
        secondary: this.generateHexColor(),
        accent: this.generateHexColor()
      });
    }
    return palettes;
  }
}

// ============================================
// CATEGORY DEFINITIONS
// ============================================

const CATEGORIES = {
  furniture: {
    name: 'Furniture',
    subCategories: {
      seating: {
        name: 'Seating',
        types: {
          chairs: ['Office', 'Dining', 'Lounge', 'Accent', 'Gaming', 'Rocking', 'Folding', 'Bar Stool', 'Ergonomic', 'Executive'],
          sofas: ['Sectional', 'Loveseat', 'Sleeper', 'Chesterfield', 'Modern', 'L-Shaped', 'Recliner', 'Futon', 'Settee', 'Daybed'],
          benches: ['Indoor', 'Outdoor', 'Storage', 'Entryway', 'Dining', 'Piano', 'Garden', 'Window', 'Mudroom', 'Vanity']
        }
      },
      tables: {
        name: 'Tables',
        types: {
          coffee: ['Glass', 'Wood', 'Marble', 'Lift-Top', 'Nesting', 'Ottoman', 'Trunk', 'Round', 'Square', 'Rectangle'],
          dining: ['Rectangular', 'Round', 'Oval', 'Square', 'Extendable', 'Counter', 'Bar', 'Farmhouse', 'Pedestal', 'Trestle'],
          desks: ['Computer', 'Writing', 'Standing', 'Corner', 'L-Shaped', 'Executive', 'Secretary', 'Roll-Top', 'Floating', 'Gaming']
        }
      },
      storage: {
        name: 'Storage',
        types: {
          shelves: ['Floating', 'Bookshelf', 'Corner', 'Ladder', 'Cube', 'Industrial', 'Wall-Mounted', 'Adjustable', 'Modular', 'Display'],
          cabinets: ['Storage', 'Display', 'File', 'Media', 'Kitchen', 'Bathroom', 'Garage', 'Medicine', 'Linen', 'China'],
          dressers: ['6-Drawer', '3-Drawer', 'Tall', 'Wide', 'Combo', 'Vintage', 'Modern', 'Rustic', 'Campaign', 'Mirror']
        }
      }
    }
  },
  
  architecture: {
    name: 'Architecture',
    subCategories: {
      walls: {
        name: 'Walls',
        types: {
          plain: ['Drywall', 'Plaster', 'Concrete', 'Wood Panel', 'Painted', 'Textured', 'Smooth', 'Accent', 'Feature', 'Partition'],
          glass: ['Clear', 'Frosted', 'Tinted', 'Smart', 'Soundproof', 'Privacy', 'Floor-to-Ceiling', 'Sliding', 'Folding', 'Curved']
        }
      },
      doors: {
        name: 'Doors',
        types: {
          entry: ['Single', 'Double', 'French', 'Dutch', 'Pivot', 'Sliding', 'Pocket', 'Barn', 'Bifold', 'Revolving'],
          interior: ['Standard', 'Hollow', 'Solid', 'Glass', 'Panel', 'Flush', 'Louvered', 'Mirrored', 'Barn', 'Pocket']
        }
      },
      windows: {
        name: 'Windows',
        types: {
          standard: ['Single Hung', 'Double Hung', 'Casement', 'Awning', 'Sliding', 'Picture', 'Bay', 'Bow', 'Garden', 'Skylight'],
          specialty: ['Floor-to-Ceiling', 'Corner', 'Arched', 'Circle', 'Triangle', 'Custom Shape', 'Smart Glass', 'Stained Glass', 'Frosted', 'Tinted']
        }
      }
    }
  },
  
  electronics: {
    name: 'Electronics',
    subCategories: {
      entertainment: {
        name: 'Entertainment',
        types: {
          televisions: ['LED', 'OLED', 'QLED', 'Projector', 'Holographic', 'Smart TV', '4K', '8K', 'Gaming Monitor', 'Portable'],
          audio: ['Soundbar', 'Speakers', 'Headphones', 'Turntable', 'Receiver', 'Amplifier', 'Subwoofer', 'Studio Monitor', 'Bluetooth Speaker', 'Home Theater']
        }
      },
      computers: {
        name: 'Computers',
        types: {
          desktop: ['Gaming', 'Workstation', 'All-in-One', 'Mini PC', 'Server', 'Custom Build', 'Mac', 'Windows', 'Linux', 'Creator Station'],
          laptop: ['Gaming', 'Ultrabook', 'Chromebook', 'MacBook', 'Tablet', '2-in-1', 'Budget', 'Business', 'Creator', 'Student']
        }
      }
    }
  },
  
  vehicles: {
    name: 'Vehicles',
    subCategories: {
      ground: {
        name: 'Ground Vehicles',
        types: {
          cars: ['Sedan', 'SUV', 'Sports', 'Electric', 'Hybrid', 'Luxury', 'Compact', 'Truck', 'Van', 'Classic'],
          motorcycles: ['Sport', 'Cruiser', 'Touring', 'Dirt', 'Electric', 'Scooter', 'Vintage', 'Custom', 'Racing', 'Adventure']
        }
      },
      air: {
        name: 'Aircraft',
        types: {
          personal: ['Helicopter', 'Small Jet', 'Prop Plane', 'Glider', 'Ultralight', 'Gyrocopter', 'Jetpack', 'Flying Car', 'Drone', 'Hot Air Balloon'],
          commercial: ['Airliner', 'Cargo Plane', 'Private Jet', 'Charter', 'Seaplane', 'Military', 'Vintage', 'Experimental', 'eVTOL', 'Supersonic']
        }
      }
    }
  },
  
  nature: {
    name: 'Nature',
    subCategories: {
      plants: {
        name: 'Plants',
        types: {
          trees: ['Oak', 'Maple', 'Pine', 'Palm', 'Cherry Blossom', 'Birch', 'Willow', 'Cedar', 'Redwood', 'Bonsai'],
          indoor: ['Fern', 'Succulent', 'Snake Plant', 'Pothos', 'Monstera', 'Fiddle Leaf', 'Peace Lily', 'Spider Plant', 'Cactus', 'Orchid']
        }
      },
      landscape: {
        name: 'Landscape',
        types: {
          rocks: ['Boulder', 'Pebble', 'Gravel', 'Stone', 'Crystal', 'Marble', 'Granite', 'Slate', 'River Rock', 'Lava Rock'],
          water: ['Fountain', 'Pond', 'Waterfall', 'Stream', 'Pool', 'Hot Tub', 'Koi Pond', 'Rain Garden', 'Bird Bath', 'Water Wall']
        }
      }
    }
  },
  
  food: {
    name: 'Food & Beverage',
    subCategories: {
      food: {
        name: 'Food Items',
        types: {
          fresh: ['Apple', 'Banana', 'Orange', 'Strawberry', 'Carrot', 'Broccoli', 'Lettuce', 'Tomato', 'Avocado', 'Mango'],
          prepared: ['Pizza', 'Burger', 'Pasta', 'Sushi', 'Sandwich', 'Salad', 'Steak', 'Chicken', 'Fish', 'Tacos']
        }
      },
      beverages: {
        name: 'Beverages',
        types: {
          hot: ['Coffee', 'Tea', 'Hot Chocolate', 'Espresso', 'Latte', 'Cappuccino', 'Mocha', 'Americano', 'Chai', 'Matcha'],
          cold: ['Water', 'Juice', 'Soda', 'Smoothie', 'Iced Tea', 'Lemonade', 'Energy Drink', 'Sports Drink', 'Milk', 'Beer']
        }
      }
    }
  },
  
  clothing: {
    name: 'Clothing & Accessories',
    subCategories: {
      tops: {
        name: 'Tops',
        types: {
          casual: ['T-Shirt', 'Tank Top', 'Polo', 'Blouse', 'Sweater', 'Hoodie', 'Sweatshirt', 'Cardigan', 'Vest', 'Flannel'],
          formal: ['Dress Shirt', 'Button-Up', 'Blazer', 'Suit Jacket', 'Tuxedo Shirt', 'Oxford', 'Evening Top', 'Cocktail Top', 'Silk Blouse', 'Cashmere Sweater']
        }
      },
      accessories: {
        name: 'Accessories',
        types: {
          bags: ['Backpack', 'Messenger', 'Tote', 'Clutch', 'Crossbody', 'Duffel', 'Briefcase', 'Purse', 'Wallet', 'Laptop Bag'],
          jewelry: ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Watch', 'Anklet', 'Brooch', 'Pendant', 'Chain', 'Cufflinks']
        }
      }
    }
  },
  
  tools: {
    name: 'Tools & Equipment',
    subCategories: {
      hand: {
        name: 'Hand Tools',
        types: {
          basic: ['Hammer', 'Screwdriver', 'Wrench', 'Pliers', 'Tape Measure', 'Level', 'Utility Knife', 'Allen Key', 'Chisel', 'File'],
          specialized: ['Socket Set', 'Torque Wrench', 'Pipe Wrench', 'Wire Stripper', 'Multimeter', 'Caliper', 'Stud Finder', 'Laser Level', 'Angle Grinder', 'Jigsaw']
        }
      },
      power: {
        name: 'Power Tools',
        types: {
          drilling: ['Drill', 'Impact Driver', 'Hammer Drill', 'Rotary Tool', 'Drill Press', 'Cordless Drill', 'SDS Drill', 'Right Angle Drill', 'Magnetic Drill', 'Auger'],
          cutting: ['Circular Saw', 'Miter Saw', 'Jigsaw', 'Band Saw', 'Table Saw', 'Reciprocating Saw', 'Chainsaw', 'Tile Saw', 'Plasma Cutter', 'Angle Grinder']
        }
      }
    }
  },
  
  art: {
    name: 'Art & Decor',
    subCategories: {
      wall: {
        name: 'Wall Art',
        types: {
          paintings: ['Abstract', 'Landscape', 'Portrait', 'Modern', 'Impressionist', 'Pop Art', 'Minimalist', 'Surreal', 'Realism', 'Expressionist'],
          prints: ['Canvas', 'Framed', 'Poster', 'Photo', 'Giclee', 'Screen Print', 'Lithograph', 'Digital', 'Metal', 'Wood']
        }
      },
      sculptures: {
        name: 'Sculptures',
        types: {
          material: ['Bronze', 'Marble', 'Wood', 'Metal', 'Glass', 'Stone', 'Clay', 'Resin', 'Ice', 'Sand'],
          style: ['Abstract', 'Modern', 'Classical', 'Contemporary', 'Minimalist', 'Figurative', 'Kinetic', 'Installation', 'Relief', 'Bust']
        }
      }
    }
  },
  
  education: {
    name: 'Education & Real-World Systems',
    subCategories: {
      financial: {
        name: 'Financial Documents',
        types: {
          property: ['Rent Payment', 'Mortgage Statement', 'Property Tax Bill', 'Utility Bill', 'Insurance Policy', 'HOA Notice', 'Maintenance Invoice', 'Foreclosure Notice', 'Lease Agreement', 'Purchase Contract'],
          banking: ['Bank Statement', 'Pay Stub', 'Tax Return', 'Credit Report', 'Loan Document', 'Budget Worksheet', 'Investment Statement', 'Savings Account', 'Checking Account', 'Certificate of Deposit']
        }
      },
      educational: {
        name: 'Educational Materials',
        types: {
          books: ['Textbook', 'Workbook', 'Reference', 'Study Guide', 'Test Prep', 'Dictionary', 'Encyclopedia', 'Manual', 'Handbook', 'Course Book'],
          supplies: ['Calculator', 'Notebook', 'Binder', 'Pencil', 'Pen', 'Highlighter', 'Ruler', 'Compass', 'Protractor', 'Eraser']
        }
      }
    }
  }
};

// ============================================
// OBJECT GENERATOR
// ============================================

class ObjectGenerator {
  constructor() {
    this.generatedObjects = [];
    this.statistics = {
      totalObjects: 0,
      byCategory: {},
      byRarity: { common: 0, rare: 0, epic: 0, legendary: 0 }
    };
  }
  
  async generateAll() {
    console.log('🎨 Starting Universal Object Generation...\n');
    
    for (const [categoryKey, categoryData] of Object.entries(CATEGORIES)) {
      console.log(`📦 Generating ${categoryData.name} objects...`);
      
      for (const [subKey, subData] of Object.entries(categoryData.subCategories)) {
        console.log(`  └─ ${subData.name}...`);
        
        for (const [typeKey, subTypes] of Object.entries(subData.types)) {
          for (const subType of subTypes) {
            await this.generateObjectSet(
              categoryData.name,
              subData.name,
              typeKey.charAt(0).toUpperCase() + typeKey.slice(1),
              subType
            );
          }
        }
      }
      
      console.log(`✅ ${categoryData.name} complete!\n`);
    }
    
    console.log('🎉 Object generation complete!');
    this.printStatistics();
  }
  
  async generateObjectSet(category, subCategory, type, subType) {
    const template = new ObjectTemplate(category, subCategory, type, subType);
    const variants = template.generateVariants(CONFIG.generation.variantsPerBase);
    
    this.generatedObjects.push(...variants);
    
    // Update statistics
    this.statistics.totalObjects += variants.length;
    
    if (!this.statistics.byCategory[category]) {
      this.statistics.byCategory[category] = 0;
    }
    this.statistics.byCategory[category] += variants.length;
    
    // Count rarities
    variants.forEach(obj => {
      this.statistics.byRarity[obj.metadata.rarity]++;
    });
    
    // Save to file
    await this.saveObjectSet(category, subCategory, type, subType, variants);
  }
  
  async saveObjectSet(category, subCategory, type, subType, objects) {
    const dirPath = path.join(
      CONFIG.outputDir,
      category.toLowerCase().replace(/\s+/g, '_'),
      subCategory.toLowerCase().replace(/\s+/g, '_'),
      type.toLowerCase().replace(/\s+/g, '_')
    );
    
    await fs.mkdir(dirPath, { recursive: true });
    
    const fileName = `${subType.toLowerCase().replace(/\s+/g, '_')}.json`;
    const filePath = path.join(dirPath, fileName);
    
    await fs.writeFile(
      filePath,
      JSON.stringify(objects, null, 2),
      'utf8'
    );
  }
  
  printStatistics() {
    console.log('\n📊 Generation Statistics:');
    console.log('═══════════════════════════');
    console.log(`Total Objects: ${this.statistics.totalObjects.toLocaleString()}`);
    console.log('\nBy Category:');
    for (const [category, count] of Object.entries(this.statistics.byCategory)) {
      console.log(`  ${category}: ${count.toLocaleString()}`);
    }
    console.log('\nBy Rarity:');
    for (const [rarity, count] of Object.entries(this.statistics.byRarity)) {
      const percentage = ((count / this.statistics.totalObjects) * 100).toFixed(1);
      console.log(`  ${rarity}: ${count.toLocaleString()} (${percentage}%)`);
    }
  }
  
  async exportCatalog() {
    const catalogPath = path.join(CONFIG.outputDir, 'catalog.json');
    await fs.writeFile(
      catalogPath,
      JSON.stringify({
        version: '1.0',
        generatedAt: new Date().toISOString(),
        totalObjects: this.statistics.totalObjects,
        statistics: this.statistics,
        categories: CATEGORIES
      }, null, 2),
      'utf8'
    );
    
    console.log(`\n💾 Catalog exported to: ${catalogPath}`);
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  PixelProdigy AI Object Generator     ║');
  console.log('║  100,000+ Universal Objects            ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  const generator = new ObjectGenerator();
  
  try {
    await generator.generateAll();
    await generator.exportCatalog();
    
    console.log('\n✨ Generation complete! Objects ready for import.\n');
  } catch (error) {
    console.error('❌ Error during generation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = { ObjectTemplate, ObjectGenerator, CATEGORIES };
