import { CONFIG } from './config.js';

class ResourceLoader {
    constructor() {
        this.loaded = 0;
        this.total = CONFIG.imageCount + 2;
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.loaderText = document.querySelector('.loader-text');
        this.images = [];
    }

    async loadAll() {
        const loaders = [];
        
        const audioLoader = this.loadAudio().then(() => {
            this.updateProgress('音频加载完成');
        });
        loaders.push(audioLoader);
        
        for (let i = 1; i <= CONFIG.imageCount; i++) {
            const imageLoader = this.loadImage(i).then(() => {
                this.updateProgress(`图片 ${i}/${CONFIG.imageCount} 加载完成`);
            });
            loaders.push(imageLoader);
        }
        
        await Promise.allSettled(loaders);
        return this.images;
    }

    loadAudio() {
        return new Promise((resolve) => {
            const audio = new Audio();
            const sourceFlac = document.createElement('source');
            sourceFlac.src = CONFIG.audioFile;
            sourceFlac.type = 'audio/flac';
            
            const sourceMp3 = document.createElement('source');
            sourceMp3.src = CONFIG.audioFallback;
            sourceMp3.type = 'audio/mpeg';
            
            audio.appendChild(sourceFlac);
            audio.appendChild(sourceMp3);
            audio.preload = 'auto';
            audio.loop = true;
            audio.volume = 0.7;
            
            audio.oncanplaythrough = () => {
                window.appAudio = audio;
                this.loaded++;
                resolve();
            };
            
            audio.onerror = () => {
                this.loaded++;
                resolve();
            };
        });
    }

    loadImage(index) {
        return new Promise((resolve) => {
            const img = new Image();
            const imageName = `${CONFIG.imageBaseName}${index}${CONFIG.imageExtension}`;
            
            img.onload = () => {
                this.images.push(imageName);
                this.loaded++;
                resolve();
            };
            
            img.onerror = () => {
                this.loaded++;
                resolve();
            };
            
            img.src = imageName;
            img.loading = 'eager';
        });
    }

    updateProgress(message) {
        const progress = Math.floor((this.loaded / this.total) * 100);
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${progress}%`;
        this.loaderText.textContent = message;
    }
}

class TextEffect {
    constructor(textElement, cursorElement) {
        this.textElement = textElement;
        this.cursorElement = cursorElement;
        this.currentText = '';
        this.isTyping = false;
        this.typingTimeout = null;
    }

    typeText(text) {
        if (this.isTyping) {
            this.stopTyping();
        }

        this.isTyping = true;
        this.currentText = '';
        this.textElement.textContent = '';
        
        let index = 0;
        const typeNextChar = () => {
            if (index < text.length) {
                this.currentText += text.charAt(index);
                this.textElement.textContent = this.currentText;
                index++;
                
                const speed = CONFIG.typingSpeed.min + 
                            Math.random() * (CONFIG.typingSpeed.max - CONFIG.typingSpeed.min);
                
                this.typingTimeout = setTimeout(typeNextChar, speed);
            } else {
                this.isTyping = false;
            }
        };

        typeNextChar();
    }

    stopTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        this.isTyping = false;
    }

    changeText(texts) {
        const randomIndex = Math.floor(Math.random() * texts.length);
        let nextText = texts[randomIndex];
        
        if (typeof nextText === 'function') {
            nextText = nextText();
        }
        
        this.typeText(nextText);
    }

    toggleCursor(show) {
        this.cursorElement.style.opacity = show ? '1' : '0';
    }

    cleanup() {
        this.stopTyping();
        this.textElement.textContent = '';
        this.toggleCursor(false);
    }
}

class SlideshowApp {
    constructor() {
        this.imageElement = document.getElementById('display-image');
        this.textElement = document.getElementById('typed-text');
        this.cursorElement = document.getElementById('cursor');
        this.loader = document.getElementById('loader');
        this.mainContent = document.getElementById('main-content');
        this.textEffect = null;
        this.isRunning = false;
        this.imageInterval = null;
        this.textInterval = null;
        this.currentIndex = 0;
        this.images = [];
        this.init();
    }

    async init() {
        try {
            const resourceLoader = new ResourceLoader();
            this.images = await resourceLoader.loadAll();
            this.showMainContent();
            this.textEffect = new TextEffect(this.textElement, this.cursorElement);
            this.startSlideshow();
            this.setupEventListeners();
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    showMainContent() {
        this.loader.style.opacity = '0';
        setTimeout(() => {
            this.loader.style.display = 'none';
            this.mainContent.style.display = 'block';
            setTimeout(() => {
                this.mainContent.style.opacity = '1';
            }, 10);
        }, 500);
    }

    startSlideshow() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        this.changeImage();
        
        this.textEffect.changeText(CONFIG.texts);
        
        this.imageInterval = setInterval(() => {
            this.changeImage();
        }, CONFIG.imageInterval);
        
        this.textInterval = setInterval(() => {
            this.textEffect.changeText(CONFIG.texts);
        }, CONFIG.textInterval);
    }

    changeImage() {
        this.imageElement.classList.remove('fade-in');
        
        setTimeout(() => {
            if (this.images.length === 0) {
                this.imageElement.src = this.getPlaceholder();
                this.fadeInImage();
                return;
            }
            
            const imageName = this.images[this.currentIndex % this.images.length];
            this.currentIndex++;
            
            requestAnimationFrame(() => {
                this.imageElement.src = imageName;
                
                if (this.imageElement.complete) {
                    this.fadeInImage();
                } else {
                    this.imageElement.onload = () => this.fadeInImage();
                }
            });
        }, CONFIG.fadeDuration / 2);
    }

    fadeInImage() {
        requestAnimationFrame(() => {
            this.imageElement.classList.add('fade-in');
        });
    }

    getPlaceholder() {
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#1e293b"/>
                <text x="50%" y="50%" font-size="24" fill="#64748b" 
                      text-anchor="middle" dy=".3em">等待图片加载...</text>
            </svg>
        `)}`;
    }

    setupEventListeners() {
        const activateAudio = () => {
            if (window.appAudio && window.appAudio.paused) {
                window.appAudio.play().catch(e => console.log('音频播放失败:', e));
                document.removeEventListener('click', activateAudio);
                document.removeEventListener('touchstart', activateAudio);
                document.removeEventListener('keydown', activateAudio);
            }
        };
        
        document.addEventListener('click', activateAudio);
        document.addEventListener('touchstart', activateAudio);
        document.addEventListener('keydown', activateAudio);
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && window.appAudio) {
                window.appAudio.pause();
            } else if (window.appAudio) {
                window.appAudio.play().catch(e => {});
            }
        });
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.imageElement.style.display = 'none';
                requestAnimationFrame(() => {
                    this.imageElement.style.display = 'block';
                });
            }, 250);
        });
    }

    cleanup() {
        if (this.imageInterval) clearInterval(this.imageInterval);
        if (this.textInterval) clearInterval(this.textInterval);
        
        this.textEffect?.cleanup();
        
        if (window.appAudio) {
            window.appAudio.pause();
            window.appAudio.src = '';
            window.appAudio.load();
        }
        
        this.isRunning = false;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new SlideshowApp();
    });
} else {
    window.app = new SlideshowApp();
}

window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});

export { SlideshowApp };