import { app, BrowserWindow, session, screen } from "electron";
import * as path from "path";
import { IPC_CHANNELS } from "../../shared/ipc-channels";
import { getStore } from "../utils/store";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

let initialCliArgs: { action: string; path: string } | null = null;

export function getInitialCliArgs() {
  return initialCliArgs;
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

    if (!mainWindow) {
      initialCliArgs = { action, path: filePath };
    } else {
      mainWindow.webContents.send(
        IPC_CHANNELS.APP.ON_CLI_ARGS,
        action,
        filePath,
      );
    }
  }
}

export async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const store = await getStore();
  
  // Load saved state or use defaults. Default to maximized on first install!
  const savedState = store.get("windowState", {
    width: width,
    height: height,
    x: undefined,
    y: undefined,
    isMaximized: true,
    isFullScreen: false,
  });

  mainWindow = new BrowserWindow({
    x: savedState.x,
    y: savedState.y,
    width: savedState.width,
    height: savedState.height,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../../renderer/favicon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../../preload/index.js"),
      sandbox: true,
    },
  });

  mainWindow.setMenu(null);

  mainWindow.once("ready-to-show", () => {
    if (savedState.isMaximized) {
      mainWindow?.maximize();
    }
    if (savedState.isFullScreen) {
      mainWindow?.setFullScreen(true);
    }
    mainWindow?.show();
  });

  // Track state manually to avoid the Windows "unmaximize on close" bug
  let currentIsMaximized = savedState.isMaximized;
  let currentIsFullScreen = savedState.isFullScreen;

  mainWindow.on('maximize', () => currentIsMaximized = true);
  mainWindow.on('unmaximize', () => currentIsMaximized = false);
  mainWindow.on('enter-full-screen', () => currentIsFullScreen = true);
  mainWindow.on('leave-full-screen', () => currentIsFullScreen = false);
  
  mainWindow.on("close", () => {
    // Save true state right before destruction
    if (mainWindow) {
      // Normal bounds are completely messed up if maximized, so we only save them if NOT maximized
      const bounds = mainWindow.getBounds();
      
      store.set("windowState", {
        // If maximized, keep the old bounds so we remember the un-maximized size!
        x: currentIsMaximized ? savedState.x : bounds.x,
        y: currentIsMaximized ? savedState.y : bounds.y,
        width: currentIsMaximized ? savedState.width : bounds.width,
        height: currentIsMaximized ? savedState.height : bounds.height,
        isMaximized: currentIsMaximized,
        isFullScreen: currentIsFullScreen,
      });
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../../renderer/index.html"));

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const scriptSrc = isDev 
      ? "'self' 'unsafe-inline' 'unsafe-eval'" 
      : "'self' 'unsafe-inline'";

    const connectSrc = isDev
      ? "'self' http://localhost:5000 ws://localhost:5000 https://context-sfs.up.railway.app wss://context-sfs.up.railway.app https://res.cloudinary.com"
      : "'self' https://context-sfs.up.railway.app wss://context-sfs.up.railway.app https://res.cloudinary.com";
      
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          `default-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src ${scriptSrc}; img-src 'self' data: *; connect-src ${connectSrc}`,
        ],
      },
    });
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on("did-finish-load", () => {
    // Explicitly cache for the pull-based API we added
    const actionArg = process.argv.find((arg) => arg.startsWith("--action="));
    const pathArg = process.argv.find((arg) => arg.startsWith("--path="));
    if (actionArg && pathArg) {
      let filePath = pathArg.substring("--path=".length);
      if (filePath.startsWith('"') && filePath.endsWith('"')) {
        filePath = filePath.substring(1, filePath.length - 1);
      }
      initialCliArgs = { action: actionArg.split("=")[1], path: filePath };
    }
  });

  mainWindow.webContents.on(
    "console-message",
    (_event, level, message, line, sourceId) => {
      console.log(`[Renderer Console] ${message}`);
    },
  );
}

