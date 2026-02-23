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
initTimeFormat();
initWallpaperSource();
initWeatherToggle();

// 时钟
updateClock();
setInterval(updateClock, 1000);

// 搜索引擎
setEngine(0);

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

      const currentEngineName = CONFIG.engines[currentEngine].name;
      if (currentEngineName === 'Bing' || currentEngineName === 'DuckDuckGo') {
        const tineyeIndex = CONFIG.engines.findIndex(eng => eng.name === 'TinEye');
        if (tineyeIndex !== -1) {
          setEngine(tineyeIndex);
        }
      }
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
  searchInput.placeholder = "Search, text and image";
});

// 搜索表单提交
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const engine = CONFIG.engines[currentEngine];

  if (pastedImageFile) {
    searchInput.placeholder = "Uploading image...";
    searchInput.disabled = true;

    const imageUrl = await uploadImageToImgbb(pastedImageFile);

    searchInput.disabled = false;
    searchInput.placeholder = "Search, text and image";

    if (!imageUrl) {
      alert("Image upload failed, please try again.");
      return;
    }

    if (engine.supportsUrlSearch && engine.imageSearchUrl) {
      window.open(engine.imageSearchUrl + encodeURIComponent(imageUrl), "_blank");
    } else {
      const tineye = CONFIG.engines.find(eng => eng.name === "TinEye");
      if (tineye) {
        window.open(tineye.imageSearchUrl + encodeURIComponent(imageUrl), "_blank");
      }
    }

    pastedImageFile = null;
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '';
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

wallpaperSourceToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const option = event.target.closest('.toggle-option');
  if (option) {
    setWallpaperSource(option.dataset.source);
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
