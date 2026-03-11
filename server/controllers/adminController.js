import Admin from "../models/Admin.js";
import User from "../models/Employee.js"; // Faculty model
import Logs from "../models/LoginLog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendAccountUnlockedEmail } from "../services/emailService.js";

export const adminRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin) {
      res.status(400);
      throw new Error("Admin already exists...");
    }

    const hash = await bcrypt.hash(password, 10);

    await Admin.create({ name, email, password: hash });

    res.status(201).json({ message: "Successfully created an admin..." });
  } catch (err) {
    console.error(`[adminController/adminRegister] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const check = await bcrypt.compare(password, admin.password);

    if (!check) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const token = await makeToken(admin);

    res.status(200).json({ message: "Successfully logged in", token, role: "admin", name: admin.name });
  } catch (err) {
    console.error(`[adminController/adminLogin] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

const makeToken = async (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// GET /admin/stats — real counts from DB
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalFaculty, lockedAccounts, totalLogs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isLocked: true }),
      Logs.countDocuments(),
    ]);

    const activeAccounts = totalFaculty - lockedAccounts;

    // Last 24h login events
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await Logs.countDocuments({
      status: "SUCCESS",
      createdAt: { $gte: since24h },
    });

    res.status(200).json({
      totalFaculty,
      lockedAccounts,
      activeAccounts,
      recentLogins,
      systemHealth: "Good",
    });
  } catch (err) {
    console.error(`[adminController/getAdminStats] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// GET /admin/faculty — list all faculty (admin-only)
export const getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ faculty });
  } catch (err) {
    console.error(`[adminController/getAllFaculty] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// PATCH /admin/faculty/:id/unlock — reset lock on a faculty account
export const unlockFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faculty = await User.findById(id);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (!faculty.isLocked) {
      return res.status(400).json({ message: "Account is not locked" });
    }

    faculty.isLocked = false;
    faculty.failedLogin = 0;
    await faculty.save();

    // Fire account-unlocked email (non-blocking)
    sendAccountUnlockedEmail(faculty);

    res.status(200).json({
      message: `Account for ${faculty.email} has been unlocked`,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        isLocked: faculty.isLocked,
        failedLogin: faculty.failedLogin,
      },
    });
  } catch (err) {
    console.error(`[adminController/unlockFaculty] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// DELETE /admin/faculty/:id — remove a faculty account
export const deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faculty = await User.findById(id);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: `Faculty account for ${faculty.email} has been deleted`,
    });
  } catch (err) {
    console.error(`[adminController/deleteFaculty] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// GET /admin/logs — paginated login audit logs
export const getLoginLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const statusFilter = req.query.status; // "SUCCESS" | "FAILURE" | undefined
    const filter = statusFilter ? { status: statusFilter } : {};

    const [logs, total] = await Promise.all([
      Logs.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Logs.countDocuments(filter),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(`[adminController/getLoginLogs] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// GET /admin/charts — aggregated data for Recharts
export const getChartData = async (req, res, next) => {
  try {
    // Build array of last 7 day labels (oldest first)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(
        d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      );
    }

    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate login logs grouped by day and status
    const rawAgg = await Logs.aggregate([
      { $match: { createdAt: { $gte: since7d } } },
      {
        $group: {
          _id: {
            day: {
              $dateToString: { format: "%d %b", date: "$createdAt" },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Map into { day, success, failure } objects
    const dayMap = {};
    days.forEach((d) => {
      dayMap[d] = { day: d, success: 0, failure: 0 };
    });

    rawAgg.forEach(({ _id, count }) => {
      if (dayMap[_id.day]) {
        if (_id.status === "SUCCESS") dayMap[_id.day].success = count;
        else dayMap[_id.day].failure = count;
      }
    });

    const loginActivity = Object.values(dayMap);

    // Account status breakdown for pie chart
    const [totalFaculty, lockedAccounts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isLocked: true }),
    ]);

    const accountStatus = [
      { name: "Active", value: totalFaculty - lockedAccounts },
      { name: "Locked", value: lockedAccounts },
    ];

    res.status(200).json({ loginActivity, accountStatus });
  } catch (err) {
    console.error(`[adminController/getChartData] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};
