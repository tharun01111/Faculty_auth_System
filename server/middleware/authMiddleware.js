import jwt from "jsonwebtoken";
import User from "../models/Employee.js"; // Faculty Model
import Admin from "../models/Admin.js";   // Admin Model

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      // Check both collections? Or decide based on role in token?
      // For now, simpler to just pass the IDs and allow controllers to handle specific logic if needed
      // But usually we want req.user to be populated.
      
      let user = await User.findById(decoded.id).select("-password");
      if (!user) {
         user = await Admin.findById(decoded.id).select("-password");
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};
