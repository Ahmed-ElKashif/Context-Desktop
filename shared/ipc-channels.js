"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
exports.IPC_CHANNELS = {
    APP: {
        GET_VERSION: 'app:get-version',
        ON_CLI_ARGS: 'app:on-cli-args',
    },
    WINDOW: {
        MINIMIZE: 'window:minimize',
        MAXIMIZE: 'window:maximize',
        CLOSE: 'window:close',
    },
    FILE: {
        UPLOAD_FOR_SUMMARY: 'file:upload-for-summary',
    }
};
