import { Router } from "express";
import BusinessController from "../controllers/BusinessController";
import CatalogController from "../controllers/CatalogController";
import { authenticate, blockInDemo, requireClient } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import * as v from "../validators/business";

const router = Router();
router.use(authenticate, requireClient);

const byId = validateRequest({ params: v.idParams });

router.get("/me", BusinessController.getMe);
router.get("/dashboard", validateRequest({ query: v.dashboardQuery }), BusinessController.getDashboard);
router.get("/analytics", validateRequest({ query: v.analyticsQuery }), BusinessController.getAnalytics);

router.route("/orders")
  .get(validateRequest({ query: v.listOrdersQuery }), BusinessController.getOrders)
  .post(validateRequest({ body: v.createOrderBody }), BusinessController.createOrder);
router.patch("/orders/:id/status", validateRequest({ params: v.idParams, body: v.orderStatusBody }), BusinessController.updateOrderStatus);
router.route("/orders/:id")
  .get(byId, BusinessController.getOrder)
  .delete(byId, BusinessController.deleteOrder);

router.route("/catalog")
  .get(validateRequest({ query: v.listCatalogQuery }), CatalogController.list)
  .post(validateRequest({ body: v.createCatalogBody }), CatalogController.create);
router.route("/catalog/:id")
  .patch(validateRequest({ params: v.idParams, body: v.updateCatalogBody }), CatalogController.update)
  .delete(byId, CatalogController.remove);

router.route("/customers")
  .get(validateRequest({ query: v.listCustomersQuery }), BusinessController.getCustomers)
  .post(validateRequest({ body: v.createCustomerBody }), BusinessController.createCustomer);
router.route("/customers/:id")
  .get(byId, BusinessController.getCustomer)
  .patch(validateRequest({ params: v.idParams, body: v.updateCustomerBody }), BusinessController.updateCustomer)
  .delete(byId, BusinessController.deleteCustomer);

router.route("/bookings")
  .get(validateRequest({ query: v.listBookingsQuery }), BusinessController.getBookings)
  .post(validateRequest({ body: v.createBookingBody }), BusinessController.createBooking);
router.route("/bookings/:id")
  .patch(validateRequest({ params: v.idParams, body: v.updateBookingBody }), BusinessController.updateBooking)
  .delete(byId, BusinessController.deleteBooking);
// Kept for older clients that only change status.
router.patch("/bookings/:id/status", validateRequest({ params: v.idParams, body: v.updateBookingBody }), BusinessController.updateBooking);

router.get("/notifications", BusinessController.getNotifications);
router.post("/notifications/read-all", BusinessController.markAllNotificationsRead);
router.patch("/notifications/:id/read", byId, BusinessController.markNotificationRead);

router.route("/settings")
  .get(BusinessController.getSettings)
  .put(blockInDemo, validateRequest({ body: v.settingsBody }), BusinessController.updateSettings);

router.post("/ai/insights", validateRequest({ body: v.insightsBody }), BusinessController.getInsight);

export default router;
