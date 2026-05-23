const { app } = require('electron');
const { registerFolderContextMenu, registerFileContextMenu, unregisterFolderContextMenu, unregisterFileContextMenu } = require('./dist/main/registry');

async function run() {
  const mode = process.argv[2];
  try {
    if (mode === 'register') {
      console.log('Registering context menus...');
      await registerFolderContextMenu();
      await registerFileContextMenu();
      console.log('SUCCESS: Menus registered.');
    } else if (mode === 'unregister') {
      console.log('Unregistering context menus...');
      await unregisterFolderContextMenu();
      await unregisterFileContextMenu();
      console.log('SUCCESS: Menus unregistered.');
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    app.quit();
  }
}

app.whenReady().then(run);
