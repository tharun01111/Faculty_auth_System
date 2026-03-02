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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Theme toggle — top right, pill shaped */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground select-none">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Faculty Auth System
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select your portal to continue
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid gap-3">
          {portals.map(({ path, icon: Icon, label, description, iconClass, bg, border }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${border}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${iconClass}`} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © 2026 Faculty Auth System
        </p>
      </div>
    </div>
  );
};

export default PortalSelector;
