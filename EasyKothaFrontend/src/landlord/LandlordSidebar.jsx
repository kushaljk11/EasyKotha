import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useSidebarStore } from "../store/useSidebarStore";
import {
  FaCalendarAlt,
  FaComments,
  FaCompass,
  FaHome,
  FaPlusCircle,
  FaTachometerAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

function NavItem({ to, icon, label, active, onClick }) {
  const IconComponent = icon;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
        active
          ? "bg-green-800/10 text-green-800 ring-1 ring-green-800/20"
          : "text-slate-700 hover:bg-green-800/10 hover:text-green-800"
      }`}
    >
      <IconComponent className={active ? "text-green-800" : "text-slate-600 group-hover:text-green-800"} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function LandlordSidebar() {
  const { pathname } = useLocation();
  const { isSidebarOpen, closeSidebar } = useSidebarStore();

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={closeSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-gray-300 bg-gray-100 text-black md:hidden"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img src="/EasyKothaColoured-02.png" alt="EasyKotha" className="h-10 w-10 rounded-md object-contain" />
                <div>
                  <p className="leading-5 font-semibold text-black">EasyKotha</p>
                  <p className="text-[11px] tracking-wide text-slate-500">LANDLORD PANEL</p>
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
                <NavItem
                  to="/landlord/dashboard"
                  icon={FaTachometerAlt}
                  label="Dashboard"
                  active={pathname.includes("/landlord/dashboard")}
                  onClick={closeSidebar}
                />
                <NavItem
                  to="/landlord/listings"
                  icon={FaHome}
                  label="My Listings"
                  active={pathname.includes("/landlord/listings")}
                  onClick={closeSidebar}
                />
                <NavItem
                  to="/landlord/explore"
                  icon={FaCompass}
                  label="Explore"
                  active={pathname.includes("/landlord/explore")}
                  onClick={closeSidebar}
                />
                <NavItem
                  to="/landlord/add-listing"
                  icon={FaPlusCircle}
                  label="Add New"
                  active={pathname.includes("/landlord/add-listing")}
                  onClick={closeSidebar}
                />
                <NavItem
                  to="/landlord/bookings"
                  icon={FaCalendarAlt}
                  label="Bookings"
                  active={pathname.includes("/landlord/bookings")}
                  onClick={closeSidebar}
                />
                <NavItem
                  to="/chat"
                  icon={FaComments}
                  label="Chat"
                  active={pathname.includes("/chat")}
                  onClick={closeSidebar}
                />
                <NavItem
                  to="/landlord/profile"
                  icon={FaUser}
                  label="Profile"
                  active={pathname.includes("/landlord/profile")}
                  onClick={closeSidebar}
                />
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-300 bg-gray-100 text-black md:block">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src="/EasyKothaColoured-02.png" alt="EasyKotha" className="h-10 w-10 rounded-md object-contain" />
            <div>
              <p className="leading-5 font-semibold text-black">EasyKotha</p>
              <p className="text-[11px] tracking-wide text-slate-500">LANDLORD PANEL</p>
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
            <NavItem
              to="/landlord/dashboard"
              icon={FaTachometerAlt}
              label="Dashboard"
              active={pathname.includes("/landlord/dashboard")}
              onClick={closeSidebar}
            />
            <NavItem
              to="/landlord/listings"
              icon={FaHome}
              label="My Listings"
              active={pathname.includes("/landlord/listings")}
              onClick={closeSidebar}
            />
            <NavItem
              to="/landlord/explore"
              icon={FaCompass}
              label="Explore"
              active={pathname.includes("/landlord/explore")}
              onClick={closeSidebar}
            />
            <NavItem
              to="/landlord/add-listing"
              icon={FaPlusCircle}
              label="Add New"
              active={pathname.includes("/landlord/add-listing")}
              onClick={closeSidebar}
            />
            <NavItem
              to="/landlord/bookings"
              icon={FaCalendarAlt}
              label="Bookings"
              active={pathname.includes("/landlord/bookings")}
              onClick={closeSidebar}
            />
            <NavItem
              to="/chat"
              icon={FaComments}
              label="Chat"
              active={pathname.includes("/chat")}
              onClick={closeSidebar}
            />
            <NavItem
              to="/landlord/profile"
              icon={FaUser}
              label="Profile"
              active={pathname.includes("/landlord/profile")}
              onClick={closeSidebar}
            />
          </div>
        </nav>
      </aside>
    </>
  );
}
