/**
 * VLS Renderer - Three.js Integration
 * Renders Vertex Language System (VLS) strings as Three.js meshes
 * 
 * Eugene Ousos - PixelProdigy AI
 */

class VLSRenderer {
    constructor() {
        this.parser = new VLSParser();
    }
    
    /**
     * Render VLS string to Three.js mesh
     * @param {string} vlsString - VLS encoded string
     * @param {object} options - Rendering options
     * @returns {THREE.Mesh} - Three.js mesh object
     */
    renderToThreeJS(vlsString, options = {}) {
        console.log(`🎨 Rendering VLS to Three.js: ${vlsString.slice(0, 50)}...`);
        
        // Parse VLS to mesh data
        const meshData = this.parser.parse(vlsString);
        
        // Create Three.js geometry
        const geometry = this.createGeometry(meshData, options);
        
        // Create material
        const material = this.createMaterial(meshData.materials, options);
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = options.castShadow !== false;
        mesh.receiveShadow = options.receiveShadow !== false;
        
        // Store VLS metadata
        mesh.userData.vls = vlsString;
        mesh.userData.operations = meshData.operations;
        mesh.userData.vertexCount = meshData.vertices.length / 3;
        
        console.log(`✅ Rendered mesh: ${mesh.userData.vertexCount} vertices`);
        
        return mesh;
    }
    
    /**
     * Create Three.js BufferGeometry from mesh data
     */
    createGeometry(meshData, options) {
        const geometry = new THREE.BufferGeometry();
        
        // Set vertices
        if (meshData.vertices.length > 0) {
            const vertices = new Float32Array(meshData.vertices);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        }
        
        // Set normals
        if (meshData.normals.length > 0) {
            const normals = new Float32Array(meshData.normals);
            geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        } else {
            // Compute normals if not provided
            geometry.computeVertexNormals();
        }
        
        // Set UVs
        if (meshData.uvs.length > 0) {
            const uvs = new Float32Array(meshData.uvs);
            geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        }
        
        // Set indices
        if (meshData.indices.length > 0) {
            geometry.setIndex(meshData.indices);
        }
        
        // Center geometry if requested
        if (options.center) {
            geometry.center();
        }
        
        // Compute bounding sphere for culling
        geometry.computeBoundingSphere();
        
        return geometry;
    }
    
    /**
     * Create Three.js material from material data
     */
    createMaterial(materialData, options) {
        // Default material properties
        const props = {
            color: new THREE.Color(materialData.color || '#ffffff'),
            metalness: materialData.metallic || 0.5,
            roughness: materialData.roughness || 0.5,
            side: options.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        };
        
        // Apply optional properties
        if (materialData.opacity !== undefined) {
            props.transparent = true;
            props.opacity = materialData.opacity;
        }
        
        if (materialData.emissive !== undefined) {
            props.emissive = new THREE.Color(materialData.color || '#ffffff');
            props.emissiveIntensity = materialData.emissive;
        }
        
        // Create material based on type
        let material;
        if (options.wireframe) {
            material = new THREE.MeshBasicMaterial({
                color: props.color,
                wireframe: true
            });
        } else {
            material = new THREE.MeshStandardMaterial(props);
        }
        
        return material;
    }
    
    /**
     * Render VLS with lighting
     */
    renderWithLighting(vlsString, options = {}) {
        const mesh = this.renderToThreeJS(vlsString, options);
        const group = new THREE.Group();
        group.add(mesh);
        
        // Parse lighting from VLS
        const meshData = this.parser.parse(vlsString);
        if (meshData.materials.lighting) {
            meshData.materials.lighting.forEach(light => {
                const lightObj = this.createLight(light);
                if (lightObj) {
                    group.add(lightObj);
                }
            });
        } else {
            // Add default lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            group.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 7.5);
            directionalLight.castShadow = options.shadows !== false;
            group.add(directionalLight);
        }
        
        return group;
    }
    
