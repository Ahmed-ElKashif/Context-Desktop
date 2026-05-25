import { app } from 'electron';
import Registry from 'winreg';

const DIR_KEY_PATH = '\\Software\\Classes\\Directory\\shell\\ContextApp';
const FILE_KEY_PATH = '\\Software\\Classes\\*\\shell\\ContextAppFile';

function regKeyExists(keyPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const regKey = new Registry({
      hive: Registry.HKCU,
      key: keyPath
    });
    regKey.keyExists((err, exists) => {
      resolve(!err && exists);
    });
  });
}

function regSet(keyPath: string, name: string, type: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const regKey = new Registry({
      hive: Registry.HKCU,
      key: keyPath
    });
    regKey.create((err) => {
      if (err) return reject(err);
      regKey.set(name, type, value, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

function regDelete(keyPath: string): Promise<void> {
  return new Promise((resolve) => {
    const regKey = new Registry({
      hive: Registry.HKCU,
      key: keyPath
    });
    regKey.destroy(() => resolve()); // Ignore errors if it doesn't exist
  });
}

export async function getContextMenuStatus(): Promise<boolean> {
  if (process.platform !== 'win32') return false;
  return await regKeyExists(DIR_KEY_PATH);
}

export async function registerFolderContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;

  const iconPath = process.execPath;
  const commandStr = `"${process.execPath}" --action=upload --path="%V"`;

  await regSet(DIR_KEY_PATH, '', Registry.REG_SZ, 'Upload to Context');
  await regSet(DIR_KEY_PATH, 'Icon', Registry.REG_SZ, `"${iconPath}",0`);
  await regSet(`${DIR_KEY_PATH}\\command`, '', Registry.REG_SZ, commandStr);
}

export async function unregisterFolderContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;
  await regDelete(DIR_KEY_PATH);
}

const SUPPORTED_EXTENSIONS = [
  '.pdf', '.png', '.jpeg', '.jpg', '.webp',
  '.csv', '.doc', '.docx', '.xls', '.xlsx'
];

export async function registerFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;

  const iconPath = process.execPath;
  const commandStr = `"${process.execPath}" --action=upload --path="%1"`;

  // Clean up legacy global registration
  await regDelete('\\Software\\Classes\\*\\shell\\ContextAppFile');

  for (const ext of SUPPORTED_EXTENSIONS) {
    const keyPath = `\\Software\\Classes\\SystemFileAssociations\\${ext}\\shell\\ContextAppFile`;
    await regSet(keyPath, '', Registry.REG_SZ, 'Upload to Context');
    await regSet(keyPath, 'Icon', Registry.REG_SZ, `"${iconPath}",0`);
    await regSet(`${keyPath}\\command`, '', Registry.REG_SZ, commandStr);
  }
}

export async function unregisterFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;
  
  // Clean up legacy global registration
  await regDelete('\\Software\\Classes\\*\\shell\\ContextAppFile');

  for (const ext of SUPPORTED_EXTENSIONS) {
    const keyPath = `\\Software\\Classes\\SystemFileAssociations\\${ext}\\shell\\ContextAppFile`;
    await regDelete(keyPath);
  }
}
