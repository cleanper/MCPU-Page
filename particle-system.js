export class ModernParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.raindrops = [];
        this.snowflakes = [];
        this.animationId = null;
        this.lastTime = 0;
        this.clickDebounce = 0;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        this.createCanvas();
        this.resize();
        this.start();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.ctx.imageSmoothingEnabled = false;
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        this.ctx.scale(dpr, dpr);

        this.snowflakes.forEach(flake => {
            if (flake.x > width) flake.x = width * Math.random();
            if (flake.y > height) flake.y = -10;
        });
    }
    
    bindEvents() {
        document.addEventListener('click', (e) => {
            const now = performance.now();
            if (now - this.clickDebounce < 100) return;
            
            this.clickDebounce = now;
            this.createRaindrops(e.clientX, e.clientY, CONFIG.particleSettings.raindropCount);
        });

        this.createInitialSnowflakes();

        window.addEventListener('resize', () => {
            this.resize();
        }, { passive: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    createRaindrop(x, y) {
        const speed = CONFIG.particleSettings.raindropSpeed.min + 
                     Math.random() * (CONFIG.particleSettings.raindropSpeed.max - CONFIG.particleSettings.raindropSpeed.min);
        const angle = (Math.random() * 30 + 75) * (Math.PI / 180);
        
        return {
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.01
        };
    }
    
    createRaindrops(x, y, count) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 80;
            const offsetY = (Math.random() - 0.5) * 40;
            this.raindrops.push(this.createRaindrop(x + offsetX, y + offsetY));
        }
    }
    
    createSnowflake() {
        return {
            x: Math.random() * window.innerWidth,
            y: -10,
            size: Math.random() * 4 + 2,
            speed: CONFIG.particleSettings.snowflakeSpeed.min + 
                   Math.random() * (CONFIG.particleSettings.snowflakeSpeed.max - CONFIG.particleSettings.snowflakeSpeed.min),
            sway: Math.random() * 0.5 - 0.25,
            swaySpeed: Math.random() * 0.02 + 0.01,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            opacity: Math.random() * 0.5 + 0.3
        };
    }
    
    createInitialSnowflakes() {
        const count = Math.min(
            CONFIG.particleSettings.snowflakeCount,
            Math.floor(window.innerWidth / 40)
        );
        
        for (let i = 0; i < count; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }
    
    updateParticles(deltaTime) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // 更新雨滴
        for (let i = this.raindrops.length - 1; i >= 0; i--) {
            const drop = this.raindrops[i];
            
            drop.x += drop.vx * deltaTime;
            drop.y += drop.vy * deltaTime;
            drop.life -= drop.decay * deltaTime;
            
            if (drop.life <= 0 || drop.y > height + 50 || drop.x > width + 50 || drop.x < -50) {
                this.raindrops.splice(i, 1);
            }
        }
        
        // 更新雪花
        for (const flake of this.snowflakes) {
            flake.y += flake.speed * deltaTime;
            flake.x += Math.sin(flake.sway) * 0.3;
            flake.sway += flake.swaySpeed * deltaTime;
            flake.rotation += flake.rotationSpeed * deltaTime;
            
            if (flake.y > height + 20) {
                flake.y = -10;
                flake.x = Math.random() * width;
                flake.opacity = Math.random() * 0.5 + 0.3;
            }
        }
        
        // 补充雪花
        while (this.snowflakes.length < CONFIG.particleSettings.snowflakeCount * 0.8) {
            this.snowflakes.push(this.createSnowflake());
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染雨滴
        this.ctx.fillStyle = CONFIG.particleSettings.raindropColor;
        for (const drop of this.raindrops) {
            this.ctx.globalAlpha = drop.life;
            this.ctx.fillRect(drop.x - 1, drop.y, 2, 15);
        }
        
        // 渲染雪花
        this.ctx.fillStyle = CONFIG.particleSettings.snowflakeColor;
        for (const flake of this.snowflakes) {
            this.ctx.globalAlpha = flake.opacity;
            this.ctx.save();
            this.ctx.translate(flake.x, flake.y);
            this.ctx.rotate(flake.rotation);
            this.ctx.fillRect(-flake.size / 2, -flake.size / 2, flake.size, flake.size);
            this.ctx.restore();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    animate(timestamp) {
        const deltaTime = Math.min((timestamp - this.lastTime) / 16, 2);
        this.lastTime = timestamp;
        
        this.updateParticles(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    
    start() {
        if (this.animationId) return;
        this.lastTime = performance.now();
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    
    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resume() {
        if (!this.animationId) {
            this.start();
        }
    }
    
    cleanup() {
        this.pause();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.remove();
        }
    }
}