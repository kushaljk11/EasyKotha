import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
	FaCalendarAlt,
	FaCheckCircle,
	FaClock,
	FaHeart,
	FaHome,
	FaTimesCircle,
} from "react-icons/fa";
import axiosInstance from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import TenantLayout from "./TenantLayout";

const statusStyles = {
	approved: "bg-emerald-100 text-emerald-700",
	pending: "bg-amber-100 text-amber-700",
	rejected: "bg-rose-100 text-rose-700",
	cancelled: "bg-slate-200 text-slate-700",
};

export default function TenantDashboard() {
	const { authUser } = useAuthStore();
	const [loading, setLoading] = useState(true);
	const [bookings, setBookings] = useState([]);
	const [recommended, setRecommended] = useState([]);

	useEffect(() => {
		const fetchBookings = async () => {
			setLoading(true);
			try {
				const response = await axiosInstance.get("/bookings/my-bookings");
				setBookings(response.data?.data || []);
			} catch (error) {
				console.error("Failed to load tenant bookings:", error);
				setBookings([]);
			} finally {
				setLoading(false);
			}
		};

		fetchBookings();
	}, []);

	useEffect(() => {
		const fetchRecommendations = async () => {
			try {
				const res = await axiosInstance.get("/recommendations/user");
				setRecommended(res.data.data || []);
			} catch (err) {
				console.error("Failed to load recommendations:", err);
			}
		};

		fetchRecommendations();
	}, []);

	const stats = useMemo(() => {
		const approved = bookings.filter((booking) => booking.status === "approved").length;
		const pending = bookings.filter((booking) => booking.status === "pending").length;
		const rejected = bookings.filter((booking) => booking.status === "rejected").length;
		const saved = Array.isArray(authUser?.savedPosts) ? authUser.savedPosts.length : 0;

		return {
			total: bookings.length,
			approved,
			pending,
			rejected,
			saved,
		};
	}, [authUser?.savedPosts, bookings]);

	return (
		<TenantLayout title="Tenant Dashboard">
			<section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
				<h2 className="text-2xl font-bold text-slate-900">Welcome Back, {authUser?.name || "Tenant"}</h2>
				<p className="mt-2 text-sm text-slate-600">Track your booking requests and approved visits from one place.</p>
				<div className="mt-5 flex flex-wrap gap-3">
					<Link to="/tenant/explore" className="rounded-xl bg-green-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700">
						Explore Rooms
					</Link>
					<Link to="/tenant/bookings" className="rounded-xl border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50">
						View Bookings
					</Link>
					<Link to="/tenant/saved" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
						Saved Listings
					</Link>
				</div>
			</section>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Total Requests" value={stats.total} icon={FaCalendarAlt} tone="text-blue-700 bg-blue-50" />
				<StatCard label="Approved" value={stats.approved} icon={FaCheckCircle} tone="text-emerald-700 bg-emerald-50" />
				<StatCard label="Pending" value={stats.pending} icon={FaClock} tone="text-amber-700 bg-amber-50" />
				<StatCard label="Saved Rooms" value={stats.saved} icon={FaHeart} tone="text-rose-700 bg-rose-50" />
			</div>

			<section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
				<div className="border-b border-gray-100 p-5">
					<h3 className="text-lg font-semibold text-gray-900">Recent Booking Activity</h3>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200">
						<thead className="bg-slate-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Property</th>
								<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Visit Date</th>
								<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200 bg-white">
							{loading && (
								<tr>
									<td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
										Loading booking data...
									</td>
								</tr>
							)}

							{!loading && bookings.length === 0 && (
								<tr>
									<td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
										No booking requests yet. Explore and book your first room.
									</td>
								</tr>
							)}

							{!loading &&
								bookings.slice(0, 6).map((booking) => (
									<tr key={booking.id}>
										<td className="px-6 py-4 text-sm text-slate-800">
											<div className="font-semibold">{booking.post?.title || "Deleted post"}</div>
											<div className="text-xs text-slate-500">{booking.post?.district}, {booking.post?.city}</div>
										</td>
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

			{stats.rejected > 0 && (
				<div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
					<div className="flex items-center gap-2 font-semibold">
						<FaTimesCircle />
						{stats.rejected} booking request(s) were rejected.
					</div>
					<p className="mt-1 text-rose-600">You can explore more options from the tenant explore page.</p>
				</div>
			)}

			{/* 🔥 RECOMMENDED FOR YOU */}
			{recommended.length > 0 && (
				<section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Recommended for You
					</h3>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{recommended.map((post) => (
							<Link key={post.id} to={`/posts/${post.id}`}>
								<div className="border rounded-lg p-3 hover:shadow transition">
									<img
										src={post.images?.[0]}
										className="h-28 w-full object-cover rounded mb-2"
										alt={post.title}
									/>
									<p className="text-sm font-semibold line-clamp-1">
										{post.title}
									</p>
									<p className="text-xs text-gray-500">
										{post.city}
									</p>
								</div>
							</Link>
						))}
					</div>
				</section>
			)}
		</TenantLayout>
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
