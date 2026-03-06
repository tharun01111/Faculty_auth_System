# Faculty Authentication System

A secure, modern, full-stack web application for managing Faculty and Admin authentication. Built with the **MERN stack** (MongoDB, Express, React, Node.js) and styled with **Tailwind CSS + shadcn/ui**.

---

## 🚀 Features

### Authentication & Authorization
- **Multi-Role System** — Separate secure portals for Faculty and Admins
- **JWT Sessions** — Signed JSON Web Tokens, stored in session storage
- **Persistent Login** — Session restored automatically on page reload (incl. `lastLogin` timestamp)
- **Route Protection** — `ProtectedRoute` + `PublicOnlyGate` components prevent unauthorized access
- **Smart Redirects** — Login pages redirect already-authenticated users to their dashboard

### Security
- **Password Hashing** — bcryptjs (10 salt rounds)
- **Account Locking** — Auto-locks after 3 failed login attempts; admin can unlock
- **Rate Limiting** — Max 10 login attempts per IP per 15 minutes (returns `429`)
- **Hardened CORS** — Only the configured client origin is allowed
- **Login Audit Trail** — Every attempt (Success/Failure) logged with email, IP, User Agent, and timestamp
- **Last Login Tracking** — `lastLogin` timestamp stored per faculty account and shown on the dashboard
- **Role Sealed in JWT** — Role is determined by the backend and embedded in the signed token — never trusted from the frontend

### Admin Portal
- **Real-time Stats** — Total Faculty, Active Accounts, Locked Accounts, Logins in last 24h (live from DB)
- **Faculty Management** — View all faculty, unlock locked accounts, delete accounts
- **Register Faculty** — Create new faculty accounts directly from the admin panel
- **System Logs** — Paginated, filterable login audit log (Success / Failure)
- **Email Notifications** — Automated emails on account creation, lock, and unlock events (via Resend API)

### UI / UX
- **Dark / Light Mode** — Theme toggle on every page
- **Fully Theme-Aware** — All pages use CSS token classes (no hardcoded colors)
- **Responsive Design** — Mobile-friendly layouts across all pages
- **Password Visibility Toggle** — Show/hide password on the login form
- **Context-Aware Error Banners** — Amber warning for locked accounts, red for invalid credentials
- **Shake Animation** — Error banner shakes on each new login failure
- **Loading Skeletons** — Admin dashboard stat cards show skeleton placeholders while fetching
- **Refresh Button** — Re-fetch admin stats on demand without a full page reload
- **Animated Portal Selector** — Soft gradient orb background and "All systems operational" status badge
- **Time-of-Day Greeting** — Faculty dashboard says "Good morning / afternoon / evening"
- **Micro-interactions** — Loading spinners, auto-dismissing toasts, delete confirmation modals

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
- **Framework**: React.js (Vite)
- **Routing**: React Router v7
- **State Management**: React Context API (`AuthContext` with `lastLogin`)
- **Styling**: Tailwind CSS v4, shadcn/ui, Lucide React
- **HTTP Client**: Axios (with interceptors for token injection + 401/403 handling)

### Backend (`/server`)
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: jsonwebtoken, bcryptjs, express-rate-limit, cors, dotenv
- **Email**: Resend REST API (account creation, lock, unlock notifications)

---

## 📂 Project Structure

```bash
Mini_Project/
├── client/                   # Frontend
│   ├── src/
│   │   ├── components/       # UI Components (Button, Card, Input, ThemeToggle…)
│   │   ├── context/          # AuthProvider — isAuth, role, lastLogin
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx      # Admin home — live stats + skeletons + refresh
│   │   │   ├── FacultyManagement.jsx   # List, unlock, delete faculty
│   │   │   ├── RegisterFaculty.jsx     # Create new faculty account
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
    │   ├── adminController.js   # Stats, faculty CRUD, audit logs
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

### 1. Backend Setup
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

### 2. Frontend Setup
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
| `POST` | `/faculty/register` | Admin JWT | Create new faculty account |

### Admin (`/admin`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/login` | Public | Authenticate admin (rate-limited) |
| `POST` | `/admin/register` | Public | Create admin account |
| `GET` | `/admin/stats` | Admin JWT | Live stats (faculty count, locked, logins 24h) |
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
