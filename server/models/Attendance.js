import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    facultyName: {
      type: String,
      required: true,
    },
    facultyEmail: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    classType: {
      type: String,
      enum: ["Lecture", "Lab", "Tutorial", "Seminar"],
      default: "Lecture",
    },
    startTime: {
      type: String, // e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "10:00"
      required: true,
    },
    venue: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for efficient queries per faculty + date
attendanceSchema.index({ faculty: 1, date: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
