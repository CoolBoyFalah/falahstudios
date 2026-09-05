import { Router } from "express";
import PublicWebsiteController from "../controllers/PublicWebsiteController";

const router = Router();
router.get("/website/:slug", PublicWebsiteController.getByClientSlug);

export default router;
