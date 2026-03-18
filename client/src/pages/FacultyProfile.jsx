import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api.js";
import ThemeToggle from "../components/ThemeToggle";
import LogoutButton from "../components/LogoutButton";
import PasswordStrength from "../components/PasswordStrength";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  User,
  ShieldCheck,
  Key,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  GraduationCap,
  BookMarked,
  Laptop,
  DoorOpen,
  Hash,
} from "lucide-react";

export default function FacultyProfile() {
  const navigate = useNavigate();
  const { name, role, lastLogin, logout: _logout } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    api.get("/faculty/me")
      .then(res => setProfileData(res.data))
      .catch(() => {});
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch("/faculty/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccess(res.data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const formatLastLogin = (isoString) => {
    if (!isoString) return "Never";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Settings
              </p>
              <h1 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-base">
                Your Profile
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/faculty/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: User Details */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{name || "Faculty Member"}</h2>
                  <div className="mt-1 flex items-center justify-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    <ShieldCheck className="h-3 w-3" />
                    {role || "Faculty"}
                  </div>
                </div>

                <div className="mt-8 space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Account Status</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5 mt-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Last Login</p>
                    <p className="font-medium text-foreground mt-1">{formatLastLogin(lastLogin)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Change Password + Academic Portfolio */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <Key className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Change Password</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Ensure your account is using a long, random password to stay secure.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePasswordChange} className="grid gap-5">
                  <div className="grid gap-1.5">
                    <Label htmlFor="current" className="text-xs text-muted-foreground">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="current"
                        type={showCurrent ? "text" : "password"}
                        className="pl-9 pr-10"
                        placeholder="••••••••"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="new" className="text-xs text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="new"
                        type={showNew ? "text" : "password"}
                        className="pl-9 pr-10"
                        placeholder="••••••••"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={newPassword} />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="confirm" className="text-xs text-muted-foreground">Confirm New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type="password"
                        className="pl-9"
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      {success}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Academic Portfolio Card */}
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Academic Portfolio</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Your qualifications, research output, and assigned institutional assets.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Qualification */}
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Qualification</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{profileData?.qualification || "Not specified"}</p>
                    </div>
                  </div>
                  {/* Specialization */}
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Specialization</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{profileData?.specialization || "Not specified"}</p>
                    </div>
                  </div>
                  {/* Publications */}
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Publications</p>
                      <p className="mt-0.5 text-2xl font-bold text-foreground">{profileData?.publications ?? 0}</p>
                    </div>
                  </div>
                  {/* FDPs */}
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">FDPs Attended</p>
                      <p className="mt-0.5 text-2xl font-bold text-foreground">{profileData?.fdpsAttended ?? 0}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Assets */}
                {(profileData?.assets?.laptop || profileData?.assets?.cabinNo || profileData?.assets?.libraryId) && (
                  <div className="mt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Assigned Assets</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {profileData?.assets?.laptop && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">Laptop</p>
                            <p className="text-xs font-medium text-foreground">{profileData.assets.laptop}</p>
                          </div>
                        </div>
                      )}
                      {profileData?.assets?.cabinNo && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <DoorOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">Cabin</p>
                            <p className="text-xs font-medium text-foreground">{profileData.assets.cabinNo}</p>
                          </div>
                        </div>
                      )}
                      {profileData?.assets?.libraryId && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                          <BookMarked className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">Library ID</p>
                            <p className="text-xs font-medium text-foreground">{profileData.assets.libraryId}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!profileData && (
                  <p className="text-xs text-muted-foreground mt-2">Portfolio details will be populated by your administrator.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
