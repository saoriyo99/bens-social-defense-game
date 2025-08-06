import { gameState } from './game.js';

// Banana explosion particles
class Banana {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.gravity = 0.3;
        this.life = 60;
        this.maxLife = 60;
    }

    update() {
        this.x += this.vx * gameState.gameSpeed;
        this.y += this.vy * gameState.gameSpeed;
        this.vy += this.gravity * gameState.gameSpeed;
        this.life -= gameState.gameSpeed;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFEB3B';
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        ctx.globalAlpha = 1;
    }
}

export { Banana };
