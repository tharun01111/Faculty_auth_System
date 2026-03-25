import Attendance from "../models/Attendance.js";
import User from "../models/Employee.js";

// GET /faculty/stats — real dashboard metrics from attendance data
export const getDashboardStats = async (req, res, next) => {
  try {
    const facultyId = req.user?.id;

    // Today: midnight → now in UTC
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // This week: Monday 00:00 → Sunday 23:59
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sun
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const [todayCount, weekCount, recentLogs, facultyDoc] = await Promise.all([
      Attendance.countDocuments({ faculty: facultyId, date: { $gte: todayStart, $lte: todayEnd } }),
      Attendance.countDocuments({ faculty: facultyId, date: { $gte: weekStart } }),
      Attendance.find({ faculty: facultyId }).sort({ date: -1, startTime: -1 }).limit(3).lean(),
      User.findById(facultyId).select("status department").lean(),
    ]);

    res.status(200).json({
      todayClasses: todayCount,
      weekClasses: weekCount,
      status: facultyDoc?.status ?? "Available",
      department: facultyDoc?.department ?? "",
      recentActivity: recentLogs,
    });
  } catch (err) {
    console.error(`[attendanceController/getDashboardStats] ${err.message}`);
    next(err);
  }
};

// PATCH /faculty/status — faculty updates own status
export const updateMyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["Available", "On Leave", "Meeting"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
    }
    const updated = await User.findByIdAndUpdate(
      req.user?.id,
      { status },
      { new: true, select: "status" }
    );
    if (!updated) return res.status(404).json({ message: "Faculty not found" });
    res.status(200).json({ status: updated.status });
  } catch (err) {
    console.error(`[attendanceController/updateMyStatus] ${err.message}`);
    next(err);
  }
};

// POST /faculty/attendance — faculty logs a class session
export const logAttendance = async (req, res, next) => {
  try {
    const { date, subject, classType, startTime, endTime, venue, notes } = req.body;
    const facultyId = req.user?.id;

    const faculty = await User.findById(facultyId).select("name email");
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (!date || !subject || !startTime || !endTime) {
      return res.status(400).json({ message: "Date, subject, start time, and end time are required." });
    }

    if (endTime <= startTime) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    const record = await Attendance.create({
      faculty: facultyId,
      facultyName: faculty.name,
      facultyEmail: faculty.email,
      date: new Date(date),
      subject,
      classType: classType || "Lecture",
      startTime,
      endTime,
      venue: venue || "",
      notes: notes || "",
    });

    res.status(201).json({ message: "Session logged successfully.", record });
  } catch (err) {
    console.error(`[attendanceController/logAttendance] ${err.message}`);
    next(err);
  }
};

// GET /faculty/attendance — faculty retrieves own logs
export const getMyAttendance = async (req, res, next) => {
  try {
    const facultyId = req.user?.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { faculty: facultyId };
    if (req.query.from) filter.date = { ...filter.date, $gte: new Date(req.query.from) };
    if (req.query.to) filter.date = { ...filter.date, $lte: new Date(req.query.to) };

    const [records, total] = await Promise.all([
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Attendance.countDocuments(filter),
    ]);

    res.status(200).json({
      records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(`[attendanceController/getMyAttendance] ${err.message}`);
    next(err);
  }
};

// DELETE /faculty/attendance/:id — faculty deletes own log
export const deleteAttendanceLog = async (req, res, next) => {
  try {
    const record = await Attendance.findOne({ _id: req.params.id, faculty: req.user?.id });
    if (!record) return res.status(404).json({ message: "Log not found or access denied." });
    await record.deleteOne();
    res.status(200).json({ message: "Log deleted." });
  } catch (err) {
    next(err);
  }
};

// GET /admin/attendance — admin retrieves all attendance logs
export const getAdminAttendance = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.facultyId) filter.faculty = req.query.facultyId;

    const [records, total] = await Promise.all([
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Attendance.countDocuments(filter),
    ]);

    res.status(200).json({
      records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(`[attendanceController/getAdminAttendance] ${err.message}`);
    next(err);
  }
};
