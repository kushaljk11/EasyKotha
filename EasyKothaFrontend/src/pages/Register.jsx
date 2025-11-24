// src/pages/Register.jsx
import React, { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("LANDLORD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }
      if (data.token) localStorage.setItem("token", data.token);
      window.location.href = "/";
    // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg flex w-[900px] overflow-hidden">
        {/* LEFT SIDE FORM */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-semibold text-green-700 mb-6">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg bg-gray-100"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-lg bg-gray-100"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg bg-gray-100"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded-lg bg-gray-100"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Account type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded-lg bg-gray-100"
              >
                <option value="LANDLORD">LANDLORD</option>
                <option value="TENANT">TENANT</option>
              </select>
            </div>

            {error && <p className="text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="text-center text-sm mt-2">
              Already have an account?{" "}
              <span className="text-green-600 font-medium cursor-pointer">
                Login
              </span>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE IMAGE + TEXT */}
        <div className="w-1/2 bg-green-700 text-white flex flex-col items-center justify-center relative">
          <h1 className="text-3xl font-bold">Your New Home</h1>
          <h2 className="text-xl mt-1">Awaits</h2>

          <img src="/register.png" alt="home" className="w-full mt-6" />
        </div>
      </div>
    </div>
  );
}