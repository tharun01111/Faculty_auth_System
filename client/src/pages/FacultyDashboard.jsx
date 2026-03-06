import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import {
  CalendarDays,
  Users,
  FileBarChart2,
  BookOpen,
  Bell,
  ClipboardList,
  GraduationCap,
  Clock,
} from "lucide-react";

const actionCards = [
  {
    icon: CalendarDays,
    title: "My Schedule",
    description: "View today's classes and weekly timetable.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Users,
    title: "Students",
    description: "Browse and manage your assigned students.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: FileBarChart2,
    title: "Reports",
    description: "Generate and download performance reports.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BookOpen,
    title: "Courses",
    description: "Manage your course materials and syllabi.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: ClipboardList,
    title: "Attendance",
    description: "Record and review student attendance.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Bell,
    title: "Announcements",
    description: "Post updates and notices for students.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

/** Returns "Good morning", "Good afternoon", or "Good evening" based on current hour */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/** Formats a stored ISO date string into a readable "last login" label */
const formatLastLogin = (isoString) => {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return null;
  }
};

const FacultyDashboard = () => {
  const { lastLogin } = useContext(AuthContext);
  const greeting = getGreeting();
  const lastLoginFormatted = formatLastLogin(lastLogin);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Faculty Portal
              </p>
              <h1 className="text-sm font-bold leading-tight tracking-tight text-foreground sm:text-base">
                Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* ── Greeting ── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting} 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is your faculty portal overview for today.
          </p>
          {lastLoginFormatted && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Last login: <span className="font-medium text-foreground">{lastLoginFormatted}</span>
            </div>
          )}
        </div>

        {/* ── Quick Stats ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <CalendarDays className="h-5 w-5 text-indigo-500" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Today's Classes</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                <Users className="h-5 w-5 text-sky-500" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">—</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <FileBarChart2 className="h-5 w-5 text-emerald-500" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold text-foreground">—</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Actions ── */}
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actionCards.map(({ icon: Icon, title, description, color, bg }) => (
            <button
              key={title}
              className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </span>
              <div>
                <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Notice ── */}
        <div className="mt-10 rounded-xl border border-border bg-muted/40 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">No new announcements</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You are all caught up. Check back later for updates from administration.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;