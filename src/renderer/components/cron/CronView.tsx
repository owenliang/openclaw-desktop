import React, { useRef, useState, useEffect } from 'react';
import { useCronStore } from '../../stores/cronStore';
import { useUIStore } from '../../stores/uiStore';
import { usePolling } from '../../hooks/usePolling';
import { renderMarkdown } from '../../utils/markdown';
import { formatTime, extractTextContent } from '../../utils/time';
import type { ContentBlock, Message } from '../../types/message';
import ScrollToBottom from '../chat/ScrollToBottom';

export default function CronView() {
  const { cronHistory, isLoading, lastRefresh, fetchCronHistory, fetchCronJobs } = useCronStore();
  const activeTab = useUIStore((s) => s.activeTab);
  const cronExpandedToolIds = useUIStore((s) => s.cronExpandedToolIds);
  const toggleCronToolUse = useUIStore((s) => s.toggleCronToolUse);

  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const userScrolledRef = useRef(false);

  const isCronTab = activeTab === 'cron';

  usePolling(
    () => {
      fetchCronHistory();
      fetchCronJobs();
    },
    5000,
    isCronTab
  );

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      userScrolledRef.current = false;
      setShowScrollBtn(false);
    }
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const shouldShow = dist > 50;
    setShowScrollBtn(shouldShow);
    if (shouldShow) userScrolledRef.current = true;
  };

  useEffect(() => {
    if (isCronTab && !userScrolledRef.current) {
      const t = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(t);
    }
  }, [cronHistory, isCronTab]);

  useEffect(() => {
    if (isCronTab) {
      const t = setTimeout(scrollToBottom, 150);
      return () => clearTimeout(t);
    }
  }, [isCronTab]);

  const findCronToolResult = (toolUseId: string) => {
    for (const msg of cronHistory) {
      const contents: ContentBlock[] = Array.isArray(msg.content)
        ? (msg.content as ContentBlock[])
        : Array.isArray(msg.contents)
          ? msg.contents
          : [];
      const found = contents.find(
        (c) =>
          c.type === 'tool_result' &&
          ((c as any).tool_use_id === toolUseId || (c as any).id === toolUseId)
      );
      if (found) return found;
    }
    return null;
  };

  const renderCronMessage = (msg: Message, index: number) => {
    const role = msg.role || 'system';
    const timestamp = msg.timestamp;

    if (role === 'user') {
      return (
        <div key={index} className="cron-message user">
          <div className="cron-message-bubble">{extractTextContent(msg.content)}</div>
          {timestamp && <div className="cron-message-time">{formatTime(timestamp)}</div>}
        </div>
      );
    }

    if (role === 'system') return null;

    const msgContent: ContentBlock[] = Array.isArray(msg.contents)
      ? msg.contents
      : Array.isArray(msg.content)
        ? (msg.content as ContentBlock[])
        : [];

    if (role === 'assistant' && msgContent.length > 0) {
      return (
        <div key={index} className="cron-message assistant">
          <div className="cron-message-bubble">
            {msgContent.map((item, idx) => {
              if (item.type === 'text') {
                const text = (item as any).text || (item as any).content || '';
                return (
                  <div
                    key={idx}
                    className="message-content-item text markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
                  />
                );
              }

              if (item.type === 'tool_use') {
                const toolUseId = (item as any).tool_use_id || (item as any).id;
                const toolName =
                  (item as any).name ||
                  ((item as any).content ? (item as any).content.split(':')[0] : 'Unknown');
                let toolInput = '';
                if ((item as any).input) {
                  toolInput =
                    typeof (item as any).input === 'string'
                      ? (item as any).input
                      : JSON.stringify((item as any).input, null, 2);
                } else if ((item as any).content?.includes(':')) {
                  toolInput = (item as any).content.substring((item as any).content.indexOf(':') + 1).trim();
                }
                const isExpanded = cronExpandedToolIds.has(toolUseId);
                const toolResult = findCronToolResult(toolUseId);

                return (
                  <div key={toolUseId}>
                    <div
                      className="message-content-item tool_use"
                      onClick={() => toggleCronToolUse(toolUseId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tool-use-header">
                        <span className={`tool-use-toggle ${isExpanded ? 'expanded' : ''}`}>{'\u25B6'}</span>
                        <span>使用工具: {toolName}</span>
                      </div>
                      {toolInput && (
                        <div style={{ marginLeft: '20px', marginTop: '4px', fontSize: '12px', opacity: 0.8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          参数: {toolInput}
                        </div>
                      )}
                    </div>
                    {isExpanded && toolResult && (
                      <div className="message-content-item tool_result">
                        {extractTextContent((toolResult as any).output || (toolResult as any).content)}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
          {timestamp && <div className="cron-message-time">{formatTime(timestamp)}</div>}
        </div>
      );
    }

    const text = extractTextContent(msg.content);
    return (
      <div key={index} className={`cron-message ${role}`}>
        <div className="cron-message-bubble">{text}</div>
        {timestamp && <div className="cron-message-time">{formatTime(timestamp)}</div>}
      </div>
    );
  };

  const recentHistory = cronHistory.slice(-20);

  return (
    <div className="cron-container" ref={containerRef} onScroll={handleScroll}>
      <div className={`cron-refresh-indicator ${isLoading ? 'refreshing' : ''}`}>
        {lastRefresh && <span>上次更新: {formatTime(lastRefresh)}</span>}
      </div>
      {recentHistory.length === 0 ? (
        <div className="cron-empty-state">
          <div className="icon">📋</div>
          <div>暂无定时任务历史记录</div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            系统将每 5 秒自动刷新
          </div>
        </div>
      ) : (
        recentHistory.map((msg, index) => renderCronMessage(msg, index))
      )}
      {showScrollBtn && <ScrollToBottom onClick={scrollToBottom} className="cron-scroll-to-bottom" />}
    </div>
  );
}
