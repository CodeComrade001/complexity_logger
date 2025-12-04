import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function createMongooseConnection() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing");

  await mongoose.connect(uri);
  return mongoose; // the real connection
}
