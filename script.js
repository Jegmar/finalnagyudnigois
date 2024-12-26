import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "es-module-shims";


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
let isGameRunning = false; // Flag to track if the game is running

let isUserInteracted = false;
let isMuted = false;

// Start audio when user interacts
volumeControl.addEventListener("input", () => {
  if (!isUserInteracted) {
    backgroundAudio.play().catch((error) => {
      console.error("Audio play failed:", error);
    });
    isUserInteracted = true; // Mark user interaction
  }

  const volume = volumeControl.value;
  console.log(`Volume set to: ${volume}`);
  backgroundAudio.volume = volume / 100;
  if (volume == 0) {
    muteAudio(); // Mute if volume is 0
  } else {
    unmuteAudio(); // Unmute if volume is greater than 0
  }
});

// Toggle mute/unmute when clicking the volume icon
volumeIcon.addEventListener("click", () => {
  if (isMuted) {
    unmuteAudio();
  } else {
    muteAudio();
  }
});

// Mute the audio and update icon
function muteAudio() {
  backgroundAudio.volume = 0;
  volumeControl.value = 0; // Update slider to 0
  volumeIcon.textContent = "🔇"; // Change icon to muted
  isMuted = true;
}

// Unmute the audio and update icon
function unmuteAudio() {
  const volume = volumeControl.value;
  backgroundAudio.volume = volume / 100;
  volumeIcon.textContent = "🔊"; // Change icon to unmuted
  isMuted = false;
}
let lives = 3; // Maximum lives
const maxLives = 3; // Maximum lives

function updateHeartsDisplay() {
  heartsContainer.innerHTML = ""; // Clear existing hearts

  for (let i = 0; i < lives; i++) {
    const heart = document.createElement("span");
    heart.innerText = "❤️"; // Heart emoji
    heartsContainer.appendChild(heart);
  }
}

// Function to simulate loading progress
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
  }, 30); // Adjust time interval for speed of progress
}

// Show the loading screen and start the progress simulation
function showLoadingScreen() {
  loadingScreen.style.display = "flex";
  simulateLoading();
}

// Hide the loading screen after loading is complete
function hideLoadingScreen() {
  loadingScreen.style.display = "none";
  gamePanel.style.display = "block"; // Show the game menu
}

// Initialize loading screen
showLoadingScreen();

resetGameButton.style.display = "none";
homeButton.style.display = "none";
scoreElement.style.display = "none";
highScoreElement.style.display = "none";
heartsContainer.style.display = "none";

let currentScore = 0; // Current score that increases over time
let highScore = localStorage.getItem("highScore") || 0; // Get the high score from localStorage
let gameSpeed = 0.005; // Initial speed for enemies
const speedIncreaseThresholds = [2000, 5000, 1000]; // Score thresholds for speed increase
const speedIncrements = [0.002, 0.004, 0.006]; // Speed increments for each threshold
let scoreIncrement = 1; // Initial score increment
const scoreIncrementIncreaseThresholds = [2000, 5000, 10000]; // Score thresholds for score increment increase
const scoreIncrementValues = [1, 2, 3]; // Score increment values for each threshold

function updateScore() {
  if (isGameRunning) {
    currentScore += scoreIncrement; // Increase score by the current increment
    scoreElement.innerText = `Score: ${currentScore}`;

    // Check if the current score is a new high score
    if (currentScore > highScore) {
      highScore = currentScore;
      localStorage.setItem("highScore", highScore); // Store the new high score in localStorage
    }

    // Check score thresholds to increase game speed and score increment
    for (let i = 0; i < scoreIncrementIncreaseThresholds.length; i++) {
      if (currentScore >= scoreIncrementIncreaseThresholds[i]) {
        gameSpeed += speedIncrements[i]; // Increase game speed
        scoreIncrement = scoreIncrementValues[i]; // Increase score increment
        scoreIncrementIncreaseThresholds[i] = Infinity; // Prevent multiple increases for the same score
      }
    }
  }
  highScoreElement.innerText = `High Score: ${highScore}`;
}

// Call this function on a regular interval to increase the score
setInterval(updateScore, 10); // Update every second

// Display high score at the start
highScoreElement.innerText = `High Score: ${highScore}`;

