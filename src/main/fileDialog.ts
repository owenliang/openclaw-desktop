import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
  };
  return map[ext.toLowerCase()] || 'image/png';
}

export function registerFileDialogHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('dialog:open-image', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '选择图片',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: '图片文件', extensions: IMAGE_EXTENSIONS },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }

    return result.filePaths.map((filePath) => {
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1);
      const mimeType = getMimeType(ext);
      const base64 = buffer.toString('base64');
      return {
        name: path.basename(filePath),
        base64DataUrl: `data:${mimeType};base64,${base64}`,
      };
    });
  });
}
