import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loading from "../components/Loading";

/**
 * AuthBoundary — Phase 6 outer wrapper
 *
 * Sits between <AuthProvider> and <Routes>.
 * Holds rendering until AuthContext has finished rehydrating
 * from sessionStorage (the `loading` flag).
 *
 * WHY THIS EXISTS:
 * Without this, routes render before auth state is known.
 * That causes a flash where ProtectedRoute briefly sees
 * isAuth=false and redirects to /login — even for valid sessions.
 */
const AuthBoundary = ({ children }) => {
  const { loading } = useContext(AuthContext);

  // ✅ Block all routing until auth state is restored from sessionStorage
  if (loading) {
    return <Loading />;
  }

  return children;
};

export default AuthBoundary;
