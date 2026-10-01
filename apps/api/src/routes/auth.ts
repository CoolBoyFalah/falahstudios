import { Router } from "express";
import rateLimit from "express-rate-limit";
import AuthController from "../controllers/AuthController";

const router = Router();

// Access codes are short, so throttle guesses hard. Successful sign-ins
// don't count against the limit.
const accessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please wait a few minutes and try again." },
});

// One-click demo: generous limit, it only ever opens the public demo workspace.
const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again shortly." },
});

router.post("/access", accessLimiter, AuthController.access);
router.post("/demo", demoLimiter, AuthController.demo);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export default router;
