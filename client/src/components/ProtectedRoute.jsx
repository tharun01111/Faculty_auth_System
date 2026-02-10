import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loading from "./Loading";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuth, role, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
