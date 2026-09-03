import { Router } from "express";
import ServiceController from "../controllers/ServiceController";

const router = Router();

router.get("/", ServiceController.getAll);
router.get("/:id", ServiceController.getById);
router.get("/slug/:slug", ServiceController.getBySlug);
router.post("/", ServiceController.create);
router.put("/:id", ServiceController.update);
router.delete("/:id", ServiceController.delete);

export default router;
