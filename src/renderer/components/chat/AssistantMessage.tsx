import React from 'react';
import type { Message, ContentBlock } from '../../types/message';
import { renderMarkdown } from '../../utils/markdown';
import ToolUseBlock from './ToolUseBlock';

interface Props {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
  allMessages: Message[];
}

export default function AssistantMessage({ message, isLast, isLoading, allMessages }: Props) {
  const msgContent: ContentBlock[] = Array.isArray(message.contents)
    ? message.contents
    : Array.isArray(message.content)
      ? (message.content as ContentBlock[])
      : [];

  // Deduplicate tool_use by id, keeping the last occurrence
  const deduplicatedContent: ContentBlock[] = [];
  const seenToolUseIds = new Set<string>();
  for (let i = msgContent.length - 1; i >= 0; i--) {
    const item = msgContent[i];
    if (item.type === 'tool_use') {
      const toolUseId = (item as any).tool_use_id || (item as any).id;
      if (!seenToolUseIds.has(toolUseId)) {
        seenToolUseIds.add(toolUseId);
        deduplicatedContent.unshift(item);
      }
    } else {
      deduplicatedContent.unshift(item);
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.electronAPI?.showMessageContextMenu({
      hasSelection: !!window.getSelection()?.toString(),
    });
  };

  return (
    <div className="message assistant">
      <div className="message-avatar">AI</div>
      <div className="message-bubble" onContextMenu={handleContextMenu}>
        <div>
          {deduplicatedContent.map((item, idx) => {
            // Skip tool_result - shown inside ToolUseBlock
            if (item.type === 'tool_result') return null;

            if (item.type === 'text') {
              const textContent = (item as any).text || (item as any).content || '';
              return (
                <div
                  key={idx}
                  className="message-content-item text markdown-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(textContent) }}
                />
              );
            }

            if (item.type === 'tool_use') {
              const toolUseId = (item as any).tool_use_id || (item as any).id;
              return (
                <ToolUseBlock
                  key={toolUseId}
                  item={item}
                  allMessages={allMessages}
                  showLoading={isLast && isLoading}
                />
              );
            }

            if (item.type === 'error') {
              return (
                <div key={idx} className="message-content-item error">
                  {(item as any).content}
                </div>
              );
            }

            return (
              <div key={idx} className="message-content-item">
                {(item as any).text || (item as any).content}
              </div>
            );
          })}
          {isLast && isLoading && (
            <div className="loading-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
