import { create } from 'zustand';
import type { CronJob, Message } from '../types/message';
import { fetchCronJobs as apiFetchCronJobs, fetchCronHistory as apiFetchCronHistory } from '../services/cronService';

interface CronState {
  cronJobs: CronJob[];
  cronHistory: Message[];
  isLoading: boolean;
  cronJobsLoading: boolean;
  lastRefresh: Date | null;
  hasNewMessages: boolean;

  fetchCronJobs: () => Promise<void>;
  fetchCronHistory: () => Promise<void>;
  clearNewMessages: () => void;
}

export const useCronStore = create<CronState>((set, get) => ({
  cronJobs: [],
  cronHistory: [],
  isLoading: false,
  cronJobsLoading: false,
  lastRefresh: null,
  hasNewMessages: false,

  fetchCronJobs: async () => {
    set({ cronJobsLoading: true });
    try {
      const jobs = await apiFetchCronJobs();
      set({ cronJobs: jobs });
    } catch (e) {
      console.error('Failed to fetch cron jobs:', e);
    } finally {
      set({ cronJobsLoading: false });
    }
  },

  fetchCronHistory: async () => {
    set({ isLoading: true });
    try {
      const prevCount = get().cronHistory.length;
      const history = await apiFetchCronHistory();
      const isNew = prevCount > 0 && history.length > prevCount;
      set({
        cronHistory: history,
        lastRefresh: new Date(),
        hasNewMessages: isNew ? true : get().hasNewMessages,
      });
    } catch (e) {
      console.error('Failed to fetch cron history:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  clearNewMessages: () => set({ hasNewMessages: false }),
}));
