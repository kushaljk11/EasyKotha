// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { User, Mail, Lock, Phone, UserCircle } from "lucide-react";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://easykotha.onrender.com";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("LANDLORD");

  const { signup, isSigningUp, authUser, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      checkAuth();
      navigate("/register", { replace: true });
    }
  }, [searchParams, checkAuth, navigate]);

  useEffect(() => {
    if (authUser) {
      if (authUser.role === "ADMIN") navigate("/admin/dashboard");
      else if (authUser.role === "LANDLORD") navigate("/landlord/dashboard");
      else navigate("/tenant/dashboard");
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      return toast.error("Please fill in all required fields");
    }
    await signup({ name, email, password, role, phone });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_ORIGIN}/api/oauth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_ORIGIN}/api/oauth/facebook`;
  };

  return (
    <div className="min-h-screen w-full flex font-sans bg-gray-50">
      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-12">
        <h1 className="text-4xl font-extrabold text-green-800 mb-2 text-center">
          Create Account
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Join thousands finding their perfect home with Sajilo
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-800/30 focus:border-green-800 transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-800/30 focus:border-green-800 transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-800/30 focus:border-green-800 transition-all"
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-800/30 focus:border-green-800 transition-all"
            />
          </div>

          {/* Role */}
          <div className="relative">
            <UserCircle className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-800/30 focus:border-green-800 transition-all"
            >
              <option value="LANDLORD">Landlord</option>
              <option value="TENANT">Tenant</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-green-800 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-900 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningUp ? "Creating Account..." : "Create Account"}
          </button>

          {/* Social login */}
          <div className="flex items-center my-4">
            <div className="grow border-t border-gray-200"></div>
            <span className="mx-3 text-gray-400 text-xs uppercase">or sign up with</span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 shadow-sm font-medium transition-all"
            >
              <FaGoogle className="mr-2 text-red-500" /> Google
            </button>
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 shadow-sm font-medium transition-all"
            >
              <FaFacebookF className="mr-2 text-blue-600" /> Facebook
            </button>
          </div>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-green-800 font-bold hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden md:flex w-1/2 bg-green-800 justify-center items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <img
          src="/register.png"
          alt="home illustration"
          className="w-full transform hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  );
}
