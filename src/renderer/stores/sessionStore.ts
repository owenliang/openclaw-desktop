import { create } from 'zustand';
import { generateUUID } from '../utils/uuid';

export interface SessionItem {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

const SESSIONS_KEY = 'agentscope_sessions';
const ACTIVE_KEY = 'agentscope_session_id';

function loadFromStorage(): { sessions: SessionItem[]; activeId: string } {
  let sessions: SessionItem[] = [];
  let activeId = '';

  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      sessions = JSON.parse(raw);
    }
  } catch {}

  activeId = localStorage.getItem(ACTIVE_KEY) || '';

  // Backward compatibility: old version only has session_id, no sessions list
  if (sessions.length === 0 && activeId) {
    sessions = [{
      id: activeId,
      title: '历史对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }];
  }

  // Ensure activeId is in sessions
  if (activeId && !sessions.find((s) => s.id === activeId)) {
    sessions.unshift({
      id: activeId,
      title: '历史对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // If still empty, create one
  if (sessions.length === 0) {
    const newId = generateUUID();
    activeId = newId;
    sessions = [{
      id: newId,
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }];
  }

  if (!activeId) {
    activeId = sessions[0].id;
  }

  return { sessions, activeId };
}

function persist(sessions: SessionItem[], activeId: string) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  localStorage.setItem(ACTIVE_KEY, activeId);
}

interface SessionState {
  sessions: SessionItem[];
  activeSessionId: string;

  loadSessions: () => void;
  createSession: () => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  touchSession: (id: string) => void;
  getActiveSession: () => SessionItem | undefined;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSessionId: '',

  loadSessions: () => {
    const { sessions, activeId } = loadFromStorage();
    set({ sessions, activeSessionId: activeId });
    persist(sessions, activeId);
  },

  createSession: () => {
    const newId = generateUUID();
    const now = Date.now();
    const newSession: SessionItem = {
      id: newId,
      title: '新对话',
      createdAt: now,
      updatedAt: now,
    };
    const sessions = [newSession, ...get().sessions];
    set({ sessions, activeSessionId: newId });
    persist(sessions, newId);
    return newId;
  },

  switchSession: (id: string) => {
    const { sessions } = get();
    if (!sessions.find((s) => s.id === id)) return;
    set({ activeSessionId: id });
    persist(sessions, id);
  },

  deleteSession: (id: string) => {
    let { sessions, activeSessionId } = get();
    sessions = sessions.filter((s) => s.id !== id);

    if (sessions.length === 0) {
      // Create a new session if all deleted
      const newId = generateUUID();
      const now = Date.now();
      sessions = [{ id: newId, title: '新对话', createdAt: now, updatedAt: now }];
      activeSessionId = newId;
    } else if (activeSessionId === id) {
      // Switch to first remaining session
      activeSessionId = sessions[0].id;
    }

    set({ sessions, activeSessionId });
    persist(sessions, activeSessionId);
  },

  updateSessionTitle: (id: string, title: string) => {
    const sessions = get().sessions.map((s) =>
      s.id === id ? { ...s, title } : s
    );
    set({ sessions });
    persist(sessions, get().activeSessionId);
  },

  touchSession: (id: string) => {
    const now = Date.now();
    let sessions = get().sessions.map((s) =>
      s.id === id ? { ...s, updatedAt: now } : s
    );
    // Sort by updatedAt descending
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    set({ sessions });
    persist(sessions, get().activeSessionId);
  },

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId);
  },
}));
