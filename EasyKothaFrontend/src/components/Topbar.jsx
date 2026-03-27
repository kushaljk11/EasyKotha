import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { FaBars, FaTimes, FaTachometerAlt, FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import LanguageDropdown from "./LanguageDropdown";

export default function Topbar() {
  const { t } = useTranslation();
  const { authUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dashboardPath =
    authUser?.role === "ADMIN"
      ? "/admin/dashboard"
      : authUser?.role === "LANDLORD"
      ? "/landlord/dashboard"
      : "/tenant/dashboard";

  return (
    <div className="topbar sticky top-0 z-50 border border-green-200 bg-white shadow-md">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 flex items-center">
            <img src="/EasyKothaColoured-02.png" alt="Logo" />
          </div>
        </div>

        

        <div className="hidden md:flex items-center gap-6 text-base font-medium">
          <LanguageDropdown />
          <Link className="text-black hover:text-green-800" to="/">
            {t("topbar.features")}
          </Link>
          <Link className="text-black hover:text-green-800" to="/contact">
            {t("topbar.contactUs")}
          </Link>
          <Link className="text-black hover:text-green-800" to="/about">
            {t("topbar.aboutUs")}
          </Link>
          {authUser ? (
            <Link
              className="rounded-2xl bg-green-800 px-6 py-2 text-white hover:bg-green-700"
              to={dashboardPath}
            >
              {t("topbar.dashboard")}
            </Link>
          ) : (
            <Link
              className="rounded-2xl bg-green-800 px-6 py-2 text-white hover:bg-green-700"
              to="/login"
            >
              {t("topbar.login")}
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LanguageDropdown compact className="shrink-0" />

          {authUser ? (
            <Link
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-white hover:bg-green-700"
              to={dashboardPath}
              aria-label={t("topbar.goToDashboard")}
              title={t("topbar.dashboard")}
            >
              <FaTachometerAlt size={14} />
              <span className="sr-only">{t("topbar.dashboard")}</span>
            </Link>
          ) : (
            <Link
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-white hover:bg-green-700"
              to="/login"
              aria-label={t("topbar.login")}
              title={t("topbar.login")}
            >
              <FaUserCircle size={18} />
            </Link>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-green-200 p-2 text-green-800 hover:bg-green-50"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={t("topbar.toggleNav")}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/35 md:hidden"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              aria-label={t("topbar.closeMenuOverlay")}
            />

            <motion.div
              className="fixed right-0 top-0 z-50 h-dvh w-72 border-l border-green-100 bg-white p-4 shadow-2xl md:hidden"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="mb-4 flex items-center justify-between border-b border-green-100 pb-3">
                <p className="text-sm font-semibold text-green-800">{t("topbar.menu")}</p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-green-200 p-2 text-green-800 hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={t("topbar.closeNav")}
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2 text-sm font-medium">
                <Link
                  className="rounded-lg px-3 py-2 text-black hover:bg-green-50 hover:text-green-800"
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("topbar.features")}
                </Link>
                <Link
                  className="rounded-lg px-3 py-2 text-black hover:bg-green-50 hover:text-green-800"
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("topbar.contactUs")}
                </Link>
                <Link
                  className="rounded-lg px-3 py-2 text-black hover:bg-green-50 hover:text-green-800"
                  to="/about"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("topbar.aboutUs")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
