import { app, BrowserWindow, session, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import FormData from "form-data";
import mime from "mime-types";
import { IPC_CHANNELS } from "../shared/ipc-channels";

let mainWindow: BrowserWindow | null = null;

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
    // Parse CLI arguments: --action=... and --path=...
    const actionArg = process.argv.find((arg) => arg.startsWith("--action="));
    const pathArg = process.argv.find((arg) => arg.startsWith("--path="));

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
            }
          } catch (err: any) {
            console.error(
              "[Main Process] Auto-upload for summarize failed:",
              err.message,
            );
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
  });

  mainWindow.webContents.on(
    "console-message",
    (_event, level, message, line, sourceId) => {
      console.log(`[Renderer Console] ${message}`);
    },
  );
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Setup IPC Handlers
ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, () => app.getVersion());

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
      const files = await fs.promises.readdir(directoryPath, {
        withFileTypes: true,
      });
      // Only return top-level files (not directories) to simplify the prototype
      return files
        .filter((dirent) => dirent.isFile())
        .map((dirent) => ({
          name: dirent.name,
          path: path.join(directoryPath, dirent.name),
        }));
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
  const supportedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const walkSync = (dir: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        walkSync(filepath);
      } else {
        const fileMime = mime.lookup(filepath) || "";
        if (supportedTypes.includes(fileMime)) {
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

ipcMain.handle(IPC_CHANNELS.FILE.PROCESS_DROPPED_PATHS, async (_event, paths: string[]) => {
  if (!paths || paths.length === 0) return null;

  const fileList: any[] = [];
  const supportedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const walkSync = (dir: string, rootFolder: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        walkSync(filepath, rootFolder);
      } else {
        const fileMime = mime.lookup(filepath) || "";
        if (supportedTypes.includes(fileMime)) {
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
      if (supportedTypes.includes(fileMime)) {
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
