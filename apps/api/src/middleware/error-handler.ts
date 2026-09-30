import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error-handler";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Request body is not valid JSON",
    });
  }

  // Malformed ObjectId in a route param or filter
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid identifier",
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
    return res.status(409).json({
      success: false,
      message: "This record already exists",
    });
  }

  console.error("Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
