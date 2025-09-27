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