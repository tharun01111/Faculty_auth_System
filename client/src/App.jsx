import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
import AuthBoundary from "./utils/AuthBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyGate from "./services/PublicOnlyGate.jsx";

import PortalSelector from "./pages/PortalSelector.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import FacultyManagement from "./pages/FacultyManagement.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

/**
 * Role → Dashboard mapping (Phase 6 & 10)
 * To add a new role: add an entry here + a new protected route below.
 * No other changes needed.
 */
const roleRedirect = {
  admin: "/admin/dashboard",
  faculty: "/faculty/dashboard",
};

const DEFAULT_REDIRECT = "/login";

function AppRoutes() {
  const { isAuth, role } = useContext(AuthContext);
  const landingPath = roleRedirect[role] ?? DEFAULT_REDIRECT;

  return (
    <Routes>
      {/* Root resolver — sends authenticated users to their dashboard */}
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

      {/* Phase 4 — Portal Selector (PUBLIC ONLY) */}
      <Route
        path="/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <PortalSelector />
          </PublicOnlyGate>
        }
      />

      {/* Phase 4 — Admin Login (PUBLIC ONLY) */}
      <Route
        path="/admin/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <Login expectedRole="admin" />
          </PublicOnlyGate>
        }
      />

      {/* Phase 4 — Faculty Login (PUBLIC ONLY) */}
      <Route
        path="/faculty/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <Login expectedRole="faculty" />
          </PublicOnlyGate>
        }
      />

      {/* Phase 9 — Unauthorized page */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Phase 6 — Admin Protected Section */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/faculty" element={<FacultyManagement />} />
      </Route>

      {/* Phase 6 — Faculty Protected Section */}
      <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      </Route>

      {/* Fallback — unknown routes go to root resolver */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/*
          Phase 6 — AuthBoundary sits between AuthProvider and Routes.
          Prevents routing until auth state is rehydrated from sessionStorage.
          Eliminates the flash-redirect-to-login for authenticated users.
        */}
        <AuthBoundary>
          <AppRoutes />
        </AuthBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
