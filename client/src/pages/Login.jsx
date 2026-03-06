import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api.js";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import ThemeToggle from "../components/ThemeToggle";
import {
  ShieldCheck,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  LogIn,
  Loader2,
} from "lucide-react";

const roleConfig = {
  admin: {
    label: "Admin Portal",
    icon: ShieldCheck,
    iconClass: "text-indigo-500",
    bg: "bg-indigo-500/10",
    accent: "text-indigo-500",
  },
  faculty: {
    label: "Faculty Portal",
    icon: GraduationCap,
    iconClass: "text-sky-500",
    bg: "bg-sky-500/10",
    accent: "text-sky-500",
  },
};

const Login = ({ expectedRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const config = roleConfig[expectedRole] ?? roleConfig.faculty;
  const Icon = config.icon;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post(`${expectedRole}/login`, { email, password });
      const { token, role, lastLogin } = res.data;

      const isAuthorized =
        role === expectedRole || (expectedRole === "faculty" && role === "user");

      if (!isAuthorized) {
        setError("You are not authorized for this portal.");
        triggerShake();
        return;
      }

      login(token, role, lastLogin);
      navigate(`/${expectedRole}/dashboard`);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed";
      setError(message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // Determine error banner style based on error type
  const isLocked = error?.toLowerCase().includes("locked");
  const isExpired = error?.toLowerCase().includes("expired");

  const errorBannerClass = isLocked
    ? "flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400"
    : "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Theme toggle pill — top right */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground select-none">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Back button — top left */}
      <button
        onClick={() => navigate("/login")}
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="w-full max-w-sm">
        {/* Role badge */}
        <div className="mb-6 text-center">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${config.bg}`}>
            <Icon className={`h-6 w-6 ${config.iconClass}`} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {config.label}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to access the dashboard
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@college.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className={`${errorBannerClass} ${shake ? "animate-shake" : ""}`}
                style={
                  shake
                    ? { animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both" }
                    : {}
                }
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button className="w-full gap-2" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 Faculty Auth System
        </p>
      </div>

      {/* Shake keyframe — injected inline since we can't modify global CSS here */}
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(3px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
