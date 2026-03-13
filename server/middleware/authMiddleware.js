import jwt from "jsonwebtoken";
import User from "../models/Employee.js"; // Faculty Model
import Admin from "../models/Admin.js";   // Admin Model

export const protect = async (req, res, next) => {
  let token = req.cookies?.jwt;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    // ✅ Decode and verify. JWT is the source of truth for role.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up user in DB for existence check (revocation-ready)
    let user = await User.findById(decoded.id).select("-password");
    if (!user) {
      user = await Admin.findById(decoded.id).select("-password");
      if (user) {
        user = user.toObject();
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // ✅ Role comes from JWT payload — never trusted from request body
    user.role = decoded.role;
    req.user = user;
    next();
  } catch (error) {
    // Distinguish expired tokens from truly invalid ones so the client can show
    // a better message (e.g. "Session expired, please log in again")
    if (error.name === "TokenExpiredError") {
      console.error(`[authMiddleware] Token expired | Route: ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    console.error(
      `[authMiddleware] Invalid token | Type: ${error.name} | Route: ${req.method} ${req.originalUrl} | ${error.message}`
    );
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// ✅ Admin-only gate — 403 if role is not admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.warn(
      `[authMiddleware] Forbidden: non-admin tried to access ${req.method} ${req.originalUrl} | role: ${req.user?.role}`
    );
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};

// ✅ Faculty-only gate — 403 if role is not faculty
export const facultyOnly = (req, res, next) => {
  if (req.user && req.user.role === "faculty") {
    next();
  } else {
    console.warn(
      `[authMiddleware] Forbidden: non-faculty tried to access ${req.method} ${req.originalUrl} | role: ${req.user?.role}`
    );
    return res.status(403).json({ message: "Forbidden: Faculty access required" });
  }
};
