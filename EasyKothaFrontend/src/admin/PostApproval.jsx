/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import axios from "../api/axios";
import { toast, Toaster } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaTag,
  FaArrowLeft
} from "react-icons/fa";

export default function PostApproval() {
  const getPostId = (post) => post?._id ?? post?.id;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`posts?status=pending&search=${searchQuery}`);
      const fetchedPosts = res.data.data || [];
      setPosts(fetchedPosts);
      // Auto-select first post if none selected
      if (fetchedPosts.length > 0 && !selectedPost) {
        setSelectedPost(fetchedPosts[0]);
      }
    } catch (error) {
      toast.error("Failed to fetch pending list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleAction = async (id, status) => {
    if (!id) {
      toast.error("Invalid post ID. Refresh and try again.");
      return;
    }

    try {
      setActionLoading(status);
      await axios.patch(`posts/${id}/status`, { status });
      toast.success(`Post ${status} successfully`);
      
      // Update local list
      const updatedPosts = posts.filter((post) => getPostId(post) !== id);
      setPosts(updatedPosts);
      
      // Select next post or null
      if (getPostId(selectedPost) === id) {
        setSelectedPost(updatedPosts.length > 0 ? updatedPosts[0] : null);
      }
    } catch (error) {
      toast.error(`Failed to ${status} post`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex-1 bg-gray-50/50 min-h-screen overflow-x-hidden">
        <Topbar />
        <div className="p-4 md:p-6 text-black">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-green-800">Post Approval Queue</h1>
            <p className="text-gray-500 mt-1">Review and approve new property listings from users.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* List Section */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search pending posts..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/10"
                  />
                </div>
                <button className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-600">
                  <FaFilter />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-10 text-gray-400">Loading pending requests...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  No pending posts found. Everything is clear!
                </div>
              ) : (
                posts.map((post) => {
                  const postId = getPostId(post);
                  return (
                  <div 
                    key={postId || `${post.title}-${post.createdAt}`} 
                    className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer ${getPostId(selectedPost) === postId ? 'border-green-800 ring-1 ring-green-800' : 'border-gray-100 hover:shadow-md'}`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex gap-4">
                      <img 
                        src={post.images?.[0] || "/EasyKotha2-05.png"} 
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover bg-gray-50" 
                        alt="" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded uppercase tracking-wider">
                            {post.type}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                            <FaClock /> {formatDistanceToNow(new Date(post.createdAt))} ago
                          </span>
                        </div>
                        <h3 className="text-sm md:text-base font-semibold text-slate-800 mt-1 truncate">{post.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt className="text-green-800" /> {post.city}, {post.district}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-green-800/10 flex items-center justify-center text-[10px] font-semibold text-green-800">
                            {post.author?.name?.charAt(0) || "U"}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700">{post.author?.name || "Unknown User"}</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm font-semibold text-green-800">रू {post.price?.toLocaleString() || "0"}</span>
                          <button 
                            className="flex items-center gap-1 text-[10px] font-semibold text-green-800 uppercase hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                            }}
                          >
                            <FaEye /> Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* Preview Section */}
            <div className="xl:col-span-1">
              {selectedPost ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="relative">
                    <img src={selectedPost.images?.[0] || "/EasyKotha2-05.png"} className="w-full h-56 object-cover" alt="" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-semibold text-green-800 uppercase tracking-widest shadow-sm">
                      {selectedPost.type}
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-black leading-tight">{selectedPost.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                       <FaMapMarkerAlt className="text-green-800 text-xs" />
                       <p className="text-xs text-slate-500 font-bold">{selectedPost.address || `${selectedPost.city}, ${selectedPost.district}`}</p>
                    </div>
                    <p className="text-xl text-green-800 font-semibold mt-3">रू {selectedPost.price?.toLocaleString() || "0"} <span className="text-xs text-gray-400 font-bold italic">/ Total</span></p>
                    
                    <div className="mt-6 pt-4 border-t border-gray-50">
                      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FaTag className="text-green-800" /> Property Description
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {selectedPost.content}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase">Furnishing</p>
                        <p className="text-[11px] font-semibold text-slate-700 capitalize">{selectedPost.furnishing}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase">Tenants</p>
                        <p className="text-[11px] font-bold text-slate-700 capitalize">{selectedPost.tenantType}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                      <button 
                        disabled={actionLoading}
                        onClick={() => handleAction(getPostId(selectedPost), 'rejected')}
                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        {actionLoading === 'rejected' ? <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-600 rounded-full animate-spin" /> : <><FaTimes /> Reject</>}
                      </button>
                      <button 
                        disabled={actionLoading}
                        onClick={() => handleAction(getPostId(selectedPost), 'approved')}
                        className="flex items-center justify-center gap-2 bg-green-800 text-white py-3 rounded-2xl font-semibold text-xs uppercase tracking-wider hover:bg-[#123d43] transition-all shadow-lg shadow-[green-800]/20 disabled:opacity-50"
                      >
                        {actionLoading === 'approved' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FaCheck /> Approve</>}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-96 flex flex-col items-center justify-center text-center p-8 sticky top-24">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
                    <FaEye size={32} />
                  </div>
                  <h3 className="text-slate-800 font-semibold">No Post Selected</h3>
                  <p className="text-xs text-gray-400 mt-2">Select a post from the list to preview details and take action.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
