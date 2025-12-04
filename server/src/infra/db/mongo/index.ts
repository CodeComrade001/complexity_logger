import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

export async function createMongooseConnection() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in the environment variables");
  }

  return await mongoose.connect(uri);
}

export async function closeMongooseConnection() {
  return await mongoose.connection.close();
}
