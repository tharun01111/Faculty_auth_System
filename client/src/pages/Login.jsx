import api from "../services/api.js";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const Login = ({ expectedRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault(); // allow form submission
    setError(null);
    setLoading(true);

    try {
      const res = await api.post(
        `${import.meta.env.VITE_SERVER_URL}/${expectedRole}/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const { token, role } = res.data;

      console.log("LOGIN SUCCESS:", { role, expectedRole });

      // ROLE VALIDATION
      const isAuthorized =
        role === expectedRole || (expectedRole === "faculty" && role === "user");

      if (!isAuthorized) {
        setError("You are not authorized for this portal.");
        setLoading(false); 
        return;
      }

      // ✅ Update auth context
      login(token, role);

      // ✅ Redirect
      navigate(`/${expectedRole}/dashboard`);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";

      setError(message);
    } finally {
      if (!error) setLoading(false); 
    }
  };

  const roleTitle = expectedRole === "admin" ? "Admin Portal" : "Faculty Portal";

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{roleTitle}</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
