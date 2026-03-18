import Attendance from "../models/Attendance.js";
import User from "../models/Employee.js";

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
