import User from "../models/Employee.js";
import Logs from "../models/LoginLog.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
        await Logs.create({
          email,
          status: "FAILURE",
          ipAddress,
          userAgent,
        });
      } catch (logErr) {
        console.error("Login Log Error (User Not Found):", logErr);
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Account locked
    if (user.isLocked) {
      try {
        await logAttempt(user, "FAILURE", ipAddress, userAgent);
      } catch (logErr) {
        console.error("Login Log Error (Locked):", logErr);
      }
      return res
        .status(403)
        .json({ message: "Account is locked. Contact admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // Wrong password
    if (!isMatch) {
      user.failedLogin += 1;

      if (user.failedLogin >= MAX_ATTEMPTS) {
        user.isLocked = true;
      }

      await user.save();
      try {
        await logAttempt(user, "FAILURE", ipAddress, userAgent);
      } catch (logErr) {
        console.error("Login Log Error (Wrong Password):", logErr);
      }

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Successful login
    user.failedLogin = 0;
    user.isLocked = false;
    user.lastLogin = new Date();
    await user.save();

    // ✅ Normalize: always issue JWT with canonical role "faculty"
    const canonicalRole = "faculty";
    const token = makeToken(user._id, canonicalRole);

    try {
      await logAttempt(user, "SUCCESS", ipAddress, userAgent);
    } catch (logErr) {
      console.error("Login Log Error (Success):", logErr);
    }

    res.status(200).json({
      message: "Login successful",
      token,
      role: canonicalRole,
      lastLogin: user.lastLogin,
    });
  } catch (err) {
    console.error("LOGIN CONTROLLER ERROR:", err);
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Simple check (token verification should ideally be middleware, but keeping logic for now)
    // The route uses 'protect' middleware now, so req.user should be populated if verified.
    // However, existing logic uses req.headers manual check. 
    // Let's rely on the middleware we added in routes/faculty.routes.js which calls 'protect'.
    // 'protect' adds 'req.user'. 

    // If we want to strictly follow the old logic where createdBy comes from the token of the requester:
    
    // const token = req.headers.authorization.split(" ")[1];
    // const { id } = jwt.verify(token, process.env.JWT_SECRET);
    
    // Since we use 'protect' middleware, we can just use req.user._id
    // But 'protect' middleware might not be used on the register route in previous version?
    // The user had: const { id } = jwt.verify(token, process.env.JWT_SECRET);
    // So it was protected.
    
    const id = req.user ? req.user._id : null; 
    // If middleware is not used, this will crash. In faculty.routes.js I added verify.

    const user = await User.findOne({ email });

    if (user) {
        res.status(400); // Changed from 403 for bad request (duplicate)
        throw new Error("User already exists");
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
        name,
        email,
        password: hash,
        createdBy: id,
    });

    res.status(201).json({ message: "User created successfully..." });
  } catch(err) {
      next(err);
  }
};

const makeToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

const logAttempt = async (user, status, ipAddress, userAgent) => {
  // Ensure we don't block the main thread if logging fails
  try {
     await Logs.create({
      userId: user._id,
      email: user.email,
      status,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error("Log creation failed:", err);
    // Don't re-throw, just log it. Logging is non-critical.
  }
};

