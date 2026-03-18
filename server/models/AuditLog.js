import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "DELETE_FACULTY",
        "UNLOCK_ACCOUNT",
        "STATUS_CHANGE",
        "BULK_DELETE",
        "BULK_STATUS_UPDATE",
        "REGISTER_FACULTY",
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      default: null,
    },
    performedByName: {
      type: String,
      default: "Admin",
    },
    targetFaculty: {
      type: String, // email or comma-separated list
      default: "",
    },
    targetFacultyName: {
      type: String, // name or comma-separated list
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    oldValue: {
      type: String,
      default: null,
    },
    newValue: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
