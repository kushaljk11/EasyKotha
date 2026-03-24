import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaComments,
  FaEdit,
  FaHome,
  FaListAlt,
  FaPlus,
  FaSearch,
  FaUserCircle,
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
  const [landlordPosts, setLandlordPosts] = useState([]);
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

        setLandlordPosts(posts);

        setStats({
          listings: posts.length,
          pendingListings: posts.filter((post) => post.status === "pending").length,
          pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
          conversations: users.length,
        });
        setRecentBookings(bookings.slice(0, 10));
      } catch (error) {
        console.error("Failed to load landlord dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const pendingBookings = useMemo(
    () => recentBookings.filter((booking) => booking.status === "pending"),
    [recentBookings]
  );

  const activeProperties = useMemo(
    () => landlordPosts.filter((post) => post.status !== "pending" && post.status !== "rejected").slice(0, 4),
    [landlordPosts]
  );

  return (
    <LandlordLayout searchPlaceholder="Search bookings, listings, users...">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black md:text-[2.2rem]">
            Namaste,<span className="text-green-800"> {authUser?.name?.toLowerCase() || "landlord"}! </span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your properties and requests in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionLink to="/landlord/explore" icon={FaSearch} label="Browse All" />
          <ActionLink to="/landlord/profile" icon={FaUserCircle} label="View Public Profile" />
          <ActionLink to="/landlord/bookings" icon={FaCalendarAlt} label="Booking Request" />
          <Link
            to="/landlord/add-listing"
            className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700"
          >
            <FaPlus />
            Add Property
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Listings" value={stats.listings} icon={FaHome} statusLabel="History" />
        <StatCard label="Pending Listings" value={stats.pendingListings} icon={FaClock} statusLabel="Active" />
        <StatCard label="New Messages" value={stats.conversations} icon={FaComments} statusLabel="Instant" />
        <StatCard label="Booking Request" value={stats.pendingBookings} icon={FaCalendarAlt} statusLabel="Request" />
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="text-2xl font-semibold text-black">Immediate Attention</h2>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500">
              High Priority
            </span>
          </div>

          <div className="min-h-[260px] p-5">
            {loading ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-slate-500">
                Loading pending requests...
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FaClock />
                </div>
                <p className="text-sm text-slate-500">No pending requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.slice(0, 4).map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-black">{booking.user?.name || "Unknown tenant"}</p>
                    <p className="mt-1 text-xs text-slate-500">{booking.post?.title || "Unknown property"}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-800">
                      <FaCalendarAlt />
                      {booking.startDate ? new Date(booking.startDate).toLocaleString() : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <Link to="/landlord/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-700">
              View All Pending Actions
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-2xl font-semibold text-black">Manage Active Properties</h2>
          </div>

          <div className="min-h-[260px] space-y-3 p-5">
            {loading ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-slate-500">
                Loading properties...
              </div>
            ) : activeProperties.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FaListAlt />
                </div>
                <p className="text-sm text-slate-500">No active properties yet.</p>
              </div>
            ) : (
              activeProperties.map((post) => (
                <div key={post.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <img
                    src={post.images?.[0] || "/logo.png"}
                    alt={post.title || "Property"}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-black">{post.title || "Untitled property"}</p>
                    <p className="truncate text-sm text-slate-500">{post.city || "Unknown city"}, {post.district || "Unknown district"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[post.status] || "bg-emerald-100 text-emerald-700"}`}>
                    {(post.status || "available").toUpperCase()}
                  </span>
                  <Link to="/landlord/listings" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-800" title="Edit listing">
                    <FaEdit />
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <Link to="/landlord/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-700">
              Go to Property Manager
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>
    </LandlordLayout>
  );
}

function StatCard({ label, value, icon: Icon, statusLabel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-black">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-black">{value}</p>
          {statusLabel && (
            <span className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
              {statusLabel}
            </span>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-green-800 p-3 text-white">
            <Icon className="text-lg" />
          </div>
        )}
      </div>
    </article>
  );
}

function ActionLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
      <Icon className="text-green-800" />
      {label}
    </Link>
  );
}