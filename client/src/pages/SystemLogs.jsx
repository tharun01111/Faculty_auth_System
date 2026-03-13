import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import AdminLayout from "../components/AdminLayout";
import Breadcrumb from "../components/Breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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

  const handleExportCsv = () => {
    if (!logs || logs.length === 0) return;
    
    // Headers
    const headers = ["Timestamp", "Email", "Status", "IP Address", "User Agent"];
    
    // Rows
    const rows = logs.map(log => [
      formatDate(log.createdAt).replace(/,/g, ""), // remove commas to avoid mixing columns
      log.email,
      log.status,
      log.ipAddress,
      `"${log.userAgent.replace(/"/g, '""')}"` // escape quotes
    ]);
    
    // Combine
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Download trigger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout pageTitle="Logs">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Breadcrumb layer */}
        <Breadcrumb
          items={[
            { label: "Admin Portal", href: "/admin/dashboard" },
            { label: "System Logs" },
          ]}
        />

        {/* Page Title & Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <ScrollText className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Login Audit Trail</h2>
              <p className="text-sm text-muted-foreground">
                All login attempts — successful and failed — for every account.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-fit gap-1.5"
              onClick={handleExportCsv}
              disabled={loading || logs.length === 0}
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              Export CSV
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

            {/* Complete Empty State with Illustration */}
            {!loading && !error && logs.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <AlertOctagon className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No logs found</p>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    {statusFilter
                      ? `There are no events matching the status filter "${statusFilter}".`
                      : "No login activity has been recorded yet in the system."}
                  </p>
                </div>
                {statusFilter && (
                  <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className="gap-1.5">
                    Clear filter
                  </Button>
                )}
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
    </AdminLayout>
  );
};

export default SystemLogs;
