import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart, Search } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const { toggleSavePost } = useAuthStore();

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/posts/savedposts");
      if (response.data?.success) {
        setSavedPosts(
          Array.isArray(response.data.data) ? response.data.data : [],
        );
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
      setSavedPosts((prev) =>
        prev.filter((post) => String(post.id) !== String(postId)),
      );
    } catch {
      toast.error("Failed to remove post");
    } finally {
      setRemovingId(null);
    }
  };

  const filteredPosts = savedPosts
    .filter((post) =>
      String(post?.title || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") {
        return Number(a?.price || 0) - Number(b?.price || 0);
      }
      if (sortBy === "price-desc") {
        return Number(b?.price || 0) - Number(a?.price || 0);
      }
      return (
        Number(new Date(b?.createdAt || 0)) -
        Number(new Date(a?.createdAt || 0))
      );
    });

  return (
    <TenantLayout>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-black">
              Saved &amp; Favorites
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep track of the properties you&apos;re interested in.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
            <div className="relative min-w-[260px] flex-1 lg:w-[320px] lg:flex-none">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved rooms..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
            >
              <option value="recent">Recently Saved</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
                />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                <Heart size={34} fill="currentColor" />
              </div>
              <p className="text-2xl font-semibold text-black">
                Your wishlist is empty
              </p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Explore available rooms and heart them to see them here later.
              </p>
              <Link
                to="/tenant/explore"
                className="mt-8 inline-flex rounded-2xl bg-green-800 px-10 py-3 text-base font-semibold text-white shadow hover:bg-green-700"
              >
                Start Exploring
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md md:flex-row"
                >
                  <img
                    src={postPreviewImage(post.images)}
                    alt={post.title || "Saved room"}
                    className="h-40 w-full rounded-xl object-cover md:h-28 md:w-40"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {post.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                          <MapPin size={14} className="text-green-700" />
                          {post.city || "Unknown city"}
                        </p>
                      </div>
                      <p className="text-base font-semibold text-green-800">
                        NPR {post.price?.toLocaleString?.() ?? post.price ?? 0}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link
                        to={`/posts/${post.id}`}
                        className="rounded-xl bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
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
        </div>
      </section>
    </TenantLayout>
  );
}
