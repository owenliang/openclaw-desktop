import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  src: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="image-lightbox-overlay" onClick={onClose}>
      <img
        className="image-lightbox-img"
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
      />
      <button className="image-lightbox-close" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
