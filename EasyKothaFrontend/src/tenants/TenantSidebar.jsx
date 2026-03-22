import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useSidebarStore } from "../store/useSidebarStore";
import {
  FaThLarge,
  FaKey,
  FaFileAlt,
  FaBell,
  FaSignOutAlt,
  FaComments,
  FaHome,
  FaTimes,
} from "react-icons/fa";

function MenuItem({ to, icon, label, active, unreadCount, onClick }) {
  const IconComponent = icon;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors relative ${
        active
          ? "bg-green-800/10 text-green-800 ring-1 ring-green-800/20"
          : "text-slate-700 hover:bg-green-800/10 hover:text-green-800"
      }`}
    >
      <div className="relative">
        <IconComponent className={active ? "text-green-800" : "text-slate-600 group-hover:text-green-800"} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function TenantSidebar() {
  const { pathname } = useLocation();
  const { authUser, logout } = useAuthStore();
  const { unreadMessages } = useChatStore();
  const { isSidebarOpen, closeSidebar } = useSidebarStore();

  const totalUnread = Object.values(unreadMessages || {}).reduce((sum, count) => sum + count, 0);

  return (
    <>
      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeSidebar} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-y-auto border-r border-gray-300 bg-gray-100 text-slate-900 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:top-0 md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src="/EasyKothaColoured-02.png" alt="EasyKotha" className="h-10 w-10 rounded-md object-contain" />
            <div>
              <div className="font-semibold leading-5 text-slate-900">EasyKotha</div>
              <div className="text-[11px] tracking-wide text-slate-500">TENANT PANEL</div>
            </div>
          </div>
          <button className="rounded-lg p-2 text-slate-600 hover:bg-gray-200 md:hidden" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>

        <hr className="border-gray-300" />

        <nav className="px-4 py-4">
          <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500">MAIN MENU</p>
          <div className="space-y-2">
            {/* <MenuItem to="/" icon={FaHome} label="Home" active={pathname === "/"} onClick={closeSidebar} /> */}
            <MenuItem
              to="/tenant/dashboard"
              icon={FaThLarge}
              label="Dashboard"
              active={pathname.includes("/tenant/dashboard")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/tenant/bookings"
              icon={FaKey}
              label="Bookings"
              active={pathname.includes("/tenant/bookings")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/tenant/saved"
              icon={FaFileAlt}
              label="Saved"
              active={pathname.includes("/tenant/saved") || pathname.includes("/tenant/favourites")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/tenant/explore"
              icon={FaBell}
              label="Explore Rooms"
              active={pathname.includes("/tenant/explore")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/chat"
              icon={FaComments}
              label="Chat"
              active={pathname.includes("/chat")}
              unreadCount={totalUnread}
              onClick={closeSidebar}
            />
          </div>
        </nav>

        <div className="mt-auto border-t border-gray-300 p-4">
          <div className="flex items-center justify-between">
            <Link to="/profile" className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80">
              <img
                src={authUser?.profileImage || "/sadmin.png"}
                alt="User avatar"
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="leading-4">
                <div className="text-sm font-semibold">{authUser?.name || "Tenant"}</div>
                <div className="text-[11px] text-slate-500">Tenant</div>
              </div>
            </Link>
            <button onClick={logout} type="button" title="Sign out" className="text-green-800 hover:text-green-700">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
