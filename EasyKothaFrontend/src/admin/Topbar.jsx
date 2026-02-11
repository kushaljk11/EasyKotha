import { FaSearch, FaBell, FaCog, FaSignOutAlt, FaUser, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";

export default function Topbar() {
  const { authUser, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const { toggleSidebar } = useSidebarStore();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Hamburger & Search Bar */}
        <div className="flex items-center gap-4 flex-1">
          <button 
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
          {/* Mobile Search Icon (only visible when the search input is hidden) */}
          <button className="sm:hidden p-2 text-green-800 hover:bg-green-800/5 rounded-lg">
            <FaSearch className="text-lg" />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 text-green-800 hover:bg-green-800/5 rounded-lg transition-colors"
            title="Notifications"
          >
            <FaBell className="text-lg" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-green-800 rounded-full"></span>
          </button>

          {/* Settings */}
          <Link
            to="/settings"
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
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none"
            >
              <img
                src={authUser?.profileImage || "/sadmin.png"}
                alt="User"
                className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover border-2 border-green-800/20"
              />
            </button>

            {/* Hover Box */}
            {isOpen && (
              <div className="absolute right-0 mt-1 w-56 md:w-60 bg-white rounded-xl shadow-xl border border-blue-800/10 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-bold text-blue-800 truncate">
                    {authUser?.name || "Admin User"}
                  </p>
                  <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mt-0.5">
                    {authUser?.role === "ADMIN" ? "Super Admin" : authUser?.role || "Admin"}
                  </p>
                </div>
                
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                  >
                    <FaUser className="text-blue-800/60" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                  >
                    <FaCog className="text-blue-800/60" />
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
