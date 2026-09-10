import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// All requests go through the Next.js rewrite (/api/backend/*).
// The browser never talks directly to the backend origin.
export const api = axios.create({
  baseURL: "/api/backend",
  headers: { "Content-Type": "application/json" },

  // Render Free services can take time to wake from hibernation.
  // Give a request enough time to survive a cold start.
  timeout: 90000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh"];

// Render Free may return 429 while the service is waking.
// Retry only infrastructure-level 429 responses.
// We deliberately keep this limited so we don't hammer Render.
const MAX_RENDER_RETRIES = 4;

function isRenderHibernate429(error: AxiosError) {
  return (
    error.response?.status === 429 &&
    (
      error.response.headers?.["x-render-routing"] ===
        "hibernate-rate-limited" ||
      error.response.headers?.["x-render-origin-server"] === "cloudflare"
    )
  );
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config = error.config as
      | (InternalAxiosRequestConfig & { __renderRetry?: number })
      | undefined;

    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      config?.url?.includes(path)
    );

    /*
     * Render Free cold-start protection.
     *
     * If Render says the service is being hibernate-rate-limited,
     * wait progressively longer before retrying:
     *
     * 1st retry: 2s
     * 2nd retry: 4s
     * 3rd retry: 8s
     * 4th retry: 16s
     *
     * This prevents a sleeping service from being hammered by
     * simultaneous browser requests.
     */
    if (
      config &&
      isRenderHibernate429(error) &&
      (config.__renderRetry ?? 0) < MAX_RENDER_RETRIES
    ) {
      const retryCount = config.__renderRetry ?? 0;
      config.__renderRetry = retryCount + 1;

      const delay = Math.pow(2, retryCount + 1) * 1000;

      await new Promise((resolve) => setTimeout(resolve, delay));

      return api(config);
    }

    // Normal authenticated-session expiry handling.
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      typeof window !== "undefined"
    ) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
