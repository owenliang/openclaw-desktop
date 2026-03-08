export interface TextBlock {
  type: 'text';
  text?: string;
  content?: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id?: string;
  tool_use_id?: string;
  name?: string;
  input?: Record<string, unknown>;
  content?: string;
}

export interface ToolResultBlock {
  type: 'tool_result';
  id?: string;
  tool_use_id?: string;
  content?: string;
  output?: string;
}

export interface ImageBlock {
  type: 'image';
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
  data?: string;
}

export interface ErrorBlock {
  type: 'error';
  content: string;
}

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock | ImageBlock | ErrorBlock;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content?: string | ContentBlock[];
  contents?: ContentBlock[];
  images?: string[];
  timestamp?: string;
}

export interface Subtask {
  name: string;
  description?: string;
  state: 'todo' | 'in_progress' | 'done' | 'abandoned';
}

export interface Plan {
  name: string;
  description?: string;
  subtasks: Subtask[];
}

export interface CronJob {
  id: string;
  cron_expr: string;
  task_description: string;
  running: boolean;
}

export interface Skill {
  name: string;
  description: string;
}

export interface ImageItem {
  id: string;
  name: string;
  base64: string;
  type: string;
}

export interface PendingRequest {
  content: string;
  images: ImageItem[];
  deepSearch: boolean;
}
