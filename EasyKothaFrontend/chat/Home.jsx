import { useChatStore } from "../src/store/useChatStore";
import { useAuthStore } from "../src/store/useAuthStore";
import Sidebar from "./Sidebar";
import NoChatSelected from "./components/skeletons/NoChatSelection";
import ChatContainer from "./ChatContainer";
import TenantTopbar from "../src/components/Topbar";
import AdminTopbar from "../src/admin/Topbar";
import LandlordTopbar from "../src/landlord/LandlordTopbar";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const backPath = useMemo(() => {
    if (authUser?.role === "ADMIN") return "/admin/dashboard";
    if (authUser?.role === "LANDLORD") return "/landlord/dashboard";
    return "/tenant/dashboard";
  }, [authUser?.role]);

  const backLabel = useMemo(() => {
    if (authUser?.role === "ADMIN") return "Back to Admin Dashboard";
    if (authUser?.role === "LANDLORD") return "Back to Landlord Dashboard";
    return "Back to Tenant Dashboard";
  }, [authUser?.role]);

  const handleBack = () => {
    navigate(backPath);
  };

  return (
    <div className="h-dvh flex flex-col bg-gray-50 font-semibold">
      {/* Topbar */}
      {authUser?.role === "TENANT" && <TenantTopbar />}
      {authUser?.role === "ADMIN" && <AdminTopbar />}
      {authUser?.role === "LANDLORD" && <LandlordTopbar />}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden bg-[#eef3f8] px-3 pb-3 pt-4 sm:px-4 md:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d6e0ea] bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-800/10 p-2 text-green-800">
              <img
                src="/EasyKothaColoured-02.png"
                alt="EasyKotha"
                className="h-5 w-5 object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 sm:text-lg">Messages</h1>
              <p className="text-xs font-semibold text-slate-500 sm:text-sm">Chat with your contacts in real time</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <FaArrowLeft className="text-xs" />
            <span>{backLabel}</span>
          </button>
        </div>

        <div className="flex h-[calc(100%-68px)] overflow-hidden rounded-2xl border border-[#dbe5ef] bg-white/30">
          {/* Sidebar */}
          <div
            className={`m-3 shrink-0 rounded-2xl border border-gray-200/70 bg-white shadow-md ${
              selectedUser ? "hidden md:block md:w-[310px]" : "w-[calc(100%-24px)] md:w-[310px]"
            }`}
          >
            <Sidebar />
          </div>

          {/* Chat Content */}
          <div
            className={`m-3 flex-1 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-md ${
              selectedUser ? "block" : "hidden md:block"
            }`}
          >
            {!selectedUser ? (
              <NoChatSelected onBack={handleBack} backLabel={backLabel} />
            ) : (
              <ChatContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
