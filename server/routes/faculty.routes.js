import express from "express";
import { login, register } from "../controllers/userController.js";
import { protect, facultyOnly, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Faculty login
router.post("/login", login);

// Admin-only: Only admins can register new faculty (prevents self-registration)
router.post("/register", protect, adminOnly, register);

// Protected example: Any future faculty-only endpoint follows this pattern:
// router.get("/profile", protect, facultyOnly, getFacultyProfile);

export default router;
