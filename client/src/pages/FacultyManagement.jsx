import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import AdminLayout from "../components/AdminLayout";
import Breadcrumb from "../components/Breadcrumb";
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
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Building2,
  Hash,
  LayoutGrid,
  Download,
  RefreshCw,
  SearchX,
  XCircle,
  Trash2,
  Loader2,
  Search,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  UnlockKeyhole,
  Eye,
  Calendar,
  Mail,
  CheckSquare,
  X as XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "../components/ui/tooltip";
import { Sheet } from "../components/ui/sheet";

const PAGE_SIZE = 10;

const StatusBadge = ({ isLocked, status }) => {
  if (isLocked) return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Locked
    </span>
  );

  const colors = {
    Available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-emerald-500",
    "On Leave": "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 bg-rose-500",
    Meeting: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 bg-amber-500",
  };

  const current = colors[status] || colors.Available;
  const dotColor = current.split(" ").pop();
  const badgeClasses = current.split(" ").slice(0, -1).join(" ");

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status || "Available"}
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Table Skeleton ───────────────────────────────────────────────────────────
const shimmerClass = "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%]";

const TableSkeleton = ({ rows = 5 }) => (
  <div className="divide-y divide-border">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4">
        {/* Name */}
        <div className="flex-1">
          <div className={`h-3.5 w-32 rounded ${shimmerClass}`} />
        </div>
        {/* Email */}
        <div className="flex-[2]">
          <div className={`h-3 w-48 rounded ${shimmerClass}`} />
        </div>
        {/* Status */}
        <div className="w-20">
          <div className={`h-5 w-16 rounded-full ${shimmerClass}`} />
        </div>
        {/* Failed */}
        <div className="w-12 text-center">
          <div className={`mx-auto h-3.5 w-6 rounded ${shimmerClass}`} />
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <div className={`h-7 w-16 rounded-lg ${shimmerClass}`} />
          <div className={`h-7 w-14 rounded-lg ${shimmerClass}`} />
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ isSearch, search, onClear, onRegister, department }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
      {isSearch ? (
        <SearchX className="h-6 w-6 text-muted-foreground/60" />
      ) : (
        <Building2 className="h-6 w-6 text-muted-foreground/60" />
      )}
    </div>
    <div>
      <p className="font-semibold text-foreground">
        {isSearch ? "No results found" : `No faculty in ${department}`}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {isSearch
          ? `No faculty match "${search}". Try a different name, email, or ID.`
          : `There are no faculty registered under the ${department} department.`}
      </p>
    </div>
    {isSearch ? (
      <Button variant="outline" size="sm" onClick={onClear} className="gap-1.5">
        <XCircle className="h-3.5 w-3.5" />
        Clear search
      </Button>
    ) : (
      <Button size="sm" onClick={onRegister} className="gap-1.5">
        <UserPlus className="h-3.5 w-3.5" />
        Add Faculty
      </Button>
    )}
  </div>
);

// ─── Department Tabs ────────────────────────────────────────────────────────
const DepartmentTabs = ({ departments, activeTab, onTabChange }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <button
      onClick={() => onTabChange("All")}
      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        activeTab === "All"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <LayoutGrid className="h-4 w-4" />
      All Departments
    </button>
    {departments.map((dept) => (
      <button
        key={dept}
        onClick={() => onTabChange(dept)}
        className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
          activeTab === dept
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Building2 className="h-4 w-4" />
        {dept}
      </button>
    ))}
  </div>
);

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ faculty, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
        <Trash2 className="h-4.5 w-4.5 text-destructive" />
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

