import { create } from 'zustand';
import type { Message, ContentBlock, ImageItem, PendingRequest, Plan } from '../types/message';
import { sendChatRequest, stopGeneration as apiStopGeneration, fetchHistory, parseSSELine } from '../services/chatService';
import { extractBase64Parts } from '../utils/image';
import { useSessionStore } from './sessionStore';

interface ChatState {
  sessionId: string;
  messages: Message[];
  isLoading: boolean;
  isWaitingRequestId: boolean;
  currentRequestId: string | null;
  pendingRequest: PendingRequest | null;
  selectedImages: ImageItem[];
  currentPlan: Plan | null;
  aborted: boolean;

  initSession: () => void;
  loadHistory: () => Promise<void>;
  sendMessage: (text: string, images: ImageItem[], deepSearch: boolean) => Promise<void>;
  stopGeneration: () => Promise<void>;
  newChat: () => void;
  switchToSession: (id: string) => void;
  setPendingRequest: (req: PendingRequest | null) => void;
  setSelectedImages: (images: ImageItem[]) => void;
  addImage: (img: ImageItem) => void;
  removeImage: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: '',
  messages: [],
  isLoading: false,
  isWaitingRequestId: false,
  currentRequestId: null,
  pendingRequest: null,
  selectedImages: [],
  currentPlan: null,
  aborted: false,

  initSession: () => {
    const sessionStore = useSessionStore.getState();
    sessionStore.loadSessions();
    const activeId = useSessionStore.getState().activeSessionId;
    set({ sessionId: activeId });
  },

  loadHistory: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      const history = await fetchHistory(sessionId);
      set({ messages: history });

      // Auto-update session title from first user message if still default
      const sessionStore = useSessionStore.getState();
      const session = sessionStore.sessions.find((s) => s.id === sessionId);
      if (session && (session.title === '新对话' || session.title === '历史对话')) {
        const firstUser = history.find((m) => m.role === 'user');
        if (firstUser) {
          const text = typeof firstUser.content === 'string' ? firstUser.content : '';
          if (text) {
            sessionStore.updateSessionTitle(sessionId, text.slice(0, 20));
          }
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  },

  sendMessage: async (text: string, images: ImageItem[], deepSearch: boolean) => {
    const state = get();
    const { sessionId } = state;

    // Auto-update session title on first user message
    const isFirstUserMessage = state.messages.filter((m) => m.role === 'user').length === 0;
    if (isFirstUserMessage && text) {
      const sessionStore = useSessionStore.getState();
      sessionStore.updateSessionTitle(sessionId, text.slice(0, 20));
    }

    // Touch session to update timestamp
    useSessionStore.getState().touchSession(sessionId);

    // Build content list
    const contentList: ContentBlock[] = [];
    if (text) {
      contentList.push({ type: 'text', text });
    }
    images.forEach((img) => {
      const { mediaType, data } = extractBase64Parts(img.base64);
      contentList.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data },
      });
    });

    const userMessage: Message = {
      role: 'user',
      content: text,
      images: images.map((img) => img.base64),
    };

    set((s) => ({
      messages: [...s.messages, userMessage, { role: 'assistant', contents: [] }],
      isWaitingRequestId: true,
      aborted: false,
      selectedImages: [],
    }));

    try {
      const response = await sendChatRequest({
        session_id: sessionId,
        content: contentList,
        deepresearch: deepSearch,
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const messageBlocks = new Map<string, ContentBlock[]>();
      const messageIdOrder: string[] = [];
      let requestIdReceived = false;

      while (true) {
        if (get().aborted) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;
        if (get().aborted) {
          reader.cancel();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (get().aborted) break;
          const data = parseSSELine(line);
          if (!data) continue;

          if (data.request_id && !requestIdReceived) {
            set({ currentRequestId: data.request_id, isWaitingRequestId: false, isLoading: true });
            requestIdReceived = true;
          }

          const msgId = data.msg_id || 'unknown';
          if (data.plan !== undefined) {
            set({ currentPlan: data.plan || null });
          }
          if (!messageBlocks.has(msgId)) {
            messageIdOrder.push(msgId);
          }
          messageBlocks.set(msgId, data.contents || []);

          if (get().aborted) break;

          const allContents: ContentBlock[] = [];
          for (const id of messageIdOrder) {
            const blockContents = messageBlocks.get(id);
            if (blockContents && blockContents.length > 0) {
              allContents.push(...blockContents);
            }
          }

          set((s) => {
            if (s.aborted) return s;
            const newMessages = [...s.messages];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              newMessages[newMessages.length - 1] = { role: 'assistant', contents: allContents };
            } else {
              newMessages.push({ role: 'assistant', contents: allContents });
            }
            return { messages: newMessages };
          });
        }
      }
    } catch (error: any) {
      set((s) => ({
        messages: [
          ...s.messages,
          { role: 'assistant', contents: [{ type: 'error', content: `Error: ${error.message}` }] },
        ],
      }));
    } finally {
      if (!get().aborted) {
        set({ isLoading: false, isWaitingRequestId: false, currentRequestId: null });
      }
    }
  },

  stopGeneration: async () => {
    const { sessionId, currentRequestId } = get();
    if (!currentRequestId) return;
    try {
      await apiStopGeneration(sessionId, currentRequestId);
      set((s) => {
        const newMessages = [...s.messages];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          const contents = lastMsg.contents || [];
          if (contents.length === 0) {
            newMessages.pop();
          }
        }
        return {
          aborted: true,
          isLoading: false,
          isWaitingRequestId: false,
          currentRequestId: null,
          pendingRequest: null,
          messages: newMessages,
        };
      });
    } catch (e) {
      console.error('Stop generation failed:', e);
    }
  },

  newChat: () => {
    const sessionStore = useSessionStore.getState();
    const newId = sessionStore.createSession();
    set({
      sessionId: newId,
      messages: [],
      isLoading: false,
      isWaitingRequestId: false,
      currentRequestId: null,
      pendingRequest: null,
      selectedImages: [],
      currentPlan: null,
      aborted: false,
    });
  },

  switchToSession: (id: string) => {
    const { isLoading, sessionId } = get();
    if (id === sessionId) return;

    // Stop active generation before switching
    if (isLoading) {
      get().stopGeneration();
    }

    const sessionStore = useSessionStore.getState();
    sessionStore.switchSession(id);

    set({
      sessionId: id,
      messages: [],
      isLoading: false,
      isWaitingRequestId: false,
      currentRequestId: null,
      pendingRequest: null,
      selectedImages: [],
      currentPlan: null,
      aborted: false,
    });
  },

  setPendingRequest: (req) => set({ pendingRequest: req }),
  setSelectedImages: (images) => set({ selectedImages: images }),
  addImage: (img) => set((s) => ({ selectedImages: [...s.selectedImages, img] })),
  removeImage: (id) => set((s) => ({ selectedImages: s.selectedImages.filter((i) => i.id !== id) })),
}));
