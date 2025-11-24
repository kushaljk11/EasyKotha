/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      toast.success("Login successful!");

      if (data.token) localStorage.setItem("token", data.token);

      // Delay redirect for toast
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row items-center md:items-stretch justify-center md:justify-start">

      {/* LEFT SIDE */}
      <div
        className="w-full md:w-1/2 relative flex flex-col items-center justify-center py-8 md:py-0"
        style={{ backgroundColor: "#3E8847" }}
      >
        {/* Logo */}
        <div className="absolute top-4 left-4 hidden md:block">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 text-center">
          Welcome back
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 w-11/12 md:w-3/4 max-w-sm mx-auto"
        >
          {/* Email */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="email" className="text-white font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-white border p-3 rounded-lg focus:ring-2 focus:ring-green-700"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="password" className="text-white font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-white border p-3 rounded-lg focus:ring-2 focus:ring-green-700"
            />
          </div>

          <p className="text-white text-center cursor-pointer hover:underline">
            Forgot password?
          </p>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-green-800 font-semibold text-xl p-3 rounded-lg
                       hover:bg-sky-500 hover:text-white transform hover:scale-105
                       transition duration-300 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Sign Up */}
        <p className="text-white text-center mt-2">
          Don’t have an account?
          <span
            className="text-black font-semibold cursor-pointer ml-1 hover:text-green-300"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div
        className="w-full md:w-1/2 bg-center bg-no-repeat hidden md:block"
        style={{
          backgroundImage: "url('/loginhuman.png')",
          backgroundSize: "75%",
        }}
      ></div>

      {/* TOAST */}
      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
