import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

export async function createMongooseConnection() {
  await mongoose.connect(process.env.MONGO_URL || "");
  return mongoose;
}
