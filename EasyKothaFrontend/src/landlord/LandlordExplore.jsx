import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axios";
import { MapPin, Home, Filter, Clock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import LandlordLayout from "./LandlordLayout";
import Search from "../components/Search";
import { API_ORIGIN } from "../config/env";

const isLikelyImageUrl = (value) => /^https?:\/\//i.test(value);
const isDataImage = (value) => /^data:image\//i.test(value);
const isUploadPath = (value) => /^(\/?uploads[\\/])/i.test(value);

const toAbsoluteUploadUrl = (value) => {
  const normalizedPath = String(value || "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  if (!normalizedPath) return "";
  return API_ORIGIN ? `${API_ORIGIN}/${normalizedPath}` : `/${normalizedPath}`;
};

const normalizeImageUrls = (images) => {
  if (!images) return [];

  const rawList = Array.isArray(images) ? images : [images];

  const parsedList = rawList.flatMap((item) => {
    if (Array.isArray(item)) return item;

    const value = String(item || "").trim();
    if (!value) return [];

    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }

    return [value];
  });

  return parsedList
    .flatMap((item) => {
      const value = String(item || "").trim();
      if (!value) return [];
      if (isDataImage(value)) return [value];
      if (value.includes("\n") || value.includes("\r")) {
        return value.split(/\r?\n/);
      }
      return value.includes(",") ? value.split(",") : [value];
    })
    .map((item) => item.trim())
    .map((item) => {
      if (isLikelyImageUrl(item) || isDataImage(item)) return item;
      if (/^\/\//.test(item)) return `https:${item}`;
      if (isUploadPath(item)) return toAbsoluteUploadUrl(item);
      return "";
    })
    .filter(Boolean);
};

  const getPostId = (post) => post?.id ?? post?._id;

export default function LandlordExplore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [roomType, setRoomType] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const districts = [
    "Kathmandu",
    "Lalitpur",
    "Bhaktapur",
    "Pokhara",
    "Chitwan",
    "Butwal",
    "Dharan",
    "Biratnagar",
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setDistrict(queryParams.get("district") || "");
    setRoomType(queryParams.get("type") || "");
    setSort(queryParams.get("sort") || "latest");
    setSearchQuery(queryParams.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await axiosInstance.get("/posts/types");
        if (response.data.success) {
          setRoomTypes(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch room types:", error);
      }
    };

    fetchRoomTypes();
  }, []);

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(location.search);
        const search = queryParams.get("search") || "";

        const res = await axiosInstance.get("/posts", {
          params: {
            page,
            limit: 10,
            status: "approved",
            ...(search && { search }),
            ...(district && { district }),
            ...(roomType && { type: roomType }),
            ...(sort && { sort }),
          },
        });
        setPosts(res.data?.data || []);
        setTotalPages(res.data?.pages || 1);
      } catch (error) {
        console.error("Failed to fetch explore listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [district, roomType, sort, page, location.search]);

  const filteredPosts = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return posts;

    return posts.filter((post) => {
      const title = post.title?.toLowerCase() || "";
      const district = post.district?.toLowerCase() || "";
      const city = post.city?.toLowerCase() || "";
      return title.includes(term) || district.includes(term) || city.includes(term);
    });
  }, [posts, searchQuery]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPage(1);

    const queryParams = new URLSearchParams(location.search);
    if (district) queryParams.set("district", district);
    else queryParams.delete("district");

    if (roomType) queryParams.set("type", roomType);
    else queryParams.delete("type");

    if (sort) queryParams.set("sort", sort);
    else queryParams.delete("sort");

    if (searchQuery) queryParams.set("search", searchQuery);
    else queryParams.delete("search");

    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString(),
      },
      { replace: true },
    );
  };

  return (
    <LandlordLayout searchPlaceholder="Search available listings...">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              Search Property
            </label>
            <Search
              placeholder="Find your next home..."
              className="w-full"
              value={searchQuery}
              onChange={setSearchQuery}
              district={district}
              type={roomType}
              basePath="/landlord/explore"
              onSuggestionClick={(item) => {
                const selectedQuery = item.title || "";
                setSearchQuery(selectedQuery);
                const queryParams = new URLSearchParams(location.search);
                if (selectedQuery) queryParams.set("search", selectedQuery);
                else queryParams.delete("search");
                navigate(
                  {
                    pathname: location.pathname,
                    search: queryParams.toString(),
                  },
                  { replace: true },
                );
              }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MapPin size={12} /> City/District
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
            >
              <option value="">All Locations</option>
              {districts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Home size={12} /> Property Type
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium capitalize outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
              value={roomType}
              onChange={(event) => setRoomType(event.target.value)}
            >
              <option value="">Any Type</option>
              {roomTypes.map((item) => (
                <option key={item} value={item}>
                  {item.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Filter size={12} /> Sort By
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="latest">Newest First</option>
              <option value="priceLowToHigh">Price: Low</option>
              <option value="priceHighToLow">Price: High</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <motion.button
              type="submit"
              className="w-full rounded-xl bg-green-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              Apply Filters
            </motion.button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mt-1 text-4xl font-bold text-green-800">All Rooms</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Found {filteredPosts.length} properties matching your criteria
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {loading && <p className="text-sm text-slate-500">Loading listings...</p>}

        {!loading && filteredPosts.length === 0 && (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center">
            <h3 className="text-2xl font-semibold text-black">No properties found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your filters to find more results.</p>
          </div>
        )}

        {!loading &&
          filteredPosts.map((post) => {
            const postId = getPostId(post);
            const imageUrls = normalizeImageUrls(post.images);
            const firstImage = imageUrls[0] || "";

            return (
              <motion.article
                key={postId || `${post.title}-${post.createdAt}`}
                className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md flex flex-col"
                onClick={() => postId && navigate(`/posts/${postId}`)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                whileHover={{ y: -3 }}
              >
                <div className="relative h-44 sm:h-48 bg-slate-100 shrink-0 overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={post.title}
                      className="block h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No image
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex flex-1 flex-col space-y-3 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-lg font-semibold text-black">{post.title}</h3>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {post.status || "approved"}
                    </span>
                  </div>

                  <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-green-800" />
                    {post.city}, {post.district}
                  </p>

                  <p className="inline-flex items-center gap-2 text-lg font-bold text-green-800">
                    <Clock size={14} className="text-green-800" />
                    NPR {Number(post.price || 0).toLocaleString()}
                  </p>

                  <p className="line-clamp-2 text-sm text-slate-600">
                    {post.content || "No description available."}
                  </p>

                  <p className="text-xs font-medium text-slate-500">
                    Posted by: {post.author?.name || "Unknown landlord"}
                  </p>
                </div>
              </motion.article>
            );
          })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`h-10 w-10 rounded-xl text-xs font-semibold transition-all ${
                page === index + 1
                  ? "bg-green-800 text-white"
                  : "border border-gray-200 bg-white text-slate-500 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
      )}
    </LandlordLayout>
  );
}
