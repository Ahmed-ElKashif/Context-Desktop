import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-channels";

export function registerUpdaterHandlers() {
  ipcMain.handle(IPC_CHANNELS.UPDATER.CHECK_FOR_UPDATES, async () => {
    try {
      const { autoUpdater } = await import("electron-updater");
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo || null;
    } catch (err: any) {
      console.error("[Updater] Manual check failed:", err);
      throw err;
    }
  });
}
