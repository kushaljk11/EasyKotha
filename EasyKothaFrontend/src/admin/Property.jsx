import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import axios from "../api/axios";
import { toast, Toaster } from "react-hot-toast";
import {
  FaSearch,
  FaBuilding,
  FaCheckCircle,
  FaPause,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
  FaEdit,
  FaPowerOff,
  FaTimes,
} from "react-icons/fa";

export default function Property() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    pending: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    type: "room",
    city: "",
    district: "",
    price: "",
    content: "",
    address: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [totalRes, pendingRes, activeRes, postsRes] = await Promise.all([
        axios.get("posts/count"),
        axios.get("posts/pending/count"),
        axios.get("posts/approved/count"),
        axios.get("posts", {
          params: {
            page: currentPage,
            search: searchQuery,
            status: "approved",
            limit: 10,
          },
        }),
      ]);

      setCounts({
        total: totalRes.data.totalPosts || 0,
        pending: pendingRes.data.pendingPosts || 0,
        active: activeRes.data.approvedPosts || 0,
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
        if (posts.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchData();
        }
      } catch {
        toast.error("Failed to delete listing");
      }
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this active listing?")) return;

    try {
      setUpdatingId(id);
      await axios.patch(`posts/${id}/status`, { status: "rejected" });
      toast.success("Listing deactivated successfully");
      fetchData();
    } catch {
      toast.error("Failed to deactivate listing");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenEdit = (post) => {
    setEditForm({
      id: post.id,
      title: post.title || "",
      type: post.type || "room",
      city: post.city || "",
      district: post.district || "",
      price: post.price || "",
      content: post.content || "",
      address: post.address || "",
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editForm.id) return;

    try {
      setUpdatingId(editForm.id);
      await axios.put(`updatepost/${editForm.id}`, {
        title: editForm.title,
        type: editForm.type,
        city: editForm.city,
        district: editForm.district,
        price: Number(editForm.price),
        content: editForm.content,
        address: editForm.address,
      });
      toast.success("Listing updated successfully");
      setEditModalOpen(false);
        fetchData();
    } catch {
      toast.error("Failed to update listing");
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
              <h1 className="text-3xl md:text-3xl font-semibold text-green-800 ">
                Active Listing Management
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                View all active listings and manage them with edit, deactivate, and delete actions.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-blue-50/50 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <FaBuilding className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Inventory</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-semibold text-black">{counts.total}</span>
                  <span className="text-[10px] md:text-xs font-semibold text-green-600">Live</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl border border-blue-50/50 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                <FaCheckCircle className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Listings</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-semibold text-black">{counts.active}</span>
                  <span className="text-[10px] md:text-xs font-semibold text-green-600">Approved</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl border border-blue-50/50 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 shrink-0">
                <FaPause className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Pending Listings</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-semibold text-black">{counts.pending}</span>
                  <span className="text-[10px] md:text-xs font-semibold text-red-600">Waiting</span>
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
                    placeholder="Search active listing by title or location..."
                    value={searchQuery}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setSearchQuery(e.target.value);
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all"
                  />
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Showing approved listings only
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">Property</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 hidden sm:table-cell">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">Price (NPR)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-right">Actions</th>
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
                      <tr key={post.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={post.images?.[0] || "/EasyKotha2-05.png"} 
                              alt="" 
                              className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-100" 
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{post.title}</p>
                              <p className="text-xs font-semibold text-slate-500 truncate max-w-25 sm:max-w-full">{post.city}, {post.district}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-md capitalize`}>
                            {post.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800">रू {post.price?.toLocaleString() || "0"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${post.status === 'approved' ? 'bg-green-500' : post.status === 'pending' ? 'bg-orange-400' : 'bg-red-500'}`} />
                            <span className="text-sm font-semibold text-slate-600 hidden xs:inline capitalize">{post.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              onClick={() => handleOpenEdit(post)}
                              disabled={updatingId === post.id}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                              title="Edit"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <FaEdit />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeactivate(post.id)}
                              disabled={updatingId === post.id}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30"
                              title="Deactivate"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              {updatingId === post.id ? (
                                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                              ) : (
                                <FaPowerOff />
                              )}
                            </motion.button>
                            <motion.button 
                              onClick={() => handleDeletePost(post.id)}
                              disabled={updatingId === post.id}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-30"
                              title="Delete"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <FaTrash />
                            </motion.button>
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
              <p className="text-xs font-semibold text-slate-500">
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

      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <motion.div
              className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Listing</h2>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid gap-4 p-5 md:grid-cols-2">
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-xs font-semibold text-slate-500">Title</span>
                <input
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  required
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold text-slate-500">Type</span>
                <select
                  value={editForm.type}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="room">Room</option>
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                  <option value="hostel">Hostel</option>
                  <option value="pg">PG</option>
                  <option value="shared_room">Shared Room</option>
                  <option value="office">Office</option>
                  <option value="others">Others</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold text-slate-500">Price</span>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  required
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold text-slate-500">City</span>
                <input
                  value={editForm.city}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, city: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  required
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold text-slate-500">District</span>
                <input
                  value={editForm.district}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, district: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  required
                />
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-xs font-semibold text-slate-500">Address</span>
                <input
                  value={editForm.address}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>

              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-xs font-semibold text-slate-500">Description</span>
                <textarea
                  rows={4}
                  value={editForm.content}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>

              <div className="flex justify-end gap-2 md:col-span-2">
                <motion.button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={updatingId === editForm.id}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {updatingId === editForm.id ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
