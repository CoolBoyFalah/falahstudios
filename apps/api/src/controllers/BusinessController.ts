import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/error-handler";
import Booking from "../models/Booking";
import Client from "../models/Client";
import Customer from "../models/Customer";
import Notification from "../models/Notification";
import Order from "../models/Order";
import { escapeRegex, refreshCustomerStats, resolveCustomer } from "../services/customerStats";
import { computeTotals } from "../services/tax";

const SETTINGS_FIELDS = "name slug clientCode createdAt currency taxRate pricesIncludeTax taxNumber receiptNote";

const DAY = 86_400_000;

function clientIdFor(req: AuthRequest): string {
  if (!req.clientId) {
    throw new AppError("Client authentication is required", 403);
  }

  return req.clientId;
}

function oid(id: string) {
  return new mongoose.Types.ObjectId(id);
}

/** Start of the viewer's local day, expressed in UTC. */
function startOfLocalDay(tzOffset: number, at = Date.now()) {
  const offsetMs = tzOffset * 60_000;
  const local = at - offsetMs;
  return new Date(local - (local % DAY) + offsetMs);
}

/** Converts a Date#getTimezoneOffset value to a Mongo timezone like "+04:00". */
function mongoTimezone(tzOffset: number) {
  const total = -tzOffset;
  const sign = total >= 0 ? "+" : "-";
  const abs = Math.abs(total);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

async function sumRevenue(clientId: string, from?: Date, to?: Date) {
  const createdAt: Record<string, Date> = {};
  if (from) createdAt.$gte = from;
  if (to) createdAt.$lt = to;
  const [result] = await Order.aggregate<{ total: number; count: number }>([
    { $match: { clientId: oid(clientId), status: "completed", ...(from || to ? { createdAt } : {}) } },
    { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
  ]);
  return { total: result?.total || 0, count: result?.count || 0 };
}

function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export class BusinessController {
  static getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const client = await Client.findById(clientIdFor(req)).select("name slug clientCode currency isDemo createdAt");
    if (!client) throw new AppError("Client not found", 404);
    const unreadNotifications = await Notification.countDocuments({ clientId: client._id, readAt: { $exists: false } });
    res.json({ success: true, data: { client, unreadNotifications } });
  });

  static getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const tzOffset = Number(req.query.tzOffset) || 0;
    const today = startOfLocalDay(tzOffset);
    const tomorrow = new Date(today.getTime() + DAY);
    const yesterday = new Date(today.getTime() - DAY);
    const monthAgo = new Date(today.getTime() - 29 * DAY);
    const now = new Date();

    const [
      revenueAllTime,
      revenue30d,
      ordersToday,
      ordersYesterday,
      pendingOrders,
      customers,
      newCustomers30d,
      bookingsToday,
      recentOrders,
      upcomingBookings,
      unreadNotifications,
    ] = await Promise.all([
      sumRevenue(clientId),
      sumRevenue(clientId, monthAgo),
      Order.countDocuments({ clientId, createdAt: { $gte: today, $lt: tomorrow } }),
      Order.countDocuments({ clientId, createdAt: { $gte: yesterday, $lt: today } }),
      Order.countDocuments({ clientId, status: "pending" }),
      Customer.countDocuments({ clientId }),
      Customer.countDocuments({ clientId, createdAt: { $gte: monthAgo } }),
      Booking.countDocuments({ clientId, scheduledFor: { $gte: today, $lt: tomorrow }, status: { $ne: "cancelled" } }),
      Order.find({ clientId }).sort({ createdAt: -1 }).limit(6).select("customerName total currency status createdAt items"),
      Booking.find({ clientId, scheduledFor: { $gte: now }, status: { $in: ["pending", "confirmed"] } })
        .sort({ scheduledFor: 1 })
        .limit(5)
        .select("customerName service scheduledFor status durationMinutes"),
      Notification.countDocuments({ clientId, readAt: { $exists: false } }),
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          revenue: revenueAllTime.total,
          revenue30d: revenue30d.total,
          ordersToday,
          ordersYesterday,
          pendingOrders,
          customers,
          newCustomers30d,
          bookingsToday,
        },
        recentOrders,
        upcomingBookings,
        unreadNotifications,
      },
    });
  });

  static getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const days = Number(req.query.days);
    const tzOffset = Number(req.query.tzOffset) || 0;
    const end = new Date(startOfLocalDay(tzOffset).getTime() + DAY);
    const start = new Date(end.getTime() - days * DAY);
    const previousStart = new Date(start.getTime() - days * DAY);
    const timezone = mongoTimezone(tzOffset);
    const match = { clientId: oid(clientId) };

    const [daily, byStatus, bookingsByStatus, topCustomers, current, previous, currentOrders, previousOrders] = await Promise.all([
      Order.aggregate<{ _id: string; revenue: number; orders: number }>([
        { $match: { ...match, createdAt: { $gte: start, $lt: end }, status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } },
            revenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$total", 0] } },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate<{ _id: string; count: number; total: number }>([
        { $match: { ...match, createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$total" } } },
      ]),
      Booking.aggregate<{ _id: string; count: number }>([
        { $match: { ...match, scheduledFor: { $gte: start, $lt: end } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Customer.find({ clientId, totalSpent: { $gt: 0 } }).sort({ totalSpent: -1 }).limit(5).select("name totalSpent orderCount"),
      sumRevenue(clientId, start, end),
      sumRevenue(clientId, previousStart, start),
      Order.countDocuments({ clientId, createdAt: { $gte: start, $lt: end }, status: { $ne: "cancelled" } }),
      Order.countDocuments({ clientId, createdAt: { $gte: previousStart, $lt: start }, status: { $ne: "cancelled" } }),
    ]);

    // Fill every day in the range so charts don't have gaps.
    const byDay = new Map(daily.map((d) => [d._id, d]));
    const series = Array.from({ length: days }, (_, i) => {
      const localDay = new Date(start.getTime() + i * DAY - tzOffset * 60_000);
      const key = localDay.toISOString().slice(0, 10);
      const entry = byDay.get(key);
      return { date: key, revenue: entry?.revenue || 0, orders: entry?.orders || 0 };
    });

    const toRecord = (rows: Array<{ _id: string; count: number }>) =>
      Object.fromEntries(rows.map((r) => [r._id, r.count]));

    res.json({
      success: true,
      data: {
        days,
        series,
        totals: {
          revenue: current.total,
          previousRevenue: previous.total,
          orders: currentOrders,
          previousOrders,
          averageOrder: current.count ? current.total / current.count : 0,
        },
        ordersByStatus: toRecord(byStatus),
        bookingsByStatus: toRecord(bookingsByStatus),
        topCustomers,
      },
    });
  });

  // ---- Orders ----

  static getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const { page, limit, q, status } = req.query as unknown as { page: number; limit: number; q: string; status: string };
    const filter: Record<string, unknown> = { clientId };
    if (status !== "all") filter.status = status;
    if (q) {
      const pattern = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [{ customerName: pattern }, { customerEmail: pattern }, { "items.name": pattern }];
    }

    const [items, total, counts] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(filter),
      Order.aggregate<{ _id: string; count: number }>([
        { $match: { clientId: oid(clientId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: { ...paginated(items, total, page, limit), counts: Object.fromEntries(counts.map((c) => [c._id, c.count])) },
    });
  });

  static createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const { customerName, customerEmail, items, notes, status } = req.body;
    const client = await Client.findById(clientId).select("currency taxRate pricesIncludeTax");
    const lineSum = (items as Array<{ quantity: number; unitPrice: number }>).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totals = computeTotals(lineSum, client?.taxRate || 0, client?.pricesIncludeTax ?? true);
    const currency = req.body.currency || client?.currency || "AED";

    const customer = await resolveCustomer(clientId, customerName, customerEmail || undefined);
    const order = await Order.create({
      clientId,
      customerId: customer._id,
      customerName,
      customerEmail: customerEmail || undefined,
      items,
      ...totals,
      currency,
      notes,
      status,
    });

    await Promise.all([
      refreshCustomerStats(clientId, customer._id),
      Notification.create({ clientId, type: "order", title: "New order", message: `A new order from ${customerName} was received.` }),
    ]);

    res.status(201).json({ success: true, data: order });
  });

  static getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const [order, client] = await Promise.all([
      Order.findOne({ _id: req.params.id, clientId }),
      Client.findById(clientId).select(SETTINGS_FIELDS),
    ]);
    if (!order) throw new AppError("Order not found", 404);
    res.json({ success: true, data: { order, business: client } });
  });

  static updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const order = await Order.findOneAndUpdate({ _id: req.params.id, clientId }, { status: req.body.status }, { new: true });
    if (!order) throw new AppError("Order not found", 404);
    await refreshCustomerStats(clientId, order.customerId);
    res.json({ success: true, data: order });
  });

  static deleteOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const order = await Order.findOne({ _id: req.params.id, clientId });
    if (!order) throw new AppError("Order not found", 404);
    await order.deleteOne();
    await refreshCustomerStats(clientId, order.customerId);
    res.json({ success: true, data: { id: order._id } });
  });

  // ---- Customers ----

  static getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const { page, limit, q, sort } = req.query as unknown as { page: number; limit: number; q: string; sort: string };
    const filter: Record<string, unknown> = { clientId };
    if (q) {
      const pattern = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
    }
    const order: Record<string, 1 | -1> =
      sort === "spend" ? { totalSpent: -1, name: 1 } : sort === "name" ? { name: 1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Customer.find(filter).sort(order).skip((page - 1) * limit).limit(limit).collation({ locale: "en", strength: 2 }),
      Customer.countDocuments(filter),
    ]);
    res.json({ success: true, data: paginated(items, total, page, limit) });
  });

  static getCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const customer = await Customer.findOne({ _id: req.params.id, clientId });
    if (!customer) throw new AppError("Customer not found", 404);
    const orders = await Order.find({ clientId, customerId: customer._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: { customer, orders } });
  });

  static createCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, email, phone, notes } = req.body;
    const customer = await Customer.create({
      clientId: clientIdFor(req),
      name,
      email: email || undefined,
      phone: phone || undefined,
      notes: notes || "",
    });
    res.status(201).json({ success: true, data: customer });
  });

  static updateCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};
    for (const field of ["name", "email", "phone", "notes"] as const) {
      const value = req.body[field];
      if (value === undefined) continue;
      if (value === "" && field !== "notes") $unset[field] = 1;
      else $set[field] = value;
    }
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, clientId },
      { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) },
      { new: true, runValidators: true }
    );
    if (!customer) throw new AppError("Customer not found", 404);
    res.json({ success: true, data: customer });
  });

  static deleteCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const customer = await Customer.findOne({ _id: req.params.id, clientId });
    if (!customer) throw new AppError("Customer not found", 404);
    await customer.deleteOne();
    // Keep order history; just detach it from the deleted profile.
    await Order.updateMany({ clientId, customerId: customer._id }, { $unset: { customerId: 1 } });
    res.json({ success: true, data: { id: customer._id } });
  });

  // ---- Bookings ----

  static getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const scope = req.query.scope as string;
    const now = new Date();
    // Upcoming includes anything that started within the last hour so an
    // in-progress appointment doesn't vanish from the list.
    const cutoff = new Date(now.getTime() - 60 * 60_000);
    const filter =
      scope === "upcoming"
        ? { clientId, scheduledFor: { $gte: cutoff } }
        : scope === "past"
          ? { clientId, scheduledFor: { $lt: cutoff } }
          : { clientId };
    const bookings = await Booking.find(filter)
      .sort({ scheduledFor: scope === "past" ? -1 : 1 })
      .limit(200);
    res.json({ success: true, data: bookings });
  });

  static createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const { customerName, customerEmail, service, scheduledFor, durationMinutes, notes } = req.body;
    const booking = await Booking.create({
      clientId,
      customerName,
      customerEmail: customerEmail || undefined,
      service,
      scheduledFor,
      durationMinutes,
      notes,
    });
    await Notification.create({ clientId, type: "booking", title: "New booking", message: `${customerName} booked ${service}.` });
    res.status(201).json({ success: true, data: booking });
  });

  static updateBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, clientId: clientIdFor(req) },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!booking) throw new AppError("Booking not found", 404);
    res.json({ success: true, data: booking });
  });

  static deleteBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const booking = await Booking.findOne({ _id: req.params.id, clientId: clientIdFor(req) });
    if (!booking) throw new AppError("Booking not found", 404);
    await booking.deleteOne();
    res.json({ success: true, data: { id: booking._id } });
  });

  // ---- Notifications ----

  static getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const notifications = await Notification.find({ clientId: clientIdFor(req) }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: notifications });
  });

  static markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, clientId: clientIdFor(req) },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!notification) throw new AppError("Notification not found", 404);
    res.json({ success: true, data: notification });
  });

  static markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await Notification.updateMany(
      { clientId: clientIdFor(req), readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );
    res.json({ success: true, data: { updated: result.modifiedCount } });
  });

  // ---- Settings ----

  static getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const client = await Client.findById(clientIdFor(req)).select(SETTINGS_FIELDS);
    if (!client) throw new AppError("Client not found", 404);
    res.json({ success: true, data: client });
  });

  static updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const client = await Client.findByIdAndUpdate(clientIdFor(req), { $set: req.body }, { new: true, runValidators: true })
      .select(SETTINGS_FIELDS);
    if (!client) throw new AppError("Client not found", 404);
    res.json({ success: true, data: client });
  });

  // ---- Insights ----

  /**
   * Returns structured, language-neutral insights. The OS renders each `key`
   * with its own translations, so the same payload works in English and Arabic.
   */
  static getInsight = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = clientIdFor(req);
    const tzOffset = Number(req.body.tzOffset) || 0;
    const today = startOfLocalDay(tzOffset);
    const weekEnd = new Date(today.getTime() + DAY);
    const weekStart = new Date(weekEnd.getTime() - 7 * DAY);
    const prevWeekStart = new Date(weekStart.getTime() - 7 * DAY);
    const monthStart = new Date(weekEnd.getTime() - 30 * DAY);
    const now = new Date();

    const [
      orderCount,
      customerCount,
      bookingCount,
      thisWeek,
      lastWeek,
      pendingOrders,
      nextBookings,
      upcomingWeek,
      topCustomer,
      repeatCustomers,
      monthOrders,
      monthCancelled,
      allTime,
    ] = await Promise.all([
      Order.countDocuments({ clientId }),
      Customer.countDocuments({ clientId }),
      Booking.countDocuments({ clientId }),
      sumRevenue(clientId, weekStart, weekEnd),
      sumRevenue(clientId, prevWeekStart, weekStart),
      Order.countDocuments({ clientId, status: "pending" }),
      Booking.find({ clientId, scheduledFor: { $gte: now }, status: { $in: ["pending", "confirmed"] } })
        .sort({ scheduledFor: 1 })
        .limit(1)
        .select("customerName service scheduledFor"),
      Booking.countDocuments({
        clientId,
        scheduledFor: { $gte: now, $lt: new Date(now.getTime() + 7 * DAY) },
        status: { $in: ["pending", "confirmed"] },
      }),
      Customer.findOne({ clientId, totalSpent: { $gt: 0 } }).sort({ totalSpent: -1 }).select("name totalSpent orderCount"),
      Customer.countDocuments({ clientId, orderCount: { $gt: 1 } }),
      Order.countDocuments({ clientId, createdAt: { $gte: monthStart } }),
      Order.countDocuments({ clientId, createdAt: { $gte: monthStart }, status: "cancelled" }),
      sumRevenue(clientId),
    ]);

    type Insight = { key: string; tone: "positive" | "neutral" | "attention"; params: Record<string, string | number> };
    const insights: Insight[] = [];

    if (orderCount === 0 && bookingCount === 0 && customerCount === 0) {
      insights.push({ key: "empty", tone: "neutral", params: {} });
    } else {
      if (thisWeek.total > 0 || lastWeek.total > 0) {
        const change = lastWeek.total ? Math.round(((thisWeek.total - lastWeek.total) / lastWeek.total) * 100) : 100;
        insights.push({
          key: thisWeek.total >= lastWeek.total ? "revenueUp" : "revenueDown",
          tone: thisWeek.total >= lastWeek.total ? "positive" : "attention",
          params: { current: thisWeek.total, previous: lastWeek.total, change: Math.abs(change) },
        });
      }
      if (pendingOrders > 0) {
        insights.push({ key: "pendingOrders", tone: "attention", params: { count: pendingOrders } });
      }
      if (nextBookings[0]) {
        insights.push({
          key: "nextBooking",
          tone: "neutral",
          params: {
            customer: nextBookings[0].customerName,
            service: nextBookings[0].service,
            at: nextBookings[0].scheduledFor.toISOString(),
            week: upcomingWeek,
          },
        });
      }
      if (topCustomer) {
        insights.push({
          key: "topCustomer",
          tone: "positive",
          params: { name: topCustomer.name, spent: topCustomer.totalSpent, orders: topCustomer.orderCount },
        });
      }
      if (customerCount >= 3) {
        insights.push({
          key: "repeatRate",
          tone: repeatCustomers / customerCount >= 0.3 ? "positive" : "neutral",
          params: { rate: Math.round((repeatCustomers / customerCount) * 100), repeat: repeatCustomers },
        });
      }
      if (allTime.count > 0) {
        insights.push({ key: "averageOrder", tone: "neutral", params: { value: Math.round(allTime.total / allTime.count) } });
      }
      if (monthOrders >= 5 && monthCancelled / monthOrders > 0.15) {
        insights.push({
          key: "cancellations",
          tone: "attention",
          params: { rate: Math.round((monthCancelled / monthOrders) * 100) },
        });
      }
    }

    res.json({
      success: true,
      data: {
        summary: { orders: orderCount, customers: customerCount, bookings: bookingCount, revenue: allTime.total },
        insights,
        generatedAt: new Date().toISOString(),
      },
    });
  });
}

export default BusinessController;
