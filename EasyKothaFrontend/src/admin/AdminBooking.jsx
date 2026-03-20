import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import axios from "../api/axios";
import { 
  FaCalendarCheck, 
  FaUser, 
  FaHome, 
  FaClock, 
  FaSearch, 
  FaFilter, 
  FaEllipsisV,
  FaCheckCircle,
  FaArrowRight
} from "react-icons/fa";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBookingDisplayId = (booking) => {
    const rawId = booking?.id ?? booking?._id;
    if (rawId === undefined || rawId === null) return "N/A";
    return String(rawId).slice(-6);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/bookings");
        setBookings(res.data.data || []);
      } catch (error) {
        console.error("Error fetching admin bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50/50 min-h-screen">
        <Topbar />
        <div className="p-4 md:p-8">
          <div className="mb-8 text-left">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              Booking History
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track all property bookings and interaction between tenants and landlords.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 text-left">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search bookings, tenants, or IDs..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/10"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-semibold text-gray-600">
                <FaFilter /> Filters
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">ID / Date</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Property</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Parties Involved</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading bookings...</td>
                    </tr>
                  ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking.id ?? booking._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">{getBookingDisplayId(booking)}</p>
                          <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={booking.post?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=100"} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div>
                              <p className="text-xs font-semibold text-slate-800 line-clamp-1">{booking.post?.title}</p>
                              <p className="text-[10px] font-semibold text-gray-400 truncate max-w-30">{booking.post?.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-[10px] font-semibold flex items-center gap-1.5">
                              <span className="text-blue-600 truncate">{booking.user?.name || "Tenant"}</span>
                              <FaArrowRight className="text-gray-300 text-[8px]" />
                              <span className="text-green-800 truncate">{booking.post?.author?.name || "Landlord"}</span>
                            </div>
                            <p className="text-[9px] font-semibold text-gray-400 truncate">
                              {booking.user?.email || "No tenant email"}
                            </p>
                            <p className="text-[9px] font-semibold text-gray-400 truncate">
                              {booking.post?.author?.email || "No landlord email"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <p className="text-xs font-semibold text-slate-800">रू {booking.totalPrice?.toLocaleString?.() || "0"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase ${
                            booking.status === 'approved' 
                              ? 'bg-green-50 text-green-600' 
                              : booking.status === 'pending'
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-gray-400 hover:text-green-800">
                            <FaEllipsisV />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No bookings found in history.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
