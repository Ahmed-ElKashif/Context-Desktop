import log from "electron-log";

export const logError = (type: string, err: any) => {
  log.error(`[${type}]`, err?.stack || err?.message || err);
};

export const setupErrorLogger = () => {
  // Optional: customize electron-log behavior
  log.transports.file.level = 'info';
  
  process.on('uncaughtException', (err) => {
    logError('uncaughtException', err);
  });

  process.on('unhandledRejection', (reason) => {
    logError('unhandledRejection', reason);
  });
  
  log.info("Error logger initialized.");
};

