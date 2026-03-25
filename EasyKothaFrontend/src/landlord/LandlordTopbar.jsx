import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaBell, FaCog, FaSearch, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useSidebarStore } from "../store/useSidebarStore";
import { useAuthStore } from "../store/useAuthStore";
import UserAvatar from "../components/UserAvatar";
import LanguageDropdown from "../components/LanguageDropdown";

const getNotificationTarget = (link, role) => {
  if (!link) {
    return role === "ADMIN"
      ? "/admin/bookings"
      : role === "TENANT"
      ? "/tenant/bookings"
      : "/landlord/bookings";
  }

  if (
    link === "/admin/bookings" ||
    link === "/landlord/bookings" ||
    link === "/tenant/bookings"
  ) {
    return role === "ADMIN"
      ? "/admin/bookings"
      : role === "TENANT"
      ? "/tenant/bookings"
      : "/landlord/bookings";
  }

  if (link === "/profile") {
    return role === "ADMIN"
      ? "/profile"
      : role === "TENANT"
      ? "/tenant/profile"
      : "/landlord/profile";
  }

  return link;
};

export default function LandlordTopbar({ searchPlaceholder = "Search..." }) {
  const { toggleSidebar } = useSidebarStore();
  const { authUser, logout, socket } = useAuthStore();
  const normalizedRole = String(authUser?.role || "LANDLORD").trim().toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const isNotificationOpenRef = useRef(false);

  useEffect(() => {
    isNotificationOpenRef.current = isNotificationOpen;
  }, [isNotificationOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

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
        id: payload?.id || `landlord-notif-${Date.now()}`,
        title: payload?.title || "Notification",
        message: payload?.message || "You have a new update",
        link: getNotificationTarget(payload?.link, normalizedRole),
        createdAt: payload?.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => [nextNotification, ...prev].slice(0, 20));
      if (!isNotificationOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket, normalizedRole]);

  const toggleNotificationPanel = () => {
    setIsNotificationOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-green-800 hover:bg-green-800/5 md:hidden"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-xl" />
          </button>

          <div className="hidden max-w-2xl flex-1 sm:block">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-800/40" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-blue-800/10 py-2 pl-10 pr-4 text-sm text-blue-800 placeholder-blue-800/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <LanguageDropdown />

          <button type="button" className="rounded-lg p-2 text-green-800 hover:bg-green-800/5 sm:hidden" title="Search">
            <FaSearch className="text-lg" />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={toggleNotificationPanel}
              className="relative rounded-lg p-2 text-green-800 hover:bg-green-800/5"
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
              <div className="absolute right-0 z-50 mt-2 w-80 max-w-[92vw] rounded-xl border border-gray-200 bg-white shadow-xl">
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

          <Link to="/landlord/profile" className="hidden rounded-lg p-2 text-green-800 hover:bg-green-800/5 sm:block" title="Profile Settings">
            <FaCog className="text-lg" />
          </Link>

          <div className="mx-1 h-8 w-px bg-gray-200 md:mx-2" />

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100"
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

            {isOpen && (
              <div className="absolute right-0 z-50 mt-1 w-60 animate-in fade-in slide-in-from-top-2 rounded-xl border border-blue-800/10 bg-white py-3 shadow-xl duration-200">
                <div className="mb-1 border-b border-gray-100 px-4 py-2">
                  <p className="truncate text-sm font-bold text-blue-800">{authUser?.name || "Landlord User"}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-green-800">
                    {authUser?.role || "LANDLORD"}
                  </p>
                </div>

                <div className="py-1">
                  <Link to="/landlord/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50">
                    <FaUser className="text-blue-800/60" />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/landlord/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50">
                    <FaCog className="text-blue-800/60" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="mt-1 border-t border-gray-100 pt-1">
                  <button
                    onClick={logout}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
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
