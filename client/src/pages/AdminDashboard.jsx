import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api.js";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import {
  School,
  Users,
  HeartPulse,
  Clock,
  Lock,
  UnlockKeyhole,
  PlusCircle,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
  LayoutDashboard,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, iconClass, bgClass }) => (
  <Card className="border-border bg-card">
    <CardContent className="pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </span>
      </div>
    </CardContent>
  </Card>
);

const ActionCard = ({ icon: Icon, iconClass, bgClass, title, description, onClick, badge }) => (
  <button
    onClick={onClick}
    className="group relative flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
  >
    {badge && (
      <span className="absolute right-4 top-4 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-white">
        {badge}
      </span>
    )}
    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgClass}`}>
      <Icon className={`h-5 w-5 ${iconClass}`} />
    </span>
    <div>
      <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
        {title}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [lockedCount, setLockedCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const statsRes = await api.get("/admin/stats");
        setStats(statsRes.data);

        const facultyRes = await api.get("/admin/faculty");
        const locked = facultyRes.data.faculty.filter((f) => f.isLocked).length;
        setLockedCount(locked);
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin Portal
              </p>
              <h1 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-base">
                Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:inline">
              ● Admin
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>Backend alert:</strong> {error}
            </div>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is an overview of your system. All actions are admin-only and backend-enforced.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Faculty"
            value={stats ? stats.totalFaculty : "—"}
            sub="Registered in system"
            iconClass="text-indigo-500"
            bgClass="bg-indigo-500/10"
          />
          <StatCard
            icon={HeartPulse}
            label="System Health"
            value={stats ? stats.systemHealth : "—"}
            sub="All services operational"
            iconClass="text-emerald-500"
            bgClass="bg-emerald-500/10"
          />
          <StatCard
            icon={Clock}
            label="Pending Approvals"
            value={stats ? stats.pendingApprovals : "—"}
            sub="Awaiting review"
            iconClass="text-amber-500"
            bgClass="bg-amber-500/10"
          />
          <StatCard
            icon={Lock}
            label="Locked Accounts"
            value={lockedCount ?? "—"}
            sub="Require admin unlock"
            iconClass={lockedCount > 0 ? "text-rose-500" : "text-muted-foreground"}
            bgClass={lockedCount > 0 ? "bg-rose-500/10" : "bg-muted"}
          />
        </div>

        {/* Quick Actions */}
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon={UnlockKeyhole}
            iconClass="text-sky-500"
            bgClass="bg-sky-500/10"
            title="Faculty Account Management"
            description="View all faculty accounts, unlock locked accounts, monitor failed login attempts."
            onClick={() => navigate("/admin/faculty")}
            badge={lockedCount > 0 ? lockedCount : null}
          />
          <ActionCard
            icon={PlusCircle}
            iconClass="text-emerald-500"
            bgClass="bg-emerald-500/10"
            title="Register New Faculty"
            description="Create a new faculty account. Admin credentials required to provision access."
            onClick={() => navigate("/admin/register-faculty")}
          />
          <ActionCard
            icon={ScrollText}
            iconClass="text-violet-500"
            bgClass="bg-violet-500/10"
            title="System Logs"
            description="View login audit trail, security events, and access history."
            onClick={() => navigate("/admin/logs")}
          />
        </div>

        {/* Security Notice */}
        <div className="mt-10 rounded-xl border border-border bg-muted/40 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Layered Security Active
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Every action on this dashboard is verified server-side via JWT + role middleware.
                Frontend guards are UX only — the backend is the final authority.
                Even if a faculty user bypasses the UI and calls{" "}
                <code className="rounded bg-muted px-1 font-mono">/admin/faculty</code>,
                the API will return{" "}
                <code className="rounded bg-muted px-1 font-mono">403 Forbidden</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
