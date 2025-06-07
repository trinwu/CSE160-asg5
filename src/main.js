import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Scene setup
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Scene
const scene = new THREE.Scene();

// Camera with perspective projection
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, 20);

// Camera controls (OrbitControls)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 100;

// Skybox setup
function createSkybox() {
    const loader = new THREE.CubeTextureLoader();
    
    // Create simple colored skybox using data URLs
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const faces = [];
    const colors = [
        ['#87CEEB', '#4169E1'], // right - blue gradient
        ['#87CEEB', '#4169E1'], // left - blue gradient  
        ['#87CEEB', '#FFFFFF'], // top - light blue to white
        ['#228B22', '#006400'], // bottom - green ground
        ['#87CEEB', '#4169E1'], // front - blue gradient
        ['#87CEEB', '#4169E1']  // back - blue gradient
    ];
    
    colors.forEach(([color1, color2]) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        faces.push(canvas.toDataURL());
    });
    
    const skyboxTexture = loader.load(faces);
    scene.background = skyboxTexture;
}

// Lighting setup (3+ different light sources)
let ambientLight, directionalLight, spotLight, pointLight;

function setupLighting() {
    // 1. Ambient light
    ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // 2. Directional light (sun)
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    
    // 3. Spot light
    spotLight = new THREE.SpotLight(0xff6600, 1, 100, Math.PI / 6, 0.5);
    spotLight.position.set(0, 30, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);
    
    // 4. Point light (moving)
    pointLight = new THREE.PointLight(0x00ff00, 0.8, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
}

// Texture loading from image files
function createTextures() {
    const textureLoader = new THREE.TextureLoader();
    
    const textures = {};
    
    // Load texture images
    textures.brick = textureLoader.load('brick.jpg');
    textures.brick.wrapS = textures.brick.wrapT = THREE.RepeatWrapping;
    textures.brick.repeat.set(2, 2);
    
    textures.metal = textureLoader.load('metal.png');
    textures.metal.wrapS = textures.metal.wrapT = THREE.RepeatWrapping;
    textures.metal.repeat.set(1, 1);
    
    textures.wood = textureLoader.load('wood.png');
    textures.wood.wrapS = textures.wood.wrapT = THREE.RepeatWrapping;
    textures.wood.repeat.set(1, 1);
    
    // Set texture filtering for better quality
    Object.values(textures).forEach(texture => {
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });
    
    return textures;
}

// Create 20+ primary shapes with textures
function createPrimaryShapes(textures) {
    const shapes = [];
    
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        map: textures.brick,
        color: 0x888888
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create various shapes in a grid pattern
    const shapeTypes = [
        () => new THREE.BoxGeometry(2, 2, 2),
        () => new THREE.SphereGeometry(1.2, 16, 16),
        () => new THREE.CylinderGeometry(1, 1, 2, 16),
        () => new THREE.ConeGeometry(1, 2, 16),
        () => new THREE.TorusGeometry(1, 0.4, 8, 16),
        () => new THREE.OctahedronGeometry(1.5),
        () => new THREE.DodecahedronGeometry(1.2),
        () => new THREE.IcosahedronGeometry(1.2)
    ];
    
    const materials = [
        new THREE.MeshPhongMaterial({ map: textures.brick, color: 0xff6b6b }),
        new THREE.MeshPhongMaterial({ map: textures.wood, color: 0x4ecdc4 }),
        new THREE.MeshPhongMaterial({ map: textures.metal, color: 0x45b7d1 }),
        new THREE.MeshPhongMaterial({ color: 0x96ceb4 }),
        new THREE.MeshPhongMaterial({ color: 0xffeaa7 }),
        new THREE.MeshPhongMaterial({ color: 0xdda0dd }),
        new THREE.MeshPhongMaterial({ color: 0xfab1a0 }),
        new THREE.MeshPhongMaterial({ color: 0x74b9ff })
    ];
    
    // Create 25 shapes (exceeds requirement of 20)
    for(let i = 0; i < 25; i++) {
        const geometry = shapeTypes[i % shapeTypes.length]();
        const material = materials[i % materials.length].clone();
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position in a spiral pattern
        const angle = (i / 25) * Math.PI * 4;
        const radius = 8 + (i / 25) * 12;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;
        mesh.position.y = Math.random() * 5;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        scene.add(mesh);
        shapes.push(mesh);
    }
    
    return shapes;
}

// Load custom 3D model (GLTF/GLB)
function loadCustomModel() {
    const loader = new GLTFLoader();
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Loading Grandpa model...';
    document.body.appendChild(loadingDiv);
    
    loader.load(
        'Grandpa.glb',
        function(gltf) {
            console.log('Model loaded successfully:', gltf);
            
            const model = gltf.scene;
            
            // Scale and position the model appropriately
            model.scale.setScalar(2); // Adjust scale as needed
            model.position.set(10, -5, -10); // Position it in the scene
            
            // Enable shadows for the model
            model.traverse(function(child) {
                if(child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Ensure materials are properly lit
                    if(child.material) {
                        child.material.needsUpdate = true;
                    }
                }
            });
            
            scene.add(model);
            
            // Remove loading indicator
            document.body.removeChild(loadingDiv);
            
            // Store reference for animation
            window.grandpaModel = model;
            
            console.log('Grandpa model added to scene');
        },
        function(progress) {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading model:', error);
            
            // Remove loading indicator
            if(document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
            }
            
            // Create fallback message
            console.log('Model failed to load, but procedural house is still available');
        }
    );
}

// Create procedural house model (keeping as additional custom model)
function createHouseModel() {
    const group = new THREE.Group();
    
    // Create a simple house model
    // Base
    const baseGeometry = new THREE.BoxGeometry(4, 3, 4);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1.5;
    base.castShadow = true;
    group.add(base);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    // Door
    const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
    const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.75, 2.05);
    group.add(door);
    
    // Windows
    const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB });
    
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-1.2, 1.5, 2.05);
    group.add(window1);
    
    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(1.2, 1.5, 2.05);
    group.add(window2);
    
    group.position.set(-15, -3.5, -15);
    scene.add(group);
    
    return group;
}

