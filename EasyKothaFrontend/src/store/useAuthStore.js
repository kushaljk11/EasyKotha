import { create } from "zustand";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      // If unauthorized, clear token
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      localStorage.setItem("token", res.data.token);
      set({ authUser: res.data.user });
      toast.success("Account created successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      set({ authUser: res.data.user });
      toast.success("Welcome back!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("token");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ authUser: res.data });
      toast.success("Profile updated!");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  toggleSavePost: async (postId) => {
    try {
      const res = await axiosInstance.post(`/auth/save-post/${postId}`);
      set({ authUser: res.data });

      const isSaved = Array.isArray(res.data.savedPosts)
        ? res.data.savedPosts.some((savedPost) => {
            const savedId =
              typeof savedPost === "object"
                ? savedPost?.id ?? savedPost?.postId ?? savedPost?._id
                : savedPost;
            return String(savedId) === String(postId);
          })
        : false;

      toast.success(isSaved ? "Post saved to your list" : "Post removed from list");
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to update saved posts");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser.id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
