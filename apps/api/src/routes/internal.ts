import { Router, type Request, type Response } from "express";
import { asyncHandler, AppError } from "../utils/error-handler";
import { resetDemoWorkspace } from "../services/demo";

const router = Router();

/**
 * Called nightly by Vercel Cron (see vercel.json). Vercel sends
 * "Authorization: Bearer <CRON_SECRET>", so nobody else can trigger it.
 */
router.get("/demo-reset", asyncHandler(async (req: Request, res: Response) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    throw new AppError("Not allowed", 401);
  }
  const client = await resetDemoWorkspace();
  res.json({ success: true, data: { resetAt: client.demoResetAt } });
}));

export default router;
