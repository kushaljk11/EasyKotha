import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axios";
import {
  FaCalendarAlt,
  FaComments,
  FaCheck,
  FaFilter,
  FaTimes,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaBan,
} from "react-icons/fa";
import LandlordLayout from "./LandlordLayout";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";

const statusBadge = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-700",
};

export default function Booking() {
  const navigate = useNavigate();
  const { setSelectedUser } = useChatStore();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/bookings/landlord");
      setBookings(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch landlord bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await axiosInstance.patch(`/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch (error) {
      console.error("Failed to update booking:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    const normalized = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const tenant = booking.user?.name?.toLowerCase() || "";
      const title = booking.post?.title?.toLowerCase() || "";
      const statusMatches = statusFilter === "all" || booking.status === statusFilter;
      const searchMatches = !normalized || tenant.includes(normalized) || title.includes(normalized);
      return statusMatches && searchMatches;
    });
  }, [bookings, search, statusFilter]);

  const handleChatWithTenant = (booking) => {
    if (!booking?.user) return;
    setSelectedUser(booking.user);
    navigate("/chat");
  };

  return (
    <LandlordLayout searchPlaceholder="Search bookings...">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-green-800">
            Booking Requests
          </h2>
          <p className="mt-1 text-slate-600">Approve, reject, or cancel booking requests from tenants.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tenant/property"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
            />
          </div>
          <div className="relative">
            <FaFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {loading && <p className="text-sm text-slate-500">Loading bookings...</p>}

        {!loading && filteredBookings.length === 0 && (
          <p className="text-sm text-slate-500">No bookings matched your filters.</p>
        )}

        {!loading &&
          filteredBookings.map((booking) => (
            <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{booking.user?.name || "Unknown tenant"}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <FaMapMarkerAlt className="text-green-800" />
                    {booking.post?.title || "Deleted property"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[booking.status] || "bg-slate-100 text-slate-700"}`}>
                  {booking.status || "unknown"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <p className="inline-flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-400" />
                  <span>
                    <span className="font-semibold text-slate-900">Visit Date:</span>{" "}
                    {booking.startDate ? new Date(booking.startDate).toLocaleString() : "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Phone:</span>{" "}
                  <span className="inline-flex items-center gap-2">
                    <FaPhoneAlt className="text-slate-400" />
                    {booking.user?.phone || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Email:</span>{" "}
                  {booking.user?.email || "N/A"}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleChatWithTenant(booking)}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-800/20 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-800/10"
                >
                  <FaComments /> Chat Tenant
                </button>
                <button
                  disabled={updatingId === booking.id || booking.status === "approved"}
                  onClick={() => updateStatus(booking.id, "approved")}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <FaCheck /> Approve
                </button>
                <button
                  disabled={updatingId === booking.id || booking.status === "rejected"}
                  onClick={() => updateStatus(booking.id, "rejected")}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50"
                >
                  <FaTimes /> Reject
                </button>
                <button
                  disabled={updatingId === booking.id || booking.status === "cancelled"}
                  onClick={() => updateStatus(booking.id, "cancelled")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  <FaBan /> Cancel
                </button>
              </div>
            </article>
          ))}
      </div>
    </LandlordLayout>
  );
}