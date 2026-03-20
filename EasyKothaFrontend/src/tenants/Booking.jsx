import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	FaCalendarAlt,
	FaCheckCircle,
	FaClock,
	FaFilter,
	FaHome,
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

export default function Booking() {
	const navigate = useNavigate();
	const { authUser } = useAuthStore();
	const [loading, setLoading] = useState(true);
	const [bookings, setBookings] = useState([]);
	const [statusFilter, setStatusFilter] = useState("all");

	const handleStartPayment = (booking) => {
		const amount = Number(booking?.totalPrice || booking?.post?.price || 0);
		if (!amount || Number.isNaN(amount) || amount <= 0) return;

		const author = booking?.post?.author;
		const isAuthorObject = author && typeof author === "object";
		const parsedLandlordId = isAuthorObject
			? author.id || author._id || booking?.post?.authorId || ""
			: author || booking?.post?.authorId || "";
		const parsedLandlordName = isAuthorObject ? author.name || "" : "";
		const parsedLandlordEmail = isAuthorObject ? author.email || "" : "";

		const params = new URLSearchParams({
			amount: String(amount),
			gateway: "esewa",
			productName: `Booking - ${booking?.post?.title || "Property"}`,
			landlordId: parsedLandlordId ? String(parsedLandlordId) : "",
			landlordName: parsedLandlordName,
			landlordEmail: parsedLandlordEmail,
			tenantName: authUser?.name || "",
			tenantEmail: authUser?.email || "",
		});

		navigate(`/payment?${params.toString()}`);
	};

	useEffect(() => {
		const fetchBookings = async () => {
			setLoading(true);
			try {
				const response = await axiosInstance.get("/bookings/my-bookings");
				setBookings(response.data?.data || []);
			} catch (error) {
				console.error("Failed to fetch tenant bookings:", error);
				setBookings([]);
			} finally {
				setLoading(false);
			}
		};

		fetchBookings();
	}, []);

	const stats = useMemo(() => {
		return {
			total: bookings.length,
			approved: bookings.filter((booking) => booking.status === "approved").length,
			pending: bookings.filter((booking) => booking.status === "pending").length,
			rejected: bookings.filter((booking) => booking.status === "rejected").length,
		};
	}, [bookings]);

	const filteredBookings = useMemo(() => {
		if (statusFilter === "all") return bookings;
		return bookings.filter((booking) => booking.status === statusFilter);
	}, [bookings, statusFilter]);

	const approvedBookings = useMemo(
		() => bookings.filter((booking) => booking.status === "approved"),
		[bookings]
	);

	return (
		<TenantLayout title="My Bookings">
			<section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
				<h2 className="text-xl font-bold text-slate-900">Booking History</h2>
				<p className="mt-2 text-sm text-slate-600">See all requests you made and track which ones are approved.</p>
			</section>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Total Requests" value={stats.total} icon={FaCalendarAlt} tone="text-blue-700 bg-blue-50" />
				<StatCard label="Approved" value={stats.approved} icon={FaCheckCircle} tone="text-emerald-700 bg-emerald-50" />
				<StatCard label="Pending" value={stats.pending} icon={FaClock} tone="text-amber-700 bg-amber-50" />
				<StatCard label="Rejected" value={stats.rejected} icon={FaFilter} tone="text-rose-700 bg-rose-50" />
			</div>

			<section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
					<h3 className="text-lg font-semibold text-gray-900">All My Booking Requests</h3>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
					>
						<option value="all">All statuses</option>
						<option value="approved">Approved</option>
						<option value="pending">Pending</option>
						<option value="rejected">Rejected</option>
						<option value="cancelled">Cancelled</option>
					</select>
				</div>

				<div className="divide-y divide-slate-200">
					{loading && (
						<div className="px-6 py-10 text-center text-sm text-slate-500">Loading bookings...</div>
					)}

					{!loading && filteredBookings.length === 0 && (
						<div className="px-6 py-10 text-center text-sm text-slate-500">
							No bookings found for this filter.
						</div>
					)}

					{!loading &&
						filteredBookings.map((booking) => (
							<article key={booking.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
								<div className="flex items-start gap-4">
									<div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
										{booking.post?.images?.[0] ? (
											<img src={booking.post.images[0]} alt={booking.post?.title || "Property"} className="h-full w-full object-cover" />
										) : (
											<div className="flex h-full w-full items-center justify-center text-slate-400">
												<FaHome />
											</div>
										)}
									</div>
									<div>
										<p className="text-base font-semibold text-slate-900">{booking.post?.title || "Deleted post"}</p>
										<p className="text-sm text-slate-500">{booking.post?.district}, {booking.post?.city}</p>
										<p className="mt-1 text-xs text-slate-500">
											Requested on {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "N/A"}
										</p>
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-3 md:justify-end">
									<div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
										Visit: {booking.startDate ? new Date(booking.startDate).toLocaleString() : "N/A"}
									</div>
									<span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[booking.status] || "bg-slate-100 text-slate-700"}`}>
										{booking.status || "unknown"}
									</span>
									{booking.status === "approved" && (
										<button
											type="button"
											onClick={() => handleStartPayment(booking)}
											className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600"
										>
											Pay Now
										</button>
									)}
								</div>
							</article>
						))}
				</div>
			</section>

			<section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
				<div className="border-b border-emerald-100 bg-emerald-50 p-5">
					<h3 className="text-lg font-semibold text-emerald-800">Approved Bookings</h3>
					<p className="text-sm text-emerald-700">These visits have been approved by landlords.</p>
				</div>

				{loading && <div className="px-6 py-8 text-sm text-slate-500">Loading approved bookings...</div>}

				{!loading && approvedBookings.length === 0 && (
					<div className="px-6 py-8 text-sm text-slate-500">No approved bookings yet.</div>
				)}

				{!loading && approvedBookings.length > 0 && (
					<div className="divide-y divide-emerald-100">
						{approvedBookings.map((booking) => (
							<div key={`approved-${booking.id}`} className="flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between">
								<div>
									<p className="font-semibold text-slate-900">{booking.post?.title || "Deleted post"}</p>
									<p className="text-sm text-slate-600">{booking.post?.district}, {booking.post?.city}</p>
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-slate-700">
										Visit Date: {booking.startDate ? new Date(booking.startDate).toLocaleString() : "N/A"}
									</div>
									<button
										type="button"
										onClick={() => handleStartPayment(booking)}
										className="rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600"
									>
										Pay Now
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{!loading && bookings.length === 0 && (
				<div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
					<p className="text-slate-700">You have not made any booking request yet.</p>
					<Link to="/tenant/explore" className="mt-3 inline-flex rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
						Go to Explore
					</Link>
				</div>
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
