/**
 * PixelProdigy - Sculpting Logic Explained
 * 
 * This file breaks down the core function responsible for all sculpting operations.
 * The `sculptMesh` function is the engine behind the digital paintbrush.
 */

/**
 * @param {THREE.Vector3} point - The exact 3D point in world space where the mouse intersects the mesh.
 * @param {THREE.Vector3} normal - The surface normal at that intersection point. This vector points directly "out" from the face that was hit.
 * @param {number} intensity - A multiplier for the overall effect, often based on mouse movement speed or pressure.
 */
function sculptMesh(point, normal, intensity) {
    // Ensure we have a mesh to work on.
    if (!mesh) return;

    // Get direct access to the vertex position data from the mesh's geometry.
    // This is a flat array like [x1, y1, z1, x2, y2, z2, ...].
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal; // Also get normals for lighting and direction.
    const count = positions.count; // The total number of vertices in the mesh.

    // --- 1. CONVERT BRUSH SIZE FROM PIXELS TO 3D WORLD UNITS ---
    // The brush size is in screen pixels, but we need to know its size in the 3D world.
    // This is an approximation that links the pixel size to the 3D scene's scale.
    const brushRadius = (brushSize / 500) * 2;

    // --- 2. CALCULATE THE STRENGTH OF THE CURRENT BRUSH STROKE ---
    // This combines the global brush strength slider with the immediate intensity of this specific stroke.
    const strength = brushStrength * intensity;

    // --- 3. LOOP THROUGH EVERY VERTEX IN THE ENTIRE MESH ---
    // This is the core of the process. We check every single vertex to see if it's inside our brush's radius.
    for (let i = 0; i < count; i++) {
        
        // Create a Vector3 object for the current vertex for easier math.
        const vertex = new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
        );

        // --- 4. CHECK IF THE VERTEX IS WITHIN THE BRUSH'S INFLUENCE ---
        const distance = vertex.distanceTo(point); // Calculate distance from the vertex to the center of the brush.

        if (distance < brushRadius) {
            // The vertex is inside the brush's radius. Now we apply the effect.

            // --- 5. CALCULATE THE FALLOFF ---
            // This makes the brush effect strongest at the center and weaker at the edges, creating a smooth, natural feel.
            // The formula creates a smooth curve. `brushFalloff` from the UI controls how sharp this curve is.
            // A value of 1 means full strength everywhere (a hard edge), 0 is a very soft edge.
            const falloff = Math.pow(1 - (distance / brushRadius), 2 + brushFalloff * 2);
            const effectiveStrength = strength * falloff;

            // Get the normal of the current vertex. This tells us which way the vertex is "facing".
            const vertexNormal = new THREE.Vector3(
                normals.getX(i),
                normals.getY(i),
                normals.getZ(i)
            );

            // This will hold the final calculated movement for the vertex.
            let displacement = new THREE.Vector3();

            // --- 6. APPLY THE CORRECT LOGIC BASED ON THE SELECTED TOOL ---
            // This is where the "words" (tool names) become actions.
            switch (currentTool) {
                case 'push':
                    // Moves the vertex OUTWARDS along its own normal.
                    displacement = vertexNormal.multiplyScalar(effectiveStrength);
                    break;

                case 'pull':
                    // Moves the vertex INWARDS along its own normal.
                    displacement = vertexNormal.multiplyScalar(-effectiveStrength);
                    break;

                case 'carve':
                    // Same as 'pull', but with double the strength for creating deep cuts like eye sockets.
                    displacement = vertexNormal.multiplyScalar(-effectiveStrength * 2);
                    break;

                case 'build':
                    // Same as 'push', but with 1.5x strength for building up forms like a nose or cheekbones faster.
                    displacement = vertexNormal.multiplyScalar(effectiveStrength * 1.5);
                    break;

                case 'inflate':
                    // Moves the vertex away from the center of the mesh, making it "puff up".
                    const toCenter = vertex.clone().normalize();
                    displacement = toCenter.multiplyScalar(effectiveStrength);
                    break;

                case 'grab':
                    // Moves the vertex towards the center of the brush. Good for large-scale shape changes.
                    displacement = point.clone().sub(vertex).multiplyScalar(effectiveStrength * 0.5);
                    break;

                case 'flatten':
                    // Moves the vertex towards the plane defined by the brush's center and normal.
                    const flattenDist = vertex.clone().sub(point).dot(normal);
                    displacement = normal.clone().multiplyScalar(-flattenDist * effectiveStrength);
                    break;

                case 'smooth':
                    // This is a simplified smooth. It moves the vertex slightly towards the mesh's origin.
                    // A true smooth would average it with its neighbors.
                    displacement = vertex.clone().multiplyScalar(-effectiveStrength * 0.1);
                    break;
                
                case 'pinch':
                    // Pulls vertices towards the center of the brush, creating sharp ridges.
                    displacement = point.clone().sub(vertex).multiplyScalar(effectiveStrength);
                    break;

                case 'crease':
                    // Pushes vertices perpendicular to the brush stroke, creating a sharp valley.
                    const perpendicular = normal.clone().cross(vertex.clone().sub(point)).normalize();
                    displacement = perpendicular.multiplyScalar(effectiveStrength);
                    break;
            }

            // --- 7. APPLY THE DISPLACEMENT ---
            // Add the calculated movement to the vertex's current position.
            vertex.add(displacement);

            // --- 8. UPDATE THE ACTUAL GEOMETRY DATA ---
            // Write the new, modified vertex position back into the main `positions` array.
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);

            // --- 9. HANDLE SYMMETRY ---
            // If symmetry is on, find the corresponding vertex on the other side and apply the same transformation.
            if (symmetry.x) {
                // A simple but effective way to find the mirrored vertex.
                const symVertex = new THREE.Vector3(-vertex.x, vertex.y, vertex.z);
                const symIndex = findNearestVertex(symVertex); // Helper function to find the closest vertex index.
                if (symIndex !== -1) {
                    // Apply the mirrored position.
                    positions.setXYZ(symIndex, -vertex.x, vertex.y, vertex.z);
                }
            }
            // (Similar logic for Y and Z symmetry)
        }
    }

    // --- 10. NOTIFY THREE.JS THAT THE GEOMETRY HAS CHANGED ---
    // After the loop, we must tell Three.js that the vertex data has been modified.
    positions.needsUpdate = true;
    // We also need to recalculate the normals for correct lighting.
    geometry.computeVertexNormals();
}
