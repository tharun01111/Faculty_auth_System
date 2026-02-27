import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ isLocked }) =>
  isLocked ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Locked
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Active
    </span>
  );

// ─── Main Page ────────────────────────────────────────────────────────────────
const FacultyManagement = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(null); // faculty id being unlocked
  const [toast, setToast] = useState(null);          // { type: "success"|"error", message }

  // ── Fetch faculty list ──────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // ── Filter by search ────────────────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      faculty.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.email?.toLowerCase().includes(q)
      )
    );
  }, [search, faculty]);

  // ── Auto-dismiss toast ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Unlock handler ──────────────────────────────────────────────────────────
  const handleUnlock = async (id) => {
    setUnlocking(id);
    try {
      const res = await api.patch(`/admin/faculty/${id}/unlock`);
      // Optimistic UI update — no refetch needed
      setFaculty((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, isLocked: false, failedLogin: 0 } : f
        )
      );
      setToast({ type: "success", message: res.data.message });
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to unlock account.",
      });
    } finally {
      setUnlocking(null);
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalLocked = faculty.filter((f) => f.isLocked).length;
  const totalActive = faculty.filter((f) => !f.isLocked).length;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-current opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="border-b bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-1 -ml-2 text-muted-foreground"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Faculty Management
            </h1>
            <p className="text-sm text-muted-foreground">
              View all faculty accounts. Unlock accounts locked due to failed login attempts.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFaculty}>
            ↻ Refresh
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-6xl px-6">
        {/* ── Summary Stats ─────────────────────────────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Total Faculty</p>
              <p className="mt-1 text-3xl font-bold">{faculty.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-green-50 shadow-sm">
            <CardContent className="pt-5">
              <p className="text-sm text-green-700">Active Accounts</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                {totalActive}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-red-50 shadow-sm">
            <CardContent className="pt-5">
              <p className="text-sm text-red-700">Locked Accounts</p>
              <p className="mt-1 text-3xl font-bold text-red-700">
                {totalLocked}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Faculty Table Card ─────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All Faculty</CardTitle>
              <CardDescription>
                Accounts locked after {3} failed login attempts.
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
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-14 text-sm text-muted-foreground">
                <span className="mr-2 animate-spin">⟳</span> Loading faculty…
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="mx-6 my-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="py-14 text-center text-sm text-muted-foreground">
                {search ? "No faculty match your search." : "No faculty found."}
              </div>
            )}

            {/* Table */}
            {!loading && !error && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-muted-foreground">
                        Failed Attempts
                      </th>
                      <th className="px-6 py-3 text-right font-semibold text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((f) => (
                      <tr
                        key={f._id}
                        className={`transition-colors hover:bg-gray-50/60 ${
                          f.isLocked ? "bg-red-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">
                          {f.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {f.email}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge isLocked={f.isLocked} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-mono font-semibold ${
                              f.failedLogin > 0
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {f.failedLogin}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {f.isLocked ? (
                            <Button
                              size="sm"
                              onClick={() => handleUnlock(f._id)}
                              disabled={unlocking === f._id}
                              className="bg-amber-500 text-white hover:bg-amber-600"
                            >
                              {unlocking === f._id ? (
                                <>
                                  <span className="mr-1 animate-spin">⟳</span>{" "}
                                  Unlocking…
                                </>
                              ) : (
                                "🔓 Unlock"
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No action needed
                            </span>
                          )}
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
