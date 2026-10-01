import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/falah-studios";
// Pinned so data always lands in the same database, whatever path the URI has
// (Atlas's default connection string has none, which would mean "test").
export const DB_NAME = process.env.MONGODB_DB || "falah-studios";

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    // Set up connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}
