import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Game UI setup
const gamePanel = document.getElementById("game-panel");
const startGameButton = document.getElementById("start-game");
const volumeControl = document.getElementById("volume");
const backgroundAudio = document.getElementById("backgroundAudio");
const volumeIcon = document.getElementById("volumeIcon");
const resetGameButton = document.getElementById("reset-game");
const homeButton = document.getElementById("home-button");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const loadingScreen = document.getElementById("loading-screen");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const heartsContainer = document.getElementById("hearts-container");
const howToPlayButton = document.getElementById("how-to-play");
const howToPlayInstructions = document.getElementById("how-to-play-instructions");
const closeInstructionsButton = document.getElementById("close-instructions");

howToPlayButton.addEventListener("click", () => {
  gamePanel.style.display = "none";
  howToPlayInstructions.style.display = "block"; // Show instructions
  
});

closeInstructionsButton.addEventListener("click", () => {
  howToPlayInstructions.style.display = "none"; // Hide instructions
  gamePanel.style.display = "block"; // Show the game panel
});

let isGameRunning = false;
let isUserInteracted = false;
let isMuted = false;

// Volume control logic
volumeControl.addEventListener("input", () => {
  if (!isUserInteracted) {
    backgroundAudio.play().catch((error) => console.error("Audio play failed:", error));
    isUserInteracted = true;
  }
  const volume = volumeControl.value;
  backgroundAudio.volume = volume / 100;
  volume === 0 ? muteAudio() : unmuteAudio();
});

volumeIcon.addEventListener("click", () => {
  isMuted ? unmuteAudio() : muteAudio();
});

function muteAudio() {
  backgroundAudio.volume = 0;
  volumeControl.value = 0;
  volumeIcon.textContent = "🔇";
  isMuted = true;
}

function unmuteAudio() {
  backgroundAudio.volume = volumeControl.value / 100;
  volumeIcon.textContent = "🔊";
  isMuted = false;
}

// Initialize game functions
let lives = 3;
const maxLives = 3;

function updateHeartsDisplay() {
  heartsContainer.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement("span");
    heart.innerText = "❤️";
    heartsContainer.appendChild(heart);
  }
}

// Loading screen simulation
function simulateLoading() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 1;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      hideLoadingScreen();
    }
  }, 30);
}

function showLoadingScreen() {
  loadingScreen.style.display = "flex";
  simulateLoading();
  gamePanel.style.display = "none";
}

function hideLoadingScreen() {
  loadingScreen.style.display = "none";
  gamePanel.style.display = "block";
}

showLoadingScreen();

// Score & High Score Logic
let currentScore = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameSpeed = 0.005;

function updateScore() {
  if (isGameRunning) {
    currentScore += 1;
    scoreElement.innerText = `Score: ${currentScore}`;

    if (currentScore > highScore) {
      highScore = currentScore;
      localStorage.setItem("highScore", highScore);
    }
  }
  highScoreElement.innerText = `High Score: ${highScore}`;
}

setInterval(updateScore, 5);

homeButton.addEventListener("click", returnToHome);

function returnToHome() {
  resetGame();
  gamePanel.style.display = "block";
  resetGameButton.style.display = "none";
  homeButton.style.display = "none";
  scoreElement.style.display = "none";
  highScoreElement.style.display = "none";
  heartsContainer.style.display = "none";
  isGameRunning = false;
}

resetGameButton.addEventListener("click", resetGame);

function resetGame() {
  lives = maxLives;
  updateHeartsDisplay();

  currentScore = 0;
  scoreElement.innerText = `Score: ${currentScore}`;

  if (!isGameRunning) {
    isGameRunning = true;
    animate();
  }
}

startGameButton.addEventListener("click", () => {
  gamePanel.style.display = "none";
  resetGameButton.style.display = "block";
  homeButton.style.display = "block";
  scoreElement.style.display = "block";
  highScoreElement.style.display = "block";
  heartsContainer.style.display = "block";

  lives = maxLives;
  updateHeartsDisplay();

  isGameRunning = true;
  animate();
});

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2.74, 8);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
let car;

loader.load("static/models/car2.glb", (gltf) => {
  car = gltf.scene;
  car.scale.set(1, 1, 1);
  car.position.set(0, -3, 0);
  scene.add(car);
});

const carVelocity = { x: 0, y: 0, z: 0 };
const carSpeed = 0.1;

