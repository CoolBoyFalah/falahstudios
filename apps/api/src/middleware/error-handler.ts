import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error-handler";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: err.message,
    });
  }

  // Mongoose duplicate key error
  if (err.name === "MongoServerError" && "code" in err && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
      details: "This value already exists in the database",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
