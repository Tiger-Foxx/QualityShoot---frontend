const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

let mainWindow;
let pythonProcess;

// Fonction pour trouver Python
function findPythonPath() {
  const possiblePaths = [
    // Venv du projet
    path.join(__dirname, '../../backend/venv/Scripts/python.exe'),
    path.join(__dirname, '../../backend/.venv/Scripts/python.exe'),

    // Python système
    'python',
    'python3',
    'py',

    // Installations communes
    'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe',
    'C:\\Users\\donfa\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',

    // Anaconda/Miniconda
    path.join(process.env.USERPROFILE || '', 'anaconda3', 'python.exe'),
    path.join(process.env.USERPROFILE || '', 'miniconda3', 'python.exe')
  ];

  for (const pythonPath of possiblePaths) {
    try {
      if (fs.existsSync(pythonPath)) {
        console.log(`✅ Python trouvé: ${pythonPath}`);
        return pythonPath;
      }
    } catch (error) {
      // Continue la recherche
    }
  }

  // Par défaut, essayer la commande python
  console.log('⚠️ Utilisation de la commande python par défaut');
  return 'python';
}

// Démarrer le serveur Python
function startPythonServer() {
  const pythonPath = findPythonPath();
  const scriptPath = isDev
      ? path.join(__dirname, '../../backend/main.py')
      : path.join(process.resourcesPath, 'backend/main.py');

  console.log('🚀 Démarrage du serveur Python...');
  console.log(`Python: ${pythonPath}`);
  console.log(`Script: ${scriptPath}`);

  // Vérifier que le script existe
  if (!fs.existsSync(scriptPath)) {
    console.error(`❌ Script Python non trouvé: ${scriptPath}`);
    return;
  }

  try {
    pythonProcess = spawn(pythonPath, [scriptPath], {
      cwd: path.dirname(scriptPath),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`🐍 Python: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`🐍 Python Error: ${data.toString()}`);
    });

    pythonProcess.on('error', (error) => {
      console.error('❌ Erreur démarrage Python:', error.message);

      // Montrer une notification à l'utilisateur
      if (mainWindow) {
        mainWindow.webContents.send('python-error', {
          message: 'Impossible de démarrer le serveur Python',
          details: error.message,
          suggestion: 'Vérifiez que Python est installé et que le backend est configuré'
        });
      }
    });

    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python fermé avec le code: ${code}`);
    });

  } catch (error) {
    console.error('❌ Erreur spawn Python:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
    icon: path.join(__dirname, '../src/assets/icon.png') // Si tu as une icône
  });

  // IPC Handlers
  ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('close-window', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp', 'heic'] },
        { name: 'Vidéos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'gif'] },
        { name: 'Tous les fichiers', extensions: ['*'] }
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

  // Charger l'application
  const startUrl = isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`;

  // Démarrer Python d'abord, puis afficher la fenêtre
  startPythonServer();

  setTimeout(() => {
    mainWindow.loadURL(startUrl);
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  }, 2000); // Réduire le délai à 2 secondes
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Tuer le processus Python proprement
  if (pythonProcess) {
    console.log('🛑 Arrêt du serveur Python...');
    pythonProcess.kill('SIGTERM');

    // Force kill si nécessaire après 3 secondes
    setTimeout(() => {
      if (pythonProcess && !pythonProcess.killed) {
        pythonProcess.kill('SIGKILL');
      }
    }, 3000);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Gestionnaire pour quitter proprement
app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
  }
});