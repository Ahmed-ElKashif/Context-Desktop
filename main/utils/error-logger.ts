import { app } from "electron";
import * as path from "path";
import * as fs from "fs";

export const logError = (type: string, err: any) => {
  try {
    const logsDir = app.getPath('logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logFile = path.join(logsDir, 'error.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${err?.stack || err?.message || err}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.error(logMessage);
  } catch (e) {
    console.error("Failed to write to log file:", e);
    console.error("Original error:", err);
  }
};

export const setupErrorLogger = () => {
  process.on('uncaughtException', (err) => {
    logError('uncaughtException', err);
  });

  process.on('unhandledRejection', (reason) => {
    logError('unhandledRejection', reason);
  });
};
