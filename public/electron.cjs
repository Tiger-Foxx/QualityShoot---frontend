const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs'); // AJOUTER ÇA

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    frame: true,
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#000000'
  });

  // IPC Handlers EXISTANTS
  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp'] },
        { name: 'Vidéos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm'] },
        { name: 'Tous', extensions: ['*'] }
      ]
    });
    return result.canceled ? [] : result.filePaths;
  });

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return result.canceled ? '' : result.filePaths[0];
  });

  // NOUVEAUX HANDLERS pour les fichiers
  ipcMain.handle('read-file-base64', async (event, filePath) => {
    try {
      console.log('🔍 [Electron] Lecture fichier:', filePath);

      const cleanPath = path.resolve(filePath);

      if (!fs.existsSync(cleanPath)) {
        console.error('❌ [Electron] Fichier non trouvé:', cleanPath);
        return null;
      }

      const buffer = fs.readFileSync(cleanPath);
      const base64 = buffer.toString('base64');

      console.log('✅ [Electron] Fichier lu en base64, taille:', base64.length);
      return base64;

    } catch (error) {
      console.error('❌ [Electron] Erreur lecture fichier:', error);
      return null;
    }
  });

  ipcMain.handle('get-file-info', async (event, filePath) => {
    try {
      const cleanPath = path.resolve(filePath);
      const stats = fs.statSync(cleanPath);
      return {
        exists: true,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        modified: stats.mtime,
        absolutePath: cleanPath
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  });

  const startUrl = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);
  mainWindow.show();

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (pythonProcess) pythonProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});