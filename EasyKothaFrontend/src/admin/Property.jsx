/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
// import ListingModel from "../landlord/component/ListingModel";
import axios from "../api/axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaChevronDown, 
  FaBuilding, 
  FaCheckCircle, 
  FaPause, 
  FaChevronLeft, 
  FaChevronRight,
  FaEllipsisH,
  FaTrash,
  FaTimes
} from "react-icons/fa";

export default function Property() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    pending: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Action States
  const [updatingId, setUpdatingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [totalRes, pendingRes, activeRes, postsRes] = await Promise.all([
        axios.get("posts/count"),
        axios.get("posts/pending/count"),
        axios.get("posts/approved/count"),
        axios.get(`posts?page=${currentPage}&search=${searchQuery}`)
      ]);

      setCounts({
        total: totalRes.data.totalPosts || 0,
        pending: pendingRes.data.pendingPosts || 0,
        active: activeRes.data.approvedPosts || 0
      });

      setPosts(postsRes.data.data || []);
      setTotalPages(postsRes.data.pages || 1);
    } catch (error) {
      console.error("Error fetching property data:", error);
      toast.error("Failed to load property listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const handleDeletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`deletepost/${id}`);
        toast.success("Listing deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete listing");
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.patch(`posts/${id}/status`, { status });
      toast.success(`Post ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update post status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex-1 bg-gray-50/50 min-h-screen">
        <Topbar />
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-3xl font-extrabold text-green-800 tracking-tight">
                Listing Inventory Log
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Monitor and manage all real estate listings across Nepal.
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-200"
            >
              <FaPlus className="text-xs" />
              Add New Listing
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-blue-50/50 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <FaBuilding className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inventory</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-semibold text-slate-900">{counts.total}</span>
                  <span className="text-[10px] md:text-xs font-bold text-green-500">Live</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl border border-blue-50/50 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                <FaCheckCircle className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Listings</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-semibold text-slate-900">{counts.active}</span>
                  <span className="text-[10px] md:text-xs font-bold text-green-500">Approved</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl border border-blue-50/50 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 shrink-0">
                <FaPause className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Listings</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-semibold text-slate-900">{counts.pending}</span>
                  <span className="text-[10px] md:text-xs font-bold text-red-500">Waiting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Filters Row */}
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input 
                    type="text" 
                    placeholder="Search Property, Landlord, or Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2 ml-auto lg:ml-0">
                    <button 
                      onClick={fetchData}
                      className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl border border-gray-200 transition-colors"
                    >
                      <FaFilter className="text-xs md:text-sm" />
                    </button>
                    <button className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl border border-gray-200 transition-colors">
                      <FaDownload className="text-xs md:text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Property</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Type</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Price (NPR)</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading listings...</td>
                    </tr>
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-500">No listings found</td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={post.images?.[0] || "/EasyKotha2-05.png"} 
                              alt="" 
                              className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-100" 
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{post.title}</p>
                              <p className="text-[11px] font-bold text-slate-400 truncate max-w-25 sm:max-w-full">{post.city}, {post.district}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`bg-blue-50 text-blue-600 text-[10px] font-semibold px-3 py-1 rounded-md tracking-wider uppercase`}>
                            {post.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">रू {post.price?.toLocaleString() || "0"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${post.status === 'approved' ? 'bg-green-500' : post.status === 'pending' ? 'bg-orange-400' : 'bg-red-500'}`} />
                            <span className="text-sm font-bold text-slate-600 hidden xs:inline capitalize">{post.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {post.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(post._id, 'approved')}
                                  disabled={updatingId === post._id}
                                  className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-30"
                                  title="Approve"
                                >
                                  {updatingId === post._id ? (
                                    <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                                  ) : (
                                    <FaCheckCircle />
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(post._id, 'rejected')}
                                  disabled={updatingId === post._id}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                                  title="Reject"
                                >
                                  {updatingId === post._id ? (
                                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                  ) : (
                                    <FaTimes />
                                  )}
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleDeletePost(post._id)}
                              disabled={updatingId === post._id}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-30"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 bg-slate-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-bold text-slate-400">
                Showing <span className="text-slate-800">{posts.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, counts.total)}</span> of <span className="text-slate-800">{counts.total?.toLocaleString() || "0"}</span> entries
              </p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-400 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                >
                  <FaChevronLeft className="text-[10px]" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'hover:bg-white hover:shadow-sm text-slate-500'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-400 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                >
                  <FaChevronRight className="text-[10px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ListingModel 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchData} 
      />
    </div>
  );
}