// ─── Bulk Status Modal ──────────────────────────────────────────────────────
const BulkStatusModal = ({ count, onConfirm, onCancel, loading }) => {
  const [status, setStatus] = useState("Available");
  const statuses = [
    { value: "Available", color: "text-emerald-600", dot: "bg-emerald-500" },
    { value: "On Leave",  color: "text-rose-600",    dot: "bg-rose-500" },
    { value: "Meeting",   color: "text-amber-600",   dot: "bg-amber-500" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <CheckSquare className="h-4.5 w-4.5 text-primary" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">Bulk Status Update</h2>
        <p className="mt-1 text-sm text-muted-foreground">Set status for <strong>{count}</strong> selected faculty:</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                status === s.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className={`h-3 w-3 rounded-full ${s.dot}`} />
              {s.value}
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={() => onConfirm(status)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination Bar ───────────────────────────────────────────────────────────
const PaginationBar = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  // Build page numbers to show (max 5)
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3">
      <p className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [viewTarget, setViewTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkUpdatingStatus, setBulkUpdatingStatus] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // ── Departments List ────────────────────────────────────────────────────────
  const departments = [...new Set(faculty.map(f => f.department).filter(Boolean))].sort();

  // ── Fetch ────────────────────────────────────────────────────────────────────
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

  // ── Search filter: also clear selection on filter change ──────────────────────
  useEffect(() => {
    const q = search.toLowerCase();
    let result = faculty;
    
    // Apply Tab Filter
    if (activeTab !== "All") {
      result = result.filter(f => f.department === activeTab);
    }

    // Apply Search Filter
    if (q) {
      result = result.filter(
        (f) => 
          f.name?.toLowerCase().includes(q) || 
          f.email?.toLowerCase().includes(q) ||
          f.employeeId?.toLowerCase().includes(q) ||
          f.department?.toLowerCase().includes(q)
      );
    }
    
    setFiltered(result);
    setPage(1); // reset to first page on filter change
    setSelectedIds([]); // clear selection when filter changes
  }, [search, faculty, activeTab]);

  // ── Keyboard shortcut ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on '/' key press, but not if user is already typing in an input
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("searchInput")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Unlock ────────────────────────────────────────────────────────────────────
  const handleUnlock = async (id) => {
    setUnlocking(id);
    try {
      const res = await api.patch(`/admin/faculty/${id}/unlock`);
      setFaculty((prev) =>
        prev.map((f) => (f._id === id ? { ...f, isLocked: false, failedLogin: 0 } : f))
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unlock.");
    } finally {
      setUnlocking(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget._id);
    try {
      const res = await api.delete(`/admin/faculty/${deleteTarget._id}`);
      setFaculty((prev) => prev.filter((f) => f._id !== deleteTarget._id));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  // ── Status Change ─────────────────────────────────────────────────────────────
  const handleStatusChange = async (targetFaculty, newStatus) => {
    setUpdatingStatus(targetFaculty._id);
    try {
      await api.patch(`/admin/faculty/${targetFaculty._id}/status`, { status: newStatus });
      setFaculty(prev => prev.map(f => f._id === targetFaculty._id ? { ...f, status: newStatus } : f));
      if (viewTarget?._id === targetFaculty._id) {
        setViewTarget(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ── Bulk Delete ────────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const res = await api.delete("/admin/faculty/bulk", { data: { ids: selectedIds } });
      setFaculty(prev => prev.filter(f => !selectedIds.includes(f._id)));
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk delete failed.");
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Bulk Status Update ─────────────────────────────────────────────────────────
  const handleBulkStatus = async (newStatus) => {
    setBulkUpdatingStatus(true);
    try {
      const res = await api.patch("/admin/faculty/bulk-status", { ids: selectedIds, status: newStatus });
      setFaculty(prev => prev.map(f => selectedIds.includes(f._id) ? { ...f, status: newStatus } : f));
      setSelectedIds([]);
      setBulkStatusModal(false);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk status update failed.");
    } finally {
      setBulkUpdatingStatus(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────────
  const totalLocked = faculty.filter((f) => f.isLocked).length;
  const totalActive = faculty.filter((f) => !f.isLocked).length;

  // ── Pagination ─────────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Export CSV ─────────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    if (!faculty.length) return;
    const headers = ["Name", "Email", "Employee ID", "Department", "Status", "Failed Logins", "Joined"];
    const rows = faculty.map((f) => [
      f.name || "",
      f.email,
      f.employeeId || "",
      f.department || "",
      f.isLocked ? "Locked" : "Active",
      f.failedLogin ?? 0,
      formatDate(f.createdAt),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `faculty_list_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout pageTitle="Faculty">
      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          faculty={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={!!deleting}
        />
      )}

      {/* Bulk Delete Confirm */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <Trash2 className="h-4.5 w-4.5 text-destructive" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">Bulk Delete Faculty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to permanently delete <strong>{selectedIds.length}</strong> selected faculty accounts? This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowBulkDeleteConfirm(false)} disabled={bulkDeleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1 gap-2" onClick={handleBulkDelete} disabled={bulkDeleting}>
                {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Modal */}
      {bulkStatusModal && (
        <BulkStatusModal
          count={selectedIds.length}
          onConfirm={handleBulkStatus}
          onCancel={() => setBulkStatusModal(false)}
          loading={bulkUpdatingStatus}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Admin Portal", href: "/admin/dashboard" },
            { label: "Faculty Management" },
          ]}
        />

        {/* Page header + actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Faculty Management</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage all faculty accounts, unlock locked accounts, and monitor login attempts.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExportCsv}
              disabled={loading || !faculty.length}
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              Export CSV
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
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Faculty</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{faculty.length}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Users className="h-4.5 w-4.5 text-indigo-500" />
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
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
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
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${totalLocked > 0 ? "bg-rose-500/10" : "bg-muted"}`}>
                  <ShieldAlert className={`h-4.5 w-4.5 ${totalLocked > 0 ? "text-rose-500" : "text-muted-foreground"}`} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Faculty Table Card */}
        <Card className="border-border">
          <CardHeader className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Faculty Directory</CardTitle>
              <CardDescription>
                Manage faculty accounts, departments, and security status.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DepartmentTabs 
                departments={departments} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
              <div className="relative ml-auto w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="searchInput"
                  placeholder="Find faculty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Skeleton loader */}
            {loading && <TableSkeleton rows={5} />}

            {/* Error */}
            {!loading && error && (
              <div className="mx-6 my-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <EmptyState
                isSearch={!!search}
                search={search}
                onClear={() => setSearch("")}
                onRegister={() => navigate("/admin/register-faculty")}
              />
            )}

            {/* Table */}
            {/* Desktop Table & Mobile Card View */}
            {!loading && !error && filtered.length > 0 && (
              <>
                {/* Desktop Table - Hidden on LG and below */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-3 py-3 text-left">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border accent-primary"
                            checked={paginated.length > 0 && paginated.every(f => selectedIds.includes(f._id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...new Set([...prev, ...paginated.map(f => f._id)])]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => !paginated.map(f => f._id).includes(id)));
                              }
                            }}
                            aria-label="Select all"
                          />
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Faculty</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID &amp; Dept</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Failed</th>
                        <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Joined</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginated.map((f, index) => (
                        <tr
                          key={f._id}
                          className={`animate-fade-in transition-colors hover:bg-muted/20 outline-none ${f.isLocked ? "bg-rose-500/5" : ""} ${selectedIds.includes(f._id) ? "bg-primary/5" : ""}`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-3 py-4">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-border accent-primary"
                              checked={selectedIds.includes(f._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => [...prev, f._id]);
                                } else {
                                  setSelectedIds(prev => prev.filter(id => id !== f._id));
                                }
                              }}
                              aria-label={`Select ${f.name}`}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{f.name || "—"}</span>
                              <span className="text-xs text-muted-foreground">{f.email}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 text-foreground font-medium">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                {f.employeeId || "—"}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                {f.department || "—"}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <StatusBadge isLocked={f.isLocked} status={f.status} />
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
                              <Tooltip content="Quick View" side="top">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8.5 w-8.5"
                                  onClick={() => setViewTarget(f)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                              {f.isLocked && (
                                <Tooltip content="Unlock Account" side="top">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8.5 w-8.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400"
                                    onClick={() => handleUnlock(f._id)}
                                    disabled={unlocking === f._id}
                                    aria-label="Unlock Account"
                                  >
                                    {unlocking === f._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <UnlockKeyhole className="h-4 w-4" />
                                    )}
                                  </Button>
                                </Tooltip>
                              )}
                              <Tooltip content="Delete Faculty" side="top">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8.5 w-8.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setDeleteTarget(f)}
                                  disabled={!!deleting}
                                  aria-label="Delete Faculty"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Hidden on LG and above */}
                <div className="block lg:hidden divide-y divide-border">
                  {paginated.map((f, index) => (
                    <div
                      key={f._id}
                      className={`p-4 transition-colors hover:bg-muted/10 animate-fade-in ${f.isLocked ? "bg-rose-500/5" : ""}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground truncate">{f.name || "—"}</span>
                            <StatusBadge isLocked={f.isLocked} status={f.status} />
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                             <Mail className="h-3 w-3" /> {f.email}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              {f.employeeId || "—"}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {f.department || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 shrink-0"
                            onClick={() => setViewTarget(f)}
                            aria-label="Quick View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {f.isLocked && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 shrink-0 border-amber-500/40 text-amber-600"
                              onClick={() => handleUnlock(f._id)}
                              disabled={unlocking === f._id}
                              aria-label="Unlock Account"
                            >
                              <UnlockKeyhole className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 shrink-0 text-muted-foreground"
                            onClick={() => setDeleteTarget(f)}
                            disabled={!!deleting}
                            aria-label="Delete Faculty"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </>
            )}

          </CardContent>
        </Card>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-2xl ring-1 ring-border/50">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {selectedIds.length} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setBulkStatusModal(true)}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Set Status
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={() => setShowBulkDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
            <button
              onClick={() => setSelectedIds([])}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear selection"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      {/* Quick View Drawer */}
      <Sheet
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Faculty Overview"
      >
        {viewTarget && (
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{viewTarget.name}</h3>
              <p className="text-sm text-muted-foreground">{viewTarget.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <StatusBadge isLocked={viewTarget.isLocked} status={viewTarget.status} />
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {viewTarget.role}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Hash className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Employee ID</p>
                  <p className="text-sm font-medium text-foreground">{viewTarget.employeeId || "Not Assigned"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Department</p>
                  <p className="text-sm font-medium text-foreground">{viewTarget.department || "No Department"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Joined System</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(viewTarget.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account Status</p>
              <div className="grid grid-cols-3 gap-2">
                {["Available", "On Leave", "Meeting"].map((s) => (
                  <Button
                    key={s}
                    variant={viewTarget.status === s || (!viewTarget.status && s === "Available") ? "default" : "outline"}
                    size="sm"
                    className="h-14 flex-col gap-1 text-[10px]"
                    onClick={() => handleStatusChange(viewTarget, s)}
                    disabled={updatingStatus === viewTarget._id}
                  >
                    {updatingStatus === viewTarget._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className={`h-2 w-2 rounded-full ${
                        s === "Available" ? "bg-emerald-500" : s === "On Leave" ? "bg-rose-500" : "bg-amber-500"
                      }`} />
                    )}
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Security Context</p>
                {viewTarget.isLocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
                    <ShieldAlert className="h-3 w-3" />
                    LOCKED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <ShieldCheck className="h-3 w-3" />
                    SECURE
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Failed login attempts:</span>
                  <span className={`font-mono font-bold ${viewTarget.failedLogin > 0 ? "text-rose-500" : "text-foreground"}`}>
                    {viewTarget.failedLogin || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last activity:</span>
                  <span className="text-foreground">{viewTarget.lastLogin ? formatDate(viewTarget.lastLogin) : "Never"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="destructive" 
                className="flex-1 gap-2"
                onClick={() => {
                  setDeleteTarget(viewTarget);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  </AdminLayout>
  );
};

export default FacultyManagement;
