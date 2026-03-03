import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import ThemeToggle from "../components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  School,
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const RegisterFaculty = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationErr = validate();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/faculty/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setSuccess(res.data.message || "Faculty registered successfully.");
      setForm({ name: "", email: "", password: "", confirm: "" });
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register faculty.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin Portal
              </p>
              <h1 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-base">
                Register Faculty
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:inline">
              ● Admin
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left info panel */}
          <div className="lg:col-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <UserPlus className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Add New Faculty
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a new faculty account. The account will be immediately
              active and the faculty member can log in using these credentials.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Password is securely hashed (bcrypt)",
                "Account is active immediately",
                "Faculty can log in at the Faculty Portal",
                "You can unlock/manage accounts later",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Faculty Details</CardTitle>
                <CardDescription>
                  All fields are required. Use the faculty member's institutional email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-5">
                  {/* Name */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <User className="h-3.5 w-3.5" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={form.name}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="faculty@college.edu"
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        disabled={loading}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="confirm" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" /> Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        name="confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat password"
                        value={form.confirm}
                        onChange={handleChange}
                        disabled={loading}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength visual */}
                  {form.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              form.password.length >= n * 3
                                ? n <= 2 ? "bg-amber-500" : "bg-emerald-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {form.password.length < 6
                          ? "Too short"
                          : form.password.length < 9
                          ? "Weak"
                          : form.password.length < 12
                          ? "Good"
                          : "Strong"}
                      </p>
                    </div>
                  )}

                  {/* Error / Success */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {success} Redirecting…
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/admin/dashboard")}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 gap-2" disabled={loading || !!success}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Registering…
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Register Faculty
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFaculty;
