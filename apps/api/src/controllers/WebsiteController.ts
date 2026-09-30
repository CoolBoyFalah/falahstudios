import { Response } from "express";
import Client from "../models/Client";
import Website from "../models/website";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/error-handler";

function clientIdFor(req: AuthRequest) {
  if (!req.clientId) {
    throw new AppError("Client authentication is required", 403);
  }
  return req.clientId;
}

export class WebsiteController {
  static getWebsite = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const [website, client] = await Promise.all([
      Website.findOne({ clientId }),
      Client.findById(clientId).select("name slug"),
    ]);

    res.json({
      success: true,
      data: {
        website,
        slug: client?.slug,
        // Sensible starting values for a workspace that hasn't saved yet.
        defaults: { businessName: client?.name || "" },
      },
    });
  });

  static updateWebsite = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const existing = await Website.exists({ clientId });

    if (!existing && !req.body.businessName) {
      throw new AppError("Business name is required", 400);
    }

    const website = await Website.findOneAndUpdate(
      { clientId },
      { $set: req.body, $setOnInsert: { clientId } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      data: website,
    });
  });
}

export default WebsiteController;
