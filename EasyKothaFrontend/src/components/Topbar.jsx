import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaSignInAlt, FaTachometerAlt } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";

export default function Topbar() {
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
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-green-200 p-2 text-green-800 hover:bg-green-50"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          <div className="h-12 w-12 flex items-center">
            <img src="/EasyKothaColoured-02.png" alt="Logo" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-base font-medium">
          <Link className="text-black hover:text-green-800" to="/">
            Features
          </Link>
          <Link className="text-black hover:text-green-800" to="/contact">
            Contact Us
          </Link>
          <Link className="text-black hover:text-green-800" to="/about">
            About Us
          </Link>
          {authUser ? (
            <Link
              className="rounded-2xl bg-green-800 px-6 py-2 text-white hover:bg-green-700"
              to={dashboardPath}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="rounded-2xl bg-green-800 px-6 py-2 text-white hover:bg-green-700"
              to="/login"
            >
              Login
            </Link>
          )}
        </div>

        <div className="w-10 md:hidden" aria-hidden="true" />
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-green-100 px-3 pb-3 pt-2">
          <div className="flex flex-col gap-2 text-sm font-medium">
            <Link
              className="rounded-lg px-3 py-2 text-black hover:bg-green-50 hover:text-green-800"
              to="/"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              className="rounded-lg px-3 py-2 text-black hover:bg-green-50 hover:text-green-800"
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Link
              className="rounded-lg px-3 py-2 text-black hover:bg-green-50 hover:text-green-800"
              to="/about"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>

            {authUser ? (
              <Link
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-green-800 px-4 py-2 text-white hover:bg-green-700"
                to={dashboardPath}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Go to dashboard"
              >
                <FaTachometerAlt />
                Dashboard
              </Link>
            ) : (
              <Link
                className="mt-1 inline-flex w-fit items-center justify-center rounded-xl bg-green-800 p-3 text-white hover:bg-green-700"
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Login"
                title="Login"
              >
                <FaSignInAlt className="animate-pulse" size={18} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
