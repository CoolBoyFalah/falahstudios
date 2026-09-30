// Must be the first import: other modules read process.env when they load.
import "dotenv/config";
import express from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { errorHandler } from "./middleware/error-handler";
import { validationErrorHandler } from "./middleware/validation-error-handler";
import routes from "./routes";


const app = express();

// Behind Vercel's proxy: use the real client IP for rate limiting.
app.set("trust proxy", 1);

// Security & CORS
app.use(helmet());

// FRONTEND_URL may be a comma-separated list (e.g. the website and Falah OS).
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting. A single dashboard view makes several requests, so the
// general limit is generous; sign-in has its own strict limiter.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again shortly." },
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handling
app.use(validationErrorHandler);
app.use(errorHandler);

export default app;
