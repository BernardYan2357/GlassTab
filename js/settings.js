// ============================================================
// settings.js — 设置面板（时间格式、壁纸源、UI 切换）
// ============================================================

function toggleSettings() {
  const isVisible = settingsMenu.style.display !== 'none';
  settingsMenu.style.display = isVisible ? 'none' : 'flex';
}

function setTimeFormat(format) {
  localStorage.setItem('timeFormat', format);
  const options = timeFormatToggle.querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if (opt.dataset.format === format) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
  updateClock();
}

function initTimeFormat() {
  const savedFormat = localStorage.getItem('timeFormat') || '24';
  setTimeFormat(savedFormat);
}

function updateChangeWallpaperButtonState() {
  if (currentWallpaperSource === 'bing') {
    changeWallpaperBtn.disabled = true;
    changeWallpaperBtn.title = "Bing wallpaper changes daily";
  } else {
    changeWallpaperBtn.disabled = false;
    changeWallpaperBtn.title = "";
  }
}

function setWallpaperSource(source) {
  currentWallpaperSource = source;
  localStorage.setItem('wallpaperSource', source);
  const options = wallpaperSourceToggle.querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if (opt.dataset.source === source) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  updateChangeWallpaperButtonState();
  localStorage.removeItem('dailyBackground');
  updateDailyBackground();
}

function initWallpaperSource() {
  const savedSource = localStorage.getItem('wallpaperSource') || 'pexels';
  currentWallpaperSource = savedSource;
  const options = wallpaperSourceToggle.querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if (opt.dataset.source === savedSource) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  updateChangeWallpaperButtonState();
}

// ---- 默认搜索引擎 ----
function setDefaultSearchEngine(name) {
  localStorage.setItem('defaultSearchEngine', name);
  setEngineByName(name);
  const options = searchEngineToggle.querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if (opt.dataset.engine === name) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}

function initDefaultSearchEngine() {
  const saved = localStorage.getItem('defaultSearchEngine') || 'Bing';
  setDefaultSearchEngine(saved);
}

// ---- 默认图搜引擎 ----
function setDefaultImageEngine(name) {
  // 选择 Yandex 或 TinEye 时，检查 imgbb API
  if ((name === 'Yandex' || name === 'TinEye') && !isImgbbAvailable()) {
    const confirmed = confirm(
      `${name} image search requires imgbb API key for image hosting.\n` +
      `Without it, you will be redirected to ${name} website to upload manually.\n\n` +
      `Continue with ${name}?`
    );
    if (!confirmed) return;
  }
  currentImageEngine = name;
  localStorage.setItem('defaultImageEngine', name);
  const options = imageEngineToggle.querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if (opt.dataset.imgengine === name) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}

function initDefaultImageEngine() {
  const saved = localStorage.getItem('defaultImageEngine') || 'Google';
  currentImageEngine = saved;
  const options = imageEngineToggle.querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if (opt.dataset.imgengine === saved) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}