// Particle system (WOW feature)
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.gravity = 0.5;
        this.particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        this.particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    }
    
    createParticle(position) {
        const particle = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            Math.random() * 15 + 5,
            (Math.random() - 0.5) * 10
        );
        particle.material.color.setHSL(Math.random(), 1, 0.5);
        scene.add(particle);
        this.particles.push(particle);
    }
    
    createExplosion(position, count = 20) {
        for(let i = 0; i < count; i++) {
            this.createParticle(position);
        }
    }
    
    update(deltaTime) {
        for(let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Apply gravity
            particle.velocity.y -= this.gravity * deltaTime;
            
            // Update position
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            
            // Remove particles that fall too low
            if(particle.position.y < -10) {
                scene.remove(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    clear() {
        this.particles.forEach(particle => scene.remove(particle));
        this.particles = [];
    }
}

// Initialize everything
const textures = createTextures();
createSkybox();
setupLighting();
const shapes = createPrimaryShapes(textures);
const houseModel = createHouseModel(); // Procedural house
loadCustomModel(); // Load Grandpa.glb
const particleSystem = new ParticleSystem();

// Animation variables
let isAnimating = true;
let time = 0;
let frameCount = 0;
let lastTime = 0;

// Animation loop
function animate(currentTime) {
    frameCount++;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Update FPS counter
    if(frameCount % 60 === 0) {
        const fps = Math.round(1 / deltaTime);
        document.getElementById('fps').textContent = fps;
    }
    
    // Update time display
    time += deltaTime;
    document.getElementById('time').textContent = time.toFixed(1);
    
    if(isAnimating) {
        // Animate shapes
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index % 3) * 0.3;
            shape.rotation.x += speed * deltaTime;
            shape.rotation.y += speed * deltaTime * 0.7;
            
            // Floating motion
            shape.position.y += Math.sin(time * speed + index) * 0.01;
        });
        
        // Animate custom models
        houseModel.rotation.y += deltaTime * 0.5;
        
        // Animate Grandpa model if loaded
        if(window.grandpaModel) {
            window.grandpaModel.rotation.y += deltaTime * 0.3;
        }
        
        // Animate lights
        pointLight.position.x = Math.sin(time) * 20;
        pointLight.position.z = Math.cos(time) * 20;
        
        spotLight.position.x = Math.sin(time * 0.7) * 15;
        spotLight.position.z = Math.cos(time * 0.7) * 15;
    }
    
    // Update particle system
    particleSystem.update(deltaTime);
    
    // Update controls
    controls.update();
    
    // Update stats
    document.getElementById('objectCount').textContent = scene.children.length;
    document.getElementById('particleCount').textContent = particleSystem.particles.length;
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Event handlers
document.getElementById('toggleAnimation').addEventListener('click', () => {
    isAnimating = !isAnimating;
    document.getElementById('toggleAnimation').textContent = isAnimating ? 'Pause Animation' : 'Resume Animation';
});

document.getElementById('resetScene').addEventListener('click', () => {
    // Reset camera
    camera.position.set(20, 15, 20);
    controls.reset();
    
    // Clear particles
    particleSystem.clear();
    
    // Reset time
    time = 0;
    frameCount = 0;
    
    isAnimating = true;
    document.getElementById('toggleAnimation').textContent = 'Pause Animation';
});

document.getElementById('randomizeColors').addEventListener('click', () => {
    shapes.forEach(shape => {
        shape.material.color.setHSL(Math.random(), 0.7, 0.5);
    });
});

document.getElementById('createParticles').addEventListener('click', () => {
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        10,
        (Math.random() - 0.5) * 30
    );
    particleSystem.createExplosion(position, 30);
});

document.getElementById('clearParticles').addEventListener('click', () => {
    particleSystem.clear();
});

// Lighting controls
document.getElementById('ambientSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    ambientLight.intensity = value;
    document.getElementById('ambientValue').textContent = value.toFixed(1);
});

document.getElementById('directionalSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    directionalLight.intensity = value;
    document.getElementById('directionalValue').textContent = value.toFixed(1);
});

document.getElementById('spotSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    spotLight.intensity = value;
    document.getElementById('spotValue').textContent = value.toFixed(1);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    particleSystem.gravity = value;
    document.getElementById('gravityValue').textContent = value.toFixed(1);
});

// Mouse interaction for particle creation
canvas.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(shapes);
    if(intersects.length > 0) {
        particleSystem.createExplosion(intersects[0].point, 15);
    }
});

// Window resize handler
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}

window.addEventListener('resize', handleResize);

// Start the animation
requestAnimationFrame(animate);