import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import {
  GraduationCap,
  User,
  ClipboardList,
  PlusCircle,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

const CLASS_TYPES = ["Lecture", "Lab", "Tutorial", "Seminar"];

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    subject: "",
    classType: "Lecture",
    startTime: "09:00",
    endTime: "10:00",
    venue: "",
    notes: "",
  });

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/faculty/attendance?page=${page}&limit=15`);
      setRecords(res.data.records);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) { toast.error("Subject is required."); return; }
    setSubmitting(true);
    try {
      await api.post("/faculty/attendance", form);
      toast.success("Class session logged successfully!");
      setForm({ date: today, subject: "", classType: "Lecture", startTime: "09:00", endTime: "10:00", venue: "", notes: "" });
      setShowForm(false);
      fetchRecords(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/faculty/attendance/${id}`);
      setRecords(prev => prev.filter(r => r._id !== id));
      toast.success("Log deleted.");
    } catch (_err) {
      toast.error("Failed to delete log.");
    } finally {
      setDeletingId(null);
    }
  };

  const typeColor = {
    Lecture: "bg-indigo-500/10 text-indigo-600",
    Lab: "bg-emerald-500/10 text-emerald-600",
    Tutorial: "bg-amber-500/10 text-amber-600",
    Seminar: "bg-violet-500/10 text-violet-600",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Faculty Portal</p>
              <h1 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-base">Attendance Log</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/faculty/dashboard" className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page title + log button */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">My Attendance Log</h2>
            <p className="mt-1 text-sm text-muted-foreground">Record and review your class sessions and lectures.</p>
          </div>
          <Button className="gap-2 shrink-0" onClick={() => setShowForm(v => !v)}>
            <PlusCircle className="h-4 w-4" />
            {showForm ? "Cancel" : "Log Session"}
          </Button>
        </div>

        {/* Log Session Form */}
        {showForm && (
          <Card className="mb-8 border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Log a New Class Session
              </CardTitle>
              <CardDescription>Fill in the details of the class you conducted.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject / Course</Label>
                  <Input id="subject" placeholder="e.g. Data Structures" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="classType">Class Type</Label>
                  <select
                    id="classType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.classType}
                    onChange={e => setForm({ ...form, classType: e.target.value })}
                  >
                    {CLASS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="venue">Venue (optional)</Label>
                  <Input id="venue" placeholder="e.g. Room 301" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input id="notes" placeholder="e.g. Covered Sorting Algorithms — Merge Sort, Quick Sort" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={submitting} className="gap-2 min-w-[140px]">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                    {submitting ? "Logging…" : "Save Session"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Records */}
        <Card className="border-border">
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading records…
              </div>
            )}
            {!loading && error && (
              <div className="m-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            {!loading && !error && records.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <BookOpen className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No sessions logged yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Click "Log Session" above to record your first class.</p>
                </div>
              </div>
            )}
            {!loading && !error && records.length > 0 && (
              <div className="divide-y divide-border">
                {records.map((r, i) => (
                  <div
                    key={r._id}
                    className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/20 animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${typeColor[r.classType] || "bg-muted text-muted-foreground"}`}>
                      {r.classType?.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{r.subject}</p>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{formatDate(r.date)}</span>
                        <span>{r.startTime} – {r.endTime}</span>
                        {r.venue && <span>📍 {r.venue}</span>}
                      </div>
                      {r.notes && <p className="mt-1 text-xs text-muted-foreground italic truncate">{r.notes}</p>}
                    </div>
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Delete log"
                    >
                      {deletingId === r._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchRecords(pagination.page - 1)} disabled={pagination.page <= 1}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchRecords(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendancePage;
