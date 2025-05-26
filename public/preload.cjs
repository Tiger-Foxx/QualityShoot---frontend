const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // API pour communiquer avec le processus principal
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // NOUVELLE APPROCHE: Demander au main process de lire le fichier
  readFileAsBase64: (filePath) => ipcRenderer.invoke('read-file-base64', filePath),

  // Fonction pour obtenir les infos d'un fichier
  getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath)
});