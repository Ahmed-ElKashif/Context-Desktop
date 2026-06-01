<div align="center">

<!-- ═══════════════════════════════ LOGO ═══════════════════════════════ -->

<img src="./renderer/docs/logo.svg" width="96" height="96" alt="Context Logo" />

<h1>Context — Desktop</h1>

<p><em>Your AI-native knowledge base, now living on your machine.</em></p>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&pause=1000&color=4F46E5&center=true&vCenter=true&width=720&lines=Native+Windows+App+via+Electron;Auto-Updates+%C2%B7+System+Tray+%C2%B7+CLI+Integration;Built+with+Electron+42+%2B+React+19+%2B+TypeScript" alt="Typing SVG" />

<br/>

<!-- ══════════════════════════════ BADGES ══════════════════════════════ -->

<p>
  <img src="https://img.shields.io/badge/Electron-42.x-47848F?style=for-the-badge&logo=electron&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white"/>
  <img src="https://img.shields.io/badge/electron--builder-NSIS_Installer-2D9CDB?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Auto_Updater-GitHub_Releases-181717?style=for-the-badge&logo=github&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white"/>
  <img src="https://img.shields.io/badge/electron--store-Secure_Local_Storage-4F46E5?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/IPC-Context_Bridge_Architecture-7C3AED?style=for-the-badge"/>
</p>

<br/>

