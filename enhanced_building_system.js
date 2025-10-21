/**
 * ═══════════════════════════════════════════════════════════════════════
 * ENHANCED BUILDING SYSTEM WITH MATHEMATICAL VERTEX GENERATION
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Golden ratio vertex distribution
 * - AI personality-driven transformations
 * - Precision-based detail levels
 * - Surface enhancement with fractal noise
 * - Bakersfield College campus buildings
 * - Log cabin generation
 */

// ═══════════════════════════════════════════════════════════════════════
// MATHEMATICAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895; // Golden ratio
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];

// ═══════════════════════════════════════════════════════════════════════
// VERTEX GENERATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate vertex count based on precision and AI personality
 */
function calculateVertexCount(precision, aiPersonality = 'standard') {
    const baseSegments = 8;
    const maxSegments = 64;
    
    // AI personality affects detail level
    const personalityMultipliers = {
        'industrial_designer': 1.2,   // AI #33 - More precise
        'interior_designer': 1.1,      // AI #30 - Luxurious detail
        'residential_architect': 1.0,  // AI #25 - Standard
        'organic_naturalist': 0.9,     // AI #14 - Natural, fewer vertices
        'visionary_artist': 0.8,       // AI #1 - Artistic simplicity
        'standard': 1.0
    };
    
    const multiplier = personalityMultipliers[aiPersonality] || 1.0;
    const segments = Math.floor(
        baseSegments + (maxSegments - baseSegments) * (precision / 100) * multiplier
    );
    
    return {
        widthSegments: segments,
        heightSegments: segments,
        depthSegments: Math.max(4, Math.floor(segments * 0.5))
    };
}

/**
 * Apply golden ratio distribution to vertices
 */
function applyGoldenRatioDistribution(geometry) {
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 9) { // Every 3 vertices = 1 face
        const angle = (i / 9) * PHI * Math.PI * 2;
        const fibIndex = Math.floor(i / 9) % FIBONACCI.length;
        const offset = FIBONACCI[fibIndex] * 0.001;
        
        // Subtle golden ratio-based displacement
        positions[i] += Math.cos(angle) * offset;
        positions[i + 1] += Math.sin(angle) * offset;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}

/**
 * Apply AI personality transformations to geometry
 */
function applyAIPersonality(geometry, personality) {
    const positions = geometry.attributes.position.array;
    
    switch(personality) {
        case 'organic_naturalist': // AI #14 - Natural variation
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                
                positions[i] += Math.sin(y * 10) * 0.05;
                positions[i + 1] += Math.cos(x * 10) * 0.05;
                positions[i + 2] += Math.sin(x * y) * 0.03;
            }
            break;
            
        case 'interior_designer': // AI #30 - Luxurious 10% scale
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] *= 1.1;
                positions[i + 1] *= 1.1;
                positions[i + 2] *= 1.1;
            }
            break;
            
        case 'residential_architect': // AI #25 - Precise structural
            // No transformation - keep exact proportions
            break;
            
        case 'visionary_artist': // AI #1 - Creative sine waves
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                
                positions[i] *= (1 + Math.sin(y * 5) * 0.1);
                positions[i + 1] *= (1 + Math.cos(x * 5) * 0.1);
            }
            break;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}

/**
 * Add surface detail using fractal noise
 */
function addSurfaceDetail(geometry, detailLevel = 1.0) {
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Multi-octave noise
        const noise = 
            Math.sin(x * 10 * detailLevel) * 0.015 +
            Math.sin(y * 15 * detailLevel) * 0.010 +
            Math.sin(z * 20 * detailLevel) * 0.008 +
            Math.sin(x * y * 5) * 0.005;
        
        // Displace along normal
        positions[i] += normals[i] * noise;
        positions[i + 1] += normals[i + 1] * noise;
        positions[i + 2] += normals[i + 2] * noise;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}

// ═══════════════════════════════════════════════════════════════════════
// BUILDING GENERATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create enhanced building with vertex rendering
 */
