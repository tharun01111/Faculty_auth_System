import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import Avatar from "../components/Avatar";
import PasswordStrength from "../components/PasswordStrength";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Key, Lock, Eye, EyeOff, Loader2, ShieldCheck,
} from "lucide-react";
import api from "../services/api.js";
import { toast } from "sonner";

export default function AdminProfile() {
  const { name, role } = useContext(AuthContext);

  // ── Change Password ──────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [pwLoading, setPwLoading]             = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    try {
      const res = await api.patch("/admin/change-password", { currentPassword, newPassword });
      toast.success(res.data.message || "Password updated successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="My Profile">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal account details and security settings.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* ── Left: Identity Card ── */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <Avatar name={name} size="xl" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{name || "Administrator"}</h3>
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      {role || "Admin"}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Account Status</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Active
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Access Level</p>
                    <p className="font-medium text-foreground mt-1">Full Administration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Security ── */}
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
                      Use a long, random password to keep your admin account secure.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePasswordChange} className="grid gap-5">
                  {/* Current Password */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="admin-current" className="text-xs text-muted-foreground">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="admin-current"
                        type={showCurrent ? "text" : "password"}
                        className="pl-9 pr-10 min-h-[44px]"
                        placeholder="••••••••"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="admin-new" className="text-xs text-muted-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="admin-new"
                        type={showNew ? "text" : "password"}
                        className="pl-9 pr-10 min-h-[44px]"
                        placeholder="••••••••"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={newPassword} />
                  </div>

                  {/* Confirm Password */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="admin-confirm" className="text-xs text-muted-foreground">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="admin-confirm"
                        type="password"
                        className="pl-9 min-h-[44px]"
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={pwLoading} className="gap-2 min-h-[44px]">
                      {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
