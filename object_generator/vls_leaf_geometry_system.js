/**
 * VLS Leaf Geometry System - Microscopic Detail
 * Converts canopy geometry into individual oblong leaf shapes with maximum triangle subdivision
 * Uses VLS lettering system to outline leaf edges inward with color contrast
 * Eugene Ousos - PixelProdigy AI
 */

class VLSLeafGeometrySystem {
    
    constructor() {
        // Leaf shape templates using VLS notation
        this.leafTemplates = {
            oak: {
                // Lobed oak leaf outline
                vls: '+A-B+C-D+E-F-G+H-I', // Wavy edges
                segments: 12,
                width: 0.15,
                length: 0.25,
                veins: 7,
                lobedEdges: true
            },
            maple: {
                // 5-pointed maple leaf
                vls: '+A+B+C-D-E-F+G+H+I-J-K',
                segments: 15,
                width: 0.2,
                length: 0.2,
                veins: 5,
                pointed: true
            },
            willow: {
                // Long narrow willow leaf
                vls: '+A+B-C-D',
                segments: 8,
                width: 0.08,
                length: 0.3,
                veins: 3,
                elongated: true
            },
            pine: {
                // Needle cluster
                vls: '+A',
                segments: 4,
                width: 0.02,
                length: 0.15,
                veins: 1,
                needle: true
            },
            simple: {
                // Basic oblong leaf
                vls: '+A-B+C-D',
                segments: 10,
                width: 0.12,
                length: 0.2,
                veins: 5,
                simple: true
            }
        };
        
        // VLS edge detail letters - microscopic inward progression
        this.edgeLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.detailLevels = {
            low: 3,      // 3 letter inward progression
            medium: 7,   // 7 letters
            high: 13,    // 13 letters
            ultra: 26    // Full alphabet
        };
    }
    
    /**
     * Generate microscopic detailed leaf geometry
     * @param {string} type - Leaf type
     * @param {Object} options - Configuration
     * @returns {Object} Geometry data with vertices, indices, colors
     */
    generateLeafGeometry(type = 'oak', options = {}) {
        const {
            detailLevel = 'high',
            colorVariation = 0.3,
            position = [0, 0, 0],
            rotation = 0,
            bendFactor = 0.1,
            veinDepth = 0.02,
            edgeRuffling = 0.05
        } = options;
        
        const template = this.leafTemplates[type] || this.leafTemplates.simple;
        const letterCount = this.detailLevels[detailLevel];
        
        // Parse VLS outline
        const outlineVertices = this.parseVLSOutline(template.vls, template);
        
        // Generate leaf surface with microscopic detail
        const leafData = this.generateLeafSurface(
            outlineVertices,
            template,
            letterCount,
            veinDepth,
            edgeRuffling
        );
        
        // Add color variation (gradient from center to edges)
        this.addColorContrast(leafData, colorVariation, template);
        
        // Apply transformations
        this.transformLeaf(leafData, position, rotation, bendFactor);
        
        return {
            vertices: new Float32Array(leafData.vertices),
            indices: new Uint32Array(leafData.indices),
            colors: new Float32Array(leafData.colors),
            normals: new Float32Array(leafData.normals),
            uvs: new Float32Array(leafData.uvs),
            metadata: {
                type,
                triangleCount: leafData.indices.length / 3,
                vertexCount: leafData.vertices.length / 3,
                detailLevel
            }
        };
    }
    
    /**
     * Parse VLS outline into vertex positions
     */
    parseVLSOutline(vlsCode, template) {
        const vertices = [];
        const segments = template.segments;
        const width = template.width;
        const length = template.length;
        
        // Start at stem base
        let x = 0, y = 0;
        vertices.push([x, y]);
        
        // Parse each VLS operation
        const ops = vlsCode.match(/[+-][A-Z]/g) || [];
        const angleStep = (Math.PI * 2) / segments;
        
        for (let i = 0; i < segments; i++) {
            const angle = angleStep * i;
            const opIndex = i % ops.length;
            const op = ops[opIndex];
            
            // Determine radius based on operation
            let radius = length;
            if (op[0] === '+') {
                radius *= 1.0 + (op.charCodeAt(1) - 65) * 0.02; // Extend outward
            } else {
                radius *= 0.9 - (op.charCodeAt(1) - 65) * 0.01; // Pull inward
            }
            
            // Calculate position with width variation
            const widthFactor = Math.sin(angle) * width;
            x = Math.cos(angle) * radius + widthFactor;
            y = Math.sin(angle) * radius;
            
            vertices.push([x, y]);
        }
        
        return vertices;
    }
    
