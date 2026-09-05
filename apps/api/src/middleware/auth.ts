import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error-handler";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  clientId?: string;
}

interface JwtPayload {
  userId?: string;
  userRole?: string;
  clientId?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("No authorization token provided", 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;
    req.clientId = decoded.clientId;

    if (!req.userId && !req.clientId) {
      throw new AppError("Invalid authentication token", 401);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid or expired token", 401));
    } else {
      next(error);
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      next(new AppError("Insufficient permissions", 403));
    } else {
      next();
    }
  };
}

export function generateToken(
  userId: string,
  userRole: string,
  clientId?: string
): string {
  return jwt.sign(
    {
      userId,
      userRole,
      clientId,
    },
    JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
}