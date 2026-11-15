// ============================================================
// background.js — 壁纸管理（获取、缓存、切换、下载、credit）
// ============================================================

const LOCAL_WALLPAPER_DB_NAME = 'GlassTabWallpaper';
const LOCAL_WALLPAPER_STORE_NAME = 'wallpapers';
const LOCAL_WALLPAPER_RECORD_ID = 'current';
const BING_ORIGIN = 'https://www.bing.com';

function openLocalWallpaperDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(LOCAL_WALLPAPER_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LOCAL_WALLPAPER_STORE_NAME)) {
        db.createObjectStore(LOCAL_WALLPAPER_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open local wallpaper database'));
  });
}

async function saveLocalWallpaperToStorage(file) {
  const db = await openLocalWallpaperDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(LOCAL_WALLPAPER_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(LOCAL_WALLPAPER_STORE_NAME);
      store.put({
        id: LOCAL_WALLPAPER_RECORD_ID,
        blob: file,
        name: file.name || 'wallpaper',
        type: file.type || 'image/*',
        updatedAt: Date.now()
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Failed to store local wallpaper'));
      transaction.onabort = () => reject(transaction.error || new Error('Failed to store local wallpaper'));
    });
  } finally {
    db.close();
  }
}

async function getLocalWallpaperFromStorage() {
  const db = await openLocalWallpaperDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(LOCAL_WALLPAPER_STORE_NAME, 'readonly');
      const store = transaction.objectStore(LOCAL_WALLPAPER_STORE_NAME);
      const request = store.get(LOCAL_WALLPAPER_RECORD_ID);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Failed to read local wallpaper'));
      transaction.onerror = () => reject(transaction.error || new Error('Failed to read local wallpaper'));
    });
  } finally {
    db.close();
  }
}

function revokeCurrentLocalWallpaperUrl() {
  if (currentLocalWallpaperObjectUrl) {
    URL.revokeObjectURL(currentLocalWallpaperObjectUrl);
    currentLocalWallpaperObjectUrl = null;
  }
}

async function getCurrentLocalWallpaperUrl() {
  const record = await getLocalWallpaperFromStorage();

  if (!record || !record.blob) {
    revokeCurrentLocalWallpaperUrl();
    return null;
  }

  revokeCurrentLocalWallpaperUrl();
  currentLocalWallpaperObjectUrl = URL.createObjectURL(record.blob);
  return currentLocalWallpaperObjectUrl;
}

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

function resolveBingCreditUrl(link) {
  try {
    const path = (link || '').trim()
      // 兼容旧缓存中重复拼接了必应域名的链接。
      .replace(/^https:\/\/www\.bing\.com(?=https?:?\/\/)/i, '')
      .replace(/^(https?)\/\//i, '$1://');
    const url = new URL(path, BING_ORIGIN);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    // 无法解析时跳转到必应首页。
  }
  return BING_ORIGIN;
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
  creditLink.href = credit.source === 'Bing'
    ? resolveBingCreditUrl(credit.photographerUrl)
    : credit.photographerUrl || '#';
  creditSourceLink.textContent = credit.source || 'Pexels';
  creditSourceLink.href = credit.sourceUrl || 'https://www.pexels.com';
  creditEl.style.display = 'flex';
}

async function resolvePicsumFinalUrl(seedUrl) {
  try {
    const resp = await fetch(seedUrl, { method: "HEAD", redirect: "follow" });
    return resp.url || seedUrl;
  } catch {
    return seedUrl;
  }
}

async function getPicsumCreditFromUrl(finalUrl) {
  const match = finalUrl.match(/\/id\/(\d+)\//);
  if (!match) return null;
  const id = match[1];
  try {
    const infoResp = await fetch(`https://picsum.photos/id/${id}/info`);
    if (!infoResp.ok) return null;
    const info = await infoResp.json();
    return {
      photographer: info.author,
      photographerUrl: info.url,
      source: "Picsum",
      sourceUrl: info.url
    };
  } catch {
    return null;
  }
}

async function fetchBackground(useRandom = false) {
  try {
    const source = currentWallpaperSource;
    const seed = useRandom ? Date.now() : getTodayDateString();

    if (source === "bing") {
      const response = await fetch(`${BING_ORIGIN}/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US`);
      if (!response.ok) throw new Error('Bing API error');
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        return {
          url: `${BING_ORIGIN}${data.images[0].url}`,
          credit: {
            photographer: data.images[0].copyright || 'Bing',
            photographerUrl: resolveBingCreditUrl(data.images[0].copyrightlink),
            source: 'Bing',
            sourceUrl: BING_ORIGIN
          }
        };
      }
      return null;
    } else if (source === "pexels") {
      // Pexels API key 未配置时，直接返回 null（使用默认背景）
      if (!CONFIG.pexelsApiKey || CONFIG.pexelsApiKey.includes("YOUR_")) {
        return null;
      }
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
      // Picsum
      const width = 1920;
      const height = 1080;
      const seedUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      const finalUrl = await resolvePicsumFinalUrl(seedUrl);
      const credit = await getPicsumCreditFromUrl(finalUrl);
      return { url: finalUrl, credit };
    }
  } catch (error) {
    console.error("Failed to generate background URL:", error);
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

  if (currentWallpaperSource === 'local') {
    try {
      const localUrl = await getCurrentLocalWallpaperUrl();
      if (!localUrl) {
        console.warn('No local wallpaper stored');
        updatePhotoCredit(null);
        return;
      }

      const loaded = await testImageLoad(localUrl);
      if (loaded) {
        bgElement.style.backgroundImage = `url("${localUrl}")`;
      } else {
        console.warn('Failed to load local wallpaper image, keeping default');
      }
    } catch (error) {
      console.warn('Error loading local wallpaper, keeping default:', error);
    }

    updatePhotoCredit(null);
    return;
  }

  // 检查缓存
  let backgroundUrl = getBackgroundFromStorage();
  let credit = getCreditFromStorage();

  if (!backgroundUrl) {
    const result = await fetchBackground();

    if (result) {
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
    bgElement.style.backgroundImage = `url("${backgroundUrl}")`;
    updatePhotoCredit(credit);
  }
}

async function manualChangeWallpaper() {
  if (currentWallpaperSource === 'bing' || currentWallpaperSource === 'local') return;

  // 防止重复点击
  if (isChangingWallpaper) return;
  isChangingWallpaper = true;

  try {
    const result = await fetchBackground(true);
    if (result) {
      const loaded = await testImageLoad(result.url);
      if (loaded) {
        saveBackgroundToStorage(result.url, result.credit);
        document.querySelector('.bg').style.backgroundImage = `url("${result.url}")`;
        updatePhotoCredit(result.credit);
      } else {
        alert(t("app.uploadFailed"));
      }
    }
  } finally {
    isChangingWallpaper = false;
  }
  toggleSettings();
}

async function downloadWallpaper() {
  try {
    const bgElement = document.querySelector('.bg');
    const bgImageUrl = bgElement.style.backgroundImage;
    if (!bgImageUrl || bgImageUrl === 'none') {
      alert(t("bg.noWallpaper"));
      return;
    }
    const urlMatch = bgImageUrl.match(/url\(["']?([^"'()]+)["']?\)/);
    if (!urlMatch || !urlMatch[1]) {
      alert(t("bg.extractFailed"));
      return;
    }
    const imageUrl = urlMatch[1];
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
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
    alert(t("bg.downloadFailed"));
  }
}
