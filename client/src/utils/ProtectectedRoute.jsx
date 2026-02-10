import { Navigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

function ProtectedRoute({ children, requiredRole }) {
  const { loading, isAuth, role } = useAuth();

  //  Wait until auth restore finishes
  if (loading) {
    return null; 
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Allowed
  return children;
}

export default ProtectedRoute;
