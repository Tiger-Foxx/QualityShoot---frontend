// frontend/public/electron.cjs
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path'); // Assurez-vous que path est importé
const http = require('http');

const isDev = !app.isPackaged;

const fs = require('fs');
const { shell } = require('electron');


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
      preload: path.join(__dirname, 'preload.cjs') // __dirname ici est correct car preload.cjs est aussi dans public/
    },
    frame: true, // Si vous voulez le frame custom, vous devriez le mettre à false plus tard et implémenter les contrôles vous-même
    titleBarStyle: 'default', // 'hidden' ou 'customButtonsOnHover' si frame: false
    show: false,
    backgroundColor: '#000000', // Peut-être la couleur de votre loading screen
    // MODIFICATION ICI: Utilisez path.join avec __dirname
    icon: path.join(__dirname, 'logo.png'), // __dirname sera frontend/public/
  });

  // ... (le reste de votre code ipcMain.handle, etc.)

  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images/videos', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp','mp4', 'mkv', 'avi', 'mov', 'webm'] },
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


  // Si vous êtes en développement, chargez depuis Vite. Sinon, chargez le build.
  const startUrl = isDev
      ? 'http://localhost:5173' // URL de votre serveur de dev Vite
      : `file://${path.join(__dirname, '../../dist/index.html')}`; // Chemin vers index.html après build

  // Attention: Si electron.cjs est dans public/, et dist/ est au même niveau que src/ et public/,
  // alors le chemin pour la prod devrait être:
  // `file://${path.join(__dirname, '../dist/index.html')}` si dist est à côté de public
  // `file://${path.join(__dirname, '../../dist/index.html')}` si dist est à la racine de frontend/

  // En supposant que `dist` est dans `frontend/dist`, et que `electron.cjs` est dans `frontend/public/electron.cjs`.
  // Le chemin relatif de `public` à `dist` est `../dist/`.
  const prodUrl = `file://${path.join(__dirname, '..', 'dist', 'index.html')}`;

  mainWindow.loadURL(isDev ? 'http://localhost:5173' : prodUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  // mainWindow.webContents.on('devtools-opened', () => {
  //   if (!isDev) mainWindow.webContents.closeDevTools();
  // });

  // Pour la prod, lance le backend seulement si on n'est PAS en dev :
  if (!isDev) {

    try {
      // Chemin vers l'exe backend, à ajuster selon ton nom de build
      const backendExe = path.join(__dirname, '..', 'backend', 'main.exe');
      if (fs.existsSync(backendExe)) {
        pythonProcess = spawn(backendExe, [], {
          cwd: path.dirname(backendExe),
          detached: false,
          stdio: 'ignore'
        });
      }
    }
    catch (error) {
      console.error('❌ [Electron] Erreur lors du lancement du backend:', error);
      dialog.showErrorBox('Erreur de démarrage', 'Impossible de démarrer le backend. Veuillez vérifier les logs pour plus d\'informations.');
    }

  }



}


function shutdownBackend() {
  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/shutdown-instant',
    method: 'POST'
  };
  const req = http.request(options, res => {
    // Optionnel: lire la réponse
  });
  req.on('error', error => {
    // Peut échouer si le backend a déjà quitté, c'est OK
  });
  req.end();
}
ipcMain.handle('open-folder', async (event, folderPath) => {
  if (folderPath && typeof folderPath === "string") {
    await shell.openPath(folderPath);
  }
});
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  try {
    shutdownBackend();
  } catch (e) {}
  if (pythonProcess) pythonProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});