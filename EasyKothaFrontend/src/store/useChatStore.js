import { create } from "zustand";

export const useChatStore = create((set) => ({
  selectedUser: null,
  messages: [],

  setSelectedUser: (user) => set({ selectedUser: user || null }),
  setMessages: (messages) => set({ messages: Array.isArray(messages) ? messages : [] }),
  clearChatState: () => set({ selectedUser: null, messages: [] }),
}));
