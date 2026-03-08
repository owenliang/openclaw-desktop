import React from 'react';

interface Props {
  onClick: () => void;
  className?: string;
}

export default function ScrollToBottom({ onClick, className }: Props) {
  return (
    <button
      className={className || 'scroll-to-bottom'}
      onClick={onClick}
      title="滚动到底部"
    >
      {'\u2193'}
    </button>
  );
}
