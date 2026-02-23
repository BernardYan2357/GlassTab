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
const weatherMeta = document.getElementById("weatherMeta");
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

let currentEngine = 0;
let currentCity = "Suzhou";
let currentCoords = null;
let currentWallpaperSource = localStorage.getItem('wallpaperSource') || 'pexels';

// 背景管理
function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function getBackgroundFromStorage() {
  const stored = localStorage.getItem('dailyBackground');
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    return data.date === getTodayDateString() ? data.url : null;
  } catch {
    return null;
  }
}

function saveBackgroundToStorage(url, credit = null) {
  const data = {
    url,
    date: getTodayDateString(),
    credit
  };
  localStorage.setItem('dailyBackground', JSON.stringify(data));
}

function getCreditFromStorage() {
  const stored = localStorage.getItem('dailyBackground');
  if (!stored) return null;
  try {
    const data = JSON.parse(stored);
    return data.date === getTodayDateString() ? (data.credit || null) : null;
  } catch {
    return null;
  }
}

function updatePhotoCredit(credit) {
  const creditEl = document.getElementById('photoCredit');
  const creditText = document.getElementById('photoCreditText');
  const creditLink = document.getElementById('photoCreditLink');
  const creditSourceLink = document.getElementById('creditSourceLink');

  if (!credit) {
    creditEl.style.display = 'none';
    return;
  }

  creditText.textContent = credit.photographer;
  creditLink.href = credit.photographerUrl || '#';
  creditSourceLink.textContent = credit.source || 'Pexels';
  creditSourceLink.href = credit.sourceUrl || 'https://www.pexels.com';
  creditEl.style.display = 'flex';
}

async function fetchBackground(useRandom = false) {
  try {
    const source = currentWallpaperSource;
    const seed = useRandom ? Date.now() : getTodayDateString();
    
    if (source === 'bing') {
      // 使用 Bing 壁纸 API
      const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US');
      if (!response.ok) throw new Error('Bing API error');
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        return {
          url: `https://www.bing.com${data.images[0].url}`,
          credit: {
            photographer: data.images[0].copyright || 'Bing',
            photographerUrl: `https://www.bing.com${data.images[0].copyrightlink || ''}`,
            source: 'Bing',
            sourceUrl: 'https://www.bing.com'
          }
        };
      }
      return null;
    } else if (source === 'pexels') {
      // 使用 Pexels API
      const queries = ['landscape', 'nature', 'architecture', 'city', 'mountain', 'ocean', 'forest', 'sunset'];
      const query = queries[Math.floor((useRandom ? Math.random() * queries.length : new Date().getDate()) % queries.length)];
      const page = useRandom ? Math.floor(Math.random() * 10) + 1 : 1;

      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&orientation=landscape&size=large&per_page=15&page=${page}`,
        { headers: { Authorization: CONFIG.pexelsApiKey } }
      );
      if (!response.ok) throw new Error('Pexels API error');
      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        const index = useRandom
          ? Math.floor(Math.random() * data.photos.length)
          : new Date().getDate() % data.photos.length;
        const photo = data.photos[index];
        return {
          url: photo.src.landscape || photo.src.original,
          credit: {
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            source: 'Pexels',
            sourceUrl: photo.url
          }
        };
      }
      return null;
    } else {
      // 默认使用 Lorem Picsum
      const width = 1920;
      const height = 1080;
      const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;

      // 尝试获取 Picsum 图片的作者信息
      try {
        const headResp = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        const finalUrl = headResp.url; // 重定向后的真实 URL，如 https://fastly.picsum.photos/id/123/...
        const idMatch = finalUrl.match(/\/id\/(\d+)\//);
        if (idMatch) {
          const infoResp = await fetch(`https://picsum.photos/id/${idMatch[1]}/info`);
          if (infoResp.ok) {
            const info = await infoResp.json();
            return {
              url,
              credit: {
                photographer: info.author,
                photographerUrl: info.url,
                source: 'Picsum',
                sourceUrl: `https://picsum.photos`
              }
            };
          }
        }
      } catch (e) {
        console.warn('Failed to fetch Picsum author info:', e);
      }

      return { url, credit: null };
    }
  } catch (error) {
    console.error('Failed to generate background URL:', error);
    return null;
  }
}

