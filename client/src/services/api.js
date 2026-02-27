import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Do not intercept login requests — prevent redirect loop
    const isLoginRequest = originalRequest?.url?.includes("/login");

    if (!isLoginRequest) {
      if (status === 401) {
        // ✅ Token expired or invalid — clear session, return to login
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        window.location.href = "/login";
      } else if (status === 403) {
        // ✅ Valid token but insufficient role — go to unauthorized page
        window.location.href = "/unauthorized";
      }
    }

    return Promise.reject(error);
  }
);

export default api;