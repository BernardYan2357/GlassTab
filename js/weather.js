// ============================================================
// weather.js — 天气、预报、城市切换、天气开关
// ============================================================

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

function getWeatherEmoji(condition) {
  if (condition.includes("clear")) return "☀";
  if (condition.includes("rain")) return "🌧";
  if (condition.includes("cloud")) return "☁";
  if (condition.includes("snow")) return "❄";
  if (condition.includes("thunder")) return "⚡";
  return "☁";
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
    forecastList.innerHTML = "";

    const dailyData = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = item;
      } else {
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
      const condition = item.weather[0].main.toLowerCase();
      const icon = getWeatherEmoji(condition);
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
    const wind = data.wind?.speed;
    const rain = data.rain?.["1h"] || 0;
    const fetchedCity = data.name || queryCity;

    currentCity = fetchedCity;
    weatherTemp.textContent = formatTemp(temp);
    weatherCity.textContent = fetchedCity;
    weatherDesc.textContent = desc;
    weatherBig.textContent = formatTemp(temp);

    document.getElementById("weatherCityName").textContent = fetchedCity;
    document.getElementById("weatherFeels").textContent = formatTemp(feels);
    document.getElementById("weatherRain").textContent = `${rain.toFixed(1)} mm`;
    document.getElementById("weatherWind").textContent = `${Math.round(wind * 3.6)} km/h`;

    const weatherEmoji = temp >= 28 ? "☀" : "☁";
    document.getElementById("weatherIconLarge").textContent = weatherEmoji;
    document.getElementById("weatherIconHuge").textContent = weatherEmoji;
    weatherIcon.textContent = weatherEmoji;
    weatherNote.style.display = "none";

    fetchForecast(fetchedCity, coords);

  } catch (error) {
    console.error("Weather fetch error:", error);
    setWeatherFallback();
  }
}

function showModal() {
  weatherModal.classList.add("show");
  weatherModal.setAttribute("aria-hidden", "false");
}

function hideModal() {
  weatherModal.classList.remove("show");
  weatherModal.setAttribute("aria-hidden", "true");
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

  // [BUG FIX] 原代码: !x === false 逻辑混乱，简化为清晰表达
  if (enabled && weatherTemp.textContent.includes('--')) {
    getGeolocation();
  }
}

function initWeatherToggle() {
  const saved = localStorage.getItem('weatherEnabled');
  const enabled = saved !== 'off';
  setWeatherEnabled(enabled);
}
