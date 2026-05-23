import { contextBridge, ipcRenderer } from 'electron';

// Inline IPC channels to avoid sandbox module resolution restrictions
const IPC_CHANNELS = {
  APP: { GET_VERSION: 'app:get-version', ON_CLI_ARGS: 'app:on-cli-args', CONTEXT_MENU_ORGANIZE: 'app:context-menu-organize', CONTEXT_MENU_SUMMARIZE: 'app:context-menu-summarize' },
  WINDOW: { MINIMIZE: 'window:minimize', MAXIMIZE: 'window:maximize', CLOSE: 'window:close' },
  FILE: { UPLOAD_FOR_SUMMARY: 'file:upload-for-summary', READ_DIR: 'file:read-dir', APPLY_FILESYSTEM: 'file:apply-filesystem', SELECT_BATCH_FOLDER: 'file:select-batch-folder', READ_FILE_BUFFER: 'file:read-file-buffer', PROCESS_DROPPED_PATHS: 'file:process-dropped-paths' },
  STORE: { GET: 'store:get', SET: 'store:set', DELETE: 'store:delete' }
} as const;

// Expose a typed, secure API to the renderer process
const electronAPI = {
  app: {
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP.GET_VERSION),
    onCLIArgs: (callback: (action: string, filePath: string) => void) => {
      const listener = (_event: any, action: string, filePath: string) => callback(action, filePath);
      ipcRenderer.on(IPC_CHANNELS.APP.ON_CLI_ARGS, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.APP.ON_CLI_ARGS, listener);
    },
    onContextMenuOrganize: (callback: (filePath: string) => void) => {
      const listener = (_event: any, filePath: string) => callback(filePath);
      ipcRenderer.on(IPC_CHANNELS.APP.CONTEXT_MENU_ORGANIZE, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.APP.CONTEXT_MENU_ORGANIZE, listener);
    },
    onContextMenuSummarize: (callback: (documentId: string) => void) => {
      const listener = (_event: any, documentId: string) => callback(documentId);
      ipcRenderer.on(IPC_CHANNELS.APP.CONTEXT_MENU_SUMMARIZE, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.APP.CONTEXT_MENU_SUMMARIZE, listener);
    },
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.CLOSE),
  },
  file: {
    uploadForSummary: (filePath: string, token: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.FILE.UPLOAD_FOR_SUMMARY, filePath, token),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE.GET, key),
    set: (key: string, value: any) => ipcRenderer.invoke(IPC_CHANNELS.STORE.SET, key, value),
    delete: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE.DELETE, key),
  },
  localFiles: {
    readDir: (directoryPath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.READ_DIR, directoryPath),
    apply: (directoryPath: string, updates: any[]) => ipcRenderer.invoke(IPC_CHANNELS.FILE.APPLY_FILESYSTEM, directoryPath, updates),
    selectBatchFolder: () => ipcRenderer.invoke(IPC_CHANNELS.FILE.SELECT_BATCH_FOLDER),
    processDroppedPaths: (paths: string[]) => ipcRenderer.invoke(IPC_CHANNELS.FILE.PROCESS_DROPPED_PATHS, paths),
    readFileBuffer: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.READ_FILE_BUFFER, filePath),
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
