import express from "express";
import { login, register } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, register); // Protecting register to only allow existing users/admins to create new faculty? 
// Original code had:
// const token = req.headers.authorization.split(" ")[1];
// const { id } = jwt.verify(token, process.env.JWT_SECRET);
// This implies registration is protected.

export default router;
