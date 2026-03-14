import { useEffect, useState } from "react";
import { useChatStore } from "../../../src/store/useChatStore";
import { useAuthStore } from "../../../src/store/useAuthStore";
import SidebarSkeleton from "./SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadMessages } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const onlineChattedUsers = users.filter((user) => onlineUsers.includes(user._id));
  const filteredUsers = onlineChattedUsers.filter((user) =>
    (user.name || user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full flex flex-col transition-all duration-300 bg-white border-none overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#19545c] text-white font-bold text-sm tracking-wide flex items-center justify-center shadow-sm">
              SJ
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-lg tracking-tight">Chat Contacts</span>
              <p className="text-[11px] text-slate-500 font-medium">Online conversations only</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search online contacts"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#19545c]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full px-3 py-4 space-y-2">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-4 flex items-center gap-4 rounded-3xl
              transition-all duration-200 group relative
              ${selectedUser?._id === user._id 
                ? "bg-gray-50 shadow-sm border border-gray-100" 
                : "hover:bg-slate-50 border border-transparent"}
            `}
          >
            <div className="relative shrink-0">
              <div className={`p-0.5 rounded-2xl transition-all ${onlineUsers.includes(user._id) ? "ring-2 ring-green-400" : "ring-1 ring-slate-100"}`}>
                <img
                  src={user.profileImage || "/avatar.png"}
                  alt={user.name || user.fullName || "User"}
                  className="w-12 h-12 object-cover rounded-[1.2rem] shadow-sm transition-transform group-hover:scale-105"
                />
              </div>
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 
                  rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110"
                />
              )}
            </div>

            {/* User info */}
            <div className="text-left min-w-0 flex-1">
              <div className={`font-semibold tracking-tight truncate transition-colors ${selectedUser?._id === user._id ? "text-[#19545c]" : "text-slate-800"}`}>
                {user.name || user.fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(user._id) ? "bg-green-400" : "bg-slate-300"}`}></span>
                <span className={`text-[10px] font-semibold uppercase tracking-widest truncate ${selectedUser?._id === user._id ? "text-[#19545c]/70" : (onlineUsers.includes(user._id) ? "text-green-600" : "text-slate-400")}`}>
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Unread Badge */}
            {unreadMessages[user._id] > 0 && (
              <div className={`shrink-0 rounded-xl min-w-6 h-6 px-1.5 flex items-center justify-center text-[10px] font-semibold shadow-lg scale-100 group-hover:scale-110 transition-transform ${selectedUser?._id === user._id ? "bg-[#19545c] text-white" : "bg-[#19545c] text-white shadow-[#19545c]/20"}`}>
                {unreadMessages[user._id]}
              </div>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 opacity-70">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No online contacts yet</p>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
