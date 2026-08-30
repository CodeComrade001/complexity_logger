import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function createMongooseConnection() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI missing");
    }

    const mongooseConnect = await mongoose.connect(uri);

    console.log("✅ MongoDB connection for go successfully");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    console.log("Port:", mongoose.connection.port);

    return mongooseConnect;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw new Error("MongoDB connection error");
  }
}