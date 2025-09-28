class GalaxyBackground {
    constructor() {
        this.canvas = document.getElementById('galaxy-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.shootingStars = [];
        this.nebulae = [];
        this.mouse = { x: 0, y: 0 };
        this.isMouseMoving = false;
        this.mouseTimeout = null;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createStars();
        this.bindEvents();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        const numStars = Math.floor((this.canvas.width * this.canvas.height) / 3000);
        this.stars = [];
        
        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.3,
                opacity: Math.random() * 0.9 + 0.1,
                twinkleSpeed: Math.random() * 0.01 + 0.002,
                brightness: Math.random() > 0.8 ? 2 : 1
            });
        }
    }

     createNebulae() {
        const numNebulae = 3;
        this.nebulae = [];
        
        for (let i = 0; i < numNebulae; i++) {
            this.nebulae.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 200 + 100,
                opacity: Math.random() * 0.1 + 0.05,
                hue: Math.random() * 60 + 280,
                parallaxFactor: Math.random() * 0.3 + 0.1,
                originalX: 0,
                originalY: 0
            });
            
            this.nebulae[i].originalX = this.nebulae[i].x;
            this.nebulae[i].originalY = this.nebulae[i].y;
        }
    }
    
    createShootingStar() {
        if (Math.random() < 0.995) return;
        
        const side = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        
        
        switch(side) {
            case 0:
                startX = Math.random() * this.canvas.width;
                startY = -50;
                endX = startX + (Math.random() * 300 - 150);
                endY = this.canvas.height + 50;
                break;
            case 1:
                startX = this.canvas.width + 50;
                startY = Math.random() * this.canvas.height;
                endX = -50;
                endY = startY + (Math.random() * 300 - 150);
                break;
            case 2:
                startX = Math.random() * this.canvas.width;
                startY = this.canvas.height + 50;
                endX = startX + (Math.random() * 300 - 150);
                endY = -50;
                break;
            case 3:
                startX = -50;
                startY = Math.random() * this.canvas.height;
                endX = this.canvas.width + 50;
                endY = startY + (Math.random() * 300 - 150);
                break;
        }
        
        this.shootingStars.push({
            x: startX,
            y: startY,
            endX: endX,
            endY: endY,
            speed: Math.random() * 8 + 4,
            size: Math.random() * 2 + 1,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createStars();
        });
    }
    
    updateParallax() {
        
    }
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    drawStars() {
        this.stars.forEach(star => {
            const twinkle = Math.sin(Date.now() * star.twinkleSpeed) * 0.2 + 0.8;
            const currentOpacity = star.opacity * twinkle;
            
            this.ctx.save();
            this.ctx.globalAlpha = currentOpacity;
            
            
            if (star.brightness > 1) {
            
                const colors = ['#ffffff', '#ffddee', '#ddddff', '#ffeeff'];
                this.ctx.fillStyle = colors[Math.floor(star.x * 4) % 4];
            } else {
            
                this.ctx.fillStyle = '#ffffff';
            }
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawNebulae() {
        this.nebulae.forEach(nebula => {
            this.ctx.save();
            this.ctx.globalAlpha = nebula.opacity;
            
            const gradient = this.ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, `hsla(${nebula.hue}, 70%, 60%, 0.3)`);
            gradient.addColorStop(0.5, `hsla(${nebula.hue + 20}, 60%, 50%, 0.1)`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    drawShootingStars() {
        this.shootingStars.forEach((star, index) => {
            // Move shooting star
            const dx = star.endX - star.x;
            const dy = star.endY - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > star.speed) {
                const ratio = star.speed / distance;
                star.x += dx * ratio;
                star.y += dy * ratio;
            }
            
            star.life -= star.decay;
            
            if (star.life <= 0) {
                this.shootingStars.splice(index, 1);
                return;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = star.life;
            
            // Create shooting star trail
            const gradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x - dx * 0.1, star.y - dy * 0.1
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, '#ff69b4');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = star.size;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - dx * 0.1, star.y - dy * 0.1);
            this.ctx.stroke();
            
            // Draw shooting star head
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    animate() {
        // Clear canvas completely for static background
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Only draw static twinkling stars - no parallax, no shooting stars, no nebulae
        this.drawStars();
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize galaxy background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GalaxyBackground();
});