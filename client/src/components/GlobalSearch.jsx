import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Ghost, Loader2, Hash, Building2, Settings, ScrollText, UserPlus, Key, LayoutDashboard } from "lucide-react";
import api from "../services/api";

const StatusDot = ({ status }) => {
  const colors = {
    Available: "bg-emerald-500",
    "On Leave": "bg-rose-500",
    Meeting: "bg-amber-500",
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${colors[status] || "bg-emerald-500"}`} />;
};

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const searchFaculty = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/admin/faculty");
      const allFaculty = res.data.faculty;
      const filtered = allFaculty.filter(f => 
        f.name?.toLowerCase().includes(q.toLowerCase()) ||
        f.email?.toLowerCase().includes(q.toLowerCase()) ||
        f.employeeId?.toLowerCase().includes(q.toLowerCase()) ||
        f.department?.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8); // Limit results
      setResults(filtered);
      setActiveIndex(0);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchFaculty(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchFaculty]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (_faculty) => {
    onClose();
    // For now, redirect to faculty management or a specific view if available
    // Since we don't have a detail page yet, we'll go to management
    navigate("/admin/faculty");
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[15vh] px-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={containerRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="relative flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            className="flex h-14 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search faculty by name, ID, or department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
              <span className="text-[12px]">esc</span>
            </div>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Faculty Results
              </p>
              {results.map((f, i) => (
                <button
                  key={f._id}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => handleSelect(f)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    i === activeIndex ? "bg-white/20" : "bg-primary/10 text-primary"
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{f.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        i === activeIndex ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {f.employeeId || "FAC_ID"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1.5 text-xs opacity-80">
                        <Building2 className="h-3 w-3" />
                        <span>{f.department || "No Dept"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-80">
                        <StatusDot status={f.status} />
                        <span>{f.status || "Available"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs opacity-80">
                        <Hash className="h-3 w-3" />
                        <span>{f.email}</span>
                      </div>
                    </div>
                  </div>
                  <Command className="h-4 w-4 shrink-0 opacity-40" />
                </button>
              ))}
            </div>
          ) : query ? (
            !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Ghost className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We couldn't find any faculty matching "{query}"
                </p>
              </div>
            )
          ) : (
            <div className="py-6 px-4">
              {/* Quick Actions */}
              <p className="text-xs font-semibold text-muted-foreground mb-3">⚡ Quick Actions</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { icon: LayoutDashboard, label: "Dashboard",       to: "/admin/dashboard",        color: "bg-indigo-500/10 text-indigo-600" },
                  { icon: UserPlus,       label: "Register Faculty",  to: "/admin/register-faculty", color: "bg-emerald-500/10 text-emerald-600" },
                  { icon: ScrollText,     label: "System Logs",       to: "/admin/logs",             color: "bg-amber-500/10 text-amber-600" },
                  { icon: Settings,       label: "Settings",          to: "/admin/settings",         color: "bg-violet-500/10 text-violet-600" },
                  { icon: Key,            label: "Change Password",   to: "/admin/profile",          color: "bg-rose-500/10 text-rose-600" },
                ].map(({ icon: Icon, label, to, color }) => (
                  <button
                    key={to}
                    onClick={() => { onClose(); navigate(to); }}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Search tips */}
              <p className="text-xs font-medium text-muted-foreground mb-3">Search tips</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-muted-foreground">Search by full name or email</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Hash className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-muted-foreground">Find by institutional Employee ID</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-muted-foreground">Filter by department name</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 text-[10px] text-muted-foreground">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5">↑↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5">enter</kbd> to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5">esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
