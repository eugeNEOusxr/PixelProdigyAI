/**
 * VLS Advanced Vertex Mapper
 * Maximum vertex density with intelligent map referencing
 * Creates ultra-detailed 3D geometry by maximizing vertex reuse
 * Eugene Ousos - PixelProdigy AI
 */

class VLSAdvancedVertexMapper {
    
    constructor() {
        this.vertexMap = new Map(); // Map for vertex deduplication
        this.vertexArray = []; // Final vertex array
        this.indexArray = []; // Triangle indices with map references
        this.normalMap = new Map(); // Normal averaging map
    }
    
    /**
     * Generate ultra-detailed mesh from VLS path with maximum vertex mapping
     * @param {Array} vertexPath - VLS vertex path [[x,y,z], ...]
     * @param {Object} options - Configuration
     * @returns {Object} - {vertices, indices, normals, uvs, metadata}
     */
    generateMaxVertexMesh(vertexPath, options = {}) {
        const {
            radialSegments = 16,    // More segments = more vertices
            heightSegments = 4,      // Subdivisions along height
            radius = 0.15,
            subdivisionLevel = 2,    // Additional subdivision passes
            createBranches = true,
            branchDensity = 0.3,
            createLeaves = true,
            leafDensity = 0.2,
            vertexNoise = 0.02       // Add organic variation
        } = options;
        
        this.reset();
        
        console.log(`🔷 Generating max-vertex mesh: ${radialSegments}×${heightSegments} segments`);
        
        // 1. Generate base trunk geometry with dense vertices
        this.generateTrunkGeometry(vertexPath, radius, radialSegments, heightSegments);
        
        // 2. Subdivide for extra detail
        for (let i = 0; i < subdivisionLevel; i++) {
            this.subdivideGeometry();
        }
        
        // 3. Add organic vertex noise
        this.applyVertexNoise(vertexNoise);
        
        // 4. Generate branches with vertex mapping
        if (createBranches) {
            this.generateBranches(vertexPath, branchDensity, radialSegments / 2);
        }
        
        // 5. Generate leaf geometry
        if (createLeaves) {
            this.generateLeaves(vertexPath, leafDensity);
        }
        
        // 6. Compute averaged normals using vertex map
        this.computeAveragedNormals();
        
        // 7. Generate UVs
        const uvs = this.generateUVs();
        
        const metadata = {
            totalVertices: this.vertexArray.length / 3,
            totalTriangles: this.indexArray.length / 3,
            uniqueVertices: this.vertexMap.size,
            vertexReuse: ((this.indexArray.length - this.vertexMap.size) / this.indexArray.length * 100).toFixed(1) + '%'
        };
        
        console.log(`✅ Generated ${metadata.totalVertices} vertices, ${metadata.totalTriangles} triangles`);
        console.log(`   Vertex reuse: ${metadata.vertexReuse} (${metadata.uniqueVertices} unique)`);
        
        return {
            vertices: new Float32Array(this.vertexArray),
            indices: new Uint32Array(this.indexArray),
            normals: new Float32Array(this.computeNormals()),
            uvs: new Float32Array(uvs),
            metadata
        };
    }
    
