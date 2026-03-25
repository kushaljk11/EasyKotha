import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { LogOut, User, BellDot, MessageCircleMore, Menu, CalendarCheck2, CircleCheckBig, Info } from "lucide-react";
import UserAvatar from "../components/UserAvatar";
import LanguageDropdown from "../components/LanguageDropdown";

const getNotificationTarget = (link, role) => {
  if (!link) {
    return role === "ADMIN"
      ? "/admin/bookings"
      : role === "LANDLORD"
      ? "/landlord/bookings"
      : "/tenant/bookings";
  }

  if (
    link === "/admin/bookings" ||
    link === "/landlord/bookings" ||
    link === "/tenant/bookings"
  ) {
    return role === "ADMIN"
      ? "/admin/bookings"
      : role === "LANDLORD"
      ? "/landlord/bookings"
      : "/tenant/bookings";
  }

  if (link === "/profile") {
    return role === "ADMIN"
      ? "/profile"
      : role === "LANDLORD"
      ? "/landlord/profile"
      : "/tenant/profile";
  }

  return link;
};

const getNotificationIcon = (notification) => {
  const type = String(notification?.type || "").toLowerCase();
  const title = String(notification?.title || "").toLowerCase();
  const message = String(notification?.message || "").toLowerCase();

  if (type.includes("booking") || title.includes("booking") || message.includes("booking")) {
    return CalendarCheck2;
  }

  if (message.includes("approved") || message.includes("confirmed")) {
    return CircleCheckBig;
  }

  return Info;
};

export default function TenantTopbar() {
  const { authUser, logout, socket } = useAuthStore();
  const { unreadMessages } = useChatStore();
  const { toggleSidebar } = useSidebarStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const isNotificationOpenRef = useRef(false);

  const totalUnread = Object.values(unreadMessages || {}).reduce((sum, count) => sum + count, 0);
  const normalizedRole = String(authUser?.role || "TENANT").trim().toUpperCase();

  useEffect(() => {
    isNotificationOpenRef.current = isNotificationOpen;
  }, [isNotificationOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload) => {
      const nextNotification = {
        id: payload?.id || `tenant-notif-${Date.now()}`,
        title: payload?.title || "Notification",
        message: payload?.message || "You have a new update",
        type: payload?.type || "generic",
        link: getNotificationTarget(payload?.link, normalizedRole),
        createdAt: payload?.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => [nextNotification, ...prev].slice(0, 20));
      if (!isNotificationOpenRef.current) {
        setUnreadNotificationCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket, normalizedRole]);

  const toggleNotificationPanel = () => {
    setIsNotificationOpen((prev) => {
      const next = !prev;
      if (next) setUnreadNotificationCount(0);
      return next;
    });
  };

  return (
    <div className="sticky top-0 z-30 flex w-full items-center border-b border-gray-100 bg-white px-4 py-3 shadow-sm md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-green-800 hover:bg-green-50 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        <LanguageDropdown />

        <Link
          to="/chat"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-green-100 bg-green-50/50 text-green-800 transition-all hover:bg-green-100"
          title="Messages"
        >
          <MessageCircleMore size={20} />
          {totalUnread > 0 && (
            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Link>

        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={toggleNotificationPanel}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-green-100 bg-green-50/50 text-green-800 transition-all hover:bg-green-100"
            title="Notifications"
          >
            <BellDot size={20} />
            {unreadNotificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-green-800 px-1 text-[10px] font-semibold text-white">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
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
                  notifications.map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification);
                    return (
                      <Link
                        key={notification.id}
                        to={notification.link}
                        onClick={() => setIsNotificationOpen(false)}
                        className="block border-b border-gray-50 px-4 py-3 hover:bg-green-50/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-green-100 p-1.5 text-green-800">
                            <NotificationIcon size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                            <p className="mt-0.5 text-xs text-slate-600">{notification.message}</p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {authUser ? (
          <div ref={profileRef} className="relative flex items-center gap-4 border-l border-gray-100 pl-5">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-gray-900">{authUser.name}</p>
              <p className="mt-1 text-xs font-semibold capitalize text-gray-400">{authUser.role.toLowerCase()} Account</p>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="rounded-full p-0.5"
              aria-expanded={isProfileOpen}
              aria-label="Open profile menu"
            >
              <UserAvatar
                src={authUser?.profileImage}
                name={authUser?.name}
                alt="Avatar"
                sizeClass="h-10 w-10"
                className="border-2 border-gray-100 shadow-sm transition-all hover:border-green-400"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-52 rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-green-700"
                >
                  <User size={16} className="opacity-60" /> Profile Settings
                </Link>
                <div className="mx-2 my-1 h-px bg-gray-50" />
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} className="opacity-60" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 text-[13px] font-semibold text-gray-500 hover:text-green-700">
              Login
            </Link>
            <Link to="/register" className="rounded-xl bg-green-800 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-lg shadow-green-800/20 transition-all hover:bg-green-700">
              Join Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
