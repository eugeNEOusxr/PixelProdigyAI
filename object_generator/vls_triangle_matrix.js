/**
 * VLS 3D Triangle Matrix Generator
 * Converts VLS vertex paths into proper triangulated 3D geometry
 * Eugene Ousos - PixelProdigy AI
 */

class VLSTriangleMatrix {
    
    /**
     * Generate 3D mesh from vertex path using triangle matrices
     * @param {Array} vertexPath - Array of [x,y,z] vertices from VLS operations
     * @param {Object} options - radius, segments, etc.
     * @returns {Object} - {vertices: Float32Array, indices: Uint16Array}
     */
    static generateMeshFromPath(vertexPath, options = {}) {
        const {
            radius = 0.1,
            segments = 8,
            closed = false,
            extrude = true
        } = options;
        
        if (!vertexPath || vertexPath.length < 2) {
            console.warn('VLS: Path too short for mesh generation');
            return this.createFallbackGeometry();
        }
        
        if (extrude) {
            return this.extrudeAlongPath(vertexPath, radius, segments, closed);
        } else {
            return this.createPathSurface(vertexPath, radius, segments);
        }
    }
    
    /**
     * Extrude a circular profile along a path (like a cylinder following the path)
     * Creates proper triangle matrices x1,y1,z1 -> x2,y2,z2 -> x3,y3,z3
     */
    static extrudeAlongPath(path, radius, segments, closed) {
        const vertices = [];
        const indices = [];
        
        // Generate circle profile vertices at each path point
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const [px, py, pz] = point;
            
            // Calculate tangent direction for proper orientation
            let tangent;
            if (i < path.length - 1) {
                tangent = this.normalize([
                    path[i + 1][0] - px,
                    path[i + 1][1] - py,
                    path[i + 1][2] - pz
                ]);
            } else {
                tangent = this.normalize([
                    px - path[i - 1][0],
                    py - path[i - 1][1],
                    pz - path[i - 1][2]
                ]);
            }
            
            // Create perpendicular vectors for the circle
            const perpU = this.getPerpendicular(tangent);
            const perpV = this.cross(tangent, perpU);
            
            // Generate circle of vertices around this path point
            for (let s = 0; s < segments; s++) {
                const angle = (s / segments) * Math.PI * 2;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                
                // Position vertex using perpendicular basis vectors
                const vx = px + (perpU[0] * cos + perpV[0] * sin) * radius;
                const vy = py + (perpU[1] * cos + perpV[1] * sin) * radius;
                const vz = pz + (perpU[2] * cos + perpV[2] * sin) * radius;
                
                vertices.push(vx, vy, vz);
            }
        }
        
        // Generate triangle indices connecting the rings
        for (let i = 0; i < path.length - 1; i++) {
            for (let s = 0; s < segments; s++) {
                const current = i * segments + s;
                const next = i * segments + ((s + 1) % segments);
                const currentNext = (i + 1) * segments + s;
                const nextNext = (i + 1) * segments + ((s + 1) % segments);
                
                // Triangle 1: (x1,y1,z1), (x2,y2,z2), (x3,y3,z3)
                indices.push(current, next, currentNext);
                
                // Triangle 2: (x1,y1,z1), (x2,y2,z2), (x3,y3,z3)
                indices.push(next, nextNext, currentNext);
            }
        }
        
        // Cap the ends if needed
        if (closed || path.length > 2) {
            // Front cap
            const frontCenter = vertices.length / 3;
            vertices.push(...path[0]);
            for (let s = 0; s < segments; s++) {
                const next = (s + 1) % segments;
                indices.push(frontCenter, s, next);
            }
            
            // Back cap
            const backCenter = vertices.length / 3;
            vertices.push(...path[path.length - 1]);
            const lastRing = (path.length - 1) * segments;
            for (let s = 0; s < segments; s++) {
                const current = lastRing + s;
                const next = lastRing + ((s + 1) % segments);
                indices.push(backCenter, next, current);
            }
        }
        
        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            count: vertices.length / 3
        };
    }
    
    /**
     * Create a ribbon/surface following the path
     */
    static createPathSurface(path, width, segments) {
        const vertices = [];
        const indices = [];
        
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const [px, py, pz] = point;
            
            // Calculate perpendicular direction
            let tangent;
            if (i < path.length - 1) {
                tangent = this.normalize([
                    path[i + 1][0] - px,
                    path[i + 1][1] - py,
                    path[i + 1][2] - pz
                ]);
            } else {
                tangent = this.normalize([
                    px - path[i - 1][0],
                    py - path[i - 1][1],
                    pz - path[i - 1][2]
                ]);
            }
            
            const perp = this.getPerpendicular(tangent);
            
            // Create two vertices (left and right of path)
            vertices.push(
                px - perp[0] * width, py - perp[1] * width, pz - perp[2] * width,
                px + perp[0] * width, py + perp[1] * width, pz + perp[2] * width
            );
        }
        
        // Connect vertices with triangles
        for (let i = 0; i < path.length - 1; i++) {
            const base = i * 2;
            indices.push(
                base, base + 1, base + 2,
                base + 1, base + 3, base + 2
            );
        }
        
        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            count: vertices.length / 3
        };
    }
    
    /**
     * Vector math utilities
     */
    static normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (len === 0) return [0, 1, 0];
        return [v[0] / len, v[1] / len, v[2] / len];
    }
    
    static cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    
    static getPerpendicular(v) {
        // Find a vector perpendicular to v
        if (Math.abs(v[1]) < 0.9) {
            return this.normalize(this.cross(v, [0, 1, 0]));
        } else {
            return this.normalize(this.cross(v, [1, 0, 0]));
        }
    }
    
    static createFallbackGeometry() {
        // Simple tetrahedron
        return {
            vertices: new Float32Array([
                0, 1, 0,
                -0.5, 0, 0.5,
                0.5, 0, 0.5,
                0, 0, -0.5
            ]),
            indices: new Uint16Array([
                0, 1, 2,
                0, 2, 3,
                0, 3, 1,
                1, 3, 2
            ]),
            count: 4
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.VLSTriangleMatrix = VLSTriangleMatrix;
}
