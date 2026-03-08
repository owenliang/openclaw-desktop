import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onSwitchToCron: (callback: () => void) => {
    ipcRenderer.on('switch-to-cron', callback);
    return () => ipcRenderer.removeListener('switch-to-cron', callback);
  },
  onMenuNewChat: (callback: () => void) => {
    ipcRenderer.on('menu-new-chat', callback);
    return () => ipcRenderer.removeListener('menu-new-chat', callback);
  },
  openImageDialog: () => ipcRenderer.invoke('dialog:open-image') as Promise<{ name: string; base64DataUrl: string }[]>,
  showMessageContextMenu: (params: { hasSelection: boolean }) => {
    ipcRenderer.send('context-menu:show-message', params);
  },
  platform: process.platform,
});
