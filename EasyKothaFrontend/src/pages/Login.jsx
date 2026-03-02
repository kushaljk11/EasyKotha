import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {login, isLoggingIn, authUser, checkAuth } = useAuthStore();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  // Handle Google OAuth token from URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      checkAuth();
      // Remove token from URL for clean look
      navigate("/login", { replace: true });
    }
  }, [searchParams, checkAuth, navigate]);

  // Redirect if already logged in
  useEffect(() => {
    if (authUser) {
      if (authUser.role === "ADMIN") navigate("/admin/dashboard");
      else if (authUser.role === "LANDLORD") navigate("/landlord/dashboard");
      else navigate("/tenant/dashboard");
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");

    await login({ email, password });
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/oauth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:5000/api/oauth/facebook";
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row items-center md:items-stretch justify-center md:justify-start overflow-hidden font-sans">
      {/* LEFT SIDE - FORM */}
      <div
        className="w-full md:w-1/2 relative flex flex-col items-center justify-center p-8 lg:p-12 bg-green-800"
      >
        {/* Logo */}
        <div className="absolute top-8 left-8 hidden md:block">
          <img src="/EasyKotha2-06.png" alt="Logo" className="h-16 w-auto" />
        </div>

        <div className="w-full max-w-sm">
          <div className="text-center md:text-center mb-5">
            <h2 className="text-4xl font-semibold text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-teal-100/70  text-sm">
              Please enter your details to sign in
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-white text-sm font-semibold ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-800  transition-colors duration-200">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/10 border border-white/20 p-3 pl-10 rounded-xl text-white placeholder-teal-100/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-white text-sm font-semibold ml-1">
                  Password
                </label>
                <button type="button" className="text-teal-200 text-xs font-medium hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-800  transition-colors duration-200">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 p-3 pl-10 rounded-xl text-white placeholder-teal-100/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-4 w-full bg-white text-green-800 font-bold text-lg py-3 rounded-xl
                       hover:bg-teal-50 transform active:scale-[0.98]
                       transition-all duration-200 shadow-xl disabled:opacity-60"
            >
              {isLoggingIn ? "Logging in..." : "Sign In"}
            </button>

            <div className="flex items-center my-6">
              <div className="grow border-t border-white/20"></div>
              <span className="px-3 text-teal-100/50 text-xs uppercase tracking-widest font-medium">Or</span>
              <div className="grow border-t border-white/20"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center bg-white/10 border border-white/20 text-white font-semibold py-2.5 rounded-xl
                           hover:bg-white/20 transition-all duration-200"
              >
                <FaGoogle className="mr-2 text-red-400" />
                Google
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                className="flex items-center justify-center bg-white/10 border border-white/20 text-white font-semibold py-2.5 rounded-xl
                           hover:bg-white/20 transition-all duration-200"
              >
                <FaFacebookF className="mr-2 text-blue-400" />
                Facebook
              </button>
            </div>
          </form>

          {/* Sign Up */}
          <p className="text-teal-100/70 text-center mt-12 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-white font-bold hover:underline transition-all"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div
        className="w-full md:w-1/2 bg-[#f8fafc] bg-center bg-no-repeat hidden md:block relative"
        style={{
          backgroundImage: "url('/loginhuman.png')",
          backgroundSize: "80%",
        }}
      >
        <div className="absolute bottom-12 right-12 text-right opacity-10 pointer-events-none">
          <h3 className="text-green-800 text-6xl font-black italic tracking-tighter">SAJILO</h3>
        </div>
      </div>
    </div>
  );
}
