import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import ThemeToggle from "../components/ThemeToggle";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  School,
  ArrowLeft,
  RefreshCw,
  Users,
  ShieldCheck,
  ShieldAlert,
  UnlockKeyhole,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div
      className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${
        isSuccess
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ isLocked }) =>
  isLocked ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Locked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  );

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ faculty, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
        <Trash2 className="h-5 w-5 text-destructive" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">Delete Faculty Account</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Are you sure you want to permanently delete{" "}
        <strong className="text-foreground">{faculty?.name || faculty?.email}</strong>?
        This action cannot be undone.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex-1 gap-2"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </Button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const FacultyManagement = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // faculty to delete (triggers modal)

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/faculty");
      setFaculty(res.data.faculty);
      setFiltered(res.data.faculty);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load faculty.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  // ── Search filter ────────────────────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      faculty.filter(
        (f) => f.name?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q)
      )
    );
  }, [search, faculty]);

  // ── Auto-dismiss toast ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Unlock ───────────────────────────────────────────────────────────────────
  const handleUnlock = async (id) => {
    setUnlocking(id);
    try {
      const res = await api.patch(`/admin/faculty/${id}/unlock`);
      setFaculty((prev) =>
        prev.map((f) => (f._id === id ? { ...f, isLocked: false, failedLogin: 0 } : f))
      );
      setToast({ type: "success", message: res.data.message });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to unlock." });
    } finally {
      setUnlocking(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget._id);
    try {
      const res = await api.delete(`/admin/faculty/${deleteTarget._id}`);
      setFaculty((prev) => prev.filter((f) => f._id !== deleteTarget._id));
      setToast({ type: "success", message: res.data.message });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to delete." });
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const totalLocked = faculty.filter((f) => f.isLocked).length;
  const totalActive = faculty.filter((f) => !f.isLocked).length;

  return (
    <div className="min-h-screen bg-background pb-12">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          faculty={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={!!deleting}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
                Faculty Management
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
        {/* Back + Refresh */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={fetchFaculty}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── Summary Stats ─────────────────────────────────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Faculty</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{faculty.length}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Users className="h-5 w-5 text-indigo-500" />
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Active Accounts</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {totalActive}
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Locked Accounts</p>
                  <p className={`mt-1 text-3xl font-bold ${totalLocked > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                    {totalLocked}
                  </p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${totalLocked > 0 ? "bg-rose-500/10" : "bg-muted"}`}>
                  <ShieldAlert className={`h-5 w-5 ${totalLocked > 0 ? "text-rose-500" : "text-muted-foreground"}`} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Faculty Table Card ─────────────────────────────────────────────── */}
        <Card className="border-border">
          <CardHeader className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All Faculty</CardTitle>
              <CardDescription>
                Accounts lock automatically after 3 failed login attempts.
              </CardDescription>
            </div>
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          </CardHeader>

          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading faculty…
              </div>
            )}

            {!loading && error && (
              <div className="mx-6 my-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="py-14 text-center text-sm text-muted-foreground">
                {search ? "No faculty match your search." : "No faculty found."}
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Failed</th>
                      <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Joined</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((f) => (
                      <tr
                        key={f._id}
                        className={`transition-colors hover:bg-muted/20 ${
                          f.isLocked ? "bg-rose-500/5" : ""
                        }`}
                      >
                        <td className="px-5 py-4 font-medium text-foreground">
                          {f.name || "—"}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{f.email}</td>
                        <td className="px-5 py-4 text-center">
                          <StatusBadge isLocked={f.isLocked} />
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`font-mono font-semibold ${
                              f.failedLogin > 0 ? "text-rose-500" : "text-muted-foreground"
                            }`}
                          >
                            {f.failedLogin}
                          </span>
                        </td>
                        <td className="hidden px-5 py-4 text-xs text-muted-foreground lg:table-cell">
                          {formatDate(f.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {f.isLocked && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400"
                                onClick={() => handleUnlock(f._id)}
                                disabled={unlocking === f._id}
                              >
                                {unlocking === f._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <UnlockKeyhole className="h-3.5 w-3.5" />
                                )}
                                {unlocking === f._id ? "…" : "Unlock"}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTarget(f)}
                              disabled={!!deleting}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyManagement;
