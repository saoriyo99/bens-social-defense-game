import { friendTypes } from './friends.js';
import { gameState } from './game.js';

class Projectile {
    constructor(x, y, target, damage, attackerType) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.attackerType = attackerType;
        this.speed = 7;
        this.alive = true;
    }

    update() {
        if (!this.alive || !this.target.alive || this.target.converted || gameState.gameOver) {
            this.alive = false;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
            // Hit target
            this.target.takeDamage(this.damage, this.attackerType);
            this.alive = false;
        } else {
            const moveSpeed = this.speed * gameState.gameSpeed;
            this.x += (dx / distance) * moveSpeed;
            this.y += (dy / distance) * moveSpeed;
        }
    }

    draw() {
        if (!this.alive) return;
        
        const friendData = friendTypes[this.attackerType];
        ctx.fillStyle = friendData ? friendData.color : '#00FF00';
        ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
    }
}

export { Projectile };
