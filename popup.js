// popup.js
const defaultSettings = {
  engine: 'google',
  deeplKey: '',
  deeplType: 'free',
  msKey: '',
  msRegion: 'global'
};

const engineSelect = document.getElementById('engine');
const deeplConfig = document.getElementById('deepl-config');
const deeplKeyInput = document.getElementById('deeplKey');
const deeplTypeSelect = document.getElementById('deeplType');
const microsoftConfig = document.getElementById('microsoft-config');
const msKeyInput = document.getElementById('msKey');
const msRegionInput = document.getElementById('msRegion');
const saveBtn = document.getElementById('save-btn');
const statusMsg = document.getElementById('status-msg');

function toggleEngineSections(selectedEngine) {
  deeplConfig.classList.remove('active');
  microsoftConfig.classList.remove('active');

  if (selectedEngine === 'deepl') {
    deeplConfig.classList.add('active');
  } else if (selectedEngine === 'microsoft') {
    microsoftConfig.classList.add('active');
  }
}

function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (items) => {
    engineSelect.value = items.engine;
    deeplKeyInput.value = items.deeplKey;
    deeplTypeSelect.value = items.deeplType;
    msKeyInput.value = items.msKey;
    msRegionInput.value = items.msRegion;

    toggleEngineSections(items.engine);
  });
}

function saveSettings() {
  const updatedSettings = {
    engine: engineSelect.value,
    deeplKey: deeplKeyInput.value.trim(),
    deeplType: deeplTypeSelect.value,
    msKey: msKeyInput.value.trim(),
    msRegion: msRegionInput.value.trim() || 'global'
  };

  chrome.storage.sync.set(updatedSettings, () => {
    statusMsg.style.display = 'block';
    setTimeout(() => {
      statusMsg.style.display = 'none';
    }, 2000);
  });
}

engineSelect.addEventListener('change', (e) => {
  toggleEngineSections(e.target.value);
});

saveBtn.addEventListener('click', saveSettings);
document.addEventListener('DOMContentLoaded', loadSettings);