function testImageLoad(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function updateDailyBackground() {
  const bgElement = document.querySelector('.bg');
  
  // 检查缓存
  let backgroundUrl = getBackgroundFromStorage();
  let credit = getCreditFromStorage();
  
  if (!backgroundUrl) {
    // 今天还没有背景，尝试获取新的
    const result = await fetchBackground();
    
    if (result) {
      // 测试图片是否能加载
      try {
        const loaded = await testImageLoad(result.url);
        if (loaded) {
          saveBackgroundToStorage(result.url, result.credit);
          bgElement.style.backgroundImage = `url("${result.url}")`;
          updatePhotoCredit(result.credit);
        } else {
          console.warn('Failed to load background image, keeping default');
          updatePhotoCredit(null);
        }
      } catch (error) {
        console.warn('Error loading background, keeping default:', error);
        updatePhotoCredit(null);
      }
    } else {
      console.warn('Failed to fetch background URL, keeping default');
      updatePhotoCredit(null);
    }
  } else {
    // 使用缓存的背景
    bgElement.style.backgroundImage = `url("${backgroundUrl}")`;
    updatePhotoCredit(credit);
  }
}

function updateClock() {
  const now = new Date();
  const use24Hour = localStorage.getItem('timeFormat') !== '12';
  
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  
  if (use24Hour) {
    hours = String(hours).padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}`;
  } else {
    hours = hours % 12 || 12;
    timeEl.textContent = `${hours}:${minutes}`;
  }
}

function toggleSettings() {
  const isVisible = settingsMenu.style.display !== 'none';
  settingsMenu.style.display = isVisible ? 'none' : 'flex';
}

function setTimeFormat(format) {
  localStorage.setItem('timeFormat', format);
  // 更新切换按钮状态
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
  // 更新切换按钮状态
  const options = wallpaperSourceToggle.querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if (opt.dataset.source === source) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  updateChangeWallpaperButtonState();
  // 清除缓存的壁纸以便重新获取
  localStorage.removeItem('dailyBackground');
  // 立即更新壁纸
  updateDailyBackground();
}

function initWallpaperSource() {
  const savedSource = localStorage.getItem('wallpaperSource') || 'pexels';
  currentWallpaperSource = savedSource;
  // 更新切换按钮状态（不立即改变壁纸）
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

async function manualChangeWallpaper() {
  if (currentWallpaperSource === 'bing') return;

  if (currentWallpaperSource === 'pexels') {
    const result = await fetchBackground(true);
    if (result) {
      const loaded = await testImageLoad(result.url);
      if (loaded) {
        saveBackgroundToStorage(result.url, result.credit);
        document.querySelector('.bg').style.backgroundImage = `url("${result.url}")`;
        updatePhotoCredit(result.credit);
      } else {
        alert('Failed to load new wallpaper. Please try again later.');
      }
    }
    toggleSettings();
    return;
  }

  // Picsum
  const width = 1920;
  const height = 1080;
  const seed = Date.now();
  const backgroundUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  if (backgroundUrl) {
    const loaded = await testImageLoad(backgroundUrl);
    if (loaded) {
      saveBackgroundToStorage(backgroundUrl, null);
      document.querySelector('.bg').style.backgroundImage = `url("${backgroundUrl}")`;
      updatePhotoCredit(null);
    } else {
      console.warn('Failed to load background image');
      alert('Failed to load new wallpaper. Please try again later.');
    }
  } else {
    console.warn('Failed to fetch background image');
    alert('Failed to load new wallpaper. Please try again later.');
  }
  toggleSettings();
}

async function downloadWallpaper() {
  try {
    const bgElement = document.querySelector('.bg');
    const bgImageUrl = bgElement.style.backgroundImage;
    if (!bgImageUrl || bgImageUrl === 'none') {
      alert('No wallpaper to download. Please wait for the wallpaper to load.');
      return;
    }
    // 提取 URL 从 url("...") 格式
    const urlMatch = bgImageUrl.match(/url\(["']?([^"'()]+)["']?\)/);
    if (!urlMatch || !urlMatch[1]) {
      alert('Unable to extract wallpaper URL.');
      return;
    }
    const imageUrl = urlMatch[1];
    // 使用 fetch 获取图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    // 创建下载链接
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `wallpaper-${new Date().toISOString().split('T')[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    toggleSettings();
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download wallpaper. Please try again later.');
  }
}

function setEngine(index) {
  currentEngine = index % CONFIG.engines.length;
  const engine = CONFIG.engines[currentEngine];
  engineBadge.src = engine.icon;
  engineBadge.alt = engine.name;
  engineBtn.title = engine.name;
}

function cycleEngine() {
  setEngine(currentEngine + 1);
}

function showModal() {
  weatherModal.classList.add("show");
  weatherModal.setAttribute("aria-hidden", "false");
}

function hideModal() {
  weatherModal.classList.remove("show");
  weatherModal.setAttribute("aria-hidden", "true");
}

function formatTemp(value) {
  if (typeof value !== "number") {
    return "--\u00b0";
  }
  return `${Math.round(value)}\u00b0`;
}

function setWeatherFallback() {
  weatherTemp.textContent = "--°";
  weatherCity.textContent = currentCity;
  weatherDesc.textContent = "Awaiting data";
  weatherBig.textContent = "--°";
  weatherMeta.textContent = "--";
  weatherIcon.textContent = "☁";
  weatherNote.style.display = "block";
}

function buildWeatherUrl(city) {
  const params = new URLSearchParams({
    q: city,
    units: CONFIG.units,
    appid: CONFIG.weatherApiKey,
    lang: "zh_cn"
  });
  return `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;
}

function buildWeatherUrlByCoords(lat, lon) {
  const params = new URLSearchParams({
    lat,
    lon,
    units: CONFIG.units,
    appid: CONFIG.weatherApiKey,
    lang: "zh_cn"
  });
  return `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;
}

function buildForecastUrl(city) {
  const params = new URLSearchParams({
    q: city,
    units: CONFIG.units,
    appid: CONFIG.weatherApiKey,
    cnt: 40,
    lang: "zh_cn"
  });
  return `https://api.openweathermap.org/data/2.5/forecast?${params.toString()}`;
}

function buildForecastUrlByCoords(lat, lon) {
  const params = new URLSearchParams({
    lat,
    lon,
    units: CONFIG.units,
    appid: CONFIG.weatherApiKey,
    cnt: 40,
    lang: "zh_cn"
  });
  return `https://api.openweathermap.org/data/2.5/forecast?${params.toString()}`;
}

async function fetchForecast(city = null, coords = null) {
  if (!CONFIG.weatherApiKey || CONFIG.weatherApiKey.includes("YOUR_")) return;

  let url;
  if (coords?.lat && coords?.lon) {
    url = buildForecastUrlByCoords(coords.lat, coords.lon);
  } else {
    url = buildForecastUrl(city || currentCity);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast request failed");
    const data = await response.json();
    
    const forecastList = document.getElementById("weatherForecast");
    forecastList.innerHTML = ""; // Clear old data

    // Filter to get roughly one forecast per day (every 8th item, as API returns 3-hour steps)
    // Or just show next 24h? User asked for "future 5 days weather".
    // 5-day forecast includes 40 items (3-hour intervals).
    // Let's pick one data point per day (e.g., at noon)
    
    const dailyData = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = item;
      } else {
        // Prefer noon data if available
        const currentHour = new Date(item.dt * 1000).getHours();
        const storedHour = new Date(dailyData[date].dt * 1000).getHours();
        if (Math.abs(currentHour - 12) < Math.abs(storedHour - 12)) {
          dailyData[date] = item;
        }
      }
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b)).slice(0, 5);

    sortedDates.forEach(date => {
      const item = dailyData[date];
      const temp = Math.round(item.main.temp);
      const iconCode = item.weather[0].icon; // e.g., "10d"
      // Map icon codes to emojis or simple text if we don't have images
      // Simple mapping based on condition id or description
      const condition = item.weather[0].main.toLowerCase();
      let icon = "☁";
      if (condition.includes("clear")) icon = "☀";
      else if (condition.includes("rain")) icon = "🌧";
      else if (condition.includes("cloud")) icon = "☁";
      else if (condition.includes("snow")) icon = "❄";
      else if (condition.includes("thunder")) icon = "⚡";

      const dayName = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });

      const el = document.createElement("div");
      el.className = "forecast-item";
      el.innerHTML = `
        <span class="forecast-time">${dayName}</span>
        <span class="forecast-icon">${icon}</span>
        <span class="forecast-temp">${temp}°</span>
      `;
      forecastList.appendChild(el);
    });

  } catch (error) {
    console.error("Forecast fetch error:", error);
  }
}

