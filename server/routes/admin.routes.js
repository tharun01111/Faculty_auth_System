import express from "express";
import {
  adminLogin,
  adminRegister,
  getAdminStats,
  getAllFaculty,
  unlockFaculty,
  deleteFaculty,
  bulkDeleteFaculty,
  bulkUpdateFacultyStatus,
  getLoginLogs,
  getChartData,
  getRecentActivity,
  getAdminOverview,
  adminLogout,
  getBranding,
  updateBranding,
  updateFacultyStatus,
  getAuditLogs,
} from "../controllers/adminController.js";
import { getAdminAttendance } from "../controllers/attendanceController.js";
import { register, bulkRegister } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { loginSchema, adminRegisterSchema, bulkRegisterSchema } from "../schemas/authSchemas.js";

const router = express.Router();

router.post("/login", validate(loginSchema), adminLogin);
router.post("/logout", adminLogout);
router.post("/register", validate(adminRegisterSchema), adminRegister);
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/overview", protect, adminOnly, getAdminOverview);

// Faculty management (admin-only)
router.get("/faculty", protect, adminOnly, getAllFaculty);
router.patch("/faculty/:id/unlock", protect, adminOnly, unlockFaculty);
router.delete("/faculty/:id", protect, adminOnly, deleteFaculty);
router.post("/faculty/bulk-register", protect, adminOnly, validate(bulkRegisterSchema), bulkRegister);
// Bulk operations
router.delete("/faculty/bulk", protect, adminOnly, bulkDeleteFaculty);
router.patch("/faculty/bulk-status", protect, adminOnly, bulkUpdateFacultyStatus);
router.patch("/faculty/:id/status", protect, adminOnly, updateFacultyStatus);

// Audit & activity logs (admin-only)
router.get("/logs", protect, adminOnly, getLoginLogs);
router.get("/audit-logs", protect, adminOnly, getAuditLogs);
router.get("/activity", protect, adminOnly, getRecentActivity);

// Analytics chart data (admin-only)
router.get("/charts", protect, adminOnly, getChartData);

// Admin attendance view
router.get("/attendance", protect, adminOnly, getAdminAttendance);

// Branding (GET is public for CSS vars)
router.get("/branding", getBranding);
router.patch("/branding", protect, adminOnly, updateBranding);

export default router;
