/**
 * Mathematical Sequence Analyzer for PixelProdigy3D
 * Combines famous mathematical sequences up to 3 layers deep
 * Analyzes geometric properties for optimal 3D shape generation
 * 
 * Famous Mathematicians & Their Sequences:
 * - Fibonacci (Leonardo Pisano): 1, 1, 2, 3, 5, 8, 13...
 * - Lucas (Édouard Lucas): 2, 1, 3, 4, 7, 11, 18...
 * - Pell (John Pell): 0, 1, 2, 5, 12, 29, 70...
 * - Jacobsthal (Ernst Jacobsthal): 0, 1, 1, 3, 5, 11, 21...
 * - Padovan (Richard Padovan): 1, 1, 1, 2, 2, 3, 4...
 * - Perrin (François Olivier Raoul Perrin): 3, 0, 2, 3, 2, 5, 5...
 * - Tribonacci (Leonardo again): 0, 0, 1, 1, 2, 4, 7...
 * - Catalan (Eugène Charles Catalan): 1, 1, 2, 5, 14, 42, 132...
 */

// ===== SEQUENCE GENERATORS =====

const sequences = {
    fibonacci: (n) => {
        const seq = [1, 1];
        for (let i = 2; i < n; i++) {
            seq.push(seq[i-1] + seq[i-2]);
        }
        return seq;
    },
    
    lucas: (n) => {
        const seq = [2, 1];
        for (let i = 2; i < n; i++) {
            seq.push(seq[i-1] + seq[i-2]);
        }
        return seq;
    },
    
    pell: (n) => {
        const seq = [0, 1];
        for (let i = 2; i < n; i++) {
            seq.push(2 * seq[i-1] + seq[i-2]);
        }
        return seq;
    },
    
    jacobsthal: (n) => {
        const seq = [0, 1];
        for (let i = 2; i < n; i++) {
            seq.push(seq[i-1] + 2 * seq[i-2]);
        }
        return seq;
    },
    
    padovan: (n) => {
        const seq = [1, 1, 1];
        for (let i = 3; i < n; i++) {
            seq.push(seq[i-2] + seq[i-3]);
        }
        return seq;
    },
    
    perrin: (n) => {
        const seq = [3, 0, 2];
        for (let i = 3; i < n; i++) {
            seq.push(seq[i-2] + seq[i-3]);
        }
        return seq;
    },
    
    tribonacci: (n) => {
        const seq = [0, 0, 1];
        for (let i = 3; i < n; i++) {
            seq.push(seq[i-1] + seq[i-2] + seq[i-3]);
        }
        return seq;
    },
    
    catalan: (n) => {
        const seq = [1];
        for (let i = 1; i < n; i++) {
            seq.push(seq[i-1] * 2 * (2*i - 1) / (i + 1));
        }
        return seq;
    }
};

// ===== COMBINATION STRATEGIES =====

const combinationStrategies = {
    add: (a, b) => a.map((val, i) => val + (b[i] || 0)),
    multiply: (a, b) => a.map((val, i) => val * (b[i] || 1)),
    interleave: (a, b) => {
        const result = [];
        const maxLen = Math.max(a.length, b.length);
        for (let i = 0; i < maxLen; i++) {
            if (i < a.length) result.push(a[i]);
            if (i < b.length) result.push(b[i]);
        }
        return result;
    },
    ratio: (a, b) => a.map((val, i) => b[i] ? val / b[i] : val),
    modulo: (a, b) => a.map((val, i) => b[i] ? val % (b[i] + 1) : val),
    power: (a, b) => a.map((val, i) => Math.pow(val, (b[i] % 3) + 1) % 1000), // Keep manageable
    harmonic: (a, b) => a.map((val, i) => b[i] ? (2 * val * b[i]) / (val + b[i]) : val)
};

// ===== GEOMETRIC ANALYSIS =====

