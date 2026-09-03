import { Request, Response, NextFunction } from "express";
import { ValidationError } from "joi";

export function validationErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  next(err);
}
