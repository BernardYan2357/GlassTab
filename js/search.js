// ============================================================
// search.js — 搜索引擎切换、以图搜图、imgbb 上传
// ============================================================

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

// 图片上传到 imgbb 临时图床，获取公开 URL
async function uploadImageToImgbb(file) {
  const apiKey = CONFIG.imgbbApiKey;
  if (!apiKey || apiKey.includes("YOUR_")) {
    alert("Please set your imgbb API Key in config.js (free: https://api.imgbb.com/)");
    return null;
  }

  const formData = new FormData();
  const base64 = await fileToBase64(file);
  formData.append("key", apiKey);
  formData.append("image", base64);
  formData.append("expiration", 600); // 10 分钟后自动过期

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
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
