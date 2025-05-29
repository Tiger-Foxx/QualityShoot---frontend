<p align="center">
  <img src="src/assets/logo.png" alt="QualityShoot Logo" width="120"/>
</p>

# QualityShoot FrontEnd

Welcome to the **front end** of **QualityShoot** — the AI-powered image & video upscaler that brings your pixels back from the dead, crafted with love, TypeScript, and more than a few developer facepalms by [FOX](https://github.com/Tiger-Foxx).

---

## 🌟 Project Context & Philosophy

### Why QualityShoot?

In a world full of blurry, pixelated images, and videos that look like they’ve been recorded with a potato, **QualityShoot** was born from a simple yet ambitious idea:  
**What if anyone could upscale their images and videos to modern standards, locally, with AI — and all in a beautiful, fun, open-source app?**

No more sending your personal files to some sketchy website, no more CLI nightmares, and no more “it only works on Ubuntu 18.04 if you whisper to your GPU.”  
Just a smart, cross-platform, easy-to-use desktop app for everyone.

#### The Mission

- **Democratize high-quality upscaling**: Make advanced AI video/image enhancement accessible to non-techies and pros alike.
- **Respect privacy**: Everything runs locally; your pictures of cats and embarrassing baby photos never leave your machine.
- **Open Source Rules**: The entire codebase (front and back!) is available for learning, hacking, and contributing.

---

## 🏗️ The Role of This Repo

This is the **front end** — the part of the app users actually see and touch.  
It’s the modern, reactive GUI built with React, TypeScript, and Vite, packaged as a desktop app via Electron.  
It handles all user interaction, file selection, progress tracking, and communicates with the backend AI engine (a separate executable) using Electron’s IPC channels.

---

## 🦾 Features That (Hopefully) Make Your Life Easier

- **Sleek, responsive UI** (thanks React + Tailwind!)
- **Drag & Drop** your images and videos (no more “browse” buttons unless you want to)
- **Batch processing**: Select as many files as your RAM/SSD can handle!
- **Real-time progress bars** and status indicators
- **Lottie animations**: Because even progress bars should look cool
- **Smart file browser** with practical filters (images/video only)
- **Dark Mode**: For late-night upscaling marathons
- **Frontend-backend Electron IPC**: Transparent communication with the local AI upscaler
- **Output folder selection & auto-open**
- **Error handling** that aims to be friendly (sometimes even funny)
- **Simple settings** (output quality, formats, etc.)
- **Easy updates** (if you want to rebuild or enhance)

---

## 🤪 Development Peripeties, Oddities & Gotchas

Building QualityShoot wasn’t all smooth upscaling.  
Here’s a peek behind the curtain — so you know what you’re getting into (and maybe get a laugh):

- **Electron path hell**: Did you know that Electron’s `process.resourcesPath` changes based on dev/prod? I do. Now. After hours of “Why is my backend not launching?!”
- **NSIS installer**: Customizing the installer to include a real welcome, license, and even a finish image was like fighting a boss in Dark Souls. (Pro tip: BMP only, and don’t mess with macros.)
- **UTF-8 drama**: Windows Notepad is still living in 1997. If your EULA shows weird characters, check your encoding!
- **Lottie fun**: I spent more time picking animations than writing some core logic. Worth it.
- **IPC mysteries**: Sometimes, IPC just… doesn’t. Debugging Electron’s context isolation is like herding cats (high-res ones!).
- **Backend wrangling**: Spawning the backend EXE in production vs. dev is a saga. Check your paths thrice, and keep a coffee handy.
- **Chunk size warnings**: Vite yells at me about JS bundles being too big. I’ll split them… one day.
- **Icons**: Converting PNG to ICO to BMP to PNG again. If you see a weird logo, that’s why.
- **"It works on my machine"** syndrome: Now with extra flavor thanks to Electron and Windows permissions.

---

## 🧑‍💻 For Contributors & Tinkerers

**You are ABSOLUTELY welcome!**  
Whether you’re a code wizard, a UI perfectionist, or you just want to report a bug or typo — please join in.

- **Fork and clone** the repo
- Use **feature branches** for your work
- **Type everything** (TypeScript helps, trust me)
- Add comments when code gets creative (or cursed)
- Humor in PRs is encouraged!
- If you break the build, you owe everyone coffee (metaphorically)

---

## 🚦 Quickstart Guide

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm**
- **Git**
- **Backend built/extracted** in the right place (see backend docs/repo!)

### Getting Started

```bash
git clone https://github.com/Tiger-Foxx/QualityShoot---frontend.git
cd QualityShoot---frontend
npm install
```

#### Development Mode

```bash
npm run electron-dev
```
*Runs Vite dev server and Electron with hot reload. Backend must be present!*

#### Production Build

```bash
npm run dist
```
*Builds everything and packages the app into an installer in `dist-electron/`.*

---

## 🗂️ Directory Structure

```
.
├── public/             # Electron main process & preload scripts, EULA, installer scripts
├── src/                # React frontend source
│   ├── assets/         # Logo, images, Lottie animations
│   ├── components/     # UI building blocks (Buttons, Modals, etc.)
│   ├── pages/          # Main app pages
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Helper functions
├── backend-dist/       # (After backend build) Contains main.exe and backend assets
├── dist/               # Frontend build output (auto-generated)
├── dist-electron/      # Electron-packaged app (auto-generated)
├── package.json        # Scripts & dependencies
└── README.md           # This file!
```

---

## 💡 Project Architecture

- **Frontend**: All user interaction, file handling, progress UI, settings, and communication with backend.
- **Backend**: Separate executable (main.exe), runs the AI upscaler, receives commands from the frontend via IPC (http, spawn, or custom protocol).
- **Electron**: Packs everything together, manages window, security, backend process, and installer customization.

> **Security**: Context Isolation is enabled by default, no Node.js in renderer, preload scripts only expose safe APIs.

---

## 🤝 Integration with Backend

- **Dev mode**: Frontend expects the backend to be running (check backend repo for how to launch).
- **Prod mode**: Electron spawns the backend automatically via `main.exe` (included in `/backend-dist/`).
- **Communication**: Electron IPC channels and HTTP API for file operations, upscaling tasks, etc.

---

## 🧰 Main Dependencies

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lottie React](https://lottiereact.com/)
- [Electron](https://www.electronjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [NSIS](https://nsis.sourceforge.io/) (for installer)

---

## 📃 License

This project is **open source** — see the [EULA](public/EULA.txt) and [LICENSE](./LICENSE) files for details.  
Contributions, forks, and stars are always appreciated!

---

## 🦊 About the Author

Made by [FOX](https://github.com/Tiger-Foxx)  
Find more projects, tools, and pixels on [site.the-fox.tech](https://site.the-fox.tech)

---

<p align="center">
  <b>With great resolution comes great responsibility.</b>
</p>