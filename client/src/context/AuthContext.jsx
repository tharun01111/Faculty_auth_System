import { createContext, useState, useEffect, useCallback } from "react";

/* eslint-disable-next-line react-refresh/only-export-components */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(() => !!sessionStorage.getItem("role"));
  const [role, setRole] = useState(() => sessionStorage.getItem("role"));
  const [name, setName] = useState(() => sessionStorage.getItem("name"));
  const [lastLogin, setLastLogin] = useState(() => sessionStorage.getItem("lastLogin"));
  const [loading, _setLoading] = useState(false); // No longer need to load on mount since we init from storage

  const logout = useCallback(() => {
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("lastLogin");
    sessionStorage.removeItem("name");
    
    setIsAuth(false);
    setRole(null);
    setName(null);
    setLastLogin(null);
  }, []);

  const login = (newRole, newLastLogin, newName) => {
    sessionStorage.setItem("role", newRole);
    if (newLastLogin) sessionStorage.setItem("lastLogin", newLastLogin);
    if (newName) sessionStorage.setItem("name", newName);
    
    setIsAuth(true);
    setRole(newRole);
    if (newLastLogin) setLastLogin(newLastLogin);
    if (newName) setName(newName);
  };

  useEffect(() => {
    // 4. Listen for API unauthorized events
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuth, role, name, lastLogin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
