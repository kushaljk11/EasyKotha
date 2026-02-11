import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import axios from "../api/axios";
import { FaUsers, FaUser, FaUserShield, FaUserTie, FaSearch, FaFilter, FaPlus, FaChevronDown, FaEdit, FaBan, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaUndo, FaTrash, FaTimes } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { toast, Toaster } from "react-hot-toast";

export default function UserManagement() {

  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [limit] = React.useState(12);
  const [selectedRole, setSelectedRole] = React.useState("All Roles");
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "TENANT"
  });
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    tenantCount: 0,
    landlordCount: 0,
    adminCount: 0,
  });

  const fetchUsers = async (page = 1, role = selectedRole) => {
    try {
      const roleQuery = role !== "All Roles" ? `&role=${role}` : "";
      const response = await axios.get(`users?page=${page}&limit=${limit}${roleQuery}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("users/count");
      setStats({
        totalUsers: response.data.totalUsers || 0,
        tenantCount: response.data.tenantCount || 0,
        landlordCount: response.data.landlordCount || 0,
        adminCount: response.data.adminCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(currentPage, selectedRole), fetchDashboardStats()]);
      setLoading(false);
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedRole]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`users/${userId}`, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers(currentPage, selectedRole);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`users/${userId}`);
        toast.success("User deleted successfully");
        fetchUsers(currentPage, selectedRole);
        fetchDashboardStats();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("register", newUser);
      toast.success("New user created successfully");
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "TENANT" });
      fetchUsers(currentPage, selectedRole);
      fetchDashboardStats();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "bg-green-50", text: "text-green-600", icon: FaCheckCircle };
      case "INACTIVE":
        return { bg: "bg-gray-100", text: "text-gray-500", icon: FaTimesCircle };
      case "SUSPENDED":
        return { bg: "bg-red-50", text: "text-red-600", icon: FaBan };
      default:
        return { bg: "bg-blue-50", text: "text-blue-600", icon: FaCheckCircle };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const actioncard = [
    {
      name: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0", // Uses state or fallback
      description: "Manage all registered users",
      icon: FaUsers,
      link: "/admin/users",
      bgColor: "bg-green-800",
      circleColor: "bg-green-800/10",
    },
    {
      name: "Tenants",
      value: stats.tenantCount?.toLocaleString() || "0",
      description: "View and manage tenants",
      icon: FaUser,
      link: "/admin/users?role=tenant",
      bgColor: "bg-blue-800",
      circleColor: "bg-blue-800/10",
    },
    {
      name: "Landlords",
      value: stats.landlordCount?.toLocaleString() || "0",
      description: "Approve and manage landlords",
      icon: FaUserTie,
      link: "/admin/users?role=landlord",
      bgColor: "bg-purple-600",
      circleColor: "bg-purple-600/10",
    },
    {
      name: "Admins",
      value: stats.adminCount?.toLocaleString() || "0",
      description: "Platform administrators",
      icon: FaUserShield,
      link: "/admin/users?role=admin",
      bgColor: "bg-red-600",
      circleColor: "bg-red-600/10",
    },
  ];

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-50/50 min-h-screen overflow-x-hidden">
          <Topbar />
          <div className="p-4 md:p-6">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-green-800">User Management</h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">Manage users, view details, and perform administrative actions.</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {actioncard.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    const role = item.name === "Total Users" ? "All Roles" : item.name.slice(0, -1).toUpperCase();
                    setSelectedRole(role);
                    setCurrentPage(1);
                  }}
                  className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 md:p-3 rounded-xl ${item.bgColor} text-white shadow-lg shrink-0`}>
                        <item.icon className="text-lg md:text-xl" />
                      </div>
                      <span className="text-xl md:text-2xl font-semibold text-green-800">{item.value}</span>
                    </div>

                    <div>
                      <h2 className="text-sm md:text-base font-semibold text-gray-800 tracking-tight">{item.name}</h2>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">{item.description}</p>
                    </div>
                  </div>

                  {/* Decorative Circle */}
                  <div className={`absolute -right-6 -top-6 w-20 md:w-24 h-20 md:h-24 rounded-full ${item.circleColor} blur-2xl`} />
                </div>
              ))}
            </div>

            {/* Table Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header Controls */}
              <div className="p-4 md:p-6 border-b border-gray-100 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center flex-1 max-w-full lg:max-w-md relative">
                    <FaSearch className="absolute left-4 text-gray-400 text-sm" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all"
                    />
                    <button className="ml-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                      <FaFilter className="text-sm" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 border border-gray-200 text-[10px] md:text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-wider">
                      Bulk Activate
                    </button>
                    <button className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 border border-gray-200 text-[10px] md:text-xs font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors uppercase tracking-wider">
                      Bulk Suspend
                    </button>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-green-800 text-white text-[10px] md:text-xs font-semibold rounded-xl hover:bg-[#154e54] shadow-md transition-all uppercase tracking-wider"
                    >
                      <FaPlus className="text-xs" />
                      Add New
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400">
                  <span className="uppercase tracking-wider">Filters:</span>
                  <div className="flex items-center gap-2 relative">
                    <div 
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className="px-4 py-2 bg-white border border-green-800/20 rounded-xl flex items-center gap-4 text-green-800 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <span>{selectedRole}</span>
                      <FaChevronDown className={`text-[10px] transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                    </div>

                    {showRoleDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {["All Roles", "ADMIN", "LANDLORD", "TENANT"].map((role) => (
                          <div
                            key={role}
                            onClick={() => {
                              setSelectedRole(role);
                              setCurrentPage(1);
                              setShowRoleDropdown(false);
                            }}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedRole === role ? 'bg-green-800/10 text-green-800 font-semibold' : 'text-gray-600'}`}
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedRole("All Roles");
                      setCurrentPage(1);
                    }}
                    className="ml-auto text-green-800 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 w-12">
                        <input type="checkbox" className="rounded border-gray-300 text-green-800 focus:ring-green-800" />
                      </th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Region</th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Last Login</th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => {
                      const statusConfig = getStatusConfig(user.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <input type="checkbox" className="rounded border-gray-300 text-green-800 focus:ring-green-800" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full border border-gray-200 shadow-sm" 
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500 font-medium truncate max-w-30 sm:max-w-full">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className={`
                              ${user.role === 'ADMIN' ? 'bg-red-50 text-red-600' : 
                                user.role === 'LANDLORD' ? 'bg-purple-50 text-purple-600' : 
                                'bg-blue-50 text-blue-600'} 
                              text-[10px] font-semibold px-3 py-1 rounded-md tracking-wider`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <p className="text-xs font-medium text-gray-600 leading-tight">
                              {user.region && user.region !== "N/A" ? user.region.split(',')[0] + ',' : 'N/A'}
                            </p>
                            <p className="text-xs font-medium text-gray-400">
                              {user.region && user.region !== "N/A" ? user.region.split(',')[1] : ''}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <span className={`${statusConfig.bg} ${statusConfig.text} flex items-center gap-2 px-3 py-1.5 rounded-lg border border-current border-opacity-20 text-[10px] font-semibold`}>
                                <StatusIcon className="text-xs" />
                                <span className="hidden xs:inline">{user.status}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-gray-500 font-medium hidden md:table-cell">
                            {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : "Never"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {user.status === 'SUSPENDED' ? (
                                <button 
                                  onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                  className="p-2 text-green-400 hover:text-green-600 transition-colors"
                                  title="Activate User"
                                >
                                  <FaUndo />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Suspend User"
                                >
                                  <FaBan />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-gray-400 hover:text-red-700 transition-colors"
                                title="Delete User"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Showing <span className="text-gray-800 font-semibold">{(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, stats.totalUsers)}</span> of <span className="text-gray-800 font-semibold">{stats.totalUsers?.toLocaleString() || "0"}</span> users
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-green-800 disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Only show first page, last page, and pages around current page
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button 
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            currentPage === pageNum 
                              ? "bg-green-800 text-white shadow-md" 
                              : "hover:bg-white border border-transparent hover:border-gray-200 text-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 || 
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-gray-400">...</span>;
                    }
                    return null;
                  })}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-green-800 disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        show={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Add New User"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Enter full name"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="user@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User Role</label>
            <select 
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all outline-none"
            >
              <option value="TENANT">Tenant</option>
              <option value="LANDLORD">Landlord</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 bg-green-800 text-white text-sm font-semibold rounded-xl hover:bg-[#154e54] shadow-md transition-all"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-semibold text-green-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
