import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  employeeId: {
    type: String,
    unique: true,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "faculty", // ✅ Canonical role name — matches JWT, middleware, and frontend
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  failedLogin: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["Available", "On Leave", "Meeting"],
    default: "Available",
  },
  // ── Academic Portfolio ────────────────────────────────────────────────────────
  qualification: {
    type: String,
    default: "",
  },
  specialization: {
    type: String,
    default: "",
  },
  publications: {
    type: Number,
    default: 0,
  },
  fdpsAttended: {
    type: Number,
    default: 0,
  },
  // ── Assigned Assets ─────────────────────────────────────────────────────────
  assets: {
    laptop: { type: String, default: "" },
    cabinNo: { type: String, default: "" },
    libraryId: { type: String, default: "" },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
  },
});

const User =  mongoose.model("Faculty", facultySchema);
export default User;
