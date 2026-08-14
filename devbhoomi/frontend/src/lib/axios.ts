import axios from "axios";

// In local dev, Vite proxies "/api" to localhost:5000 (see vite.config.ts),
// so a relative "/api" path works fine there.
// In production (Render), the frontend is a static site and the backend is
// a separate service on its own URL — there is no proxy — so we need the
// full backend origin. Set VITE_API_URL in the frontend's Render env vars to
// the backend's URL, e.g. https://your-backend.onrender.com
// (same variable used by src/lib/media.ts and ProfilePreview.tsx for photo URLs)
const API_ORIGIN = import.meta.env.VITE_API_URL || "";
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try to refresh the access token once, then retry the original request.
let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
if (
  error.response?.status === 401 &&
  !original._retry &&
  !original.url?.includes("/auth/login") &&
  !original.url?.includes("/auth/signup") &&
  !original.url?.includes("/auth/refresh")
) {

      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
        return api(original);
      }

      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");

if (!refreshToken) {
  return Promise.reject(error);
}

const { data } = await axios.post(
  `${API_BASE_URL}/auth/refresh`,
  { refreshToken }
);
        localStorage.setItem("accessToken", data.data.accessToken);
        queue.forEach((resolve) => resolve());
        queue = [];
        return api(original);
      } catch (refreshError) {
  // Refresh token is invalid/expired: the stale session can't be recovered.
  // Clear both tokens and send the user to a real login screen instead of
  // leaving them in a "logged in but every request silently fails" state.
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }

  return Promise.reject(refreshError);
} finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
