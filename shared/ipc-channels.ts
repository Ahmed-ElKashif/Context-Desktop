export const IPC_CHANNELS = {
  APP: {
    GET_VERSION: 'app:get-version',
    ON_CLI_ARGS: 'app:on-cli-args',
    GET_INITIAL_CLI_ARGS: 'app:get-initial-cli-args',
    SET_STARTUP: 'app:set-startup',
    GET_STARTUP: 'app:get-startup',
    SHOW_NOTIFICATION: 'app:show-notification',
    NOTIFICATION_CLICKED: 'app:notification-clicked',
    REG_CONTEXT_MENU: 'app:reg-context-menu',
    UNREG_CONTEXT_MENU: 'app:unreg-context-menu',
    GET_CONTEXT_MENU_STATUS: 'app:get-context-menu-status',
  },
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
  },
  FILE: {
    SELECT_BATCH_FOLDER: 'file:select-batch-folder',
    PROCESS_DROPPED_PATHS: 'file:process-dropped-paths',
    GET_FILE_ICON: 'file:get-icon',
    INGEST_BATCH_START: 'batch:ingest-start',
    INGEST_BATCH_PROGRESS: 'batch:ingest-progress',
    DND_FILES_DROPPED: 'dnd:files-dropped',
    SELECT_DIRECTORY: 'file:select-directory',
    EXPORT_ORGANIZED_FILES: 'file:export-organized',
    SHOW_ITEM_IN_FOLDER: 'file:show-item-in-folder',
    SAVE_COMPARISON_REPORT: 'file:save-comparison-report',
  },
  STORE: {
    GET: 'store:get',
    SET: 'store:set',
    DELETE: 'store:delete',
  },
  UPDATER: {
    CHECK_FOR_UPDATES: 'updater:check',
    QUIT_AND_INSTALL: 'updater:quit-and-install',
    ON_UPDATE_AVAILABLE: 'updater:available',
    ON_UPDATE_NOT_AVAILABLE: 'updater:not-available',
    ON_UPDATE_DOWNLOADED: 'updater:downloaded',
    ON_UPDATE_ERROR: 'updater:error',
  },
  NOTIFICATION: {
    AI_COMPLETE: 'notification:ai-complete',
  }
} as const;
