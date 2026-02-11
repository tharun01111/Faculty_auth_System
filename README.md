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
