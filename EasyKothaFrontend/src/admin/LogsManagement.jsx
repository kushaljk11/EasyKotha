import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";
import {
  FaHistory,
  FaSearch,
  FaFileExport,
  FaUser,
  FaBuilding,
  FaCalendarCheck,
  FaFilter,
} from "react-icons/fa";
import axios from "../api/axios";

export default function LogsManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("admin/detailed-stats");
        setLogs(response.data.logs || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.entity.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "ALL" || log.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto">
        <Topbar />
        <main className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-green-800">
                Logs Management
              </h1>
              <p className="text-gray-500 font-medium text-sm">
                Monitor and manage all system activities and audit trails.
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-green-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-gray-200 hover:bg-opacity-90 transition-all">
              <FaFileExport />
              Export History
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by entity or reference..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {["ALL", "USER", "LISTING", "BOOKING"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    filter === f
                      ? "bg-green-800 text-white shadow-md shadow-gray-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    {["Type", "Entity", "Action / Status", "Timestamp", "Reference"].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.map((log, index) => {
                    const Icon =
                      log.type === "USER"
                        ? FaUser
                        : log.type === "LISTING"
                        ? FaBuilding
                        : FaCalendarCheck;
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-lg ${
                                log.type === "USER" ? "bg-blue-600" : 
                                log.type === "LISTING" ? "bg-red-900" : 
                                "bg-orange-600"} text-white`}
                            >
                              <Icon className="text-xs" />
                            </div>
                            <span
                              className={`text-[10px] font-semibold ${log.typeColor} uppercase`}
                            >
                              {log.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={log.avatar}
                              alt=""
                              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                              {log.entity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold ${log.statusBg} text-white shadow-sm inline-block`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                          <div className="flex flex-col">
                            <span>
                              {new Date(log.timestamp).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-semibold font-mono">
                          {log.reference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <div className="p-12 text-center">
                  <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                    <FaHistory className="text-2xl text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-semibold">No logs found</p>
                  <p className="text-gray-400 text-xs">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
