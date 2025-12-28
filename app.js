import { CONFIG } from './config.js';
import { ModernParticleSystem } from './particle-system.js';

class ModernResourceLoader {
    constructor() {
        this.progress = 0;
        this.total = CONFIG.imageCount + 1;
        this.loaded = 0;
        this.images = [];
        this.cache = new Map();
    }
    
    async loadAll() {
        try {
            await Promise.allSettled([
                this.loadAudio(),
                ...this.loadImages()
            ]);
            
            return this.images;
        } catch (error) {
            console.warn('资源加载异常:', error);
            return this.images;
        }
    }
    
    async loadAudio() {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.loop = true;
            audio.volume = 0.7;

            const canPlayFlac = audio.canPlayType('audio/flac') !== '';
            const canPlayMp3 = audio.canPlayType('audio/mpeg') !== '';
            
            if (canPlayFlac && CONFIG.audioFile) {
                audio.src = CONFIG.audioFile;
            } else if (canPlayMp3 && CONFIG.audioFallback) {
                audio.src = CONFIG.audioFallback;
            } else {
                this.updateProgress();
                resolve();
                return;
            }
            
            audio.oncanplaythrough = () => {
                window.appAudio = audio;
                this.updateProgress();
                resolve();
            };
            
            audio.onerror = () => {
                this.updateProgress();
                resolve();
            };
            
            audio.load();
        });
    }
    
    loadImages() {
        const promises = [];
        
        for (let i = 1; i <= CONFIG.imageCount; i++) {
            promises.push(this.loadImage(i));
        }
        
        return promises;
    }
    
    async loadImage(index) {
        const imageName = `${CONFIG.imageBaseName}${index}${CONFIG.imageExtension}`;
        
        if (this.cache.has(imageName)) {
            this.images.push(imageName);
            this.updateProgress();
            return;
        }
        
        return new Promise((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.fetchPriority = 'high';
            
            img.onload = () => {
                this.images.push(imageName);
                this.cache.set(imageName, img);
                this.updateProgress();
                resolve();
            };
            
            img.onerror = () => {
                this.updateProgress();
                resolve();
            };
            
            img.src = imageName;
        });
    }
    
    updateProgress() {
        this.loaded++;
        this.progress = Math.floor((this.loaded / this.total) * 100);
        
        requestAnimationFrame(() => {
            const bar = document.getElementById('progress-bar');
            const text = document.getElementById('progress-text');
            
            if (bar) bar.style.width = `${this.progress}%`;
            if (text) text.textContent = `${this.progress}%`;
        });
    }
}

class ModernTypewriter {
    constructor(textElement, cursorElement) {
        this.textElement = textElement;
        this.cursorElement = cursorElement;
        this.queue = [];
        this.isTyping = false;
        this.timeout = null;
    }
    
    type(text, callback) {
        this.queue.push({ text, callback });
        if (!this.isTyping) {
            this.processQueue();
        }
    }
    
    processQueue() {
        if (this.queue.length === 0) {
            this.isTyping = false;
            this.startCursorBlink();
            return;
        }
        
        const { text, callback } = this.queue.shift();
        this.isTyping = true;
        this.stopCursorBlink();
        this.cursorElement.style.opacity = '1';
        
        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                this.textElement.textContent = text.slice(0, index + 1);
                index++;
                
                const speed = CONFIG.typingSpeed.min + 
                            Math.random() * (CONFIG.typingSpeed.max - CONFIG.typingSpeed.min);
                
                this.timeout = setTimeout(typeChar, speed);
            } else {
                this.isTyping = false;
                if (callback) callback();
                setTimeout(() => this.processQueue(), 500);
            }
        };
        
        typeChar();
    }
    
    startCursorBlink() {
        let visible = true;
        const blink = () => {
            this.cursorElement.style.opacity = visible ? '1' : '0.3';
            visible = !visible;
            
            if (!this.isTyping) {
                setTimeout(() => requestAnimationFrame(blink), 500);
            }
        };
        
        requestAnimationFrame(blink);
    }
    
    stopCursorBlink() {
        this.cursorElement.style.opacity = '1';
    }
    
    clear() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.queue = [];
        this.isTyping = false;
        this.textElement.textContent = '';
        this.startCursorBlink();
    }
}

class CoupletManager {
    constructor() {
        this.container = null;
        this.isVisible = false;
        this.timeout = null;
        
        this.init();
    }
    
    init() {
        this.createCouplet();
        this.scheduleShow();

        document.addEventListener('click', () => {
            this.hide();
            this.scheduleShow();
        }, { once: false });
    }
    
