# GlassTab

> A minimal Chrome new tab extension.

![GlassTab Preview](image/display.png)

## About

GlassTab redefines your new tab page with a frosted glass aesthetic. No clutter, no bloat — just time, search, and weather, Clean, calm.

## Features

### Minimal Clock
A large centered clock with support for both 24-hour and 12-hour formats.

### Multi-Engine Search
Built-in support for Bing, Google, DuckDuckGo, Yandex, and TinEye. Switch engines by clicking the icon on the right side of the search bar.

### Reverse Image Search
Paste an image directly into the search bar (Ctrl+V) to perform a reverse image search. The image is uploaded to a temporary host and forwarded to the selected engine. When using Bing or DuckDuckGo, GlassTab automatically switches to TinEye; Google and Yandex use their native image search.

### Daily Wallpaper
Three wallpaper sources to choose from:
- **Pexels** (default) — High-quality photos in categories like landscape, nature, and architecture, with photographer credit displayed in the bottom-left corner
- **Bing** — Bing's daily wallpaper
- **Picsum** — Random images

Supports manual refresh and wallpaper download.

### Weather
Automatically fetches current weather based on geolocation. Click to expand and view feels-like temperature, rainfall, wind speed, and a 5-day forecast. Manual city switching is supported.

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the project folder
5. Open a new tab to start using GlassTab

## Configuration

Edit the `CONFIG` object at the top of `main.js`:

| Key | Description |
|-----|-------------|
| `weatherApiKay` | OpenWeatherMap API Key |
| `imgbbApiKey` | imgbb API Key (for reverse image search) |
| `pexelsApiKey` | Pexels API Key |

## Credits

- Wallpapers from [Pexels](https://www.pexels.com), [Bing](https://www.bing.com), and [Lorem Picsum](https://picsum.photos)
- Weather data from [OpenWeatherMap](https://openweathermap.org)
- Image hosting for reverse search by [imgbb](https://imgbb.com)

## License

CC BY-NC 4.0 — Free to use and modify, but not for commercial purposes. See [LICENSE](LICENSE).
