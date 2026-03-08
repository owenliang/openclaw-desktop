import React, { useCallback, useEffect, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import ScrollToBottom from './ScrollToBottom';
import ImageLightbox from './ImageLightbox';

export default function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const currentPlan = useChatStore((s) => s.currentPlan);

  const { containerRef, endRef, showScrollButton, scrollToBottom, snapToBottom, handleScroll, userScrolledRef } =
    useAutoScroll([messages, currentPlan]);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Auto-scroll when messages update (instant snap during streaming)
  useEffect(() => {
    if (!userScrolledRef.current) {
      const timer = setTimeout(() => snapToBottom(), 16);
      return () => clearTimeout(timer);
    }
  }, [messages, currentPlan]);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.closest('.message-bubble')) {
      const src = (target as HTMLImageElement).src;
      if (src) setLightboxSrc(src);
    }
  }, []);

  return (
    <div className="chat-messages" ref={containerRef} onScroll={handleScroll} onClick={handleImageClick}>
      {messages.map((message, index) => {
        if (message.role === 'user') {
          return <UserMessage key={index} message={message} />;
        } else {
          return (
            <AssistantMessage
              key={index}
              message={message}
              isLast={index === messages.length - 1}
              isLoading={isLoading}
              allMessages={messages}
            />
          );
        }
      })}
      <div ref={endRef} />
      {showScrollButton && <ScrollToBottom onClick={scrollToBottom} />}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
