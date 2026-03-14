import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React, { useEffect } from "react";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import TenantDashboard from "./tenants/TenantDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import UserManagement from "./admin/UserManagement";
import Property from "./admin/Property";
import PostApproval from "./admin/PostApproval";
import AdminBooking from "./admin/AdminBooking";
import LogsManagement from "./admin/LogsManagement";
import AdminSetting from "./admin/AdminSetting";
import LandlordDashboard from "./landlord/LandlordDashboard";
import LandlordListings from "./landlord/LandlordListings";
import Addlisting from "./landlord/Addlisting";
import LandlordBooking from "./landlord/Booking";
import LandlordProfile from "./landlord/Profile";
import LandlordExplore from "./landlord/LandlordExplore";
import Landing from "./pages/Landing";
import Aboutus from "./pages/Aboutus";
import ContactUs from "./pages/Contactus";
import { useAuthStore } from "./store/useAuthStore";
import Loader from "./components/Loader";
import ProfilePage from "./pages/ProfilePage";
import Detailpage from "./components/Detailedpage";
import HomePage from "../chat/Home";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Role anusar protected route */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                {/* <TenantDashboard /> */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          ></Route>

          <Route
            path="/landlord/add-listing"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <Addlisting />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/add-listing"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <Addlisting />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/messages"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <Navigate to="/chat" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute roles={["ADMIN", "TENANT", "LANDLORD"]}>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/listings"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <LandlordListings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/explore"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <LandlordExplore />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/bookings"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <LandlordBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/profile"
            element={
              <ProtectedRoute roles={["LANDLORD"]}>
                <LandlordProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute roles={["ADMIN", "TENANT", "LANDLORD"]}>
                <Detailpage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Property />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <PostApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <LogsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminSetting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["ADMIN", "TENANT", "LANDLORD"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
