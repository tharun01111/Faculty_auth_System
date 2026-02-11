import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDb from "./config/db.js";
import facultyRoutes from "./routes/faculty.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDb();

// Routes
app.use("/faculty", facultyRoutes);
app.use("/admin", adminRoutes);

// Test Routes (Optional: Can be moved/removed later)
import User from "./models/Employee.js";
app.get("/api/users/test", async (req, res) => {
  const user = await User.find();
  res.json({ user });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "The app is working..." });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});