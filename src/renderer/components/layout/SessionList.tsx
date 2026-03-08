import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSessionStore, type SessionItem } from '../../stores/sessionStore';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { groupByDate } from '../../utils/time';

interface Props {
  collapsed: boolean;
}

export default function SessionList({ collapsed }: Props) {
  const sessions = useSessionStore((s) => s.sessions);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const switchToSession = useChatStore((s) => s.switchToSession);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const activeTab = useUIStore((s) => s.activeTab);
  const deleteSession = useSessionStore((s) => s.deleteSession);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (collapsed) return null;

  const groups = groupByDate<SessionItem>(sessions, 'updatedAt');

  const handleClick = (id: string) => {
    switchToSession(id);
    setActiveTab('chat');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const wasActive = pendingDeleteId === activeSessionId;
    deleteSession(pendingDeleteId);
    if (wasActive) {
      const nextId = useSessionStore.getState().activeSessionId;
      switchToSession(nextId);
    }
    setPendingDeleteId(null);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  return (
    <div className="session-list">
      {groups.map((group) => (
        <div key={group.label} className="session-group">
          <div className="session-group-title">{group.label}</div>
          {group.items.map((session) => (
            <div
              key={session.id}
              className={`session-item ${activeTab === 'chat' && session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => handleClick(session.id)}
              title={session.title}
            >
              <svg className="session-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="session-item-title">{session.title}</span>
              <button
                className="session-item-delete"
                onClick={(e) => handleDeleteClick(e, session.id)}
                title="删除"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ))}
      {sessions.length === 0 && (
        <div className="session-list-empty">暂无对话</div>
      )}

      {pendingDeleteId && createPortal(
        <div className="confirm-dialog-overlay" onClick={cancelDelete}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog-title">删除对话</h3>
            <p className="confirm-dialog-message">确定要删除此对话吗？删除后无法恢复。</p>
            <div className="confirm-dialog-actions">
              <button className="confirm-dialog-btn confirm-dialog-btn-danger" onClick={confirmDelete}>删除</button>
              <button className="confirm-dialog-btn confirm-dialog-btn-cancel" onClick={cancelDelete}>取消</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
