import { FaSearch, FaBell, FaCog, FaSignOutAlt, FaUser, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import UserAvatar from "../components/UserAvatar";
import LanguageDropdown from "../components/LanguageDropdown";

export default function Topbar() {
  const { authUser, logout, socket } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toggleSidebar } = useSidebarStore();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const isNotificationOpenRef = useRef(false);

  useEffect(() => {
    isNotificationOpenRef.current = isNotificationOpen;
  }, [isNotificationOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload) => {
      const nextNotification = {
        id: payload?.id || `notif-${Date.now()}`,
        title: payload?.title || "Notification",
        message: payload?.message || "You have a new update",
        link: payload?.link || "/admin/bookings",
        createdAt: payload?.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => [nextNotification, ...prev].slice(0, 20));
      if (!isNotificationOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket]);

  const toggleNotificationPanel = () => {
    setIsNotificationOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Hamburger & Search Bar */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            type="button"
            onClick={toggleSidebar}
            className="p-2 text-green-800 hover:bg-green-800/5 rounded-lg md:hidden"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-xl" />
          </button>
          
          <div className="hidden sm:block flex-1 max-w-2xl">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-800/40" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-blue-800/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent text-sm text-blue-800 placeholder-blue-800/30"
              />
            </div>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageDropdown />

          {/* Mobile Search Icon (only visible when the search input is hidden) */}
          <button type="button" className="sm:hidden p-2 text-green-800 hover:bg-green-800/5 rounded-lg">
            <FaSearch className="text-lg" />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={toggleNotificationPanel}
              className="relative p-2 text-green-800 hover:bg-green-800/5 rounded-lg transition-colors"
              title="Notifications"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-green-800 text-white text-[10px] font-semibold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[92vw] rounded-xl border border-gray-200 bg-white shadow-xl z-50">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Notifications</p>
                  <button
                    type="button"
                    onClick={() => setNotifications([])}
                    className="text-xs font-semibold text-green-800 hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        to={notification.link}
                        onClick={() => setIsNotificationOpen(false)}
                        className="block border-b border-gray-50 px-4 py-3 hover:bg-green-50/50"
                      >
                        <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{notification.message}</p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            to="/admin/settings"
            className="hidden sm:block p-2 text-green-800 hover:bg-green-800/5 rounded-lg transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <FaCog className="text-lg" />
          </Link>

          <div className="h-8 w-px bg-gray-200 mx-1 md:mx-2" />

          {/* User Profile Dropdown */}
          <div 
            className="relative"
            ref={dropdownRef}
          >
            <button 
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Open profile menu"
            >
              <UserAvatar
                src={authUser?.profileImage}
                name={authUser?.name}
                alt="User"
                sizeClass="h-8 w-8 md:h-9 md:w-9"
                className="border-2 border-green-800/20"
              />
            </button>

            {/* Hover Box */}
            {isOpen && (
              <div className="absolute right-0 mt-1 w-56 md:w-60 bg-white rounded-xl shadow-xl border border-green-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-green-800 truncate">
                    {authUser?.name || "Admin User"}
                  </p>
                  <p className="text-xs font-medium text-green-700 mt-0.5">
                    {authUser?.role === "ADMIN" ? "Super Admin" : authUser?.role || "Admin"}
                  </p>
                </div>
                
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-green-50 transition-colors"
                  >
                    <FaUser className="text-green-700" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-green-50 transition-colors"
                  >
                    <FaCog className="text-green-700" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="mt-1 pt-1 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
