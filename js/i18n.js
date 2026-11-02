const TRANSLATIONS = {
  en: {
    "weather.chip.aria": "Open weather details",
    "search.placeholder": "Search, text and image",
    "search.engine.aria": "Switch search engine",
    "image.remove.aria": "Remove image",
    "weather.city.title": "Click to change city",
    "weather.city.placeholder": "City name",
    "weather.modal.title": "Weather",
    "weather.close.aria": "Close",
    "weather.feelsLike": "Feels like",
    "weather.recentRain": "Recent rain",
    "weather.wind": "Wind",
    "weather.note": "Open the extension icon to set your API keys",
    "settings.btn.aria": "Settings",
    "settings.timeFormat": "Time Format",
    "settings.weather": "Weather",
    "settings.searchEngine": "Search Engine",
    "settings.imageSearch": "Image Search",
    "settings.wallpaperSource": "Wallpaper Source",
    "settings.wallpaperSource.local": "Local",
    "settings.changeWallpaper": "Change Wallpaper",
    "settings.importWallpaper": "Import Local Wallpaper",
    "settings.downloadWallpaper": "Download Wallpaper",
    "settings.changeWallpaper.bing": "Bing wallpaper changes daily and cannot be refreshed manually.",
    "settings.changeWallpaper.local": "Local wallpaper is changed by importing a new image.",
    "settings.language": "Language",
    "popup.title": "API Keys",
    "popup.subtitle": "Save your keys locally from the extension icon.",
    "popup.weatherKey": "OpenWeatherMap",
    "popup.pexelsKey": "Pexels",
    "popup.imgbbKey": "imgbb",
    "popup.reset": "Reset",
    "popup.save": "Save",
    "popup.loaded": "Current keys loaded.",
    "popup.saved": "API keys saved.",
    "popup.resetDone": "API keys cleared.",
    "popup.loadFailed": "Failed to load API keys.",
    "popup.saveFailed": "Failed to save API keys.",
    "app.uploading": "Uploading image...",
    "app.uploadFailed": "Image upload failed, please try again.",
    "bg.loadFailed": "Failed to load new wallpaper. Please try again later.",
    "bg.invalidImage": "Please choose a valid image file.",
    "bg.importFailed": "Failed to import wallpaper. Please try again.",
    "bg.localMissing": "No local wallpaper found. Please import one first.",
    "bg.noWallpaper": "No wallpaper to download. Please wait for the wallpaper to load.",
    "bg.extractFailed": "Unable to extract wallpaper URL.",
    "bg.downloadFailed": "Failed to download wallpaper. Please try again later.",
    "weather.awaiting": "Awaiting data",
    "weather.geoError": "Geolocation error:",
    "search.imgbbRequired": " image search requires an imgbb API key for image hosting. Please add it from the extension icon."
  },
  zh: {
    "weather.chip.aria": "打开天气详情",
    "search.placeholder": "搜索，支持文本和图片",
    "search.engine.aria": "切换搜索引擎",
    "image.remove.aria": "移除图片",
    "weather.city.title": "点击修改城市",
    "weather.city.placeholder": "城市名称",
    "weather.modal.title": "天气",
    "weather.close.aria": "关闭",
    "weather.feelsLike": "体感温度",
    "weather.recentRain": "近期降雨",
    "weather.wind": "风速",
    "weather.note": "请点击扩展图标打开页面配置 API 密钥",
    "settings.btn.aria": "设置",
    "settings.timeFormat": "时间格式",
    "settings.weather": "天气",
    "settings.searchEngine": "搜索引擎",
    "settings.imageSearch": "图片搜索",
    "settings.wallpaperSource": "壁纸来源",
    "settings.wallpaperSource.local": "本地",
    "settings.changeWallpaper": "更换壁纸",
    "settings.importWallpaper": "导入本地壁纸",
    "settings.downloadWallpaper": "下载壁纸",
    "settings.changeWallpaper.bing": "必应壁纸按日更新，无法手动刷新。",
    "settings.changeWallpaper.local": "本地壁纸请通过导入新图片进行更换。",
    "settings.language": "语言",
    "popup.title": "API 密钥",
    "popup.subtitle": "通过扩展图标在本地保存你的密钥。",
    "popup.weatherKey": "OpenWeatherMap",
    "popup.pexelsKey": "Pexels",
    "popup.imgbbKey": "imgbb",
    "popup.reset": "重置",
    "popup.save": "保存",
    "popup.loaded": "已加载当前密钥。",
    "popup.saved": "API 密钥已保存。",
    "popup.resetDone": "API 密钥已清空。",
    "popup.loadFailed": "加载 API 密钥失败。",
    "popup.saveFailed": "保存 API 密钥失败。",
    "app.uploading": "正在上传图片...",
    "app.uploadFailed": "图片上传失败，请重试。",
    "bg.loadFailed": "加载新壁纸失败，请稍后重试。",
    "bg.invalidImage": "请选择有效的图片文件。",
    "bg.importFailed": "导入壁纸失败，请重试。",
    "bg.localMissing": "没有找到本地壁纸，请先导入一张。",
    "bg.noWallpaper": "没有可下载的壁纸。请等待壁纸加载完成。",
    "bg.extractFailed": "无法提取壁纸链接。",
    "bg.downloadFailed": "下载壁纸失败，请稍后重试。",
    "weather.awaiting": "等待数据",
    "weather.geoError": "定位错误：",
    "search.imgbbRequired": " 图片搜索需要 imgbb API 密钥来托管图片。请通过扩展图标打开的页面添加。"
  }
};

let currentLang = localStorage.getItem('language') || (navigator.language.startsWith('zh') ? 'zh' : 'en');

function t(key) {
  return TRANSLATIONS[currentLang][key] || key;
}

function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateUI();
    if (typeof updateChangeWallpaperButtonState === 'function') {
      updateChangeWallpaperButtonState();
    }
    // Dispatch event for other scripts to react if needed
    window.dispatchEvent(new Event('languageChanged'));
  }
}

function updateUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    
    // INPUT elements with placeholder
    if (el.tagName === 'INPUT') {
      el.placeholder = translation;
    }
    // Elements that need aria-label update
    else if (key.endsWith('.aria')) {
      el.setAttribute('aria-label', translation);
      if (el.hasAttribute('title')) el.title = translation;
    } 
    // Elements that need title update
    else if (key.endsWith('.title') && el.hasAttribute('title')) {
       el.title = translation;
    } 
    // Default: update textContent (labels, buttons, etc)
    else {
       el.textContent = translation;
    }
  });
}

// Initialize UI on DOMContentLoaded
document.addEventListener('DOMContentLoaded', updateUI);
