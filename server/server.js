import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { login, register } from "./controllers/userController.js";
import connectDb from "./config/db.js";
import User from "./models/Employee.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
connectDb();

app.post("/auth/login", login);
app.post("/auth/register", register);

app.get("/api/users/test", async (req, res) => {
  const user = await User.find();
  res.json({ user });
})

app.get("/api/test", (req, res) => {
  res.json({ message: "The app is working..." });
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
})