[![Context API](https://img.shields.io/badge/🔗_Paired_With-Context_API-4F46E5?style=flat-square)](https://github.com/Ahmed-ElKashif/Context-api)
[![Context Web](https://img.shields.io/badge/🔗_Paired_With-Context_Web-61DAFB?style=flat-square)](https://github.com/youssef1232004/context-mvp-front)
[![Context Mobile](https://img.shields.io/badge/🔗_Paired_With-Context_Mobile-000020?style=flat-square)](https://github.com/youssef1232004/context-mobile)

</div>

---

## 📋 Table of Contents

- [What is Context Desktop?](#-what-is-context-desktop)
- [Desktop vs Web](#-desktop-vs-web)
- [Architecture](#-architecture)
- [IPC Bridge System](#-ipc-bridge-system)
- [Screen Map](#-screen-map)
- [Feature Highlights](#-feature-highlights)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Dev)](#-quick-start-dev)
- [Building & Distribution](#-building--distribution)
- [Environment Variables](#-environment-variables)
- [Brand & Colors](#-brand--colors)
- [Team & Workflow](#-team--workflow)

---

## 🖥️ What is Context Desktop?

**Context Desktop** is the native Windows application wrapper for the Context platform. It takes the exact same AI-powered features of the web frontend and packages them into a first-class desktop experience using **Electron**.

- 🔒 **Secure local credential storage** — auth tokens are stored in the OS-level store, not `localStorage`
- 🚀 **Auto-updates via GitHub Releases** — users always get the latest version silently
- 📁 **Native file integration** — open files directly from Windows Explorer via CLI or drag-and-drop onto the app icon
- 🪟 **Quick Capture window** — a lightweight floating window for instant uploads without opening the full app
- 🔔 **System notifications** — native Windows toast notifications with deep-link routing
- 💻 **Boot sequence** — branded animated loading screen while the app initializes and authenticates

> Built for the **ITI ITP R2 2026** Final Project by **🧠 Contexters** 🚀

---

## ⚖️ Desktop vs Web

| Feature                      | Web (`context-front`) | Desktop (`Context-Desktop`)                               |
| ---------------------------- | --------------------- | --------------------------------------------------------- |
| Authentication storage       | `localStorage`        | `electron-store` (encrypted OS store)                     |
| File open method             | Browser file picker   | Native Windows file picker via IPC                        |
| Auto-updates                 | Manual refresh        | `electron-updater` via GitHub Releases                    |
| Landing page (`/`)           | ✅ Marketing page     | ❌ Smart redirect (login / dashboard)                     |
| Quick Capture                | ❌                    | ✅ Dedicated floating window                              |
| Boot screen                  | ❌                    | ✅ Animated branded boot sequence                         |
| Server-down screen           | ❌                    | ✅ Dedicated `ServerErrorPage`                            |
| CLI file open                | ❌                    | ✅ Drag file onto app icon → auto-uploads                  |
| **"Upload to Context" shell extension** | ❌ | ✅ **Right-click any file/folder in Explorer → instant upload** |
| **AI folder export to disk** | ❌                    | ✅ **Export AI-organized folders to any local directory** |
| System notifications         | Browser push          | Native Windows toast with routing                         |
| Installer                    | N/A                   | NSIS single-file `.exe`                                   |

---

## 🏛️ Architecture

Context Desktop follows a strict **Context Bridge** architecture — the main process and the renderer (React app) never share a direct reference. All communication is routed through a typed IPC layer exposed via `preload.ts`.

```
┌───────────────────────────────────────────────────┐
│                  RENDERER PROCESS                  │
│          (React 19 + Redux + Tailwind)             │
│                                                   │
│   window.electronAPI.files.openDialog()           │
│   window.electronAPI.store.get("token")           │
│   window.electronAPI.app.onCLIArgs(cb)            │
└──────────────────────┬────────────────────────────┘
                       │  contextBridge (IPC)
                       ▼
┌───────────────────────────────────────────────────┐
│                  PRELOAD SCRIPT                    │
│  (preload/index.ts — the only bridge)             │
│  Exposes: electronAPI.{files, store, app,         │
│           updater, window}                        │
└──────────────────────┬────────────────────────────┘
                       │  ipcRenderer → ipcMain
                       ▼
┌───────────────────────────────────────────────────┐
│                   MAIN PROCESS                    │
│              (main/index.ts)                      │
│                                                   │
│  ┌───────────┐  ┌────────────┐  ┌─────────────┐  │
│  │   file-   │  │   store-   │  │   updater-  │  │
│  │ handlers  │  │  handlers  │  │  handlers   │  │
│  └───────────┘  └────────────┘  └─────────────┘  │
│  ┌───────────┐  ┌────────────┐                   │
│  │   app-    │  │  window-   │                   │
│  │ handlers  │  │  handlers  │                   │
│  └───────────┘  └────────────┘                   │
│                                                   │
│         electron-store (OS-level KV)              │
│         electron-updater (GitHub Releases)        │
│         electron-log (file logging)               │
└───────────────────────────────────────────────────┘
```

**Key enforced rules:**

- Renderer has **zero** `require()` or Node.js access — `nodeIntegration: false`
- All native OS calls go through `contextBridge` — no direct Electron API in React
- `electron-store` is accessed **only** from the main process — tokens never touch `localStorage`

---

## 🔌 IPC Bridge System

The `preload/index.ts` exposes a typed `window.electronAPI` surface split into 5 namespaces:

| Namespace             | Handler File          | Capabilities                                                                              |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| `electronAPI.files`   | `file-handlers.ts`    | Open native file picker, read file as Buffer, resolve MIME type, handle drag-drop from OS |
| `electronAPI.store`   | `store-handlers.ts`   | `get` / `set` / `delete` encrypted key-value pairs (auth tokens, preferences)             |
| `electronAPI.app`     | `app-handlers.ts`     | Listen for CLI file open events, notification click routing, minimize/close               |
| `electronAPI.updater` | `updater-handlers.ts` | Check for updates, download, install-on-quit lifecycle                                    |
| `electronAPI.window`  | `window-handlers.ts`  | Minimize, maximize, close (custom title bar support)                                      |

---

## 🗺️ Screen Map

| Route              | Page             | Auth     | Desktop-Exclusive | Description                                                       |
| ------------------ | ---------------- | -------- | ----------------- | ----------------------------------------------------------------- |
| `/`                | `DesktopRoot`    | —        | ✅                | Smart redirect — goes to dashboard or login, never a landing page |
| `/login`           | `LoginPage`      | Public   |                   | Email + password authentication                                   |
| `/register`        | `RegisterPage`   | Public   |                   | Account creation                                                  |
| `/forgot-password` | `ForgotPassword` | Public   |                   | Request password reset email                                      |
| `/reset-password`  | `ResetPassword`  | Public   |                   | Set new password via token                                        |
| `/dashboard`       | `Dashboard`      | ✅ User  |                   | AI-curated focus feed, stats, and unified RAG chat |
| `/library`         | `SmartLibrary`   | ✅ User  |                   | Full document management                                          |
| `/read/:id`        | `Reader`         | ✅ User  |                   | Clean PDF & Document viewer                                |
| `/compare`         | `Compare`        | ✅ User  |                   | AI document comparison + dual-doc chat                            |
| `/settings`        | `Settings`       | ✅ User  |                   | App preferences + connection config                               |
| `/profile`         | `Profile`        | ✅ User  |                   | Avatar, persona, password change                                  |
| `/quick-capture`   | `QuickCapture`   | ✅ User  | ✅                | Lightweight floating upload window                                |
| `/admin`           | `AdminPage`      | 🛡️ Admin |                   | User management dashboard                                         |

---

## ✨ Feature Highlights

<details>
<summary><b>🚀 Animated Boot Sequence</b></summary>

On every cold start, Context Desktop shows a branded **BootSequence** component while:

1. Resolving auth state from `electron-store` via IPC
2. Enforcing a minimum 2-second display time so the animation plays fully
3. Fading out smoothly into the authenticated app (or login screen)

This replaces the jarring blank-white flash common to plain Electron apps.

</details>

<details>
<summary><b>📁 CLI File Open Integration</b></summary>

Context Desktop registers itself as a file handler on install. Users can:

- **Drag a file onto the app icon** in Explorer → app opens and auto-queues the upload
- **Right-click → Open with Context** from any file in Explorer

The main process captures CLI args, batches rapid multi-file calls with a 350ms debounce, and fires a `custom-event` to the React `UploadModal` — all without any direct renderer ↔ main coupling.

</details>

<details>
<summary><b>🖱️ "Upload to Context" — Windows Shell Extension</b></summary>

This is perhaps the most powerful desktop-exclusive integration. During installation, Context registers a **Windows Shell context menu entry** using the `winreg` package to write the required keys into the Windows Registry.

This means users can:
- **Right-click any file** (PDF, DOCX, image, Excel…) anywhere on their machine → **"Upload to Context"** appears in the context menu
- **Right-click any folder** in Explorer → **"Upload to Context"** uploads every supported file inside that folder in one action

The shell extension passes the selected path(s) as CLI arguments to the app. The main process captures them via `app-handlers.ts`, batches them with a 350ms debounce, and fires the `external-upload` custom event to the React `UploadModal` — so the user sees the staged file preview and can confirm before anything is sent to the API.

This makes Context feel like a **true native citizen of Windows** — not just an app you have to switch to, but one that integrates directly into your daily file workflow.

</details>

<details>
<summary><b>⚡ Quick Capture Window</b></summary>

A dedicated **lightweight floating window** at `/quick-capture` allows users to drop files for instant upload without bringing the full app to the foreground. Ideal for power users who want frictionless capture while working in other applications.

</details>

<details>
<summary><b>🔄 Auto-Updates (GitHub Releases)</b></summary>

`electron-updater` continuously checks the GitHub Releases page for new versions.

- On a new release: downloads the update silently in the background
- Notifies the user via a native Windows toast notification
- Installs on next app quit — zero forced interruption

Configured in `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: Ahmed-ElKashif
  repo: Context-Desktop
```

</details>

<details>
<summary><b>🔒 Secure Credential Storage</b></summary>

Unlike the web frontend which stores JWT tokens in `localStorage`, the desktop app stores them via `electron-store` — a file-based encrypted key-value store that lives in the user's OS app-data directory. This means tokens are:

- Not exposed to the renderer's `window` object
- Not accessible by other browser tabs or extensions
- Automatically cleared on `electron-store.clear()` (logout)

> **API Compatibility:** To remain compatible with the Web's strict `HttpOnly` cookie security, the Desktop app uses a **Dual-Auth Architecture**. It passes `Client-Type: native` and `X-Requested-With: XMLHttpRequest` headers to the API, signaling the backend to securely inject the token into the JSON response for encrypted local storage.

</details>

<details>
<summary><b>💥 Server-Down Detection</b></summary>

The Axios layer in the renderer fires a custom `server-down` DOM event when the backend is completely unreachable (network error, not just a 5xx). `App.tsx` catches this and replaces the entire UI with a dedicated `ServerErrorPage` — an experience the web app doesn't have since browsers handle this differently.

</details>

<details>
<summary><b>📂 AI Folder Export to Local Disk</b></summary>

This is a **desktop-exclusive** feature that has no equivalent in the web app.

After the AI proposes a semantic folder structure for your library, the desktop app adds an **"Export to Folder"** action. The flow:

1. The user reviews the AI-proposed folder tree in the `AISplitScreenView` split-screen modal
2. They click **"Export to Disk"** — a native **Windows folder picker** dialog opens via `electronAPI.files`
3. The app recreates the entire AI-proposed folder hierarchy as real directories on the local filesystem, placing a copy of each document in its correct folder
4. The user gets their knowledge base as a proper, organized folder structure on their machine — ready to use in File Explorer, OneDrive, or any other tool

This bridges the gap between your cloud AI library and your local file system — your documents don't just get organized inside Context, they get organized **on your actual hard drive**.

</details>

<details>
<summary><b>🔔 Notification Deep-Linking</b></summary>

Native Windows toast notifications dispatched from the main process can carry a `route` payload. When a user clicks the notification, `App.tsx` listens via `electronAPI.app.onNotificationClicked` and calls `navigate(payload.route)` — taking the user directly to the relevant screen.

</details>

---

## 🛠️ Tech Stack

### Electron (Main Process)

| Technology       | Version | Purpose                                     |
| ---------------- | ------- | ------------------------------------------- |
| Electron         | 42.x    | Desktop runtime & native OS bridge          |
| electron-builder | 26.x    | NSIS installer packaging for Windows        |
| electron-updater | 6.x     | Auto-update via GitHub Releases             |
| electron-store   | 11.x    | Encrypted OS-level key-value storage        |
| electron-log     | 5.x     | File-based structured logging               |
| @electron/remote | 2.x     | Remote module compatibility                 |
| electron-reload  | 2.x     | Hot-reload in development                   |
| sharp-cli        | 5.x     | Icon asset processing (PNG → ICO, resize)   |
| axios            | 1.x     | HTTP client for IPC-proxied API calls       |
| form-data        | 4.x     | Multipart form builder for file uploads     |
| mime-types       | 3.x     | MIME type detection from file extension     |
| winreg           | 1.x     | Windows Registry write — registers the "Upload to Context" shell context menu entry |
| concurrently     | 10.x    | Parallel dev: renderer Vite + TS watch      |
| TypeScript       | 6.x     | Type safety for main process                |

### Renderer (React App — same stack as context-front)

#### Core UI

| Technology    | Version | Purpose                            |
| ------------- | ------- | ---------------------------------- |
| React         | 19.x    | UI framework                       |
| TypeScript    | 5.x     | Type safety                        |
| Vite          | 8.x     | Build tool + dev server            |
| Redux Toolkit | 2.x     | Global state management            |
| React Router  | 7.x     | Client-side routing + route guards |
| Tailwind CSS  | 4.x     | Utility-first styling              |
| Axios         | 1.x     | HTTP client with JWT interceptor   |

#### Component Libraries

| Technology                           | Version | Purpose                            |
| ------------------------------------ | ------- | ---------------------------------- |
| Radix UI (`radix-ui`, `@radix-ui/*`) | 1.x     | Accessible headless primitives     |
| shadcn                               | 4.x     | Pre-styled Radix component recipes |
| class-variance-authority             | 0.7.x   | Type-safe variant styling          |
| tailwind-merge                       | 3.x     | Smart class deduplication          |
| clsx                                 | 2.x     | Conditional class names            |
| tw-animate-css                       | 1.x     | Tailwind animation utilities       |
| Phosphor Icons                       | 2.x     | Primary icon library               |
| lucide-react                         | 1.x     | Secondary icon set                 |

#### Document & Data

| Technology | Version | Purpose                                    |
| ---------- | ------- | ------------------------------------------ |
| react-pdf  | 10.x    | In-browser PDF rendering                   |
| mammoth    | 1.x     | Word (.docx) text extraction & preview     |
| papaparse  | 5.x     | CSV / Excel parsing for data preview       |
| diff       | 8.x     | Character-level text diffing (Comparison)  |
| dompurify  | 3.x     | Safe HTML sanitization for Word Preview    |
| AG Grid    | 35.x    | High-performance data grid (Smart Library) |
| Recharts   | 3.x     | Analytics charts (Dashboard, Admin)        |

#### Forms, UX & Media

| Technology                          | Version    | Purpose                           |
| ----------------------------------- | ---------- | --------------------------------- |
| react-hook-form                     | 7.x        | Performant form state management  |
| @hookform/resolvers                 | 5.x        | Zod adapter for react-hook-form   |
| zod                                 | 4.x        | Schema validation                 |
| react-dropzone                      | 15.x       | Global drag-and-drop capture      |
| react-easy-crop                     | 5.x        | In-browser avatar image cropping  |
| react-markdown + remark-gfm         | 10.x / 4.x | Markdown rendering (AI responses) |
| react-hot-toast                     | 2.x        | Toast notification system         |
| driver.js                           | 1.x        | Step-by-step onboarding tour      |
| @fontsource-variable/jetbrains-mono | 5.x        | Monospace font for code blocks    |

---

## 📁 Project Structure

```
Context-Desktop/
│
├── 📂 main/                            ← Electron main process (Node.js / TypeScript)
│   ├── index.ts                        ← App entry: creates windows, registers IPC handlers
│   ├── registry.ts                     ← IPC handler registration & lifecycle
│   ├── 📂 ipc/
│   │   ├── file-handlers.ts            ← Native file picker, file read, drag-drop
│   │   ├── store-handlers.ts           ← electron-store get/set/delete
│   │   ├── app-handlers.ts             ← CLI args, notification deep-links
│   │   ├── updater-handlers.ts         ← Auto-update download & install
│   │   └── window-handlers.ts         ← Minimize / maximize / close
│   ├── 📂 windows/
│   │   └── window-manager.ts           ← BrowserWindow factory + state persistence
│   └── 📂 utils/
│
├── 📂 preload/
│   └── index.ts                        ← contextBridge: exposes window.electronAPI
│
├── 📂 renderer/                        ← Vite + React app (isolated renderer process)
│   ├── package.json                    ← Renderer's own deps (React, Tailwind, etc.)
│   └── 📂 src/
│       ├── App.tsx                     ← Router + boot sequence + server-down handler
│       ├── main.tsx                    ← React entry point + Redux Provider
│       │
│       ├── 📂 components/
│       │   ├── 📂 layout/
│       │   │   ├── MainLayout.tsx      ← Sidebar + topbar shell
│       │   │   └── BootSequence.tsx    ← Animated branded boot screen (desktop-only)
│       │   └── 📂 ui/                  ← Shared primitives (Button, Input, Toast, Icons…)
│       │
│       ├── 📂 features/               ← Feature-sliced domain logic
│       │   ├── 📂 auth/               ← AuthGuard, AdminGuard, login hooks
│       │   ├── 📂 library/            ← SmartLibrary + upload modal system
│       │   ├── 📂 reader/             ← PDF viewer + AI sidebar + RAG chat
│       │   ├── 📂 comparison/         ← Compare UI + dual-doc RAG chat
│       │   ├── 📂 dashboard/          ← Suggested focus + stats cards
│       │   ├── 📂 profile/            ← Avatar upload & crop, persona picker
│       │   ├── 📂 search/             ← Semantic search UI
│       │   ├── 📂 admin/              ← Admin dashboard components
│       │   ├── 📂 analytics/          ← useAnalytics hook (auto page-view tracking)
│       │   ├── 📂 settings/           ← App preferences & backend URL config
│       │   └── 📂 tour/               ← driver.js onboarding tour
│       │
│       ├── 📂 pages/                  ← Route-level page components
│       │   ├── login.tsx
│       │   ├── register.tsx
│       │   ├── forgot-password.tsx
│       │   ├── reset-password.tsx      ← Desktop-exclusive auth flow
│       │   ├── dashboard.tsx
│       │   ├── Smartlibrary.tsx
│       │   ├── compare.tsx
│       │   ├── settings.tsx
│       │   ├── profile.tsx
│       │   ├── admin.tsx
│       │   ├── QuickCapture.tsx        ← Desktop-exclusive floating upload window
│       │   ├── FileSummary.tsx         ← Desktop-exclusive file preview page
│       │   ├── ServerErrorPage.tsx     ← Desktop-exclusive offline/server-down screen
│       │   └── read/
│       │
│       ├── 📂 store/                   ← Redux Toolkit (authSlice, documentSlice)
│       ├── 📂 lib/                     ← Axios instance (IPC-aware)
│       ├── 📂 hooks/                   ← Shared custom hooks
│       ├── 📂 types/                   ← Shared TypeScript interfaces
│       └── index.css                   ← Tailwind base + global CSS design tokens
│
├── 📂 build/                           ← Installer assets (icon, NSIS sidebar, license)
├── 📂 assets/                          ← App icons (.ico, .png)
├── 📂 shared/                          ← Types shared between main and renderer
├── electron-builder.yml                ← Packaging config (NSIS, GitHub publish)
├── tsconfig.json                       ← Main process TypeScript config
└── README.md
```

---

## ⚡ Quick Start (Dev)

### Prerequisites

- Node.js ≥ 18.x
- The [Context API](https://github.com/Ahmed-ElKashif/Context-api) running locally on port `5000`

### 1. Install Root Dependencies (Electron Main)

```bash
cd Context-Desktop
npm install
```

### 2. Install Renderer Dependencies

```bash
cd renderer
npm install
cd ..
```

### 3. Start the Dev Server

```bash
npm run dev
# Starts: Vite dev server (renderer) + tsc --watch (main process) in parallel
# Then launch Electron:
npm start
# ✅  Electron window opens pointing to http://localhost:5173
```

> Make sure the Context API is running at port `5000` before launching.

---

## 📦 Building & Distribution

### Build for Windows (NSIS Installer)

```bash
npm run build:win
# 1. Compiles main process TypeScript → dist/main/
# 2. Builds renderer with Vite → renderer/dist/
# 3. Packages everything with electron-builder → release/
```

Output: `release/Context Setup x.x.x.exe` — a single-file NSIS installer.

### NSIS Installer Features

| Setting                 | Value                             |
| ----------------------- | --------------------------------- |
| One-click install       | ❌ (user chooses directory)       |
| Per-machine install     | ✅                                |
| Desktop shortcut        | ✅ Always                         |
| Start Menu shortcut     | ✅                                |
| Run after install       | ✅                                |
| Custom sidebar branding | ✅ (`build/installerSidebar.bmp`) |
| License screen          | ✅ (`build/license.txt`)          |

### Auto-Update Publishing

Releases are published to **GitHub Releases** automatically by the CI/CD pipeline. `electron-updater` checks `https://github.com/Ahmed-ElKashif/Context-Desktop/releases/latest` on every app startup.

---

## 🔑 Environment Variables

The renderer reads a `.env` file inside the `renderer/` directory:

```env
# Backend API base URL (must match the running Context API)
VITE_API_URL=http://localhost:5000/api
```

> The desktop `Settings` page also allows users to configure the backend URL at runtime — useful for pointing at a staging or production deployment.

---

## 🎨 Brand & Colors

Context Desktop shares the exact same design system as the web frontend. All tokens are defined in `renderer/src/index.css` and consumed via Tailwind utility classes.

| Token                  | Light Mode | Dark Mode      | Hex (Light) |
| ---------------------- | ---------- | -------------- | ----------- |
| `primary`              | Indigo     | Indigo-lighter | `#4F46E5`   |
| `accent` / `secondary` | Violet     | Purple         | `#7C3AED`   |
| `text`                 | Slate-700  | White          | `#334155`   |
| `border`               | Slate-200  | White/20       | `#E2E8F0`   |
| `background`           | White      | Slate-900      | `#FFFFFF`   |
| `surface`              | Slate-50   | `#18181B`      | `#F8FAFC`   |

The **ContextLogo** is a three-node neural graph SVG — two input nodes (your documents) converging into one intelligent core — the visual metaphor for Context turning raw files into unified intelligence.

---

## 🌿 Team & Workflow

### Git Rules

1. **Never push directly to `main` or `dev`**
2. **Branch off `dev`** — format: `feat/quick-capture`, `fix/ipc-token`, `chore/update-electron`
3. **Conventional commits:** `feat:`, `fix:`, `chore:`, `docs:`, `electron:`
4. **PR to `dev`** — 1 approval from rotation partner required before merge
5. **Must pass:** `tsc --noEmit` (both root and renderer) + `npm run build` before opening a PR

### IPC Ownership Rule

> All native OS interactions MUST go through the IPC bridge in `main/ipc/`.  
> The renderer MUST NOT import `electron` directly — always use `window.electronAPI.*`.

---

<div align="center">

<img src="./assets/icon.png" width="48" height="48" alt="Context Logo" />

**Built with ❤️ by 🧠 Contexters — ITI ITP R2 2026**

_"Your documents shouldn't just be stored. They should think."_

</div>
