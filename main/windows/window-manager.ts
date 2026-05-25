import { app, BrowserWindow, session } from "electron";
import * as path from "path";
import { IPC_CHANNELS } from "../../shared/ipc-channels";

let mainWindow: BrowserWindow | null = null;
let quickCaptureWin: BrowserWindow | null = null;

const isDev = !app.isPackaged;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function getQuickCaptureWin(): BrowserWindow | null {
  return quickCaptureWin;
}

export function handleCliArgs(argv: string[]) {
  const actionArg = argv.find((arg) => arg.startsWith("--action="));
  const pathArg = argv.find((arg) => arg.startsWith("--path="));

  if (actionArg && pathArg) {
    const action = actionArg.split("=")[1];
    let filePath = pathArg.substring("--path=".length);
    if (filePath.startsWith('"') && filePath.endsWith('"')) {
      filePath = filePath.substring(1, filePath.length - 1);
    }

    mainWindow?.webContents.send(
      IPC_CHANNELS.APP.ON_CLI_ARGS,
      action,
      filePath,
    );
  }
}

export function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../../renderer/favicon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../../preload/index.js"),
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../../renderer/index.html"));

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

export function toggleQuickCapture() {
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
        preload: path.join(__dirname, "../../preload/index.js"),
      },
    });

    const routeUrl = isDev 
      ? "http://localhost:5173/#/quick-capture" 
      : `file://${path.join(__dirname, "../../renderer/index.html")}#/quick-capture`;

    quickCaptureWin.loadURL(routeUrl);
    
    quickCaptureWin.on("closed", () => {
      quickCaptureWin = null;
    });

    quickCaptureWin.on("blur", () => {
      quickCaptureWin?.hide();
    });
  }
}
