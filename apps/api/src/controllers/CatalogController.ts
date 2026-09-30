import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import CatalogItem from "../models/CatalogItem";
import { escapeRegex } from "../services/customerStats";
import { asyncHandler, AppError } from "../utils/error-handler";

function clientIdFor(req: AuthRequest) {
  if (!req.clientId) throw new AppError("Client authentication is required", 403);
  return req.clientId;
}

export class CatalogController {
  static list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, q, available } = req.query as unknown as { type: string; q: string; available?: boolean };
    const filter: Record<string, unknown> = { clientId: clientIdFor(req) };
    if (type !== "all") filter.type = type;
    if (available !== undefined) filter.available = available;
    if (q) {
      const pattern = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [{ name: pattern }, { category: pattern }, { description: pattern }];
    }
    const items = await CatalogItem.find(filter)
      .sort({ featured: -1, category: 1, name: 1 })
      .collation({ locale: "en", strength: 2 })
      .limit(500);
    res.json({ success: true, data: items });
  });

  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await CatalogItem.create({ ...req.body, clientId: clientIdFor(req) });
    res.status(201).json({ success: true, data: item });
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { durationMinutes, ...rest } = req.body;
    const update: Record<string, unknown> = { $set: rest };
    if (durationMinutes === null) update.$unset = { durationMinutes: 1 };
    else if (durationMinutes !== undefined) (update.$set as Record<string, unknown>).durationMinutes = durationMinutes;

    const item = await CatalogItem.findOneAndUpdate({ _id: req.params.id, clientId: clientIdFor(req) }, update, {
      new: true,
      runValidators: true,
    });
    if (!item) throw new AppError("Item not found", 404);
    res.json({ success: true, data: item });
  });

  static remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await CatalogItem.findOne({ _id: req.params.id, clientId: clientIdFor(req) });
    if (!item) throw new AppError("Item not found", 404);
    await item.deleteOne();
    res.json({ success: true, data: { id: item._id } });
  });
}

export default CatalogController;
