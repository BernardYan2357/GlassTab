// ============================================================
// background.js — 壁纸管理（获取、缓存、切换、下载、credit）
// ============================================================

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
    } else if (source === "pexels") {
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
  if (currentWallpaperSource === 'bing') return;

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
        alert('Failed to load new wallpaper. Please try again later.');
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
      alert('No wallpaper to download. Please wait for the wallpaper to load.');
      return;
    }
    const urlMatch = bgImageUrl.match(/url\(["']?([^"'()]+)["']?\)/);
    if (!urlMatch || !urlMatch[1]) {
      alert('Unable to extract wallpaper URL.');
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
    alert('Failed to download wallpaper. Please try again later.');
  }
}
