export function formatTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export interface DateGroup<T> {
  label: string;
  items: T[];
}

export function groupByDate<T extends { createdAt?: number; updatedAt?: number }>(
  items: T[],
  dateField: 'createdAt' | 'updatedAt' = 'updatedAt'
): DateGroup<T>[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const week = today - 7 * 86400000;

  const groups: Record<string, T[]> = {
    '今天': [],
    '昨天': [],
    '最近 7 天': [],
    '更早': [],
  };

  for (const item of items) {
    const ts = (item as any)[dateField] || 0;
    if (ts >= today) {
      groups['今天'].push(item);
    } else if (ts >= yesterday) {
      groups['昨天'].push(item);
    } else if (ts >= week) {
      groups['最近 7 天'].push(item);
    } else {
      groups['更早'].push(item);
    }
  }

  const result: DateGroup<T>[] = [];
  for (const label of ['今天', '昨天', '最近 7 天', '更早']) {
    if (groups[label].length > 0) {
      result.push({ label, items: groups[label] });
    }
  }
  return result;
}

export function extractTextContent(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((item: any) => item.type === 'text')
      .map((item: any) => item.text || item.content || '')
      .join('\n');
  }
  if (typeof content === 'object' && content !== null) {
    if (content.text) return content.text;
    return JSON.stringify(content);
  }
  return '';
}
