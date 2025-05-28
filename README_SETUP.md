# 🚀 Guide Ultra-Complet – Packager et Distribuer une App Electron + Python (QualitéShoot)

**Ce guide vous explique, pas à pas, comment transformer votre projet Electron/React + Python (FastAPI) en un vrai logiciel Windows (.exe), robuste et pro, prêt à être distribué.  
Il couvre : la gestion des erreurs, l’emballage des assets, l’automatisation du lancement, l’intégration Electron-Python, la gestion multi-plateformes, la FAQ, et tous les pièges à éviter.**

---

## 📋 Sommaire

- [1. Correction de l’erreur Autofill.enable dans Electron](#1-correction-de-lerreur-autofillenable-dans-electron)
- [2. Construire l’exécutable Electron (frontend React)](#2-construire-lexécutable-electron-frontend-react)
- [3. Packager le serveur Python en .exe (avec assets)](#3-packager-le-serveur-python-en-exe-avec-assets)
- [4. Démarrer automatiquement le backend Python depuis Electron](#4-démarrer-automatiquement-le-backend-python-depuis-electron)
- [5. Architecture “Launcher” (si besoin)](#5-architecture-launcher-si-besoin)
- [6. FAQ, erreurs fréquentes, astuces](#6-faq-erreurs-fréquentes-astuces)
- [7. Ressources utiles](#7-ressources-utiles)

---

## 1. Correction de l’erreur Autofill.enable dans Electron

Vous voyez dans la console DevTools d’Electron :

```
"Request Autofill.enable failed. {"code":-32601,"message":"'Autofill.enable' wasn't found"}"
"Request Autofill.setAddresses failed. {"code":-32601,"message":"'Autofill.setAddresses' wasn't found"}"
```

> **Pourquoi ?**  
> Electron embarque Chromium, qui propose une API Autofill (remplissage auto) **disponible seulement pour le web**. Electron Desktop ne l’implémente pas.  
> **Ce n’est pas une erreur bloquante.**

**💡 À faire :**
- Ignorez ce warning, il n’impacte en rien votre app.
- Si vous êtes perfectionniste, filtrez ce log dans DevTools ou désactivez les expérimentations “Autofill” dans les flags de Chromium/Electron.

---

## 2. Construire l’exécutable Electron (frontend React)

### 2.1. Prérequis

- Node.js **16+** et npm/yarn installés
- Un projet Electron/React fonctionnel (Vite ou Create React App)
- Un fichier `electron.cjs` (ou `electron-main.js`) pour le process principal Electron

### 2.2. Installer les dépendances

```bash
npm install
npm install electron --save-dev
npm install electron-builder --save-dev
npm install vite react react-dom # si ce n’est pas déjà fait
```

### 2.3. Structure attendue

```
frontend/
│   package.json
│   public/
│       electron.cjs
│       preload.cjs
│       ...
│   src/
│       App.tsx, main.tsx, ...
│       assets/
│           lotties/
│           images/
│           ...
└─── ...
```

### 2.4. Configurer electron-builder

Dans le `package.json` :

```json
"main": "public/electron.cjs",
"build": {
  "appId": "com.qualityshoot.app",
  "productName": "QualityShoot",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**",    // build du front (Vite: dist, CRA: build)
    "public/**",
    "assets/**"
  ],
  "extraResources": [
    {
      "from": "../backend-dist",  // dossier où tu mettras le .exe Python + assets
      "to": "backend"
    }
  ],
  "win": {
    "target": "nsis",
    "icon": "public/logo.png"
  }
}
```

**Notes :**
- `extraResources` permet d’embarquer le serveur Python packagé dans l’exécutable Electron.
- `main` doit pointer vers votre fichier principal Electron (souvent `electron.cjs` ou `electron-main.js`).

### 2.5. Scripts utiles

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build-electron": "electron-builder"
}
```

### 2.6. Build du front et de l’exécutable Electron

```bash
npm run build      # génère le build React dans dist/
npm run build-electron # package tout dans dist-electron/
```

> **À la fin, vous trouverez l’installateur .exe dans `frontend/dist-electron/`**

---

## 3. Packager le serveur Python en .exe (avec assets)

### 3.1. Installer PyInstaller

```bash
pip install pyinstaller
```

### 3.2. Préparer vos assets

- Tous les modèles IA, ffmpeg, exiftool, etc. doivent être dans `backend/assets/`.
- Vérifiez bien le chemin d’accès dans le code Python (voir plus bas).

### 3.3. Créer le EXE avec PyInstaller

Placez-vous dans `backend/` :

```bash
pyinstaller --onefile --noconsole --add-data "assets;assets" --add-data ".env;." main.py
```

> - `--onefile` : tout en un seul .exe
> - `--noconsole` : pas de fenêtre noire
> - `--add-data` : embarquer vos dossiers (attention au `;` sous Windows et au `:` sous Linux/Mac !)

**Résultat :**
- L’exécutable est dans `backend/dist/main.exe`

### 3.4. Gérer l’accès aux assets dans Python

Dans tous vos accès à des fichiers/dossiers, utilisez ce helper :

```python
import sys
from pathlib import Path

def get_asset_path(relative_path):
    if getattr(sys, 'frozen', False):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(__file__).parent
    return base_path / relative_path

# Exemple :
ffmpeg_path = get_asset_path("assets/ffmpeg/ffmpeg.exe")
```

**Pourquoi ?**
> Sinon, le chemin sera cassé dans le EXE PyInstaller, et vous aurez des erreurs de fichier introuvable.

### 3.5. Pièges fréquents lors du packaging Python

- **DLL manquantes** (Onnx, OpenCV) : Ajoutez-les avec `--add-binary` si PyInstaller ne les détecte pas.
- **Assets non retrouvés** : Toujours utiliser le helper `get_asset_path()`.
- **Assets non embarqués** : Ajoutez tous les assets nécessaires via `--add-data`.
- **Erreur “ModuleNotFoundError”** : Ajoutez `--hidden-import <nom_module>` au besoin.
- **EXE lourd** : Normal pour un backend IA, ne cherchez pas à le “minifier” à l’extrême.

---

## 4. Démarrer automatiquement le backend Python depuis Electron

### 4.1. Lancer le serveur Python depuis Electron

Dans votre `electron.cjs` (process principal Electron) :

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let pythonProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Démarre le backend Python packagé
  const backendPath = path.resolve(__dirname, 'backend', process.platform === 'win32' ? 'main.exe' : 'main');
  pythonProcess = spawn(backendPath, [], {
    cwd: path.dirname(backendPath),
    detached: false,
    stdio: 'ignore' // ou 'inherit' pour debug
  });

  win.loadURL('http://localhost:5173'); // ou le build React

  win.on('closed', () => {
    if (pythonProcess) {
      pythonProcess.kill();
      pythonProcess = null;
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### 4.2. Faire pointer le front sur le backend

Dans `apiService.ts` :

```ts
const API_BASE_URL = 'http://127.0.0.1:8000';
```

> **Vérifiez le port utilisé par votre FastAPI !**

### 4.3. Pièges fréquents

- **Le backend n’est pas dans le même dossier que l’EXE Electron** : fixez les chemins dans `spawn`.
- **Le port du backend est déjà pris** : changez-le dans le Python ou Electron.
- **Le backend n’a pas le droit d’écouter sur le port (antivirus, firewall)** : autorisez-le.

---

## 5. Architecture “Launcher” (optionnelle, avancée)

Si vous voulez gérer le lancement des deux EXE proprement, ou ajouter un splash screen, vous pouvez créer un “launcher” (petite app qui s’occupe de tout démarrer proprement).

### 5.1. Exemple simple en Node.js

```js
const { spawn } = require('child_process');
const path = require('path');

// Démarre le backend Python
spawn(path.join(__dirname, 'backend', 'main.exe'), { detached: true });

// Démarre l’Electron front
spawn(path.join(__dirname, 'frontend', 'QualityShoot.exe'), { detached: true });
```

### 5.2. Splash Screen + surveillance

Utilisez une mini-fenêtre Electron qui montre une animation, puis lance backend + frontend, et ferme la splash.

---

## 6. FAQ, erreurs fréquentes, astuces

### Q1: **Le EXE Python ne trouve pas les assets**
- Utilisez toujours le helper `get_asset_path()`
- Vérifiez les options `--add-data` dans PyInstaller

### Q2: **Erreur Autofill dans la console Electron**
- Ignorez, ce n’est pas bloquant (voir point 1)

### Q3: **EXE trop lourd**
- C’est normal pour une app IA/vision. Ne cherchez pas à retirer des DLL critiques.

### Q4: **Pas d’accès à l’API backend**
- Vérifiez que le port est bien ouvert (8000 ou ce que vous avez configuré)
- Vérifiez que le backend tourne bien

### Q5: **Assets manquants après build**
- Ajoutez-les à `--add-data` pour PyInstaller
- Ajoutez-les à `extraResources` pour electron-builder

### Q6: **Problème multi-plateforme**
- Attention aux séparateurs de chemins dans `--add-data` (`;` sous Windows, `:` sous Mac/Linux)
- Testez vos builds sur chaque OS cible

### Q7: **Comment faire pour updater le backend seulement ?**
- Gardez le dossier `backend/` séparé dans `extraResources` (ne le mergez pas dans l’ASAR d’Electron)
- Vous pourrez swap simplement le EXE Python plus tard

---

## 7. Ressources utiles

- [Electron-builder – Doc Officielle](https://www.electron.build/)
- [PyInstaller – Doc Officielle](https://pyinstaller.org/en/stable/)
- [Vite (React)](https://vitejs.dev/)
- [FastAPI – Déploiement](https://fastapi.tiangolo.com/deployment/)
- [Exemple packaging Electron+Python](https://github.com/jimmywarting/electron-python-example)
- [Packager une app IA Python avec Electron (FR)](https://www.soudeur.net/articles/comment-distribuer-une-app-python-avec-gui-electron/)

---

# 🎯 Résumé des étapes

1. **Packager le frontend** avec electron-builder (`npm run build-electron`)
2. **Packager le backend Python** avec PyInstaller (`pyinstaller ...`)
3. **Dans Electron, lancez le backend** avec spawn/process
4. **Distribuez le dossier/dist** (ou l’installateur NSIS généré)

---

## 🧩 Astuces pro

- **Ajoutez un splash screen** dans Electron pour faire patienter au démarrage du backend.
- **Logguez** le stdout du backend pendant le dev (`stdio: 'inherit'` dans spawn).
- **Embarquez vos assets** dans l’EXE Python, pas dans Electron.
- **Automatisez tout** avec un script build (npm run build-all, etc).
- **Testez votre build** sur un autre PC SANS Python installé, pour vérifier la portabilité.

---

## 🏁 Bonne chance et bon packaging !
*Ce tuto est volontairement exhaustif pour que même un débutant s’en sorte. Si tu bloques sur un point, relis chaque étape et vérifie chaque chemin/fichier, c’est souvent un détail !*

---