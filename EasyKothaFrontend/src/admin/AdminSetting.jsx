import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuthStore } from "../store/useAuthStore";
import { 
  FaUser, 
  FaLock, 
  FaBell, 
  FaShieldAlt, 
  FaCamera, 
  FaSave,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";

export default function AdminSettings() {
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50/50 min-h-screen">
        <Topbar />
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your administrator profile and security preferences.
            </p>
          </div>

          <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Nav */}
            <div className="lg:col-span-1 space-y-2">
              <button 
                onClick={() => setActiveTab("account")}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all ${
                  activeTab === "account" 
                    ? "bg-green-800 text-white shadow-lg shadow-[green-800]/20" 
                    : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaUser /> Account
              </button>
              <button 
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all ${
                  activeTab === "password" 
                    ? "bg-green-800 text-white shadow-lg shadow-[green-800]/20" 
                    : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaLock /> Password
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all ${
                  activeTab === "notifications" 
                    ? "bg-green-800 text-white shadow-lg shadow-[green-800]/20" 
                    : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaBell /> Notifications
              </button>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === "account" && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                        {authUser?.profileImage ? (
                          <img src={authUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <FaUser className="text-4xl text-gray-300" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-green-800 text-white rounded-full border-2 border-white shadow-lg">
                        <FaCamera className="text-xs" />
                      </button>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-lg font-semibold text-slate-800">{authUser?.name || "Admin Profile"}</h3>
                      <p className="text-sm text-gray-400">Update your photo and personal details.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                        <input 
                          type="text" 
                          defaultValue={authUser?.name || ""}
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-800/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                        <input 
                          type="email" 
                          defaultValue={authUser?.email || ""}
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-800/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                      <input 
                        type="text" 
                        defaultValue={authUser?.phone || "+977 9801234567"}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-800/10"
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                    <button className="flex items-center gap-2 px-8 py-4 bg-green-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-[green-800]/20 hover:scale-[1.02] transition-transform">
                      <FaSave /> Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Security</h3>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Update Password</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Current Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-800/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-800/10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-800/10"
                        />
                      </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                    <button className="flex items-center gap-2 px-8 py-4 bg-green-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-[green-800]/20 hover:scale-[1.02] transition-transform">
                      <FaSave /> Update Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <FaBell />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Notifications</h3>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Preferences</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 italic">Notification settings coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

