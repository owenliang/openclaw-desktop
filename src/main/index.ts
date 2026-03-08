import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createTray } from './tray';
import { startNotificationPolling, stopNotificationPolling } from './notification';
import { createApplicationMenu } from './menu';
import { registerFileDialogHandlers } from './fileDialog';
import { registerContextMenuHandlers } from './contextMenu';
import { spawn } from 'child_process';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle Squirrel.Windows install/update/uninstall events
function handleSquirrelEvent(): boolean {
  if (process.platform !== 'win32') return false;
  const squirrelCommand = process.argv[1];
  if (!squirrelCommand) return false;

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawnUpdate = (args: string[]) => {
    try {
      return spawn(updateDotExe, args, { detached: true });
    } catch {
      return null;
    }
  };

  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);
      setTimeout(() => process.exit(0), 1000);
      return true;
    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);
      setTimeout(() => process.exit(0), 1000);
      return true;
    case '--squirrel-obsolete':
      process.exit(0);
      return true;
    default:
      return false;
  }
}

if (handleSquirrelEvent()) {
  // Squirrel event handled, app will quit shortly
} else {

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    icon: app.isPackaged
      ? path.join(process.resourcesPath, 'icons', 'icon.png')
      : path.join(app.getAppPath(), 'assets', 'icons', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
    show: false,
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  if (mainWindow) {
    createApplicationMenu(mainWindow);
    registerFileDialogHandlers(mainWindow);
    registerContextMenuHandlers(mainWindow);

    createTray(mainWindow, () => {
      isQuitting = true;
      app.quit();
    });
    startNotificationPolling(mainWindow);
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopNotificationPolling();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  } else {
    createWindow();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

}
