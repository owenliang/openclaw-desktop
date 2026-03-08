import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';

export default function DeepResearchToggle() {
  const deepSearch = useUIStore((s) => s.deepSearch);
  const toggleDeepSearch = useUIStore((s) => s.toggleDeepSearch);
  const isLoading = useChatStore((s) => s.isLoading);
  const isWaitingRequestId = useChatStore((s) => s.isWaitingRequestId);

  const disabled = isLoading || isWaitingRequestId;

  return (
    <div className="deep-search-row">
      <div
        className={`deep-search-toggle ${deepSearch ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && toggleDeepSearch()}
      >
        <span className="toggle-label">深度研究</span>
        <div className="toggle-switch"></div>
      </div>
    </div>
  );
}
