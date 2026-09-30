/**
 * Vercel entry point. Each warm function instance connects to MongoDB once and
 * reuses the connection across requests.
 */
import type { IncomingMessage, ServerResponse } from "http";
import mongoose from "mongoose";
import app from "./app";
import { connectDatabase } from "./config/database";
import Customer from "./models/Customer";

let ready: Promise<void> | null = null;

function ensureDatabase() {
  if (mongoose.connection.readyState === 1 && ready) return ready;
  ready = connectDatabase()
    .then(() => Customer.syncIndexes())
    .then(() => undefined)
    .catch((error) => {
      ready = null; // retry on the next request
      throw error;
    });
  return ready;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureDatabase();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "Service temporarily unavailable" }));
    return;
  }
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
