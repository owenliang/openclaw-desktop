import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow, quitApp: () => void) {
  const iconPath = path.join(__dirname, '../../assets/icons/icon.png');
  let trayIcon: ReturnType<typeof nativeImage.createFromPath>;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    } else {
      trayIcon = trayIcon.resize({ width: 16, height: 16 });
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
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
