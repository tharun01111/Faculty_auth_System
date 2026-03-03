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
import RegisterFaculty from "./pages/RegisterFaculty.jsx";
import SystemLogs from "./pages/SystemLogs.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

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
          <PublicOnlyGate redirectTo={landingPath}>
            <PortalSelector />
          </PublicOnlyGate>
        }
      />

      <Route
        path="/admin/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <Login expectedRole="admin" />
          </PublicOnlyGate>
        }
      />

      <Route
        path="/faculty/login"
        element={
          <PublicOnlyGate redirectTo={landingPath}>
            <Login expectedRole="faculty" />
          </PublicOnlyGate>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/faculty" element={<FacultyManagement />} />
        <Route path="/admin/register-faculty" element={<RegisterFaculty />} />
        <Route path="/admin/logs" element={<SystemLogs />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthBoundary>
          <AppRoutes />
        </AuthBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
