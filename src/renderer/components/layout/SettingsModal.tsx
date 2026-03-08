import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';

export default function SettingsModal() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleSettings = useUIStore((s) => s.toggleSettings);

  const [serverUrl, setServerUrl] = useState(
    () => localStorage.getItem('server_url') || 'http://localhost:8000'
  );
  const [tokenAuthEnabled, setTokenAuthEnabled] = useState(
    () => localStorage.getItem('token_auth_enabled') === 'true'
  );
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem('auth_token') || ''
  );

  const handleSave = () => {
    const trimmed = serverUrl.trim().replace(/\/+$/, '');
    localStorage.setItem('server_url', trimmed);
    localStorage.setItem('token_auth_enabled', tokenAuthEnabled ? 'true' : 'false');
    localStorage.setItem('auth_token', tokenAuthEnabled ? authToken.trim() : '');
    toggleSettings();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) toggleSettings();
  };

  return (
    <div className="settings-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal">
        <div className="settings-header">
          <h2 className="settings-title">设置</h2>
          <button className="settings-close-btn" onClick={toggleSettings}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          {/* Theme */}
          <div className="settings-field">
            <label className="settings-label">主题</label>
            <div className="settings-theme-options">
              <button
                className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                浅色
              </button>
              <button
                className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                深色
              </button>
            </div>
          </div>

          {/* Server URL */}
          <div className="settings-field">
            <label className="settings-label">服务器地址</label>
            <input
              type="text"
              className="settings-input"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
            <span className="settings-hint">AgentScope FastAPI 服务地址</span>
          </div>

          {/* Token Auth */}
          <div className="settings-field">
            <div className="settings-toggle-row">
              <label className="settings-label">Token 鉴权</label>
              <div
                className={`settings-switch ${tokenAuthEnabled ? 'active' : ''}`}
                onClick={() => setTokenAuthEnabled(!tokenAuthEnabled)}
              >
                <div className="settings-switch-thumb" />
              </div>
            </div>
            {tokenAuthEnabled && (
              <>
                <input
                  type="password"
                  className="settings-input"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="输入 Token"
                />
                <span className="settings-hint">所有 API 请求将携带 Authorization: Bearer Token</span>
              </>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-cancel-btn" onClick={toggleSettings}>取消</button>
          <button className="settings-save-btn" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
