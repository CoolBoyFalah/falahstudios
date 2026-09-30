import { Router } from "express";
import WebsiteController from "../controllers/WebsiteController";
import { authenticate, requireClient } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { websiteBody } from "../validators/business";

const router = Router();

router.use(authenticate, requireClient);

router.get("/", WebsiteController.getWebsite);
router.put("/", validateRequest({ body: websiteBody }), WebsiteController.updateWebsite);

export default router;