function analyzeGeometricProperties(sequence, name) {
    const normalized = sequence.slice(0, 20).map(v => Math.abs(v));
    const max = Math.max(...normalized);
    const normalizedSeq = normalized.map(v => v / (max || 1));
    
    // Calculate key geometric properties
    const goldenRatio = 1.618033988749895;
    const silverRatio = 2.414213562373095;
    const plasticNumber = 1.324717957244746; // Padovan constant
    
    // Ratio convergence (how quickly does a[n]/a[n-1] converge to a constant?)
    const ratios = [];
    for (let i = 1; i < normalized.length; i++) {
        if (normalized[i-1] !== 0) {
            ratios.push(normalized[i] / normalized[i-1]);
        }
    }
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const ratioStability = 1 / (Math.max(...ratios.map((r, i, arr) => 
        i > 0 ? Math.abs(r - arr[i-1]) : 0
    )) || 1);
    
    // Symmetry score (palindromic-like properties)
    const symmetryScore = normalizedSeq.reduce((score, val, i) => {
        const mirror = normalizedSeq[normalizedSeq.length - 1 - i];
        return score + (1 - Math.abs(val - mirror));
    }, 0) / normalizedSeq.length;
    
    // Smoothness (rate of change)
    const smoothness = normalizedSeq.reduce((sum, val, i, arr) => {
        if (i === 0) return 0;
        return sum + Math.abs(val - arr[i-1]);
    }, 0) / normalizedSeq.length;
    
    // Spiral potential (proximity to golden ratio)
    const spiralScore = 1 / (1 + Math.abs(avgRatio - goldenRatio));
    
    // Fractal dimension estimate (box-counting approximation)
    const fractalDimension = Math.log(normalizedSeq.filter((v, i) => i % 2 === 0).length) / 
                             Math.log(normalizedSeq.length);
    
    // Tesselation score (how well does it tile?)
    const gcd = normalized.slice(0, 10).reduce((a, b) => {
        b = Math.round(b);
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    });
    const tesselationScore = gcd > 1 ? 1 : 0.5;
    
    // Polyhedra potential (suitability for 3D shapes)
    const polyhedraScore = (
        (avgRatio > 1.2 && avgRatio < 2.5 ? 1 : 0.5) + // Good ratio range
        (ratioStability > 0.5 ? 1 : 0.5) + // Stable ratios
        (smoothness < 0.3 ? 1 : 0.5) // Not too chaotic
    ) / 3;
    
    // Vertex placement quality (for mesh generation)
    const vertexScore = normalizedSeq.reduce((score, val, i) => {
        const angle = (val * Math.PI * 2) % (Math.PI * 2);
        const radius = normalizedSeq[(i + 1) % normalizedSeq.length];
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const distance = Math.sqrt(x*x + y*y);
        return score + (distance > 0.1 && distance < 1.5 ? 1 : 0.5);
    }, 0) / normalizedSeq.length;
    
    // Overall geometric score (weighted combination)
    const geometricScore = (
        spiralScore * 0.25 +
        polyhedraScore * 0.20 +
        vertexScore * 0.20 +
        ratioStability * 0.15 +
        symmetryScore * 0.10 +
        tesselationScore * 0.10
    );
    
    return {
        name,
        sequence: normalized.slice(0, 10),
        avgRatio: avgRatio.toFixed(4),
        ratioStability: ratioStability.toFixed(4),
        symmetryScore: symmetryScore.toFixed(4),
        smoothness: smoothness.toFixed(4),
        spiralScore: spiralScore.toFixed(4),
        fractalDimension: fractalDimension.toFixed(4),
        tesselationScore: tesselationScore.toFixed(4),
        polyhedraScore: polyhedraScore.toFixed(4),
        vertexScore: vertexScore.toFixed(4),
        geometricScore: geometricScore.toFixed(4),
        goldenRatioProximity: Math.abs(avgRatio - goldenRatio).toFixed(4),
        silverRatioProximity: Math.abs(avgRatio - silverRatio).toFixed(4),
        plasticNumberProximity: Math.abs(avgRatio - plasticNumber).toFixed(4)
    };
}

// ===== LAYER COMBINATION ENGINE =====

