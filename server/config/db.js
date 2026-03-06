import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(
      `[DB] MongoDB connection failed | Code: ${err.code ?? "N/A"} | Message: ${err.message}`
    );
    process.exit(1);
  }
};

export default connectDb;
