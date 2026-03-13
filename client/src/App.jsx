import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import NProgress from "nprogress";
import { Toaster } from "sonner";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import PortalSelector from "./pages/PortalSelector.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import FacultyManagement from "./pages/FacultyManagement.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import FacultyProfile from "./pages/FacultyProfile.jsx";
import RegisterFaculty from "./pages/RegisterFaculty.jsx";
import SystemLogs from "./pages/SystemLogs.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

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

function AppRoutes() {
  const { isAuth, role } = useContext(AuthContext);
  const landingPath = roleRedirect[role] ?? DEFAULT_REDIRECT;

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

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/faculty" element={<FacultyManagement />} />
        <Route path="/admin/register-faculty" element={<RegisterFaculty />} />
        <Route path="/admin/logs" element={<SystemLogs />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/profile" element={<FacultyProfile />} />
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
