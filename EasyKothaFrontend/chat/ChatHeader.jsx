import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore.js";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const navigate = useNavigate();
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-6 py-4 border-b border-gray-100 bg-white shadow-sm z-10 transition-all">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-4 group cursor-pointer"
          onClick={() => navigate(`/profile/${selectedUser._id}`)}
        >
          {/* Avatar with Status Ring */}
          <div className="relative">
            <div className={`p-0.5 rounded-full ${isOnline ? "bg-green-100" : "bg-gray-100"}`}>
              <img 
                src={selectedUser.profileImage || "/avatar.png"} 
                alt={selectedUser.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </div>

          {/* User info */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {selectedUser.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
              <p className={`text-xs font-medium ${isOnline ? "text-green-600" : "text-gray-500"}`}>
                {isOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Close button */}
          <button 
            onClick={() => setSelectedUser(null)}
            className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm border border-gray-100"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