async function fetchWeather(city = null, coords = null) {
  if (!CONFIG.weatherApiKey || CONFIG.weatherApiKey.includes("YOUR_")) {
    setWeatherFallback();
    return;
  }

  let url;
  let queryCity = city || currentCity;

  if (coords?.lat && coords?.lon) {
    url = buildWeatherUrlByCoords(coords.lat, coords.lon);
  } else {
    url = buildWeatherUrl(queryCity);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather request failed");
    }
    const data = await response.json();
    const temp = data.main?.temp;
    const desc = data.weather?.[0]?.description ?? "--";
    const feels = data.main?.feels_like;
    const humidity = data.main?.humidity;
    const wind = data.wind?.speed;
    const rain = data.rain?.["1h"] || 0;
    const fetchedCity = data.name || queryCity;

    currentCity = fetchedCity;
    weatherTemp.textContent = formatTemp(temp);
    weatherCity.textContent = fetchedCity;
    weatherDesc.textContent = desc;
    weatherBig.textContent = formatTemp(temp);
    
    // 更新详情窗口的新元素
    document.getElementById("weatherCityName").textContent = fetchedCity;
    document.getElementById("weatherFeels").textContent = formatTemp(feels);
    document.getElementById("weatherRain").textContent = `${rain.toFixed(1)} mm`;
    document.getElementById("weatherWind").textContent = `${Math.round(wind * 3.6)} km/h`;
    document.getElementById("weatherIconLarge").textContent = temp >= 28 ? "☀" : "☁";
    document.getElementById("weatherIconHuge").textContent = temp >= 28 ? "☀" : "☁";
    
    weatherIcon.textContent = temp >= 28 ? "☀" : "☁";
    weatherNote.style.display = "none";

    // Fetch forecast after successful weather fetch
    fetchForecast(fetchedCity, coords);

  } catch (error) {
    console.error("Weather fetch error:", error);
    setWeatherFallback();
  }
}

