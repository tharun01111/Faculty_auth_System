import express from "express";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/userController.js";
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

// Public: Forgot / reset password
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

// Admin-only: Only admins can register new faculty (prevents self-registration)
router.post("/register", protect, adminOnly, validate(facultyRegisterSchema), register);

// Protected: Change password for logged-in faculty
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