// Car movement logic
window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "ArrowLeft":
      carVelocity.x = -carSpeed;
      break;
    case "ArrowRight":
      carVelocity.x = carSpeed;
      break;
    case "ArrowDown":
      carVelocity.z = carSpeed;
      break;
    case "ArrowUp":
      carVelocity.z = -carSpeed;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "ArrowLeft":
    case "ArrowRight":
      carVelocity.x = 0;
      break;
    case "ArrowDown":
    case "ArrowUp":
      carVelocity.z = 0;
      break;
  }
});

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Road setup
let roadOffset = 0;
const roadSpeed = 0.05;

const roadTexture = new THREE.TextureLoader().load("static/textures/road.png", () => {
  console.log("Texture Loaded!");
}, undefined, (error) => {
  console.error("Texture failed to load:", error);
});

const groundGeometry = new THREE.PlaneGeometry(10, 200);
const groundMaterial = new THREE.MeshStandardMaterial({
  map: roadTexture,
  side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2;
ground.position.y = -3;
scene.add(ground);

roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(1, 10); // Adjust for the road texture repeat

function updateRoad() {
  roadOffset += roadSpeed;
  if (roadOffset >= 1) roadOffset = 0;
  ground.material.map.offset.set(0, roadOffset);
}

// Falling cubes (sliding towards the car)
const fallingCubes = [];
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

// Placeholder texture loader for cubes
const cubeTexture = new THREE.TextureLoader().load(
  "/static/textures/bricks.jpg", // Replace with your brick texture path
  () => console.log("Brick texture loaded!"),
  undefined,
  (error) => console.error("Brick texture failed to load:", error)
);

const cubeMaterial = new THREE.MeshStandardMaterial({
  map: cubeTexture,
});

// Function to spawn sliding cubes
function spawnFallingCubes() {
  const spawnProbability = 0.02; // Lower spawn rate for fewer cubes
  if (Math.random() < spawnProbability) {
    const newCube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // Set random position for the cube within road bounds
    const roadWidth = 8; // Slightly narrower than the road width for placement
    const cubeXPosition = (Math.random() * roadWidth) - roadWidth / 2; // Random X position
    const cubeZPosition = -50; // Starting far from the camera

    newCube.position.set(cubeXPosition, -2.5, cubeZPosition);
    newCube.velocity = new THREE.Vector3(0, 0, 0.2); // Sliding speed towards the player

    // Add cube to the scene and array
    fallingCubes.push(newCube);
    scene.add(newCube);
  }
}

// Function to update cubes' positions
function updateFallingCubes() {
  for (let i = fallingCubes.length - 1; i >= 0; i--) {
    const cube = fallingCubes[i];

    // Move cube along the Z-axis towards the player
    cube.position.z += cube.velocity.z;

    // Remove cubes that move past the player
    if (cube.position.z > 5) {
      scene.remove(cube);
      fallingCubes.splice(i, 1);
    }
  }
}


// Collision detection
function checkCollisions() {
  if (lives <= 0) {
    return; // Don't check for collisions if the game is over
  }

  for (let i = fallingCubes.length - 1; i >= 0; i--) {
    const cube = fallingCubes[i];
    const carBB = new THREE.Box3().setFromObject(car);
    const cubeBB = new THREE.Box3().setFromObject(cube);

    if (carBB.intersectsBox(cubeBB)) {
      // Handle collision: Remove cube, deduct life, and update UI
      scene.remove(cube);
      fallingCubes.splice(i, 1);
      lives--;
      updateHeartsDisplay();

      // Game over if no lives are left
      if (lives <= 0) {
        isGameRunning = false; // Stop the game loop
        alert("Game Over!");
        returnToHome(); // Automatically return to home after game over
        break; // Break out of the loop to prevent further collision checks
      }
    }
  }
}

// Animation function
let animationId;  // Store the animation ID to cancel the loop properly

function animate() {
  if (!isGameRunning) {
    return; // Exit if the game is over
  }

  animationId = requestAnimationFrame(animate); // Request the next frame if the game is running

  // Update components
  updateScore();
  updateRoad();
  spawnFallingCubes();
  updateFallingCubes();
  checkCollisions();

  // Move the car based on velocity
  car.position.x += carVelocity.x;
  car.position.z += carVelocity.z;

  // Restrict car movement to within road boundaries
  car.position.x = Math.max(Math.min(car.position.x, 4.5), -4.5);

  // Render the scene
  renderer.render(scene, camera);
}
