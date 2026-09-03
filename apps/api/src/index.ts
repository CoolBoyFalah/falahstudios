import express from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/error-handler";
import { validationErrorHandler } from "./middleware/validation-error-handler";
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Logging
app.use(morgan("combined"));

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

// Database connection and server start
async function startServer() {
  try {
    await connectDatabase();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
