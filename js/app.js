// ============================================================
// app.js — 初始化 + 事件绑定
// ============================================================

// 初始化壁纸
(async () => {
  try {
    await updateDailyBackground();
  } catch (error) {
    console.warn('Background update error, using default:', error);
  }
})();

// 初始化各模块
try {
  if (typeof updateUI === 'function') updateUI();
} catch (e) { console.error(e); }

initTimeFormat();
initLanguageToggle();
initWallpaperSource();
initWeatherToggle();

// 时钟
updateClock();
setInterval(updateClock, 1000);

// 搜索引擎 & 图搜引擎
initDefaultSearchEngine();
initDefaultImageEngine();

// 天气定时刷新
if (localStorage.getItem('weatherEnabled') !== 'off') {
  getGeolocation();
  setInterval(() => fetchWeather(null, currentCoords), 1000 * 60 * 10);
}

// ---- 事件绑定 ----

// 搜索引擎切换
engineBtn.addEventListener("click", cycleEngine);

// 粘贴图片
searchInput.addEventListener('paste', (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      pastedImageFile = blob;

      const reader = new FileReader();
      reader.onload = (event) => {
        document.getElementById('imagePreview').src = event.target.result;
        document.getElementById('imagePreviewContainer').style.display = 'flex';
      };
      reader.readAsDataURL(blob);

      // 粘贴图片时切换为图搜引擎
      setEngineByName(currentImageEngine);
      e.preventDefault();
      break;
    }
  }
});

// 移除粘贴的图片
document.getElementById('removeImageBtn').addEventListener('click', () => {
  pastedImageFile = null;
  document.getElementById('imagePreviewContainer').style.display = 'none';
  document.getElementById('imagePreview').src = '';
  searchInput.placeholder = t("search.placeholder");
  // 恢复默认搜索引擎
  const savedEngine = localStorage.getItem('defaultSearchEngine') || 'Bing';
  setEngineByName(savedEngine);
});

// 搜索表单提交
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const engine = CONFIG.engines[currentEngine];

  if (pastedImageFile) {
    // 使用设置中的默认图搜引擎
    const imgEngine = CONFIG.engines.find(eng => eng.name === currentImageEngine);

    if (isImgbbAvailable() && imgEngine && imgEngine.supportsUrlSearch) {
      // ---- 有 imgbb：上传获取公网 URL，用 URL 搜索 ----
      searchInput.placeholder = t("app.uploading");
      searchInput.disabled = true;

      const imageUrl = await uploadImageToImgbb(pastedImageFile);

      searchInput.disabled = false;
      searchInput.placeholder = t("search.placeholder");

      if (!imageUrl) {
        alert(t("app.uploadFailed"));
        return;
      }

      window.open(imgEngine.imageSearchUrl + encodeURIComponent(imageUrl), "_blank");
    } else {
      // ---- 无 imgbb：降级处理 ----
      if (currentImageEngine === 'Google') {
        searchGoogleLensDirect(pastedImageFile);
      } else if (currentImageEngine === 'Yandex') {
        window.open('https://yandex.ru/images/', '_blank');
      } else if (currentImageEngine === 'TinEye') {
        window.open('https://tineye.com/', '_blank');
      } else {
        searchGoogleLensDirect(pastedImageFile);
      }
    }

    pastedImageFile = null;
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '';
    // 恢复默认搜索引擎
    const savedEngine = localStorage.getItem('defaultSearchEngine') || 'Bing';
    setEngineByName(savedEngine);
  } else if (query) {
    window.location.href = engine.url + encodeURIComponent(query);
  }
});

// 天气模态框
weatherChip.addEventListener("click", showModal);
closeModal.addEventListener("click", hideModal);
weatherModal.addEventListener("click", (event) => {
  if (event.target === weatherModal) {
    hideModal();
  }
});

// 城市输入
weatherCityName.addEventListener("click", showCityInput);
inlineCityInput.addEventListener("blur", hideCityInput);
inlineCityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    updateCityFromInput();
  }
});

// ESC 键关闭
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideModal();
    if (settingsMenu.style.display !== 'none') {
      toggleSettings();
    }
    if (inlineCityInput.style.display !== 'none') {
      hideCityInput();
    }
  }
});

// 设置面板
settingsBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleSettings();
});

timeFormatToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const option = event.target.closest('.toggle-option');
  if (option) {
    setTimeFormat(option.dataset.format);
  }
});

document.getElementById('languageToggle').addEventListener("click", (event) => {
  event.stopPropagation();
  const option = event.target.closest('.toggle-option');
  if (option) {
    const lang = option.dataset.lang;
    setLanguage(lang);
    const options = document.getElementById('languageToggle').querySelectorAll('.toggle-option');
    options.forEach(opt => {
      if (opt.dataset.lang === lang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }
});

wallpaperSourceToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const option = event.target.closest('.toggle-option');
  if (option) {
    setWallpaperSource(option.dataset.source);
  }
});

searchEngineToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const option = event.target.closest('.toggle-option');
  if (option) {
    setDefaultSearchEngine(option.dataset.engine);
  }
});

imageEngineToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const option = event.target.closest('.toggle-option');
  if (option) {
    setDefaultImageEngine(option.dataset.imgengine);
  }
});

document.getElementById('weatherToggle').addEventListener("click", (event) => {
  event.stopPropagation();
  const option = event.target.closest('.toggle-option');
  if (option) {
    setWeatherEnabled(option.dataset.weather === 'on');
  }
});

changeWallpaperBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  manualChangeWallpaper();
});

downloadWallpaperBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  downloadWallpaper();
});

// 点击设置菜单外部关闭
document.addEventListener("click", (event) => {
  if (!event.target.closest('.settings-container')) {
    if (settingsMenu.style.display !== 'none') {
      settingsMenu.style.display = 'none';
    }
  }
});
