const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const fileSystem = require('./fileSystem');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Prevent ALL navigation except for index.html
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Only allow navigation to index.html (our main app page)
    if (!url.includes('index.html')) {
      event.preventDefault();
      console.log('Main process: Blocked navigation to:', url);
    }
  });

  // Also prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('Main process: Blocked new window to:', url);
    // Don't allow any new windows from webContents
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if ((validatedURL.endsWith('.md') || validatedURL.endsWith('.markdown')) && !validatedURL.includes('index.html')) {
      console.log('Main process: Prevented failed navigation to:', validatedURL);
      // Don't reload - let the renderer handle it
    }
  });

  // Set custom menu (removes Help menu with external links)
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Select Wiki Folder',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('open-folder-dialog');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  // Add DevTools menu item in development mode
  if (process.argv.includes('--dev')) {
    template[2].submenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools' }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Select wiki folder
ipcMain.handle('select-wiki-folder', async () => {
  try {
    if (!mainWindow) {
      console.error('Main window not available');
      return { success: false, error: 'Window not ready' };
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Wiki Folder'
    });

    console.log('Dialog result:', result);

    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      store.set('wikiRootPath', folderPath);
      console.log('Wiki folder set to:', folderPath);
      return { success: true, path: folderPath };
    }

    console.log('User canceled folder selection');
    return { success: false };
  } catch (error) {
    console.error('Error in select-wiki-folder:', error);
    return { success: false, error: error.message };
  }
});

// Get wiki root path
ipcMain.handle('get-wiki-root', () => {
  return store.get('wikiRootPath', null);
});

// Get file tree
ipcMain.handle('get-file-tree', async (event, rootPath) => {
  try {
    return await fileSystem.getFileTree(rootPath);
  } catch (error) {
    console.error('Error getting file tree:', error);
    return null;
  }
});

// Read file content
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return await fileSystem.readFile(filePath);
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

// Check if file exists
ipcMain.handle('file-exists', async (event, filePath) => {
  return await fileSystem.fileExists(filePath);
});

// Search files
ipcMain.handle('search-files', async (event, rootPath, query) => {
  try {
    return await fileSystem.searchFiles(rootPath, query);
  } catch (error) {
    console.error('Error searching files:', error);
    return [];
  }
});

// Settings handlers
ipcMain.handle('get-setting', (event, key, defaultValue) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('get-all-settings', () => {
  return {
    wikiRootPath: store.get('wikiRootPath', null),
    theme: store.get('theme', 'system'),
    rememberLastPage: store.get('rememberLastPage', true),
    autoReload: store.get('autoReload', false),
    lastViewedFile: store.get('lastViewedFile', null)
  };
});

// Watch files
let fileWatcher = null;
ipcMain.handle('start-watching', (event, rootPath) => {
  if (fileWatcher) {
    fileWatcher.close();
  }
  fileWatcher = fileSystem.watchFiles(rootPath, () => {
    mainWindow.webContents.send('files-changed');
  });
  return true;
});

ipcMain.handle('stop-watching', () => {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
  return true;
});

// Resolve relative path
ipcMain.handle('resolve-path', (event, basePath, relativePath) => {
  return fileSystem.resolvePath(basePath, relativePath);
});
