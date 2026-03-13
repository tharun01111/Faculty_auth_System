import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";
import {
  School,
  LayoutDashboard,
  Users,
  UserPlus,
  ScrollText,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/admin/faculty",
    icon: Users,
    label: "Faculty",
  },
  {
    to: "/admin/register-faculty",
    icon: UserPlus,
    label: "Register Faculty",
  },
  {
    to: "/admin/logs",
    icon: ScrollText,
    label: "System Logs",
  },
];

// ── Sidebar link ───────────────────────────────────────────────────────────────
const SideNavLink = ({ to, icon: Icon, label, collapsed, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === "/admin/dashboard"}
    className={({ isActive }) =>
      `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${collapsed ? "justify-center" : ""}`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`h-4.5 w-4.5 shrink-0 h-[18px] w-[18px] ${isActive ? "text-primary-foreground" : ""}`} />
        {!collapsed && <span className="truncate">{label}</span>}
        {/* Tooltip on collapsed */}
        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-md group-hover:block z-50">
            {label}
          </span>
        )}
        {/* Active indicator dot when collapsed */}
        {collapsed && isActive && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
        )}
      </>
    )}
  </NavLink>
);

// ── Desktop Sidebar ────────────────────────────────────────────────────────────
const DesktopSidebar = ({ collapsed, setCollapsed, name }) => (
  <aside
    className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-border bg-card/80 backdrop-blur-md transition-all duration-300 ${
      collapsed ? "w-[68px]" : "w-56"
    }`}
  >
    {/* Logo area */}
    <div className={`flex items-center gap-3 border-b border-border px-4 py-4 ${collapsed ? "justify-center px-2" : ""}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <School className="h-4 w-4" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none">
            Admin Portal
          </p>
          <p className="mt-0.5 text-sm font-bold tracking-tight text-foreground truncate">
            Faculty Auth
          </p>
        </div>
      )}
    </div>

    {/* Nav links */}
    <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
      {NAV_ITEMS.map((item) => (
        <SideNavLink key={item.to} {...item} collapsed={collapsed} />
      ))}
    </nav>

    {/* Bottom: user chip + theme + logout */}
    <div className={`border-t border-border px-2 py-3 space-y-2 ${collapsed ? "flex flex-col items-center" : ""}`}>
      {!collapsed && name && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
        </div>
      )}
      {collapsed && name && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`flex gap-1 ${collapsed ? "flex-col items-center" : "items-center px-1"}`}>
        <ThemeToggle />
        <LogoutButton compact={collapsed} />
      </div>
    </div>

    {/* Collapse toggle */}
    <button
      onClick={() => setCollapsed((v) => !v)}
      className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm text-muted-foreground hover:text-foreground transition-colors"
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
    </button>
  </aside>
);

// ── Mobile Drawer ──────────────────────────────────────────────────────────────
const MobileDrawer = ({ open, onClose, name }) => (
  <>
    {/* Overlay */}
    {open && (
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
    )}
    {/* Drawer */}
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/80 backdrop-blur-md transition-transform duration-300 lg:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <School className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none">
              Admin Portal
            </p>
            <p className="mt-0.5 text-sm font-bold tracking-tight text-foreground">
              Faculty Auth
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SideNavLink key={item.to} {...item} collapsed={false} onClick={onClose} />
        ))}
      </nav>

      <div className="border-t border-border px-2 py-3 space-y-2">
        {name && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{name}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1 px-1">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </aside>
  </>
);

// ── Top Bar (mobile) ───────────────────────────────────────────────────────────
const TopBar = ({ onMenuClick, pageTitle }) => (
  <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 lg:hidden">
    <div className="flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <School className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-bold tracking-tight text-foreground">{pageTitle}</p>
      </div>
    </div>
    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      ● Admin
    </span>
  </header>
);

// ── Main Layout ────────────────────────────────────────────────────────────────
/**
 * AdminLayout wraps all admin pages with a persistent sidebar.
 *
 * Props:
 *   - children: page content
 *   - pageTitle: string shown in mobile top bar (e.g. "Dashboard")
 */
const AdminLayout = ({ children, pageTitle = "Admin" }) => {
  const { name } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <DesktopSidebar collapsed={collapsed} setCollapsed={setCollapsed} name={name} />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} name={name} />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[68px]" : "lg:pl-56"}`}>
        {/* Mobile top bar */}
        <TopBar onMenuClick={() => setDrawerOpen(true)} pageTitle={pageTitle} />

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
