import { useNavigate } from "react-router-dom";
import { ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const portals = [
  {
    role: "admin",
    path: "/admin/login",
    icon: ShieldCheck,
    label: "Admin Portal",
    description: "System administration & faculty management",
    iconClass: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "hover:border-indigo-500/40",
  },
  {
    role: "faculty",
    path: "/faculty/login",
    icon: GraduationCap,
    label: "Faculty Portal",
    description: "Teaching dashboard & student management",
    iconClass: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "hover:border-sky-500/40",
  },
];

const PortalSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden">

      {/* ── Decorative animated orbs ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute top-[10%] left-[5%] h-[40vh] w-[40vh] rounded-full opacity-60 mix-blend-screen blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
            animation: "orbPulse 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[10%] right-[5%] h-[35vh] w-[35vh] rounded-full opacity-50 mix-blend-screen blur-[70px]"
          style={{
            background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)",
            animation: "orbPulse 12s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Theme toggle — top right, pill shaped */}
      <div className="fixed right-4 top-4 sm:right-8 sm:top-8 z-50">
        <div className="flex items-center gap-2 rounded-full border border-border/40 bg-card/50 backdrop-blur-md px-3.5 py-2 shadow-xl ring-1 ring-white/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex w-full max-w-sm flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
        {/* Branding */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_0_25px_-5px_rgba(var(--primary),0.5)] transition-transform hover:scale-105 duration-300">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
            Faculty Auth System
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2">
             <div className="h-[1px] w-8 bg-border" />
             <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
               Secure Gateway
             </p>
             <div className="h-[1px] w-8 bg-border" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground/80">
            Please select your portal to continue
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid w-full gap-4">
          {portals.map(({ path, icon: Icon, label, description, iconClass, bg, border }, idx) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`group relative flex w-full items-center gap-5 rounded-2xl border border-border/50 bg-card/40 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card/60 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-4 duration-500 fill-mode-both`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${bg}`}>
                <Icon className={`h-5 w-5 ${iconClass}`} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {label}
                </p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground leading-relaxed">{description}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all duration-300 group-hover:bg-primary/20 group-hover:text-primary">
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer info stack */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
              Systems Operational
            </span>
          </div>

          <div className="text-center space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              © 2026 Faculty Auth System
            </p>
            <div className="h-1 w-12 mx-auto rounded-full bg-border/40" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          33% { transform: scale(1.05) translate(2%, 2%); opacity: 0.7; }
          66% { transform: scale(0.95) translate(-1%, 3%); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default PortalSelector;
