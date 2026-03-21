import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import TenantLayout from "./TenantLayout";

function postPreviewImage(images) {
	if (Array.isArray(images) && images.length > 0) {
		return images[0];
	}

	if (typeof images === "string" && images.trim()) {
		try {
			const parsed = JSON.parse(images);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed[0];
			}
			return images;
		} catch {
			return images;
		}
	}

	return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80";
}

export default function Favourate() {
	const [savedPosts, setSavedPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [removingId, setRemovingId] = useState(null);
	const { toggleSavePost } = useAuthStore();

	const fetchSavedPosts = async () => {
		try {
			setLoading(true);
			const response = await axiosInstance.get("/posts/savedposts");
			if (response.data?.success) {
				setSavedPosts(Array.isArray(response.data.data) ? response.data.data : []);
			} else {
				setSavedPosts([]);
			}
		} catch (error) {
			console.error("Failed to load saved posts:", error);
			toast.error("Failed to load saved posts");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSavedPosts();
	}, []);

	const handleRemoveSaved = async (postId) => {
		try {
			setRemovingId(postId);
			await toggleSavePost(postId);
			setSavedPosts((prev) => prev.filter((post) => String(post.id) !== String(postId)));
		} catch {
			toast.error("Failed to remove post");
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<TenantLayout>
			<section className="rounded-2xl border border-green-100 bg-white p-5 md:p-6 shadow-sm">
				<div className="mb-5 flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold text-slate-900">Saved Rooms</h2>
						<p className="mt-1 text-sm text-slate-600">
							{loading ? "Loading saved rooms..." : `${savedPosts.length} rooms saved`}
						</p>
					</div>
				</div>

				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((n) => (
							<div key={n} className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
						))}
					</div>
				) : savedPosts.length === 0 ? (
					<div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
						<h3 className="text-lg font-semibold text-slate-800">No saved rooms yet</h3>
						<p className="mt-2 text-sm text-slate-600">Explore listings and tap the heart icon to save them here.</p>
					</div>
				) : (
					<div className="space-y-4">
						{savedPosts.map((post) => (
							<article
								key={post.id}
								className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row"
							>
								<img
									src={postPreviewImage(post.images)}
									alt={post.title || "Saved room"}
									className="h-40 w-full rounded-xl object-cover md:h-28 md:w-40"
								/>

								<div className="flex-1">
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
											<p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
												<MapPin size={14} />
												{post.city || "Unknown city"}
											</p>
										</div>
										<p className="text-base font-bold text-emerald-700">
											NPR {post.price?.toLocaleString?.() ?? post.price ?? 0}
										</p>
									</div>

									<div className="mt-4 flex flex-wrap items-center gap-3">
										<Link
											to={`/posts/${post.id}`}
											className="rounded-xl bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900"
										>
											View Property
										</Link>
										<button
											type="button"
											onClick={() => handleRemoveSaved(post.id)}
											disabled={removingId === post.id}
											className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
										>
											<Heart size={14} fill="currentColor" />
											{removingId === post.id ? "Removing..." : "Remove"}
										</button>
									</div>
								</div>
							</article>
						))}
					</div>
				)}
			</section>
		</TenantLayout>
	);
}