// Reset game logic when the game ends
function endGame() {
  cancelAnimationFrame(animationId); // Stop the game loop
  isGameRunning = false;
  alert("Game Over!");

  // Update high score display
  highScoreElement.innerText = `High Score: ${highScore}`;

  // Show the reset button
  resetGameButton.style.display = "block";
}

homeButton.addEventListener("click", () => {
  returnToHome();
});

function returnToHome() {
  resetGame();
  gamePanel.style.display = "block"; // Show the game panel
  resetGameButton.style.display = "none"; // Hide the reset button
  homeButton.style.display = "none"; // Hide the home button
  scoreElement.style.display = "none";
  highScoreElement.style.display = "none";
  heartsContainer.style.display = "none";

  isGameRunning = false; // Set game state to stopped
}

resetGameButton.addEventListener("click", () => {
  resetGame();
});

function resetGame() {
  // Reset cube position and velocity to initial state
  cube.position.set(0, 0, 0); // Cube position reset
  cube.velocity = { x: 0, y: -0.01, z: 0 }; // Cube velocity reset to stop movement

  // Reset lives
  lives = maxLives; // Reset lives
  updateHeartsDisplay(); // Update hearts display

  // Reset key states to prevent unintended movement
  keys.a.pressed = false;
  keys.d.pressed = false;
  keys.s.pressed = false;
  keys.w.pressed = false;

  // Clear enemies
  enemies.forEach((enemy) => {
    scene.remove(enemy);
  });
  enemies.length = 0;

  // Reset other variables
  frames = 0;
  spawnRate = 200;

  // Reset camera position and orientation
  camera.position.set(0, 2.74, 5); // Adjusted camera position to make it closer
  camera.rotation.set(0, 0, 0); // Reset camera rotation to default (no rotation)

  // Reset OrbitControls to the initial state (camera target and reset the angle)
  controls.reset(); // This resets the OrbitControls target and rotation
  controls.update(); // Update controls after reset

  // Reset ground (plane) position
  ground.position.set(0, -2, 0); // Reset the ground position (if you need to reset it to original)
  ground.rotation.set(0, 0, 0); // Reset any rotation on the ground

  // Reset score
  currentScore = 0;
  scoreElement.innerText = `Score: ${currentScore}`;

  // Restart the game loop if not running
  if (!isGameRunning) {
    isGameRunning = true;
    animate(); // Start the game loop
  }
}

let gameStarted = false; // Added flag to track if the game has started

startGameButton.addEventListener("click", () => {
  gamePanel.style.display = "none"; // Hide the game panel
  resetGameButton.style.display = "block"; // Show reset button
  homeButton.style.display = "block"; // Show home button
  scoreElement.style.display = "block";
  highScoreElement.style.display = "block";
  heartsContainer.style.display = "block";

  lives = maxLives; // Reset lives
  updateHeartsDisplay(); // Initialize hearts display

  isGameRunning = true; // Set game to running state
  animate(); // Start the game loop
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//camera.position.set(4.61, 2.74, 8);X Y Z

camera.position.set(0, 2.74, 8);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = "#00ff00",
    velocity = {
      x: 0,
      y: 0,
      z: 0,
    },
    position = {
      x: 0,
      y: 0,
      z: 0,
    },
    zAcceleration = false,
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    );

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;

    this.velocity = velocity;
    this.gravity = -0.002;

    this.zAcceleration = zAcceleration;

    this.jumpCount = 0; // Add jump counter
  }

  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update(ground) {
    this.updateSides();

    // Apply movement logic based on velocity
    if (this.zAcceleration) this.velocity.z += 0.0003;

    // Update cube position along X and Z axes
    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;

    // Prevent the cube from going out of bounds (left and right)
    if (this.position.x - this.width / 2 < -ground.width / 2) {
      this.position.x = -ground.width / 2 + this.width / 2; // Prevent going left
    } else if (this.position.x + this.width / 2 > ground.width / 2) {
      this.position.x = ground.width / 2 - this.width / 2; // Prevent going right
    }

    // Apply gravity and handle collisions
    this.applyGravity(ground);
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity;

    // Check for collision with the ground
    if (
      boxCollision({
        box1: this,
        box2: ground,
      })
    ) {
      const friction = 0.5;
      this.velocity.y *= friction;
      this.velocity.y = -this.velocity.y;
      this.jumpCount = 0; // Reset jump count when touching the ground
    } else {
      this.position.y += this.velocity.y;
    }
  }
}

