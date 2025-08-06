import { gameState, canvas, gameLoop } from './game.js';
import { friendTypes } from './friends.js';
import { Enemy } from './enemies.js';
import { maps } from './maps.js';

function startGame() {
    const storylineModal = document.getElementById('storylineModal');
    if (storylineModal) storylineModal.style.display = 'none';
    
    showMapSelection();
    console.log('Showing map selection...');
}

function showMapSelection() {
    const mapModal = document.getElementById('mapSelectionModal');
    const mapGrid = document.getElementById('mapGrid');
    
    if (mapGrid) {
        mapGrid.innerHTML = '';
        
        maps.forEach((map, index) => {
            const mapDiv = document.createElement('div');
            mapDiv.style.cssText = `
                background: rgba(0, 255, 65, 0.1);
                border: 2px solid #00ff41;
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            `;
            
            mapDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #00ff41;">${map.name}</h3>
                    <span style="font-size: 16px;">${map.difficulty}</span>
                </div>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">${map.desc}</p>
                <p style="margin: 5px 0; font-size: 12px; opacity: 0.7; font-style: italic;">${map.theme}</p>
                <p style="margin: 5px 0; font-size: 11px; opacity: 0.6;">
                    ${map.spawns.length} entrance${map.spawns.length > 1 ? 's' : ''} • ${map.paths.length} path${map.paths.length > 1 ? 's' : ''}
                </p>
            `;
            
            mapDiv.addEventListener('mouseenter', () => {
                mapDiv.style.background = 'rgba(0, 255, 65, 0.2)';
                mapDiv.style.transform = 'translateY(-2px)';
                mapDiv.style.boxShadow = '0 5px 15px rgba(0, 255, 65, 0.3)';
            });
            
            mapDiv.addEventListener('mouseleave', () => {
                mapDiv.style.background = 'rgba(0, 255, 65, 0.1)';
                mapDiv.style.transform = 'translateY(0)';
                mapDiv.style.boxShadow = 'none';
            });
            
            mapDiv.addEventListener('click', () => selectMap(index));
            
            mapGrid.appendChild(mapDiv);
        });
    }
    
    if (mapModal) mapModal.style.display = 'flex';
}

function selectMap(mapIndex) {
    gameState.currentMap = mapIndex;
    gameState.mapSelected = true;
    gameState.gameStarted = true;
    
    const mapModal = document.getElementById('mapSelectionModal');
    if (mapModal) mapModal.style.display = 'none';
    
    // Update progress text based on selected map
    const progressText = document.getElementById('progressText');
    if (progressText) progressText.textContent = maps[mapIndex].theme;
    
    updateUI();
    console.log(`Selected map: ${maps[mapIndex].name}`);
}

function selectFriend(type) {
    if (gameState.money >= friendTypes[type].cost && !gameState.gameOver && gameState.gameStarted) {
        // Clear previous selection
        document.querySelectorAll('.friend-btn').forEach(btn => btn.classList.remove('selected'));
        
        gameState.selectedFriend = type;
        canvas.style.cursor = 'crosshair';
        const btn = document.getElementById(type + 'Btn');
        if (btn) btn.classList.add('selected');
        
        const cancelText = document.getElementById('cancelText');
        if (cancelText) cancelText.style.display = 'block';
        
        console.log(`Selected friend: ${type}`);
    }
}

function cancelSelection() {
    gameState.selectedFriend = null;
    canvas.style.cursor = 'default';
    document.querySelectorAll('.friend-btn').forEach(btn => btn.classList.remove('selected'));
    
    const cancelText = document.getElementById('cancelText');
    if (cancelText) cancelText.style.display = 'none';
}

function placeFriend(x, y) {
    if (!gameState.selectedFriend || gameState.gameOver) return;

    const friendType = friendTypes[gameState.selectedFriend];
    if (gameState.money < friendType.cost) return;

    // Check if position is valid
    if (isOnPath(x, y) || isOnFriend(x, y)) {
        showNotification('Cannot place here!');
        return;
    }

    console.log(`Placing ${gameState.selectedFriend} at ${x}, ${y}`);
    gameState.friends.push(new Friend(x, y, gameState.selectedFriend));
    gameState.money -= friendType.cost;
    cancelSelection();
    updateUI();
    console.log(`Total friends: ${gameState.friends.length}`);
}

function toggleSpeed() {
    gameState.gameSpeed = gameState.gameSpeed === 1 ? 2 : 1;
    const speedBtn = document.getElementById('speedBtn');
    
    if (speedBtn) {
        if (gameState.gameSpeed === 2) {
            speedBtn.textContent = '🚀 Fast';
            speedBtn.classList.add('fast');
        } else {
            speedBtn.textContent = '🐌 Normal';
            speedBtn.classList.remove('fast');
        }
    }
}

function showWavePreview() {
    if (gameState.gameOver) return;
    
    const waveIndex = Math.min(gameState.wave - 1, waveConfigs.length - 1);
    const waveConfig = waveConfigs[waveIndex];
    
    const waveTitle = document.getElementById('waveTitle');
    if (waveTitle) waveTitle.textContent = `Wave ${gameState.wave}: ${waveConfig.name}`;
    
    const waveDescription = document.getElementById('waveDescription');
    if (waveDescription) waveDescription.textContent = waveConfig.desc;
    
    const enemyPreview = document.getElementById('enemyPreview');
    if (enemyPreview) {
        enemyPreview.innerHTML = '';
        
        // Show enemy types
        const enemyCounts = {};
        for (let enemyType of waveConfig.enemies) {
            enemyCounts[enemyType] = (enemyCounts[enemyType] || 0) + 1;
        }
        
        for (let [enemyType, count] of Object.entries(enemyCounts)) {
            const enemy = enemyTypes[enemyType];
            const div = document.createElement('div');
            div.className = 'enemy-icon';
            div.style.backgroundColor = enemy.color;
            div.textContent = enemy.icon;
            div.title = `${enemy.name} x${count}`;
            enemyPreview.appendChild(div);
        }
    }
    
    const waveModal = document.getElementById('waveModal');
    if (waveModal) waveModal.style.display = 'flex';
}

function startNextWave() {
    if (gameState.waveActive || gameState.gameOver || !gameState.gameStarted || !gameState.mapSelected) return;
    showWavePreview();
}

function startWaveFromModal() {
    const waveModal = document.getElementById('waveModal');
    if (waveModal) waveModal.style.display = 'none';
    
    gameState.waveActive = true;
    gameState.enemiesSpawned = 0;
    
    const waveIndex = Math.min(gameState.wave - 1, waveConfigs.length - 1);
    const waveConfig = waveConfigs[waveIndex];
    
    // Scale enemy count
    const baseCount = waveConfig.count;
    const scaledCount = Math.floor(baseCount * Math.pow(1.1, gameState.wave - 1));
    gameState.enemiesRemaining = scaledCount;
    
    const baseSpawnDelay = Math.max(800, 1800 - gameState.wave * 50);
    const spawnDelay = baseSpawnDelay / gameState.gameSpeed;
    
    const spawnInterval = setInterval(() => {
        if (gameState.enemiesSpawned >= gameState.enemiesRemaining || gameState.gameOver) {
            clearInterval(spawnInterval);
            return;
        }

        const enemyType = waveConfig.enemies[gameState.enemiesSpawned % waveConfig.enemies.length];
        gameState.enemies.push(new Enemy(enemyType));
        gameState.enemiesSpawned++;
    }, spawnDelay);

    updateUI();
}

function showGameOver() {
    gameState.gameOver = true;
    console.log('Game Over triggered');
    
    const finalWave = document.getElementById('finalWave');
    if (finalWave) finalWave.textContent = gameState.wave;
    
    const finalScore = document.getElementById('finalScore');
    if (finalScore) finalScore.textContent = gameState.score;
    
    const totalEnemies = document.getElementById('totalEnemies');
    if (totalEnemies) totalEnemies.textContent = gameState.totalEnemiesDefeated;
    
    const gameOverModal = document.getElementById('gameOverModal');
    if (gameOverModal) gameOverModal.style.display = 'flex';
}

function updateCodingProgress() {
    if (gameState.wave <= 5) {
        gameState.codingProgress = (gameState.wave - 1) * 20;
        const progressText = document.getElementById('progressText');
        if (progressText) progressText.textContent = 'Setting up development environment...';
    } else if (gameState.wave <= 10) {
        gameState.codingProgress = 20 + (gameState.wave - 5) * 16;
        const progressText = document.getElementById('progressText');
        if (progressText) progressText.textContent = 'Writing core functions...';
    } else {
        gameState.codingProgress = 100;
        const progressText = document.getElementById('progressText');
        if (progressText) progressText.textContent = 'Deployed to production!';
    }
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = gameState.codingProgress + '%';
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

function showUpgradeModal(friend) {
    gameState.selectedFriendForUpgrade = friend;
    
    const upgradeTitle = document.getElementById('upgradeTitle');
    if (upgradeTitle) upgradeTitle.textContent = `Upgrade ${friend.type.toUpperCase()}`;
    
    // Show current upgrades
    let upgradeStatus = `Current upgrades (${friend.upgrades.length}/2 used): `;
    if (friend.upgrades.length === 0) {
        upgradeStatus += 'None';
    } else {
        upgradeStatus += friend.upgrades.map(up => upgradeOptions[up].name).join(', ');
    }
    
    const upgradeDescription = document.getElementById('upgradeDescription');
    if (upgradeDescription) upgradeDescription.textContent = upgradeStatus;

    const optionsContainer = document.getElementById('upgradeOptions');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';

        const availableUpgrades = friendTypes[friend.type].upgrades;
        
        for (let upgradeType of availableUpgrades) {
            const upgrade = upgradeOptions[upgradeType];
            const button = document.createElement('button');
            
            const isSelected = friend.upgrades.includes(upgradeType);
            const canAfford = gameState.money >= upgrade.cost;
            const canUpgrade = friend.canUpgrade();
            
            if (isSelected) {
                button.className = 'upgrade-btn selected';
                button.innerHTML = `${upgrade.icon}<br>${upgrade.name}<br>✅ EQUIPPED<br><small>${upgrade.desc}</small>`;
                button.disabled = true;
            } else if (!canAfford || !canUpgrade) {
                button.className = 'upgrade-btn unavailable';
                button.innerHTML = `${upgrade.icon}<br>${upgrade.name}<br>(${upgrade.cost}🍃)<br><small>${upgrade.desc}</small>`;
                button.disabled = true;
            } else {
                button.className = 'upgrade-btn';
                button.innerHTML = `${upgrade.icon}<br>${upgrade.name}<br>(${upgrade.cost}🍃)<br><small>${upgrade.desc}</small>`;
                button.onclick = () => applyUpgrade(upgradeType);
            }
            
            optionsContainer.appendChild(button);
        }
    }

    const upgradeModal = document.getElementById('upgradeModal');
    if (upgradeModal) upgradeModal.style.display = 'flex';
}

function applyUpgrade(upgradeType) {
    const friend = gameState.selectedFriendForUpgrade;
    const upgrade = upgradeOptions[upgradeType];

    if (gameState.money >= upgrade.cost && friend.upgrade(upgradeType)) {
        gameState.money -= upgrade.cost;
        updateUpgradeIndicators();
        updateUI();
        closeUpgradeModal();
        showNotification(`${friend.type.toUpperCase()} upgraded with ${upgrade.name}!`);
    }
}

function closeUpgradeModal() {
    const upgradeModal = document.getElementById('upgradeModal');
    if (upgradeModal) upgradeModal.style.display = 'none';
    gameState.selectedFriendForUpgrade = null;
}

function showCodex() {
    // Populate friends codex
    const friendsCodex = document.getElementById('friendsCodex');
    if (friendsCodex) {
        friendsCodex.innerHTML = '';
        
        for (let [type, data] of Object.entries(friendTypes)) {
            const div = document.createElement('div');
            div.className = 'codex-item';
            
            // Add effectiveness indicators
            let strongIndicators = '';
            let weakIndicators = '';
            
            if (data.strong.length > 0) {
                strongIndicators = data.strong.map(enemy => `<span style="color: #4CAF50;">${enemyTypes[enemy].icon}</span>`).join(' ');
            }
            if (data.weak.length > 0) {
                weakIndicators = data.weak.map(enemy => `<span style="color: #F44336;">${enemyTypes[enemy].icon}</span>`).join(' ');
            }
            
            div.innerHTML = `
                <div class="codex-icon" style="background-color: ${data.color};">${type.charAt(0).toUpperCase()}</div>
                <div>
                    <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong> (${data.cost}🍃)<br>
                    <small>${data.desc}</small><br>
                    <small><strong>Strong vs:</strong> ${strongIndicators || 'None'}</small><br>
                    <small><strong>Weak vs:</strong> ${weakIndicators || 'None'}</small>
                </div>
            `;
            friendsCodex.appendChild(div);
        }
    }
    
    // Populate enemies codex
    const enemiesCodex = document.getElementById('enemiesCodex');
    if (enemiesCodex) {
        enemiesCodex.innerHTML = '';
        
        for (let [type, data] of Object.entries(enemyTypes)) {
            const div = document.createElement('div');
            div.className = 'codex-item';
            
            // Find which friends are strong/weak against this enemy
            let counters = [];
            let struggles = [];
            
            for (let [friendType, friendData] of Object.entries(friendTypes)) {
                if (friendData.strong.includes(type)) {
                    counters.push(`<span style="color: ${friendData.color};">${friendType.charAt(0).toUpperCase()}</span>`);
                }
                if (friendData.weak.includes(type)) {
                    struggles.push(`<span style="color: ${friendData.color};">${friendType.charAt(0).toUpperCase()}</span>`);
                }
            }
            
            div.innerHTML = `
                <div class="codex-icon" style="background-color: ${data.color};">${data.icon}</div>
                <div>
                    <strong>${data.name}</strong> (${data.socialDamage} social damage)<br>
                    <small><strong>Reward:</strong> ${data.reward}🍃 | <strong>Health:</strong> ${data.health} | <strong>Speed:</strong> ${data.speed}x</small><br>
                    <small><strong>Countered by:</strong> ${counters.join(' ') || 'Anyone'}</small><br>
                    <small><strong>Resists:</strong> ${struggles.join(' ') || 'None'}</small>
                </div>
            `;
            enemiesCodex.appendChild(div);
        }
    }
    
    const codexModal = document.getElementById('codexModal');
    if (codexModal) codexModal.style.display = 'flex';
}

function closeCodex() {
    const codexModal = document.getElementById('codexModal');
    if (codexModal) codexModal.style.display = 'none';
}

function updateUpgradeIndicators() {
    for (let friend of gameState.friends) {
        const btn = document.getElementById(friend.type + 'Btn');
        if (btn) {
            const indicator = btn.querySelector('.upgrade-indicator');
            if (indicator) {
                if (friend.canUpgrade()) {
                    indicator.style.display = 'flex';
                } else {
                    indicator.style.display = 'none';
                }
            }
        }
    }
}

function updateDebugInfo() {
    const debugDiv = document.getElementById('debugInfo');
    if (debugDiv) {
        debugDiv.innerHTML = `
            Health: ${gameState.health}<br>
            Enemies Alive: ${gameState.enemies.filter(e => e.alive).length}<br>
            Friends: ${gameState.friends.length}<br>
            Game Started: ${gameState.gameStarted}<br>
            Game Over: ${gameState.gameOver}<br>
            Canvas Size: ${canvas.width}x${canvas.height}<br>
            Canvas Context: ${ctx ? 'OK' : 'NULL'}
        `;
    }
}

function updateUI() {
    // Fixed: Added null checks for all DOM elements
    const healthEl = document.getElementById('health');
    if (healthEl) {
        healthEl.textContent = Math.max(0, gameState.health);
        
        // Make health flash red when low
        if (gameState.health <= 5) {
            healthEl.classList.add('critical');
        } else {
            healthEl.classList.remove('critical');
        }
    }
    
    const moneyEl = document.getElementById('money');
    if (moneyEl) moneyEl.textContent = gameState.money;
    
    const waveEl = document.getElementById('wave');
    if (waveEl) waveEl.textContent = gameState.wave;
    
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = gameState.score;

    // Update button states - disable if no money, game over, game not started, or no map selected
    Object.keys(friendTypes).forEach(type => {
        const btn = document.getElementById(type + 'Btn');
        if (btn) {
            btn.disabled = gameState.money < friendTypes[type].cost || gameState.gameOver || !gameState.gameStarted || !gameState.mapSelected;
        }
    });

    // Disable wave button if game over, not started, or no map selected
    const nextWaveBtn = document.getElementById('nextWaveBtn');
    if (nextWaveBtn) {
        nextWaveBtn.disabled = gameState.gameOver || !gameState.gameStarted || !gameState.mapSelected;
    }

    updateUpgradeIndicators();
    updateDebugInfo();

    // Update wave status
    const statusEl = document.getElementById('waveStatus');
    if (statusEl) {
        if (!gameState.mapSelected) {
            statusEl.textContent = 'Select a map to begin your coding journey!';
            statusEl.style.color = '#FFD700';
        } else if (gameState.gameOver) {
            statusEl.textContent = 'Game Over - Ben\'s social battery is depleted!';
            statusEl.style.color = '#ff4757';
        } else if (gameState.waveActive) {
            const remaining = gameState.enemies.filter(e => e.alive && !e.converted).length;
            const waveIndex = Math.min(gameState.wave - 1, waveConfigs.length - 1);
            const waveConfig = waveConfigs[waveIndex];
            statusEl.textContent = `${waveConfig.name} - ${remaining} social interactions remaining`;
            
            if (remaining === 0 && gameState.enemiesSpawned >= gameState.enemiesRemaining && !gameState.gameOver) {
                setTimeout(() => {
                    gameState.waveActive = false;
                    gameState.wave++;
                    
                    // Reset special abilities for next wave
                    resetWaveAbilities();
                    
                    // Better reward system
                    let waveReward = 25 + gameState.wave * 3;
                    gameState.money += waveReward;
                    
                    updateCodingProgress();
                    statusEl.textContent = `${waveConfig.name} survived! +${waveReward} Focus Points`;
                    updateUI();
                }, 1000);
            }
        } else {
            const nextWaveIndex = Math.min(gameState.wave - 1, waveConfigs.length - 1);
            const nextWaveConfig = waveConfigs[nextWaveIndex];
            statusEl.textContent = `Next: ${nextWaveConfig.name}`;
            statusEl.style.color = '#00ff41';
        }
    }

    updateCodingProgress();
}

export { updateUI, showGameOver, showNotification, startGame, showMapSelection, selectMap, selectFriend, cancelSelection, placeFriend, toggleSpeed, showWavePreview, startNextWave, startWaveFromModal, showUpgradeModal, applyUpgrade, closeUpgradeModal, showCodex, closeCodex, updateUpgradeIndicators };
