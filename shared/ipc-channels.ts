export const IPC_CHANNELS = {
  APP: {
    GET_VERSION: 'app:get-version',
    ON_CLI_ARGS: 'app:on-cli-args',
    CONTEXT_MENU_ORGANIZE: 'app:context-menu-organize',
    CONTEXT_MENU_SUMMARIZE: 'app:context-menu-summarize',
  },
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
  },
  FILE: {
    UPLOAD_FOR_SUMMARY: 'file:upload-for-summary',
    READ_DIR: 'file:read-dir',
    APPLY_FILESYSTEM: 'file:apply-filesystem',
    SELECT_BATCH_FOLDER: 'file:select-batch-folder',
    READ_FILE_BUFFER: 'file:read-file-buffer',
    PROCESS_DROPPED_PATHS: 'file:process-dropped-paths',
  },
  STORE: {
    GET: 'store:get',
    SET: 'store:set',
    DELETE: 'store:delete',
  }
} as const;
