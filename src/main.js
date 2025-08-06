import { gameState, canvas, ctx, gameLoop, isOnPath, isOnFriend, familyPhoto } from './game.js';
import { maps } from './maps.js';
import { friendTypes, Friend } from './friends.js';
import { enemyTypes, Enemy } from './enemies.js';
import { Projectile } from './projectiles.js';
import { updateUI, showGameOver, showNotification, startGame, showMapSelection, selectMap, selectFriend, cancelSelection, placeFriend, toggleSpeed, showWavePreview, startNextWave, startWaveFromModal, showUpgradeModal, applyUpgrade, closeUpgradeModal, showCodex, closeCodex, updateUpgradeIndicators } from './ui.js';
import { SpeechBubble, addSpeechBubble } from './speechBubbles.js';
import { Banana } from './bananas.js';
import { upgradeOptions } from './upgrades.js';

function resetWaveAbilities() {
    // Reset special abilities for each wave
    gameState.darioPhotoUsed = false;
    gameState.tonyMoveUsed = false;
    gameState.movingTony = null;
    console.log('Wave abilities reset!');
};

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log(`Canvas clicked at ${x}, ${y}`);
    
    if (!gameState.gameOver && gameState.gameStarted) {
        // Check for special abilities first
        let specialUsed = false;
        
        // Check for Dario family photo
        for (let friend of gameState.friends) {
            if (friend.type === 'dario' && !gameState.darioPhotoUsed) {
                const distance = Math.sqrt((friend.x - x) ** 2 + (friend.y - y) ** 2);
                if (distance < 25) {
                    // Trigger family photo!
                    gameState.darioPhotoUsed = true;
                    familyPhoto();
                    specialUsed = true;
                    break;
                }
            }
        }
        
        // Check for Tony move
        if (!specialUsed) {
            for (let friend of gameState.friends) {
                if (friend.type === 'tony' && !gameState.tonyMoveUsed) {
                    const distance = Math.sqrt((friend.x - x) ** 2 + (friend.y - y) ** 2);
                    if (distance < 25) {
                        // Start Tony move
                        gameState.movingTony = friend;
                        addSpeechBubble(friend.x, friend.y - 30, "Hey I'm coming to visit!");
                        showNotification("Click where Tony should move to!");
                        specialUsed = true;
                        break;
                    }
                }
            }
        }
        
        // Handle Tony placement
        if (!specialUsed && gameState.movingTony) {
            if (!isOnPath(x, y) && !isOnFriend(x, y)) {
                gameState.movingTony.x = x;
                gameState.movingTony.y = y;
                gameState.tonyMoveUsed = true;
                addSpeechBubble(x, y - 30, "Tony relocated!");
                gameState.movingTony = null;
                specialUsed = true;
            } else {
                showNotification("Can't move Tony there!");
            }
        }
        
        // Regular friend placement
        if (!specialUsed && !gameState.movingTony) {
            placeFriend(x, y);
        }
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!gameState.gameOver) {
        if (gameState.selectedFriend) {
            cancelSelection();
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find friend to upgrade
        for (let friend of gameState.friends) {
            const distance = Math.sqrt((friend.x - x) ** 2 + (friend.y - y) ** 2);
            if (distance < 25) {
                showUpgradeModal(friend);
                break;
            }
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (gameState.selectedFriend) {
            cancelSelection();
        }
        if (document.getElementById('upgradeModal')?.style.display === 'flex') {
            closeUpgradeModal();
        }
        if (document.getElementById('codexModal')?.style.display === 'flex') {
            closeCodex();
        }
    }
});

// Make functions globally accessible
window.selectFriend = selectFriend;
window.startNextWave = startNextWave;
window.toggleSpeed = toggleSpeed;
window.showCodex = showCodex;
window.closeCodex = closeCodex;
window.startWaveFromModal = startWaveFromModal;
window.closeUpgradeModal = closeUpgradeModal;
window.applyUpgrade = applyUpgrade;
window.startGame = startGame;
window.showMapSelection = showMapSelection;
window.selectMap = selectMap;

// Fixed: Initialize properly when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    
    // Verify canvas is working
    if (ctx) {
        console.log('Canvas context initialized successfully');
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(0, 0, 50, 50);
        console.log('Drew test rectangle');
    } else {
        console.error('Failed to get canvas context');
    }
    
    updateUI(); // Set initial UI state
    gameLoop(); // Start the visual loop right away
});
