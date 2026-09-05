import { Request, Response } from "express";
import Client from "../models/Client";
import Website from "../models/website";
import { asyncHandler, AppError } from "../utils/error-handler";

export class PublicWebsiteController {
  static getByClientSlug = asyncHandler(async (req: Request, res: Response) => {
    const client = await Client.findOne({ slug: req.params.slug.toLowerCase(), isActive: true }).select("_id slug");
    if (!client) throw new AppError("Website not found", 404);

    const website = await Website.findOne({ clientId: client._id }).select("businessName tagline description updatedAt");
    if (!website) throw new AppError("Website not found", 404);

    res.json({ success: true, data: { slug: client.slug, ...website.toObject() } });
  });
}

export default PublicWebsiteController;
