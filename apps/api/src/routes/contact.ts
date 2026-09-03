import { Router } from "express";
import ContactController from "../controllers/ContactController";

const router = Router();

router.get("/", ContactController.getAll);
router.get("/:id", ContactController.getById);
router.post("/", ContactController.create);
router.patch("/:id/status", ContactController.updateStatus);
router.delete("/:id", ContactController.delete);

export default router;
