// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
// For rendering HTML labels
import { CSS2DRenderer, CSS2DObject } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/renderers/CSS2DRenderer.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Keep track of the mouse position
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Keep the 3D object on a global variable so we can access it later
let humanModel;

// OrbitControls for camera movement
let controls;

// Set the object to render (human model)
let objToRender = 'human'; // Change to 'human' to load the human figure

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Create a CSS2DRenderer for text labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none'; // Ensure text doesn't block clicks
document.body.appendChild(labelRenderer.domElement);

// Load the human model (assumed to be in `human_model` folder with scene.gltf inside)
loader.load(
  `./models/${objToRender}/scene.gltf`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    humanModel = gltf.scene;
    scene.add(humanModel);

    // Traverse the model and add text labels to body parts
    humanModel.traverse((child) => {
      if (child.isMesh) {
        child.userData.isClickable = true; // Mark as clickable
        child.name = child.name || "body"; // Add a name to each part (e.g., head, arm)

        // Ensure that materials are double-sided so the back of the model is visible
        if (child.material && !child.material.side) {
          child.material.side = THREE.DoubleSide;
        }

        // Create a text label for this body part
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.textContent = child.name; // Use the body part name as the label
        labelDiv.style.color = 'white';
        labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        labelDiv.style.padding = '5px';
        labelDiv.style.borderRadius = '5px';

        // Create a CSS2DObject and attach it to the body part
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, 1, 0); // Adjust the position relative to the body part
        // child.add(label); // Attach the label to the body part
      }
    });

    humanModel.position.y = -0.9;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error(error);
  }
);

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true });

// Get the container size
const container = document.getElementById("container3D");
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// Set renderer size to match the container
renderer.setSize(containerWidth, containerHeight);

// Append the renderer to the container
container.appendChild(renderer.domElement);

// Set how far the camera will be from the 3D model
camera.position.z = 1.4; // Adjust the zoom distance (ideal distance for good view)
camera.position.y = 0.3; // Adjust this based on your human model size

// Add lights to the scene
const topLight = new THREE.DirectionalLight(0xffffff, 0.6); // A subtle blue light
topLight.position.set(0.756, 11.231, 13.484);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x73509f, 0.4); // Cooler, dim ambient light for subtle effect
scene.add(ambientLight);

// Additional light source to illuminate the back of the model
const backLight = new THREE.DirectionalLight(0xffffff, 0.6); // Dim blue light from the back
backLight.position.set(-0.741, 9.037, -11.487);
backLight.castShadow = true;
scene.add(backLight);

// OrbitControls to allow rotating the camera around the human figure
controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;  // Disable zooming in and out
controls.enableRotate = true; // Enable rotation
controls.enablePan = false;   // Enable panning (right-click to pan)
controls.enableDamping = false;

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  // Update the OrbitControls
  controls.update();

  // Render the 3D scene
  renderer.render(scene, camera);

  // Render the text labels
  labelRenderer.render(scene, camera);
}

// Add a listener to the window for resizing
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Add mouse position listener for interactive elements like moving the eye
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

// Start the 3D rendering loop
animate();