export const CONFIG = {
    imageBaseName: 'Pic',
    imageExtension: '.png',
    imageInterval: 2000,
    fadeDuration: 1000,
    imageCount: 4,
    
    texts: [
        "Life is relaxing.",
        "上一年是哪年？",
        "什么是方块？",
        "7~7",
        "静谧与宁静",
        "月亮与太阳",
        "MoMoCow",
        "CPW",
        "Forge Fabric and Neo",
        "简洁还是不一般？",
        "Earth's family!",
        function() {
            const now = new Date();
            const currentYear = now.getFullYear();
            const nextYear = currentYear + 1;
            const nextNewYear = new Date(nextYear, 0, 1, 0, 0, 0, 0);
            const diffTime = nextNewYear - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `距离新年还剩 ${diffDays} 天`;
        }
    ],
    textInterval: 5000,
    
    typingSpeed: {
        min: 50,
        max: 100
    },
    
    audioFile: 'Run.flac',
    audioFallback: 'Run.mp3'
};