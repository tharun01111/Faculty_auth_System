import User from "../models/Employee.js";
import Logs from "../models/LoginLog.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  sendAccountLockedEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";

const MAX_ATTEMPTS = 3;

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"] || "Unknown";

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      try {
        await Logs.create({ email, status: "FAILURE", ipAddress, userAgent });
      } catch (logErr) {
        console.error("[userController/login] Log creation failed (user not found):", logErr.message);
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Account locked
    if (user.isLocked) {
      try {
        await logAttempt(user, "FAILURE", ipAddress, userAgent);
      } catch (logErr) {
        console.error("[userController/login] Log creation failed (locked):", logErr.message);
      }
      return res.status(403).json({ message: "Account is locked. Contact admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // Wrong password
    if (!isMatch) {
      user.failedLogin += 1;

      const justLocked = user.failedLogin >= MAX_ATTEMPTS;
      if (justLocked) {
        user.isLocked = true;
      }

      await user.save();

      // Fire account-locked email (non-blocking)
      if (justLocked) {
        sendAccountLockedEmail(user);
      }

      try {
        await logAttempt(user, "FAILURE", ipAddress, userAgent);
      } catch (logErr) {
        console.error("[userController/login] Log creation failed (wrong password):", logErr.message);
      }

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Successful login
    user.failedLogin = 0;
    user.isLocked = false;
    user.lastLogin = new Date();
    await user.save();

    // Normalize: always issue JWT with canonical role "faculty"
    const canonicalRole = "faculty";
    const token = makeToken(user._id, canonicalRole);

    try {
      await logAttempt(user, "SUCCESS", ipAddress, userAgent);
    } catch (logErr) {
      console.error("[userController/login] Log creation failed (success):", logErr.message);
    }

    res.status(200).json({
      message: "Login successful",
      token,
      role: canonicalRole,
      lastLogin: user.lastLogin,
      name: user.name,
    });
  } catch (err) {
    console.error(`[userController/login] Unhandled error | Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Route is protected by 'protect' + 'adminOnly' middleware
    const id = req.user ? req.user._id : null;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hash = await bcrypt.hash(password, 10);

    const newFaculty = await User.create({
      name,
      email,
      password: hash,
      createdBy: id,
    });

    // Fire welcome email (non-blocking)
    sendWelcomeEmail(newFaculty);

    res.status(201).json({ message: "User created successfully..." });
  } catch (err) {
    console.error(`[userController/register] Unhandled error | Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// ── Forgot Password ────────────────────────────────────────────────────────────
// POST /faculty/forgot-password  { email }
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with that email address.",
      });
    }

    // Generate a random token and store its SHA-256 hash in the DB
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/faculty/reset-password/${rawToken}`;

    // Fire reset email (non-blocking)
    sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({ message: "Reset link sent successfully." });
  } catch (err) {
    console.error(`[userController/forgotPassword] Unhandled error | Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// ── Reset Password ─────────────────────────────────────────────────────────────
// POST /faculty/reset-password/:token  { password }
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Hash the incoming raw token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // token must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    // Set new hashed password and clear reset fields
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    // Also reset any lock state in case the account was locked
    user.failedLogin = 0;
    user.isLocked = false;

    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error(`[userController/resetPassword] Unhandled error | Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

const makeToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

const logAttempt = async (user, status, ipAddress, userAgent) => {
  try {
    await Logs.create({
      userId: user._id,
      email: user.email,
      status,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error("[userController/logAttempt] Log creation failed:", err.message);
    // Don't re-throw — logging is non-critical.
  }
};

// ── Change Password ─────────────────────────────────────────────────────────────
// PATCH /faculty/change-password  { currentPassword, newPassword }
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(`[userController/changePassword] Unhandled error | Type: ${err.name} | ${err.message}`);
    next(err);
  }
};
