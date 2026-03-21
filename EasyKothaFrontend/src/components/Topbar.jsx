import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Topbar() {
  const { authUser } = useAuthStore();

  const dashboardPath =
    authUser?.role === "ADMIN"
      ? "/admin/dashboard"
      : authUser?.role === "LANDLORD"
      ? "/landlord/dashboard"
      : "/tenant/dashboard";

  return (
    <div className="topbar sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border border-green-200 bg-white p-3 shadow-md">
      <div className="h-12 w-12 flex items-center">
        <img className="" src="/EasyKothaColoured-02.png" alt="Logo" />
      </div>
      <div className="flex items-center gap-3 text-sm font-medium sm:gap-6 sm:text-base">
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
            className="rounded-2xl bg-green-800 px-4 py-2 text-white hover:bg-green-700 sm:px-6"
            to={dashboardPath}
          >
            Dashboard
          </Link>
        ) : (
          <Link
            className="rounded-2xl bg-green-800 px-4 py-2 text-white hover:bg-green-700 sm:px-6"
            to="/login"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