    /**
     * Generate dense trunk geometry with vertex mapping
     */
    generateTrunkGeometry(path, radius, radialSegs, heightSegs) {
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            
            // Subdivide segment for more vertices
            for (let h = 0; h <= heightSegs; h++) {
                const t = h / heightSegs;
                const pos = [
                    p1[0] + (p2[0] - p1[0]) * t,
                    p1[1] + (p2[1] - p1[1]) * t,
                    p1[2] + (p2[2] - p1[2]) * t
                ];
                
                // Calculate tangent
                const tangent = this.normalize([
                    p2[0] - p1[0],
                    p2[1] - p1[1],
                    p2[2] - p1[2]
                ]);
                
                const perpU = this.getPerpendicular(tangent);
                const perpV = this.cross(tangent, perpU);
                
                // Taper radius (thicker at bottom)
                const segmentRadius = radius * (1.0 - i / path.length * 0.5);
                
                // Generate ring of vertices
                const ringStart = this.vertexArray.length / 3;
                for (let r = 0; r < radialSegs; r++) {
                    const angle = (r / radialSegs) * Math.PI * 2;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    
                    const vx = pos[0] + (perpU[0] * cos + perpV[0] * sin) * segmentRadius;
                    const vy = pos[1] + (perpU[1] * cos + perpV[1] * sin) * segmentRadius;
                    const vz = pos[2] + (perpU[2] * cos + perpV[2] * sin) * segmentRadius;
                    
                    this.addVertex(vx, vy, vz);
                }
                
                // Connect rings with triangles (vertex map references)
                if (h > 0 && i >= 0) {
                    const prevRing = ringStart - radialSegs;
                    for (let r = 0; r < radialSegs; r++) {
                        const r1 = r;
                        const r2 = (r + 1) % radialSegs;
                        
                        const curr1 = ringStart + r1;
                        const curr2 = ringStart + r2;
                        const prev1 = prevRing + r1;
                        const prev2 = prevRing + r2;
                        
                        // Two triangles per quad (referencing vertex map)
                        this.addTriangle(prev1, curr1, curr2);
                        this.addTriangle(prev1, curr2, prev2);
                    }
                }
            }
        }
    }
    
    /**
     * Subdivide existing triangles for more vertex density
     */
    subdivideGeometry() {
        const originalIndices = [...this.indexArray];
        this.indexArray = [];
        
        for (let i = 0; i < originalIndices.length; i += 3) {
            const i1 = originalIndices[i];
            const i2 = originalIndices[i + 1];
            const i3 = originalIndices[i + 2];
            
            const v1 = this.getVertex(i1);
            const v2 = this.getVertex(i2);
            const v3 = this.getVertex(i3);
            
            // Create midpoint vertices (automatically mapped)
            const m12 = this.addVertex(
                (v1[0] + v2[0]) / 2,
                (v1[1] + v2[1]) / 2,
                (v1[2] + v2[2]) / 2
            );
            const m23 = this.addVertex(
                (v2[0] + v3[0]) / 2,
                (v2[1] + v3[1]) / 2,
                (v2[2] + v3[2]) / 2
            );
            const m31 = this.addVertex(
                (v3[0] + v1[0]) / 2,
                (v3[1] + v1[1]) / 2,
                (v3[2] + v1[2]) / 2
            );
            
            // Create 4 new triangles
            this.addTriangle(i1, m12, m31);
            this.addTriangle(m12, i2, m23);
            this.addTriangle(m31, m23, i3);
            this.addTriangle(m12, m23, m31);
        }
    }
    
    /**
     * Generate branches with vertex mapping
     */
    generateBranches(mainPath, density, segments) {
        const branchCount = Math.floor(mainPath.length * density);
        
        for (let b = 0; b < branchCount; b++) {
            const pathIndex = Math.floor(mainPath.length * 0.3 + Math.random() * mainPath.length * 0.6);
            const startPos = mainPath[pathIndex];
            
            // Random branch direction
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.PI / 6 + Math.random() * Math.PI / 6;
            
            const length = 0.5 + Math.random() * 1.0;
            const branchPath = [];
            
            for (let i = 0; i <= 5; i++) {
                const t = i / 5;
                branchPath.push([
                    startPos[0] + Math.cos(angle) * Math.sin(elevation) * length * t,
                    startPos[1] + Math.cos(elevation) * length * t,
                    startPos[2] + Math.sin(angle) * Math.sin(elevation) * length * t
                ]);
            }
            
            this.generateTrunkGeometry(branchPath, 0.05, segments, 2);
        }
    }
    
    /**
     * Generate leaf geometry as clustered vertices
     */
    generateLeaves(path, density) {
        const leafCount = Math.floor(path.length * density * 50);
        
        for (let i = 0; i < leafCount; i++) {
            const pathIndex = Math.floor(path.length * 0.5 + Math.random() * path.length * 0.5);
            const basePos = path[pathIndex];
            
            // Leaf cluster position
            const offset = 0.5 + Math.random() * 1.5;
            const angle = Math.random() * Math.PI * 2;
            
            const leafPos = [
                basePos[0] + Math.cos(angle) * offset,
                basePos[1] + Math.random() * 0.5,
                basePos[2] + Math.sin(angle) * offset
            ];
            
            // Create small leaf triangle
            const leafSize = 0.1 + Math.random() * 0.1;
            const v1 = this.addVertex(leafPos[0], leafPos[1], leafPos[2]);
            const v2 = this.addVertex(leafPos[0] + leafSize, leafPos[1], leafPos[2]);
            const v3 = this.addVertex(leafPos[0], leafPos[1] + leafSize, leafPos[2] + leafSize);
            
            this.addTriangle(v1, v2, v3);
        }
    }
    
    /**
     * Apply organic noise to vertices
     */
    applyVertexNoise(amount) {
        for (let i = 0; i < this.vertexArray.length; i++) {
            this.vertexArray[i] += (Math.random() - 0.5) * amount;
        }
    }
    
    /**
     * Add vertex with automatic mapping/deduplication
     */
    addVertex(x, y, z) {
        const key = `${x.toFixed(6)}_${y.toFixed(6)}_${z.toFixed(6)}`;
        
        if (this.vertexMap.has(key)) {
            return this.vertexMap.get(key);
        }
        
        const index = this.vertexArray.length / 3;
        this.vertexArray.push(x, y, z);
        this.vertexMap.set(key, index);
        return index;
    }
    
    /**
     * Get vertex by index
     */
    getVertex(index) {
        return [
            this.vertexArray[index * 3],
            this.vertexArray[index * 3 + 1],
            this.vertexArray[index * 3 + 2]
        ];
    }
    
    /**
     * Add triangle with vertex references
     */
    addTriangle(i1, i2, i3) {
        this.indexArray.push(i1, i2, i3);
    }
    
    /**
     * Compute averaged normals using vertex map
     */
    computeAveragedNormals() {
        const normals = new Array(this.vertexArray.length).fill(0);
        
        // Accumulate face normals
        for (let i = 0; i < this.indexArray.length; i += 3) {
            const i1 = this.indexArray[i];
            const i2 = this.indexArray[i + 1];
            const i3 = this.indexArray[i + 2];
            
            const v1 = this.getVertex(i1);
            const v2 = this.getVertex(i2);
            const v3 = this.getVertex(i3);
            
            const e1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            const e2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
            const normal = this.normalize(this.cross(e1, e2));
            
            for (let j = 0; j < 3; j++) {
                normals[i1 * 3 + j] += normal[j];
                normals[i2 * 3 + j] += normal[j];
                normals[i3 * 3 + j] += normal[j];
            }
        }
        
        // Normalize
        for (let i = 0; i < normals.length; i += 3) {
            const n = this.normalize([normals[i], normals[i + 1], normals[i + 2]]);
            normals[i] = n[0];
            normals[i + 1] = n[1];
            normals[i + 2] = n[2];
        }
        
        this.normalArray = normals;
    }
    
    computeNormals() {
        return this.normalArray || new Array(this.vertexArray.length).fill(0);
    }
    
    generateUVs() {
        const uvs = [];
        for (let i = 0; i < this.vertexArray.length / 3; i++) {
            uvs.push(Math.random(), Math.random());
        }
        return uvs;
    }
    
    // Vector utilities
    normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (len === 0) return [0, 1, 0];
        return [v[0] / len, v[1] / len, v[2] / len];
    }
    
    cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    
    getPerpendicular(v) {
        if (Math.abs(v[1]) < 0.9) {
            return this.normalize(this.cross(v, [0, 1, 0]));
        } else {
            return this.normalize(this.cross(v, [1, 0, 0]));
        }
    }
    
    reset() {
        this.vertexMap.clear();
        this.vertexArray = [];
        this.indexArray = [];
        this.normalArray = null;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.VLSAdvancedVertexMapper = VLSAdvancedVertexMapper;
}
