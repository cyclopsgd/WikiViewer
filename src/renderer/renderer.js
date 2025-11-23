// Wrap in IIFE to prevent global scope pollution
(function() {
const { ipcRenderer, shell } = require('electron');
const path = require('path');

// Application state
const appState = {
  wikiRootPath: null,
  currentFilePath: null,
  theme: 'system',
  settings: {}
};

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const markdownContent = document.getElementById('markdown-content');
const breadcrumbs = document.getElementById('breadcrumbs');
const welcomeSelectBtn = document.getElementById('welcome-select-btn');
const selectFolderBtn = document.getElementById('select-folder-btn');
const refreshBtn = document.getElementById('refresh-btn');
const settingsBtn = document.getElementById('settings-btn');

// Initialize app
async function init() {
  console.log('Initializing application...');

  // Verify DOM elements
  console.log('Welcome select button:', welcomeSelectBtn);
  console.log('Select folder button:', selectFolderBtn);

  // Load settings
  appState.settings = await ipcRenderer.invoke('get-all-settings');
  appState.wikiRootPath = appState.settings.wikiRootPath;
  appState.theme = appState.settings.theme;

  console.log('Loaded settings:', appState.settings);

  // Apply theme
  applyTheme(appState.theme);

  // Set up event listeners
  if (welcomeSelectBtn) {
    welcomeSelectBtn.addEventListener('click', () => {
      console.log('Welcome button clicked');
      selectWikiFolder();
    });
  }
  if (selectFolderBtn) {
    selectFolderBtn.addEventListener('click', () => {
      console.log('Select folder button clicked');
      selectWikiFolder();
    });
  }
  refreshBtn.addEventListener('click', refreshContent);
  settingsBtn.addEventListener('click', openSettings);

  // Set up resize handle
  setupResizeHandle();

  // Load wiki if path is set
  if (appState.wikiRootPath) {
    await loadWiki();
  } else {
    showWelcomeScreen();
  }

  // Listen for file changes
  ipcRenderer.on('files-changed', async () => {
    console.log('Files changed, reloading...');
    await refreshContent();
  });

  // Listen for menu-triggered folder selection
  ipcRenderer.on('open-folder-dialog', async () => {
    await selectWikiFolder();
  });
}

// Select wiki folder
async function selectWikiFolder() {
  try {
    console.log('Opening folder selection dialog...');
    const result = await ipcRenderer.invoke('select-wiki-folder');
    console.log('Folder selection result:', result);

    if (result.success) {
      appState.wikiRootPath = result.path;
      await loadWiki();
    } else if (result.error) {
      console.error('Error selecting folder:', result.error);
      alert('Error selecting folder: ' + result.error);
    } else {
      console.log('Folder selection was canceled');
    }
  } catch (error) {
    console.error('Exception in selectWikiFolder:', error);
    alert('Error opening folder dialog: ' + error.message);
  }
}

// Load wiki
async function loadWiki() {
  console.log('Loading wiki from:', appState.wikiRootPath);

  // Hide welcome screen, show content
  welcomeScreen.classList.add('hidden');
  markdownContent.classList.remove('hidden');

  // Load file tree
  await loadFileTree();

  // Load initial file
  await loadInitialFile();

  // Start file watching if enabled
  if (appState.settings.autoReload) {
    await ipcRenderer.invoke('start-watching', appState.wikiRootPath);
  }
}

// Load initial file
async function loadInitialFile() {
  let fileToLoad = null;

  // Try to load last viewed file if setting is enabled
  if (appState.settings.rememberLastPage && appState.settings.lastViewedFile) {
    const exists = await ipcRenderer.invoke('file-exists', appState.settings.lastViewedFile);
    if (exists) {
      fileToLoad = appState.settings.lastViewedFile;
    }
  }

  // If no last viewed file, try to find root index.md or README.md
  if (!fileToLoad) {
    const indexPath = path.join(appState.wikiRootPath, 'index.md');
    const readmePath = path.join(appState.wikiRootPath, 'README.md');
    const indexMarkdownPath = path.join(appState.wikiRootPath, 'index.markdown');
    const readmeMarkdownPath = path.join(appState.wikiRootPath, 'README.markdown');

    for (const testPath of [indexPath, readmePath, indexMarkdownPath, readmeMarkdownPath]) {
      const exists = await ipcRenderer.invoke('file-exists', testPath);
      if (exists) {
        fileToLoad = testPath;
        break;
      }
    }
  }

  // Load the file if found
  if (fileToLoad) {
    await loadMarkdownFile(fileToLoad);
  } else {
    // Show empty state
    markdownContent.innerHTML = '<div class="empty-state"><p>No markdown file to display. Select a file from the sidebar.</p></div>';
  }
}

// Load markdown file
async function loadMarkdownFile(filePath) {
  console.log('Loading file:', filePath);

  try {
    const content = await ipcRenderer.invoke('read-file', filePath);
    if (content !== null) {
      appState.currentFilePath = filePath;

      // Save as last viewed file
      if (appState.settings.rememberLastPage) {
        await ipcRenderer.invoke('set-setting', 'lastViewedFile', filePath);
      }

      // Render markdown
      await renderMarkdown(content, filePath);

      // Update breadcrumbs
      updateBreadcrumbs(filePath);

      // Highlight current file in tree
      highlightCurrentFile(filePath);
    }
  } catch (error) {
    console.error('Error loading file:', error);
    markdownContent.innerHTML = '<div class="error-message"><p>Error loading file: ' + error.message + '</p></div>';
  }
}

// Update breadcrumbs
function updateBreadcrumbs(filePath) {
  const relativePath = path.relative(appState.wikiRootPath, filePath);
  const parts = relativePath.split(path.sep);

  breadcrumbs.innerHTML = '';

  // Add root
  const rootCrumb = document.createElement('span');
  rootCrumb.className = 'breadcrumb-item clickable';
  rootCrumb.textContent = 'Wiki';
  rootCrumb.addEventListener('click', () => {
    loadInitialFile();
  });
  breadcrumbs.appendChild(rootCrumb);

  // Add separator and parts
  let currentPath = appState.wikiRootPath;
  parts.forEach((part, index) => {
    const separator = document.createElement('span');
    separator.className = 'breadcrumb-separator';
    separator.textContent = ' / ';
    breadcrumbs.appendChild(separator);

    currentPath = path.join(currentPath, part);
    const isLast = index === parts.length - 1;

    const crumb = document.createElement('span');
    crumb.className = isLast ? 'breadcrumb-item' : 'breadcrumb-item clickable';
    crumb.textContent = part;

    if (!isLast) {
      const crumbPath = currentPath;
      crumb.addEventListener('click', async () => {
        // Check if it's a directory and has an index file
        const indexPath = path.join(crumbPath, 'index.md');
        const exists = await ipcRenderer.invoke('file-exists', indexPath);
        if (exists) {
          await loadMarkdownFile(indexPath);
        }
      });
    }

    breadcrumbs.appendChild(crumb);
  });
}

// Refresh content
async function refreshContent() {
  console.log('Refreshing content...');

  if (appState.wikiRootPath) {
    // Reload file tree
    await loadFileTree();

    // Reload current file if one is loaded
    if (appState.currentFilePath) {
      await loadMarkdownFile(appState.currentFilePath);
    }
  }
}

// Show welcome screen
function showWelcomeScreen() {
  welcomeScreen.classList.remove('hidden');
  markdownContent.classList.add('hidden');
}

// Setup resize handle for sidebar
function setupResizeHandle() {
  const resizeHandle = document.getElementById('resize-handle');
  const sidebar = document.getElementById('sidebar');
  let isResizing = false;

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 600) {
      sidebar.style.width = newWidth + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// Apply theme
function applyTheme(theme) {
  const html = document.documentElement;
  const lightTheme = document.getElementById('theme-light');
  const darkTheme = document.getElementById('theme-dark');
  const highlightLight = document.getElementById('highlight-light');
  const highlightDark = document.getElementById('highlight-dark');

  let actualTheme = theme;

  // Detect system theme if needed
  if (theme === 'system') {
    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (actualTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    lightTheme.disabled = true;
    darkTheme.disabled = false;
    highlightLight.disabled = true;
    highlightDark.disabled = false;
  } else {
    html.setAttribute('data-theme', 'light');
    lightTheme.disabled = false;
    darkTheme.disabled = true;
    highlightLight.disabled = false;
    highlightDark.disabled = true;
  }

  // Re-render mermaid diagrams if any
  if (window.mermaid && typeof window.mermaid.initialize === 'function') {
    window.mermaid.initialize({ theme: actualTheme === 'dark' ? 'dark' : 'default' });
  }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (appState.theme === 'system') {
    applyTheme('system');
    // Re-render current page to update mermaid diagrams
    if (appState.currentFilePath) {
      loadMarkdownFile(appState.currentFilePath);
    }
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export functions for use by other modules
window.appState = appState;
window.loadMarkdownFile = loadMarkdownFile;
window.applyTheme = applyTheme;

})(); // End of IIFE
