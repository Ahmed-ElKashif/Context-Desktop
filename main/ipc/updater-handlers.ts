import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-channels";
import { getMainWindow } from "../windows/window-manager";

let autoUpdaterInstance: any = null;

async function getAutoUpdater() {
  if (!autoUpdaterInstance) {
    const { autoUpdater } = await import("electron-updater");
    autoUpdaterInstance = autoUpdater;

    // Wire up all events ONCE and forward them to the renderer
    autoUpdater.on("update-available", (info: any) => {
      getMainWindow()?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_AVAILABLE, info);
    });

    autoUpdater.on("update-not-available", (info: any) => {
      getMainWindow()?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_NOT_AVAILABLE, info);
    });

    autoUpdater.on("update-downloaded", (info: any) => {
      getMainWindow()?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_DOWNLOADED, info);
    });

    autoUpdater.on("error", (err: Error) => {
      console.error("[Updater] Error:", err.message);
      getMainWindow()?.webContents.send(IPC_CHANNELS.UPDATER.ON_UPDATE_ERROR, err.message);
    });
  }
  return autoUpdaterInstance;
}

export function registerUpdaterHandlers() {
  // Manual "Check for Updates" button
  ipcMain.handle(IPC_CHANNELS.UPDATER.CHECK_FOR_UPDATES, async () => {
    try {
      const updater = await getAutoUpdater();
      await updater.checkForUpdates();
      // Results will come back via the event listeners above
      return true;
    } catch (err: any) {
      console.error("[Updater] Manual check failed:", err);
      throw err;
    }
  });

  // "Install & Restart" button
  ipcMain.handle(IPC_CHANNELS.UPDATER.QUIT_AND_INSTALL, async () => {
    try {
      const updater = await getAutoUpdater();
      updater.quitAndInstall(false, true); // isSilent=false, isForceRunAfter=true
    } catch (err: any) {
      console.error("[Updater] Quit and install failed:", err);
      throw err;
    }
  });
}

/**
 * Called once from main/index.ts on startup (after a 3s delay).
 * Uses the same singleton autoUpdater instance.
 */
export async function checkForUpdatesOnStartup() {
  try {
    const updater = await getAutoUpdater();
    await updater.checkForUpdatesAndNotify();
  } catch (err: any) {
    console.error("[Updater] Startup check failed:", err);
  }
}
