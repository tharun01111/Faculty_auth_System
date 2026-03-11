import express from "express";
import {
  adminLogin,
  adminRegister,
  getAdminStats,
  getAllFaculty,
  unlockFaculty,
  deleteFaculty,
  getLoginLogs,
  getChartData,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { loginSchema, adminRegisterSchema } from "../schemas/authSchemas.js";

const router = express.Router();

router.post("/login", validate(loginSchema), adminLogin);
router.post("/register", validate(adminRegisterSchema), adminRegister);
router.get("/stats", protect, adminOnly, getAdminStats);

// Faculty management (admin-only)
router.get("/faculty", protect, adminOnly, getAllFaculty);
router.patch("/faculty/:id/unlock", protect, adminOnly, unlockFaculty);
router.delete("/faculty/:id", protect, adminOnly, deleteFaculty);

// Audit logs (admin-only)
router.get("/logs", protect, adminOnly, getLoginLogs);

// Analytics chart data (admin-only)
router.get("/charts", protect, adminOnly, getChartData);

export default router;
