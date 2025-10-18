/**
 * Vertex Language System (VLS) Parser
 * Converts character-based mesh encoding to Three.js geometry
 * 
 * Eugene Ousos - PixelProdigy AI
 */

class VLSParser {
    constructor() {
        // Operation lookup tables
        this.singleOps = {
            'A': { axis: 'z', value: 1, desc: 'Forward' },
            'B': { axis: 'z', value: -1, desc: 'Backward' },
            'C': { axis: 'x', value: 1, desc: 'Right' },
            'D': { axis: 'x', value: -1, desc: 'Left' },
            'E': { axis: 'y', value: 1, desc: 'Up' },
            'F': { axis: 'y', value: -1, desc: 'Down' },
            
            'G': { axis: 'z', value: 2, desc: 'Forward x2' },
            'H': { axis: 'z', value: -2, desc: 'Backward x2' },
            'I': { axis: 'x', value: 2, desc: 'Right x2' },
            'J': { axis: 'x', value: -2, desc: 'Left x2' },
            'K': { axis: 'y', value: 2, desc: 'Up x2' },
            'L': { axis: 'y', value: -2, desc: 'Down x2' },
            
            'M': { type: 'scale', value: 2, desc: 'Scale ×2' },
            'N': { type: 'scale', value: 0.5, desc: 'Scale ×0.5' },
            'O': { type: 'rotate', axis: 'z', value: 45, desc: 'Rotate 45° CW' },
            'P': { type: 'rotate', axis: 'z', value: -45, desc: 'Rotate 45° CCW' },
            'Q': { type: 'extrude', value: 1, desc: 'Extrude out' },
            'R': { type: 'extrude', value: -1, desc: 'Intrude in' },
            
            'S': { type: 'subdivide', desc: 'Smooth subdivide' },
            'T': { type: 'tessellate', desc: 'Add detail' },
            'U': { type: 'union', desc: 'Merge vertices' },
            'V': { type: 'split', desc: 'Split vertex' },
            'W': { type: 'weld', desc: 'Weld nearby' },
            'X': { type: 'subtract', desc: 'Boolean subtract' },
            
            'Y': { type: 'additive', value: 1, desc: 'Additive mode' },
            'Z': { type: 'reset', desc: 'Reset to origin' }
        };
        
        this.doubleOps = {
            'AA': { type: 'diagonal', axes: ['x', 'z'], values: [1, 1], desc: 'Diagonal fwd-right' },
            'AB': { type: 'diagonal', axes: ['x', 'z'], values: [-1, 1], desc: 'Diagonal fwd-left' },
            'AC': { type: 'diagonal', axes: ['y', 'z'], values: [1, 1], desc: 'Diagonal up-fwd' },
            'AD': { type: 'diagonal', axes: ['y', 'z'], values: [1, -1], desc: 'Diagonal up-back' },
            'AE': { type: 'spiral', direction: 'cw', axis: 'y', desc: 'Spiral CW ascending' },
            'AF': { type: 'spiral', direction: 'ccw', axis: 'y', desc: 'Spiral CCW ascending' },
            
            'BA': { type: 'bezier', tension: 0.5, desc: 'Bezier smooth' },
            'BB': { type: 'bezier', tension: 1.0, desc: 'Bezier sharp' },
            'BC': { type: 'bspline', desc: 'B-spline interpolation' },
            'BD': { type: 'bridge', desc: 'Bridge vertices' },
            'BE': { type: 'bevel', desc: 'Bevel edge' },
            'BF': { type: 'boolean', operation: 'union', desc: 'Boolean union' },
            
            'CA': { type: 'chamfer', desc: 'Chamfer corner' },
            'CB': { type: 'crease', desc: 'Crease edge' },
            'CC': { type: 'curve', tension: 1.0, desc: 'Curve smooth' },
            'CD': { type: 'clone', desc: 'Clone vertex' },
            'CE': { type: 'curve-tension', value: 0.5, desc: 'Increase curve tension' },
            'CF': { type: 'curve-tension', value: -0.5, desc: 'Decrease curve tension' },
            
            'DA': { type: 'depth-extrude', desc: 'Depth extrude' },
            'DB': { type: 'depth-intrude', desc: 'Depth intrude' },
            'DC': { type: 'diagonal-scale', desc: 'Diagonal scale' },
            'DD': { type: 'duplicate', desc: 'Duplicate mesh' },
            'DE': { type: 'deform', desc: 'Lattice deform' },
            'DF': { type: 'delete', desc: 'Delete face' },
            
            'EA': { type: 'edge-loop', desc: 'Edge loop' },
            'EB': { type: 'edge-ring', desc: 'Edge ring' },
            'EC': { type: 'extrude-curve', desc: 'Extrude along curve' },
            'ED': { type: 'extrude-normal', desc: 'Extrude along normal' },
            'EE': { type: 'expand-uniform', desc: 'Expand uniformly' },
            'EF': { type: 'expand-radial', desc: 'Expand radially' }
        };
        
        this.tripleOps = {
            'AAA': { type: 'auto-path', desc: 'Shortest path' },
            'AAB': { type: 'arc-path', desc: 'Curved path' },
            'AAC': { type: 'align-path', desc: 'Grid-aligned path' },
            'AAD': { type: 'adaptive-path', desc: 'Smart routing' },
            
            'BBA': { type: 'bridge-all', desc: 'Bridge all nodes' },
            'BBB': { type: 'boolean-all', desc: 'Boolean all meshes' },
            'BBC': { type: 'blend-surfaces', desc: 'Blend between surfaces' },
            'BBD': { type: 'bond', desc: 'Strong vertex weld' },
            
            'CCA': { type: 'connect-chain', desc: 'Sequential connection' },
            'CCB': { type: 'connect-radial', desc: 'Radial from center' },
            'CCC': { type: 'connect-mesh', desc: 'Connect all vertices' },
            'CCD': { type: 'connect-nearest', desc: 'Nearest neighbor connection' },
            
            'DDA': { type: 'distribute-linear', desc: 'Linear distribution' },
            'DDB': { type: 'distribute-radial', desc: 'Radial distribution' },
            'DDC': { type: 'distribute-grid', desc: 'Grid distribution' },
            'DDD': { type: 'distribute-random', desc: 'Random distribution' }
        };
    }
    
