import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Read token and role from storage
    const token = sessionStorage.getItem("token");
    const storedRole = sessionStorage.getItem("role");

    // 2. Validate existence
    if (token && storedRole) {
      setIsAuth(true);
      setRole(storedRole);
    }

    // 3. Finish loading
    setLoading(false);
  }, []);

  const login = (token, newRole) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", newRole);
    setIsAuth(true);
    setRole(newRole);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setIsAuth(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuth, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
