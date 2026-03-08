import express from "express";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Faculty login
router.post("/login", login);

// Public: Forgot / reset password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Admin-only: Only admins can register new faculty (prevents self-registration)
router.post("/register", protect, adminOnly, register);

export default router;
