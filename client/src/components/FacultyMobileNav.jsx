/**
 * FacultyMobileNav — fixed bottom navigation bar for the faculty portal.
 * Only visible on mobile (< lg breakpoint).
 */
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, UserCircle } from "lucide-react";

const NAV_ITEMS = [
  { to: "/faculty/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/faculty/attendance", icon: ClipboardList, label: "Attendance" },
  { to: "/faculty/profile",   icon: UserCircle,     label: "Profile"   },
];

export default function FacultyMobileNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-border bg-card/90 backdrop-blur-md pb-safe lg:hidden"
      style={{ minHeight: "56px" }}
      aria-label="Faculty mobile navigation"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/faculty/dashboard"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-6 py-2 text-[10px] font-semibold transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
