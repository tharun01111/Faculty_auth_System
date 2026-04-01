import Admin from "../models/Admin.js";
import User from "../models/Employee.js"; // Faculty model
import Logs from "../models/LoginLog.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendAccountUnlockedEmail } from "../services/emailService.js";

export const getAdminOverview = async (req, res, next) => {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalFaculty,
      lockedAccounts,
      onLeave,
      inMeeting,
      recentLogins,
      logs,
      rawAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isLocked: true }),
      User.countDocuments({ isLocked: false, status: "On Leave" }),
      User.countDocuments({ isLocked: false, status: "Meeting" }),
      Logs.countDocuments({ status: "SUCCESS", createdAt: { $gte: since24h } }),
      Logs.find().sort({ createdAt: -1 }).limit(12).lean(),
      Logs.aggregate([
        { $match: { createdAt: { $gte: since7d } } },
        {
          $group: {
            _id: { day: { $dateToString: { format: "%d %b", date: "$createdAt" } }, status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const activeAccounts = totalFaculty - lockedAccounts;
    const available = totalFaculty - lockedAccounts - onLeave - inMeeting;

    const stats = {
      totalFaculty, lockedAccounts, activeAccounts, recentLogins, workforceStatus: { available, onLeave, inMeeting }, systemHealth: "Good",
    };

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }));
    }

    const dayMap = {};
    days.forEach((d) => { dayMap[d] = { day: d, success: 0, failure: 0 }; });

    rawAgg.forEach(({ _id, count }) => {
      if (dayMap[_id.day]) {
        if (_id.status === "SUCCESS") dayMap[_id.day].success = count;
        else dayMap[_id.day].failure = count;
      }
    });

    const loginActivity = Object.values(dayMap);
    const accountStatus = [
      { name: "Active", value: totalFaculty - lockedAccounts },
      { name: "Locked", value: lockedAccounts },
    ];
    const charts = { loginActivity, accountStatus };

    res.status(200).json({ stats, charts, activity: { logs } });
  } catch (err) {
    console.error(`[adminController/getAdminOverview] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const adminRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const adminCount = await Admin.countDocuments();

    // If there's already an admin, only allow other admins to register new ones
    if (adminCount > 0) {
      // Manual check for admin token (since we removed protect/adminOnly from the route)
      let token = req.cookies?.jwt;

      if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return res.status(401).json({ message: "Admin registration is restricted. Please log in as an admin first." });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
           return res.status(403).json({ message: "Forbidden: Only admins can register new admins." });
        }
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired admin token." });
      }
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      res.status(400);
      throw new Error("Admin with this email already exists...");
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

    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({ message: "Successfully logged in", role: "admin", name: admin.name });
  } catch (err) {
    console.error(`[adminController/adminLogin] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

export const adminLogout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Successfully logged out" });
};

const makeToken = async (admin) => {
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// GET /admin/stats — real counts from DB
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalFaculty, lockedAccounts, totalLogs, onLeave, inMeeting] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isLocked: true }),
      Logs.countDocuments(),
      User.countDocuments({ isLocked: false, status: "On Leave" }),
      User.countDocuments({ isLocked: false, status: "Meeting" }),
    ]);

    const activeAccounts = totalFaculty - lockedAccounts;
    const available = totalFaculty - lockedAccounts - onLeave - inMeeting;

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
      workforceStatus: { available, onLeave, inMeeting },
      systemHealth: "Good",
    });
  } catch (err) {
    console.error(`[adminController/getAdminStats] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// GET /admin/activity — recent login events feed
export const getRecentActivity = async (req, res, next) => {
  try {
    const logs = await Logs.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    res.status(200).json({ logs });
  } catch (err) {
    console.error(`[adminController/getRecentActivity] Type: ${err.name} | ${err.message}`);
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

    // Audit log
    AuditLog.create({
      action: "UNLOCK_ACCOUNT",
      performedBy: req.user?.id,
      performedByName: "Admin",
      targetFaculty: faculty.email,
      targetFacultyName: faculty.name,
      description: `Unlocked account for ${faculty.name} (${faculty.email})`,
    }).catch(() => {});

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

export const deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faculty = await User.findById(id);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    await User.findByIdAndDelete(id);

    // Audit log
    AuditLog.create({
      action: "DELETE_FACULTY",
      performedBy: req.user?.id,
      performedByName: "Admin",
      targetFaculty: faculty.email,
      targetFacultyName: faculty.name,
      description: `Deleted faculty account: ${faculty.name} (${faculty.email}) — Dept: ${faculty.department || "N/A"}`,
    }).catch(() => {});

    res.status(200).json({
      message: `Faculty account for ${faculty.email} has been deleted`,
    });
  } catch (err) {
    console.error(`[adminController/deleteFaculty] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// DELETE /admin/faculty/bulk — bulk delete faculty by IDs
export const bulkDeleteFaculty = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const facultyList = await User.find({ _id: { $in: ids } }).select("name email department");
    await User.deleteMany({ _id: { $in: ids } });

    // Audit log
    AuditLog.create({
      action: "BULK_DELETE",
      performedBy: req.user?.id,
      performedByName: "Admin",
      targetFaculty: facultyList.map(f => f.email).join(", "),
      targetFacultyName: facultyList.map(f => f.name).join(", "),
      description: `Bulk deleted ${facultyList.length} faculty account(s).`,
    }).catch(() => {});

    res.status(200).json({ message: `${facultyList.length} faculty account(s) deleted.`, deleted: ids.length });
  } catch (err) {
    console.error(`[adminController/bulkDeleteFaculty] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// PATCH /admin/faculty/bulk-status — bulk update faculty status
export const bulkUpdateFacultyStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }
    if (!["Available", "On Leave", "Meeting"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await User.updateMany({ _id: { $in: ids } }, { status });

    // Audit log
    AuditLog.create({
      action: "BULK_STATUS_UPDATE",
      performedBy: req.user?.id,
      performedByName: "Admin",
      targetFaculty: `${ids.length} faculty`,
      description: `Bulk status updated to "${status}" for ${ids.length} faculty.`,
      newValue: status,
    }).catch(() => {});

    res.status(200).json({ message: `Status updated to "${status}" for ${ids.length} faculty.` });
  } catch (err) {
    console.error(`[adminController/bulkUpdateFacultyStatus] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// POST /admin/faculty/bulk-register
export const bulkRegisterFaculty = async (req, res, next) => {
  try {
    const { faculty } = req.body;
    if (!Array.isArray(faculty)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const summary = { created: [], skipped: [], failed: [] };
    const adminId = req.user?.id;

    for (const f of faculty) {
      try {
        const exists = await User.findOne({ 
          $or: [{ email: f.email }, { employeeId: f.employeeId }] 
        });
        if (exists) {
          summary.skipped.push(f.email);
          continue;
        }

        const hash = await bcrypt.hash(f.password, 10);
        await User.create({
          ...f,
          password: hash,
          createdBy: adminId
        });
        
        // sendWelcomeEmail(newUser); // Optional
        summary.created.push(f.email);
      } catch (err) {
        summary.failed.push({ email: f.email, error: err.message });
      }
    }

    res.status(201).json({ 
      message: `Bulk registration complete: ${summary.created.length} created, ${summary.skipped.length} skipped.`,
      summary 
    });
  } catch (err) {
    console.error(`[adminController/bulkRegisterFaculty] Type: ${err.name} | ${err.message}`);
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

// GET /admin/branding
export const getBranding = async (req, res, next) => {
  try {
    const admin = await Admin.findOne().select("branding");
    res.status(200).json(admin?.branding || { logo: "", primaryColor: "#6366f1" });
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/branding
export const updateBranding = async (req, res, next) => {
  try {
    const { logo, primaryColor } = req.body;
    let admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.branding = { logo, primaryColor };
    await admin.save();
    res.status(200).json(admin.branding);
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/faculty/:id/status
export const updateFacultyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Available", "On Leave", "Meeting"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const faculty = await User.findById(id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const oldStatus = faculty.status;
    faculty.status = status;
    await faculty.save();

    // Audit log
    AuditLog.create({
      action: "STATUS_CHANGE",
      performedBy: req.user?.id,
      performedByName: "Admin",
      targetFaculty: faculty.email,
      targetFacultyName: faculty.name,
      description: `Changed status of ${faculty.name} (${faculty.email}) from "${oldStatus}" to "${status}".`,
      oldValue: oldStatus,
      newValue: status,
    }).catch(() => {});

    res.status(200).json({ message: `Status updated to ${status}`, status });
  } catch (err) {
    next(err);
  }
};

// GET /admin/audit-logs — paginated admin action change log
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(`[adminController/getAuditLogs] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};

// PATCH /admin/change-password — admin changes their own password
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(`[adminController/changeAdminPassword] Type: ${err.name} | ${err.message}`);
    next(err);
  }
};
