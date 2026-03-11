import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDb from "./config/db.js";
import facultyRoutes from "./routes/faculty.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (Postman, curl) during dev
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Security Headers (Helmet) ─────────────────────────────────────────────
// Sets 14 security-related HTTP headers automatically.
// contentSecurityPolicy disabled in dev to avoid blocking localhost assets;
// re-enable (or customise) in production.
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Database Connection
connectDb();

// ── Routes ────────────────────────────────────────────────────────────────────
// Apply rate limiter only to login routes
app.use("/faculty/login", loginLimiter);
app.use("/admin/login", loginLimiter);

app.use("/faculty", facultyRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/api/test", (req, res) => {
  res.json({ message: "The app is working..." });
});

// ── 404 — must be placed after all valid routes ────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

// ── Process-level safety nets ─────────────────────────────────────────────────
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Process] Unhandled Promise Rejection:", reason);
  // Gracefully shut down so the process manager can restart
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("[Process] Uncaught Exception:", err.name, "|", err.message);
  console.error(err.stack);
  process.exit(1);
});