    /**
     * Parse VLS string into mesh data
     * @param {string} vlsString - VLS encoded string
     * @returns {Object} - Mesh data with vertices, indices, materials
     */
    parse(vlsString) {
        console.log(`🔤 Parsing VLS: ${vlsString}`);
        
        const operations = vlsString.split('-');
        const meshData = {
            vertices: [],
            indices: [],
            normals: [],
            uvs: [],
            materials: {},
            operations: []
        };
        
        let currentPosition = [0, 0, 0];
        let currentScale = 1.0;
        let currentRotation = 0;
        let vertexIndex = 0;
        let isAdditive = true; // Default to additive mode
        
        operations.forEach((op, index) => {
            console.log(`  Operation ${index + 1}: ${op}`);
            
            // Check for sign prefix
            if (op.startsWith('+')) {
                isAdditive = true;
                op = op.slice(1);
            } else if (op.startsWith('-')) {
                isAdditive = false;
                op = op.slice(1);
            }
            
            // Parse power notation: A^8
            const powerMatch = op.match(/^([A-Z]{1,3})\^(\d+)$/);
            if (powerMatch) {
                const [, baseOp, power] = powerMatch;
                const nodeCount = parseInt(power);
                console.log(`    Power operation: ${baseOp} with ${nodeCount} nodes`);
                
                const nodes = this.interpolateNodes(currentPosition, baseOp, nodeCount, isAdditive);
                nodes.forEach(node => {
                    meshData.vertices.push(...node);
                    meshData.normals.push(0, 1, 0); // Default normal
                    meshData.uvs.push(0, 0); // Default UV
                });
                
                if (nodes.length > 0) {
                    currentPosition = nodes[nodes.length - 1];
                }
                
                vertexIndex += nodes.length;
                meshData.operations.push({ type: 'power', op: baseOp, power: nodeCount, additive: isAdditive });
                return;
            }
            
            // Three-character operations
            if (op.length === 3 && this.tripleOps[op]) {
                console.log(`    Triple-op: ${this.tripleOps[op].desc}`);
                this.applyTripleOp(op, meshData, currentPosition);
                meshData.operations.push({ type: 'triple', op, desc: this.tripleOps[op].desc });
                return;
            }
            
            // Two-character operations
            if (op.length === 2 && this.doubleOps[op]) {
                console.log(`    Double-op: ${this.doubleOps[op].desc}`);
                const result = this.applyDoubleOp(op, currentPosition, currentScale, meshData);
                if (result.vertices) {
                    result.vertices.forEach(v => {
                        meshData.vertices.push(...v);
                        meshData.normals.push(0, 1, 0);
                        meshData.uvs.push(0, 0);
                    });
                    vertexIndex += result.vertices.length;
                    if (result.vertices.length > 0) {
                        currentPosition = result.vertices[result.vertices.length - 1];
                    }
                }
                meshData.operations.push({ type: 'double', op, desc: this.doubleOps[op].desc });
                return;
            }
            
            // Single-character operations
            if (op.length === 1 && this.singleOps[op]) {
                console.log(`    Single-op: ${this.singleOps[op].desc}`);
                const result = this.applySingleOp(op, currentPosition, currentScale, currentRotation);
                if (result.position) {
                    currentPosition = result.position;
                    meshData.vertices.push(...currentPosition);
                    meshData.normals.push(0, 1, 0);
                    meshData.uvs.push(0, 0);
                    vertexIndex++;
                }
                if (result.scale !== undefined) currentScale = result.scale;
                if (result.rotation !== undefined) currentRotation = result.rotation;
                meshData.operations.push({ type: 'single', op, desc: this.singleOps[op].desc });
                return;
            }
            
            // Material operations (lowercase)
            if (op.match(/^[a-z]/)) {
                console.log(`    Material: ${op}`);
                this.parseMaterial(op, meshData.materials);
                meshData.operations.push({ type: 'material', op });
                return;
            }
            
            // Lighting operations (numbers)
            if (op.match(/^\d/)) {
                console.log(`    Lighting: ${op}`);
                this.parseLighting(op, meshData.materials);
                meshData.operations.push({ type: 'lighting', op });
                return;
            }
            
            console.warn(`    Unknown operation: ${op}`);
        });
        
        // Generate indices (simple triangle fan for now)
        if (meshData.vertices.length >= 9) {
            for (let i = 1; i < (meshData.vertices.length / 3) - 1; i++) {
                meshData.indices.push(0, i, i + 1);
            }
        }
        
        console.log(`✅ Parsed ${meshData.vertices.length / 3} vertices, ${meshData.indices.length / 3} faces`);
        return meshData;
    }
    
