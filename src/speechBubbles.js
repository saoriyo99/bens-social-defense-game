import { gameState } from './game.js';

// Speech bubble system
class SpeechBubble {
    constructor(x, y, message) {
        this.x = x;
        this.y = y;
        this.message = message;
        this.life = 180; // 3 seconds at 60fps
        this.maxLife = 180;
    }

    update() {
        this.life -= gameState.gameSpeed;
    }

    draw() {
        if (this.life <= 0) return;
        
        const alpha = Math.min(1, this.life / 60);
        ctx.globalAlpha = alpha;
        
        // Bubble background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        
        const bubbleWidth = Math.min(200, this.message.length * 8 + 20);
        const bubbleHeight = 40;
        
        ctx.fillRect(this.x - bubbleWidth/2, this.y - bubbleHeight, bubbleWidth, bubbleHeight);
        ctx.strokeRect(this.x - bubbleWidth/2, this.y - bubbleHeight, bubbleWidth, bubbleHeight);
        
        // Pointer
        ctx.beginPath();
        ctx.moveTo(this.x - 10, this.y);
        ctx.lineTo(this.x, this.y + 10);
        ctx.lineTo(this.x + 10, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#00ff41';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(this.message, this.x, this.y - 15);
        
        ctx.globalAlpha = 1;
    }
}

function addSpeechBubble(x, y, message) {
    gameState.speechBubbles.push(new SpeechBubble(x, y, message));
}

export { SpeechBubble, addSpeechBubble };
