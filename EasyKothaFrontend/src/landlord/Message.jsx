import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import {
  FaComments,
  FaEnvelope,
  FaPaperPlane,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import LandlordLayout from "./LandlordLayout";

export default function Message() {
  const { authUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axiosInstance.get("/messages/users");
        const fetchedUsers = res.data || [];
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
          setActiveUserId(fetchedUsers[0].id);
        }
      } catch (error) {
        console.error("Failed to load message users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!activeUserId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await axiosInstance.get(`/messages/${activeUserId}`);
        setMessages(res.data || []);
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeUserId]);

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !activeUserId) return;

    try {
      const res = await axiosInstance.post(`/messages/send/${activeUserId}`, { text });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const activeUser = users.find((user) => user.id === activeUserId);

  return (
    <LandlordLayout searchPlaceholder="Search chats...">
      <div className="mb-1">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-green-800">
          <FaComments />
          Messages
        </h2>
        <p className="mt-1 text-slate-600">Message support is connected to your existing backend chat endpoints.</p>
      </div>

      <div className="grid h-[calc(100vh-210px)] min-h-[520px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:grid-cols-[340px_1fr]">
        <section className="border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FaEnvelope className="text-green-800" />
              Conversations
            </h2>
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
              />
            </div>
          </div>

          <div className="h-[calc(100%-77px)] overflow-y-auto">
            {loadingUsers && <p className="p-4 text-sm text-slate-500">Loading conversations...</p>}

            {!loadingUsers && filteredUsers.length === 0 && (
              <p className="p-4 text-sm text-slate-500">No users found.</p>
            )}

            {!loadingUsers &&
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setActiveUserId(user.id)}
                  className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition-colors ${
                    activeUserId === user.id ? "bg-green-800/10" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-800/10 font-semibold text-green-800">
                    {(user.name || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{user.name || "Unnamed"}</p>
                    <p className="truncate text-xs text-slate-500">{user.email || "No email"}</p>
                  </div>
                </button>
              ))}
          </div>
        </section>

        <section className="flex h-full flex-col bg-slate-50">
          <div className="border-b border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <FaUser className="text-green-800" />
              {activeUser?.name || "Select a conversation"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{activeUser?.email || ""}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {loadingMessages && <p className="text-sm text-slate-500">Loading messages...</p>}

            {!loadingMessages && messages.length === 0 && (
              <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
            )}

            {!loadingMessages &&
              messages.map((message) => {
                const isMine = Number(message.senderId) === Number(authUser?.id);
                return (
                  <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${isMine ? "bg-green-800 text-white" : "bg-white text-slate-800 shadow-sm"}`}>
                      {message.image && (
                        <img src={message.image} alt="attachment" className="mb-2 max-h-52 rounded-lg object-cover" />
                      )}
                      {message.text}
                      <p className={`mt-2 text-[11px] ${isMine ? "text-white/70" : "text-slate-500"}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
              />
              <button
                disabled={!activeUserId || !newMessage.trim()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-800 text-white disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </section>
      </div>
    </LandlordLayout>
  );
}