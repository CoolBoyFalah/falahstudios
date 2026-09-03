import { Router } from "express";
import servicesRouter from "./services";
import portfolioRouter from "./portfolio";
import contactRouter from "./contact";
import blogRouter from "./blog";
import testimonialsRouter from "./testimonials";

const router = Router();

router.use("/services", servicesRouter);
router.use("/portfolio", portfolioRouter);
router.use("/contact", contactRouter);
router.use("/blog", blogRouter);
router.use("/testimonials", testimonialsRouter);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
