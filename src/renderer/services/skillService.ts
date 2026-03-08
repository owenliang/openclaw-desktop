import { apiGet } from './api';
import type { Skill } from '../types/message';

export async function fetchSkills(): Promise<Skill[]> {
  const data = await apiGet<any>('/get_commands');
  if (Array.isArray(data)) return data;
  if (data.skills && Array.isArray(data.skills)) return data.skills;
  if (typeof data === 'object') return Object.values(data);
  return [];
}
