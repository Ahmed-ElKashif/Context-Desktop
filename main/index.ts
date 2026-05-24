import { app, BrowserWindow, session, ipcMain, dialog, Notification, globalShortcut } from "electron";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import FormData from "form-data";
import mime from "mime-types";
import { autoUpdater } from "electron-updater";
import { IPC_CHANNELS } from "../shared/ipc-channels";
import { registerFolderContextMenu, registerFileContextMenu, unregisterFolderContextMenu, unregisterFileContextMenu, getContextMenuStatus } from "./registry";

let mainWindow: BrowserWindow | null = null;
let quickCaptureWin: BrowserWindow | null = null;

// Store Handlers (using lazy load to support ESM/CJS interop)
let _store: any;
async function getStore() {
  if (!_store) {
    const StoreModule = await import("electron-store");
    const Store = StoreModule.default || StoreModule;
    _store = new Store();
  }
  return _store;
}

const isDev = !app.isPackaged;

const SUPPORTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../renderer/favicon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.js"), // Path assumes transpilation preserves folder structure or uses a bundler
      sandbox: true,
    },
  });

  // For now, load a generic placeholder. Will be updated when renderer is built.
  // Load the compiled React app
  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  // Set up Content Security Policy (CSP)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: *; connect-src 'self' https://context-sfs.up.railway.app wss://context-sfs.up.railway.app https://res.cloudinary.com",
        ],
      },
    });
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("did-finish-load", () => {
    handleCliArgs(process.argv);
  });

  mainWindow.webContents.on(
    "console-message",
    (_event, level, message, line, sourceId) => {
      console.log(`[Renderer Console] ${message}`);
    },
  );
}

function handleCliArgs(argv: string[]) {
  const actionArg = argv.find((arg) => arg.startsWith("--action="));
  const pathArg = argv.find((arg) => arg.startsWith("--path="));

  if (actionArg && pathArg) {
    const action = actionArg.split("=")[1];
    const filePath = pathArg.substring("--path=".length);

    if (action === "organize") {
      mainWindow?.webContents.send(
        IPC_CHANNELS.APP.CONTEXT_MENU_ORGANIZE,
        filePath,
      );
    } else if (action === "summarize") {
      (async () => {
        try {
          const store = await getStore();
          const token = store.get("context_token");
          if (!token)
            throw new Error(
              "No auth token found in store. Please log in first.",
            );

          const buffer = fs.readFileSync(filePath);
          const fileName = path.basename(filePath);
          const mimeType =
            mime.lookup(filePath) || "application/octet-stream";

          const form = new FormData();
          form.append("files", buffer, {
            filename: fileName,
            contentType: mimeType,
          });
          form.append("clientPaths", fileName);

          const response = await axios.post(
            "https://context-sfs.up.railway.app/api/documents/upload",
            form,
            {
              headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.data?.data && response.data.data.length > 0) {
            const docId = response.data.data[0]._id;
            mainWindow?.webContents.send(
              IPC_CHANNELS.APP.CONTEXT_MENU_SUMMARIZE,
              docId,
            );
            if (Notification.isSupported()) {
              new Notification({
                title: "Context Upload Success",
                body: "File uploaded and ready to summarize.",
              }).show();
            }
          }
        } catch (err: any) {
          console.error(
            "[Main Process] Auto-upload for summarize failed:",
            err.message,
          );
          const isDuplicate = err.response?.status === 409 || 
                              err.response?.data?.message?.toLowerCase().includes("duplicate") || 
                              err.response?.data?.message?.toLowerCase().includes("exists");
          
          if (Notification.isSupported()) {
            new Notification({
              title: isDuplicate ? "Duplicate Not Permitted" : "Context Upload Failed",
              body: isDuplicate ? "This file already exists in your Context library." : (err.response?.data?.message || err.message || "Failed to upload file to context."),
            }).show();
          }
        }
      })();
    } else {
      mainWindow?.webContents.send(
        IPC_CHANNELS.APP.ON_CLI_ARGS,
        action,
        filePath,
      );
    }
  }
}

function toggleQuickCapture() {
  if (quickCaptureWin) {
    if (quickCaptureWin.isVisible()) {
      quickCaptureWin.hide();
    } else {
      quickCaptureWin.show();
      quickCaptureWin.focus();
    }
  } else {
    quickCaptureWin = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "../preload/index.js"),
      },
    });

    const routeUrl = isDev 
      ? "http://localhost:5173/#/quick-capture" 
      : `file://${path.join(__dirname, "../dist/renderer/index.html")}#/quick-capture`;

    quickCaptureWin.loadURL(routeUrl);
    
    quickCaptureWin.on("closed", () => {
      quickCaptureWin = null;
    });

    quickCaptureWin.on("blur", () => {
      quickCaptureWin?.hide();
    });
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      handleCliArgs(commandLine);
    }
  });

  app.whenReady().then(async () => {
    createWindow();

    globalShortcut.register('CommandOrControl+Shift+Q', () => {
      toggleQuickCapture();
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

  try {
    const store = await getStore();
    const autoUpdateEnabled = store.get("autoUpdate", true);

    // Setup autoUpdater events
    autoUpdater.on("update-available", (info) => {
      mainWindow?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_AVAILABLE, info);
    });
    autoUpdater.on("update-downloaded", (info) => {
      mainWindow?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_DOWNLOADED, info);
    });

    if (autoUpdateEnabled) {
      autoUpdater.checkForUpdatesAndNotify().catch(err => {
        console.error("[Updater] Check failed on startup:", err);
      });
    }
  } catch (e) {
    console.error("[Main Process] Startup logic error:", e);
  }
});
}

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Setup IPC Handlers
ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, () => app.getVersion());

