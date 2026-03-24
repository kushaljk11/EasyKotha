import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
	FaCalendarAlt,
	FaCheckCircle,
	FaClock,
	FaEnvelope,
	FaHeart,
	FaHome,
	FaMapMarkerAlt,
	FaRegFileAlt,
	FaSearch,
	FaSlidersH,
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

function getPostId(post) {
	return post?.id || post?._id || post?.postId || "";
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

export default function TenantDashboard() {
	const { authUser } = useAuthStore();
	const [loading, setLoading] = useState(true);
	const [bookings, setBookings] = useState([]);
	const [recommended, setRecommended] = useState([]);
	const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
	const [recommendationError, setRecommendationError] = useState(false);

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
			setIsLoadingRecommendations(true);
			setRecommendationError(false);
			try {
				const res = await axiosInstance.get("/recommendations/user");
				setRecommended(Array.isArray(res.data?.data) ? res.data.data : []);
			} catch (err) {
				console.error("Failed to load recommendations:", err);
				setRecommendationError(true);
				setRecommended([]);
			} finally {
				setIsLoadingRecommendations(false);
			}
		};

		fetchRecommendations();
	}, [authUser?.savedPosts?.length]);

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

	const activeBooking = useMemo(() => {
		return (
			bookings.find((booking) => booking.status === "approved") ||
			bookings.find((booking) => booking.status === "pending") ||
			null
		);
	}, [bookings]);

	const normalizedRecommendations = useMemo(() => {
		return recommended
			.map((post) => {
				const postId = getPostId(post);
				if (!postId) return null;

				return {
					id: postId,
					title: post?.title || "Untitled",
					city: post?.city || "Unknown city",
					price: Number(post?.price || 0),
					image: getPostImage(post) || "/logo.png",
				};
			})
			.filter(Boolean);
	}, [recommended]);

	return (
		<TenantLayout title="Tenant Dashboard">
			<section>
				<h2 className="text-2xl font-semibold text-black">Namaste, {authUser?.name || "tenant"}!</h2>
				<p className="mt-1 text-sm text-slate-600">
					The place where you can manage your bookings, saved rooms, and recommendations.
				</p>
			</section>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<StatCard
					label="Active Bookings"
					value={stats.approved}
					icon={FaCheckCircle}
					tone="text-white bg-green-800"
					statusLabel="Active"
				/>
				<StatCard
					label="Pending Requests"
					value={stats.pending}
					icon={FaClock}
					tone="text-white bg-green-800"
					statusLabel="Pending"
				/>
				<StatCard
					label="Total Bookings"
					value={stats.total}
					icon={FaCalendarAlt}
					tone="text-white bg-green-800"
					statusLabel="History"
				/>
				<StatCard
					label="Saved Items"
					value={stats.saved}
					icon={FaHeart}
					tone="text-white bg-green-800"
					statusLabel="Favorites"
				/>
			</div>

			<section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<ActionTile to="/tenant/explore" icon={FaSearch} label="New Search" />
				<ActionTile to="/tenant/bookings" icon={FaRegFileAlt} label="View Contracts" />
				<ActionTile to="/chat" icon={FaEnvelope} label="Messages" />
				<ActionTile to="/tenant/profile" icon={FaSlidersH} label="Preference" />
			</section>

			<section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
					<div className="flex items-center justify-between border-b border-slate-100 p-5">
						<h3 className="text-2xl font-semibold text-black">Current Active Booking</h3>
						<Link to="/tenant/bookings" className="text-xs font-semibold tracking-wide text-green-800 hover:text-green-700">
							Manage All
						</Link>
					</div>

					<div className="p-5">
						{loading ? (
							<div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
								Loading booking data...
							</div>
						) : activeBooking ? (
							<article className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[190px_1fr]">
								<div className="h-36 w-full overflow-hidden rounded-xl bg-slate-100 md:h-full">
									{getPostImage(activeBooking.post) ? (
										<img
											src={getPostImage(activeBooking.post)}
											alt={activeBooking.post?.title || "Booked property"}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center text-slate-400">
											<FaHome className="text-2xl" />
										</div>
									)}
								</div>

								<div className="flex min-w-0 flex-col justify-between gap-4">
									<div>
										<p className="line-clamp-2 text-xl font-semibold text-black">{activeBooking.post?.title || "Room Booking"}</p>
										<p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
											<FaMapMarkerAlt className="text-green-700" />
											{activeBooking.post?.district || "Unknown district"}, {activeBooking.post?.city || "Unknown city"}
										</p>

										<div className="mt-3 flex flex-wrap items-center gap-2">
											<span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[activeBooking.status] || "bg-slate-100 text-slate-700"}`}>
												{activeBooking.status || "unknown"}
											</span>
											<span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
												<FaCalendarAlt className="text-green-700" />
												{activeBooking.startDate ? new Date(activeBooking.startDate).toLocaleString() : "N/A"}
											</span>
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-2">
										{getPostId(activeBooking.post) && (
											<Link
												to={`/posts/${getPostId(activeBooking.post)}`}
												className="inline-flex items-center rounded-xl bg-green-800 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
											>
												View Post
											</Link>
										)}
										<Link
											to="/tenant/bookings"
											className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
										>
											Booking Details
										</Link>
									</div>
								</div>
							</article>
						) : (
							<div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
								<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
									<FaHome />
								</div>
								<p className="text-base font-semibold text-slate-700">No active bookings found</p>
								<Link to="/tenant/explore" className="mt-2 inline-block text-sm font-semibold text-green-800 hover:text-green-700">
									Explore Rooms
								</Link>
							</div>
						)}
					</div>
				</div>

				<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					<div className="flex items-center justify-between border-b border-slate-100 p-5">
						<h3 className="text-2xl font-semibold text-black">Recommended</h3>
						<Link to="/tenant/explore" className="text-xs font-semibold tracking-wide text-green-800 hover:text-green-700">
							View All
						</Link>
					</div>
					<div className="space-y-3 p-4">
						{isLoadingRecommendations ? (
							<p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
								Loading recommendations...
							</p>
						) : recommendationError ? (
							<p className="rounded-xl border border-dashed border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
								Could not load recommendations right now.
							</p>
						) : normalizedRecommendations.length === 0 ? (
							<p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
								No recommendations yet. Keep exploring to improve suggestions.
							</p>
						) : (
							normalizedRecommendations.slice(0, 4).map((post) => (
								<Link key={post.id} to={`/posts/${post.id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2 transition hover:border-green-200 hover:bg-slate-50">
									<img
										src={post.image}
										className="h-12 w-12 rounded-lg object-cover"
										alt={post.title || "Recommended room"}
									/>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-slate-800">{post.title}</p>
										<p className="truncate text-xs text-slate-500">{post.city}</p>
										<p className="truncate text-xs font-semibold text-green-800">Rs. {post.price.toLocaleString()}/month</p>
									</div>
								</Link>
							))
						)}
					</div>
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
		</TenantLayout>
	);
}

function StatCard({ label, value, icon: Icon, tone, statusLabel }) {
	return (
		<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-xs font-semibold tracking-wide text-slate-500">{label}</p>
					<p className="mt-2 text-2xl font-semibold text-black">{value}</p>
					{statusLabel && (
						<span className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
							{statusLabel}
						</span>
					)}
				</div>
				{Icon && (
					<div className={`rounded-xl p-3 ${tone || "text-green-800 bg-green-50"}`}>
						<Icon className="text-lg" />
					</div>
				)}
			</div>
		</article>
	);
}

function ActionTile({ to, icon: Icon, label }) {
	return (
		<Link to={to} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 transition hover:border-green-200 hover:bg-slate-50">
			<div className="rounded-xl bg-green-800 p-3 text-white">
				<Icon className="text-base" />
			</div>
			<p className="text-sm font-semibold uppercase tracking-wide">{label}</p>
		</Link>
	);
}
