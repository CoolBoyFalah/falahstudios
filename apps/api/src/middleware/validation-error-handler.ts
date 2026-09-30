import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export function validationErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof Joi.ValidationError) {
    return res.status(400).json({
      success: false,
      message: err.details.map((detail) => detail.message).join(", "),
    });
  }

  next(err);
}
