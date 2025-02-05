// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { CSS2DRenderer, CSS2DObject } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/renderers/CSS2DRenderer.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let humanModel;
let controls;

// Renderers
const renderer = new THREE.WebGLRenderer({ alpha: true });
const labelRenderer = new CSS2DRenderer();
const container = document.getElementById("container3D");

// Box interaction variables
let clickableBoxes = [];
let hoveredBox = null;
const originalColors = new WeakMap();
const HOVER_COLOR = 0xff0000;

// Initialize renderers
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Raycasting setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Load model
const loader = new GLTFLoader();
loader.load(
  `./models/human/scene.gltf`,
  (gltf) => {
    humanModel = gltf.scene;
    scene.add(humanModel);
    humanModel.position.y = -0.95;

    // Create and attach boxes
    const createBoxMaterial = () => new THREE.MeshPhysicalMaterial({
      color: 0xe007e0,
      transparent: true,
      opacity: 0.5,
      reflectivity: 0.9,
      refractionRatio: 0.98,
      roughness: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      metalness: 0
    });

    const geometryHead = new THREE.BoxGeometry(0.2, 0.25, 0.28);
    const geometryArm = new THREE.BoxGeometry(0.1, 0.8, 0.2);

    const boxes = [
      new THREE.Mesh(geometryHead, createBoxMaterial()),
      new THREE.Mesh(geometryArm, createBoxMaterial()),
      new THREE.Mesh(geometryArm, createBoxMaterial()),
      new THREE.Mesh(geometryHead, createBoxMaterial())
    ];

    // Position boxes
    boxes[0].position.set(0, 1.66, -0.03); // head box
    boxes[1].position.set(-0.25, 1.1, -0.07); // left arm
    boxes[2].position.set(0.3, 1.1, -0.09); // right arm
    boxes[3].position.set(0, 0.2, 0); //down currently nothing
    boxes[1].rotation.x = -Math.PI / 18; // arm box tilt

    // Add boxes to scene
    boxes.forEach(box => {
      humanModel.add(box);
      originalColors.set(box, box.material.color.getHex());
    });

    clickableBoxes = boxes;
  },
  (xhr) => console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`),
  (error) => console.error(error)
);

// Event handlers
function handleMouseEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

// Hover effect
window.addEventListener("mousemove", (event) => {
  handleMouseEvent(event);
  const intersects = raycaster.intersectObjects(clickableBoxes);

  if (hoveredBox) {
    hoveredBox.material.color.setHex(originalColors.get(hoveredBox));
    hoveredBox = null;
  }

  if (intersects.length > 0) {
    hoveredBox = intersects[0].object;
    hoveredBox.material.color.setHex(HOVER_COLOR);
  }
});

// Click handling
window.addEventListener("click", (event) => {
  handleMouseEvent(event);
  const intersects = raycaster.intersectObjects(clickableBoxes);

  if (intersects.length > 0) {
    const clickedBox = intersects[0].object;
    console.log('Clicked box:', clickedBox);

    // Example action: navigate to a link when a box is clicked
    if (clickedBox === clickableBoxes[0]) {
      window.location.href = "https://example.com/head";
    } else if (clickedBox === clickableBoxes[1]) {
      window.location.href = "https://example.com/left-arm";
    } else if (clickedBox === clickableBoxes[2]) {
      window.location.href = "https://example.com/right-arm";
    } else if (clickedBox === clickableBoxes[3]) {
      window.location.href = "https://example.com/torso";
    }
  }


  if (hoveredBox) {
    hoveredBox.material.color.setHex(originalColors.get(hoveredBox));
    hoveredBox = null;
  }
});

// Lights
const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
topLight.position.set(0.756, 11.231, 13.484);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x73509f, 0.4);
scene.add(ambientLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
backLight.position.set(-0.741, 9.037, -11.487);
scene.add(backLight);

// Camera and controls
camera.position.z = 1.4;
camera.position.y = 0.3;

controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enableRotate = true;
controls.enablePan = false;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();