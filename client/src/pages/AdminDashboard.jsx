import { useEffect, useState, useContext, useCallback } from "react";
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
  Activity,
  Lock,
  UnlockKeyhole,
  PlusCircle,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
  LayoutDashboard,
  UserCheck,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Skeleton placeholder ──────────────────────────────────────────────────────
const StatSkeleton = () => (
  <Card className="border-border bg-card">
    <CardContent className="pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          <div className="mt-2 h-8 w-14 rounded bg-muted animate-pulse" />
          <div className="mt-1.5 h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-10 shrink-0 rounded-lg bg-muted animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <div className="h-full w-full flex items-end justify-around gap-2 px-4 pb-4 pt-6">
    {[60, 85, 40, 70, 55, 90, 45].map((h, i) => (
      <div
        key={i}
        className="flex-1 rounded-t bg-muted animate-pulse"
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
);

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

// ── Custom Tooltip for Bar Chart ──────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Custom Tooltip for Pie Chart ──────────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: payload[0].payload.fill }} />
        <span className="text-muted-foreground">{payload[0].name}:</span>
        <span className="font-semibold text-foreground">{payload[0].value}</span>
      </div>
    </div>
  );
};

const PIE_COLORS = ["#6366f1", "#f43f5e"]; // indigo for active, rose for locked

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, name } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [lockedCount, setLockedCount] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setError(null);
    try {
      const [statsRes, chartRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/charts"),
      ]);
      setStats(statsRes.data);
      setLockedCount(statsRes.data.lockedAccounts ?? 0);
      setChartData(chartRes.data);
    } catch (err) {
      setError("Failed to load dashboard data. Check your connection and try again.");
      console.error(err);
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // Auto-refresh dashboard stats every 30 seconds silently
    const intervalId = setInterval(() => {
      fetchAll(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchAll]);

  const statsLoading = stats === null && !error;
  const chartsLoading = chartData === null && !error;

  // Add fill colour to pie data so tooltip can reference it
  const pieData = chartData?.accountStatus?.map((d, i) => ({
    ...d,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

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
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back{name ? `, ${name}` : ""}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is an overview of your system. All actions are admin-only and backend-enforced.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                label="Total Faculty"
                value={stats?.totalFaculty ?? "—"}
                sub="Registered in system"
                iconClass="text-indigo-500"
                bgClass="bg-indigo-500/10"
              />
              <StatCard
                icon={UserCheck}
                label="Active Accounts"
                value={stats?.activeAccounts ?? "—"}
                sub="Currently accessible"
                iconClass="text-emerald-500"
                bgClass="bg-emerald-500/10"
              />
              <StatCard
                icon={Lock}
                label="Locked Accounts"
                value={lockedCount ?? "—"}
                sub="Require admin unlock"
                iconClass={lockedCount > 0 ? "text-rose-500" : "text-muted-foreground"}
                bgClass={lockedCount > 0 ? "bg-rose-500/10" : "bg-muted"}
              />
              <StatCard
                icon={Activity}
                label="Logins (24h)"
                value={stats?.recentLogins ?? "—"}
                sub="Successful in last 24h"
                iconClass="text-sky-500"
                bgClass="bg-sky-500/10"
              />
            </>
          )}
        </div>

        {/* ── Analytics Charts ─────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Analytics
          </h3>
        </div>
        <div className="mb-8 grid gap-4 lg:grid-cols-3">

          {/* Bar Chart — Login Activity (Last 7 Days) */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardContent className="pt-5">
              <p className="mb-1 text-sm font-semibold text-foreground">Login Activity</p>
              <p className="mb-4 text-xs text-muted-foreground">Success vs failures over the last 7 days</p>
              <div className="h-56">
                {chartsLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData?.loginActivity ?? []}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                      barCategoryGap="35%"
                      barGap={3}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: "hsl(var(--muted)/0.4)" }} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar dataKey="success" name="Success" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="failure" name="Failure" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart — Account Status */}
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <p className="mb-1 text-sm font-semibold text-foreground">Account Status</p>
              <p className="mb-4 text-xs text-muted-foreground">Active vs locked accounts</p>
              <div className="h-56">
                {chartsLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-36 w-36 rounded-full border-[10px] border-muted animate-pulse" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData ?? []}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {(pieData ?? []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                        iconType="circle"
                        iconSize={8}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions header with Refresh */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Quick Actions
          </h3>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
            title="Refresh stats"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

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
