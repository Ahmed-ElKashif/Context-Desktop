import { app, ipcMain, Notification } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-channels";
import { getMainWindow } from "../windows/window-manager";
import { getContextMenuStatus, registerFolderContextMenu, registerFileContextMenu, unregisterFolderContextMenu, unregisterFileContextMenu } from "../registry";

export function registerAppHandlers() {
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
        silent: true,
        actions: [{ type: "button", text: "View Result" }]
      });

      const handleAction = () => {
        const mainWindow = getMainWindow();
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

  ipcMain.handle(IPC_CHANNELS.APP.GET_INITIAL_CLI_ARGS, () => {
    // Import dynamically to avoid circular dependencies if any
    const { getInitialCliArgs } = require("../windows/window-manager");
    return getInitialCliArgs();
  });
}
