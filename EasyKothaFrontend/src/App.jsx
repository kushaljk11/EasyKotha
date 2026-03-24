import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
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
import AdminPayment from "./admin/AdminPayment";
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
import Explore from "./pages/Explore";
import { useAuthStore } from "./store/useAuthStore";
import Loader from "./components/Loader";
import ProfilePage from "./pages/ProfilePage";
import Detailpage from "./components/Detailedpage";
import HomePage from "../chat/Home";
import Chatbot from "./components/chatbot";
import PaymentForm from "./pages/payment/PaymentForm";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentFailure from "./pages/payment/PaymentFailure";
import TenantDashboard from "./tenants/TenantDashboard";
import TenantHome from "./tenants/Home";
import TenantBooking from "./tenants/Booking";
import TenantFavourate from "./tenants/Favourate";
import TenantMessage from "./tenants/Message";
import TenantProfile from "./tenants/Profile";
import NotFound from "./pages/NotFound";

function AnimatedRouteContainer() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Routes location={location}>
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
                <Navigate to="/tenant/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/dashboard"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/home"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <TenantHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/explore"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <Explore />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/bookings"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <TenantBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/saved"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <TenantFavourate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/favourites"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <Navigate to="/tenant/saved" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/messages"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <TenantMessage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tenant/profile"
            element={
              <ProtectedRoute roles={["TENANT"]}>
                <TenantProfile />
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
            path="/admin/payments"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminPayment />
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
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute roles={["ADMIN", "TENANT", "LANDLORD"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute roles={["ADMIN", "TENANT", "LANDLORD"]}>
                <PaymentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute roles={["ADMIN", "TENANT", "LANDLORD"]}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-failure"
            element={
              <ProtectedRoute roles={["ADMIN", "TENANT", "LANDLORD"]}>
                <PaymentFailure />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
        <AnimatedRouteContainer />
        <Chatbot/>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
