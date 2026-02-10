import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loading from "../components/Loading";

const PublicOnlyGate = ({ redirectTo, children }) => {
  const { isAuth, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  if (isAuth) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicOnlyGate;