ipcMain.handle(IPC_CHANNELS.APP.GET_STARTUP, () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle(IPC_CHANNELS.APP.SET_STARTUP, (_event, enabled: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath("exe"),
  });
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on(IPC_CHANNELS.APP.SHOW_NOTIFICATION, (_event, title: string, body: string, payload: any) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      // Windows 10 Action Buttons
      actions: [{ type: "button", text: "View Result" }]
    });

    // Handle generic body click or specific button click
    const handleAction = () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send(IPC_CHANNELS.APP.NOTIFICATION_CLICKED, payload);
      }
    };

    notification.on("click", handleAction);
    notification.on("action", handleAction);
    
    notification.show();
  }
});

// Context Menu Handlers
ipcMain.handle(IPC_CHANNELS.APP.GET_CONTEXT_MENU_STATUS, async () => {
  return await getContextMenuStatus();
});

ipcMain.handle(IPC_CHANNELS.APP.REG_CONTEXT_MENU, async () => {
  await registerFolderContextMenu();
  await registerFileContextMenu();
  return true;
});

ipcMain.handle(IPC_CHANNELS.APP.UNREG_CONTEXT_MENU, async () => {
  await unregisterFolderContextMenu();
  await unregisterFileContextMenu();
  return true;
});



// Updater Handlers
ipcMain.handle(IPC_CHANNELS.UPDATER.CHECK_FOR_UPDATES, async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return result?.updateInfo || null;
  } catch (err: any) {
    console.error("[Updater] Manual check failed:", err);
    throw err;
  }
});

ipcMain.handle(IPC_CHANNELS.WINDOW.MINIMIZE, () => {
  mainWindow?.minimize();
});

ipcMain.handle(IPC_CHANNELS.WINDOW.MAXIMIZE, () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle(IPC_CHANNELS.WINDOW.CLOSE, () => {
  mainWindow?.close();
});
ipcMain.handle(IPC_CHANNELS.WINDOW.CLOSE_QUICK_CAPTURE, () => {
  if (quickCaptureWin) {
    quickCaptureWin.hide();
  }
});

// File Handlers
ipcMain.handle(
  IPC_CHANNELS.FILE.UPLOAD_FOR_SUMMARY,
  async (_event, filePath: string, token: string) => {
    try {
      const buffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const mimeType = mime.lookup(filePath) || "application/octet-stream";

      const form = new FormData();
      form.append("files", buffer, {
        filename: fileName,
        contentType: mimeType,
      });
      form.append("clientPaths", fileName);

      const response = await axios.post(
        "https://context-sfs.up.railway.app/api/documents/upload",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data[0]._id;
      }
      throw new Error("Upload succeeded but no document ID returned.");
    } catch (err: any) {
      console.error(
        "[Main Process] Upload error:",
        err.response?.data || err.message,
      );
      throw err;
    }
  },
);



ipcMain.handle(IPC_CHANNELS.STORE.GET, async (_event, key: string) => {
  const store = await getStore();
  return store.get(key);
});
ipcMain.handle(
  IPC_CHANNELS.STORE.SET,
  async (_event, key: string, value: any) => {
    const store = await getStore();
    store.set(key, value);
  },
);
ipcMain.handle(IPC_CHANNELS.STORE.DELETE, async (_event, key: string) => {
  const store = await getStore();
  store.delete(key);
});

// Local Filesystem Handlers
ipcMain.handle(
  IPC_CHANNELS.FILE.READ_DIR,
  async (_event, directoryPath: string) => {
    try {
      const fileList: any[] = [];

      const walkSync = (dir: string) => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const filepath = path.join(dir, entry);
          const stat = fs.statSync(filepath);
          if (stat.isDirectory()) {
            walkSync(filepath);
          } else {
            const fileMime = mime.lookup(filepath) || "";
            if (SUPPORTED_TYPES.includes(fileMime)) {
              fileList.push({
                name: entry,
                path: filepath,
                mimeType: fileMime,
                size: stat.size,
              });
            }
          }
        }
      };

      walkSync(directoryPath);
      return fileList;
    } catch (err: any) {
      console.error("[Main Process] ReadDir error:", err);
      throw err;
    }
  },
);