function showCityInput() {
  weatherCityName.style.display = "none";
  inlineCityInput.style.display = "inline-block";
  inlineCityInput.value = currentCity;
  inlineCityInput.focus();
}

function hideCityInput() {
  inlineCityInput.style.display = "none";
  weatherCityName.style.display = "inline";
}

function updateCityFromInput() {
  const query = inlineCityInput.value.trim();
  if (query) {
    // 清除坐标，使用城市名查询
    currentCoords = null;
    fetchWeather(query);
  }
  hideCityInput();
}

function getGeolocation() {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported");
    fetchWeather();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentCoords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      fetchWeather(null, currentCoords);
    },
    (error) => {
      console.warn("Geolocation error:", error);
      fetchWeather();
    }
  );
}

// 天气开关
function setWeatherEnabled(enabled) {
  localStorage.setItem('weatherEnabled', enabled ? 'on' : 'off');
  const chip = document.getElementById('weatherChip');
  chip.style.display = enabled ? 'inline-flex' : 'none';

  const options = document.getElementById('weatherToggle').querySelectorAll('.toggle-option');
  options.forEach(opt => {
    if ((opt.dataset.weather === 'on') === enabled) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  if (enabled && !weatherTemp.textContent.includes('--') === false) {
    getGeolocation();
  }
}

function initWeatherToggle() {
  const saved = localStorage.getItem('weatherEnabled');
  const enabled = saved !== 'off';
  setWeatherEnabled(enabled);
}

// 初始化
(async () => {
  // 不需要提前设置默认背景，CSS 已经定义了
  // 异步获取最新的壁纸（如果网络可用）
  try {
    await updateDailyBackground();
  } catch (error) {
    console.warn('Background update error, using default:', error);
    // 保持 CSS 中的默认背景
  }
})();

initTimeFormat();
initWallpaperSource();
initWeatherToggle();

updateClock();
setInterval(updateClock, 1000);
setEngine(0);

if (localStorage.getItem('weatherEnabled') !== 'off') {
  getGeolocation();
  setInterval(() => fetchWeather(null, currentCoords), 1000 * 60 * 10);
}

engineBtn.addEventListener("click", cycleEngine);

let pastedImageFile = null;

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
        const tineyeIndex = CONFIG.engines.findIndex(e => e.name === 'TinEye');
        if (tineyeIndex !== -1) {
          setEngine(tineyeIndex);
        }
      }
      e.preventDefault();
      break;
    }
  }
});

