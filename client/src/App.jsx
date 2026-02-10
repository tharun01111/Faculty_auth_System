import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyGate from "./services/PublicOnlyGate.jsx";

import PortalSelector from "./pages/PortalSelector.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

import FacultyDashboard from "./pages/FacultyDashboard.jsx";

const roleRedirect = {
  admin: "/admin/dashboard",
  faculty: "/faculty/dashboard",
  user: "/faculty/dashboard", // Default role for faculty is 'user'
};

const DEFAULT_REDIRECT = "/login";

function AppRoutes() {
  const { isAuth, role } = useContext(AuthContext);
  const landingPath = roleRedirect[role] ?? DEFAULT_REDIRECT;

  return (
    <Routes>
      {/* Root resolver */}
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

      {/* Portal Selector (PUBLIC-ONLY) */}
      <Route
        path="/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <PortalSelector />
          </PublicOnlyGate>
        }
      />

      {/* Admin Login (PUBLIC-ONLY) */}
      <Route
        path="/admin/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <Login expectedRole="admin" />
          </PublicOnlyGate>
        }
      />

      {/* Faculty Login (PUBLIC-ONLY) */}
      <Route
        path="/faculty/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <Login expectedRole="faculty" />
          </PublicOnlyGate>
        }
      />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Protected Section */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Faculty Protected Section */}
      <Route element={<ProtectedRoute allowedRoles={["user", "faculty"]} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
