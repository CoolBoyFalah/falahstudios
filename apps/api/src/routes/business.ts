import { Router } from "express";
import BusinessController from "../controllers/BusinessController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/dashboard", BusinessController.getDashboard);
router.route("/orders").get(BusinessController.getOrders).post(BusinessController.createOrder);
router.patch("/orders/:id/status", BusinessController.updateOrderStatus);
router.route("/customers").get(BusinessController.getCustomers).post(BusinessController.createCustomer);
router.route("/bookings").get(BusinessController.getBookings).post(BusinessController.createBooking);
router.patch("/bookings/:id/status", BusinessController.updateBookingStatus);
router.get("/notifications", BusinessController.getNotifications);
router.patch("/notifications/:id/read", BusinessController.markNotificationRead);
router.route("/settings").get(BusinessController.getSettings).put(BusinessController.updateSettings);
router.post("/ai/insights", BusinessController.getInsight);

export default router;