ipcMain.handle(IPC_CHANNELS.FILE.SELECT_BATCH_FOLDER, async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const folderPath = result.filePaths[0];
  const fileList: any[] = [];

  const walkSync = (dir: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        walkSync(filepath);
      } else {
        const fileMime = mime.lookup(filepath) || "";
        if (SUPPORTED_TYPES.includes(fileMime)) {
          // relative path so it can be recreated correctly
          const clientPath = path.relative(folderPath, filepath).replace(/\\/g, '/');
          fileList.push({
            name: file,
            path: filepath,
            clientPath: clientPath,
            mimeType: fileMime,
            size: stat.size,
          });
        }
      }
    }
  };

  walkSync(folderPath);
  return { folderPath, files: fileList };
});

ipcMain.handle(IPC_CHANNELS.FILE.INGEST_BATCH_START, async (event, { token, apiUrl, files }) => {
  if (!mainWindow) return;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const formData = new FormData();
      formData.append("files", fs.createReadStream(file.path), file.name);
      if (file.clientPath) {
        formData.append("clientPaths", file.clientPath);
      }
      
      await axios.post(`${apiUrl}/documents/batch`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
      
      mainWindow.webContents.send(IPC_CHANNELS.FILE.INGEST_BATCH_PROGRESS, {
        fileId: file.path,
        status: 'success',
        progress: 100
      });
    } catch (err: any) {
      console.error("[Main Process] Batch upload error:", err.message);
      mainWindow.webContents.send(IPC_CHANNELS.FILE.INGEST_BATCH_PROGRESS, {
        fileId: file.path,
        status: 'failed',
        error: err.response?.data?.message || err.message
      });
    }
  }
});

ipcMain.handle(IPC_CHANNELS.FILE.PROCESS_DROPPED_PATHS, async (_event, paths: string[]) => {
  if (!paths || paths.length === 0) return null;

  const fileList: any[] = [];

  const walkSync = (dir: string, rootFolder: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        walkSync(filepath, rootFolder);
      } else {
        const fileMime = mime.lookup(filepath) || "";
        if (SUPPORTED_TYPES.includes(fileMime)) {
          // relative path from the dropped root
          const rootParent = path.dirname(rootFolder);
          const clientPath = path.relative(rootParent, filepath).replace(/\\/g, '/');
          fileList.push({
            name: file,
            path: filepath,
            clientPath: clientPath,
            mimeType: fileMime,
            size: stat.size,
          });
        }
      }
    }
  };

  for (const itemPath of paths) {
    if (!fs.existsSync(itemPath)) continue;
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      walkSync(itemPath, itemPath);
    } else {
      const fileMime = mime.lookup(itemPath) || "";
      if (SUPPORTED_TYPES.includes(fileMime)) {
        fileList.push({
          name: path.basename(itemPath),
          path: itemPath,
          clientPath: path.basename(itemPath),
          mimeType: fileMime,
          size: stat.size,
        });
      }
    }
  }

  return { files: fileList };
});

ipcMain.handle(IPC_CHANNELS.FILE.READ_FILE_BUFFER, async (_event, filePath: string) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer;
  } catch (err: any) {
    console.error("[Main Process] ReadFileBuffer error:", err);
    throw err;
  }
});

ipcMain.handle(
  IPC_CHANNELS.FILE.APPLY_FILESYSTEM,
  async (_event, directoryPath: string, updates: any[]) => {
    try {
      console.log(
        `[Main Process] Applying ${updates.length} updates to ${directoryPath}`,
      );
      for (const update of updates) {
        if (!update.documentId || !update.newPath) continue;

        const oldPath = path.join(directoryPath, update.documentId);
        // Ensure the new folder path exists
        const targetDir = path.join(directoryPath, update.newPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const newPath = path.join(targetDir, update.documentId);
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }
      }
      return { success: true };
    } catch (err: any) {
      console.error("[Main Process] ApplyFileSystem error:", err);
      throw err;
    }
  },
);
