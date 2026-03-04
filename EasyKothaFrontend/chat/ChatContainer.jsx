import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import MessageInput from "./Messageinput";
import MessageSkeleton from "./components/skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../api/utils";
import ProfileModal from "./components/ProfileModal";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const navigate = useNavigate();
  const messageEndRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileToShow] = useState(null);
  const handleProfileClick = (user) => {
    navigate(`/profile/${user._id || user.id}`);
  };

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
        {messages.map((message, index) => {
          const isMyMessage = String(message.senderId) === String(authUser?.id || authUser?._id);
          const isDelivered = onlineUsers.includes(message.receiverId);
          
          return (
            <div
              key={message._id || index}
              className={`flex ${isMyMessage ? "justify-end" : "justify-start"} message-animate`}
            >
              <div className={`flex gap-3 max-w-[80%] ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
                <div className="shrink-0 self-end mb-1">
                  <img
                    src={
                      isMyMessage
                        ? authUser.profileImage || "/avatar.png"
                        : selectedUser.profileImage || "/avatar.png"
                    }
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all shadow-sm"
                    onClick={() => handleProfileClick(isMyMessage ? authUser : selectedUser)}
                  />
                </div>

                <div className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}>
                  <div
                    className={`relative px-4 py-2.5 shadow-sm transition-all duration-200 ${
                      isMyMessage
                        ? "bg-[#19545c] text-white rounded-3xl rounded-br-none"
                        : "bg-white text-slate-800 rounded-3xl rounded-bl-none border border-slate-100"
                    }`}
                  >
                    {message.image && (
                      <div className="mb-2 overflow-hidden rounded-xl">
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-full sm:max-w-sm h-auto object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {message.text && (
                      <p className="text-[15px] leading-relaxed wrap-break-word">
                        {message.text}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center mt-1.5 px-1 gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
                    <time className="text-[11px] font-medium text-slate-400 font-mono tracking-tight">
                      {formatMessageTime(message.createdAt)}
                    </time>
                    {isMyMessage && (
                      <span className={`text-[11px] font-semibold ${isDelivered ? "text-[#19545c]" : "text-slate-400"}`}>
                        {isDelivered ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <div className="border-t border-gray-100 bg-white">
        <MessageInput />
      </div>

      {showProfileModal && (
        <ProfileModal
          user={profileToShow}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};
export default ChatContainer;
