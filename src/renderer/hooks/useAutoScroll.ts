import { useRef, useState, useCallback } from 'react';

export function useAutoScroll(deps: any[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Instant scroll – used during streaming auto-follow
  const snapToBottom = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
    userScrolledRef.current = false;
    setShowScrollButton(false);
  }, []);

  // Smooth scroll – used when user clicks the scroll-to-bottom button
  const scrollToBottom = useCallback(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    userScrolledRef.current = false;
    setShowScrollButton(false);
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const shouldShow = distanceToBottom > 50;
    setShowScrollButton(shouldShow);
    if (shouldShow) {
      userScrolledRef.current = true;
    } else {
      userScrolledRef.current = false;
    }
  }, []);

  const resetScroll = useCallback(() => {
    userScrolledRef.current = false;
    setShowScrollButton(false);
  }, []);

  return {
    containerRef,
    endRef,
    showScrollButton,
    scrollToBottom,
    snapToBottom,
    handleScroll,
    resetScroll,
    userScrolledRef,
  };
}
