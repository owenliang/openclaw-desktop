import React from 'react';
import { useSessionStore } from '../../stores/sessionStore';
import { useUIStore } from '../../stores/uiStore';

export default function Header() {
  const activeTab = useUIStore((s) => s.activeTab);
  const cronPanelOpen = useUIStore((s) => s.cronPanelOpen);
  const toggleCronPanel = useUIStore((s) => s.toggleCronPanel);
  const activeSession = useSessionStore((s) =>
    s.sessions.find((sess) => sess.id === s.activeSessionId)
  );

  const title = activeTab === 'cron'
    ? '定时任务'
    : activeSession?.title || '新对话';

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <h1 className="title-bar-title">{title}</h1>
      </div>
      <div className="title-bar-right">
        {activeTab === 'cron' && (
          <button
            className={`header-action-btn ${cronPanelOpen ? 'active' : ''}`}
            onClick={toggleCronPanel}
            title={cronPanelOpen ? '隐藏任务列表' : '显示任务列表'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
