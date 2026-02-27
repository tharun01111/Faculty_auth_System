import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Button } from "./ui/button";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();                 // ✅ Clears token + role from sessionStorage & resets AuthContext
    navigate("/login", { replace: true }); // ✅ Redirect — replace so back button won't re-enter dashboard
  };

  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;

