import React from 'react';
import type { ContentBlock, Message } from '../../types/message';
import { useUIStore } from '../../stores/uiStore';
import { extractTextContent } from '../../utils/time';

interface Props {
  item: ContentBlock;
  allMessages: Message[];
  showLoading: boolean;
}

export default function ToolUseBlock({ item, allMessages, showLoading }: Props) {
  const expandedToolUseIds = useUIStore((s) => s.expandedToolUseIds);
  const toggleToolUse = useUIStore((s) => s.toggleToolUse);

  const toolUseId = (item as any).tool_use_id || (item as any).id;
  const toolName = (item as any).name || ((item as any).content ? (item as any).content.split(':')[0] : 'Unknown');

  let toolInput = '';
  if ((item as any).input) {
    toolInput =
      typeof (item as any).input === 'string'
        ? (item as any).input
        : JSON.stringify((item as any).input, null, 2);
  } else if ((item as any).content && (item as any).content.includes(':')) {
    const colonIndex = (item as any).content.indexOf(':');
    toolInput = (item as any).content.substring(colonIndex + 1).trim();
  }

  const isExpanded = expandedToolUseIds.has(toolUseId);

  // Find matching tool_result across all messages
  let toolResult: any = null;
  for (const m of allMessages) {
    const contents: ContentBlock[] = Array.isArray(m.contents)
      ? m.contents
      : Array.isArray(m.content)
        ? (m.content as ContentBlock[])
        : [];
    const found = contents.find(
      (c) =>
        c.type === 'tool_result' &&
        ((c as any).tool_use_id === toolUseId || (c as any).id === toolUseId)
    );
    if (found) {
      toolResult = found;
      break;
    }
  }

  const isToolLoading = !toolResult && showLoading;

  return (
    <div>
      <div
        className={`message-content-item tool_use ${isToolLoading ? 'loading' : ''}`}
        onClick={() => toggleToolUse(toolUseId)}
      >
        <div className="tool-use-header">
          <span className={`tool-use-toggle ${isExpanded ? 'expanded' : ''}`}>
            {'\u25B6'}
          </span>
          <span>使用工具: {toolName}</span>
        </div>
        {toolInput && (
          <div
            className="tool-use-params"
            style={{
              marginLeft: '20px',
              marginTop: '4px',
              fontSize: '12px',
              opacity: 0.8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            参数: {toolInput}
          </div>
        )}
      </div>
      {isExpanded && toolResult && (
        <div className="message-content-item tool_result">
          {extractTextContent(toolResult.output || toolResult.content)}
        </div>
      )}
    </div>
  );
}
