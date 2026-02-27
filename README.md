# Faculty Authentication System

A secure, modern, and scalable web application for managing Faculty and Admin authentication. Built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS + shadcn/ui.

## 🚀 Features

### Authentication & Authorization
- **Multi-Role System**: Separate secure portals for **Faculty** and **Admins**.
- **Secure Sessions**: JWT (JSON Web Token) based authentication with HTTP headers.
- **Persistent Login**: Automatic session restoration on page reload.
- **Route Protection**: `ProtectedRoute` components prevent unauthorized access to dashboards.
- **Smart Redirects**: 
  - Login pages redirect authenticated users to their respective dashboards.
  - "User" role (default) is automatically routed to Faculty Dashboard.

### Security  
- **Password Hashing**: Bcryptjs used for secure password storage.
- **Account Locking**: Automatically locks accounts after 3 failed login attempts.
- **Access Logging**: Tracks login attempts (Success/Failure) with IP and User Agent.
- **Middleware Protection**: Backend routes are protected with custom `authMiddleware`.

### Minimal & Modern UI
- **Tech Stack**: Tailwind CSS v4 + shadcn/ui.
- **Components**: Reusable, accessible components (Cards, Buttons, Inputs).
- **Responsive Design**: Mobile-friendly dashboards and login screens.

---

## 1️⃣ Authentication Security

### How credentials are verified only on backend
The frontend sends raw credentials (email/password) to the backend. The backend queries the database for the user. If found, it uses `bcrypt.compare()` to securely hash the input password and compare it against the stored hash. **The frontend never sees the true password hash**, and it has no logic to verify "correctness"—it strictly displays the success/failure response from the server.

### Why frontend never trusts user-declared roles
A user can easily manipulate local storage or frontend state (e.g., changing `role: "user"` to `role: "admin"` in Session Storage). Therefore, the backend **never** relies on the role sent by the frontend for critical operations. Instead, it inspects the **signed JWT** (JSON Web Token) or re-fetches the user role from the database using the ID in the token.

### How JWT is issued only after successful backend validation
A JWT is only generated and sent to the client *after* the backend has successfully verified the email and password. This token is signed with a secret key (`JWT_SECRET`) known only to the server. This prevents attackers from "forging" a valid token.

### Why role is determined by backend, not UI
The UI's job is to *display* options based on role, but the backend's job is to *enforce* them. When a user logs in, the backend decides their role based on the database record (`Admin` collection vs `Faculty` collection). This role is embedded in the signed JWT. Even if the UI is tricked into showing an "Admin Dashboard", any API call made from there will fail because the backend decodes the token and sees the true role.

### Why separate login entry points improve authority separation
We maintain distinct `/admin/login` and `/faculty/login` pages. 
- **Logical Separation**: Prevents confusion and accidental privilege escalation.
- **Targeted Security**: Admin login can be hidden or protected behind additional firewalls (e.g., VPN only) without affecting faculty access.

---

## 4️⃣ Attack Scenarios & How We Defend

### 1. User manually changing route to `/admin/dashboard`
**Attack**: A logged-in Faculty member manually types `/admin/dashboard` in the URL bar.
**Result**: The frontend `ProtectedRoute` component checks the user's role in context. Since it is `faculty` (not `admin`), they are immediately redirected to `/unauthorized`.
**Defense**: Frontend logic (`allowedRoles={['admin']}`).

### 2. Faculty attempting admin login
**Attack**: A faculty member tries to log in on `/admin/login` using their valid faculty credentials.
**Result**: The backend's `adminLogin` controller strictly searches the **Admin** collection. Since the faculty email exists only in the **Faculty** collection, the backend returns "Admin not found" or "Invalid credentials".
**Defense**: Database separation (different collections for different authority levels).

### 3. Token deletion during session
**Attack**: A user opens DevTools and deletes the `token` from Session Storage.
**Result**: The `AuthContext` detects the missing token on the next render or page refresh, updates `isAuth` to `false`, and the app immediately redirects the user to `/login`.
**Defense**: Reactive state management in React Context.

### 4. Fake role injection attempt
**Attack**: A user logs in as Faculty, then manually edits Session Storage to set `role: "admin"`. They then refresh to bypass the frontend `ProtectedRoute` and enter the Admin Dashboard.
**Result**: The dashboard loads (Frontend bypassed!), **BUT** when the dashboard tries to fetch sensitive data (e.g., `/api/admin/stats`), the backend middleware (`adminOnly`) checks the **real** role from the valid JWT/Database. It sees the user is actually Faculty and rejects the request with `403 Forbidden`. The dashboard displays a security alert.
**Defense**: **Backend Source of Truth**. This is the critical security boundary.

### 5. Stolen frontend state
**Attack**: An attacker copies the `isAuth: true` state to another browser.
**Result**: Without the valid JWT (which must be sent in the `Authorization` header), the backend will reject every single API request with `401 Unauthorized`.
**Defense**: Stateless JWT authentication. Authentication depends on the cryptographic token, not just a flag in the browser.

---

## 5️⃣ Frontend vs Backend Security Boundary

It is crucial to understand the distinction:

| Feature | **Frontend (UX Level)** | **Backend (Real Security)** |
| :--- | :--- | :--- |
| **Role Checks** | Hides/Shows buttons & pages. Can be bypassed by editing client-side code/storage. | Rejects API requests. **Cannot** be bypassed without a valid key. |
| **Validation** | Prevents bad input (e.g., "invalid email format") for better UX. | Sanitizes and validates input to prevent SQL Injection/XSS. |
| **Routing** | Redirects users away from restricted pages. | Protects the *data* endpoints that those pages would call. |

> **Key Takeaway**: The Frontend is for **User Experience** (guiding the user). The Backend is for **Authorization** (stopping the attacker). Even if the frontend is completely removed or compromised (e.g., using Postman), the backend remains secure.

---


## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework**: React.js (Vite)
- **Routing**: React Router v7
- **State Management**: React Context API (`AuthContext`)
- **Styling**: Tailwind CSS, shadcn/ui, Lucide React
- **HTTP Client**: Axios (with Interceptors for token handling)

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: jsonwebtoken, bcryptjs, cors, dotenv

---

## 📂 Project Structure

```bash
Mini_Project/
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Button, Card, Input)
│   │   ├── context/        # AuthProvider & Global State
│   │   ├── lib/            # Utilities (shadcn helpers)
│   │   ├── pages/          # Login, Dashboards, PortalSelector
│   │   ├── services/       # API Configuration & Route Guards
│   │   └── App.jsx         # Main Routing Logic
│   └── vite.config.js      # Vite Configuration
│
└── server/                 # Backend
    ├── config/             # Database Connection
    ├── controllers/        # Business Logic (User & Admin)
    ├── middleware/         # Auth & Error Handling
    ├── models/             # Mongoose Schemas (Employee, Admin, Logs)
    ├── routes/             # API Routes (Faculty & Admin)
    └── server.js           # Server Entry Point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)

### 1. Setup Backend
```bash
cd server
npm install
npm start
```
*Creates a server running on port 8080.*

**Environment Variables (.env)**
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
*Starts the development server on localhost:5173.*

**Environment Variables (.env)**
```env
VITE_SERVER_URL=http://localhost:8080
```

---

## 🔗 API Endpoints

### Faculty (`/faculty`)
- `POST /faculty/login` - Authenticate faculty member.
- `POST /faculty/register` - Register new faculty (Protected).

### Admin (`/admin`)
- `POST /admin/login` - Authenticate admin.
- `POST /admin/register` - Register new admin.

---

## 🛡️ License
This project is for educational purposes.
