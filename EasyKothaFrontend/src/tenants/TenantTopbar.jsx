import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { LogOut, User, Bell, LayoutDashboard, Compass, Heart, Bookmark, MessageSquare, Menu } from "lucide-react";

export default function TenantTopbar() {
  const { authUser, logout } = useAuthStore();
  const { pathname } = useLocation();
  const { unreadMessages } = useChatStore();
  const { toggleSidebar } = useSidebarStore();

  const totalUnread = Object.values(unreadMessages || {}).reduce((sum, count) => sum + count, 0);

  const navLinks = [
    { name: "Browse", path: "/tenant/explore", icon: Compass },
    {
      name: "Dashboard",
      path: authUser?.role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: authUser?.role === "LANDLORD" ? "My Listings" : "My Booking",
      path: authUser?.role === "LANDLORD" ? "/landlord/listings" : "/tenant/bookings",
      icon: Bookmark,
    },
    {
      name: authUser?.role === "LANDLORD" ? "Bookings" : "Saved Posts",
      path: authUser?.role === "LANDLORD" ? "/landlord/bookings" : "/tenant/saved",
      icon: authUser?.role === "LANDLORD" ? LayoutDashboard : Heart,
    },
  ];

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

        <Link to="/" className="group flex items-center gap-2.5">
          <img src="/EasyKothaColoured-02.png" alt="Logo" className="h-9 w-9 object-contain transition-transform group-hover:scale-105" />
          <span className="text-xl font-semibold tracking-tighter text-green-800">Easy Kotha</span>
        </Link>
      </div>

      <nav className="hidden items-center gap-10 lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 text-sm font-semibold transition-all ${
              pathname === link.path
                ? "border-b-2 border-green-800 pb-1 -mb-1 text-green-800"
                : "text-gray-400 hover:border-b-2 hover:border-green-700/50 hover:pb-1 hover:-mb-1 hover:text-green-800"
            }`}
          >
            <link.icon size={16} strokeWidth={2.5} />
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-1">
        <Link
          to="/chat"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-50 hover:text-green-800"
          title="Messages"
        >
          <MessageSquare size={20} />
          {totalUnread > 0 && (
            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Link>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-green-50 hover:text-green-800">
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        {authUser ? (
          <div className="group relative flex items-center gap-4 border-l border-gray-100 pl-5">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-gray-900">{authUser.name}</p>
              <p className="mt-1 text-xs font-bold capitalize text-gray-400">{authUser.role.toLowerCase()} Account</p>
            </div>

            <div className="relative cursor-pointer">
              <img
                src={authUser.profileImage || "/sadmin.png"}
                alt="Avatar"
                className="h-10 w-10 rounded-full border-2 border-gray-100 object-cover shadow-sm transition-all group-hover:border-green-400"
              />

              <div className="invisible absolute right-0 top-full z-40 mt-3 w-52 translate-y-2 rounded-2xl border border-gray-100 bg-white py-2 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-green-700">
                  <User size={16} className="opacity-60" /> Profile Settings
                </Link>
                <div className="mx-2 my-1 h-px bg-gray-50" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut size={16} className="opacity-60" /> Logout
                </button>
              </div>
            </div>
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
