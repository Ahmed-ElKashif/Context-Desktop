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

export async function registerFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;

  const iconPath = process.execPath;
  const commandStr = `\\"${process.execPath}\\" --action=summarize --path=\\"%1\\"`;

  await runRegCmd(`reg add "${FILE_KEY_PATH}" /ve /t REG_SZ /d "Summarize with Context" /f`);
  await runRegCmd(`reg add "${FILE_KEY_PATH}" /v "Icon" /t REG_SZ /d "\\"${iconPath}\\",0" /f`);
  await runRegCmd(`reg add "${FILE_KEY_PATH}\\command" /ve /t REG_SZ /d "${commandStr}" /f`);
}

export async function unregisterFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;
  try {
    await runRegCmd(`reg delete "${FILE_KEY_PATH}" /f`);
  } catch (err) {
    // Ignore error if key doesn't exist
  }
}
