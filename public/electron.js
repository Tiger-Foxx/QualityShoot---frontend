const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let pythonProcess;

// Démarrer le serveur Python
function startPythonServer() {
  const pythonPath = isDev 
    ? path.join(__dirname, '../../backend/venv/Scripts/python.exe')
    : path.join(process.resourcesPath, 'backend/python.exe');
    
  const scriptPath = isDev
    ? path.join(__dirname, '../../backend/main.py') 
    : path.join(process.resourcesPath, 'backend/main.py');
  
  console.log('Démarrage du serveur Python...');
  pythonProcess = spawn(pythonPath, [scriptPath]);
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Server: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });
}

function createWindow() {
  // Démarrer le serveur Python en premier
  startPythonServer();
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden', // Pour un look moderne
    frame: false, // Enlever la barre de titre Windows par défaut
    show: false // Ne pas montrer tant que ce n'est pas prêt
  });

  // Charger l'application
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  // Attendre un peu que le serveur Python démarre
  setTimeout(() => {
    mainWindow.loadURL(startUrl);
    mainWindow.show(); // Montrer la fenêtre quand tout est prêt
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  }, 3000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Tuer le processus Python
  if (pythonProcess) {
    pythonProcess.kill();
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