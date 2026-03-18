import express from "express";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getMe,
} from "../controllers/userController.js";
import { logAttendance, getMyAttendance, deleteAttendanceLog } from "../controllers/attendanceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import {
  loginSchema,
  facultyRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../schemas/authSchemas.js";

const router = express.Router();

// Public: Faculty login
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

// Public: Forgot / reset password
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

// Admin-only: Only admins can register new faculty (prevents self-registration)
router.post("/register", protect, adminOnly, validate(facultyRegisterSchema), register);

// Protected: Change password for logged-in faculty
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);

// Protected: Get own profile
router.get("/me", protect, getMe);

// Attendance (faculty, must be logged in)
router.post("/attendance", protect, logAttendance);
router.get("/attendance", protect, getMyAttendance);
router.delete("/attendance/:id", protect, deleteAttendanceLog);

export default router;

