import { create } from 'zustand';
import type { Skill } from '../types/message';
import { fetchSkills as apiFetchSkills } from '../services/skillService';

interface UIState {
  activeTab: 'chat' | 'cron';
  deepSearch: boolean;
  drawerCollapsed: boolean;
  cronPanelOpen: boolean;
  expandedToolUseIds: Set<string>;
  cronExpandedToolIds: Set<string>;
  skills: Skill[];
  showSkillSuggestions: boolean;
  selectedSkillIndex: number;
  theme: 'light' | 'dark';
  settingsOpen: boolean;

  setActiveTab: (tab: 'chat' | 'cron') => void;
  toggleDeepSearch: () => void;
  setDeepSearch: (v: boolean) => void;
  toggleDrawer: () => void;
  toggleCronPanel: () => void;
  toggleToolUse: (id: string) => void;
  toggleCronToolUse: (id: string) => void;
  loadSkills: () => Promise<void>;
  setShowSkillSuggestions: (v: boolean) => void;
  setSelectedSkillIndex: (i: number) => void;
  setTheme: (t: 'light' | 'dark') => void;
  toggleSettings: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'chat',
  deepSearch: false,
  drawerCollapsed: localStorage.getItem('drawer_collapsed') === 'true',
  cronPanelOpen: false,
  expandedToolUseIds: new Set(),
  cronExpandedToolIds: new Set(),
  skills: [],
  showSkillSuggestions: false,
  selectedSkillIndex: 0,
  theme: (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light',
  settingsOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleDeepSearch: () => set((s) => ({ deepSearch: !s.deepSearch })),
  setDeepSearch: (v) => set({ deepSearch: v }),
  toggleDrawer: () =>
    set((s) => {
      const next = !s.drawerCollapsed;
      localStorage.setItem('drawer_collapsed', String(next));
      return { drawerCollapsed: next };
    }),
  toggleCronPanel: () =>
    set((s) => ({ cronPanelOpen: !s.cronPanelOpen })),

  toggleToolUse: (id) =>
    set((s) => {
      const next = new Set(s.expandedToolUseIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedToolUseIds: next };
    }),

  toggleCronToolUse: (id) =>
    set((s) => {
      const next = new Set(s.cronExpandedToolIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { cronExpandedToolIds: next };
    }),

  loadSkills: async () => {
    try {
      const skills = await apiFetchSkills();
      set({ skills });
    } catch (e) {
      console.error('Failed to load skills:', e);
    }
  },

  setShowSkillSuggestions: (v) => set({ showSkillSuggestions: v }),
  setSelectedSkillIndex: (i) => set({ selectedSkillIndex: i }),
  setTheme: (t) => {
    localStorage.setItem('app_theme', t);
    set({ theme: t });
  },
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
}));
