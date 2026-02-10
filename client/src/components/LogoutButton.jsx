import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "./ui/button";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);

  return <Button variant="destructive" onClick={logout}>Logout</Button>;
};

export default LogoutButton;
