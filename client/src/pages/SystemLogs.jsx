import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import ThemeToggle from "../components/ThemeToggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  School,
  ArrowLeft,
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
} from "lucide-react";

const StatusBadge = ({ status }) =>
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

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const SystemLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(""); // "" | "SUCCESS" | "FAILURE"

  const fetchLogs = useCallback(
    async (page = 1) => {
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
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchLogs(newPage);
  };

  // Summary counts from current full dataset for filter badges
  const successCount = logs.filter((l) => l.status === "SUCCESS").length;
  const failureCount = logs.filter((l) => l.status === "FAILURE").length;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
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
                System Logs
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

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Back + actions row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-fit gap-1.5"
            onClick={() => fetchLogs(1)}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Page title */}
        <div className="mb-6 flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-violet-500" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Login Audit Trail</h2>
            <p className="text-sm text-muted-foreground">
              All login attempts — successful and failed — for every account.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {[
            { label: "All", value: "" },
            { label: "Success", value: "SUCCESS" },
            { label: "Failure", value: "FAILURE" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {pagination.total.toLocaleString()} total events
          </span>
        </div>

        {/* Main Card */}
        <Card className="border-border">
          <CardContent className="p-0">
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading audit logs…
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="mx-6 my-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && logs.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <ScrollText className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No logs found.</p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && logs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Timestamp
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                      </th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        IP Address
                      </th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                        User Agent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className={`transition-colors hover:bg-muted/20 ${
                          log.status === "FAILURE" ? "bg-rose-500/5" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-foreground">{log.email}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {log.ipAddress}
                        </td>
                        <td className="hidden max-w-xs truncate px-5 py-3.5 text-xs text-muted-foreground lg:table-cell">
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3 w-3 shrink-0" />
                            <span className="truncate">{log.userAgent}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