    createCouplet() {
        this.container = document.createElement('div');
        this.container.className = 'couplet-container';
        
        const couplet = document.createElement('div');
        couplet.className = 'couplet';
        couplet.innerHTML = `
            <span>福彩齐到</span>
            <span>兴盛乐矣</span>
        `;
        
        this.container.appendChild(couplet);
        document.body.appendChild(this.container);
    }
    
    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.container.classList.add('show');
        
        // 8秒后自动隐藏
        this.timeout = setTimeout(() => {
            this.hide();
            this.scheduleShow();
        }, 8000);
    }
    
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.container.classList.remove('show');
        
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    
    scheduleShow() {
        const delay = Math.random() * 30000 + 30000;
        setTimeout(() => {
            this.show();
        }, delay);
    }
    
    cleanup() {
        this.hide();
        if (this.container && this.container.parentNode) {
            this.container.remove();
        }
    }
}

class ModernSlideshowApp {
    constructor() {
        this.imageElement = document.getElementById('display-image');
        this.textElement = document.getElementById('typed-text');
        this.cursorElement = document.getElementById('cursor');
        this.loader = document.getElementById('loader');
        this.mainContent = document.getElementById('main-content');
        
        this.typewriter = null;
        this.particles = null;
        this.couplet = null;
        this.images = [];
        this.currentIndex = 0;
        this.imageTimer = null;
        this.textTimer = null;
        
        this.initialize();
    }
    
    async initialize() {
        try {
            const loader = new ModernResourceLoader();
            this.images = await loader.loadAll();

            this.showMainContent();

            this.typewriter = new ModernTypewriter(this.textElement, this.cursorElement);
            this.particles = new ModernParticleSystem();
            this.couplet = new CoupletManager();

            this.startSlideshow();

            this.setupEvents();
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showMainContent();
        }
    }
    
    showMainContent() {
        this.loader.style.opacity = '0';
        
        setTimeout(() => {
            this.loader.style.display = 'none';
            this.mainContent.style.display = 'block';
            
            requestAnimationFrame(() => {
                this.mainContent.style.opacity = '1';
            });
        }, 300);
    }
    
    startSlideshow() {
        this.changeImage();

        this.changeText();

        this.imageTimer = setInterval(() => {
            this.changeImage();
        }, CONFIG.imageInterval);
        
        this.textTimer = setInterval(() => {
            this.changeText();
        }, CONFIG.textInterval);
    }
    
    changeImage() {
        if (this.images.length === 0) return;

        this.imageElement.classList.remove('fade-in');

        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.preloadImage(nextIndex);
        
        setTimeout(() => {
            this.imageElement.src = this.images[this.currentIndex];
            this.currentIndex = nextIndex;
            
            this.imageElement.onload = () => {
                this.imageElement.classList.add('fade-in');
            };

            if (this.imageElement.complete) {
                this.imageElement.classList.add('fade-in');
            }
        }, CONFIG.fadeDuration / 2);
    }
    
    preloadImage(index) {
        if (index >= this.images.length) return;
        
        const img = new Image();
        img.src = this.images[index];
    }
    
    changeText() {
        const randomIndex = Math.floor(Math.random() * CONFIG.texts.length);
        let text = CONFIG.texts[randomIndex];
        
        if (typeof text === 'function') {
            try {
                text = text();
            } catch {
                text = CONFIG.texts[0] || '';
            }
        }
        
        if (text) {
            this.typewriter.type(text);
        }
    }
    
    setupEvents() {
        const activateAudio = () => {
            if (window.appAudio && window.appAudio.paused) {
                window.appAudio.play().catch(() => {});
            }
        };
        
        document.addEventListener('click', activateAudio, { once: true });
        document.addEventListener('touchstart', activateAudio, { once: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (window.appAudio) window.appAudio.pause();
                this.particles.pause();
            } else {
                if (window.appAudio) window.appAudio.play().catch(() => {});
                this.particles.resume();
            }
        });

        window.addEventListener('resize', () => {
            this.particles.resize();
        }, { passive: true });
    }
    
    cleanup() {
        if (this.imageTimer) clearInterval(this.imageTimer);
        if (this.textTimer) clearInterval(this.textTimer);

        this.typewriter?.clear();
        this.particles?.cleanup();
        this.couplet?.cleanup();

        if (window.appAudio) {
            window.appAudio.pause();
            window.appAudio.src = '';
            delete window.appAudio;
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new ModernSlideshowApp();
    });
} else {
    window.app = new ModernSlideshowApp();
}

window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});

export { ModernSlideshowApp };