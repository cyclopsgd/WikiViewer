// Wrap in IIFE to prevent global scope pollution
(function() {
const { ipcRenderer } = require('electron');
const path = require('path');

const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings');
const cancelSettingsBtn = document.getElementById('cancel-settings');

const wikiPathDisplay = document.getElementById('wiki-path-display');
const changeFolderBtn = document.getElementById('change-folder-btn');
const themeSelect = document.getElementById('theme-select');
const rememberLastPageCheckbox = document.getElementById('remember-last-page');
const autoReloadCheckbox = document.getElementById('auto-reload');

let tempSettings = {};

// Open settings
function openSettings() {
  // Load current settings
  tempSettings = { ...window.appState.settings };

  // Populate form
  wikiPathDisplay.value = tempSettings.wikiRootPath || 'No folder selected';
  themeSelect.value = tempSettings.theme || 'system';
  rememberLastPageCheckbox.checked = tempSettings.rememberLastPage !== false;
  autoReloadCheckbox.checked = tempSettings.autoReload === true;

  // Show modal
  settingsModal.classList.remove('hidden');
}

// Close settings
function closeSettings() {
  settingsModal.classList.add('hidden');
}

// Save settings
async function saveSettings() {
  // Get values from form
  const newSettings = {
    theme: themeSelect.value,
    rememberLastPage: rememberLastPageCheckbox.checked,
    autoReload: autoReloadCheckbox.checked
  };

  // Save to store
  await ipcRenderer.invoke('set-setting', 'theme', newSettings.theme);
  await ipcRenderer.invoke('set-setting', 'rememberLastPage', newSettings.rememberLastPage);
  await ipcRenderer.invoke('set-setting', 'autoReload', newSettings.autoReload);

  // Update app state
  window.appState.settings.theme = newSettings.theme;
  window.appState.settings.rememberLastPage = newSettings.rememberLastPage;
  window.appState.settings.autoReload = newSettings.autoReload;

  // Apply theme
  window.applyTheme(newSettings.theme);

  // Handle file watching
  if (newSettings.autoReload && window.appState.wikiRootPath) {
    await ipcRenderer.invoke('start-watching', window.appState.wikiRootPath);
  } else {
    await ipcRenderer.invoke('stop-watching');
  }

  // Close modal
  closeSettings();
}

// Change folder from settings
async function changeFolderFromSettings() {
  const result = await ipcRenderer.invoke('select-wiki-folder');
  if (result.success) {
    tempSettings.wikiRootPath = result.path;
    wikiPathDisplay.value = result.path;
    window.appState.wikiRootPath = result.path;

    // Reload wiki
    await window.loadFileTree();
    const path = require('path');
    const indexPath = path.join(result.path, 'index.md');
    const exists = await ipcRenderer.invoke('file-exists', indexPath);

    if (exists) {
      await window.loadMarkdownFile(indexPath);
    }
  }
}

// Event listeners
closeSettingsBtn.addEventListener('click', closeSettings);
cancelSettingsBtn.addEventListener('click', closeSettings);
saveSettingsBtn.addEventListener('click', saveSettings);
changeFolderBtn.addEventListener('click', changeFolderFromSettings);

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});

// ESC key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
    closeSettings();
  }
});

// Export function
window.openSettings = openSettings;

})(); // End of IIFE