document.getElementById('removeImageBtn').addEventListener('click', () => {
  pastedImageFile = null;
  document.getElementById('imagePreviewContainer').style.display = 'none';
  document.getElementById('imagePreview').src = '';
  searchInput.placeholder = "Search, text and image";
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const engine = CONFIG.engines[currentEngine];

  if (pastedImageFile) {
    // 以图搜图模式
    // 显示上传中提示
    searchInput.placeholder = "Uploading image...";
    searchInput.disabled = true;

    const imageUrl = await uploadImageToImgbb(pastedImageFile);

    searchInput.disabled = false;
    searchInput.placeholder = "Search, text and image";

    if (!imageUrl) {
      alert("Image upload failed, please try again.");
      return;
    }

    // 使用 URL 方式调用搜索引擎
    if (engine.supportsUrlSearch && engine.imageSearchUrl) {
      window.open(engine.imageSearchUrl + encodeURIComponent(imageUrl), "_blank");
    } else {
      // Bing / DuckDuckGo 等不支持以图搜图的引擎，fallback 到 TinEye
      const tineye = CONFIG.engines.find(e => e.name === "TinEye");
      if (tineye) {
        window.open(tineye.imageSearchUrl + encodeURIComponent(imageUrl), "_blank");
      }
    }

    // 清除已粘贴的图片
    pastedImageFile = null;
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '';
  } else if (query) {
    window.location.href = engine.url + encodeURIComponent(query);
  }
});

weatherChip.addEventListener("click", showModal);
closeModal.addEventListener("click", hideModal);
weatherModal.addEventListener("click", (event) => {
  if (event.target === weatherModal) {
    hideModal();
  }
});

weatherCityName.addEventListener("click", showCityInput);
inlineCityInput.addEventListener("blur", hideCityInput);
inlineCityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    updateCityFromInput();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideModal();
    if (settingsMenu.style.display !== 'none') {
      toggleSettings();
    }
    // 如果正在输入城市，也退出输入模式
    if (inlineCityInput.style.display !== 'none') {
      hideCityInput();
    }
  }
});

// 设置相关事件监听器
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

// 图片上传到 imgbb 临时图床，获取公开 URL
async function uploadImageToImgbb(file) {
  const apiKey = CONFIG.imgbbApiKey;
  if (!apiKey || apiKey.includes("YOUR_")) {
    alert("Please set your imgbb API Key in config.js (free: https://api.imgbb.com/)");
    return null;
  }

  const formData = new FormData();
  // imgbb 要求 base64 或 file
  const base64 = await fileToBase64(file);
  formData.append("key", apiKey);
  formData.append("image", base64);
  formData.append("expiration", 600); // 10分钟后自动过期

  try {
    const resp = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData
    });
    const data = await resp.json();
    if (data.success) {
      return data.data.url;
    } else {
      console.error("imgbb upload failed:", data);
      return null;
    }
  } catch (e) {
    console.error("imgbb upload error:", e);
    return null;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // 去掉 data:image/png;base64, 前缀
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 点击设置菜单外部关闭菜单
document.addEventListener("click", (event) => {
  if (!event.target.closest('.settings-container')) {
    if (settingsMenu.style.display !== 'none') {
      settingsMenu.style.display = 'none';
    }
  }
});
