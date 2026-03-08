import { Notification, BrowserWindow } from 'electron';
import http from 'http';

const BASE_URL = 'http://localhost:8000';
const POLL_INTERVAL = 30000;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastMessageCount = -1;

function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Failed to parse JSON'));
        }
      });
    }).on('error', reject);
  });
}

async function checkForNewMessages(mainWindow: BrowserWindow) {
  try {
    const data = await fetchJSON(`${BASE_URL}/history?session_id=cronjob`);
    if (data.status === 'success' && Array.isArray(data.history)) {
      const count = data.history.length;
      if (lastMessageCount >= 0 && count > lastMessageCount) {
        const diff = count - lastMessageCount;
        const notification = new Notification({
          title: 'OpenClaw - 新消息',
          body: `定时任务产生了 ${diff} 条新消息`,
        });
        notification.on('click', () => {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('switch-to-cron');
        });
        notification.show();
      }
      lastMessageCount = count;
    }
  } catch {
    // Server not available, ignore silently
  }
}

export function startNotificationPolling(mainWindow: BrowserWindow) {
  // Initial check after 5 seconds
  setTimeout(() => checkForNewMessages(mainWindow), 5000);
  pollTimer = setInterval(() => checkForNewMessages(mainWindow), POLL_INTERVAL);
}

export function stopNotificationPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
