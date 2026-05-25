import { contextBridge, ipcRenderer } from 'electron';

// Inline IPC channels to avoid sandbox module resolution restrictions
const IPC_CHANNELS = {
  APP: { GET_VERSION: 'app:get-version', ON_CLI_ARGS: 'app:on-cli-args', SET_STARTUP: 'app:set-startup', GET_STARTUP: 'app:get-startup', SHOW_NOTIFICATION: 'app:show-notification', NOTIFICATION_CLICKED: 'app:notification-clicked', REG_CONTEXT_MENU: 'app:reg-context-menu', UNREG_CONTEXT_MENU: 'app:unreg-context-menu', GET_CONTEXT_MENU_STATUS: 'app:get-context-menu-status' },
  WINDOW: { MINIMIZE: 'window:minimize', MAXIMIZE: 'window:maximize', CLOSE: 'window:close', CLOSE_QUICK_CAPTURE: 'window:close-quick-capture' },
  FILE: { SELECT_BATCH_FOLDER: 'file:select-batch-folder', PROCESS_DROPPED_PATHS: 'file:process-dropped-paths', GET_FILE_ICON: 'file:get-icon', INGEST_BATCH_START: 'batch:ingest-start', INGEST_BATCH_PROGRESS: 'batch:ingest-progress', DND_FILES_DROPPED: 'dnd:files-dropped', SELECT_DIRECTORY: 'file:select-directory', EXPORT_ORGANIZED_FILES: 'file:export-organized', SHOW_ITEM_IN_FOLDER: 'file:show-item-in-folder', SAVE_COMPARISON_REPORT: 'file:save-comparison-report' },
  STORE: { GET: 'store:get', SET: 'store:set', DELETE: 'store:delete' },
  UPDATER: { CHECK_FOR_UPDATES: 'updater:check', ON_UPDATE_AVAILABLE: 'updater:available', ON_UPDATE_DOWNLOADED: 'updater:downloaded' },
  NOTIFICATION: { AI_COMPLETE: 'notification:ai-complete' }
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
    getStartup: () => ipcRenderer.invoke(IPC_CHANNELS.APP.GET_STARTUP),
    setStartup: (enabled: boolean) => ipcRenderer.invoke(IPC_CHANNELS.APP.SET_STARTUP, enabled),
    showNotification: (title: string, body: string, payload?: any) => ipcRenderer.send(IPC_CHANNELS.APP.SHOW_NOTIFICATION, title, body, payload),
    onNotificationClicked: (callback: (payload: any) => void) => {
      const listener = (_event: any, payload: any) => callback(payload);
      ipcRenderer.on(IPC_CHANNELS.APP.NOTIFICATION_CLICKED, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.APP.NOTIFICATION_CLICKED, listener);
    },
    registerContextMenu: () => ipcRenderer.invoke(IPC_CHANNELS.APP.REG_CONTEXT_MENU),
    unregisterContextMenu: () => ipcRenderer.invoke(IPC_CHANNELS.APP.UNREG_CONTEXT_MENU),
    getContextMenuStatus: () => ipcRenderer.invoke(IPC_CHANNELS.APP.GET_CONTEXT_MENU_STATUS),
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.CLOSE),
    closeQuickCapture: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.CLOSE_QUICK_CAPTURE),
  },
  file: {
    showItemInFolder: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.SHOW_ITEM_IN_FOLDER, filePath),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE.GET, key),
    set: (key: string, value: any) => ipcRenderer.invoke(IPC_CHANNELS.STORE.SET, key, value),
    delete: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE.DELETE, key),
  },
  localFiles: {
    selectDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.FILE.SELECT_DIRECTORY),
    exportOrganizedFiles: (baseDir: string, files: { url: string; relativePath: string; localSourcePath?: string }[]) => ipcRenderer.invoke(IPC_CHANNELS.FILE.EXPORT_ORGANIZED_FILES, baseDir, files),
    processDroppedPaths: (paths: string[]) => ipcRenderer.invoke(IPC_CHANNELS.FILE.PROCESS_DROPPED_PATHS, paths),
    getFileIcon: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.GET_FILE_ICON, filePath),
    saveComparisonReport: (content: string, defaultFilename: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.SAVE_COMPARISON_REPORT, content, defaultFilename),
    startBatchIngest: (payload: { token: string; apiUrl: string; files: any[] }) => 
      ipcRenderer.invoke(IPC_CHANNELS.FILE.INGEST_BATCH_START, payload),
    onBatchProgress: (callback: (event: any, data: any) => void) =>
      ipcRenderer.on(IPC_CHANNELS.FILE.INGEST_BATCH_PROGRESS, callback),
    offBatchProgress: (callback: (event: any, data: any) => void) =>
      ipcRenderer.removeListener(IPC_CHANNELS.FILE.INGEST_BATCH_PROGRESS, callback),
    onFilesDropped: (callback: (paths: string[]) => void) => {
      const listener = (_event: any, paths: string[]) => callback(paths);
      ipcRenderer.on(IPC_CHANNELS.FILE.DND_FILES_DROPPED, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.FILE.DND_FILES_DROPPED, listener);
    },
  },
  updater: {
    checkForUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER.CHECK_FOR_UPDATES),
    onUpdateAvailable: (callback: (info: any) => void) => {
      const listener = (_event: any, info: any) => callback(info);
      ipcRenderer.on(IPC_CHANNELS.UPDATER.ON_UPDATE_AVAILABLE, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATER.ON_UPDATE_AVAILABLE, listener);
    },
    onUpdateDownloaded: (callback: (info: any) => void) => {
      const listener = (_event: any, info: any) => callback(info);
      ipcRenderer.on(IPC_CHANNELS.UPDATER.ON_UPDATE_DOWNLOADED, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATER.ON_UPDATE_DOWNLOADED, listener);
    }
  },
  notifications: {
    onAIComplete: (callback: (payload: { message: string }) => void) => {
      const listener = (_event: any, payload: { message: string }) => callback(payload);
      ipcRenderer.on(IPC_CHANNELS.NOTIFICATION.AI_COMPLETE, listener);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION.AI_COMPLETE, listener);
    }
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
