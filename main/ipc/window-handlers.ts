import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-channels";
import { getMainWindow, getQuickCaptureWin } from "../windows/window-manager";

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
  
  ipcMain.handle(IPC_CHANNELS.WINDOW.CLOSE_QUICK_CAPTURE, () => {
    const quickCaptureWin = getQuickCaptureWin();
    if (quickCaptureWin) {
      quickCaptureWin.hide();
    }
  });
}
