// Uses Node's built-in fetch (Node 18+) — no npm package required.
// Calls the Resend REST API directly: https://resend.com/docs/api-reference/emails/send-email

const RESEND_API_URL = "https://api.resend.com/emails";

// Resend free plan: you can only send FROM onboarding@resend.dev unless you verify a domain.
// To use your own domain, add it at resend.com/domains.
const FROM = "Faculty Auth System <onboarding@resend.dev>";

// ── Shared helpers ────────────────────────────────────────────────────────────
const brand = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#4f46e5;padding:20px 28px;border-radius:8px 8px 0 0;">
      <h2 style="margin:0;color:#fff;font-size:18px;letter-spacing:.5px;">
        🎓 Faculty Auth System
      </h2>
    </div>
`;

const footer = `
    <div style="background:#f4f4f5;padding:14px 28px;border-radius:0 0 8px 8px;font-size:12px;color:#71717a;text-align:center;">
      This is an automated notification. Please do not reply to this email.
    </div>
  </div>
`;

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_PASTE_YOUR_KEY_HERE") {
    console.warn("[Email] RESEND_API_KEY not set — skipping email to:", to);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }
};

// ── 1. Account Locked ─────────────────────────────────────────────────────────
export const sendAccountLockedEmail = async (faculty) => {
  try {
    await sendEmail({
      to: faculty.email,
      subject: "⚠️ Your Faculty Account Has Been Locked",
      html: `
        ${brand}
        <div style="padding:28px;background:#fff;border:1px solid #e4e4e7;border-top:none;border-radius:0;">
          <p style="margin:0 0 12px;color:#18181b;font-size:15px;">Hello <strong>${faculty.name || faculty.email}</strong>,</p>
          <p style="color:#52525b;font-size:14px;line-height:1.6;">
            Your faculty account has been <strong style="color:#ef4444;">locked</strong> due to
            <strong>3 consecutive failed login attempts</strong>.
          </p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#991b1b;font-size:13px;">
              🔒 Account: <strong>${faculty.email}</strong><br/>
              ⏰ Locked at: <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>
            </p>
          </div>
          <p style="color:#52525b;font-size:14px;line-height:1.6;">
            If this was not you, someone may be attempting to access your account.
            Contact your system administrator immediately to have your account unlocked.
          </p>
          <p style="color:#52525b;font-size:14px;">— Faculty Auth System</p>
        </div>
        ${footer}
      `,
    });
    console.log(`[Email] Account-locked notification sent to ${faculty.email}`);
  } catch (err) {
    console.error("[Email] Failed to send account-locked email:", err.message);
  }
};

// ── 2. Welcome / Registration ─────────────────────────────────────────────────
export const sendWelcomeEmail = async (faculty) => {
  try {
    await sendEmail({
      to: faculty.email,
      subject: "🎉 Welcome to the Faculty Portal — Account Created",
      html: `
        ${brand}
        <div style="padding:28px;background:#fff;border:1px solid #e4e4e7;border-top:none;border-radius:0;">
          <p style="margin:0 0 12px;color:#18181b;font-size:15px;">Welcome, <strong>${faculty.name || faculty.email}</strong>!</p>
          <p style="color:#52525b;font-size:14px;line-height:1.6;">
            Your faculty account has been successfully created by an administrator.
            You can now log in to the Faculty Portal using the credentials provided to you.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#166534;font-size:13px;">
              📧 Login Email: <strong>${faculty.email}</strong><br/>
              🔑 Password: <em>The password set by your administrator</em>
            </p>
          </div>
          <div style="margin:24px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/faculty/login"
               style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
              Login to Faculty Portal →
            </a>
          </div>
          <p style="color:#71717a;font-size:13px;line-height:1.6;">
            For security, please change your password after your first login.
            If you did not expect this email, contact your administrator immediately.
          </p>
          <p style="color:#52525b;font-size:14px;">— Faculty Auth System</p>
        </div>
        ${footer}
      `,
    });
    console.log(`[Email] Welcome email sent to ${faculty.email}`);
  } catch (err) {
    console.error("[Email] Failed to send welcome email:", err.message);
  }
};

// ── 3. Account Unlocked ───────────────────────────────────────────────────────
export const sendAccountUnlockedEmail = async (faculty) => {
  try {
    await sendEmail({
      to: faculty.email,
      subject: "✅ Your Faculty Account Has Been Unlocked",
      html: `
        ${brand}
        <div style="padding:28px;background:#fff;border:1px solid #e4e4e7;border-top:none;border-radius:0;">
          <p style="margin:0 0 12px;color:#18181b;font-size:15px;">Hello <strong>${faculty.name || faculty.email}</strong>,</p>
          <p style="color:#52525b;font-size:14px;line-height:1.6;">
            Great news! Your faculty account has been <strong style="color:#22c55e;">unlocked</strong>
            by an administrator. You can now log in to the Faculty Portal again.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#166534;font-size:13px;">
              🔓 Account: <strong>${faculty.email}</strong><br/>
              ⏰ Unlocked at: <strong>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>
            </p>
          </div>
          <div style="margin:24px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/faculty/login"
               style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
              Login to Faculty Portal →
            </a>
          </div>
          <p style="color:#71717a;font-size:13px;line-height:1.6;">
            If you did not request this unlock, contact your administrator immediately.
          </p>
          <p style="color:#52525b;font-size:14px;">— Faculty Auth System</p>
        </div>
        ${footer}
      `,
    });
    console.log(`[Email] Account-unlocked notification sent to ${faculty.email}`);
  } catch (err) {
    console.error("[Email] Failed to send account-unlocked email:", err.message);
  }
};

// ── 4. Password Reset ─────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (faculty, resetUrl) => {
  const requestedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  try {
    await sendEmail({
      to: faculty.email,
      subject: "Reset your Faculty Portal password",
      html: `
        <div style="font-family:Inter,'Helvetica Neue',Arial,sans-serif;max-width:580px;margin:0 auto;background:#ffffff;">

          <!-- ═══ HEADER ═══ -->
          <div style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;">

                <!-- CSS-only lock icon inside indigo badge -->
                <span style="display:inline-block;vertical-align:middle;margin-right:10px;">
                  <span style="display:inline-block;background:#4f46e5;border-radius:8px;width:34px;height:34px;position:relative;text-align:center;line-height:34px;">

                    <!-- Shackle (U-shape) -->
                    <span style="display:inline-block;width:12px;height:9px;border:2.5px solid #fff;border-bottom:none;border-radius:6px 6px 0 0;position:absolute;top:5px;left:50%;margin-left:-6px;"></span>

                    <!-- Lock body -->
                    <span style="display:inline-block;background:#fff;border-radius:3px;width:16px;height:11px;position:absolute;bottom:6px;left:50%;margin-left:-8px;">
                      <!-- Keyhole -->
                      <span style="display:inline-block;background:#4f46e5;border-radius:50%;width:4px;height:4px;position:absolute;top:2px;left:50%;margin-left:-2px;"></span>
                    </span>

                  </span>
                </span>

                <span style="color:#f8fafc;font-size:15px;font-weight:600;vertical-align:middle;letter-spacing:0.2px;">Faculty Auth System</span>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="display:inline-block;border:1px solid #334155;color:#94a3b8;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:500;padding:4px 10px;border-radius:20px;">Password Reset</span>
              </td>
            </tr></table>
          </div>

          <!-- Gradient strip -->
          <div style="height:3px;background:linear-gradient(90deg,#6366f1 0%,#8b5cf6 50%,#3b82f6 100%);"></div>

          <!-- ═══ BODY ═══ -->
          <div style="padding:36px 32px;border:1px solid #e2e8f0;border-top:none;background:#ffffff;">

            <!-- Title -->
            <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.4px;">Reset your password</p>
            <p style="margin:0 0 30px;font-size:14px;color:#64748b;line-height:1.7;">
              Hi <strong style="color:#0f172a;">${faculty.name || faculty.email}</strong> &mdash;
              we received a request to reset the password for your faculty account.
              Use the button below to set a new one.
            </p>

            <!-- CTA button -->
            <div style="text-align:center;margin:0 0 32px;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:15px 48px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                Reset Password &nbsp;&rarr;
              </a>
            </div>

            <!-- ── Info tiles ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr>

              <!-- Account tile -->
              <td width="50%" style="padding-right:8px;vertical-align:top;">
                <div style="border:1px solid #e2e8f0;border-left:3px solid #6366f1;border-radius:8px;padding:14px 16px;background:#fafafa;">
                  <p style="margin:0 0 5px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;font-weight:700;">Account</p>
                  <p style="margin:0;font-size:12.5px;color:#0f172a;font-weight:600;word-break:break-all;">${faculty.email}</p>
                </div>
              </td>

              <!-- Time tile -->
              <td width="50%" style="padding-left:8px;vertical-align:top;">
                <div style="border:1px solid #e2e8f0;border-left:3px solid #8b5cf6;border-radius:8px;padding:14px 16px;background:#fafafa;">
                  <p style="margin:0 0 5px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;font-weight:700;">Requested at</p>
                  <p style="margin:0;font-size:12.5px;color:#0f172a;font-weight:600;">${requestedAt} IST</p>
                </div>
              </td>

            </tr></table>

            <!-- Expiry warning -->
            <div style="background:#fefce8;border:1px solid #fde047;border-left:4px solid #eab308;border-radius:8px;padding:14px 18px;margin-bottom:26px;">
              <p style="margin:0;font-size:13px;color:#713f12;line-height:1.7;">
                <strong style="color:#92400e;">This link expires in 15 minutes.</strong><br/>
                If you didn't request a password reset, no action is needed &mdash; your account remains secure.
              </p>
            </div>

            <!-- Fallback URL -->
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.8;">
              Button not working? Copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color:#6366f1;font-size:11px;word-break:break-all;text-decoration:underline;">${resetUrl}</a>
            </p>

          </div>

          <!-- ═══ FOOTER ═══ -->
          <div style="background:#f8fafc;padding:18px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-size:12px;color:#64748b;font-weight:500;">Faculty Auth System</p>
                <p style="margin:3px 0 0;font-size:11px;color:#94a3b8;">Automated notification &mdash; do not reply.</p>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="display:inline-block;background:#ede9fe;color:#5b21b6;font-size:10px;font-weight:700;padding:5px 12px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">Secure Mail</span>
              </td>
            </tr></table>
          </div>

        </div>
      `,
    });
    console.log(`[Email] Password-reset email sent to ${faculty.email}`);
  } catch (err) {
    console.error("[Email] Failed to send password-reset email:", err.message);
  }
};


