// Shared runtime config fallback for production builds.
// In local dev, Vite env vars and the dev proxy keep everything pointed at
// localhost. On Render, if VITE_API_URL is missing, fall back to the known
// backend service URL so hosted requests still reach the API.

const LOCAL_API_ORIGIN = "http://localhost:5000";
const PRODUCTION_API_ORIGIN = "https://devbhoomi-bandhan-backend.onrender.com";

export const resolveApiOrigin = () => {
  const configured = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window === "undefined") {
    return LOCAL_API_ORIGIN;
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return LOCAL_API_ORIGIN;
  }

  return PRODUCTION_API_ORIGIN;
};
