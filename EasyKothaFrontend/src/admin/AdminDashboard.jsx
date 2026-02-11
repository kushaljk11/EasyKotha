import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect, useRef } from "react";
import {
  FaUsers,
  FaHome,
  FaExclamationCircle,
  FaDollarSign,
  FaArrowUp,
  FaExclamation,
  FaChartLine,
  FaLightbulb,
  FaBuilding,
  FaCalendarCheck,
  FaUser,
  FaHandPaper,
} from "react-icons/fa";
import axios from "../api/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const user = { name: "Admin" };
  const containerRef = useRef(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 300 });
  const [loading, setLoading] = useState(true);

  // State to store real-time statistics from the backend
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    revenue: "450k",
    pendingVerify: 0,
  });

  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setChartSize({
          width: containerRef.current.offsetWidth,
          height: 300,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [loading]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [usersRes, postsRes, pendingRes, detailedRes] = await Promise.all([
          axios.get("users/count"),
          axios.get("posts/count"),
          axios.get("posts/pending/count"),
          axios.get("admin/detailed-stats"),
        ]);

        setStats((prev) => ({
          ...prev,
          totalUsers: usersRes.data.totalUsers || 0,
          activeListings: postsRes.data.totalPosts || 0,
          pendingVerify: pendingRes.data.pendingPosts || 0,
        }));

        setLogs(detailedRes.data.logs || []);
        setChartData(detailedRes.data.growthData || []);
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  const actioncard = [
    {
      title: "TOTAL USERS",
      value: stats.totalUsers?.toLocaleString() || "0",
      icon: FaUsers,
      change: "12%",
      changeType: "increase",
      bgColor: "bg-blue-800",
      iconColor: "text-white",
      circleColor: "bg-blue-800/60",
    },
    {
      title: "ACTIVE LISTINGS",
      value: stats.activeListings?.toLocaleString() || "0",
      icon: FaHome,
      change: "5%",
      changeType: "increase",
      bgColor: "bg-green-800",
      iconColor: "text-white",
      circleColor: "bg-green-800/60",
    },
    {
      title: "REVENUE (NPR)",
      value: stats.revenue,
      icon: FaDollarSign,
      change: "8%",
      changeType: "increase",
      bgColor: "bg-purple-800",
      iconColor: "text-white",
      circleColor: "bg-purple-800/60",
    },
    {
      title: "PENDING APPROVAL",
      value: stats.pendingVerify,
      icon: FaExclamationCircle,
      change: "Action Required",
      changeType: "alert",
      bgColor: "bg-red-800",
      iconColor: "text-white",
      circleColor: "bg-red-800/60",
    },
  ];

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto">
        <Topbar />
        <main className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-green-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 font-semibold text-sm flex items-center gap-1">
              Welcome back, {user?.name || "Admin"}
              {/* <FaHandPaper className="text-yellow-500" /> */}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {actioncard.map((card, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between relative overflow-hidden transition-all hover:shadow-md group"
              >
                <div className="space-y-4">
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {card.title}
                  </h2>
                  <p className="text-3xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${card.changeType === 'increase' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
                      {card.changeType === 'increase' ? <FaArrowUp size={8}/> : <FaExclamation size={8}/>}
                      {card.change}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor} text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform relative z-10`}>
                  <card.icon className="text-xl" />
                </div>
                {/* Decorative Background Circle */}
                <div
                  className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${card.circleColor || "bg-blue-800/5"} blur-xl opacity-60`}
                />
              </div>
            ))}
          </div>

          {/* Charts and Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Trends Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-green-800 rounded-md text-white">
                      <FaChartLine size={14} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Platform Growth Trends</h2>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">User acquisition vs New Listings</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Listings</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full" ref={containerRef}>
                {chartSize.width > 0 && chartData.length > 0 && (
                  <svg width={chartSize.width} height={chartSize.height} className="overflow-visible">
                    {[0, 1, 2, 3].map((i) => (
                      <line key={i} x1="0" y1={i * (chartSize.height / 3)} x2={chartSize.width} y2={i * (chartSize.height / 3)} stroke="#f1f5f9" strokeWidth="1" />
                    ))}

                    <path
                      d={`M 0 ${chartSize.height - (chartData[0].users / 2500) * chartSize.height} ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * chartSize.width} ${chartSize.height - (d.users / 2500) * chartSize.height}`).join(' ')} V ${chartSize.height} H 0 Z`}
                      fill="rgba(34, 197, 94, 0.05)"
                    />
                    
                    <path
                      d={`M 0 ${chartSize.height - (chartData[0].users / 2500) * chartSize.height} ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * chartSize.width} ${chartSize.height - (d.users / 2500) * chartSize.height}`).join(' ')}`}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    <path
                      d={`M 0 ${chartSize.height - (chartData[0].listings / 2500) * chartSize.height} ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * chartSize.width} ${chartSize.height - (d.listings / 2500) * chartSize.height}`).join(' ')}`}
                      fill="none"
                      stroke="green-800"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                    />

                    {chartData.map((item, i) => (
                      <text key={i} x={(i / (chartData.length - 1)) * chartSize.width} y={chartSize.height + 20} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                        {item.name}
                      </text>
                    ))}
                  </svg>
                )}
              </div>
            </div>

            {/* Quick Insights Sidebar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <div className="p-1.5 bg-[#fef9c3] rounded-md text-[#854d0e]">
                  <FaLightbulb size={14} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Quick Insights</h2>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {[
                  { title: "Demand Surge", desc: "High rooms in Itahari", color: "blue" },
                  { title: "Price Anomaly", desc: "3 listings in Kathmandu", color: "orange" },
                  { title: "Room Shortage", desc: "5 listings in Pokhara", color: "green" }
                ].map((insight, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100 transition-colors">
                    <div className="mt-1">
                      <div className={`p-2 bg-white rounded-lg shadow-sm text-${insight.color}-600`}>
                        <FaChartLine size={12} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 pt-0">
                <button className="w-full py-3 px-4 bg-green-800 text-white font-semibold text-xs rounded-xl hover:bg-opacity-90 transition-all shadow-md shadow-gray-200">
                  View Full AI Report
                </button>
              </div>
            </div>
          </div>

          {/* Recent Log Feed Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Log Feed</h2>
              <div className="flex gap-3">
                <Link
                  to="/admin/logs"
                  className="px-4 py-2 border border-gray-200 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  View All
                </Link>
                <button className="px-4 py-2 bg-[#1e293b] text-white text-xs font-semibold rounded-lg hover:bg-black transition-all">
                  Export Report
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    {["Type", "Entity", "Action / Status", "Timestamp", "Reference"].map((head) => (
                      <th
                        key={head}
                        className={`px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${
                          head === "Timestamp" ? "hidden sm:table-cell" : ""
                        } ${head === "Reference" ? "hidden lg:table-cell" : ""}`}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.slice(0, 6).map((log, index) => {
                    const Icon =
                      log.type === "USER"
                        ? FaUser
                        : log.type === "LISTING"
                        ? FaBuilding
                        : FaCalendarCheck;
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${
                              log.type === "USER" ? "bg-blue-600" : 
                              log.type === "LISTING" ? "bg-red-900" : 
                              "bg-orange-600"} text-white`}>
                              <Icon className="text-xs" />
                            </div>
                            <span className={`text-[10px] font-semibold ${log.typeColor} uppercase`}>
                              {log.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={log.avatar || `https://ui-avatars.com/api/?name=${log.entity}`}
                              alt=""
                              className="w-8 h-8 rounded-full border border-gray-100"
                            />
                            <span className="text-sm font-semibold text-gray-700">{log.entity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-semibold ${log.statusBg} text-white`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-medium hidden sm:table-cell">
                          {new Date(log.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}, {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium hidden lg:table-cell">
                          {log.reference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <footer className="p-8 text-center border-t border-gray-50 text-gray-400 text-xs font-semibold">
            &copy; 2024 EasyKotha. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
