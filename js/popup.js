// ============================================================
// popup.js — 扩展图标弹窗的 API key 配置
// ============================================================

const weatherKeyInput = document.getElementById('weatherKeyInput');
const pexelsKeyInput = document.getElementById('pexelsKeyInput');
const imgbbKeyInput = document.getElementById('imgbbKeyInput');
const apiKeyForm = document.getElementById('apiKeyForm');
const resetBtn = document.getElementById('resetBtn');
const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function readFormValues() {
  return {
    openWeatherMap: weatherKeyInput.value.trim(),
    pexels: pexelsKeyInput.value.trim(),
    imgbb: imgbbKeyInput.value.trim()
  };
}

function populateForm(apiKeys) {
  weatherKeyInput.value = apiKeys.openWeatherMap || '';
  pexelsKeyInput.value = apiKeys.pexels || '';
  imgbbKeyInput.value = apiKeys.imgbb || '';
}

async function initPopup() {
  try {
    const apiKeys = await window.GlassTabApiConfig.loadApiKeys();
    populateForm(apiKeys);
    setStatus(t('popup.loaded'));
  } catch (error) {
    console.error('Failed to load API keys:', error);
    setStatus(t('popup.loadFailed'), true);
  }
}

apiKeyForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await window.GlassTabApiConfig.saveApiKeys(readFormValues());
    setStatus(t('popup.saved'));
  } catch (error) {
    console.error('Failed to save API keys:', error);
    setStatus(t('popup.saveFailed'), true);
  }
});

resetBtn.addEventListener('click', async () => {
  try {
    const apiKeys = await window.GlassTabApiConfig.resetApiKeys();
    populateForm(apiKeys);
    setStatus(t('popup.resetDone'));
  } catch (error) {
    console.error('Failed to reset API keys:', error);
    setStatus(t('popup.saveFailed'), true);
  }
});

initPopup();