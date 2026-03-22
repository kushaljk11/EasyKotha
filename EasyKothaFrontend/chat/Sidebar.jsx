import { useEffect, useState } from "react";
import { useChatStore } from "../src/store/useChatStore";
import { useAuthStore } from "../src/store/useAuthStore";
import SidebarSkeleton from "./components/skeletons/SidebarSkeleton";
import { Users, Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadMessages } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [brokenAvatarMap, setBrokenAvatarMap] = useState({});

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers
    .filter((user) => {
      if (!showOnlineOnly) return true;
      return onlineUsers.includes(String(user.id ?? user._id));
    })
    .filter((user) => {
      const name = (user.name || user.fullName || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full border-r border-slate-200 flex flex-col bg-white">
      <div className="border-b border-slate-200 w-full px-4 py-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Users className="size-5" />
          <span className="font-semibold">Recent Chats</span>
        </div>

        <div className="mt-3 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contact..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-green-700 focus:bg-white"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-700"
            />
            <span className="text-sm text-slate-600">Show online only</span>
          </label>
          <span className="text-xs font-medium text-slate-500">{Math.max(onlineUsers.length - 1, 0)} online</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2">
        {filteredUsers.map((user) => {
          const userId = user.id ?? user._id;
          const isOnline = onlineUsers.includes(String(userId));
          const isSelected = String(selectedUser?.id ?? selectedUser?._id) === String(userId);
          const unreadCount = unreadMessages?.[userId] || unreadMessages?.[String(userId)] || 0;
          const displayName = user.name || user.fullName || "Unknown";
          const casteOrRole = user.caste || user.role || "Member";
          const avatarSrc = user.profileImage || user.profilePic || "";
          const showLetterAvatar = !avatarSrc || brokenAvatarMap[String(userId)];
          const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "?";

          return (
            <button
              key={userId}
              onClick={() => setSelectedUser(user)}
              className={`mx-2 mb-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                isSelected
                  ? "border-green-200 bg-green-50/70 shadow-sm"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="relative shrink-0">
                {showLetterAvatar ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-800/15 text-lg font-bold text-green-800 ring-2 ring-white">
                    {avatarLetter}
                  </div>
                ) : (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                    onError={() => {
                      setBrokenAvatarMap((prev) => ({ ...prev, [String(userId)]: true }));
                    }}
                  />
                )}
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    isOnline ? "bg-green-500" : "bg-slate-300"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[15px] font-semibold text-slate-900">{displayName}</p>
                  {unreadCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-green-700 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-slate-500">Caste/Role: {casteOrRole}</p>
                  <p className={`text-[11px] font-semibold ${isOnline ? "text-green-600" : "text-slate-400"}`}>
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Users className="size-5" />
            </div>
            <p className="text-sm font-medium text-slate-600">No contacts found</p>
            <p className="mt-1 text-xs text-slate-400">Try disabling online-only filter.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
