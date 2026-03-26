import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axios";
import { Search as SearchIcon, MapPin, Home, Filter, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import TenantSidebar from "../tenants/TenantSidebar";
import Search from "../components/Search";
import Footer from "../components/Footer";
import { API_ORIGIN } from "../config/env";
import {
  getProvinces,
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
} from "../utils/locationUtils";

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

const getPostId = (post) => post?.id ?? post?._id ?? post?.postId;

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [city, setCity] = useState("");
  const [roomType, setRoomType] = useState("");
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [cities, setCities] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef(null);

  useEffect(() => {
    fetchRoomTypes();
    loadLocationData();
    
    const queryParams = new URLSearchParams(location.search);

    const cityParam = queryParams.get("city") || queryParams.get("district");
    const sortParam = queryParams.get("sort") || "";
    const minPriceParam = queryParams.get("minPrice") || "";
    const maxPriceParam = queryParams.get("maxPrice") || "";

    if (cityParam) setCity(cityParam);
    setSort(sortParam);

    if (minPriceParam || maxPriceParam) {
      setPriceRange(`${minPriceParam}-${maxPriceParam}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const closeCitySuggestions = (event) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", closeCitySuggestions);
    return () => {
      document.removeEventListener("mousedown", closeCitySuggestions);
    };
  }, []);

  /** Loads all available city names from location dataset. */
  const loadLocationData = async () => {
    try {
      setLocationsLoading(true);
      const provinces = await getProvinces();
      const districtChunks = await Promise.all(
        provinces.map((province) => getDistrictsByProvince(province))
      );

      const districts = districtChunks.flat().filter(Boolean);
      const municipalityChunks = await Promise.all(
        districts.map((district) => getMunicipalitiesByDistrict(district))
      );

      const cityList = municipalityChunks
        .flat()
        .filter(Boolean)
        .map((name) => name.trim())
        .filter(Boolean);

      const uniqueCities = [...new Set(cityList)].sort((a, b) =>
        a.localeCompare(b)
      );

      setCities(uniqueCities);
    } catch (error) {
      console.error("Error loading location data:", error);
    } finally {
      setLocationsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Keep users at top after filter/page changes.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, roomType, sort, page, location.search]);

  const fetchRoomTypes = async () => {
    try {
      const response = await axiosInstance.get("/posts/types");
      if (response.data.success) {
        setRoomTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      const searchQuery = queryParams.get("search") || "";
      const minPrice = queryParams.get("minPrice") || "";
      const maxPrice = queryParams.get("maxPrice") || "";

      const params = {
        page,
        limit: 10,
        status: "approved",
        ...(searchQuery && { search: searchQuery }),
        ...(city && { city }),
        ...(roomType && { type: roomType }),
        ...(sort && { sort }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      };
      
      const response = await axiosInstance.get("/posts", { params });
      if (response.data.success) {
        setPosts(response.data.data);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    
    // Keep URL query in sync with selected filters.
    const queryParams = new URLSearchParams(location.search);
    if (city) {
      queryParams.set("city", city);
    } else {
      queryParams.delete("city");
    }
    queryParams.delete("district");
    
    if (roomType) {
      queryParams.set("type", roomType);
    } else {
      queryParams.delete("type");
    }

    if (sort) {
      queryParams.set("sort", sort);
    } else {
      queryParams.delete("sort");
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) queryParams.set("minPrice", min);
      else queryParams.delete("minPrice");

      if (max) queryParams.set("maxPrice", max);
      else queryParams.delete("maxPrice");
    } else {
      queryParams.delete("minPrice");
      queryParams.delete("maxPrice");
    }
    
    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    }, { replace: true });
    
    fetchPosts();
  };

  const filteredCities = city.trim()
    ? cities.filter((cityName) =>
        cityName.toLowerCase().includes(city.toLowerCase().trim())
      )
    : cities;

  const citySuggestions = filteredCities.slice(0, 12);

  return (
    <>
    <div className="flex min-h-dvh bg-[#f8fafc]">
      <TenantSidebar />
      <div className="h-dvh flex-1 overflow-y-auto bg-white">

      <div className="bg-gray-50/30 pb-16 p-3 sm:p-4 md:p-8">
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 md:p-6 mb-4 md:mb-6">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-12 xl:items-end">
            <div className="sm:col-span-2 xl:col-span-3">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400 md:text-sm">
                <SearchIcon size={12} /> Search Property
              </label>
              <Search 
                placeholder="Find your next home..." 
                className="w-full"
                inputClassName="py-2.5 text-sm"
              />
            </div>

            <div ref={cityInputRef} className="relative sm:col-span-1 xl:col-span-3">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400 md:text-sm">
                <MapPin size={12} /> City
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                placeholder="Search city (e.g. ita...)"
                disabled={locationsLoading}
              />

              {showCitySuggestions && !locationsLoading && citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
                  {citySuggestions.map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => {
                        setCity(cityName);
                        setShowCitySuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-green-800/5 border-b border-gray-100 last:border-b-0 text-sm font-medium text-gray-700 hover:text-green-800 transition"
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Type */}
            <div className="sm:col-span-1 xl:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400 md:text-sm">
                <MapPin size={12} /> Property Type
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium capitalize outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="">Any Type</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>{type.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="sm:col-span-1 xl:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400 md:text-sm">
                <Filter size={12} /> Price
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                value={priceRange || sort}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value.includes("-")) {
                    setPriceRange(value);
                    setSort("");
                    return;
                  }

                  setSort(value);
                  setPriceRange("");
                }}
              >
                <option value="">Any Price</option>
                <option value="1000-2000">NPR 1000 - 2000</option>
                <option value="2000-3000">NPR 2000 - 3000</option>
                <option value="3000-4000">NPR 3000 - 4000</option>
                <option value="priceLowToHigh">Price: Low</option>
                <option value="priceHighToLow">Price: High</option>
              </select>
            </div>

            {/* Button */}
            <div className="sm:col-span-2 xl:col-span-2">
              <motion.button
                type="submit"
                className="w-full rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-green-800/10 hover:bg-green-900 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                Apply
              </motion.button>
            </div>
          </form>
        </div>

        {/* Listings Section */}
        <div className="w-full">
          <div className="mb-4 px-2">
            <h2 className="text-[2rem] sm:text-3xl font-semibold text-green-800 tracking-tight">All Rooms</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium ">Found {posts.length} properties matching your criteria</p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {loading && <p className="text-sm text-slate-500">Loading listings...</p>}

            {!loading && posts.length === 0 && (
              <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center">
                <h3 className="text-2xl font-semibold text-black">No properties found</h3>
                <p className="mt-2 text-slate-500">Try adjusting your filters to find more results.</p>
              </div>
            )}

            {!loading &&
              posts.map((post) => {
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all text-xs ${
                    page === i + 1
                      ? "bg-green-800 text-white shadow-xl shadow-green-800/20"
                      : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  </>
  );
};

export default Explore;
