import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	FaCalendarAlt,
	FaDownload,
	FaHistory,
	FaClock,
	FaFilter,
	FaHome,
	FaMapMarkerAlt,
	FaMoneyBillWave,
	FaRegClock,
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

function getPostId(post) {
	return post?.id || post?._id || post?.postId || "";
}

function getBookingPostId(booking) {
	return (
		getPostId(booking?.post) ||
		booking?.postId ||
		booking?.propertyId ||
		""
	);
}

function getPostImage(post) {
	const rawImages = post?.images;

	if (Array.isArray(rawImages) && rawImages.length > 0) {
		return rawImages[0];
	}

	if (typeof rawImages === "string" && rawImages.trim()) {
		try {
			const parsed = JSON.parse(rawImages);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed[0];
			}
		} catch {
			return rawImages;
		}
	}

	return "";
}

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
			cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
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

	const tabs = useMemo(
		() => [
			{ key: "all", label: "All Bookings", count: stats.total },
			{ key: "approved", label: "Confirmed", count: stats.approved },
			{ key: "pending", label: "Pending", count: stats.pending },
			{ key: "cancelled", label: "Completed", count: stats.cancelled },
		],
		[stats]
	);

	const hasNoData = !loading && bookings.length === 0;

	const getBookingPostLink = (booking) => {
		const postId = getBookingPostId(booking);
		if (postId) return `/posts/${postId}`;

		const params = new URLSearchParams();
		if (booking?.post?.title) params.set("search", booking.post.title);
		if (booking?.post?.city) params.set("city", booking.post.city);

		return params.toString() ? `/tenant/explore?${params.toString()}` : "/tenant/explore";
	};

	return (
		<TenantLayout title="My Bookings">
			<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h2 className="text-2xl font-semibold text-black">My Bookings</h2>
						<p className="mt-1 text-sm text-slate-600">Manage your visits, room reservations, and lease history.</p>
					</div>
					<div className="flex items-center gap-2">
						<button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
							<FaFilter className="text-slate-500" />
							Filter
						</button>
						<button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
							<FaDownload className="text-slate-500" />
							Export Log
						</button>
					</div>
				</div>

				<div className="mt-6 flex flex-wrap items-center gap-6 border-b border-slate-200 pb-3">
					{tabs.map((tab) => {
						const active = statusFilter === tab.key;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => setStatusFilter(tab.key)}
								className={`border-b-2 pb-2 text-sm font-semibold transition ${active ? "border-green-800 text-green-800" : "border-transparent text-slate-400 hover:text-slate-600"}`}
							>
								{tab.label} ({tab.count})
							</button>
						);
					})}
				</div>

				<div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
					{loading ? (
						<div className="py-20 text-center text-sm text-slate-500">Loading bookings...</div>
					) : hasNoData ? (
						<div className="flex min-h-[280px] flex-col items-center justify-center text-center">
							<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
								<FaHistory className="text-3xl" />
							</div>
							<p className="text-2xl font-semibold text-black">No bookings found</p>
							<p className="mt-2 text-sm text-slate-500">You haven&apos;t made any bookings yet.</p>
							<Link
								to="/tenant/explore"
								className="mt-6 inline-flex rounded-2xl bg-green-800 px-8 py-3 text-base font-semibold text-white shadow hover:bg-green-700"
							>
								Explore Properties
							</Link>
						</div>
					) : filteredBookings.length === 0 ? (
						<div className="py-16 text-center text-sm text-slate-500">No bookings found for this tab.</div>
					) : (
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{filteredBookings.map((booking) => (
								<article key={booking.id} className="h-full rounded-2xl border border-slate-200 p-4 shadow-sm">
									{(() => {
										const postId = getBookingPostId(booking);
										const postLink = getBookingPostLink(booking);
										return (
											<>
									<div className="flex items-start gap-4">
										<div className="h-20 w-24 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-28">
											{getPostImage(booking.post) ? (
												<img src={getPostImage(booking.post)} alt={booking.post?.title || "Property"} className="h-full w-full object-cover" />
											) : (
												<div className="flex h-full w-full items-center justify-center text-slate-400">
													<FaHome className="text-lg" />
												</div>
											)}
										</div>

										<div className="min-w-0 flex-1">
											<p className="line-clamp-2 text-lg font-semibold text-black">{booking.post?.title || "Deleted post"}</p>
											<p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
												<FaMapMarkerAlt className="text-green-700" />
												{booking.post?.district || "Unknown district"}, {booking.post?.city || "Unknown city"}
											</p>
											<p className="mt-1 inline-flex items-center gap-2 text-xs text-slate-500">
												<FaRegClock className="text-slate-400" />
												Requested on {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "N/A"}
											</p>
										</div>
									</div>

									<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
										<div className="rounded-xl bg-slate-50 px-3 py-2">
											<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Visit Schedule</p>
											<p className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
												<FaCalendarAlt className="text-green-700" />
												{booking.startDate ? new Date(booking.startDate).toLocaleString() : "N/A"}
											</p>
										</div>
										<div className="rounded-xl bg-slate-50 px-3 py-2">
											<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current Status</p>
											<span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[booking.status] || "bg-slate-100 text-slate-700"}`}>
												{booking.status || "unknown"}
											</span>
										</div>
									</div>

									<div className="mt-4 flex flex-wrap items-center gap-2">
										<Link
											to={postLink}
											className="inline-flex items-center rounded-xl bg-green-800 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
										>
											View Post
											{!postId && <span className="ml-2 rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">Suggested</span>}
										</Link>
										{booking.status === "approved" && (
											<button
												type="button"
												onClick={() => handleStartPayment(booking)}
												className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-800 hover:bg-green-100"
											>
												<FaMoneyBillWave />
												Pay Now
											</button>
										)}
									</div>
										</>
										);
									})()}
								</article>
							))}
						</div>
					)}
				</div>

				{!hasNoData && approvedBookings.length > 0 && (
					<div className="mt-6 flex justify-center">
						<button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
							View Past History
							<FaClock className="text-slate-400" />
						</button>
					</div>
				)}
			</section>
		</TenantLayout>
	);
}