function generateLayerCombinations(depth = 3, terms = 30) {
    const results = [];
    const sequenceNames = Object.keys(sequences);
    const strategyNames = Object.keys(combinationStrategies);
    
    console.log(`\n🔬 MATHEMATICAL SEQUENCE ANALYZER`);
    console.log(`═══════════════════════════════════════════════`);
    console.log(`Analyzing ${sequenceNames.length} base sequences`);
    console.log(`Testing ${strategyNames.length} combination strategies`);
    console.log(`Exploring up to ${depth} layers deep\n`);
    
    // Layer 1: Base sequences
    console.log(`📊 LAYER 1: Base Sequences (${sequenceNames.length})`);
    sequenceNames.forEach(name => {
        const seq = sequences[name](terms);
        const analysis = analyzeGeometricProperties(seq, name);
        results.push({
            layer: 1,
            formula: name,
            ...analysis
        });
    });
    
    // Layer 2: Two-sequence combinations
    console.log(`\n📊 LAYER 2: Two-Sequence Combinations`);
    let layer2Count = 0;
    for (let i = 0; i < sequenceNames.length; i++) {
        for (let j = i + 1; j < sequenceNames.length; j++) {
            const seq1 = sequences[sequenceNames[i]](terms);
            const seq2 = sequences[sequenceNames[j]](terms);
            
            strategyNames.forEach(strategy => {
                const combined = combinationStrategies[strategy](seq1, seq2);
                const name = `${sequenceNames[i]} ${strategy} ${sequenceNames[j]}`;
                const analysis = analyzeGeometricProperties(combined, name);
                results.push({
                    layer: 2,
                    formula: name,
                    ...analysis
                });
                layer2Count++;
            });
        }
    }
    console.log(`Generated ${layer2Count} combinations`);
    
    // Layer 3: Three-sequence combinations (top performers only)
    if (depth >= 3) {
        console.log(`\n📊 LAYER 3: Three-Sequence Combinations`);
        const topLayer2 = results
            .filter(r => r.layer === 2)
            .sort((a, b) => b.geometricScore - a.geometricScore)
            .slice(0, 10); // Take top 10 from layer 2
        
        let layer3Count = 0;
        for (let k = 0; k < sequenceNames.length; k++) {
            const seq3 = sequences[sequenceNames[k]](terms);
            
            topLayer2.forEach(layer2Result => {
                // Reconstruct the layer 2 sequence
                const parts = layer2Result.formula.split(' ');
                const seq1Name = parts[0];
                const strategyName = parts[1];
                const seq2Name = parts[2];
                
                const seq1 = sequences[seq1Name](terms);
                const seq2 = sequences[seq2Name](terms);
                const layer2Seq = combinationStrategies[strategyName](seq1, seq2);
                
                // Combine with third sequence
                strategyNames.slice(0, 4).forEach(strategy => { // Limit strategies for layer 3
                    const combined = combinationStrategies[strategy](layer2Seq, seq3);
                    const name = `(${layer2Result.formula}) ${strategy} ${sequenceNames[k]}`;
                    const analysis = analyzeGeometricProperties(combined, name);
                    results.push({
                        layer: 3,
                        formula: name,
                        ...analysis
                    });
                    layer3Count++;
                });
            });
        }
        console.log(`Generated ${layer3Count} combinations`);
    }
    
    return results;
}

// ===== RESULTS ANALYSIS & REPORTING =====

