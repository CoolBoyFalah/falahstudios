import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/error-handler";
import Booking from "../models/Booking";
import Client from "../models/Client";
import Customer from "../models/Customer";
import Notification from "../models/Notification";
import Order from "../models/Order";

const orderStatuses = ["pending", "confirmed", "completed", "cancelled"];

interface OrderInputItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

function isOrderItem(value: unknown): value is OrderInputItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.name === "string" && Boolean(item.name.trim())
    && typeof item.quantity === "number" && Number.isFinite(item.quantity) && item.quantity >= 1
    && typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice) && item.unitPrice >= 0;
}

function clientIdFor(req: AuthRequest): string {
  if (!req.clientId) {
    throw new AppError("Client authentication is required", 403);
  }

  return req.clientId;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${field} is required`, 400);
  }

  return value.trim();
}

export class BusinessController {
  static getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [revenue, ordersToday, customers, bookingsToday, recentOrders, recentBookings, unreadNotifications] = await Promise.all([
      Order.aggregate([
        { $match: { clientId: new mongoose.Types.ObjectId(clientId), status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ clientId, createdAt: { $gte: today } }),
      Customer.countDocuments({ clientId }),
      Booking.countDocuments({ clientId, scheduledFor: { $gte: today, $lt: new Date(today.getTime() + 86400000) } }),
      Order.find({ clientId }).sort({ createdAt: -1 }).limit(4).select("customerName total currency status createdAt"),
      Booking.find({ clientId }).sort({ scheduledFor: 1 }).limit(4).select("customerName service scheduledFor status"),
      Notification.countDocuments({ clientId, readAt: { $exists: false } }),
    ]);

    res.json({
      success: true,
      data: {
        metrics: { revenue: revenue[0]?.total || 0, ordersToday, customers, bookingsToday },
        recentOrders,
        upcomingBookings: recentBookings,
        unreadNotifications,
      },
    });
  });

  static getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const orders = await Order.find({ clientId: clientIdFor(req) }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: orders });
  });

  static createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const customerName = requireString(req.body.customerName, "Customer name");
    const rawItems: unknown[] = Array.isArray(req.body.items) ? req.body.items : [];
    if (rawItems.length === 0 || !rawItems.every(isOrderItem)) {
      throw new AppError("Add at least one valid order item", 400);
    }
    const items = rawItems;
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const customerEmail = typeof req.body.customerEmail === "string" && req.body.customerEmail.trim()
      ? req.body.customerEmail.trim().toLowerCase()
      : undefined;
    const order = await Order.create({ clientId, customerName, customerEmail, items, total, currency: req.body.currency || "AED" });
    await Customer.findOneAndUpdate(
      customerEmail ? { clientId, email: customerEmail } : { clientId, name: customerName },
      {
        $setOnInsert: { clientId, name: customerName, email: customerEmail },
        $inc: { orderCount: 1, totalSpent: total },
      },
      { upsert: true, new: true, runValidators: true }
    );
    await Notification.create({ clientId, type: "order", title: "New order", message: `A new order from ${customerName} was received.` });
    res.status(201).json({ success: true, data: order });
  });

  static updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const status = req.body.status;
    if (!orderStatuses.includes(status)) throw new AppError("Invalid order status", 400);
    const order = await Order.findOneAndUpdate({ _id: req.params.id, clientId: clientIdFor(req) }, { status }, { new: true });
    if (!order) throw new AppError("Order not found", 404);
    res.json({ success: true, data: order });
  });

  static getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const customers = await Customer.find({ clientId: clientIdFor(req) }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: customers });
  });

  static createCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const customer = await Customer.create({
      clientId: clientIdFor(req), name: requireString(req.body.name, "Customer name"),
      email: typeof req.body.email === "string" && req.body.email.trim() ? req.body.email.trim() : undefined,
      phone: typeof req.body.phone === "string" ? req.body.phone.trim() : undefined,
      notes: typeof req.body.notes === "string" ? req.body.notes.trim() : "",
    });
    res.status(201).json({ success: true, data: customer });
  });

  static getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const bookings = await Booking.find({ clientId: clientIdFor(req) }).sort({ scheduledFor: 1 }).limit(100);
    res.json({ success: true, data: bookings });
  });

  static createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const scheduledFor = new Date(req.body.scheduledFor);
    if (Number.isNaN(scheduledFor.getTime())) throw new AppError("A valid booking date is required", 400);
    const clientId = clientIdFor(req);
    const customerName = requireString(req.body.customerName, "Customer name");
    const booking = await Booking.create({ clientId, customerName, customerEmail: typeof req.body.customerEmail === "string" ? req.body.customerEmail.trim() : undefined, service: requireString(req.body.service, "Service"), scheduledFor, notes: typeof req.body.notes === "string" ? req.body.notes.trim() : "" });
    await Notification.create({ clientId, type: "booking", title: "New booking", message: `${customerName} booked ${booking.service}.` });
    res.status(201).json({ success: true, data: booking });
  });

  static updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const status = req.body.status;
    if (!orderStatuses.includes(status)) throw new AppError("Invalid booking status", 400);
    const booking = await Booking.findOneAndUpdate({ _id: req.params.id, clientId: clientIdFor(req) }, { status }, { new: true });
    if (!booking) throw new AppError("Booking not found", 404);
    res.json({ success: true, data: booking });
  });

  static getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const notifications = await Notification.find({ clientId: clientIdFor(req) }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: notifications });
  });

  static markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, clientId: clientIdFor(req) }, { readAt: new Date() }, { new: true });
    if (!notification) throw new AppError("Notification not found", 404);
    res.json({ success: true, data: notification });
  });

  static getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const client = await Client.findById(clientIdFor(req)).select("name slug clientCode createdAt");
    if (!client) throw new AppError("Client not found", 404);
    res.json({ success: true, data: client });
  });

  static updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const name = requireString(req.body.name, "Business name");
    const client = await Client.findByIdAndUpdate(clientIdFor(req), { name }, { new: true, runValidators: true }).select("name slug clientCode createdAt");
    if (!client) throw new AppError("Client not found", 404);
    res.json({ success: true, data: client });
  });

  static getInsight = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const [completedRevenue, orderCount, customerCount, bookingCount] = await Promise.all([
      Order.aggregate([{ $match: { clientId: new mongoose.Types.ObjectId(clientId), status: "completed" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.countDocuments({ clientId }), Customer.countDocuments({ clientId }), Booking.countDocuments({ clientId }),
    ]);
    const revenue = completedRevenue[0]?.total || 0;
    const isArabic = req.headers["accept-language"]?.startsWith("ar");
    const response = isArabic
      ? orderCount === 0 && bookingCount === 0
        ? "مساحة عملك جاهزة. أضف أول طلب أو عميل أو حجز لبدء تلقي تحليلات الأعمال."
        : `لديك ${orderCount} طلبًا، و${customerCount} عميلًا، و${bookingCount} حجزًا. إيرادات الطلبات المكتملة هي ${revenue.toLocaleString("ar-AE")} درهمًا.`
      : orderCount === 0 && bookingCount === 0
        ? "Your workspace is ready. Add your first order, customer, or booking to start receiving business insights."
        : `You have ${orderCount} order${orderCount === 1 ? "" : "s"}, ${customerCount} customer${customerCount === 1 ? "" : "s"}, and ${bookingCount} booking${bookingCount === 1 ? "" : "s"}. Completed-order revenue is AED ${revenue.toLocaleString()}.`;
    res.json({ success: true, data: { response, generatedAt: new Date().toISOString() } });
  });
}

export default BusinessController;
