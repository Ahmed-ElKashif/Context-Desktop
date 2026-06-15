import { app } from 'electron';
import Registry from 'winreg';

const DIR_KEY_PATH = '\\Software\\Classes\\Directory\\shell\\Upload to Context';
const FILE_KEY_PATH = '\\Software\\Classes\\*\\shell\\Upload to Context';

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

async function regDeleteTree(keyPath: string): Promise<void> {
  // Delete known child key first (command subkey), then the parent.
  // winreg's .destroy() cannot delete a key that has child keys on some Windows versions.
  await regDelete(`${keyPath}\\command`);
  await regDelete(keyPath);
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
  await regSet(DIR_KEY_PATH, 'MUIVerb', Registry.REG_SZ, 'Upload to Context');
  await regSet(DIR_KEY_PATH, 'Icon', Registry.REG_SZ, `"${iconPath}",0`);
  await regSet(`${DIR_KEY_PATH}\\command`, '', Registry.REG_SZ, commandStr);
}

export async function unregisterFolderContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;
  await regDeleteTree(DIR_KEY_PATH);
}

const SUPPORTED_EXTENSIONS = [
  '.pdf', '.png', '.jpeg', '.jpg', '.webp',
  '.csv', '.doc', '.docx', '.xls', '.xlsx'
];

export async function registerFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;

  const iconPath = process.execPath;
  const commandStr = `"${process.execPath}" --action=upload --path="%1"`;

  // Clean up ALL legacy global wildcard registrations
  await regDeleteTree('\\Software\\Classes\\*\\shell\\ContextAppFile');
  await regDeleteTree('\\Software\\Classes\\*\\shell\\ContextApp');

  for (const ext of SUPPORTED_EXTENSIONS) {
    const keyPath = `\\Software\\Classes\\SystemFileAssociations\\${ext}\\shell\\Upload to Context`;
    await regSet(keyPath, '', Registry.REG_SZ, 'Upload to Context');
    await regSet(keyPath, 'MUIVerb', Registry.REG_SZ, 'Upload to Context');
    await regSet(keyPath, 'Icon', Registry.REG_SZ, `"${iconPath}",0`);
    await regSet(`${keyPath}\\command`, '', Registry.REG_SZ, commandStr);
  }
}

export async function unregisterFileContextMenu(): Promise<void> {
  if (process.platform !== 'win32') return;
  
  // Clean up ALL legacy global wildcard registrations
  await regDeleteTree('\\Software\\Classes\\*\\shell\\ContextAppFile');
  await regDeleteTree('\\Software\\Classes\\*\\shell\\ContextApp');
  await regDeleteTree(FILE_KEY_PATH); // THE FIX: Delete the global wildcard if it exists from older dev installs

  for (const ext of SUPPORTED_EXTENSIONS) {
    const keyPath = `\\Software\\Classes\\SystemFileAssociations\\${ext}\\shell\\Upload to Context`;
    await regDeleteTree(keyPath);
    // Also clean up the old name just in case
    await regDeleteTree(`\\Software\\Classes\\SystemFileAssociations\\${ext}\\shell\\ContextAppFile`);
  }
}

export async function cleanupStaleRegistryKeys(): Promise<void> {
  if (process.platform !== 'win32') return;

  // Check if any stale wildcard keys exist from the old installer
  const hadWildcardFile = await regKeyExists('\\Software\\Classes\\*\\shell\\ContextApp');
  const hadWildcardFile2 = await regKeyExists('\\Software\\Classes\\*\\shell\\ContextAppFile');

  // Remove them
  await regDeleteTree('\\Software\\Classes\\*\\shell\\ContextApp');
  await regDeleteTree('\\Software\\Classes\\*\\shell\\ContextAppFile');
  await regDeleteTree(FILE_KEY_PATH); // THE FIX: Clean up any old global wildcards
  await regDeleteTree('\\Software\\Classes\\Directory\\shell\\ContextApp');

  // If stale keys existed, the user had context menu enabled via the old installer.
  // Re-register with the correct per-extension + directory keys so nothing breaks.
  if (hadWildcardFile || hadWildcardFile2) {
    const dirExists = await regKeyExists(DIR_KEY_PATH);
    if (!dirExists) {
      await registerFolderContextMenu();
    }
    // Re-register per-extension file entries (idempotent — overwrites if already correct)
    await registerFileContextMenu();
  }
}
