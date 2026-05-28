import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-channels";
import { getMainWindow } from "../windows/window-manager";

export function registerWindowHandlers() {
  ipcMain.handle(IPC_CHANNELS.WINDOW.MINIMIZE, () => {
    getMainWindow()?.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW.MAXIMIZE, () => {
    const mainWindow = getMainWindow();
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW.CLOSE, () => {
    getMainWindow()?.close();
  });
}
