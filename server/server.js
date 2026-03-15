import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDb from "./config/db.js";
import facultyRoutes from "./routes/faculty.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
import { pruneOldLogs } from "./utils/cleanupLogs.js";

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
app.use(cookieParser());

// ── Security Headers (Helmet) ─────────────────────────────────────────────
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

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/faculty/login", loginLimiter);
app.use("/admin/login", loginLimiter);

app.use("/faculty", facultyRoutes);
app.use("/admin", adminRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "The app is working..." });
});

// ── 404 & Error Handlers ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Database Connection & Server Start ────────────────────────────────────────
const PORT = process.env.PORT || 8080;

connectDb().then(() => {
  pruneOldLogs();
  setInterval(pruneOldLogs, 24 * 60 * 60 * 1000);

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("[Process] Unhandled Promise Rejection:", reason);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err) => {
    console.error("[Process] Uncaught Exception:", err.name, "|", err.message);
    process.exit(1);
  });
});
