import React from 'react';
import type { PendingRequest } from '../../types/message';

interface Props {
  request: PendingRequest;
  onCancel: () => void;
}

export default function PendingBanner({ request, onCancel }: Props) {
  return (
    <div className="pending-request-banner">
      <div className="pending-request-content">
        <span className="pending-label">排队中</span>
        <span className="pending-text">{request.content}</span>
        {request.images && request.images.length > 0 && (
          <span className="pending-images-count">附图 {request.images.length}</span>
        )}
      </div>
      <button className="cancel-pending-btn" onClick={onCancel} title="取消排队">
        ✕
      </button>
    </div>
  );
}
