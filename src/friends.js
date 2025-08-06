import { gameState } from './game.js';
import { Projectile } from './projectiles.js';
import { addSpeechBubble } from './speechBubbles.js';
import { enemyTypes } from './enemies.js';
import { showNotification } from './ui.js';
import { upgradeOptions } from './upgrades.js';

// Friend types with color coordination - Updated with special abilities
const friendTypes = {
    dario: { 
        cost: 50, damage: 15, range: 100, fireRate: 1000, color: '#FF9800', 
        special: 'family_photo', 
        strong: [], weak: [], 
        upgrades: ['damage', 'rate', 'range'],
        desc: 'Family photo master! Click for group photo (pauses all enemies 3s, once per wave).',
        category: 'professional-counter'
    },
    tony: { 
        cost: 120, damage: 22, range: 110, fireRate: 1200, color: '#9C27B0', 
        special: 'moveable', 
        strong: ['intern', 'coworker'], weak: ['boss', 'karen', 'networker'], 
        upgrades: ['slow', 'damage', 'nerd_boost'],
        desc: 'Star Wars specialist! "Hey I\'m coming to visit" - can move once per wave.',
        category: 'star-wars-specialist'
    },
    sophia: { 
        cost: 180, damage: 16, range: 150, fireRate: 600, color: '#FF9800', 
        special: 'listener', 
        strong: ['oversharer', 'elderly'], weak: ['intern', 'performer'], 
        upgrades: ['heal', 'range', 'empathy'],
        desc: 'Premium support specialist. Heals and boosts nearby friends.',
        category: 'support-specialist'
    },
    max: { 
        cost: 160, damage: 45, range: 130, fireRate: 2000, color: '#E91E63', 
        special: 'music_single', 
        strong: ['performer', 'gymguy'], weak: ['boss', 'karen', 'uncle'], 
        upgrades: ['wide', 'damage', 'bass'],
        desc: 'Slow but devastating single-target music specialist.',
        category: 'charm-specialist'
    },
    junior: { 
        cost: 90, damage: 18, range: 220, fireRate: 800, color: '#4CAF50', 
        special: 'trivia_range', 
        strong: ['elderly', 'uncle', 'bartender'], weak: ['intern', 'performer'], 
        upgrades: ['range', 'trivia', 'boring'],
        desc: 'Long-range trivia bombardment. Elderly love his stories.',
        category: 'nature-specialist'
    },
    sao: { 
        cost: 140, damage: 0, range: 130, fireRate: 600, color: '#00BCD4', 
        special: 'slow_only', 
        strong: ['intern', 'performer', 'elevator'], weak: ['boss', 'karen'], 
        upgrades: ['slow', 'damage', 'freeze'],
        desc: 'Pure slowdown specialist. Needs damage upgrade to attack.',
        category: 'speed-specialist'
    },
    po: { 
        cost: 110, damage: 0, range: 140, fireRate: 800, color: '#9C27B0', 
        special: 'conspiracy_only', 
        strong: ['neighbor', 'uber', 'clerk'], weak: ['boss', 'networker', 'karen'], 
        upgrades: ['conspiracy', 'damage', 'convert'],
        desc: 'Conspiracy slowdown specialist. Needs damage upgrade to attack.',
        category: 'nerd-specialist'
    },
    wrenly: { 
        cost: 170, damage: 28, range: 150, fireRate: 900, color: '#E91E63', 
        special: 'cuteness_wide', 
        strong: ['neighbor', 'clerk', 'uber', 'elderly'], weak: ['boss', 'karen'], 
        upgrades: ['cute', 'wide', 'charm'],
        desc: 'Premium cuteness specialist with AOE charm.',
        category: 'charm-specialist'
    },
    drea: { 
        cost: 65, damage: 8, range: 90, fireRate: 250, color: '#00BCD4', 
        special: 'fasttalk', 
        strong: ['neighbor', 'clerk'], weak: ['boss', 'uncle', 'bartender'], 
        upgrades: ['speed', 'damage', 'caffeine'],
        desc: 'Speed talker with rapid-fire low damage. Great vs weak enemies.',
        category: 'speed-specialist'
    },
    ruel: { 
        cost: 130, damage: 35, range: 120, fireRate: 1400, color: '#4CAF50', 
        special: 'trains', 
        strong: ['bartender', 'elderly'], weak: ['intern', 'performer'], 
        upgrades: ['damage', 'boring', 'trains'],
        desc: 'Premium train specialist. Boring but devastatingly effective.',
        category: 'nature-specialist'
    },
    nicole: { 
        cost: 125, damage: 24, range: 200, fireRate: 700, color: '#4CAF50', 
        special: 'flowers_range', 
        strong: ['elderly', 'neighbor'], weak: ['boss', 'networker'], 
        upgrades: ['range', 'nature', 'calming'],
        desc: 'Premium long-range flower wisdom specialist.',
        category: 'nature-specialist'
    }
};

