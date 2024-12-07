// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Plane Geometry
const planeGeometry = new THREE.PlaneGeometry(20, 20, 64, 64);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, wireframe: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Ball Geometry
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.5;
scene.add(ball);

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Add Ambient Light
scene.add(new THREE.AmbientLight(0x404040));

// Camera Position
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

// Gravity Wells
const gravityWells = [
    { position: new THREE.Vector3(5, 0, 5), strength: 10 },
    { position: new THREE.Vector3(-5, 0, -5), strength: 15 }
];

// Ball Physics
let velocity = new THREE.Vector3(0, 0, 0);
const speed = 0.1;

// Key Input
const keys = {};
window.addEventListener("keydown", (event) => keys[event.key] = true);
window.addEventListener("keyup", (event) => keys[event.key] = false);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Ball Movement
    if (keys["w"]) velocity.z -= speed;
    if (keys["s"]) velocity.z += speed;
    if (keys["a"]) velocity.x -= speed;
    if (keys["d"]) velocity.x += speed;

    // Gravity Effects
    gravityWells.forEach(well => {
        const direction = new THREE.Vector3().subVectors(well.position, ball.position);
        const distance = direction.length();
        const gravity = (well.strength / (distance * distance)) * 0.1; // Inverse square law
        velocity.add(direction.normalize().multiplyScalar(gravity));
    });

    // Update Ball Position
    ball.position.add(velocity);

    // Simulate Plane Deformation
    planeGeometry.vertices.forEach(vertex => {
        const deformation = gravityWells.reduce((sum, well) => {
            const dist = vertex.distanceTo(well.position);
            return sum - (well.strength / (dist + 1)) * 0.1; // Avoid division by zero
        }, 0);
        vertex.z = deformation;
    });
    planeGeometry.verticesNeedUpdate = true;
    planeGeometry.computeVertexNormals();

    renderer.render(scene, camera);
}

animate();
