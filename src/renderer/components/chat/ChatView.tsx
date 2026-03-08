import React, { useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import MessageList from './MessageList';
import InputArea from './InputArea';
import DeepResearchToggle from './DeepResearchToggle';

export default function ChatView() {
  const loadHistory = useChatStore((s) => s.loadHistory);
  const loadSkills = useUIStore((s) => s.loadSkills);
  const sessionId = useChatStore((s) => s.sessionId);

  useEffect(() => {
    if (sessionId) {
      loadHistory();
      loadSkills();
    }
  }, [sessionId]);

  return (
    <>
      <MessageList />
      <DeepResearchToggle />
      <InputArea />
    </>
  );
}
