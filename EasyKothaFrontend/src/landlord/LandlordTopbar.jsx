import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaBell, FaCog, FaSearch, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useSidebarStore } from "../store/useSidebarStore";
import { useAuthStore } from "../store/useAuthStore";

export default function LandlordTopbar({ searchPlaceholder = "Search..." }) {
  const { toggleSidebar } = useSidebarStore();
  const { authUser, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <button
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
          <button className="rounded-lg p-2 text-green-800 hover:bg-green-800/5 sm:hidden" title="Search">
            <FaSearch className="text-lg" />
          </button>

          <button className="relative rounded-lg p-2 text-green-800 hover:bg-green-800/5" title="Notifications">
            <FaBell className="text-lg" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-800" />
          </button>

          <Link to="/landlord/profile" className="hidden rounded-lg p-2 text-green-800 hover:bg-green-800/5 sm:block" title="Profile Settings">
            <FaCog className="text-lg" />
          </Link>

          <div className="mx-1 h-8 w-px bg-gray-200 md:mx-2" />

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100"
            >
              <img
                src={authUser?.profileImage || "/sadmin.png"}
                alt="User"
                className="h-8 w-8 rounded-full border-2 border-green-800/20 object-cover md:h-9 md:w-9"
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
