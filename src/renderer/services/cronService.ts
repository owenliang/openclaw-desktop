import { apiGet } from './api';
import type { CronJob, Message } from '../types/message';

export async function fetchCronJobs(): Promise<CronJob[]> {
  const data = await apiGet<{ status: string; jobs: CronJob[] }>('/get_crons');
  if (data.status === 'success' && Array.isArray(data.jobs)) {
    return data.jobs;
  }
  return [];
}

export async function fetchCronHistory(): Promise<Message[]> {
  const data = await apiGet<{ status: string; history: Message[] }>('/history?session_id=cronjob');
  if (data.status === 'success' && Array.isArray(data.history)) {
    return data.history;
  }
  return [];
}
