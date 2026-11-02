// ============================================================
// api-config.js — API key 存储与同步
// ============================================================

(function () {
  const STORAGE_KEY = 'glassTabApiKeys';
  const DEFAULT_KEYS = {
    openWeatherMap: '',
    pexels: '',
    imgbb: ''
  };

  const state = {
    readyPromise: null
  };

  function getConfigObject() {
    if (!window.GlassTabConfig) {
      window.GlassTabConfig = {
        weatherApiKey: '',
        pexelsApiKey: '',
        imgbbApiKey: ''
      };
    }
    return window.GlassTabConfig;
  }

  function normalizeApiKeys(input = {}) {
    return {
      openWeatherMap: input.openWeatherMap || '',
      pexels: input.pexels || '',
      imgbb: input.imgbb || ''
    };
  }

  function applyApiKeys(apiKeys = {}) {
    const config = getConfigObject();
    const normalized = normalizeApiKeys(apiKeys);

    config.weatherApiKey = normalized.openWeatherMap;
    config.pexelsApiKey = normalized.pexels;
    config.imgbbApiKey = normalized.imgbb;

    return normalized;
  }

  function getStoredApiKeys() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          resolve(normalizeApiKeys(result?.[STORAGE_KEY] || {}));
        });
        return;
      }

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        resolve(normalizeApiKeys(raw ? JSON.parse(raw) : {}));
      } catch {
        resolve(normalizeApiKeys());
      }
    });
  }

  function setStoredApiKeys(apiKeys) {
    const normalized = normalizeApiKeys(apiKeys);

    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: normalized }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(normalized);
        });
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        resolve(normalized);
      } catch (error) {
        reject(error);
      }
    });
  }

  function dispatchApiKeysChanged(apiKeys) {
    window.dispatchEvent(new CustomEvent('api-keys-changed', { detail: normalizeApiKeys(apiKeys) }));
  }

  async function loadApiKeys(options = {}) {
    if (!state.readyPromise) {
      state.readyPromise = (async () => {
        const apiKeys = await getStoredApiKeys();
        applyApiKeys(apiKeys);
        if (options.emitChange !== false) {
          dispatchApiKeysChanged(apiKeys);
        }
        return apiKeys;
      })();
    }

    return state.readyPromise;
  }

  async function saveApiKeys(nextApiKeys) {
    const merged = await setStoredApiKeys(nextApiKeys);
    applyApiKeys(merged);
    dispatchApiKeysChanged(merged);
    return merged;
  }

  async function resetApiKeys() {
    return saveApiKeys(DEFAULT_KEYS);
  }

  function getCurrentApiKeys() {
    return applyApiKeys({
      openWeatherMap: getConfigObject().weatherApiKey,
      pexels: getConfigObject().pexelsApiKey,
      imgbb: getConfigObject().imgbbApiKey
    });
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local' || !changes[STORAGE_KEY]) {
        return;
      }

      const nextApiKeys = normalizeApiKeys(changes[STORAGE_KEY].newValue || {});
      applyApiKeys(nextApiKeys);
      dispatchApiKeysChanged(nextApiKeys);
    });
  }

  window.GlassTabApiConfig = {
    loadApiKeys,
    saveApiKeys,
    resetApiKeys,
    getCurrentApiKeys,
    DEFAULT_KEYS
  };
})();
