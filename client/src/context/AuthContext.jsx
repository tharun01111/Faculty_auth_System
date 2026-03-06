import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Read token and role from storage
    const token = sessionStorage.getItem("token");
    const storedRole = sessionStorage.getItem("role");

    // 2. Validate existence
    if (token && storedRole) {
      setIsAuth(true);
      setRole(storedRole);
      const storedLastLogin = sessionStorage.getItem("lastLogin");
      if (storedLastLogin) setLastLogin(storedLastLogin);
    }

    // 3. Finish loading
    setLoading(false);
  }, []);

  const login = (token, newRole, newLastLogin) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", newRole);
    if (newLastLogin) sessionStorage.setItem("lastLogin", newLastLogin);
    setIsAuth(true);
    setRole(newRole);
    if (newLastLogin) setLastLogin(newLastLogin);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("lastLogin");
    setIsAuth(false);
    setRole(null);
    setLastLogin(null);
  };

  return (
    <AuthContext.Provider value={{ isAuth, role, lastLogin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
