import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress (optional, e.g., turn off the spinner)
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    NProgress.start();
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    NProgress.done();
    return response;
  },
  (error) => {
    NProgress.done();
    const status = error.response?.status;
    const originalRequest = error.config;

    // Do not intercept login requests — prevent redirect loop
    const isLoginRequest = originalRequest?.url?.includes("/login");

    if (!isLoginRequest) {
      if (status === 401) {
        // Dispatch event for React to handle SPA-friendly redirect
        window.dispatchEvent(new Event("auth:unauthorized"));
      } else if (status === 403) {
        window.dispatchEvent(new Event("auth:forbidden"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;