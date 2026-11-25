// ============================================================
// constants.js — 全局配置、DOM 引用、共享状态
// ============================================================

const CONFIG = window.GlassTabConfig = Object.assign({
  defaultBackground: "assets/default_background.jpg",
  imgbbApiKey: "",
  pexelsApiKey: "",
  engines: [
    {
      name: "Bing",
      icon: "assets/search-engines/bing.svg",
      url: "https://www.bing.com/search?q="
    },
    {
      name: "Google",
      icon: "assets/search-engines/google.svg",
      url: "https://www.google.com/search?q=",
      imageSearchUrl: "https://lens.google.com/uploadbyurl?url=",
      supportsUrlSearch: true
    },
    {
      name: "DuckDuckGo",
      icon: "assets/search-engines/duckduckgo.svg",
      url: "https://duckduckgo.com/?q="
    },
    {
      name: "Yandex",
      icon: "assets/search-engines/yandex.svg",
      url: "https://yandex.com/search/?text=",
      imageSearchUrl: "https://yandex.ru/images/search?rpt=imageview&url=",
      supportsUrlSearch: true
    },
    {
      name: "TinEye",
      icon: "assets/search-engines/tineye.svg",
      url: "https://tineye.com/search/?url=",
      imageSearchUrl: "https://tineye.com/search/?url=",
      supportsUrlSearch: true
    }
  ]
}, window.GlassTabConfig || {});

// DOM 元素引用
const timeEl = document.getElementById("time");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const engineBtn = document.getElementById("engineBtn");
const engineBadge = document.getElementById("engineBadge");

const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const timeFormatToggle = document.getElementById("timeFormatToggle");
const wallpaperSourceToggle = document.getElementById("wallpaperSourceToggle");
const changeWallpaperBtn = document.getElementById("changeWallpaper");
const importWallpaperBtn = document.getElementById("importWallpaperBtn");
const downloadWallpaperBtn = document.getElementById("downloadWallpaper");
const localWallpaperInput = document.getElementById("localWallpaperInput");

const searchEngineToggle = document.getElementById('searchEngineToggle');
const imageEngineToggle = document.getElementById('imageEngineToggle');

// 共享状态
let currentEngine = 0;
let currentImageEngine = 'Google'; // 默认图搜引擎名
let currentWallpaperSource = localStorage.getItem('wallpaperSource') || 'pexels';
let currentLocalWallpaperObjectUrl = null;
let pastedImageFile = null;
let isChangingWallpaper = false; // 防止重复点击