    /**
     * Create Three.js light from lighting data
     */
    createLight(lightData) {
        const type = lightData.type;
        const params = lightData.params || [];
        
        switch(type) {
            case 1: // Ambient
                return new THREE.AmbientLight(0xffffff, params[0] || 0.3);
            
            case 2: // Directional
                const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
                dirLight.position.set(params[0] || 5, params[1] || 10, params[2] || 7.5);
                dirLight.castShadow = true;
                return dirLight;
            
            case 3: // Point
                const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
                pointLight.position.set(params[0] || 0, params[1] || 5, params[2] || 0);
                pointLight.castShadow = true;
                return pointLight;
            
            case 4: // Spot
                const spotLight = new THREE.SpotLight(0xffffff, 1.0);
                spotLight.position.set(params[0] || 0, params[1] || 5, params[2] || 0);
                spotLight.angle = Math.PI / 6;
                spotLight.castShadow = true;
                return spotLight;
            
            case 5: // Area (approximated with RectAreaLight if available)
                if (THREE.RectAreaLight) {
                    return new THREE.RectAreaLight(0xffffff, 1.0, 10, 10);
                }
                return new THREE.PointLight(0xffffff, 1.0);
            
            default:
                return null;
        }
    }
    
    /**
     * Render LOD variants
     */
    renderLOD(vlsLODs, options = {}) {
        const lod = new THREE.LOD();
        
        vlsLODs.forEach((lodData, index) => {
            const mesh = this.renderToThreeJS(lodData.vls, options);
            lod.addLevel(mesh, lodData.distance);
            
            // Store LOD metadata
            mesh.userData.lodLevel = index;
            mesh.userData.lodDistance = lodData.distance;
        });
        
        return lod;
    }
    
    /**
     * Animate VLS transformations
     */
    animateVLS(vlsFrames, options = {}) {
        const duration = options.duration || 1000; // ms
        const loop = options.loop || false;
        
        return {
            frames: vlsFrames.map(vls => this.renderToThreeJS(vls, options)),
            duration,
            loop,
            currentFrame: 0,
            
            update(deltaTime) {
                // Animation logic would go here
                // This is a placeholder for future animation system
            }
        };
    }
    
    /**
     * Export VLS mesh to GLB format
     */
    async exportToGLB(vlsString, options = {}) {
        const mesh = this.renderToThreeJS(vlsString, options);
        
        // Use GLTFExporter if available
        if (typeof THREE.GLTFExporter !== 'undefined') {
            const exporter = new THREE.GLTFExporter();
            
            return new Promise((resolve, reject) => {
                exporter.parse(
                    mesh,
                    (gltf) => resolve(gltf),
                    (error) => reject(error),
                    { binary: true }
                );
            });
        } else {
            throw new Error('GLTFExporter not available');
        }
    }
    
    /**
     * Create preview scene with VLS mesh
     */
    createPreviewScene(vlsString, containerElement, options = {}) {
        // Setup scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(options.backgroundColor || 0xf0f0f0);
        
        // Camera
        const camera = new THREE.PerspectiveCamera(
            45,
            containerElement.clientWidth / containerElement.clientHeight,
            0.1,
            1000
        );
        camera.position.set(3, 3, 5);
        camera.lookAt(0, 0, 0);
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
        renderer.shadowMap.enabled = true;
        containerElement.appendChild(renderer.domElement);
        
        // Add VLS mesh with lighting
        const meshGroup = this.renderWithLighting(vlsString, options);
        scene.add(meshGroup);
        
        // Ground plane
        if (options.showGround !== false) {
            const groundGeometry = new THREE.PlaneGeometry(10, 10);
            const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);
        }
        
        // Controls
        let controls = null;
        if (typeof THREE.OrbitControls !== 'undefined' && options.controls !== false) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
        }
        
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (controls) {
                controls.update();
            } else if (options.autoRotate !== false) {
                meshGroup.rotation.y += 0.01;
            }
            
            renderer.render(scene, camera);
        };
        animate();
        
        // Handle resize
        const handleResize = () => {
            camera.aspect = containerElement.clientWidth / containerElement.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        
        return {
            scene,
            camera,
            renderer,
            mesh: meshGroup,
            controls,
            dispose: () => {
                window.removeEventListener('resize', handleResize);
                renderer.dispose();
                if (controls) controls.dispose();
            }
        };
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VLSRenderer;
}
