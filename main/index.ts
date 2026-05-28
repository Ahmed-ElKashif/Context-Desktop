import { app, BrowserWindow, globalShortcut, ipcMain, crashReporter } from "electron";
import { setupErrorLogger } from "./utils/error-logger";
import { setupApplicationMenu } from "./utils/menu";
import { createWindow, getMainWindow, handleCliArgs } from "./windows/window-manager";
import { registerAppHandlers } from "./ipc/app-handlers";
import { registerWindowHandlers } from "./ipc/window-handlers";
import { registerStoreHandlers } from "./ipc/store-handlers";
import { registerUpdaterHandlers } from "./ipc/updater-handlers";
import { registerFileHandlers } from "./ipc/file-handlers";
import { getStore } from "./utils/store";
import { IPC_CHANNELS } from "../shared/ipc-channels";

// 1. Initialize Error Logger and Crash Reporter
crashReporter.start({ submitURL: '', uploadToServer: false });
setupErrorLogger();

// 2. Ensure Single Instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Delay exit slightly to prevent Windows 11 from interpreting a rapid exit 
  // as a shell failure, which triggers the "Open with" dialog.
  setTimeout(() => {
    app.quit();
  }, 400);
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      handleCliArgs(commandLine);
    }
  });

  app.whenReady().then(async () => {
    // 3. Register all IPC Handlers
    registerAppHandlers();
    registerWindowHandlers();
    registerStoreHandlers();
    registerUpdaterHandlers();
    registerFileHandlers();

    // 4. Setup Menu and Create Windows
    setupApplicationMenu();
    await createWindow();

    // 5. Register Global Shortcuts
    globalShortcut.register('CommandOrControl+Shift+C', () => {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });

    // 6. Setup Auto-Updater
    try {
      const store = await getStore();
      const autoUpdateEnabled = store.get("autoUpdate", true);

      if (autoUpdateEnabled) {
        setTimeout(() => {
          import("electron-updater").then(({ autoUpdater }) => {
            autoUpdater.on("update-available", (info) => {
              getMainWindow()?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_AVAILABLE, info);
            });
            autoUpdater.on("update-downloaded", (info) => {
              getMainWindow()?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_DOWNLOADED, info);
            });
            autoUpdater.checkForUpdatesAndNotify().catch(err => {
              console.error("[Updater] Check failed on startup:", err);
            });
          }).catch(err => console.error("[Updater] Failed to import electron-updater", err));
        }, 3000); // Wait 3s after boot to not block main thread
      }
    } catch (e) {
      console.error("[Main Process] Startup logic error:", e);
    }
  });
}

// 7. App Lifecycle Cleanup
app.on("will-quit", () => {
  console.log("[Main Process] Commencing graceful shutdown...");
  globalShortcut.unregisterAll();
  ipcMain.removeAllListeners();
  
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

