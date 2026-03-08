import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import path from 'path';

let tray: Tray | null = null;

function getIconDir(): string {
  if (app.isPackaged) {
    // extraResource copies ./assets/icons → resources/icons
    return path.join(process.resourcesPath, 'icons');
  }
  return path.join(app.getAppPath(), 'assets', 'icons');
}

export function createTray(mainWindow: BrowserWindow, quitApp: () => void) {
  const iconDir = getIconDir();
  // Try .ico first on Windows, then .png
  const candidates = process.platform === 'win32'
    ? [
        path.join(iconDir, 'icon.ico'),
        path.join(iconDir, 'icon.png'),
      ]
    : [path.join(iconDir, 'icon.png')];

  let trayIcon = nativeImage.createEmpty();
  for (const iconPath of candidates) {
    try {
      const img = nativeImage.createFromPath(iconPath);
      if (!img.isEmpty()) {
        trayIcon = img.resize({ width: 16, height: 16 });
        break;
      }
    } catch {
      // try next candidate
    }
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('OpenClaw Desktop');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        quitApp();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

export function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