function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;

  return xCollision && yCollision && zCollision;
}

const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0,
  },
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
});
cube.castShadow = true;
scene.add(cube);

const ground = new Box({
  width: 10,
  height: 0.5,
  depth: 80,
  color: "#0369a1",
  position: {
    x: 0,
    y: -2,
    z: 0,
  },
});

ground.receiveShadow = true;
scene.add(ground);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 3;
light.position.z = 1;
light.castShadow = true;
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

camera.position.z = 5;
console.log(ground.top);
console.log(cube.bottom);

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
};

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyA":
      keys.a.pressed = true;
      break;
    case "KeyD":
      keys.d.pressed = true;
      break;
    case "KeyS":
      keys.s.pressed = true;
      break;
    case "KeyW":
      keys.w.pressed = true;
      break;
    case "Space":
      if (cube.jumpCount < 2) {
        // Allow only 2 consecutive jumps
        cube.velocity.y = 0.08;
        cube.jumpCount++; // Increment jump count
      }
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
    case "KeyS":
      keys.s.pressed = false;
      break;
    case "KeyW":
      keys.w.pressed = false;
      break;
  }
});

// Load the sound
const listener = new THREE.AudioListener();
camera.add(listener);

// Create an array to hold the sound instances
const sounds = [];

// Function to play the sound
function playCollisionSound() {
  const sound = new THREE.Audio(listener); // Create a new sound instance each time
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load("audio/pop.mp3", (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(1.0);
    sound.play(); // Play the sound immediately
  });

  // Push the sound instance to the array to keep track of it
  sounds.push(sound);
}


const enemies = [];
let frames = 0;
let spawnRate = 400;

function animate() {
  if (!isGameRunning) return;

  const animationId = requestAnimationFrame(animate);

  renderer.render(scene, camera);

  // Movement code
  cube.velocity.x = 0;
  cube.velocity.z = 0;
  if (keys.a.pressed) cube.velocity.x = -0.05;
  else if (keys.d.pressed) cube.velocity.x = 0.05;

  if (keys.s.pressed) cube.velocity.z = 0.05;
  else if (keys.w.pressed) cube.velocity.z = -0.05;

  cube.update(ground);

  // Track the last collision with a 3D cube
  let lastCollisionWith3D = false;

  enemies.forEach((enemy, index) => {
    enemy.update(ground);

    // Check for collision between green cube and red cube (enemy)
    if (boxCollision({ box1: cube, box2: enemy })) {
      // Play sound on collision
      playCollisionSound(); // Play the sound immediately

      // Remove the red cube (enemy) from the scene and the enemies array
      scene.remove(enemy);
      enemies.splice(index, 1);

      lives--; // Decrease lives on collision
      updateHeartsDisplay(); // Update hearts display

      if (lives <= 0) {
        // Play the game-over sound first
        playCollisionSound(); // Play sound for game over

        isGameRunning = false;
        
        setTimeout(() => {
          // If lives are 0, game over
          cancelAnimationFrame(animationId); // Stop the game
          alert("Game Over!"); // Show a game-over message
          resetGameButton.style.display = "block"; // Show reset button
        }, 300); // Delay the alert by 300ms to let the sound finish
      } else {
        // Optionally, add a small delay before the next collision is processed
      }

      // Track that the last collision was with the red cube (3D object)
      lastCollisionWith3D = true;
    }
  });

  // If the last collision was with a 3D cube, trigger game over
  if (lastCollisionWith3D) {
    endGame(); // End the game if the last collision was with a 3D cube
  }

  function getRandomHeight(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Spawn enemies
  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 20;

    const enemyHeight = getRandomHeight(0.5, 2.5); // Random height between 0.5 and 2

    const enemy = new Box({
      width: 1, // Fixed width
      height: enemyHeight, // Random height
      depth: 1, // Fixed depth
      position: {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: -40,
      },
      velocity: {
        x: 0,
        y: 0,
        z: gameSpeed, // Use gameSpeed for enemy speed
      },
      color: "red", // Red enemy cube
      zAcceleration: true,
    });
    enemy.castShadow = true;
    scene.add(enemy);
    enemies.push(enemy);
  }

  frames++;
}

// cube.position.y += -0.01
// cube.rotation.x += 0.01
// cube.rotation.y += 0.01

animate();
