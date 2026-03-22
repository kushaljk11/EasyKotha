const normalize = (value = "") => String(value).trim().replace(/\/+$/, "");

export const API_BASE_URL = normalize(import.meta.env.VITE_API_BASE_URL || "");

export const API_ORIGIN = normalize(
  import.meta.env.VITE_API_ORIGIN ||
    (API_BASE_URL ? API_BASE_URL.replace(/\/api$/i, "") : "")
);

if (!API_BASE_URL) {
  console.error("Missing VITE_API_BASE_URL. Please set it in EasyKothaFrontend/.env.");
}

if (!API_ORIGIN) {
  console.error("Missing VITE_API_ORIGIN. Please set it in EasyKothaFrontend/.env.");
}
