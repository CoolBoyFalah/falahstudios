import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
