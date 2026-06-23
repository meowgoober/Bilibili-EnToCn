// content.js

const defaultSettings = {
  engine: 'google',
  deeplKey: '',
  deeplType: 'free',
  msKey: '',
  msRegion: 'global'
};

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultSettings, (items) => {
      resolve(items);
    });
  });
}

// --- Translation Routers ---
async function translateText(text) {
  if (!text || !text.trim()) return '';
  const settings = await getSettings();

  switch (settings.engine) {
    case 'deepl':
      return await translateViaDeepL(text, settings.deeplKey, settings.deeplType);
    case 'microsoft':
      return await translateViaMicrosoft(text, settings.msKey, settings.msRegion);
    case 'google':
    default:
      return await translateViaGoogle(text);
  }
}

async function translateViaGoogle(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text.trim())}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Google Translation API failed.');
    
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(segment => segment[0]).join('');
    }
    return '翻译失败 (Google response format mismatch)';
  } catch (error) {
    console.error('[EnToCn] Google Translation Error:', error);
    return '翻译出错 / Network Error';
  }
}

async function translateViaDeepL(text, apiKey, planType) {
  if (!apiKey) {
    return '⚠️ DeepL API Key Missing! Click the extension icon to set it.';
  }
  try {
    const domain = planType === 'pro' ? 'api.deepl.com' : 'api-free.deepl.com';
    const url = `https://${domain}/v2/translate`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: [text.trim()],
        target_lang: 'ZH'
      })
    });

    if (!response.ok) {
      if (response.status === 403) return '⚠️ DeepL Auth failed (Invalid Key).';
      throw new Error(`DeepL API status error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.translations && data.translations[0]) {
      return data.translations[0].text;
    }
    return '翻译失败 (DeepL empty response)';
  } catch (error) {
    console.error('[EnToCn] DeepL Translation Error:', error);
    return 'DeepL Error / Click icon to check settings';
  }
}

async function translateViaMicrosoft(text, apiKey, region) {
  if (!apiKey) {
    return '⚠️ Microsoft Translation Key Missing! Set it in extension options.';
  }
  try {
    const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=zh-Hans`;
    const headers = {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/json'
    };
    if (region && region !== 'global') {
      headers['Ocp-Apim-Subscription-Region'] = region;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify([{ Text: text.trim() }])
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) return '⚠️ Microsoft Auth failed (Invalid Key).';
      throw new Error(`Microsoft Translation API error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data[0] && data[0].translations && data[0].translations[0]) {
      return data[0].translations[0].text;
    }
    return '翻译失败 (Microsoft empty response)';
  } catch (error) {
    console.error('[EnToCn] Microsoft Translation Error:', error);
    return 'Microsoft Error / Click icon to check settings';
  }
}

// --- Deep Active Element Finder ---
function getDeepActiveElement() {
  let element = document.activeElement;
  while (element && element.shadowRoot && element.shadowRoot.activeElement) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}

// --- Dispatch Native Updates to React/Vue ---
function setReactInputValue(inputElement, value) {
  inputElement.focus();

  if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
    const lastValue = inputElement.value;
    inputElement.value = value;
    
    const tracker = inputElement._valueTracker;
    if (tracker) {
      tracker.setValue(lastValue);
    }
  } else {
    try {
      const range = document.createRange();
      range.selectNodeContents(inputElement);
      
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      document.execCommand('delete', false);
      document.execCommand('insertText', false, value);
    } catch (e) {
      console.warn('[EnToCn] Keystroke injection failed, falling back:', e);
      inputElement.innerText = value;
    }
  }
  
  inputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  inputElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}

// --- Visual feedback (brief flash) to show translation active ---
function provideVisualFeedback(element) {
  const originalTransition = element.style.transition;
  const originalBg = element.style.backgroundColor;
  
  element.style.transition = 'background-color 0.15s ease';
  element.style.backgroundColor = 'rgba(0, 174, 236, 0.15)'; 
  
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 150);
  }, 300);
}

// --- Core Event Listener Logic ---
function setupInvisibleListeners() {
  window.addEventListener('keydown', async (e) => {
    const activeEl = getDeepActiveElement();
    if (!activeEl) return;

    const isWritable = 
      activeEl.tagName === 'TEXTAREA' || 
      activeEl.tagName === 'INPUT' || 
      activeEl.getAttribute('contenteditable') === 'true' ||
      activeEl.classList.contains('brt-editor');

    if (!isWritable) return;

    // 1. HOTKEY TRIGGER: Alt + T
    if (e.altKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      e.stopPropagation();

      const text = activeEl.value !== undefined ? activeEl.value : activeEl.innerText;
      if (!text || !text.trim()) return;

      provideVisualFeedback(activeEl);

      const translated = await translateText(text);
      setReactInputValue(activeEl, translated);
    }

    // 2. SLASH COMMAND TRIGGER: /zh 
    if (e.key === 'Enter' || e.key === 'Tab') {
      const text = activeEl.value !== undefined ? activeEl.value : activeEl.innerText;
      if (text && text.trim().startsWith('/zh ')) {
        e.preventDefault();
        e.stopPropagation();

        const queryText = text.replace(/^\/zh\s+/i, '');
        provideVisualFeedback(activeEl);

        const translated = await translateText(queryText);
        setReactInputValue(activeEl, translated);
      }
    }
  }, true); 
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupInvisibleListeners);
} else {
  setupInvisibleListeners();
}