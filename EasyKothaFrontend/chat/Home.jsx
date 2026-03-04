import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Sidebar from "../chat/components/Sidebar";
import NoChatSelected from "../chat/components/NoChatSelected";
import ChatContainer from "../chat/ChatContainer";
import TenantTopbar from "../tenants/TenantTopbar";
import AdminTopbar from "../admin/Topbar";
// import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  // const navigate = useNavigate();

  // const handleBack = () => {
  //   if (authUser?.role === "TENANT") {
  //     navigate("/tenant/dashboard");
  //   } else if (authUser?.role === "ADMIN") {
  //     navigate("/admin/dashboard");
  //   } else if (authUser?.role === "LANDLORD") {
  //     navigate("/landlord/dashboard");
  //   }
  // };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Topbar */}
      {authUser?.role === "TENANT" && <TenantTopbar />}
      {authUser?.role === "ADMIN" && <AdminTopbar />}
      {authUser?.role === "LANDLORD" && <TenantTopbar />}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden bg-[#f1f5f9]">
        {/* Sidebar */}
        <div className="ml-6 my-6 flex flex-col gap-4">
          <div className="w-85 border border-gray-200/50 rounded-2xl bg-white overflow-hidden shadow-xl shadow-gray-200/50 h-full">
            <Sidebar />
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col bg-white ml-2 mr-6 my-6 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-200/50">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};
export default HomePage;
