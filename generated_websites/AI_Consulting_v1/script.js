
console.log('🚀 Initializing 3D environment for AI Consulting v1...');

// --- THREE.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const container = document.getElementById('canvas-container');
container.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Controls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableDamping = true;

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// --- Neural Network Visualization ---
const networkGroup = new THREE.Group();
const layers = [5, 8, 10, 8, 5]; // Number of nodes in each layer
const layerDistance = 4;
const nodeRadius = 0.2;

const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 16, 16);
const nodeMaterial = new THREE.MeshPhongMaterial({ color: 0x4d88ff, emissive: 0x224488, shininess: 100 });

const nodes = [];

// Create nodes
for (let i = 0; i < layers.length; i++) {
    const layerNodes = [];
    const layerSize = layers[i];
    for (let j = 0; j < layerSize; j++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        
        const x = (i - (layers.length - 1) / 2) * layerDistance;
        const y = (j - (layerSize - 1) / 2) * 1.5;
        const z = 0;
        
        node.position.set(x, y, z);
        networkGroup.add(node);
        layerNodes.push(node);
    }
    nodes.push(layerNodes);
}

// Create connections (lines)
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff55a3, transparent: true, opacity: 0.3 });
for (let i = 0; i < layers.length - 1; i++) {
    for (let j = 0; j < layers[i]; j++) {
        for (let k = 0; k < layers[i+1]; k++) {
            const points = [];
            points.push(nodes[i][j].position);
            points.push(nodes[i+1][k].position);
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            networkGroup.add(line);
        }
    }
}

scene.add(networkGroup);

// --- Camera Position ---
camera.position.z = 15;

// --- Animation Loop ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Animate nodes
    networkGroup.children.forEach(child => {
        if (child.isMesh) {
            child.material.emissiveIntensity = (Math.sin(elapsedTime * 2 + child.position.x) + 1) / 2 * 0.5 + 0.5;
        }
    });

    controls.update();
    renderer.render(scene, camera);
}

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Initialization ---
animate();

console.log('✅ 3D environment for AI Consulting v1 is ready.');
