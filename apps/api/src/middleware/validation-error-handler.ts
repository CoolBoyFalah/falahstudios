import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "../utils/error-handler";

export function validationErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof Joi.ValidationError) {
    return res.status(400).json({
      success: false,
      error: err.details.map((detail) => detail.message).join(", "),
    });
  }

  next(err);
}
