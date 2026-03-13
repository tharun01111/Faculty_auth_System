import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Read role from storage (cookie handles token)
    const storedRole = sessionStorage.getItem("role");

    // 2. Validate existence
    if (storedRole) {
      setIsAuth(true);
      setRole(storedRole);
      const storedLastLogin = sessionStorage.getItem("lastLogin");
      if (storedLastLogin) setLastLogin(storedLastLogin);
      const storedName = sessionStorage.getItem("name");
      if (storedName) setName(storedName);
    }

    // 3. Finish loading
    setLoading(false);

    // 4. Listen for API unauthorized events
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
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

  const logout = () => {
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("lastLogin");
    sessionStorage.removeItem("name");
    
    setIsAuth(false);
    setRole(null);
    setName(null);
    setLastLogin(null);
  };

  return (
    <AuthContext.Provider value={{ isAuth, role, name, lastLogin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
