import { Response } from "express";
import Website from "../models/website";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/error-handler";

const editableFields = ["businessName", "tagline", "description"] as const;

export class WebsiteController {
  static getWebsite = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.clientId) {
      throw new AppError("Client authentication is required", 403);
    }

    const website = await Website.findOne({ clientId: req.clientId });

    res.json({
      success: true,
      data: website,
    });
  });

  static updateWebsite = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.clientId) {
        throw new AppError("Client authentication is required", 403);
      }

      const updates: Record<string, string> = {};

      for (const field of editableFields) {
        const value = req.body[field];

        if (value !== undefined) {
          if (typeof value !== "string") {
            throw new AppError(`${field} must be a string`, 400);
          }

          updates[field] = value.trim();
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new AppError(
          "Provide at least one website field to update",
          400
        );
      }

      if (updates.businessName !== undefined && !updates.businessName) {
        throw new AppError("Business name is required", 400);
      }

      const website = await Website.findOneAndUpdate(
        { clientId: req.clientId },
        {
          $set: updates,
          $setOnInsert: {
            clientId: req.clientId,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      res.json({
        success: true,
        data: website,
      });
    }
  );
}

export default WebsiteController;