function createEnhancedBuilding(config) {
    const {
        width = 20,
        height = 15,
        depth = 20,
        precision = 70,
        aiPersonality = 'residential_architect',
        detailLevel = 1.0,
        color = 0xcccccc,
        name = 'Building'
    } = config;
    
    const building = new THREE.Group();
    building.name = name;
    building.userData.isBuilding = true;
    building.userData.aiPersonality = aiPersonality;
    building.userData.precision = precision;
    
    // Calculate vertex counts based on precision
    const vertexCounts = calculateVertexCount(precision, aiPersonality);
    
    // Main structure with enhanced vertices
    const wallsGeom = new THREE.BoxGeometry(
        width, height, depth,
        vertexCounts.widthSegments,
        vertexCounts.heightSegments,
        vertexCounts.depthSegments
    );
    
    // Apply enhancements
    applyGoldenRatioDistribution(wallsGeom);
    applyAIPersonality(wallsGeom, aiPersonality);
    addSurfaceDetail(wallsGeom, detailLevel);
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: aiPersonality === 'industrial_designer'
    });
    
    const walls = new THREE.Mesh(wallsGeom, wallMaterial);
    walls.position.y = height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    building.add(walls);
    
    // Roof with enhanced detail
    const roofGeom = new THREE.ConeGeometry(
        Math.max(width, depth) * 0.7,
        height * 0.3,
        Math.max(4, vertexCounts.widthSegments / 2)
    );
    
    applyGoldenRatioDistribution(roofGeom);
    
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
    });
    
    const roof = new THREE.Mesh(roofGeom, roofMaterial);
    roof.position.y = height + height * 0.15;
    roof.castShadow = true;
    building.add(roof);
    
    // Add metadata
    building.userData.vertexCount = 
        wallsGeom.attributes.position.count +
        roofGeom.attributes.position.count;
    
    console.log(`🏢 ${name}: ${building.userData.vertexCount} vertices (${precision}% precision, AI: ${aiPersonality})`);
    
    return building;
}

/**
 * Create log cabin with realistic wood details
 */
function createLogCabin(type = 'hunter') {
    const cabin = new THREE.Group();
    cabin.name = `LogCabin_${type}`;
    cabin.userData.isBuilding = true;
    cabin.userData.type = type;
    
    const configs = {
        hunter: { width: 8, height: 5, depth: 8, logs: 12 },
        family: { width: 15, height: 8, depth: 12, logs: 16 },
        ranger: { width: 10, height: 12, depth: 10, logs: 14 },
        abandoned: { width: 7, height: 4, depth: 7, logs: 10 }
    };
    
    const config = configs[type];
    
    // Log walls (horizontal logs stacked)
    const logHeight = 0.4;
    const numLogs = config.logs;
    
    for (let i = 0; i < numLogs; i++) {
        const y = i * logHeight;
        
        // Front and back logs
        const logFront = createLog(config.width, y, -config.depth / 2, config.width);
        const logBack = createLog(config.width, y, config.depth / 2, config.width);
        cabin.add(logFront, logBack);
        
        // Side logs
        if (i % 2 === 0) { // Alternate to create corner joints
            const logLeft = createLog(config.depth, y, 0, config.depth, Math.PI / 2);
            logLeft.position.x = -config.width / 2;
            const logRight = createLog(config.depth, y, 0, config.depth, Math.PI / 2);
            logRight.position.x = config.width / 2;
            cabin.add(logLeft, logRight);
        }
    }
    
    // Roof
    const roofHeight = config.height * 0.4;
    const roofGeom = new THREE.ConeGeometry(
        Math.max(config.width, config.depth) * 0.8,
        roofHeight,
        4
    );
    const roofMat = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.95
    });
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.y = config.height + roofHeight / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    cabin.add(roof);
    
    // Door
    const doorGeom = new THREE.BoxGeometry(2, 3, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({
        color: 0x3d2817,
        roughness: 0.9
    });
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(0, 1.5, -config.depth / 2 - 0.1);
    cabin.add(door);
    
    // Windows
    const windowGeom = new THREE.BoxGeometry(1.5, 1.5, 0.1);
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        opacity: 0.7,
        transparent: true
    });
    
    const window1 = new THREE.Mesh(windowGeom, windowMat);
    window1.position.set(-config.width / 4, config.height / 2, -config.depth / 2 - 0.05);
    const window2 = new THREE.Mesh(windowGeom, windowMat);
    window2.position.set(config.width / 4, config.height / 2, -config.depth / 2 - 0.05);
    cabin.add(window1, window2);
    
    console.log(`🪵 Log cabin (${type}) created`);
    
    return cabin;
}

/**
 * Create individual log with wood grain
 */
function createLog(length, y, z, width, rotationY = 0) {
    const logRadius = 0.2;
    const segments = 16;
    
    const logGeom = new THREE.CylinderGeometry(logRadius, logRadius, length, segments);
    
    // Add wood grain detail
    addSurfaceDetail(logGeom, 2.0);
    
    const logMat = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.9,
        metalness: 0.0
    });
    
    const log = new THREE.Mesh(logGeom, logMat);
    log.position.set(0, y, z);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = rotationY;
    log.castShadow = true;
    log.receiveShadow = true;
    
    return log;
}

console.log('✅ Enhanced building system loaded with mathematical vertex generation');
