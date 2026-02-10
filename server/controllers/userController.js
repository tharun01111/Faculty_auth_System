import User from "../models/Employee.js";
import Logs from "../models/LoginLog.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 3;

export const login = async (req, res) => {
  try {
    console.log("LOGIN INTENT:", req.body);
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
    await user.save();

    const token = makeToken(user._id, user.role);

    try {
      await logAttempt(user, "SUCCESS", ipAddress, userAgent);
    } catch (logErr) {
      console.error("Login Log Error (Success):", logErr);
    }

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN CONTROLLER ERROR:", err); // Log the actual error
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const token = req.headers.authorization.split(" ")[1];

  const { id } = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({ email });

  if (user) return res.status(403).json({ message: "User already exists" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    createdBy: id,
  });

  res.status(201).json({ message: "User created successfully..." });
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

