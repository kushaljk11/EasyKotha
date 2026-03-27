
import { Link, useLocation } from "react-router-dom";// import { useChatStore } from "../store/useChatStore";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useSidebarStore } from "../store/useSidebarStore";
import {
  FaThLarge,
  FaUsers,
  FaShieldAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaCog,
  FaStar,
  FaSignOutAlt,
  FaMoneyCheckAlt,
  FaTimes,
  FaHistory,
} from "react-icons/fa";

// eslint-disable-next-line no-unused-vars
function MenuItem({ to, icon: Icon, label, active, unreadCount, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
        active
          ? "bg-green-800/10 text-green-800 ring-1 ring-green-800/20"
          : "text-slate-700 hover:bg-green-800/10 hover:text-green-800"
      }`}
    >
      <div className="relative">
        <Icon
          className={`${
            active ? "text-green-800" : "text-slate-600 group-hover:text-green-800"
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  // const { unreadMessages } = useChatStore();
  const { isSidebarOpen, closeSidebar } = useSidebarStore();

  // Calculate total unread messages
  // const totalUnread = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  
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
            className="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-300 bg-gray-100 text-black md:hidden"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {/* Header with logo */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img
                  src="/EasyKothaColoured-02.png"
                  alt="EasyKotha"
                  className="h-10 w-10 rounded-md object-contain"
                />
                <div>
                  <div className="font-semibold leading-5 text-black">EasyKotha</div>
                  <div className="text-[11px] text-slate-500 tracking-wide">{t("admin.sidebar.panel")}</div>
                </div>
              </div>
              <button
                className="md:hidden p-2 text-slate-600 hover:bg-gray-200 rounded-lg"
                onClick={closeSidebar}
              >
                <FaTimes />
              </button>
            </div>
          <hr  className="border-gray-300"/>
          <br />
            <nav className="px-4">
              <p className="text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
                {t("admin.sidebar.mainMenu")}
              </p>
              <div className="space-y-2">
                <MenuItem
                  to="/admin/dashboard"
                  icon={FaThLarge}
                  label={t("admin.sidebar.overview")}
                  active={pathname.includes("/admin/dashboard")}
                  onClick={closeSidebar}
                />
                <MenuItem
                  to="/admin/users"
                  icon={FaUsers}
                  label={t("admin.sidebar.userManagement")}
                  active={pathname.includes("/admin/users")}
                  onClick={closeSidebar}
                />
                <MenuItem
                  to="/admin/properties"
                  icon={FaShieldAlt}
                  label={t("admin.sidebar.propertyVerification")}
                  active={pathname.includes("/admin/properties")}
                  onClick={closeSidebar}
                />
                <MenuItem
                  to="/admin/approvals"
                  icon={FaCheckCircle}
                  label={t("admin.sidebar.postApprovals")}
                  active={pathname.includes("/admin/approvals")}
                  onClick={closeSidebar}
                />
                <MenuItem
                  to="/admin/bookings"
                  icon={FaCalendarAlt}
                  label={t("admin.sidebar.bookings")}
                  active={pathname.includes("/admin/bookings")}
                  onClick={closeSidebar}
                />
                <MenuItem
                  to="/admin/payments"
                  icon={FaMoneyCheckAlt}
                  label={t("admin.sidebar.payment")}
                  active={pathname.includes("/admin/payments")}
                  onClick={closeSidebar}
                />
                <MenuItem
                  to="/admin/logs"
                  icon={FaHistory}
                  label={t("admin.sidebar.manageLog")}
                  active={pathname.includes("/admin/logs")}
                  onClick={closeSidebar}
                />
                <MenuItem
                  to="/admin/settings"
                  icon={FaCog}
                  label={t("admin.sidebar.settings")}
                  active={pathname.includes("/admin/settings")}
                  onClick={closeSidebar}
                />
              </div>

              <div className="my-4 border-t border-gray-300" />

              <p className="text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
                {t("admin.sidebar.intelligence")}
              </p>
              <Link
                to="/admin/ai-insights"
                onClick={closeSidebar}
                className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <FaStar className="text-green-800" />
                  {t("admin.sidebar.aiInsights")}
                </span>
                <span className="h-2 w-2 bg-green-800 rounded-full" />
              </Link>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-300 bg-gray-100 text-black md:flex">
        {/* Header with logo */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img
              src="/EasyKothaColoured-02.png"
              alt="EasyKotha"
              className="h-10 w-10 rounded-md object-contain"
            />
            <div>
              <div className="font-semibold leading-5 text-black">EasyKotha</div>
              <div className="text-[11px] text-slate-500 tracking-wide">{t("admin.sidebar.panel")}</div>
            </div>
          </div>
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-gray-200 rounded-lg"
            onClick={closeSidebar}
          >
            <FaTimes />
          </button>
        </div>
      <hr  className="border-gray-300"/>
      <br />
        <nav className="px-4">
          <p className="text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
            {t("admin.sidebar.mainMenu")}
          </p>
          <div className="space-y-2">
            <MenuItem
              to="/admin/dashboard"
              icon={FaThLarge}
              label={t("admin.sidebar.overview")}
              active={pathname.includes("/admin/dashboard")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/admin/users"
              icon={FaUsers}
              label={t("admin.sidebar.userManagement")}
              active={pathname.includes("/admin/users")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/admin/properties"
              icon={FaShieldAlt}
              label={t("admin.sidebar.propertyVerification")}
              active={pathname.includes("/admin/properties")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/admin/approvals"
              icon={FaCheckCircle}
              label={t("admin.sidebar.postApprovals")}
              active={pathname.includes("/admin/approvals")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/admin/bookings"
              icon={FaCalendarAlt}
              label={t("admin.sidebar.bookings")}
              active={pathname.includes("/admin/bookings")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/admin/payments"
              icon={FaMoneyCheckAlt}
              label={t("admin.sidebar.payment")}
              active={pathname.includes("/admin/payments")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/admin/logs"
              icon={FaHistory}
              label={t("admin.sidebar.manageLog")}
              active={pathname.includes("/admin/logs")}
              onClick={closeSidebar}
            />
            <MenuItem
              to="/admin/settings"
              icon={FaCog}
              label={t("admin.sidebar.settings")}
              active={pathname.includes("/admin/settings")}
              onClick={closeSidebar}
            />
            {/* <MenuItem
              to="/admin/chat"
              icon={FaComments}
              label="Chat"
              active={pathname.includes("/admin/chat")}
              unreadCount={totalUnread}
              onClick={closeSidebar}
            /> */}
          </div>

          <div className="my-4 border-t border-gray-300" />

          <p className="text-[11px] font-semibold text-slate-500 tracking-wider mb-2">
            {t("admin.sidebar.intelligence")}
          </p>
          <Link
            to="/admin/ai-insights"
            onClick={closeSidebar}
            className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2 text-sm text-slate-700">
              <FaStar className="text-green-800" />
              {t("admin.sidebar.aiInsights")}
            </span>
            <span className="h-2 w-2 bg-green-800 rounded-full" />
          </Link>
        </nav>
      </aside>
    </>
  );
}