    /**
     * Generate leaf surface with microscopic inward detail
     */
    generateLeafSurface(outline, template, letterCount, veinDepth, ruffling) {
        const vertices = [];
        const indices = [];
        const colors = [];
        const normals = [];
        const uvs = [];
        
        const vertexMap = new Map();
        let vertexIndex = 0;
        
        // Add vertex helper
        const addVertex = (x, y, z, u, v) => {
            const key = `${x.toFixed(6)}_${y.toFixed(6)}_${z.toFixed(6)}`;
            if (vertexMap.has(key)) {
                return vertexMap.get(key);
            }
            vertices.push(x, y, z);
            normals.push(0, 0, 1); // Will recalculate
            uvs.push(u, v);
            colors.push(0, 0, 0); // Will set later
            vertexMap.set(key, vertexIndex);
            return vertexIndex++;
        };
        
        // Center point
        const centerIdx = addVertex(0, 0, 0, 0.5, 0.5);
        
        // Generate concentric rings (edge inward progression)
        for (let ring = 0; ring < letterCount; ring++) {
            const t = ring / (letterCount - 1); // 0 at edge, 1 at center
            const invT = 1 - t;
            
            // Letter-based detail modifier
            const letter = this.edgeLetters[ring % this.edgeLetters.length];
            const letterMod = (letter.charCodeAt(0) - 65) / 26;
            
            const ringVertices = [];
            
            for (let i = 0; i < outline.length; i++) {
                const v1 = outline[i];
                const v2 = outline[(i + 1) % outline.length];
                
                // Interpolate toward center
                const x = v1[0] * invT;
                const y = v1[1] * invT;
                
                // Add microscopic variation based on letter
                const variation = (Math.sin(i * 0.5 + letterMod * Math.PI * 2) * ruffling * invT);
                
                // Z displacement for veins and ruffling
                let z = variation;
                
                // Add vein depth
                if (template.veins) {
                    const veinAngle = (i / outline.length) * template.veins * Math.PI * 2;
                    const veinStrength = Math.abs(Math.sin(veinAngle));
                    z -= veinStrength * veinDepth * t;
                }
                
                // UV coordinates
                const u = (x / template.length + 1) / 2;
                const v = (y / template.length + 1) / 2;
                
                const idx = addVertex(x, y, z, u, v);
                ringVertices.push(idx);
            }
            
            // Create triangles
            if (ring === letterCount - 1) {
                // Final ring connects to center
                for (let i = 0; i < ringVertices.length; i++) {
                    const v1 = ringVertices[i];
                    const v2 = ringVertices[(i + 1) % ringVertices.length];
                    indices.push(centerIdx, v2, v1);
                }
            } else {
                // Connect to next ring
                const nextRingStart = vertexIndex;
                // Next ring will be created in next iteration
            }
        }
        
        // Subdivide all triangles for maximum detail
        const subdivided = this.subdivideTriangles(
            vertices, indices, colors, normals, uvs, 
            2 // Subdivision level
        );
        
        return subdivided;
    }
    
    /**
     * Subdivide triangles for maximum triangle count
     */
    subdivideTriangles(vertices, indices, colors, normals, uvs, levels) {
        let verts = [...vertices];
        let inds = [...indices];
        let cols = [...colors];
        let norms = [...normals];
        let uvCoords = [...uvs];
        
        const vertexMap = new Map();
        let nextIndex = verts.length / 3;
        
        for (let level = 0; level < levels; level++) {
            const newIndices = [];
            
            for (let i = 0; i < inds.length; i += 3) {
                const i1 = inds[i];
                const i2 = inds[i + 1];
                const i3 = inds[i + 2];
                
                // Get vertices
                const v1 = [verts[i1*3], verts[i1*3+1], verts[i1*3+2]];
                const v2 = [verts[i2*3], verts[i2*3+1], verts[i2*3+2]];
                const v3 = [verts[i3*3], verts[i3*3+1], verts[i3*3+2]];
                
                // Calculate midpoints
                const m12 = this.midpoint(v1, v2);
                const m23 = this.midpoint(v2, v3);
                const m31 = this.midpoint(v3, v1);
                
                // Add midpoint vertices
                const im12 = this.addOrGetVertex(m12, verts, cols, norms, uvCoords, vertexMap, nextIndex++);
                const im23 = this.addOrGetVertex(m23, verts, cols, norms, uvCoords, vertexMap, nextIndex++);
                const im31 = this.addOrGetVertex(m31, verts, cols, norms, uvCoords, vertexMap, nextIndex++);
                
                // Create 4 new triangles
                newIndices.push(i1, im12, im31);
                newIndices.push(im12, i2, im23);
                newIndices.push(im31, im23, i3);
                newIndices.push(im12, im23, im31);
            }
            
            inds = newIndices;
        }
        
        return {
            vertices: verts,
            indices: inds,
            colors: cols,
            normals: norms,
            uvs: uvCoords
        };
    }
    
    midpoint(v1, v2) {
        return [
            (v1[0] + v2[0]) / 2,
            (v1[1] + v2[1]) / 2,
            (v1[2] + v2[2]) / 2
        ];
    }
    
