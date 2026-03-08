import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { generateUUID } from '../../utils/uuid';
import { fileToBase64 } from '../../utils/image';
import type { ImageItem } from '../../types/message';
import SkillAutocomplete from './SkillAutocomplete';
import PendingBanner from './PendingBanner';

export default function InputArea() {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useChatStore((s) => s.sessionId);

  const {
    isLoading,
    isWaitingRequestId,
    pendingRequest,
    selectedImages,
    sendMessage,
    stopGeneration,
    setPendingRequest,
    addImage,
    removeImage,
  } = useChatStore();

  const { deepSearch, skills, showSkillSuggestions, selectedSkillIndex, setShowSkillSuggestions, setSelectedSkillIndex } =
    useUIStore();

  const getFilteredSkills = useCallback(() => {
    const slashIndex = inputText.indexOf('/');
    if (slashIndex === -1) return [];
    const query = inputText.substring(slashIndex + 1).toLowerCase().trim();
    if (query === '') return skills;
    return skills.filter(
      (skill) =>
        (skill.name || '').toLowerCase().includes(query) ||
        (skill.description || '').toLowerCase().includes(query)
    );
  }, [inputText, skills]);

  useEffect(() => {
    const slashIndex = inputText.indexOf('/');
    if (slashIndex !== -1 && skills.length > 0) {
      const query = inputText.substring(slashIndex + 1).toLowerCase().trim();
      if (query === '') {
        setShowSkillSuggestions(true);
      } else {
        const filtered = skills.filter(
          (s) =>
            (s.name || '').toLowerCase().includes(query) ||
            (s.description || '').toLowerCase().includes(query)
        );
        setShowSkillSuggestions(filtered.length > 0);
      }
      setSelectedSkillIndex(0);
    } else {
      setShowSkillSuggestions(false);
    }
  }, [inputText, skills]);

  // Auto-focus input on mount and session switch
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [sessionId]);

  const selectSkill = (index: number) => {
    const filtered = getFilteredSkills();
    if (index >= 0 && index < filtered.length) {
      const skill = filtered[index];
      const slashIndex = inputText.indexOf('/');
      const beforeSlash = slashIndex > 0 ? inputText.substring(0, slashIndex) : '';
      setInputText(`${beforeSlash}/${skill.name} `);
      setShowSkillSuggestions(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && selectedImages.length === 0) return;
    if (pendingRequest || isWaitingRequestId) return;

    const text = inputText.trim();
    const images = [...selectedImages];

    if (isLoading) {
      setPendingRequest({ content: text, images, deepSearch });
      setInputText('');
      return;
    }

    setInputText('');
    await sendMessage(text, images, deepSearch);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!isLoading && pendingRequest && !useChatStore.getState().aborted) {
      const req = pendingRequest;
      setPendingRequest(null);
      sendMessage(req.content, req.images, req.deepSearch);
    }
  }, [isLoading, pendingRequest]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSkillSuggestions) {
        selectSkill(selectedSkillIndex);
      } else {
        handleSend();
      }
    } else if (e.key === 'ArrowDown' && showSkillSuggestions) {
      e.preventDefault();
      const filtered = getFilteredSkills();
      setSelectedSkillIndex(Math.min(selectedSkillIndex + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp' && showSkillSuggestions) {
      e.preventDefault();
      setSelectedSkillIndex(Math.max(selectedSkillIndex - 1, 0));
    } else if (e.key === 'Escape' && showSkillSuggestions) {
      e.preventDefault();
      setShowSkillSuggestions(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type?.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) addImageFromFile(file);
      }
    }
  };

  const addImageFromFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const base64 = await fileToBase64(file);
    addImage({ id: generateUUID(), name: file.name, base64, type: file.type });
  };

  const handleNativeImageUpload = async () => {
    if (!window.electronAPI?.openImageDialog) return;
    const files = await window.electronAPI.openImageDialog();
    for (const file of files) {
      addImage({
        id: generateUUID(),
        name: file.name,
        base64: file.base64DataUrl,
        type: 'image/png',
      });
    }
  };

  const isBusy = !!pendingRequest || isWaitingRequestId;

  return (
    <div className="chat-input-area">
      {/* Image previews */}
      {selectedImages.length > 0 && (
        <div className="image-preview-container">
          {selectedImages.map((img) => (
            <div key={img.id} className="image-preview">
              <img src={img.base64} alt={img.name} />
              <button className="remove-btn" onClick={() => removeImage(img.id)} title="移除图片">
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="chat-input-container">
        {pendingRequest && (
          <PendingBanner
            request={pendingRequest}
            onCancel={() => setPendingRequest(null)}
          />
        )}

        {showSkillSuggestions && (
          <SkillAutocomplete
            filteredSkills={getFilteredSkills()}
            selectedIndex={selectedSkillIndex}
            onSelect={selectSkill}
            onHover={setSelectedSkillIndex}
          />
        )}

        <button
          className="toolbar-btn"
          onClick={handleNativeImageUpload}
          disabled={isBusy}
          title="上传图片"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={
            selectedImages.length > 0
              ? '添加文字描述（可选）...'
              : '输入消息，按 Enter 发送...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={isBusy}
        />

        {isLoading ? (
          <button className="stop-button" onClick={stopGeneration}>
            停止
          </button>
        ) : (
          <button
            className="send-button"
            onClick={handleSend}
            disabled={(!inputText.trim() && selectedImages.length === 0) || isBusy}
          >
            发送
          </button>
        )}
      </div>
    </div>
  );
}
