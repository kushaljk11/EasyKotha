import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axios";
import { Search as SearchIcon, MapPin, Home, Filter, Clock, Heart, Users } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import TenantTopbar from "../tenants/TenantTopbar";
import TenantSidebar from "../tenants/TenantSidebar";
import Search from "../components/Search";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import {
  getProvinces,
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
} from "../utils/locationUtils";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, toggleSavePost } = useAuthStore();

  const [city, setCity] = useState("");
  const [roomType, setRoomType] = useState("");
  const [sort, setSort] = useState("latest");
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

    if (cityParam) setCity(cityParam);
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

  const handleToggleSave = async (postId) => {
    if (!authUser) {
      toast.error("Please login to save posts");
      navigate("/login");
      return;
    }
    await toggleSavePost(postId);
  };

  const isSaved = (postId) => {
    if (!Array.isArray(authUser?.savedPosts)) return false;

    return authUser.savedPosts.some((savedPost) => {
      const savedId =
        typeof savedPost === "object"
          ? savedPost?.id ?? savedPost?.postId ?? savedPost?._id
          : savedPost;

      return String(savedId) === String(postId);
    });
  };

  return (
    <>
    <div className="flex min-h-dvh bg-[#f8fafc]">
      <TenantSidebar />
      <div className="h-dvh flex-1 overflow-y-auto bg-white">
      <TenantTopbar />

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
                <Filter size={12} /> Sort By
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-green-800 focus:bg-white focus:ring-2 focus:ring-green-800/20"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="latest">Newest First</option>
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

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-64 w-full bg-white border border-gray-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => {
                  const postId = post?._id || post?.id || post?.postId;
                  return (
                  <motion.div
                    key={postId || post.title}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-xl md:flex-row"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    whileHover={{ y: -3 }}
                  >
                    {/* Image Container - Reduced height matching parent */}
                    <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-56 md:h-auto md:w-72 lg:w-80">
                      <img
                        src={post.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute left-3 top-3 flex gap-1.5 sm:gap-2">
                         <span className="rounded-lg bg-green-800 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-lg sm:px-2.5 sm:py-1.5">
                          {post.type.replace("_", " ")}
                        </span>
                        <span className="rounded-lg bg-green-500 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-lg sm:px-2.5 sm:py-1.5">
                          Available Now
                        </span>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 md:p-6">
                      <div className="flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 sm:pr-5">
                            <div className="flex items-center gap-2 text-black font-semibold text-sm mb-2">
                              <MapPin size={12} /> {post.district}, {post.city}
                            </div>
                            <h3 className="line-clamp-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-green-800 md:line-clamp-1 md:text-2xl">
                              {post.title}
                            </h3>
                          </div>
                          <div className="text-left sm:text-right">
                             <p className="text-[1.7rem] font-semibold leading-none text-red-800">NPR {post.price?.toLocaleString() || "0"}</p>
                             <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-gray-400">Per Month</p>
                          </div>
                        </div>

                        <p className="mt-1 text-sm font-medium leading-relaxed text-gray-500 line-clamp-2">
                          {post.content}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
                           <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-gray-400">
                                <Users size={14} />
                                <span className="text-[9px] font-semibold uppercase tracking-wider">{post.tenantType}</span>
                           </div>
                           <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-gray-400">
                                <Home size={14} />
                                <span className="text-[9px] font-semibold uppercase tracking-wider">{post.furnishing}</span>
                           </div>
                           <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-gray-400">
                                <Clock size={14} />
                                <span className="text-[9px] font-semibold uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-gray-50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-green-800/10 border border-green-800/20 flex items-center justify-center text-green-800 text-[10px] font-semibold shadow-inner">
                               {post.author?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                               <p className="text-xs font-semibold text-gray-900 leading-none">{post.author?.name}</p>
                               <p className="text-xs text-black font-semibold">Verified Owner</p>
                            </div>
                         </div>
                         <div className="flex w-full items-center gap-3 sm:w-auto">
                            <motion.button 
                              onClick={() => postId && handleToggleSave(postId)}
                              className={`h-10 w-10 shrink-0 flex items-center justify-center border rounded-xl transition-all ${
                                isSaved(postId) 
                                  ? "bg-red-50 border-red-100 text-red-500 shadow-inner" 
                                  : "bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <Heart size={18} fill={isSaved(postId) ? "currentColor" : "none"} />
                            </motion.button>
                            {postId ? (
                              <Link 
                                  to={`/posts/${postId}`}
                                  className="w-full rounded-xl bg-green-800 px-5 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-green-900 active:scale-[0.98] sm:w-auto"
                                >
                                  View Property
                                </Link>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="bg-gray-200 text-gray-500 px-8 py-3 rounded-xl text-sm font-semibold cursor-not-allowed"
                              >
                                View Property
                              </button>
                            )}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <h3 className="text-2xl font-semibold text-gray-900">No properties found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters to find more results.</p>
                </div>
              )}
            </div>
          )}

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
    <Footer />
  </>
  );
};

export default Explore;
