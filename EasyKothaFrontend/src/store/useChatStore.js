import { create } from "zustand";
import axiosInstance from "../api/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set) => ({
  selectedUser: null,
  users: [],
  unreadMessages: {},
  messages: [],
  isUsersLoading: false,
  isMessagesLoading: false,

  setSelectedUser: (user) =>
    set((state) => {
      if (!user) {
        return { selectedUser: null, messages: [] };
      }

      const selectedId = user.id ?? user._id;
      const nextUnread = { ...state.unreadMessages };
      if (selectedId !== undefined) delete nextUnread[selectedId];

      return {
        selectedUser: user,
        unreadMessages: nextUnread,
      };
    }),

  setMessages: (messages) => set({ messages: Array.isArray(messages) ? messages : [] }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Failed to load users:", error);
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId && userId !== 0) {
      set({ messages: [] });
      return;
    }

    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Failed to load messages:", error);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (payload) => {
    const state = useChatStore.getState();
    const receiverId = state.selectedUser?.id ?? state.selectedUser?._id;
    if (!receiverId) throw new Error("No selected user");

    const res = await axiosInstance.post(`/messages/send/${receiverId}`, payload);
    const createdMessage = res.data;

    set((prev) => ({
      messages: [...prev.messages, createdMessage],
    }));

    return createdMessage;
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      set((state) => {
        const selectedId = state.selectedUser?.id ?? state.selectedUser?._id;
        const senderId = newMessage?.senderId;

        if (selectedId && String(senderId) === String(selectedId)) {
          return { messages: [...state.messages, newMessage] };
        }

        const nextUnread = { ...state.unreadMessages };
        if (senderId !== undefined) {
          nextUnread[senderId] = (nextUnread[senderId] || 0) + 1;
        }

        return { unreadMessages: nextUnread };
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  clearChatState: () =>
    set({
      selectedUser: null,
      users: [],
      unreadMessages: {},
      messages: [],
      isUsersLoading: false,
      isMessagesLoading: false,
    }),
}));
