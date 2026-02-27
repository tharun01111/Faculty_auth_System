import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api.js";
import LogoutButton from "../components/LogoutButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = "default" }) => {
  const colorMap = {
    default: "bg-white border-0 shadow-sm",
    blue: "bg-blue-50 border-0 shadow-sm",
    green: "bg-green-50 border-0 shadow-sm",
    amber: "bg-amber-50 border-0 shadow-sm",
    red: "bg-red-50 border-0 shadow-sm",
  };
  const textMap = {
    default: "text-foreground",
    blue: "text-blue-700",
    green: "text-green-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };

  return (
    <Card className={colorMap[color]}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${color !== "default" ? textMap[color] : "text-muted-foreground"}`}>
              {label}
            </p>
            <p className={`mt-1 text-3xl font-bold tracking-tight ${textMap[color]}`}>
              {value}
            </p>
            {sub && (
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          <span className="rounded-lg bg-white/60 p-2 text-2xl shadow-sm">
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Quick Action Card ────────────────────────────────────────────────────────
const ActionCard = ({ icon, title, description, onClick, badge }) => (
  <button
    onClick={onClick}
    className="group relative flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-border bg-white p-5 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
  >
    {badge && (
      <span className="absolute right-4 top-4 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
        {badge}
      </span>
    )}
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="font-semibold text-foreground group-hover:text-primary">
        {title}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  </button>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [lockedCount, setLockedCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch admin stats
        const statsRes = await api.get("/admin/stats");
        setStats(statsRes.data);

        // Pre-fetch locked count badge for the action card
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
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg text-primary-foreground">
              🏫
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Admin Portal
              </p>
              <h1 className="text-lg font-bold leading-tight tracking-tight">
                Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 sm:inline">
              ● Authenticated as Admin
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Backend security alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="text-lg">⚠️</span>
            <div>
              <strong>Backend alert:</strong> {error}
              <p className="mt-1 text-xs text-red-500">
                This proves that even if you bypass the frontend, the backend protects all data.
              </p>
            </div>
          </div>
        )}

        {/* ── Greeting ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back 👋
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Here's an overview of your system. All actions below are admin-only and backend-enforced.
          </p>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="👩‍🏫"
            label="Total Faculty"
            value={stats ? stats.totalFaculty : "—"}
            sub="Registered in system"
            color="blue"
          />
          <StatCard
            icon="💚"
            label="System Health"
            value={stats ? stats.systemHealth : "—"}
            sub="All services operational"
            color="green"
          />
          <StatCard
            icon="⏳"
            label="Pending Approvals"
            value={stats ? stats.pendingApprovals : "—"}
            sub="Awaiting review"
            color="amber"
          />
          <StatCard
            icon="🔒"
            label="Locked Accounts"
            value={lockedCount ?? "—"}
            sub="Require admin unlock"
            color={lockedCount > 0 ? "red" : "default"}
          />
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────── */}
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon="🔓"
            title="Faculty Account Management"
            description="View all faculty accounts, unlock locked accounts, monitor failed login attempts."
            onClick={() => navigate("/admin/faculty")}
            badge={lockedCount > 0 ? lockedCount : null}
          />
          <ActionCard
            icon="➕"
            title="Register New Faculty"
            description="Create a new faculty account. Admin credentials required to provision access."
            onClick={() => navigate("/admin/register-faculty")}
          />
          <ActionCard
            icon="📋"
            title="System Logs"
            description="View login audit trail, security events, and access history."
            onClick={() => navigate("/admin/logs")}
          />
        </div>

        {/* ── Security Notice ──────────────────────────────────────────── */}
        <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Layered Security Active
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Every action on this dashboard is verified server-side via JWT + role middleware.
                Frontend guards are UX only — the backend is the final authority.
                Even if a faculty user bypasses the UI and calls <code className="rounded bg-blue-100 px-1">/admin/faculty</code>,
                the API will return <code className="rounded bg-blue-100 px-1">403 Forbidden</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
