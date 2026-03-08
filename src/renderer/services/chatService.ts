import { apiFetch, apiGet } from './api';
import type { ContentBlock, Message } from '../types/message';

export interface ChatRequestBody {
  session_id: string;
  content: ContentBlock[];
  deepresearch: boolean;
}

export interface SSEData {
  request_id?: string;
  msg_id?: string;
  contents?: ContentBlock[];
  plan?: any;
}

export async function sendChatRequest(body: ChatRequestBody): Promise<Response> {
  return apiFetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function stopGeneration(sessionId: string, requestId: string): Promise<void> {
  await apiFetch(`/stop?session_id=${encodeURIComponent(sessionId)}&request_id=${encodeURIComponent(requestId)}`);
}

export async function fetchHistory(sessionId: string): Promise<Message[]> {
  const data = await apiGet<{ status: string; session_id: string; history: Message[] }>(
    `/history?session_id=${encodeURIComponent(sessionId)}`
  );
  if (data.history && Array.isArray(data.history)) {
    return data.history;
  }
  return [];
}

export function parseSSELine(line: string): SSEData | null {
  if (line.startsWith('data: ')) {
    try {
      return JSON.parse(line.slice(6));
    } catch {
      return null;
    }
  }
  return null;
}
