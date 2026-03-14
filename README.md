# Faculty Authentication System

A secure, modern, full-stack web application for managing Faculty and Admin authentication. Built with the **MERN stack** (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS + shadcn/ui**.

---

## 🚀 Features

### Authentication & Authorization
- **Multi-Role System** — Separate secure portals for Faculty and Admins
- **JWT Sessions** — Signed JSON Web Tokens, stored in session storage
- **Persistent Login** — Session restored automatically on page reload (incl. `lastLogin` timestamp)
- **Forgot Password Flow** — Secure password reset via email using signed short-lived tokens
- **Route Protection** — `ProtectedRoute` + `PublicOnlyGate` components prevent unauthorized access
- **Smart Redirects** — Login pages redirect already-authenticated users to their dashboard

### Security
- **HttpOnly Cookies** — JWTs are stored securely in HttpOnly cookies to protect against XSS attacks
- **Password Hashing** — bcryptjs (10 salt rounds)
- **Account Auto-Locking** — Auto-locks after 3 failed login attempts with a 15-minute cooldown (`lockUntil`) before automatic unlock (admin can also manually unlock)
- **Admin Registration Security** — Strict route protection on endpoints preventing unauthorized admin accounts
- **Rate Limiting** — Max 10 login attempts per IP per 15 minutes (returns `429`)
- **Hardened CORS** — Only the configured client origin is allowed
- **Login Audit Trail** — Every attempt (Success/Failure) logged with email, IP, User Agent, and timestamp. Includes automated 30-day purge scripts
- **Last Login Tracking** — `lastLogin` timestamp stored per faculty account and shown on the dashboard
- **Role Sealed in JWT** — Role is determined by the backend and embedded in the signed token — never trusted from the frontend
- **Zod Validation** — Strict schema validation for all incoming requests (auth, registration, settings)
- **Helmet.js** — Security-oriented HTTP headers (XSS protection, CSP, etc.)

### Admin Portal
- **Real-time Stats** — Total Faculty, Active Accounts, Locked Accounts, Logins in last 24h (live from DB)
- **Global Search** — Spotlight-style command palette (`Ctrl/⌘ + K`) to find faculty by name, ID, or email instantly
- **Departmental Filtering** — Tabbed interface to view and manage faculty grouped by their respective departments
- **Analytics Charts** — Interactive Bar Chart (7-day login activity) and Donut Chart (account status) powered by Recharts
- **Faculty Management** — View all faculty, unlock locked accounts, delete accounts
- **Register Faculty** — Single and Bulk faculty registration with `Employee ID` and `Department` fields
- **System Logs** — Paginated, filterable login audit log (Success / Failure)
- **Email Notifications** — Automated emails on account creation, lock, and unlock events (via Resend API)

### UI / UX
- **Dark / Light Mode & Glassmorphism** — OLED-friendly dark mode base (`#121212`) and frosted glass surfaces (`backdrop-blur-md`)
- **Advanced Loading States** — Animated CSS shimmer skeletons, cascading staggered row loading, and `nprogress` route transition bars
- **Haptic Feedback & Toasts** — Sliding `sonner` toast notifications and context-aware 401/403 event handling for seamless SPA experience
- **Micro-interactions** — Buttons feature `active:scale-[0.98]` physical press states, contextual success loops, and card hover lift effects
- **Simulated "Live Log"** — Bulk import results are displayed via an animated, sequentially-staggered stream
- **Spotlight Search** — Advanced command palette with keyboard navigation, blurred backdrops, and animated transitions
- **A11y & Keyboard Shortcuts** — Press `/` to focus search, `Ctrl+K` for global search, icon Tooltips, and password strength indicators
- **Animated Analytics** — Custom-styled Recharts components with explicit entrance animations (`isAnimationActive`), responsive containers, and theme-aware tooltips
- **Animated Portal Selector** — Soft gradient orb background and "All systems operational" status badge
- **Time-of-Day Greeting** — Faculty dashboard says "Good morning / afternoon / evening"

---

## 🛡️ Security Design

### Credentials verified only on the backend
The frontend sends raw credentials (email/password) to the backend. The backend queries the database, then uses `bcrypt.compare()` to compare the input against the stored hash. **The frontend never sees the hash**, and has no logic to verify correctness — it only displays the server's response.

### Frontend never trusts user-declared roles
A user can manipulate localStorage or Session Storage (e.g., change `role: "faculty"` to `role: "admin"`). The backend **never** relies on the role from the frontend. It reads the **signed JWT** to determine role, and the middleware re-enforces it on every request.

### JWT issued only after successful backend validation
A JWT is only generated *after* the backend verifies email and password. It is signed with `JWT_SECRET` — a server-only secret. This prevents forgery.

### Separate login entry points for authority separation
- `/admin/login` → queries the `Admin` collection only
- `/faculty/login` → queries the `Faculty` collection only

A faculty member's credentials on the admin login route will always fail because the collections are separate.

---

## ⚔️ Attack Scenarios & Defenses

| Attack | What Happens | Defense |
|:---|:---|:---|
| Faculty navigates to `/admin/dashboard` | `ProtectedRoute` checks role in context → redirects to `/unauthorized` | Frontend role check |
| Faculty tries admin login with faculty credentials | `adminLogin` searches `Admin` collection only → `"Invalid credentials"` | DB collection separation |
| User deletes JWT from Session Storage | `AuthContext` detects missing token → redirects to `/login` | Reactive React context |
| User edits `role: "admin"` in Session Storage | Dashboard loads, but every API call returns `403 Forbidden` (backend reads JWT role) | **Backend source of truth** |
| Stolen `isAuth: true` flag in another browser | No valid JWT → every API call returns `401 Unauthorized` | Stateless JWT auth |
| Brute-force login | After 10 attempts in 15 min → `429 Too Many Requests`; after 3 wrong passwords → account locked | Rate limiter + account lock |
| Expired token on protected route | Backend returns `"Session expired, please log in again"` (distinct from invalid token) | `TokenExpiredError` handling in auth middleware |

---

## 🔍 Backend Error Handling

Every error in the system is traced to its exact source:

- **`[ERROR]` log line** — every unhandled error prints: `timestamp | METHOD /route | Status | Type | Message`
- **Controller prefix** — each catch block logs `[adminController/fnName]` or `[userController/fnName]`  
- **Auth middleware** — distinguishes `TokenExpiredError` from malformed tokens; logs forbidden access with the violating role
- **404 handler** — unmatched routes return `{ "message": "Route not found: GET /bad-path" }`  
- **Process-level safety** — `unhandledRejection` and `uncaughtException` are caught and logged before graceful exit  
- **DB connection** — failure logs the MongoDB error `code` + `message` with a `[DB]` prefix

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework**: React.js 19 (Vite)
- **Routing**: React Router v7
- **State Management**: React Context API
- **Styling**: Tailwind CSS v4, shadcn/ui, Lucide React, Framer Motion (for smooth transitions)
- **Charts**: Recharts
- **Security**: Zod (Client-side validation), Lucide icons
- **HTTP Client**: Axios (with interceptors for token injection + 401/403 handling)

### Backend (`/server`)
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: Helmet, Zod (Server-side validation), jsonwebtoken, bcryptjs, express-rate-limit
- **Email**: Resend REST API (account creation, lock, unlock, password reset)

---

## 📂 Project Structure

```bash
Mini_Project/
├── client/                   # Frontend
│   ├── src/
│   │   ├── components/       # UI Components (Button, Card, GlobalSearch, ThemeToggle…)
│   │   ├── context/          # AuthProvider — isAuth, role, lastLogin
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx      # Admin home — live stats + Recharts analytics
│   │   │   ├── FacultyManagement.jsx   # Tabbed directory, unlock, delete faculty
│   │   │   ├── RegisterFaculty.jsx     # Single & Bulk registration
│   │   │   ├── ForgotPassword.jsx      # Password reset request flow
│   │   │   ├── ResetPassword.jsx       # Password update via secure link
│   │   │   ├── SystemLogs.jsx          # Login audit trail
│   │   │   ├── FacultyDashboard.jsx    # Faculty home — greeting + last login
│   │   │   ├── Login.jsx               # Role-aware login form with password toggle
│   │   │   └── PortalSelector.jsx      # Entry point with animated background
│   │   ├── services/         # Axios config & Route Guards
│   │   └── App.jsx           # Main routing
│   └── vite.config.js
│
└── server/                   # Backend
    ├── config/
    │   └── db.js                # MongoDB connection with structured error logging
    ├── controllers/
    │   ├── adminController.js   # Stats, faculty CRUD, audit logs, chart data aggregation
    │   └── userController.js    # Faculty login & register
    ├── middleware/
    │   ├── authMiddleware.js    # protect (token expiry aware), adminOnly, facultyOnly
    │   └── errorMiddleware.js   # Structured [ERROR] logger + 404 notFoundHandler
    ├── models/
    │   ├── Employee.js   # Faculty schema (isLocked, failedLogin, lastLogin…)
    │   ├── Admin.js      # Admin schema
    │   └── LoginLog.js   # Audit log schema
    ├── routes/
    │   ├── faculty.routes.js
    │   └── admin.routes.js
    ├── services/
    │   └── emailService.js  # Resend API — welcome, lock, unlock emails
    └── server.js         # Entry point (CORS, rate limiter, routes, 404, process listeners)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)
- Resend API key *(optional — emails are skipped gracefully without it)*

### Quick Start (Recommended)
From the root directory, run the monorepo script to launch both client and server concurrently:
```bash
npm install
npm run dev
```

### Manual Setup

**1. Backend**
```bash
cd server
npm install
npm run dev         # nodemon auto-reload
```

**`server/.env`**
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=re_your_resend_key        # optional
ADMIN_EMAIL=you@yourdomain.com           # optional — sender address
```

**2. Frontend**
```bash
cd client
npm install
npm run dev
```

**`client/.env`**
```env
VITE_SERVER_URL=http://localhost:8080
```

App runs at `http://localhost:5173`.

---

## 🔗 API Endpoints

### Faculty (`/faculty`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/faculty/login` | Public | Authenticate faculty (rate-limited) |
| `POST` | `/faculty/register` | Admin JWT | Create new faculty account (with ID & Dept) |
| `POST` | `/faculty/forgot-password` | Public | Request password reset email |
| `POST` | `/faculty/reset-password` | Token | Update password using reset token |

### Admin (`/admin`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/login` | Public | Authenticate admin (rate-limited) |
| `POST` | `/admin/register` | Public | Create admin account |
| `POST` | `/admin/faculty/bulk-register` | Admin JWT | Bulk import faculty from Excel template |
| `GET` | `/admin/stats` | Admin JWT | Live stats (faculty count, locked, logins 24h) |
| `GET` | `/admin/charts` | Admin JWT | Aggregated chart data — 7-day login activity + account status breakdown |
| `GET` | `/admin/faculty` | Admin JWT | List all faculty accounts |
| `PATCH` | `/admin/faculty/:id/unlock` | Admin JWT | Unlock a locked faculty account |
| `DELETE` | `/admin/faculty/:id` | Admin JWT | Delete a faculty account |
| `GET` | `/admin/logs` | Admin JWT | Paginated login audit logs (`?page=1&limit=20&status=FAILURE`) |

### Error Responses
All error responses follow a consistent shape:
```json
{
  "message": "Human-readable description",
  "errorType": "ValidationError",   // dev only
  "stack": "..."                    // dev only
}
```

---

## 🛡️ License
This project is for educational purposes.
