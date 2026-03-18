import { useEffect, useState, useCallback } from "react";
import api from "../services/api.js";
import AdminLayout from "../components/AdminLayout";
import Breadcrumb from "../components/Breadcrumb";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ScrollText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldX,
  Monitor,
  Filter,
  Loader2,
  AlertTriangle,
  Download,
  AlertOctagon,
  Pencil,
  Trash2,
  UnlockKeyhole,
  ToggleLeft,
  Users,
} from "lucide-react";

const LoginStatusBadge = ({ status }) =>
  status === "SUCCESS" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <ShieldCheck className="h-3 w-3" />
      Success
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
      <ShieldX className="h-3 w-3" />
      Failure
    </span>
  );

const AuditActionBadge = ({ action }) => {
  const config = {
    DELETE_FACULTY:    { label: "Delete",        cls: "bg-rose-500/10 text-rose-600 border-rose-500/30",    Icon: Trash2 },
    BULK_DELETE:       { label: "Bulk Delete",   cls: "bg-rose-500/10 text-rose-600 border-rose-500/30",    Icon: Trash2 },
    UNLOCK_ACCOUNT:    { label: "Unlock",        cls: "bg-amber-500/10 text-amber-600 border-amber-500/30", Icon: UnlockKeyhole },
    STATUS_CHANGE:     { label: "Status Change", cls: "bg-sky-500/10 text-sky-600 border-sky-500/30",       Icon: ToggleLeft },
    BULK_STATUS_UPDATE:{ label: "Bulk Status",   cls: "bg-sky-500/10 text-sky-600 border-sky-500/30",       Icon: ToggleLeft },
    REGISTER_FACULTY:  { label: "Register",      cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", Icon: Users },
  };
  const { label, cls, Icon } = config[action] ?? { label: action, cls: "bg-muted text-muted-foreground border-border", Icon: Pencil };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const PaginationBar = ({ pagination, loading, onPageChange }) => {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1 || loading}>
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>
        <Button variant="outline" size="sm" className="gap-1"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || loading}>
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

// ── Login Logs Tab ─────────────────────────────────────────────────────────────
const LoginLogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get(`/admin/logs?${params.toString()}`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load logs.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const handleExportCsv = () => {
    if (!logs?.length) return;
    const headers = ["Timestamp", "Email", "Status", "IP Address", "User Agent"];
    const rows = logs.map(l => [
      formatDate(l.createdAt).replace(/,/g, ""),
      l.email, l.status, l.ipAddress,
      `"${l.userAgent.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `login_logs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filter:
        </span>
        {[{ label: "All", value: "" }, { label: "Success", value: "SUCCESS" }, { label: "Failure", value: "FAILURE" }].map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${statusFilter === f.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{pagination.total.toLocaleString()} events</span>
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading || !logs.length} className="gap-1.5">
            <Download className="h-3.5 w-3.5 text-emerald-500" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(1)} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {loading && <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
          {!loading && error && <div className="mx-6 my-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          {!loading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><AlertOctagon className="h-6 w-6 text-muted-foreground/60" /></div>
              <div>
                <p className="font-semibold text-foreground">No logs found</p>
                <p className="mt-1 text-sm text-muted-foreground">{statusFilter ? `No events matching status "${statusFilter}".` : "No login activity recorded yet."}</p>
              </div>
            </div>
          )}
          {!loading && !error && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">IP Address</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log, i) => (
                    <tr key={log._id} className={`animate-fade-in transition-colors hover:bg-muted/20 ${log.status === "FAILURE" ? "bg-rose-500/5" : ""}`} style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">{formatDate(log.createdAt)}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{log.email}</td>
                      <td className="px-5 py-3.5 text-center"><LoginStatusBadge status={log.status} /></td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">{log.ipAddress}</td>
                      <td className="hidden max-w-xs truncate px-5 py-3.5 text-xs text-muted-foreground lg:table-cell">
                        <span className="flex items-center gap-1"><Monitor className="h-3 w-3 shrink-0" /><span className="truncate">{log.userAgent}</span></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <PaginationBar pagination={pagination} loading={loading} onPageChange={fetchLogs} />
    </>
  );
};

// ── Audit Logs Tab ─────────────────────────────────────────────────────────────
const AuditLogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/audit-logs?page=${page}&limit=20`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{pagination.total.toLocaleString()} admin actions recorded</span>
        <Button variant="outline" size="sm" onClick={() => fetchLogs(1)} disabled={loading} className="gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {loading && <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
          {!loading && error && <div className="mx-6 my-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          {!loading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><AlertOctagon className="h-6 w-6 text-muted-foreground/60" /></div>
              <div>
                <p className="font-semibold text-foreground">No admin actions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Admin actions like deletions, unlocks, and status changes will appear here.</p>
              </div>
            </div>
          )}
          {!loading && !error && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Faculty</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log, i) => (
                    <tr key={log._id} className="animate-fade-in transition-colors hover:bg-muted/20" style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">{formatDate(log.createdAt)}</td>
                      <td className="px-5 py-3.5"><AuditActionBadge action={log.action} /></td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{log.targetFacultyName || "—"}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{log.targetFaculty || ""}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <PaginationBar pagination={pagination} loading={loading} onPageChange={fetchLogs} />
    </>
  );
};

// ── Main SystemLogs component ──────────────────────────────────────────────────
const SystemLogs = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <AdminLayout pageTitle="Logs">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Admin Portal", href: "/admin/dashboard" },
            { label: "System Logs" },
          ]}
        />

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
            <ScrollText className="h-4.5 w-4.5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">System Logs</h2>
            <p className="text-sm text-muted-foreground">Login audit trail and admin change history.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1 w-fit">
          <button
            onClick={() => setActiveTab("login")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Login Events
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === "audit" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Admin Actions
          </button>
        </div>

        {activeTab === "login" ? <LoginLogsTab /> : <AuditLogsTab />}
      </div>
    </AdminLayout>
  );
};

export default SystemLogs;
