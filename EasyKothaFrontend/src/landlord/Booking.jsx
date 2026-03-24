import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import {
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaComments,
  FaEnvelope,
  FaFilter,
  FaPhoneAlt,
  FaTimes,
} from "react-icons/fa";
import LandlordLayout from "./LandlordLayout";
import { useChatStore } from "../store/useChatStore";
import UserAvatar from "../components/UserAvatar";

const statusBadge = {
  approved: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  pending: "bg-amber-100 text-amber-700 border border-amber-300",
  rejected: "bg-rose-100 text-rose-700 border border-rose-300",
  cancelled: "bg-slate-200 text-slate-700 border border-slate-300",
};

export default function Booking() {
  const navigate = useNavigate();
  const { setSelectedUser } = useChatStore();
  const [bookings, setBookings] = useState([]);
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
    if (statusFilter === "all") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleChatWithTenant = (booking) => {
    if (!booking?.user) return;
    setSelectedUser(booking.user);
    navigate("/chat");
  };

  return (
    <LandlordLayout searchPlaceholder="Search booking requests...">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-green-800">Booking Requests</h2>
            <p className="mt-1 text-sm text-slate-600">Manage visit requests from potential tenants for your listings.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <FaFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <FaCalendarAlt className="text-slate-400" />
              Calendar View
            </button>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {loading && <p className="text-sm text-slate-500">Loading booking requests...</p>}

          {!loading && filteredBookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No booking requests matched this filter.
            </div>
          )}

          {!loading &&
            filteredBookings.map((booking) => (
              <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={booking.user?.profileImage}
                      name={booking.user?.name}
                      alt={booking.user?.name || "Tenant"}
                      sizeClass="h-14 w-14"
                    />
                    <div>
                      <h3 className="text-2xl font-semibold text-black">{booking.user?.name || "Unknown tenant"}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>{booking.post?.title || "Deleted property"}</span>
                        {booking.post?.id && (
                          <Link to={`/posts/${booking.post.id}`} className="text-xs font-semibold uppercase tracking-wide text-rose-600 hover:text-rose-500">
                            View Post
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`rounded-full px-4 py-1 text-xs font-semibold ${statusBadge[booking.status] || "bg-slate-100 text-slate-700 border border-slate-300"}`}>
                    {booking.status || "unknown"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Requested Visits</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p className="inline-flex items-center gap-2">
                        <FaCalendarAlt className="text-slate-400" />
                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "N/A"}
                      </p>
                      {/* <p className="inline-flex items-center gap-2">
                        <FaClock className="text-slate-400" />
                        {booking.startDate ? new Date(booking.startDate).toLocaleTimeString() : "N/A"}
                      </p> */}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Contact Information</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      {/* <p className="inline-flex items-center gap-2">
                        <FaPhoneAlt className="text-slate-400" />
                        {booking.user?.phone || "N/A"}
                      </p> */}
                      <p className="inline-flex items-center gap-2 break-all">
                        <FaEnvelope className="text-slate-400" />
                        {booking.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={updatingId === booking.id || booking.status === "approved"}
                    onClick={() => updateStatus(booking.id, "approved")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-800 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaCheck /> Accept Visit
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === booking.id || booking.status === "rejected"}
                    onClick={() => updateStatus(booking.id, "rejected")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-800 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaTimes /> Reject
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChatWithTenant(booking)}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-800/20 px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-800/10"
                  >
                    <FaComments /> Chat Tenant
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === booking.id || booking.status === "cancelled"}
                    onClick={() => updateStatus(booking.id, "cancelled")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel Request
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>
    </LandlordLayout>
  );
}
