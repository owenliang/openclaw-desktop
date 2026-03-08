import React from 'react';
import type { Message, ContentBlock } from '../../types/message';
import { extractTextContent } from '../../utils/time';

interface Props {
  message: Message;
}

export default function UserMessage({ message }: Props) {
  const msgContent: ContentBlock[] = Array.isArray(message.contents)
    ? message.contents
    : Array.isArray(message.content)
      ? (message.content as ContentBlock[])
      : [];

  const textContent =
    typeof message.content === 'string'
      ? message.content
      : extractTextContent(msgContent);

  const images = (message.images || []).map((src) => {
    if (src.startsWith('data:') || src.startsWith('http')) return src;
    return `data:image/png;base64,${src}`;
  });
  const contentImages = msgContent
    .filter((item) => item.type === 'image')
    .map((item: any) => {
      if (item.source?.data) {
        const data = item.source.data;
        if (data.startsWith('data:')) return data;
        const mediaType = item.source.media_type || 'image/png';
        return `data:${mediaType};base64,${data}`;
      }
      if (item.data) {
        if (item.data.startsWith('data:')) return item.data;
        return `data:image/png;base64,${item.data}`;
      }
      return null;
    })
    .filter(Boolean);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.electronAPI?.showMessageContextMenu({
      hasSelection: !!window.getSelection()?.toString(),
    });
  };

  return (
    <div className="message user">
      <div className="message-bubble" onContextMenu={handleContextMenu}>
        <div>
          <div>{textContent}</div>
          {(images.length > 0 || contentImages.length > 0) && (
            <div className="user-images">
              {images.map((imgSrc, idx) => (
                <img key={idx} src={imgSrc} alt={`Image ${idx + 1}`} />
              ))}
              {contentImages.map((src, idx) => (
                <img key={`c-${idx}`} src={src} alt={`Image ${idx + 1}`} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="message-avatar">U</div>
    </div>
  );
}
