import React, { useEffect, useState } from "react";

const AuthBoundary = ({ children }) => {
  const [authStatus, setAuthStatus] = useState("unknown");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = sessionStorage.getItem("token");
      const role = sessionStorage.getItem("role");

      if (token && role) {
        setAuthStatus("authenticated");
        setUserRole(role);
      } else {
        setAuthStatus("unauthenticated");
        setUserRole(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event (from Login.jsx)
    window.addEventListener("authUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authUpdated", handleStorageChange);
    };
  }, []);

  if (authStatus === "unknown") {
    return (
      <div style={{ textAlign: "center", marginTop: "40vh" }}>Loading...</div>
    );
  }

  return children({ authStatus, userRole });
};

export default AuthBoundary;
