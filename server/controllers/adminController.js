import Admin from "../models/Admin.js";
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
    { id: admin._id, role: "Admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  return token;
};
