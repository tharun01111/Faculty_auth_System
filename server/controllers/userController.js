import User from "../models/Employee.js";
import Logs from "../models/LoginLog.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 3;

export const login = async (req, res) => {
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
      await Logs.create({
        email,
        status: "FAILURE",
        ipAddress,
        userAgent,
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Account locked
    if (user.isLocked) {
      await logAttempt(user, "FAILURE", req);
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
      await logAttempt(user, "FAILURE", req);

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Successful login
    user.failedLogin = 0;
    user.isLocked = false;
    await user.save();

    const token = makeToken(user._id, user.role);

    await logAttempt(user, "SUCCESS", req);

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });

  if(user) return res.status(403).json({ message: "User already exists" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({ 
    name,
    email,
    password: hash,
  });

  res.status(201).json({ message: "User created successfully..." });
}

const makeToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

const logAttempt = async (user, status, req) => {
  await Logs.create({
    userId: user._id,
    email: user.email,
    status,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};
