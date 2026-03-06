// Uses Node's built-in fetch (Node 18+) — no npm package required.
// Calls the Resend REST API directly: https://resend.com/docs/api-reference/emails/send-email

const RESEND_API_URL = "https://api.resend.com/emails";

const FROM = process.env.ADMIN_EMAIL || "onboarding@resend.dev";

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
