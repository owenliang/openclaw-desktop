interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  onSwitchToCron: (callback: () => void) => () => void;
  onMenuNewChat: (callback: () => void) => () => void;
  openImageDialog: () => Promise<{ name: string; base64DataUrl: string }[]>;
  showMessageContextMenu: (params: { hasSelection: boolean }) => void;
  platform: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
