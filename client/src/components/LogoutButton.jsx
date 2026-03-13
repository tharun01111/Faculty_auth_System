import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = ({ compact = false }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        title="Logout"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
