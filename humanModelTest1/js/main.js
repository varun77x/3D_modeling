// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();
// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Keep track of the mouse position
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Keep the 3D object on a global variable so we can access it later
let humanModel;

// Raycaster and mouse vector for click detection
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();

// OrbitControls for camera movement
let controls;

// Set the object to render (human model)
let objToRender = 'human'; // Change to 'human' to load the human figure

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load the human model (assumed to be in `human_model` folder with scene.gltf inside)
loader.load(
  `./models/${objToRender}/scene.gltf`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    humanModel = gltf.scene;
    scene.add(humanModel);

    // Enable raycasting on each mesh part (for interaction)
    humanModel.traverse((child) => {
      if (child.isMesh) {
        child.userData.isClickable = true; // Mark as cslickable
        child.name = child.name || "body"; // Add a name to each part (e.g., head, arm)

        // Ensure that materials are double-sided so the back of the model is visible
        if (child.material && !child.material.side) {
          child.material.side = THREE.DoubleSide;
        }
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

// Bind OrbitControls only to the container3D div
controls.enableZoom = false;  // Disable zooming in and out
controls.enableRotate = true; // Enable rotation
controls.enablePan = false;    // Enable panning (right-click to pan)
controls.enableDamping = false;

// Raycasting for clicking on body parts
// function onMouseClick(event) {
//   // Normalize mouse position to -1 to +1 range
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   // Update raycaster to point to the mouse position
//   raycaster.update(camera.position, mouse);

//   // Check for intersections with the model
//   const intersects = getIntersections();

//   // If an intersection is detected, handle it
//   if (intersects.length > 0) {
//     const selectedPart = intersects[0].object;
//     console.log('Clicked on:', selectedPart.name);

//     // Example action for clicking on the head (you can replace this logic with your desired interaction)
//     if (selectedPart.name === 'head') {
//       alert('You clicked the head!');
//     }
//   }
// }

// Get the objects intersected by the raycaster
// function getIntersections() {
//   return raycaster.intersectObject(humanModel, true); // Set to true for all child meshes
// }

// // Add event listener for mouse click
// window.addEventListener('click', onMouseClick, false);

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

// Add a listener to the window for resizing
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add mouse position listener for interactive elements like moving the eye
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

// Start the 3D rendering loop
animate();
