import { ipcMain, Menu, BrowserWindow } from 'electron';

export function registerContextMenuHandlers(mainWindow: BrowserWindow) {
  ipcMain.on('context-menu:show-message', (_event, params: { hasSelection: boolean }) => {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: '复制',
        enabled: params.hasSelection,
        click: () => {
          mainWindow.webContents.copy();
        },
      },
      {
        label: '全选',
        click: () => {
          mainWindow.webContents.selectAll();
        },
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: mainWindow });
  });
}