class Friend {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.stats = JSON.parse(JSON.stringify(friendTypes[type])); // Deep copy
        this.lastShot = 0;
        this.target = null;
        this.specialCooldown = 0;
        this.upgrades = [];
    }

    update() {
        if (gameState.gameOver) return;
        
        // Find closest enemy in range
        this.target = null;
        let closestDistance = this.stats.range;

        for (let enemy of gameState.enemies) {
            if (!enemy.alive || enemy.converted) continue;

            const distance = Math.sqrt(
                (enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2
            );

            if (distance < closestDistance) {
                this.target = enemy;
                closestDistance = distance;
            }
        }

        // Attack target (adjust fire rate for game speed)
        const adjustedFireRate = this.stats.fireRate / gameState.gameSpeed;
        if (this.target && Date.now() - this.lastShot > adjustedFireRate) {
            this.attack();
            this.lastShot = Date.now();
        }

        // Special abilities
        if (this.specialCooldown > 0) this.specialCooldown -= gameState.gameSpeed;
        this.useSpecialAbility();
    }

    attack() {
        if (!this.target) return;

        // Special case: Sao and Pō only slow unless they have damage upgrade
        if ((this.stats.special === 'slow_only' || this.stats.special === 'conspiracy_only') && 
            !this.upgrades.includes('damage')) {
            // They just slow, no projectile
            return;
        }

        if (this.stats.special.includes('wide') && this.upgrades.includes('wide')) {
            // Wideshot attack (only if upgraded for AOE)
            this.wideshotAttack();
        } else {
            // Normal projectile
            gameState.projectiles.push(new Projectile(
                this.x, this.y, this.target, this.stats.damage, this.type
            ));
        }
    }

    wideshotAttack() {
        // Hit all enemies in range
        const effectiveRange = this.stats.range + (this.upgrades.includes('wide') ? 50 : 0);
        for (let enemy of gameState.enemies) {
            if (!enemy.alive || enemy.converted) continue;
            
            const distance = Math.sqrt(
                (enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2
            );
            
            if (distance <= effectiveRange) {
                gameState.projectiles.push(new Projectile(
                    this.x, this.y, enemy, this.stats.damage, this.type
                ));
            }
        }
    }

    useSpecialAbility() {
        if (this.specialCooldown > 0) return;

        switch (this.stats.special) {
            case 'listener':
                // Sophia heals nearby friends
                const healAmount = this.upgrades.includes('heal') ? 400 : 200;
                for (let friend of gameState.friends) {
                    const distance = Math.sqrt((friend.x - this.x) ** 2 + (friend.y - this.y) ** 2);
                    if (distance < 100 && friend !== this) {
                        friend.lastShot = Math.max(0, friend.lastShot - healAmount);
                    }
                }
                this.specialCooldown = 300;
                break;
            
            case 'slow_only':
                // Sao's pure slowdown
                const saoSlowDuration = this.upgrades.includes('slow') ? 150 : 90;
                for (let enemy of gameState.enemies) {
                    if (!enemy.alive || enemy.converted) continue;
                    const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                    if (distance < this.stats.range) {
                        enemy.applySlow(saoSlowDuration);
                    }
                }
                this.specialCooldown = 120;
                break;
            
            case 'conspiracy_only':
                // Pō's conspiracy theories
                if (this.upgrades.includes('convert')) {
                    for (let enemy of gameState.enemies) {
                        if (!enemy.alive || enemy.converted) continue;
                        const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                        if (distance < this.stats.range && Math.random() < 0.3) {
                            enemy.convert();
                            addSpeechBubble(enemy.x, enemy.y - 30, "Pō converted them!");
                        }
                    }
                    this.specialCooldown = 600;
                } else {
                    // Regular conspiracy slow
                    const slowDuration = this.upgrades.includes('conspiracy') ? 120 : 80;
                    for (let enemy of gameState.enemies) {
                        if (!enemy.alive || enemy.converted) continue;
                        const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                        if (distance < this.stats.range) {
                            enemy.applySlow(slowDuration);
                        }
                    }
                    this.specialCooldown = 180;
                }
                break;
            
            case 'cuteness_wide':
                // Wrenly stuns if upgraded
                if (this.upgrades.includes('cute')) {
                    for (let enemy of gameState.enemies) {
                        if (!enemy.alive || enemy.converted) continue;
                        const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                        if (distance < this.stats.range) {
                            enemy.stun(30);
                        }
                    }
                    this.specialCooldown = 600;
                }
                break;
        }
    }

    canUpgrade() {
        return this.upgrades.length < 2; // Max 2 upgrades per friend
    }

    upgrade(upgradeType) {
        if (!this.canUpgrade() || this.upgrades.includes(upgradeType)) return false;

        this.upgrades.push(upgradeType);
        
        // Apply upgrade effects
        switch (upgradeType) {
            case 'damage':
                this.stats.damage = Math.floor(this.stats.damage * 1.5);
                break;
            case 'rate':
                this.stats.fireRate = Math.floor(this.stats.fireRate * 0.6);
                break;
            case 'range':
                this.stats.range = Math.floor(this.stats.range * 1.3);
                break;
            case 'speed':
                this.stats.fireRate = Math.floor(this.stats.fireRate * 0.33);
                break;
        }
        
        return true;
    }

    draw() {
        // Friend body with color coordination
        ctx.fillStyle = this.stats.color;
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
        
        // Add a border to make it more visible
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 15, this.y - 15, 30, 30);

        // Special ability indicators
        if (this.type === 'dario' && !gameState.darioPhotoUsed) {
            // Photo button indicator
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.x - 20, this.y - 20, 10, 10);
            ctx.fillStyle = 'black';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📷', this.x - 15, this.y - 13);
        }
        
        if (this.type === 'tony' && !gameState.tonyMoveUsed) {
            // Move indicator
            ctx.fillStyle = 'cyan';
            ctx.fillRect(this.x + 10, this.y - 20, 10, 10);
            ctx.fillStyle = 'black';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('➤', this.x + 15, this.y - 13);
        }

        // Upgrade indicators
        if (this.upgrades.length > 0) {
            ctx.fillStyle = 'gold';
            for (let i = 0; i < this.upgrades.length; i++) {
                ctx.fillRect(this.x - 18 + i * 8, this.y - 18, 6, 6);
            }
        }

        // Friend identifier
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.toUpperCase(), this.x, this.y + 2);

        // Range indicator when placing
        if (gameState.selectedFriend === this.type) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.range, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

export { friendTypes, Friend };
