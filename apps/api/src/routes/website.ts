import { Router } from "express";
import WebsiteController from "../controllers/WebsiteController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", WebsiteController.getWebsite);
router.put("/", WebsiteController.updateWebsite);

export default router;