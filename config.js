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
        "新整合包？",
        "Forge Fabric and Neo",
        "简洁还是不一般？",
        () => calculateDaysToNewYear('CN'),
        () => calculateDaysToNewYear('US')
    ],
    textInterval: 5000,

    typingSpeed: {
        min: 50,
        max: 100
    },

    audioFile: 'Run.flac',
    audioFallback: 'Run.mp3',

    particleSettings: {
        raindropCount: 15,
        snowflakeCount: 30,
        raindropSpeed: { min: 8, max: 15 },
        snowflakeSpeed: { min: 1, max: 3 },
        raindropColor: '#818cf8',
        snowflakeColor: '#ffffff'
    }
};

function calculateDaysToNewYear(countryCode) {
    const now = new Date();
    let targetDate;
    
    if (countryCode === 'CN') {
        targetDate = getChineseNewYearDate(now);
    } else {
        targetDate = getUsNewYearDate(now);
    }
    
    const diffDays = Math.ceil((targetDate - now) / 86400000);
    
    return countryCode === 'CN' 
        ? `距离春节还有 ${diffDays} 天`
        : `距离新年还有 ${diffDays} 天`;
}

function getUsNewYearDate(now) {
    const currentYear = now.getFullYear();
    const isNewYearsDay = now.getMonth() === 0 && now.getDate() === 1;
    
    return isNewYearsDay 
        ? new Date(currentYear, 0, 1)
        : new Date(currentYear + 1, 0, 1);
}

function getChineseNewYearDate(now) {
    const year = now.getFullYear();
    const chineseNewYear = calculateLunarNewYear(year);
    
    return now > chineseNewYear 
        ? calculateLunarNewYear(year + 1)
        : chineseNewYear;
}

function calculateLunarNewYear(year) {
    const lunarDates = {
        2024: new Date(2024, 1, 10),
        2025: new Date(2025, 0, 29),
        2026: new Date(2026, 1, 17),
        2027: new Date(2027, 1, 6),
        2028: new Date(2028, 0, 26),
        2029: new Date(2029, 1, 13),
        2030: new Date(2030, 1, 3)
    };

    return lunarDates[year] || new Date(year, 0, 21);
}