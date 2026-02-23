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
