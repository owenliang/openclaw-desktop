import { BrowserWindow, Menu } from 'electron';

export function createApplicationMenu(mainWindow: BrowserWindow) {
  Menu.setApplicationMenu(null);
}
