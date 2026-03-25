import { useAuthStore } from "../store/useAuthStore";
import { Navigate } from "react-router-dom";

/**
 * Restricts route access by login state and allowed roles.
 */
export default function ProtectedRoute({ children, roles }) {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
        Loading...
      </div>
    </div>;
  }

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (roles && !roles.includes(authUser.role)) {
    if (authUser.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (authUser.role === "LANDLORD") return <Navigate to="/landlord/dashboard" replace />;
    return <Navigate to="/tenant/dashboard" replace />;
  }

  return children;
}
