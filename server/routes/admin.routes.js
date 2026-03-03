import express from "express";
import {
  adminLogin,
  adminRegister,
  getAdminStats,
  getAllFaculty,
  unlockFaculty,
  deleteFaculty,
  getLoginLogs,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/register", adminRegister);
router.get("/stats", protect, adminOnly, getAdminStats);

// Faculty management (admin-only)
router.get("/faculty", protect, adminOnly, getAllFaculty);
router.patch("/faculty/:id/unlock", protect, adminOnly, unlockFaculty);
router.delete("/faculty/:id", protect, adminOnly, deleteFaculty);

// Audit logs (admin-only)
router.get("/logs", protect, adminOnly, getLoginLogs);

export default router;
