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

function setEngineByName(name) {
  const idx = CONFIG.engines.findIndex(e => e.name === name);
  if (idx !== -1) setEngine(idx);
}

// 获取支持图搜的引擎名列表
function getImageEngineNames() {
  return ['Google', 'Yandex', 'TinEye'];
}

// 检查 imgbb API 是否可用
function isImgbbAvailable() {
  return CONFIG.imgbbApiKey && !CONFIG.imgbbApiKey.includes("YOUR_");
}

// 无 imgbb 时，通过表单 POST 直接上传到 Google Lens
function searchGoogleLensDirect(file) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.enctype = 'multipart/form-data';
  form.action = 'https://lens.google.com/v3/upload';
  form.target = '_blank';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'encoded_image';

  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

// 图片上传到 imgbb 临时图床，获取公开 URL
async function uploadImageToImgbb(file) {
  const apiKey = CONFIG.imgbbApiKey;
  if (!apiKey || apiKey.includes("YOUR_")) {
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
