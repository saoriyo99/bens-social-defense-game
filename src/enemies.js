import { gameState } from './game.js';
import { addSpeechBubble } from './speechBubbles.js';
import { Banana } from './bananas.js';
import { friendTypes } from './friends.js';
import { updateUI, showGameOver } from './ui.js';
import { maps } from './maps.js';

// Enemy types with color coordination
const enemyTypes = {
    // Basic (1 person each) - Light colors
    neighbor: { health: 30, speed: 1, reward: 10, socialDamage: 1, color: '#FFE082', name: 'Chatty Neighbor', icon: '🏠', desc: 'Wants to talk about the weather and property values.', category: 'gullible' },
    clerk: { health: 25, speed: 1.2, reward: 8, socialDamage: 1, color: '#A5D6A7', name: 'Retail Clerk', icon: '🛍️', desc: 'Did you find everything you need today?', category: 'gullible' },
    uber: { health: 35, speed: 0.8, reward: 12, socialDamage: 1, color: '#90CAF9', name: 'Uber Driver', icon: '🚗', desc: 'Trapped audience who wants to share life philosophy.', category: 'gullible' },
    
    // Medium (1.5 people each) - Medium colors
    performer: { health: 40, speed: 1.8, reward: 18, socialDamage: 1.5, color: '#CE93D8', name: 'Street Performer', icon: '🎭', desc: 'High energy entertainer demanding audience participation.', category: 'energetic' },
    elderly: { health: 50, speed: 0.6, reward: 22, socialDamage: 1.5, color: '#BCAAA4', name: 'Elderly Storyteller', icon: '👴', desc: 'Has many stories from "back in my day".', category: 'patient' },
    gymguy: { health: 55, speed: 1.4, reward: 20, socialDamage: 1.5, color: '#FFAB91', name: 'Gym Regular', icon: '💪', desc: 'Wants to discuss your workout routine and protein intake.', category: 'energetic' },
    
    // High (2-3 people each) - Dark colors
    boss: { health: 80, speed: 0.9, reward: 28, socialDamage: 2.5, color: '#F48FB1', name: 'Boss', icon: '💼', desc: 'Needs to circle back and touch base about synergies.', category: 'professional' },
    evangelist: { health: 70, speed: 1.1, reward: 26, socialDamage: 2, color: '#FFF176', name: 'Evangelist', icon: '📖', desc: 'Very persistent about sharing good news.', category: 'persistent' },
    oversharer: { health: 60, speed: 1.2, reward: 22, socialDamage: 2, color: '#FFAB91', name: 'Oversharer', icon: '😭', desc: 'Dumps entire relationship history on strangers.', category: 'emotional' },
    networker: { health: 75, speed: 1.5, reward: 32, socialDamage: 3, color: '#80CBC4', name: 'Networking Enthusiast', icon: '🤝', desc: 'Wants to grab coffee and ideate some solutions.', category: 'professional' },
    bartender: { health: 85, speed: 0.7, reward: 30, socialDamage: 2.5, color: '#E6EE9C', name: 'Bartender', icon: '🍺', desc: 'Professional conversationalist with endless small talk.', category: 'patient' },
    coworker: { health: 65, speed: 1, reward: 25, socialDamage: 2, color: '#B39DDB', name: 'Bad Code Coworker', icon: '💻', desc: 'Submits terrible code and wants you to fix it.', category: 'nerdy' },
    intern: { health: 45, speed: 2, reward: 20, socialDamage: 2, color: '#FFCC80', name: 'Clueless Intern', icon: '🤷', desc: 'Asks endless questions and follows you around.', category: 'nerdy' },
    
    // Special/Boss enemies - Very dark colors
    elevator: { health: 40, speed: 2.2, reward: 18, socialDamage: 1.5, color: '#D1C4E9', name: 'Elevator Person', icon: '🏢', desc: 'Awkward small talk in confined vertical space.', category: 'fast' },
    uberboss: { health: 200, speed: 0.5, reward: 80, socialDamage: 5, color: '#1565C0', name: 'Uber Driver Boss', icon: '🚙', desc: 'Ultimate captive audience nightmare with strong opinions.', category: 'boss' },
    karen: { health: 250, speed: 0.6, reward: 100, socialDamage: 7, color: '#AD1457', name: 'Karen Manager Meeting', icon: '👩‍💼', desc: 'Meeting that could have been an email but wants face time.', category: 'boss' },
    uncle: { health: 220, speed: 0.4, reward: 90, socialDamage: 6, color: '#5D4037', name: 'Family Reunion Uncle', icon: '👨‍🦳', desc: 'Strong political opinions and vacation slideshow ready.', category: 'boss' }
};

