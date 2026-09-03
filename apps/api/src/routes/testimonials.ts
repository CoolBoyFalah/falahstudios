import { Router } from "express";
import TestimonialController from "../controllers/TestimonialController";

const router = Router();

router.get("/", TestimonialController.getAll);
router.get("/featured", TestimonialController.getFeatured);
router.get("/:id", TestimonialController.getById);
router.post("/", TestimonialController.create);
router.put("/:id", TestimonialController.update);
router.delete("/:id", TestimonialController.delete);

export default router;
