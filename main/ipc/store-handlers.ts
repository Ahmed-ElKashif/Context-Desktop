import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipc-channels";
import { getStore } from "../utils/store";

export function registerStoreHandlers() {
  ipcMain.handle(IPC_CHANNELS.STORE.GET, async (_event, key: string) => {
    const store = await getStore();
    return store.get(key);
  });
  
  ipcMain.handle(IPC_CHANNELS.STORE.SET, async (_event, key: string, value: any) => {
    const store = await getStore();
    store.set(key, value);
  });
  
  ipcMain.handle(IPC_CHANNELS.STORE.DELETE, async (_event, key: string) => {
    const store = await getStore();
    store.delete(key);
  });
}
