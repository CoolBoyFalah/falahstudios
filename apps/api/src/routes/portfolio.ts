import { Router } from "express";
import PortfolioController from "../controllers/PortfolioController";

const router = Router();

router.get("/", PortfolioController.getAll);
router.get("/featured", PortfolioController.getFeatured);
router.get("/:id", PortfolioController.getById);
router.get("/slug/:slug", PortfolioController.getBySlug);
router.post("/", PortfolioController.create);
router.put("/:id", PortfolioController.update);
router.delete("/:id", PortfolioController.delete);

export default router;
