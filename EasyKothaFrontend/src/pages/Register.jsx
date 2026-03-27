// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { User, Mail, Lock, Phone, UserCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_ORIGIN } from "../config/env";

if (!API_ORIGIN) {
  throw new Error("VITE_API_ORIGIN is required in EasyKothaFrontend/.env");
}

export default function Register() {
  const { t } = useTranslation();
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
      return toast.error(t("auth.register.fillRequired"));
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
    <div className="h-dvh w-full overflow-hidden bg-slate-100 font-sans md:flex">
      {/* LEFT SIDE - FORM */}
      <div className="flex h-full w-full flex-col items-center justify-center p-6 md:w-1/2 md:p-10 lg:p-12">
        <div className="mb-6 text-center">
          <h1 className="mt-3 text-4xl font-semibold text-green-800">{t("auth.register.createAccount")}</h1>
          <p className="mt-2 text-gray-600">
            {t("auth.register.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t("auth.register.fullName")}
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
              placeholder={t("auth.common.email")}
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
              placeholder={t("auth.common.password")}
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
              placeholder={t("auth.register.phone")}
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
              <option value="LANDLORD">{t("auth.common.landlord")}</option>
              <option value="TENANT">{t("auth.common.tenant")}</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-green-800 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-900 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningUp ? t("auth.register.creatingAccount") : t("auth.register.createAccount")}
          </button>

          {/* Social login */}
          <div className="flex items-center my-4">
            <div className="grow border-t border-gray-200"></div>
            <span className="mx-3 text-gray-400 text-xs uppercase">{t("auth.register.orSignUpWith")}</span>
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
            {t("auth.register.alreadyAccount")} {" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-green-800 font-bold hover:underline"
            >
              {t("auth.common.login")}
            </button>
          </p>
        </form>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="relative hidden h-full w-1/2 items-center justify-center overflow-hidden bg-green-800 md:flex">
        <img
          src="/register.png"
          alt="home illustration"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
