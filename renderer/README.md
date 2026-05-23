<div align="center">

<!-- ═══════════════════════════════ LOGO ═══════════════════════════════ -->

<img src="./docs/logo.svg" width="96" height="96" alt="Context Logo" />

<h1>Context — Web Frontend</h1>

<p><em>The interface that turns your documents into a second brain.</em></p>

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&pause=1000&color=4F46E5&center=true&vCenter=true&width=720&lines=AI-Powered+Knowledge+Interface;RAG+Chat+%C2%B7+Document+Compare+%C2%B7+Smart+Library;Built+with+React+19+%2B+Vite+8+%2B+Redux+Toolkit" alt="Typing SVG" />

<br/>

<!-- ══════════════════════════════ BADGES ══════════════════════════════ -->

<p>
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/React_Router-7.x-CA4245?style=for-the-badge&logo=react-router&logoColor=white"/>
  <img src="https://img.shields.io/badge/react--pdf-10.x-FF0000?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Phosphor_Icons-2.x-4F46E5?style=for-the-badge"/>
</p>

<br/>

[![Context API](https://img.shields.io/badge/🔗_Paired_With-Context_API-4F46E5?style=flat-square)](https://github.com/Ahmed-ElKashif/Context-api)
[![Context Mobile App](https://img.shields.io/badge/🔗_Paired_With-Context_Mobile-000020?style=flat-square)](https://github.com/youssef1232004/context-mobile)

</div>

---

## 📋 Table of Contents

- [What is Context?](#-what-is-context)
- [The Design Philosophy](#-the-design-philosophy)
- [Screen Map](#-screen-map)
- [Architecture](#-architecture)
- [State Management](#-state-management)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Brand & Colors](#-brand--colors)
- [Team & Workflow](#-team--workflow)

---

## 🌐 What is Context?

**Context** is an AI-native personal knowledge base. This repository is the **React/Vite frontend** — the face that users see. It connects to the [Context API](https://github.com/Ahmed-ElKashif/Context-api) to provide:

- A **Smart Library** for managing and exploring all your documents
- A **Document Reader** with an AI-powered contextual sidebar
- A **Comparison Tool** for deep-diffing two documents side-by-side
- A **Dashboard** with personalized AI focus suggestions
- An **Admin Panel** for platform-level user management

> Built for the **ITI ITP R2 2026** Final Project by **🧠 Contexters** 🚀

---

## 💡 The Design Philosophy

We believe interacting with your knowledge should feel like using a premium native application — not a traditional dashboard.

**Two core principles drive every decision:**

**1. Frictionless Capture**  
The entire app acts as a smart dropzone. There's no "click to navigate to uploads" step. Drag a file anywhere and a glassmorphism overlay appears instantly. Knowledge in, zero friction.

**2. The Virtual Pool Model**  
Files are not trapped in single folders. A document tagged `#Legal` and `#Q1_2026` exists in both virtual spaces simultaneously without data duplication. The sidebar renders dynamically from tags, not from rigid directory trees.

---

## 🗺️ Screen Map

| Route | Page | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `/` | `HomePage` | Public | Landing / marketing page |
| `/login` | `LoginPage` | Public | Email + password authentication |
| `/register` | `RegisterPage` | Public | Account creation |
| `/dashboard` | `Dashboard` | ✅ User | AI-curated focus feed + stats overview |
| `/library` | `SmartLibrary` | ✅ User | Full document management — upload, browse, filter, tag |
| `/read/:id` | `Reader` | ✅ User | PDF viewer + AI contextual sidebar + RAG chat |
| `/compare` | `Compare` | ✅ User | Side-by-side AI document comparison |
| `/profile` | `Profile` | ✅ User | User settings, avatar, persona selection |
| `/settings` | `Settings` | ✅ User | App preferences |
| `/admin` | `AdminPage` | 🛡️ Admin | User management — KPI stats, suspend, CSV export |

---

## 🏛️ Architecture

Context follows a **Feature-Sliced Design** — every route corresponds to a feature folder that owns its own components, hooks, and API logic. The main `App.tsx` is a pure router with no business logic.

```
User Action
     │
     ▼
┌─────────────────────────────────────┐
│          React Router v7            │
│   AuthGuard / AdminGuard (wrappers) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Page Component              │
│  (e.g. SmartLibrary, Dashboard)     │
│  Orchestration only — no raw logic  │
└──────┬──────────────────────────────┘
       │
  ┌────┴──────┐
  ▼           ▼
Feature    Redux Store
Components  (documentSlice / authSlice)
  │           │
  └─────┬─────┘
        ▼
   Axios API Layer
   (→ Context API)
```

**Route guards:**
- `AuthGuard` — redirects to `/login` if no valid JWT
- `AdminGuard` — redirects to `/dashboard` if `role !== 'admin'`

---

## 🔄 State Management

State is managed with **Redux Toolkit** via two slices:

### `authSlice`
Handles the full authentication lifecycle:
- `login` / `register` async thunks
- `fetchProfile` for hydrating the logged-in user on app boot
- Persists token to `localStorage`, auto-attaches to Axios via interceptor

### `documentSlice`
The core data layer for the entire library:

| Thunk | Purpose |
| ----- | ------- |
| `fetchLibraryDocuments` | Server-side pagination, sorting, tag filtering |
| `uploadFileDocument` | Uploads physical file → injects result at top of list (no reload) |
| `uploadTextDocument` | Uploads text snippet → same instant injection pattern |
| `deleteDocument` | Optimistic removal from local state |
| `fetchSuggestedFocus` | Fetches the top-2 AI-scored focus documents for the Dashboard |

> **Zero-flicker guarantee:** Tags are aggregated from the full list and persisted in Redux state. The sidebar never shifts during pagination because it reads from state, not from the current page response.

---

## ✨ Feature Highlights

<details>
<summary><b>🌪️ Global Dropzone (Frictionless Capture)</b></summary>

The entire application window acts as a drop target — no need to navigate anywhere to upload.

- **Glassmorphism overlay:** Dragging a file triggers a beautiful blur backdrop
- **Smart intercept:** `react-dropzone` configured with `noClick` + `noKeyboard` — normal interactions are never hijacked
- **Dual ingestion:** Supports physical files (PDF, DOCX, Images) and raw text/code snippets via the `UploadModal`

</details>

<details>
<summary><b>🗂️ Smart Library</b></summary>

A full-featured document management interface engineered for power users.

- **Sidebar:** Virtual folder navigation via tags — a document can live in multiple virtual spaces at once
- **Data Grid:** Custom-built table with smart context menus that auto-flip upward near the viewport edge (eliminating the "scrollbar trap")
- **Bulk Actions:** Multi-select mode reveals a floating action bar for mass operations
- **Column sorting + pagination** wired directly to the backend — no client-side sorting hacks

</details>

<details>
<summary><b>📖 Document Reader</b></summary>

A dedicated `/read/:id` route that pairs the document viewer with an AI sidebar.

- **PDF Viewer:** Powered by `react-pdf` with page navigation controls
- **AI Sidebar:** Shows AI-generated title, summary, tags, and cognitive load score
- **RAG Chat:** Ask questions about the document directly in the sidebar — answers are grounded in the document's actual content

</details>

<details>
<summary><b>🔍 Document Comparison</b></summary>

`/compare` lets you pick any two documents from your library and run a deep AI comparison.

- Renders `similarities`, `differences`, `uniqueToA`, and `uniqueToB` in a clean side-by-side layout
- Powered by **Llama 3.3 70B** via Groq on the backend

</details>

<details>
<summary><b>🎯 AI Dashboard</b></summary>

The `/dashboard` is not a generic metrics screen — it's a personalized focus feed.

- **Suggested Focus:** The top-2 documents ranked by `cognitiveLoad + recency + isUnread` score surface automatically
- **Library Stats:** Total documents, storage used, AI processing status breakdown

</details>

<details>
<summary><b>🛡️ Admin Panel</b></summary>

`/admin` is protected by `AdminGuard` and provides platform-level management.

- KPI stats (total users, storage, traffic)
- Paginated + searchable user table with suspend/unsuspend actions
- CSV export of all users

</details>

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 8.x | Build tool + dev server |
| Redux Toolkit | 2.x | Global state management |
| React Router | 7.x | Client-side routing + guards |
| Tailwind CSS | 4.x | Utility-first styling |
| Axios | 1.x | HTTP client with JWT interceptor |
| react-dropzone | 15.x | Global drag-and-drop capture |
| react-pdf | 10.x | In-browser PDF rendering |
| Phosphor Icons | 2.x | Icon library |
| lucide-react | 1.x | Secondary icon set |
| clsx | 2.x | Conditional class names |

---

## 📁 Project Structure

```
context-front/
│
├── 📂 public/
│
├── 📂 src/
│   ├── App.tsx                         ← Pure router — no business logic
│   ├── main.tsx                        ← React entry point + Redux Provider
│   │
│   ├── 📂 components/
│   │   ├── 📂 layout/
│   │   │   └── MainLayout.tsx          ← Sidebar + topbar shell for all app routes
│   │   └── 📂 ui/                      ← Shared primitive components
│   │       ├── ContextLogo.tsx         ← The three-node neural graph logo (SVG)
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── ToastEngine.tsx         ← Global toast notification system
│   │       ├── ConfirmDialog.tsx
│   │       ├── RenameDialog.tsx
│   │       └── skeletons/              ← Loading skeleton components
│   │
│   ├── 📂 features/                    ← Feature-sliced domain logic
│   │   ├── 📂 auth/                    ← AuthGuard, AdminGuard, login hooks
│   │   ├── 📂 library/                 ← SmartLibrary components + upload modal
│   │   │   ├── LibrarySidebar.tsx
│   │   │   ├── LibraryTable.tsx
│   │   │   ├── LibraryHeader.tsx
│   │   │   ├── LibraryDragOverlay.tsx
│   │   │   ├── BulkActionBar.tsx
│   │   │   └── UploadModal.tsx
│   │   ├── 📂 reader/                  ← PDF viewer + AI sidebar
│   │   ├── 📂 comparison/              ← Compare UI
│   │   ├── 📂 dashboard/               ← Suggested focus + stats cards
│   │   ├── 📂 ai-sidebar/              ← RAG chat panel
│   │   ├── 📂 search/                  ← Semantic search UI
│   │   ├── 📂 admin/                   ← Admin dashboard components
│   │   └── 📂 settings/                ← User preferences
│   │
│   ├── 📂 pages/                       ← Route-level page components (thin shells)
│   │   ├── HomePage/
│   │   ├── dashboard.tsx
│   │   ├── Smartlibrary.tsx
│   │   ├── compare.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── profile.tsx
│   │   ├── settings.tsx
│   │   ├── admin.tsx
│   │   ├── read/
│   │   └── NotFoundPage.tsx
│   │
│   ├── 📂 store/                       ← Redux Toolkit configuration
│   │   ├── store.ts                    ← Root store + Axios interceptor setup
│   │   ├── authSlice.ts                ← Auth state + thunks
│   │   ├── documentSlice.ts            ← Document state + all CRUD thunks
│   │   └── hooks.ts                    ← Typed useAppDispatch / useAppSelector
│   │
│   ├── 📂 config/                      ← API base URL + Axios instance
│   ├── 📂 hooks/                       ← Shared custom hooks
│   ├── 📂 types/                       ← Shared TypeScript interfaces
│   ├── 📂 lib/                         ← Utility functions (clsx, etc.)
│   └── index.css                       ← Tailwind base + global design tokens
│
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js ≥ 18.x
- The [Context API](https://github.com/Ahmed-ElKashif/Context-api) running locally on port `5000`

### 1. Install Dependencies

```bash
cd context-front
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start the Dev Server

```bash
npm run dev
# ✅  App running at http://localhost:5173
```

> Make sure the Context API is running at port `5000` before launching the frontend.

---

## 🎨 Brand & Colors

Context uses a dual-mode design system. All tokens are defined in `index.css` and consumed via Tailwind utility classes.

| Token | Light Mode | Dark Mode | Hex (Light) |
| ---------------------- | ---------- | -------------- | ----------- |
| `primary` | Indigo | Indigo-lighter | `#4F46E5` |
| `accent` / `secondary` | Violet | Purple | `#7C3AED` |
| `text` | Slate-700 | White | `#334155` |
| `border` | Slate-200 | White/20 | `#E2E8F0` |
| `background` | White | Slate-900 | `#FFFFFF` |

The **ContextLogo** (`ContextLogo.tsx`) is a three-node neural graph SVG — two input nodes (your documents) converging into one intelligent core — the visual metaphor for Context turning raw files into unified intelligence.

---

## 🌿 Team & Workflow

### Git Rules

1. **Never push directly to `main` or `dev`**
2. **Branch off `dev`** — format: `feat/reader-sidebar`, `fix/table-scroll`, `ui/dashboard-cards`
3. **Conventional commits:** `feat:`, `fix:`, `ui:`, `chore:`, `docs:`
4. **PR to `dev`** — 1 approval from rotation partner required before merge
5. **Must pass:** `tsc --noEmit` + `npm run build` (zero build warnings) before opening a PR

### Feature Ownership Rule

> If you're working on the Library, keep all changes inside `src/features/library/`.  
> Shared primitives go into `src/components/ui/`. Shared types go into `src/types/`.

---

<div align="center">

<img src="./docs/logo.svg" width="48" height="48" alt="Context Logo" />

**Built with ❤️ by 🧠 Contexters — ITI ITP R2 2026**

_"Your documents shouldn't just be stored. They should think."_

</div>
