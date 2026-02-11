import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Prisma connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Prisma connection error:", error);
  }
};