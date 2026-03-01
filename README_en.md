# <img src="image/icon.png" alt="GlassTab" style="width: 32px; height: 32px;"> GlassTab

<div align="center">
A minimal Chrome new tab extension
  
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![CC BY-NC 4.0](https://img.shields.io/badge/CC%20BY--NC%204.0-lightgrey?style=for-the-badge&logo=creativecommons)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Version](https://img.shields.io/badge/Version-1.2.1-blue.svg?style=for-the-badge)](https://github.com/BernardYan2357/GlassTab/releases)
</div>

![GlassTab Preview](image/display.png)

Chinese version: [README.md](README.md)

## About

GlassTab redefines Edge new tab page with a frosted glass aesthetic. No clutter, no bloat — just time, search, and weather. Clean, calm.

## Features

### Minimal Clock

A large centered clock with support for both 24-hour and 12-hour formats.

### Multi-Engine Search

Built-in support for Bing, Google, DuckDuckGo, Yandex, and TinEye. The search bar displays the current engine icon on the right; click to cycle through engines. You can also set a default search engine in Settings.

### Reverse Image Search

Paste an image directly into the search bar (Ctrl+V). The search engine automatically switches to the default image search engine (Google Lens by default) for reverse image lookup.

You can choose your default image search engine in Settings.

### Daily Wallpaper

Three wallpaper sources to choose from:
- **Pexels** (default) — High-quality photos in categories like landscape, nature, and architecture, with photographer credit displayed in the bottom-left corner
- **Bing** — Bing's daily wallpaper
- **Picsum** — Random images

Supports manual refresh and wallpaper download.

### Weather

Automatically fetches current weather based on geolocation. Click to expand and view feels-like temperature, rainfall, wind speed, and a 5-day forecast. Manual city switching is supported. Weather display can be toggled in Settings.

### Settings Panel

Click the settings gear icon in the bottom-left corner to configure:
- **Bilingual Support** — Chinese / English
- **Time Format** — 24-hour / 12-hour
- **Weather** — On / Off
- **Default Search Engine** — Bing / Google / DuckDuckGo / Yandex (shown as icons)
- **Default Image Search Engine** — Google / Yandex / TinEye (shown as icons; selecting Yandex or TinEye without imgbb key will show a reminder)
- **Wallpaper Source** — Picsum / Bing / Pexels
- **Change Wallpaper** — Refresh with a random wallpaper (Bing's is fixed daily)
- **Download** — Save current wallpaper to disk

## Installation

1. Download or clone this repository from the Release page;
2. Open Chrome and navigate to `chrome://extensions/`;
3. Enable "Developer mode" in the top-right corner;
4. Click "Load unpacked" and select the project folder;
5. (Optional) Configure API keys, see below;
6. Enjoy your new tab page!

## Configuration

1. Copy `config.example.js` in the `GlassTab` directory to `config.js`
2. Fill in your API keys:

| Key | Description | Get it from | Required? |
|-----|----------|-------------|-------------|
| `openWeatherMap` | OpenWeatherMap API Key. Without it, temperature shows as -- and can be toggled off in Settings | [openweathermap.org](https://openweathermap.org/api) | Optional, can be left blank to disable weather |
| `pexels` | Pexels API Key. Without it, the default background is used; switch to Bing or Picsum for daily wallpapers | [pexels.com/api](https://www.pexels.com/api/) | Optional, can be left blank to use default background and disable daily wallpapers |
| `imgbb` | imgbb API Key for image hosting. Without it, reverse image search gracefully degrades: Google → direct form upload; Yandex/TinEye → redirects to their websites for manual upload | [api.imgbb.com](https://api.imgbb.com/) | Optional, if you don't config, use Google for reverse image search and enable manual upload for Yandex/TinEye |

## Credits

- Wallpapers from [Pexels](https://www.pexels.com), [Bing](https://www.bing.com), and [Lorem Picsum](https://picsum.photos).
- Weather data from [OpenWeatherMap](https://openweathermap.org).
- Image hosting for reverse search by [imgbb](https://imgbb.com).

## License

CC BY-NC 4.0 — Free to use and modify, but not for commercial purposes. See [LICENSE](LICENSE).
