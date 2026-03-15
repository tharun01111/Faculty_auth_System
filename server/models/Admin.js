import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
   name:{
    type: String,
    required: true,
   },
   email: {
    type: String,
    unique: true,
    required: true,
   },
   password: {
    type: String,
    required: true,
   },
   role: {
    type: String,
    default: "admin",
   },
   branding: {
    logo: { type: String, default: "" },
    primaryColor: { type: String, default: "#6366f1" }, // Default indigo-500
   },
},{ timestamps : true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;