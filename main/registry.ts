import { exec } from 'child_process';
import { app } from 'electron';

const DIR_KEY_PATH = 'HKCU\\Software\\Classes\\Directory\\shell\\ContextApp';
const FILE_KEY_PATH = 'HKCU\\Software\\Classes\\*\\shell\\ContextAppFile';

function runRegCmd(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function getContextMenuStatus(): Promise<boolean> {
  if (process.platform !== 'win32') return false;
  try {
    await runRegCmd(`reg query "${DIR_KEY_PATH}"`);
    return true; // Key exists
  } catch (err) {
    return false; // Key does not exist
  }
}

export async function registerFolderContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;

  const iconPath = process.execPath;
  const commandStr = `\\"${process.execPath}\\" --action=organize --path=\\"%V\\"`;

  await runRegCmd(`reg add "${DIR_KEY_PATH}" /ve /t REG_SZ /d "Organize with Context" /f`);
  await runRegCmd(`reg add "${DIR_KEY_PATH}" /v "Icon" /t REG_SZ /d "\\"${iconPath}\\",0" /f`);
  await runRegCmd(`reg add "${DIR_KEY_PATH}\\command" /ve /t REG_SZ /d "${commandStr}" /f`);
}

export async function unregisterFolderContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;
  try {
    await runRegCmd(`reg delete "${DIR_KEY_PATH}" /f`);
  } catch (err) {
    // Ignore error if key doesn't exist
  }
}

const SUPPORTED_EXTENSIONS = [
  '.pdf', '.png', '.jpeg', '.jpg', '.webp',
  '.csv', '.doc', '.docx', '.xls', '.xlsx'
];

export async function registerFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;

  const iconPath = process.execPath;
  const commandStr = `\\"${process.execPath}\\" --action=summarize --path=\\"%1\\"`;

  // Clean up legacy global registration
  try { await runRegCmd(`reg delete "HKCU\\Software\\Classes\\*\\shell\\ContextAppFile" /f`); } catch (e) {}

  for (const ext of SUPPORTED_EXTENSIONS) {
    const keyPath = `HKCU\\Software\\Classes\\SystemFileAssociations\\${ext}\\shell\\ContextAppFile`;
    await runRegCmd(`reg add "${keyPath}" /ve /t REG_SZ /d "Summarize with Context" /f`);
    await runRegCmd(`reg add "${keyPath}" /v "Icon" /t REG_SZ /d "\\"${iconPath}\\",0" /f`);
    await runRegCmd(`reg add "${keyPath}\\command" /ve /t REG_SZ /d "${commandStr}" /f`);
  }
}

export async function unregisterFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;
  
  // Clean up legacy global registration
  try { await runRegCmd(`reg delete "HKCU\\Software\\Classes\\*\\shell\\ContextAppFile" /f`); } catch (e) {}

  for (const ext of SUPPORTED_EXTENSIONS) {
    const keyPath = `HKCU\\Software\\Classes\\SystemFileAssociations\\${ext}\\shell\\ContextAppFile`;
    try {
      await runRegCmd(`reg delete "${keyPath}" /f`);
    } catch (err) {
      // Ignore error if key doesn't exist
    }
  }
}
