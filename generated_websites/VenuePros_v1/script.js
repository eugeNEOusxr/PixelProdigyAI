
console.log('🚀 Initializing 3D environment for VenuePros v1...');

// --- THREE.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const container = document.getElementById('canvas-container');
container.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- Controls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// --- Main Venue Object ---
function createVenue() {
    const group = new THREE.Group();

    // Main floor
    const floorGeometry = new THREE.BoxGeometry(30, 0.2, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    group.add(floor);

    // Stage
    const stageGeometry = new THREE.BoxGeometry(10, 0.8, 6);
    const stageMaterial = new THREE.MeshStandardMaterial({ color: 0x555566 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, 0.5, -7);
    group.add(stage);

    // Screen on stage
    const screenGeometry = new THREE.PlaneGeometry(8, 4.5);
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffaa, side: THREE.DoubleSide });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 3, -9.9);
    group.add(screen);

    // Pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x444455 });
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(i * 12, 4, j * 7);
            group.add(pillar);
        }
    }
    
    scene.add(group);
}

// --- Camera Position ---
camera.position.set(0, 15, 20);
controls.update();

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    renderer.render(scene, camera);
}

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Initialization ---
createVenue();
animate();

console.log('✅ 3D environment for VenuePros v1 is ready.');
