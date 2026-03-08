import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import ThemeToggle from "../components/ThemeToggle";

/* ─── Inline SVG icon set — clean geometric / monoline style ─────────────── */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>
);

const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconUserX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="17" y1="8" x2="23" y2="14" />
    <line x1="23" y1="8" x2="17" y2="14" />
  </svg>
);

const IconLock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Spinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/* ─── Component ───────────────────────────────────────────────────────────── */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotFound(false);
    setLoading(true);

    try {
      await api.post("faculty/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || "Something went wrong.";
      if (status === 404) {
        setNotFound(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4 border-b border-border/60">
        <button
          onClick={() => navigate("/faculty/login")}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrow />
          <span className="font-medium tracking-tight">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground select-none tracking-widest uppercase">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px]">

        {success ? (
          /* ── Success state ───────────────────────────────────────── */
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/8 text-emerald-500">
                <IconCheck />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Check your inbox</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A reset link was sent to<br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground border border-border/60 rounded-lg px-4 py-2.5 bg-muted/40">
                The link expires in <strong className="text-foreground">15 minutes</strong>. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => navigate("/faculty/login")}
                className="mt-1 w-full rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ──────────────────────────────────────────── */
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm"
                style={{ width: 52, height: 52 }}
              >
                <IconLock />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Forgot your password?
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter your registered faculty email to receive a reset link.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="h-px w-full bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-transparent" />

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                {/* Email field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-muted-foreground"
                  >
                    <IconMail />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="faculty@college.edu"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setNotFound(false);
                      setError(null);
                    }}
                    className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-1 ${
                      notFound
                        ? "border-amber-500/60 focus:ring-amber-500/40"
                        : "border-border focus:ring-indigo-500/40 focus:border-indigo-500/60"
                    }`}
                  />
                </div>

                {/* Not-found error — email-specific callout */}
                {notFound && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
                    <span className="mt-0.5 shrink-0 text-amber-500"><IconUserX /></span>
                    <div>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Account not found</p>
                      <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-400/80">
                        No faculty account is registered with <strong>{email}</strong>.
                        Please check the email or contact your administrator.
                      </p>
                    </div>
                  </div>
                )}

                {/* Generic error */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3">
                    <span className="mt-0.5 shrink-0 text-destructive"><IconAlert /></span>
                    <p className="text-xs text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Sending…
                    </>
                  ) : (
                    <>
                      <IconSend />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              © 2026 Faculty Auth System
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