class Enemy {
    constructor(type) {
        const enemyType = enemyTypes[type];
        this.type = type;
        
        // Health scaling
        const healthScale = Math.pow(1.15, gameState.wave - 1);
        this.maxHealth = Math.floor(enemyType.health * healthScale);
        this.health = this.maxHealth;
        
        // Speed scaling
        this.baseSpeed = enemyType.speed * (1 + (gameState.wave - 1) * 0.03);
        this.speed = this.baseSpeed;
        this.reward = Math.floor(enemyType.reward * (1 + (gameState.wave - 1) * 0.05));
        this.socialDamage = enemyType.socialDamage;
        this.color = enemyType.color;
        this.name = enemyType.name;
        this.icon = enemyType.icon;
        
        // NEW: Handle multiple spawn points and paths
        const currentMap = maps[gameState.currentMap];
        const spawnPoint = currentMap.spawns[Math.floor(Math.random() * currentMap.spawns.length)];
        this.currentPath = currentMap.paths[spawnPoint.pathIndex];
        
        this.x = spawnPoint.x - 30; // Start before spawn point
        this.y = spawnPoint.y;
        this.pathIndex = 0;
        this.alive = true;
        this.slowEffect = 0;
        this.stunned = 0;
        this.converted = false;
        this.reachedEnd = false;
    }

    update() {
        if (!this.alive || gameState.gameOver) return;

        // Handle stun
        if (this.stunned > 0) {
            this.stunned -= gameState.gameSpeed;
            return;
        }

        // Apply slow effect
        this.speed = this.baseSpeed;
        if (this.slowEffect > 0) {
            this.speed *= 0.3; // 70% speed reduction when slowed
            this.slowEffect -= gameState.gameSpeed;
        }

        // Apply game speed
        const currentSpeed = this.speed * gameState.gameSpeed;

        // Move towards next path point
        let targetIndex = this.converted ? Math.max(0, this.pathIndex - 1) : this.pathIndex + 1;
        const target = this.currentPath[targetIndex];
        
        if (!target) {
            if (this.converted) {
                // Converted enemy reached start, remove safely
                this.alive = false;
                return;
            } else {
                // Enemy reached Ben's tower - DEAL SOCIAL DAMAGE!
                if (!this.reachedEnd) {
                    this.reachedEnd = true;
                    addSpeechBubble(this.x, this.y - 30, `${this.name} drained ${this.socialDamage} social energy!`);
                    
                    // CRITICAL: Actually reduce health!
                    gameState.health = Math.max(0, gameState.health - this.socialDamage);
                    
                    // Check for game over
                    if (gameState.health <= 0) {
                        gameState.gameOver = true;
                        showGameOver();
                    }
                    
                    updateUI();
                }
                this.alive = false;
                return;
            }
        }

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            if (this.converted) {
                this.pathIndex = Math.max(0, this.pathIndex - 1);
            } else {
                this.pathIndex++;
            }
        } else {
            this.x += (dx / distance) * currentSpeed;
            this.y += (dy / distance) * currentSpeed;
        }
    }

    draw() {
        if (!this.alive) return;

        // Enemy body with color coordination
        ctx.fillStyle = this.converted ? '#00ff41' : this.color;
        if (this.type === 'karen' || this.type === 'uberboss' || this.type === 'uncle') {
            // Boss enemies are bigger
            ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
        } else {
            ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        }

        // Add visual indicators
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.icon, this.x, this.y + 4);

        // Health bar
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 12, this.y - 18, 24, 4);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - 12, this.y - 18, 24 * healthPercent, 4);

        // Effect indicators
        if (this.slowEffect > 0) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 10, this.y - 10, 20, 20);
        }
        if (this.stunned > 0) {
            ctx.fillStyle = 'yellow';
            ctx.fillText('😵', this.x, this.y - 20);
        }
        if (this.converted) {
            ctx.fillStyle = '#00ff41';
            ctx.fillText('💚', this.x, this.y - 20);
        }
    }

    takeDamage(damage, attackerType) {
        if (!this.alive || this.converted) return;
        
        let finalDamage = damage;

        // Calculate effectiveness multipliers
        const friendData = friendTypes[attackerType];
        if (friendData) {
            if (friendData.strong.includes(this.type)) {
                finalDamage *= 2; // 2x damage vs strong matchups
            } else if (friendData.weak.includes(this.type)) {
                finalDamage *= 0.5; // 0.5x damage vs weak matchups
            }
        }

        this.health -= finalDamage;
        if (this.health <= 0) {
            this.alive = false;
            gameState.money += this.reward;
            gameState.score += this.reward;
            gameState.totalEnemiesDefeated++;
            
            // Create banana explosion
            for (let i = 0; i < 8; i++) {
                gameState.bananas.push(new Banana(this.x, this.y));
            }
            
            updateUI();
        }
    }

    applySlow(duration) {
        this.slowEffect = Math.max(this.slowEffect, duration);
    }

    stun(duration) {
        this.stunned = Math.max(this.stunned, duration);
    }

    convert() {
        this.converted = true;
        this.color = '#00ff41';
    }
}

export { enemyTypes, Enemy };
