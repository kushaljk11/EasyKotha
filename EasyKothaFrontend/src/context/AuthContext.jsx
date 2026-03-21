import { createContext, useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://easykotha.onrender.com/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch user");
      setUser(data.user);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setToken(data.token);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const registerUser = async (name, email, password, role) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setToken(data.token);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
