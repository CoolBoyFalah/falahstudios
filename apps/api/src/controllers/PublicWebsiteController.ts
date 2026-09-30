import { Request, Response } from "express";
import CatalogItem from "../models/CatalogItem";
import Client from "../models/Client";
import Website from "../models/website";
import { asyncHandler, AppError } from "../utils/error-handler";

const PUBLIC_FIELDS =
  "-_id businessName tagline description contactEmail phone whatsapp instagram tiktok facebook mapsUrl address openingHours hours announcement faqs seoTitle seoDescription updatedAt";

export class PublicWebsiteController {
  static getByClientSlug = asyncHandler(async (req: Request, res: Response) => {
    const client = await Client.findOne({ slug: req.params.slug.toLowerCase(), isActive: true }).select("_id slug currency");
    if (!client) throw new AppError("Website not found", 404);

    // Documents saved before `published` existed are treated as live.
    const website = await Website.findOne({ clientId: client._id, published: { $ne: false } }).select(PUBLIC_FIELDS);
    if (!website) throw new AppError("Website not found", 404);

    const catalog = await CatalogItem.find({ clientId: client._id, available: true })
      .sort({ featured: -1, category: 1, name: 1 })
      .select("-_id type name description category price durationMinutes featured");

    const data = website.toObject();
    if (!data.announcement?.enabled) delete (data as Partial<typeof data>).announcement;

    res.set("Cache-Control", "public, max-age=60");
    res.json({ success: true, data: { slug: client.slug, currency: client.currency, ...data, catalog } });
  });
}

export default PublicWebsiteController;
