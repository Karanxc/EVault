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
                brightness: Math.random() > 0.8 ? 2 : 1 // Some stars are brighter
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
                hue: Math.random() * 60 + 280, // Pink to purple range
                parallaxFactor: Math.random() * 0.3 + 0.1,
                originalX: 0,
                originalY: 0
            });
            
            this.nebulae[i].originalX = this.nebulae[i].x;
            this.nebulae[i].originalY = this.nebulae[i].y;
        }
    }
    
    createShootingStar() {
        if (Math.random() < 0.995) return; // Low probability
        
        const side = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        
        // Start from random edge
        switch(side) {
            case 0: // Top
                startX = Math.random() * this.canvas.width;
                startY = -50;
                endX = startX + (Math.random() * 300 - 150);
                endY = this.canvas.height + 50;
                break;
            case 1: // Right
                startX = this.canvas.width + 50;
                startY = Math.random() * this.canvas.height;
                endX = -50;
                endY = startY + (Math.random() * 300 - 150);
                break;
            case 2: // Bottom
                startX = Math.random() * this.canvas.width;
                startY = this.canvas.height + 50;
                endX = startX + (Math.random() * 300 - 150);
                endY = -50;
                break;
            case 3: // Left
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