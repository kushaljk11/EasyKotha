import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      logout();
    }
  };

  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/login", {
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
    const res = await fetch("http://localhost:5000/api/register", {
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
    <AuthContext.Provider value={{ user, token, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
