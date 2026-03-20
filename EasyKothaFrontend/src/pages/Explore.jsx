import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { Search as SearchIcon, MapPin, Home, Filter, Clock, Heart, Users } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TenantTopbar from "../tenants/TenantTopbar";
import TenantSidebar from "../tenants/TenantSidebar";
import Search from "../components/Search";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import Footer from "../components/Footer";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, toggleSavePost } = useAuthStore();
  
  // Filters state
  const [district, setDistrict] = useState("");
  const [roomType, setRoomType] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Constants
  const districts = [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Butwal", "Dharan", "Biratnagar"
  ];

  useEffect(() => {
    fetchRoomTypes();
    
    // Parse URL params on mount
    const queryParams = new URLSearchParams(location.search);
    
    const dist = queryParams.get("district");
    const type = queryParams.get("type");
    
    if (dist) setDistrict(dist);
    if (type) setRoomType(type);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPosts();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district, roomType, sort, page, location.search]);

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
        ...(district && { district }),
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
    
    // Sync filters to URL
    const queryParams = new URLSearchParams(location.search);
    if (district) {
      queryParams.set("district", district);
    } else {
      queryParams.delete("district");
    }
    
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

  const handleToggleSave = async (postId) => {
    if (!authUser) {
      toast.error("Please login to save posts");
      navigate("/login");
      return;
    }
    await toggleSavePost(postId);
  };

  const isSaved = (postId) => {
    return authUser?.savedPosts?.includes(postId);
  };

  return (
    <>
    <div className="flex min-h-screen bg-[#f8fafc]">
      <TenantSidebar />
      <div className="h-screen flex-1 overflow-y-auto bg-white">
      <TenantTopbar />

      <div className="bg-gray-50/30 pb-20 p-4 md:p-8">
        {/* Horizontal Search & Filter Bar */}
        <div className="w-full bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Search Bar Component */}
            <div className="md:col-span-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400  mb-4">
                <SearchIcon size={12} /> Search Property
              </label>
              <Search 
                placeholder="Find your next home..." 
                className="w-full"
              />
            </div>

            {/* City */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400  mb-4">
                <MapPin size={12} /> City/District
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#19545c]/20 focus:bg-white focus:border-[#19545c] transition-all outline-none text-sm font-medium"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">All Locations</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400  mb-4">
                <Home size={12} /> Property Type
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#19545c]/20 focus:bg-white focus:border-[#19545c] transition-all outline-none text-sm font-medium capitalize"
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
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400  mb-4">
                <Filter size={12} /> Sort By
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#19545c]/20 focus:bg-white focus:border-[#19545c] transition-all outline-none text-sm font-medium"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="latest">Newest First</option>
                <option value="priceLowToHigh">Price: Low</option>
                <option value="priceHighToLow">Price: High</option>
              </select>
            </div>

            {/* Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#19545c] text-white px-4 py-3 rounded-xl font-semibold text-xs  hover:bg-[#153d44] transition shadow-xl shadow-[#19545c]/10 active:scale-[0.98]"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Listings Section */}
        <div className="w-full">
          <div className="mb-4 px-2">
            <h2 className="text-3xl font-semibold text-[#19545c] tracking-tight">All Rooms</h2>
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
                  <div key={postId || post.title} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row border border-gray-100 group overflow-hidden md:h-65">
                    {/* Image Container - Reduced height matching parent */}
                    <div className="relative w-full md:w-90 h-56 md:h-full shrink-0 overflow-hidden">
                      <img
                        src={post.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                         <span className="bg-[#19545c] text-white text-[9px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">
                          {post.type.replace("_", " ")}
                        </span>
                        <span className="bg-green-500 text-white text-[9px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">
                          Available Now
                        </span>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 mr-8">
                            <div className="flex items-center gap-2 text-black font-semibold text-sm mb-2">
                              <MapPin size={12} /> {post.district}, {post.city}
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 line-clamp-1 group-hover:text-[#19545c] transition-colors">
                              {post.title}
                            </h3>
                          </div>
                          <div className="text-right">
                             <p className="text-[22px] font-semibold text-red-800 leading-none">NPR {post.price?.toLocaleString() || "0"}</p>
                             <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Per Month</p>
                          </div>
                        </div>

                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium mt-1">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-6 mt-2">
                           <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <Users size={14} />
                                <span className="text-[9px] font-semibold uppercase tracking-wider">{post.tenantType}</span>
                           </div>
                           <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <Home size={14} />
                                <span className="text-[9px] font-semibold uppercase tracking-wider">{post.furnishing}</span>
                           </div>
                           <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <Clock size={14} />
                                <span className="text-[9px] font-semibold uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#19545c]/10 border border-[#19545c]/20 flex items-center justify-center text-[#19545c] text-[10px] font-semibold shadow-inner">
                               {post.author?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                               <p className="text-xs font-semibold text-gray-900 leading-none">{post.author?.name}</p>
                               <p className="text-xs text-black font-semibold">Verified Owner</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button 
                              onClick={() => postId && handleToggleSave(postId)}
                              className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-all ${
                                isSaved(postId) 
                                  ? "bg-red-50 border-red-100 text-red-500 shadow-inner" 
                                  : "bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                            >
                                <Heart size={18} fill={isSaved(postId) ? "currentColor" : "none"} />
                            </button>
                            {postId ? (
                              <Link 
                                  to={`/posts/${postId}`}
                                  className="bg-[#19545c] hover:bg-[#15443f] text-white px-8 py-3 rounded-xl text-sm font-semibold  transition-all active:scale-[0.98]"
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
                  </div>
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
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all text-xs ${
                    page === i + 1
                      ? "bg-[#19545c] text-white shadow-xl shadow-[#19545c]/20"
                      : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
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
