import axios from "axios";
import { API_BASE_URL } from "../config/env";

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required in EasyKothaFrontend/.env");
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Adds auth token to every request when user is logged in.
 */
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore localStorage access errors and continue request.
  }
  return config;
});

export default axiosInstance;
