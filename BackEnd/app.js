
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
    