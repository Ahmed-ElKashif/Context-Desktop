import { app, Menu, MenuItemConstructorOptions } from 'electron';

export function setupApplicationMenu() {
  const isMac = process.platform === 'darwin';

  Menu.setApplicationMenu(null);
}
