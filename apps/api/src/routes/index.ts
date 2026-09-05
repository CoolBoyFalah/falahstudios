import { Router } from "express";
import servicesRouter from "./services";
import portfolioRouter from "./portfolio";
import contactRouter from "./contact";
import blogRouter from "./blog";
import testimonialsRouter from "./testimonials";
import authRouter from "./auth";
import websiteRouter from "./website";
import businessRouter from "./business";
import publicRouter from "./public";

const router = Router();

router.use("/auth", authRouter);
router.use("/website", websiteRouter);
router.use("/business", businessRouter);
router.use("/public", publicRouter);
router.use("/services", servicesRouter);
router.use("/portfolio", portfolioRouter);
router.use("/contact", contactRouter);
router.use("/blog", blogRouter);
router.use("/testimonials", testimonialsRouter);

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;
