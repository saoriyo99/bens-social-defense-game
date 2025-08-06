import { maps } from './maps.js';
import { friendTypes } from './friends.js';
import { enemyTypes } from './enemies.js';
import { SpeechBubble, addSpeechBubble } from './speechBubbles.js';
import { Banana } from './bananas.js';
import { updateUI, showGameOver, showNotification } from './ui.js';

// Initialize canvas and context first
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state - Fixed: Added all missing properties
let gameState = {
    health: 20,
    money: 100,
    wave: 1,
    score: 0,
    selectedFriend: null,
    enemies: [],
    friends: [],
    projectiles: [],
    speechBubbles: [], // Fixed: Added missing speechBubbles array
    waveActive: false,
    enemiesRemaining: 0,
    codingProgress: 0,
    bananas: [],
    selectedFriendForUpgrade: null,
    enemiesSpawned: 0,
    gameOver: false,
    gameStarted: false, // Fixed: Added missing gameStarted flag
    mapSelected: false, // New: Track if map is selected
    currentMap: null, // New: Current map index
    totalEnemiesDefeated: 0,
    gameSpeed: 1, // 1 = normal, 2 = fast
    mouseX: 400,
    mouseY: 300,
    // New special abilities per wave (reset each wave)
    darioPhotoUsed: false,
    tonyMoveUsed: false,
    movingTony: null // Track which Tony is being moved
};

// Current game path (will be set based on selected map)
let currentGamePath = maps[0].paths[0]; // Default to first map

// Add missing familyPhoto function
function familyPhoto() {
    // Pause all enemies for 3 seconds
    for (let enemy of gameState.enemies) {
        if (enemy.alive && !enemy.converted) {
            enemy.stun(180); // 3 seconds at 60fps
        }
    }
    addSpeechBubble(400, 200, "Family photo time! Everyone smile! 📷");
    showNotification("Family Photo!");
}

function drawPath() {
    if (!gameState.mapSelected) return;
    
    const currentMap = maps[gameState.currentMap];
    
    // Draw all paths for current map
    for (let pathIndex = 0; pathIndex < currentMap.paths.length; pathIndex++) {
        const path = currentMap.paths[pathIndex];
        
        // Draw path background
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        // Path borders
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw spawn points
    for (let spawn of currentMap.spawns) {
        ctx.fillStyle = '#FF4500';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPAWN', spawn.x + 60, spawn.y + 5);
    }

    // Ben's tower at the end (same for all maps)
    const benPosition = {x: 750, y: 250};
    ctx.fillStyle = gameState.health <= 5 ? '#ff4757' : '#00ff41';
    ctx.fillRect(benPosition.x - 25, benPosition.y - 25, 50, 50);
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BEN', benPosition.x, benPosition.y - 5);
    ctx.fillText('🧑‍💻', benPosition.x, benPosition.y + 15);
}

function isOnPath(x, y) {
    if (!gameState.mapSelected) return false;
    
    const currentMap = maps[gameState.currentMap];
    for (let path of currentMap.paths) {
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            const distance = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance < 40) return true;
        }
    }
    return false;
}

function isOnFriend(x, y) {
    return gameState.friends.some(friend => 
        Math.sqrt((friend.x - x) ** 2 + (friend.y - y) ** 2) < 35
    );
}

function distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
    const projection = { x: x1 + t * dx, y: y1 + t * dy };
    return Math.sqrt((px - projection.x) ** 2 + (py - projection.y) ** 2);
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();
    }

    // Always draw the path
    drawPath();
    
    // Test visibility - draw a debug indicator
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 20, 20);
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.fillText('OK', 12, 22);

    // Update and draw game elements if game has started
    if (gameState.gameStarted) {
        // Update and draw friends
        gameState.friends.forEach(friend => {
            friend.update();
            friend.draw();
        });

        // Update and draw enemies
        gameState.enemies = gameState.enemies.filter(enemy => {
            enemy.update();
            enemy.draw();
            return enemy.alive;
        });

        // Update and draw projectiles
        gameState.projectiles = gameState.projectiles.filter(projectile => {
            projectile.update();
            projectile.draw();
            return projectile.alive;
        });

        // Update and draw banana particles
        gameState.bananas = gameState.bananas.filter(banana => {
            banana.update();
            banana.draw();
            return banana.life > 0;
        });

        // Update and draw speech bubbles
        gameState.speechBubbles = gameState.speechBubbles.filter(bubble => {
            bubble.update();
            bubble.draw();
            return bubble.life > 0;
        });
    }

    // Always show placement preview if friend selected
    if (gameState.selectedFriend && !gameState.gameOver) {
        const mouseX = gameState.mouseX;
        const mouseY = gameState.mouseY;
        
        // Check if placement is valid
        const isValid = !isOnPath(mouseX, mouseY) && !isOnFriend(mouseX, mouseY);
        
        // Preview tower body - enhanced visibility
        ctx.fillStyle = isValid ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(mouseX - 15, mouseY - 15, 30, 30);
        
        // Border for the preview
        ctx.strokeStyle = isValid ? '#00ff41' : '#ff4757';
        ctx.lineWidth = 3;
        ctx.strokeRect(mouseX - 15, mouseY - 15, 30, 30);
        
        // Preview tower name
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.selectedFriend.toUpperCase(), mouseX, mouseY + 3);
        
        // Range preview circle
        ctx.strokeStyle = isValid ? 'rgba(0, 255, 65, 0.6)' : 'rgba(255, 0, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, friendTypes[gameState.selectedFriend].range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
    }

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

export { gameState, canvas, ctx, familyPhoto, drawPath, isOnPath, isOnFriend, distanceToLineSegment, gameLoop };
