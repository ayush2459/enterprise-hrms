import axios from "axios";
import Cookies from "js-cookie";

// All requests go through the Next.js rewrite (/api/backend/*) defined in
// next.config.ts, so the browser never talks to the backend origin
// directly — this keeps CORS simple and lets the backend stay unreachable
// from outside the Docker network in production.
export const api = axios.create({
  baseURL: "/api/backend",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints where a 401 means "bad credentials", not "your session
// expired" — these must NOT trigger the global logout/redirect below,
// or the specific error (wrong password, account locked, bad MFA code)
// never reaches the UI.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh"];

// On a 401 from an already-authenticated request, drop the stale token
// and bounce to login rather than looping silent failed requests
// (Section 7: session timeout / re-validation).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      error.config?.url?.includes(path)
    );

    if (error.response?.status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
