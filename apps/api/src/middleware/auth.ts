import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Client from "../models/Client";
import { AppError } from "../utils/error-handler";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  clientId?: string;
  isDemo?: boolean;
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
    const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw new AppError("No authorization token provided", 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = decoded.userId || undefined;
    req.userRole = decoded.userRole;
    req.clientId = decoded.clientId;

    if (!req.userId && !req.clientId) {
      throw new AppError("Invalid authentication token", 401);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Your session has expired. Please sign in again.", 401));
    } else {
      next(error);
    }
  }
}

/**
 * Ensures the token belongs to a client workspace that still exists and is
 * active, so deactivating a client locks out every token already issued.
 */
export async function requireClient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.clientId) {
      throw new AppError("Client authentication is required", 403);
    }

    const client = await Client.findOne({ _id: req.clientId, isActive: true }).select("isDemo").lean();
    if (!client) {
      throw new AppError("This workspace is no longer active.", 401);
    }
    req.isDemo = Boolean(client.isDemo);

    next();
  } catch (error) {
    next(error);
  }
}

/** Blocks changes that would spoil the shared demo for other visitors. */
export function blockInDemo(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.isDemo) {
    next(new AppError("This can't be changed in the demo.", 403));
  } else {
    next();
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
      userId: userId || undefined,
      userRole,
      clientId,
    },
    JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
}
