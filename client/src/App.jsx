import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import NProgress from "nprogress";
import { Toaster } from "sonner";
import api from "./services/api.js";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import PortalSelector from "./pages/PortalSelector.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import FacultyManagement from "./pages/FacultyManagement.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import FacultyProfile from "./pages/FacultyProfile.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import RegisterFaculty from "./pages/RegisterFaculty.jsx";
import SystemLogs from "./pages/SystemLogs.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";

const roleRedirect = {
  admin: "/admin/dashboard",
  faculty: "/faculty/dashboard",
};

const DEFAULT_REDIRECT = "/login";

function RouteChangeListener() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    NProgress.done();
  }, [location.pathname]);

  return null;
}

function hexToHsl(hex) {
  if (!hex || !hex.startsWith("#")) return hex;
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function AppRoutes() {
  const { isAuth, role } = useContext(AuthContext);
  const landingPath = roleRedirect[role] ?? DEFAULT_REDIRECT;

  useEffect(() => {
    const applyBranding = async () => {
      try {
        const { data } = await api.get("/admin/branding");
        if (data.primaryColor) {
          const hsl = hexToHsl(data.primaryColor);
          document.documentElement.style.setProperty("--primary", hsl);
          document.documentElement.style.setProperty("--ring", hsl);
        }
      } catch (err) {
        console.error("Failed to load branding:", err);
      }
    };
    applyBranding();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuth ? (
            <Navigate to={landingPath} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          <ProtectedRoute type="public" redirectTo={landingPath}>
            <PortalSelector />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/login"
        element={
          <ProtectedRoute type="public" redirectTo={landingPath}>
            <Login expectedRole="admin" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/login"
        element={
          <ProtectedRoute type="public" redirectTo={landingPath}>
            <Login expectedRole="faculty" />
          </ProtectedRoute>
        }
      />

      {/* Faculty password reset — fully public, no auth gate */}
      <Route path="/faculty/forgot-password" element={<ForgotPassword />} />
      <Route path="/faculty/reset-password/:token" element={<ResetPassword />} />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/faculty" element={<FacultyManagement />} />
        <Route path="/admin/register-faculty" element={<RegisterFaculty />} />
        <Route path="/admin/logs" element={<SystemLogs />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/profile" element={<FacultyProfile />} />
        <Route path="/faculty/attendance" element={<AttendancePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RouteChangeListener />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster theme="system" position="bottom-right" richColors />
    </BrowserRouter>
  );
}

export default App;
