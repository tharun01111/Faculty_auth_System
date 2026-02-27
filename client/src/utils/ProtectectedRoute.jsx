import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loading from "../components/Loading";

function ProtectedRoute({ children, requiredRole }) {
  const { loading, isAuth, role } = useContext(AuthContext);

  //  Wait until auth restore finishes
  if (loading) {
    return <Loading />;
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
