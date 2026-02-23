// ============================================================
// constants.js — 全局配置、DOM 引用、共享状态
// ============================================================

const CONFIG = {
  weatherApiKey: (typeof API_KEYS !== 'undefined' && API_KEYS.openWeatherMap) || "",
  units: "metric",
  defaultBackground: "assets/default_background.jpg",
  imgbbApiKey: (typeof API_KEYS !== 'undefined' && API_KEYS.imgbb) || "",
  pexelsApiKey: (typeof API_KEYS !== 'undefined' && API_KEYS.pexels) || "",
  engines: [
    {
      name: "Bing",
      icon: "assets/Bing.ico",
      url: "https://www.bing.com/search?q="
    },
    {
      name: "Google",
      icon: "assets/Google.ico",
      url: "https://www.google.com/search?q=",
      imageSearchUrl: "https://lens.google.com/uploadbyurl?url=",
      supportsUrlSearch: true
    },
    {
      name: "DuckDuckGo",
      icon: "assets/DuckDuckGo.ico",
      url: "https://duckduckgo.com/?q="
    },
    {
      name: "Yandex",
      icon: "assets/Yandex.ico",
      url: "https://yandex.com/search/?text=",
      imageSearchUrl: "https://yandex.com/images/search?rpt=imageview&url=",
      supportsUrlSearch: true
    },
    {
      name: "TinEye",
      icon: "assets/Tineye.ico",
      url: "https://tineye.com/search/?url=",
      imageSearchUrl: "https://tineye.com/search/?url=",
      supportsUrlSearch: true
    }
  ]
};

// DOM 元素引用
const timeEl = document.getElementById("time");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const engineBtn = document.getElementById("engineBtn");
const engineBadge = document.getElementById("engineBadge");

const weatherChip = document.getElementById("weatherChip");
const weatherIcon = document.getElementById("weatherIcon");
const weatherTemp = document.getElementById("weatherTemp");
const weatherCity = document.getElementById("weatherCity");
const weatherModal = document.getElementById("weatherModal");
const weatherDesc = document.getElementById("weatherDesc");
const weatherBig = document.getElementById("weatherBig");
const weatherNote = document.getElementById("weatherNote");
const weatherCityName = document.getElementById("weatherCityName");
const inlineCityInput = document.getElementById("inlineCityInput");
const closeModal = document.getElementById("closeModal");
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const timeFormatToggle = document.getElementById("timeFormatToggle");
const wallpaperSourceToggle = document.getElementById("wallpaperSourceToggle");
const changeWallpaperBtn = document.getElementById("changeWallpaper");
const downloadWallpaperBtn = document.getElementById("downloadWallpaper");

// 共享状态
let currentEngine = 0;
let currentCity = "Suzhou";
let currentCoords = null;
let currentWallpaperSource = localStorage.getItem('wallpaperSource') || 'pexels';
let pastedImageFile = null;
let isChangingWallpaper = false; // 防止重复点击