    /**
     * Interpolate nodes between positions based on power notation
     */
    interpolateNodes(startPos, operation, nodeCount, isAdditive) {
        const nodes = [];
        const endPos = this.calculateEndPosition(startPos, operation);
        
        for (let i = 0; i <= nodeCount; i++) {
            const t = i / nodeCount;
            const interpolated = [
                startPos[0] + (endPos[0] - startPos[0]) * t,
                startPos[1] + (endPos[1] - startPos[1]) * t,
                startPos[2] + (endPos[2] - startPos[2]) * t
            ];
            
            // Apply additive/subtractive mode
            if (!isAdditive) {
                interpolated[0] *= 0.5;
                interpolated[1] *= 0.5;
                interpolated[2] *= 0.5;
            }
            
            nodes.push(interpolated);
        }
        
        return nodes;
    }
    
    /**
     * Calculate end position for an operation
     */
    calculateEndPosition(startPos, operation) {
        const [x, y, z] = startPos;
        
        // Handle multi-character operations
        if (operation.length === 2 && this.doubleOps[operation]) {
            const op = this.doubleOps[operation];
            if (op.type === 'diagonal') {
                return [
                    x + op.values[0],
                    y,
                    z + op.values[1]
                ];
            }
        }
        
        // Handle single-character operations
        if (operation.length === 1 && this.singleOps[operation]) {
            const op = this.singleOps[operation];
            if (op.axis) {
                return [
                    x + (op.axis === 'x' ? op.value : 0),
                    y + (op.axis === 'y' ? op.value : 0),
                    z + (op.axis === 'z' ? op.value : 0)
                ];
            }
        }
        
        return startPos;
    }
    
