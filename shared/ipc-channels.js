"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
exports.IPC_CHANNELS = {
    APP: {
        GET_VERSION: 'app:get-version',
        ON_CLI_ARGS: 'app:on-cli-args',
        CONTEXT_MENU_ORGANIZE: 'app:context-menu-organize',
        CONTEXT_MENU_SUMMARIZE: 'app:context-menu-summarize',
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
        CLOSE_QUICK_CAPTURE: 'window:close-quick-capture',
    },
    FILE: {
        UPLOAD_FOR_SUMMARY: 'file:upload-for-summary',
        READ_DIR: 'file:read-dir',
        APPLY_FILESYSTEM: 'file:apply-filesystem',
        SELECT_BATCH_FOLDER: 'file:select-batch-folder',
        READ_FILE_BUFFER: 'file:read-file-buffer',
        PROCESS_DROPPED_PATHS: 'file:process-dropped-paths',
        GET_FILE_ICON: 'file:get-icon',
        INGEST_BATCH_START: 'batch:ingest-start',
        INGEST_BATCH_PROGRESS: 'batch:ingest-progress',
        DND_FILES_DROPPED: 'dnd:files-dropped',
    },
    STORE: {
        GET: 'store:get',
        SET: 'store:set',
        DELETE: 'store:delete',
    },
    UPDATER: {
        CHECK_FOR_UPDATES: 'updater:check',
        ON_UPDATE_AVAILABLE: 'updater:available',
        ON_UPDATE_DOWNLOADED: 'updater:downloaded',
    },
    NOTIFICATION: {
        AI_COMPLETE: 'notification:ai-complete',
    }
};
