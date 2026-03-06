import User from "../models/Employee.js";
import Logs from "../models/LoginLog.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendAccountLockedEmail, sendWelcomeEmail } from "../services/emailService.js";

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
