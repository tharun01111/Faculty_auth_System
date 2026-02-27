import Admin from "../models/Admin.js";
import User from "../models/Employee.js"; // Faculty model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      res.status(400);
      throw new Error("All fields are required...");
    }

    const admin = await Admin.findOne({ email });

    if (admin) {
      res.status(400);
      throw new Error("Admin already exists...");
    }

    const hash = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hash,
      // createdBy? Admin model usually self-registered or seeded.
    });

    res.status(201).json({ message: "Successfully created an admin..." });
  } catch (err) {
    next(err);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("All fields are required...");
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      res.status(400);
      throw new Error("Admin does not exist...");
    }

    const check = await bcrypt.compare(password, admin.password);

    if (!check) {
      res.status(400);
      throw new Error("Invalid credentials...");
    }

    const token = await makeToken(admin);

    res.status(200).json({ message: "Successfully logged in", token, role: "admin" });
  } catch (err) {
    next(err);
  }
};


const makeToken = async (admin) => {
  const token = jwt.sign(
    { id: admin._id, role: "admin" }, // ✅ lowercase — matches middleware & frontend
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  return token;
};

export const getAdminStats = async (req, res) => {
    // This is a protected route. If we are here, it means:
    // 1. Token is valid (protect middleware)
    // 2. User is an admin (adminOnly middleware)
    
    res.status(200).json({
        totalFaculty: 42,
        systemHealth: "Good",
        pendingApprovals: 5,
        message: "Secure data fetched successfully"
    });
};

// ✅ GET /admin/faculty — list all faculty (admin-only)
export const getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await User.find()
      .select("-password") // Never expose passwords
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ faculty });
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /admin/faculty/:id/unlock — reset lock on a faculty account
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
    next(err);
  }
};