    addOrGetVertex(pos, verts, cols, norms, uvs, map, nextIdx) {
        const key = `${pos[0].toFixed(6)}_${pos[1].toFixed(6)}_${pos[2].toFixed(6)}`;
        if (map.has(key)) {
            return map.get(key);
        }
        
        verts.push(pos[0], pos[1], pos[2]);
        cols.push(0, 0.5, 0); // Green default
        norms.push(0, 0, 1);
        uvs.push(0.5, 0.5);
        map.set(key, nextIdx);
        return nextIdx;
    }
    
    /**
     * Add color contrast - gradient from center outward
     */
    addColorContrast(leafData, variation, template) {
        const vertCount = leafData.vertices.length / 3;
        
        for (let i = 0; i < vertCount; i++) {
            const x = leafData.vertices[i * 3];
            const y = leafData.vertices[i * 3 + 1];
            
            // Distance from center (normalized)
            const dist = Math.sqrt(x*x + y*y) / template.length;
            
            // Color gradient: darker at center, lighter at edges
            const baseGreen = 0.4 + dist * 0.3;
            const r = 0.1 + Math.random() * variation * 0.1;
            const g = baseGreen + Math.random() * variation;
            const b = 0.05 + Math.random() * variation * 0.05;
            
            leafData.colors[i * 3] = r;
            leafData.colors[i * 3 + 1] = g;
            leafData.colors[i * 3 + 2] = b;
        }
    }
    
    /**
     * Transform leaf with position, rotation, bending
     */
    transformLeaf(leafData, position, rotation, bendFactor) {
        const vertCount = leafData.vertices.length / 3;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        
        for (let i = 0; i < vertCount; i++) {
            let x = leafData.vertices[i * 3];
            let y = leafData.vertices[i * 3 + 1];
            let z = leafData.vertices[i * 3 + 2];
            
            // Apply bending (curl)
            const bendAmount = y * bendFactor;
            z += bendAmount;
            
            // Rotation
            const rx = x * cos - y * sin;
            const ry = x * sin + y * cos;
            
            // Translation
            leafData.vertices[i * 3] = rx + position[0];
            leafData.vertices[i * 3 + 1] = ry + position[1];
            leafData.vertices[i * 3 + 2] = z + position[2];
        }
        
        // Recalculate normals
        this.recalculateNormals(leafData);
    }
    
    /**
     * Recalculate normals for smooth shading
     */
    recalculateNormals(leafData) {
        const vertCount = leafData.vertices.length / 3;
        const normals = new Array(vertCount * 3).fill(0);
        
        // Accumulate face normals
        for (let i = 0; i < leafData.indices.length; i += 3) {
            const i1 = leafData.indices[i];
            const i2 = leafData.indices[i + 1];
            const i3 = leafData.indices[i + 2];
            
            const v1 = [
                leafData.vertices[i1*3],
                leafData.vertices[i1*3+1],
                leafData.vertices[i1*3+2]
            ];
            const v2 = [
                leafData.vertices[i2*3],
                leafData.vertices[i2*3+1],
                leafData.vertices[i2*3+2]
            ];
            const v3 = [
                leafData.vertices[i3*3],
                leafData.vertices[i3*3+1],
                leafData.vertices[i3*3+2]
            ];
            
            // Calculate face normal
            const e1 = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
            const e2 = [v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]];
            const normal = [
                e1[1]*e2[2] - e1[2]*e2[1],
                e1[2]*e2[0] - e1[0]*e2[2],
                e1[0]*e2[1] - e1[1]*e2[0]
            ];
            
            // Accumulate to vertices
            for (const idx of [i1, i2, i3]) {
                normals[idx*3] += normal[0];
                normals[idx*3+1] += normal[1];
                normals[idx*3+2] += normal[2];
            }
        }
        
        // Normalize
        for (let i = 0; i < vertCount; i++) {
            const x = normals[i*3];
            const y = normals[i*3+1];
            const z = normals[i*3+2];
            const len = Math.sqrt(x*x + y*y + z*z) || 1;
            
            leafData.normals[i*3] = x / len;
            leafData.normals[i*3+1] = y / len;
            leafData.normals[i*3+2] = z / len;
        }
    }
    
    /**
     * Generate leaf cluster (multiple leaves from branch node)
     */
    generateLeafCluster(branchPosition, branchDirection, type, count = 5, options = {}) {
        const leaves = [];
        
        for (let i = 0; i < count; i++) {
            // Spiral arrangement around branch
            const angle = (i / count) * Math.PI * 2;
            const radius = 0.1;
            const offset = [
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                i * 0.05
            ];
            
            const position = [
                branchPosition[0] + offset[0],
                branchPosition[1] + offset[1],
                branchPosition[2] + offset[2]
            ];
            
            const rotation = angle + Math.random() * 0.5;
            
            const leaf = this.generateLeafGeometry(type, {
                ...options,
                position,
                rotation,
                bendFactor: 0.1 + Math.random() * 0.2
            });
            
            leaves.push(leaf);
        }
        
        return leaves;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.VLSLeafGeometrySystem = VLSLeafGeometrySystem;
}
