import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaComments,
  FaHandPaper,
  FaHome,
  FaSearch,
  FaTable,
  FaUser,
  FaClock,
} from "react-icons/fa";
import LandlordLayout from "./LandlordLayout";

const statusStyles = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-700",
};

export default function LandlordDashboard() {
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    listings: 0,
    pendingListings: 0,
    pendingBookings: 0,
    conversations: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [postsRes, bookingsRes, usersRes] = await Promise.all([
          axiosInstance.get("/posts/landlord"),
          axiosInstance.get("/bookings/landlord"),
          axiosInstance.get("/messages/users"),
        ]);

        const posts = postsRes.data?.data || [];
        const bookings = bookingsRes.data?.data || [];
        const users = usersRes.data || [];

        setStats({
          listings: posts.length,
          pendingListings: posts.filter((post) => post.status === "pending").length,
          pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
          conversations: users.length,
        });
        setRecentBookings(bookings.slice(0, 8));
      } catch (error) {
        console.error("Failed to load landlord dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const filteredBookings = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return recentBookings;

    return recentBookings.filter((booking) => {
      const tenantName = booking.user?.name?.toLowerCase() || "";
      const postTitle = booking.post?.title?.toLowerCase() || "";
      return tenantName.includes(normalized) || postTitle.includes(normalized);
    });
  }, [recentBookings, searchTerm]);

  return (
    <LandlordLayout searchPlaceholder="Search bookings, listings, users...">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-green-800 md:text-3xl">
          Landlord Dashboard
        </h1>
        <p className="flex items-center gap-1 text-sm font-semibold text-gray-500">
          Welcome back, {authUser?.name || "Landlord"}!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Listings" value={stats.listings} icon={FaHome} tone="text-blue-700 bg-blue-50" />
        <StatCard label="Pending Listings" value={stats.pendingListings} icon={FaClock} tone="text-amber-700 bg-amber-50" />
        <StatCard label="Pending Bookings" value={stats.pendingBookings} icon={FaCalendarAlt} tone="text-emerald-700 bg-emerald-50" />
        <StatCard label="Open Conversations" value={stats.conversations} icon={FaComments} tone="text-violet-700 bg-violet-50" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FaUser className="text-green-800" />
            Recent Tenant Inquiries
          </h2>
          <div className="relative w-full sm:w-72">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by tenant or property"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Property</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                    Loading landlord dashboard data...
                  </td>
                </tr>
              )}

              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-600" />
                      No booking inquiries found.
                    </span>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 text-sm text-slate-800">{booking.user?.name || "Unknown tenant"}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{booking.post?.title || "Deleted post"}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {booking.startDate ? new Date(booking.startDate).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[booking.status] || "bg-slate-100 text-slate-700"}`}>
                        {booking.status || "unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </LandlordLayout>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-green-800">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-lg p-2 ${tone || "text-green-700 bg-green-50"}`}>
            <Icon className="text-base" />
          </div>
        )}
      </div>
    </article>
  );
}