    /**
     * Apply single-character operation
     */
    applySingleOp(op, position, scale, rotation) {
        const operation = this.singleOps[op];
        const result = { position: null, scale, rotation };
        
        if (operation.axis) {
            const [x, y, z] = position;
            result.position = [
                x + (operation.axis === 'x' ? operation.value * scale : 0),
                y + (operation.axis === 'y' ? operation.value * scale : 0),
                z + (operation.axis === 'z' ? operation.value * scale : 0)
            ];
        } else if (operation.type === 'scale') {
            result.scale = scale * operation.value;
            result.position = position;
        } else if (operation.type === 'rotate') {
            result.rotation = rotation + operation.value;
            result.position = position;
        } else if (operation.type === 'reset') {
            result.position = [0, 0, 0];
        } else {
            result.position = position;
        }
        
        return result;
    }
    
    /**
     * Apply double-character operation
     */
    applyDoubleOp(op, position, scale, meshData) {
        const operation = this.doubleOps[op];
        const result = { vertices: [] };
        
        if (operation.type === 'diagonal') {
            const [x, y, z] = position;
            result.vertices.push([
                x + operation.values[0] * scale,
                y,
                z + operation.values[1] * scale
            ]);
        } else if (operation.type === 'spiral') {
            // Generate spiral vertices
            const [x, y, z] = position;
            const turns = 2;
            const segments = 16;
            const radius = 0.5 * scale;
            const height = 2.0 * scale;
            
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const angle = t * turns * Math.PI * 2 * (operation.direction === 'cw' ? 1 : -1);
                result.vertices.push([
                    x + Math.cos(angle) * radius,
                    y + t * height,
                    z + Math.sin(angle) * radius
                ]);
            }
        } else if (operation.type === 'bezier') {
            // Generate bezier curve
            const [x, y, z] = position;
            const segments = 8;
            const tension = operation.tension;
            
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const curve = Math.pow(1 - t, 2) * 0 + 2 * (1 - t) * t * tension + Math.pow(t, 2) * 1;
                result.vertices.push([
                    x + t * scale,
                    y + curve * scale,
                    z
                ]);
            }
        } else {
            // Default: return current position
            result.vertices.push(position);
        }
        
        return result;
    }
    
    /**
     * Apply triple-character operation
     */
    applyTripleOp(op, meshData, position) {
        const operation = this.tripleOps[op];
        
        // These operations typically work on existing vertices
        // For now, we'll just log them
        console.log(`      Applying: ${operation.desc}`);
    }
    
    /**
     * Parse material string: m0.8r0.4a[#654321]n1b0.5
     */
    parseMaterial(materialString, materials) {
        const params = materialString.match(/([a-z])([0-9.]+|\[#[0-9a-fA-F]{6}\])/g);
        
        if (params) {
            params.forEach(param => {
                const key = param[0];
                const value = param.slice(1);
                
                switch(key) {
                    case 'm': materials.metallic = parseFloat(value); break;
                    case 'r': materials.roughness = parseFloat(value); break;
                    case 'g': materials.gloss = parseFloat(value); break;
                    case 'o': materials.opacity = parseFloat(value); break;
                    case 'e': materials.emissive = parseFloat(value); break;
                    case 'n': materials.normalMap = parseFloat(value) > 0; break;
                    case 'b': materials.bumpMap = parseFloat(value); break;
                    case 'w': materials.wetness = parseFloat(value); break;
                    case 'a':
                        const colorMatch = value.match(/\[#([0-9a-fA-F]{6})\]/);
                        if (colorMatch) {
                            materials.color = '#' + colorMatch[1];
                        }
                        break;
                }
            });
        }
    }
    
    /**
     * Parse lighting string: 2[5,10,7.5]+4[0,2,0]
     */
    parseLighting(lightingString, materials) {
        materials.lighting = materials.lighting || [];
        
        const lights = lightingString.match(/(\d)\[([0-9.,]+)\]/g);
        if (lights) {
            lights.forEach(light => {
                const type = light[0];
                const params = light.match(/\[([0-9.,]+)\]/)[1].split(',').map(parseFloat);
                
                materials.lighting.push({
                    type: parseInt(type),
                    params
                });
            });
        }
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VLSParser;
}
