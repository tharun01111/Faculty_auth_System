import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name)
      return res.status().json({ message: "All fields are requierd..." });

    const admin = await Admin.findOne({ email });

    if (admin)
      return res.status(400).json({ message: "Admin already exists..." });

    const hash = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hash,
    });

    res.status(201).json({ message: "Successfully created an admin..." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required..." });

  const admin = await Admin.findOne({ email });

  if (!admin)
    return res.status(400).json({ message: "Admin does not exist..." });

  const check = await bcrypt.compare(password, admin.password);

  if (!check)
    return res.status(400).json({ message: "Invalid credentials..." });

  const token = await makeToken(admin);

  res.status(200).json({ message: "Successfully logged in", token, role: "admin" });
};

const makeToken = async (admin) => {
  const token = jwt.sign(
    { id: admin._id, role: "Admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  return token;
};
