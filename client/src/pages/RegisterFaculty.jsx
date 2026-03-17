import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../services/api.js";
import AdminLayout from "../components/AdminLayout";
import Breadcrumb from "../components/Breadcrumb";
import PasswordStrength from "../components/PasswordStrength";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  UserPlus,
  Users,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileSpreadsheet,
  Download,
  X,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

// ── Tab button ────────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

// ── Row status badge ───────────────────────────────────────────────────────────
const RowBadge = ({ row }) => {
  if (!row.name?.trim()) return <span className="text-xs text-rose-500 font-medium">Missing name</span>;
  if (!row.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
    return <span className="text-xs text-rose-500 font-medium">Invalid email</span>;
  if (!row.password || row.password.length < 6)
    return <span className="text-xs text-amber-500 font-medium">Password too short</span>;
  return <span className="text-xs text-emerald-500 font-medium">✓ Ready</span>;
};

const isRowValid = (row) =>
  row.name?.trim()?.length >= 2 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email?.trim() ?? "") &&
  row.password?.length >= 6;

// ── Download template helper ───────────────────────────────────────────────────
const downloadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ["name", "email", "employeeId", "department", "password"],
    ["Dr. Ramesh Kumar", "ramesh@college.edu", "FAC001", "Computer Science", "Welcome@123"],
    ["Prof. Meera Nair", "meera@college.edu", "FAC002", "Mathematics", "College#456"],
  ]);
  ws["!cols"] = [{ wch: 25 }, { wch: 28 }, { wch: 15 }, { wch: 20 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Faculty");
  XLSX.writeFile(wb, "faculty_import_template.xlsx");
};

// ══════════════════════════════════════════════════════════════════════════════
// SINGLE REGISTER FORM
// ══════════════════════════════════════════════════════════════════════════════
const singleFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Must be a valid email address").toLowerCase(),
  employeeId: z.string().trim().min(2, "ID is too short").max(20, "ID is too long"),
  department: z.string().trim().min(2, "Department is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string()
}).refine(data => data.password === data.confirm, {
  message: "Passwords do not match.",
  path: ["confirm"]
});

const SingleForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(singleFormSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" }
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.post("/faculty/register", {
        name: data.name,
        email: data.email,
        employeeId: data.employeeId,
        department: data.department,
        password: data.password,
      });
      const msg = res.data.message || "Faculty registered successfully.";
      setSuccess(msg);
      toast.success(msg);
      reset();
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (_err) {
      const msg = err.response?.data?.message || "Failed to register faculty.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Info panel */}
      <div className="lg:col-span-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
          <UserPlus className="h-6 w-6 text-emerald-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Add New Faculty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a single faculty account. The account will be immediately active.
        </p>
        <div className="mt-6 space-y-3">
          {["Password is securely hashed (bcrypt)", "Account is active immediately", "Welcome email is sent automatically", "You can manage accounts later"].map((p) => (
            <div key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-3">
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Faculty Details</CardTitle>
            <CardDescription>All fields are required. Use the faculty member's institutional email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> Full Name
                </Label>
                <Input id="name" placeholder="Dr. Jane Smith" {...register("name")} disabled={loading} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </Label>
                <Input id="email" type="email" inputMode="email" placeholder="faculty@college.edu" {...register("email")} disabled={loading} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="employeeId" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    Employee ID
                  </Label>
                  <Input id="employeeId" placeholder="FAC001" {...register("employeeId")} disabled={loading} />
                  {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="department" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    Department
                  </Label>
                  <Input id="department" placeholder="Computer Science" {...register("department")} disabled={loading} />
                  {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Password
                </Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="Min. 6 characters" {...register("password")} disabled={loading} className="pr-10" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                <PasswordStrength password={passwordValue} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="confirm" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> Confirm Password
                </Label>
                <div className="relative">
                  <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat password" {...register("confirm")} disabled={loading} className="pr-10" />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {success} Redirecting…
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/admin/dashboard")} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className={`flex-1 gap-2 transition-all duration-300 ${success ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`} 
                  disabled={loading || !!success}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</>
                  ) : success ? (
                    <><CheckCircle2 className="h-4 w-4" /> Success!</>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Register Faculty</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BULK IMPORT FORM
// ══════════════════════════════════════════════════════════════════════════════
const BulkForm = () => {
  const [rows, setRows] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // bulk response summary
  const [parseError, setParseError] = useState(null);
  const fileInputRef = useRef(null);

  const parseFile = useCallback((file) => {
    setParseError(null);
    setResult(null);

    if (!file) return;
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setParseError("Please upload a .xlsx, .xls, or .csv file.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!data.length) {
          setParseError("The file appears to be empty.");
          return;
        }

        // Normalize column names (lowercase, trim)
        const normalized = data.map((row) => {
          const lower = {};
          Object.keys(row).forEach((k) => {
            lower[k.trim().toLowerCase()] = String(row[k]).trim();
          });
          return { 
            name: lower["name"] || "", 
            email: lower["email"] || "", 
            employeeId: lower["employeeid"] || lower["employee_id"] || lower["id"] || "",
            department: lower["department"] || lower["dept"] || "",
            password: lower["password"] || "" 
          };
        });

        setRows(normalized);
      } catch (_err) {
        setParseError("Could not parse the file. Make sure it's a valid Excel or CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    parseFile(e.dataTransfer.files[0]);
  };

  const validRows = rows.filter(isRowValid);
  const invalidCount = rows.length - validRows.length;

  const handleSubmit = async () => {
    if (!validRows.length) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/admin/faculty/bulk-register", { faculty: validRows });
      setResult(res.data);
      toast.success(res.data.message || "Bulk import complete!");
    } catch (_err) {
      const msg = err.response?.data?.message || "Failed to import faculty.";
      setResult({ error: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRows([]);
    setFileName(null);
    setResult(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Info panel */}
      <div className="lg:col-span-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
          <Sparkles className="h-6 w-6 text-violet-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Bulk Import</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload an Excel or CSV file to create multiple faculty accounts at once.
        </p>
        <div className="mt-6 space-y-3">
          {["Accepts .xlsx, .xls, and .csv files", "Preview rows before submitting", "Duplicates are skipped automatically", "Welcome email sent per created account", "Max 200 rows per import"].map((p) => (
            <div key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
              {p}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-6 gap-2 w-full" onClick={downloadTemplate}>
          <Download className="h-3.5 w-3.5 text-violet-500" />
          Download Template (.xlsx)
        </Button>
      </div>

      {/* Upload + Preview */}
      <div className="lg:col-span-3 space-y-4">
        {/* Drop zone */}
        {!rows.length && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-14 cursor-pointer transition-colors ${
              dragging
                ? "border-violet-500 bg-violet-500/5"
                : "border-border hover:border-violet-500/50 hover:bg-muted/30"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
              <UploadCloud className="h-6 w-6 text-violet-500" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-semibold text-foreground">Click to browse or drop file here</p>
              <p className="mt-1 text-xs text-muted-foreground">Supports .xlsx, .xls, .csv (Max 200 rows)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => parseFile(e.target.files[0])}
            />
          </div>
        )}

        {parseError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {parseError}
          </div>
        )}

        {/* Preview table */}
        {rows.length > 0 && !result && (
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 pt-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-violet-500" />
                <div>
                  <CardTitle className="text-sm">{fileName}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {rows.length} rows · {validRows.length} valid · {invalidCount > 0 ? `${invalidCount} with issues` : "all ready"}
                  </CardDescription>
                </div>
              </div>
              <button onClick={handleClear} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 border-b border-border bg-muted/60">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">#</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Faculty</th>
                      <th className="hidden sm:table-cell px-4 py-2.5 text-left font-semibold text-muted-foreground">Email</th>
                      <th className="hidden lg:table-cell px-4 py-2.5 text-left font-semibold text-muted-foreground">Password</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row, i) => (
                      <tr key={i} className={`transition-colors ${isRowValid(row) ? "hover:bg-muted/10" : "bg-rose-500/5"}`}>
                        <td className="px-4 py-2.5 font-mono text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{row.name || <span className="text-muted-foreground italic">—</span>}</span>
                            <span className="sm:hidden text-[10px] text-muted-foreground truncate max-w-[120px]">{row.email}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-2.5 text-muted-foreground">{row.email || <span className="italic">—</span>}</td>
                        <td className="hidden lg:table-cell px-4 py-2.5">
                          <span className="font-mono text-muted-foreground tracking-widest">{row.password ? "••••••••" : "—"}</span>
                        </td>
                        <td className="px-4 py-2.5"><RowBadge row={row} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning about invalid rows */}
        {rows.length > 0 && invalidCount > 0 && !result && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {invalidCount} row{invalidCount > 1 ? "s" : ""} will be skipped due to validation issues. Only {validRows.length} valid row{validRows.length !== 1 ? "s" : ""} will be submitted.
          </div>
        )}

        {/* Result summary */}
        {result && !result.error && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="pt-5 pb-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <p className="font-semibold text-foreground">Import Complete</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Created", count: result.summary?.created?.length ?? 0, color: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Skipped", count: result.summary?.skipped?.length ?? 0, color: "text-amber-600 dark:text-amber-400" },
                  { label: "Failed", count: result.summary?.failed?.length ?? 0, color: "text-rose-600 dark:text-rose-400" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              
              {/* Fake Live Log Stream of Processed Results */}
              <div className="mt-4 max-h-48 overflow-y-auto rounded-md bg-muted/40 p-2 space-y-1 text-sm font-mono">
                {result.summary?.created?.map((email, idx) => (
                  <div key={`c-${idx}`} className="flex items-center gap-2 text-emerald-600 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <CheckCircle2 className="h-3 w-3" /> {email} ... Success
                  </div>
                ))}
                {result.summary?.skipped?.map((email, idx) => (
                  <div key={`s-${idx}`} className="flex items-center gap-2 text-amber-600 animate-fade-in" style={{ animationDelay: `${(result.summary?.created?.length || 0) * 100 + idx * 100}ms` }}>
                    <AlertTriangle className="h-3 w-3" /> {email} ... Skipped
                  </div>
                ))}
                {result.summary?.failed?.map((item, idx) => (
                  <div key={`f-${idx}`} className="flex items-center gap-2 text-rose-600 animate-fade-in" style={{ animationDelay: `${((result.summary?.created?.length || 0) + (result.summary?.skipped?.length || 0)) * 100 + idx * 100}ms` }}>
                    <X className="h-3 w-3" /> {item.email} ... Failed
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={handleClear}>
                <UploadCloud className="h-3.5 w-3.5" /> Import Another File
              </Button>
            </CardContent>
          </Card>
        )}

        {result?.error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {result.error}
          </div>
        )}

        {/* Submit bar */}
        {rows.length > 0 && !result && (
          <Button
            onClick={handleSubmit}
            disabled={loading || validRows.length === 0}
            className="w-full gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</>
            ) : (
              <><Users className="h-4 w-4" /> Import {validRows.length} Faculty Account{validRows.length !== 1 ? "s" : ""}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE SHELL
// ══════════════════════════════════════════════════════════════════════════════
const RegisterFaculty = () => {
  const [tab, setTab] = useState("single");

  return (
    <AdminLayout pageTitle="Register Faculty">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Breadcrumb
          items={[
            { label: "Admin Portal", href: "/admin/dashboard" },
            { label: "Register Faculty" },
          ]}
        />

        {/* Tab switcher */}
        <div className="mb-8 flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 w-fit shadow-sm">
          <TabBtn active={tab === "single"} onClick={() => setTab("single")} icon={UserPlus} label="Single" />
          <TabBtn active={tab === "bulk"} onClick={() => setTab("bulk")} icon={FileSpreadsheet} label="Bulk Import" />
        </div>

        {tab === "single" ? <SingleForm /> : <BulkForm />}
      </div>
    </AdminLayout>
  );
};

export default RegisterFaculty;
