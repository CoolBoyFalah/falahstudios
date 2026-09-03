import { Router } from "express";
import BlogController from "../controllers/BlogController";

const router = Router();

router.get("/", BlogController.getAll);
router.get("/:slug", BlogController.getBySlug);
router.post("/", BlogController.create);
router.put("/:id", BlogController.update);
router.delete("/:id", BlogController.delete);

export default router;
