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
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ Relative path — api.js already has baseURL set from VITE_SERVER_URL
      const res = await api.post(`/${expectedRole}/login`, { email, password });

      const { token, role } = res.data;

      // ✅ ROLE VALIDATION — Frontend enforces portal separation
      // This catches: admin logging into faculty portal, or vice versa
      if (role !== expectedRole) {
        setError("You are not authorized for this portal.");
        return;
      }

      // ✅ Store auth state in context (persisted via sessionStorage internally)
      login(token, role);

      // ✅ Navigate to the correct role dashboard
      navigate(`/${expectedRole}/dashboard`);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      setError(message);
    } finally {
      // ✅ Always reset loading — regardless of success or error
      setLoading(false);
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