function generateReport(results) {
    console.log(`\n\n🏆 TOP FINDINGS FOR 3D GEOMETRY GENERATION`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    // Sort by geometric score
    const sorted = results.sort((a, b) => b.geometricScore - a.geometricScore);
    
    // Top overall
    console.log(`\n✨ TOP 10 OVERALL (Best Geometric Scores):`);
    console.log(`─────────────────────────────────────────────────────────────`);
    sorted.slice(0, 10).forEach((r, i) => {
        console.log(`${i+1}. ${r.formula}`);
        console.log(`   Score: ${r.geometricScore} | Layer: ${r.layer} | Ratio: ${r.avgRatio}`);
        console.log(`   Polyhedra: ${r.polyhedraScore} | Spiral: ${r.spiralScore} | Vertex: ${r.vertexScore}`);
        console.log(``);
    });
    
    // Best spirals (golden ratio proximity)
    console.log(`\n🌀 BEST SPIRALS (Golden Ratio Proximity):`);
    console.log(`─────────────────────────────────────────────────────────────`);
    const spirals = [...results].sort((a, b) => a.goldenRatioProximity - b.goldenRatioProximity);
    spirals.slice(0, 5).forEach((r, i) => {
        console.log(`${i+1}. ${r.formula}`);
        console.log(`   Golden Ratio Δ: ${r.goldenRatioProximity} | Score: ${r.geometricScore}`);
        console.log(``);
    });
    
    // Best for polyhedra
    console.log(`\n🔷 BEST FOR POLYHEDRA (3D Shapes):`);
    console.log(`─────────────────────────────────────────────────────────────`);
    const polyhedra = [...results].sort((a, b) => b.polyhedraScore - a.polyhedraScore);
    polyhedra.slice(0, 5).forEach((r, i) => {
        console.log(`${i+1}. ${r.formula}`);
        console.log(`   Polyhedra: ${r.polyhedraScore} | Vertex: ${r.vertexScore} | Ratio: ${r.avgRatio}`);
        console.log(``);
    });
    
    // Best tesselations
    console.log(`\n🔲 BEST FOR TESSELATION (Tiling):`);
    console.log(`─────────────────────────────────────────────────────────────`);
    const tesselations = [...results].sort((a, b) => b.tesselationScore - a.tesselationScore);
    tesselations.slice(0, 5).forEach((r, i) => {
        console.log(`${i+1}. ${r.formula}`);
        console.log(`   Tesselation: ${r.tesselationScore} | Symmetry: ${r.symmetryScore}`);
        console.log(``);
    });
    
    // Best symmetrical
    console.log(`\n⚖️  BEST SYMMETRICAL:`);
    console.log(`─────────────────────────────────────────────────────────────`);
    const symmetrical = [...results].sort((a, b) => b.symmetryScore - a.symmetryScore);
    symmetrical.slice(0, 5).forEach((r, i) => {
        console.log(`${i+1}. ${r.formula}`);
        console.log(`   Symmetry: ${r.symmetryScore} | Smoothness: ${r.smoothness}`);
        console.log(``);
    });
    
    // Statistics by layer
    console.log(`\n📈 STATISTICS BY LAYER:`);
    console.log(`─────────────────────────────────────────────────────────────`);
    [1, 2, 3].forEach(layer => {
        const layerResults = results.filter(r => r.layer === layer);
        if (layerResults.length > 0) {
            const avgScore = layerResults.reduce((sum, r) => sum + parseFloat(r.geometricScore), 0) / layerResults.length;
            const maxScore = Math.max(...layerResults.map(r => parseFloat(r.geometricScore)));
            console.log(`Layer ${layer}: ${layerResults.length} combinations | Avg: ${avgScore.toFixed(4)} | Max: ${maxScore.toFixed(4)}`);
        }
    });
    
    return {
        topOverall: sorted.slice(0, 10),
        bestSpirals: spirals.slice(0, 5),
        bestPolyhedra: polyhedra.slice(0, 5),
        bestTesselations: tesselations.slice(0, 5),
        bestSymmetrical: symmetrical.slice(0, 5)
    };
}

// ===== GENERATE 3D SHAPE CODE =====

function generateThreeJSCode(sequenceResult) {
    const seq = sequenceResult.sequence;
    const normalized = seq.map(v => v / Math.max(...seq));
    
    return `
// Generated 3D shape from: ${sequenceResult.formula}
// Geometric Score: ${sequenceResult.geometricScore}

function create${sequenceResult.formula.replace(/[^a-zA-Z0-9]/g, '')}Shape() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    // Generate vertices using sequence: ${seq.slice(0, 5).join(', ')}...
    const sequence = [${normalized.join(', ')}];
    const layers = 5;
    const segmentsPerLayer = sequence.length;
    
    for (let layer = 0; layer < layers; layer++) {
        const y = (layer / layers) * 2 - 1; // -1 to 1
        const radiusScale = sequence[layer % sequence.length];
        
        for (let i = 0; i < segmentsPerLayer; i++) {
            const angle = (i / segmentsPerLayer) * Math.PI * 2;
            const radius = radiusScale * (1 + sequence[i] * 0.5);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            vertices.push(x, y, z);
        }
    }
    
    // Generate faces
    for (let layer = 0; layer < layers - 1; layer++) {
        for (let i = 0; i < segmentsPerLayer; i++) {
            const current = layer * segmentsPerLayer + i;
            const next = layer * segmentsPerLayer + ((i + 1) % segmentsPerLayer);
            const below = (layer + 1) * segmentsPerLayer + i;
            const belowNext = (layer + 1) * segmentsPerLayer + ((i + 1) % segmentsPerLayer);
            
            // Two triangles per quad
            indices.push(current, below, next);
            indices.push(next, below, belowNext);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        wireframe: false,
        side: THREE.DoubleSide
    });
    
    return new THREE.Mesh(geometry, material);
}`;
}

// ===== MAIN EXECUTION =====

function main() {
    const startTime = Date.now();
    
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  PIXELPRODIGY3D - MATHEMATICAL SEQUENCE ANALYZER          ║`);
    console.log(`║  Combining Famous Mathematical Sequences                   ║`);
    console.log(`║  for Optimal 3D Geometry Generation                        ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    
    // Generate all combinations
    const results = generateLayerCombinations(3, 30);
    
    // Analyze and report
    const topResults = generateReport(results);
    
    // Generate Three.js code for top 3
    console.log(`\n\n💻 GENERATED THREE.JS CODE (Top 3 Shapes):`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    topResults.topOverall.slice(0, 3).forEach((result, i) => {
        console.log(`\n--- Shape ${i+1}: ${result.formula} ---`);
        console.log(generateThreeJSCode(result));
    });
    
    const endTime = Date.now();
    console.log(`\n\n⏱️  Analysis completed in ${endTime - startTime}ms`);
    console.log(`📊 Total combinations analyzed: ${results.length}`);
    console.log(`\n✅ Results saved for PixelProdigy3D integration\n`);
    
    return topResults;
}

// Run if executed directly
if (typeof module !== 'undefined' && require.main === module) {
    main();
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = {
        sequences,
        combinationStrategies,
        analyzeGeometricProperties,
        generateLayerCombinations,
        generateReport,
        generateThreeJSCode,
        main
    };
}
