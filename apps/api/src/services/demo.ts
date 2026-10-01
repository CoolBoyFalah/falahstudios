import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Booking from "../models/Booking";
import CatalogItem from "../models/CatalogItem";
import Client from "../models/Client";
import Customer from "../models/Customer";
import Notification from "../models/Notification";
import Order from "../models/Order";
import Website from "../models/website";
import { computeTotals } from "./tax";

/**
 * The public demo workspace: a sample bakery anyone can explore at /demo or
 * with the access code FAL-DEMO-TRYFALAH. Its data is rebuilt from scratch
 * (relative to today) by a nightly cron, so visitors can change anything.
 */
export const DEMO_CLIENT_CODE = "DEMO";
export const DEMO_SECRET = "TRYFALAH";
const DEMO_SLUG = "demo";
const DEMO_NAME = "Layla's Bakery";
/** Rebuild on sign-in if the nightly reset hasn't run for this long. */
const STALE_AFTER_MS = 26 * 60 * 60 * 1000;

const DAY = 86_400_000;
const GST_OFFSET = 4 * 60 * 60 * 1000; // UAE time, UTC+4

/** Deterministic pseudo-random numbers, so every reset looks the same. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A moment `daysAgo` days back at a UAE wall-clock time, never in the future. */
function uaeTime(now: number, daysAgo: number, hour: number, minute = 0) {
  const uaeMidnight = Math.floor((now + GST_OFFSET) / DAY) * DAY - GST_OFFSET;
  const at = uaeMidnight - daysAgo * DAY + (hour * 60 + minute) * 60_000;
  return new Date(Math.min(at, now - 5 * 60_000));
}

/** A future (or past) slot `daysAhead` days from today at a UAE wall-clock time. */
function uaeSlot(now: number, daysAhead: number, hour: number, minute = 0) {
  const uaeMidnight = Math.floor((now + GST_OFFSET) / DAY) * DAY - GST_OFFSET;
  return new Date(uaeMidnight + daysAhead * DAY + (hour * 60 + minute) * 60_000);
}

const CATALOG = [
  { type: "product", name: "Croissant box", category: "Pastries", price: 45, featured: true, description: "Six butter croissants, out of the oven at 6 AM." },
  { type: "product", name: "Pistachio knafeh", category: "Pastries", price: 38, description: "Warm, per slice, with orange blossom syrup." },
  { type: "product", name: "Saffron cardamom bun", category: "Pastries", price: 14, description: "" },
  { type: "product", name: "Sourdough loaf", category: "Bread", price: 32, description: "48-hour fermented country loaf." },
  { type: "product", name: "Za'atar manakeesh", category: "Bread", price: 12, description: "" },
  { type: "product", name: "Flat white", category: "Coffee", price: 18.5, description: "" },
  { type: "product", name: "Spanish latte", category: "Coffee", price: 22, description: "" },
  { type: "product", name: "Karak chai", category: "Coffee", price: 8, description: "" },
  { type: "product", name: "Celebration cake", category: "Cakes", price: 320, featured: true, description: "Serves 12. Order 48 hours ahead." },
  { type: "service", name: "Cake tasting", category: "Services", price: 150, durationMinutes: 60, description: "Taste four flavours with our pastry chef." },
  { type: "service", name: "Custom cake consult", category: "Services", price: 100, durationMinutes: 30, description: "" },
  { type: "service", name: "Breakfast catering", category: "Services", price: 650, durationMinutes: 90, description: "Pastries and coffee for up to 20 people." },
] as const;

const CUSTOMERS = [
  { name: "Sara Ali", email: "sara.ali@example.com", phone: "+971 50 000 0101", notes: "Prefers pickup before 9 AM." },
  { name: "Omar Saeed", email: "omar.saeed@example.com", phone: "+971 50 000 0102", notes: "" },
  { name: "Lina Haddad", email: "lina.haddad@example.com", phone: "", notes: "Nut allergy, always confirm." },
  { name: "Huda Karim", email: "", phone: "+971 50 000 0104", notes: "" },
  { name: "Ahmed Al Mansoori", email: "ahmed.mansoori@example.com", phone: "+971 50 000 0105", notes: "Office orders for his team." },
  { name: "Mariam Khalifa", email: "mariam.k@example.com", phone: "", notes: "" },
  { name: "Yousef Nasser", email: "", phone: "+971 50 000 0107", notes: "" },
  { name: "Fatima Rashid", email: "fatima.rashid@example.com", phone: "+971 50 000 0108", notes: "" },
  { name: "Daniel Brooks", email: "daniel.brooks@example.com", phone: "", notes: "" },
  { name: "Priya Menon", email: "priya.menon@example.com", phone: "+971 50 000 0110", notes: "Loves the knafeh." },
  { name: "Khalid Al Suwaidi", email: "", phone: "+971 50 000 0111", notes: "" },
  { name: "Noura Al Hammadi", email: "noura.h@example.com", phone: "+971 50 000 0112", notes: "" },
];

/** Creates the demo client if needed and rebuilds all of its data. */
export async function resetDemoWorkspace(now = Date.now()) {
  let client = await Client.findOne({ clientCode: DEMO_CLIENT_CODE });
  if (!client) {
    client = await Client.create({
      name: DEMO_NAME,
      slug: DEMO_SLUG,
      clientCode: DEMO_CLIENT_CODE,
      accessCodeHash: await bcrypt.hash(DEMO_SECRET, 10),
      isDemo: true,
    });
  }
  client.set({
    name: DEMO_NAME,
    isActive: true,
    isDemo: true,
    currency: "AED",
    taxRate: 5,
    pricesIncludeTax: true,
    taxNumber: "100000000000003",
    receiptNote: "Thank you for choosing Layla's Bakery!",
    demoResetAt: new Date(now),
  });
  await client.save();

  const clientId = client._id as mongoose.Types.ObjectId;
  await Promise.all([
    Order.deleteMany({ clientId }),
    Customer.deleteMany({ clientId }),
    Booking.deleteMany({ clientId }),
    Notification.deleteMany({ clientId }),
    CatalogItem.deleteMany({ clientId }),
    Website.deleteMany({ clientId }),
  ]);

  const random = rng(20261003);
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];

  // Catalog
  await CatalogItem.insertMany(CATALOG.map((item) => ({ ...item, clientId, available: true, featured: "featured" in item && item.featured })));

  // Customers (stats filled in after orders are generated)
  const customers = CUSTOMERS.map((c, index) => ({
    _id: new mongoose.Types.ObjectId(),
    clientId,
    name: c.name,
    ...(c.email ? { email: c.email } : {}),
    ...(c.phone ? { phone: c.phone } : {}),
    notes: c.notes,
    totalSpent: 0,
    orderCount: 0,
    // The last few are recent sign-ups, so "new customers" isn't zero.
    createdAt: uaeTime(now, index >= 9 ? 4 + (index - 9) * 6 : 40 + Math.floor(random() * 20), 10),
    updatedAt: new Date(now),
  }));

  // Orders: ~45 over the last 30 days, busier recently, mostly completed.
  const products = CATALOG.filter((c) => c.type === "product");
  const orders: Record<string, unknown>[] = [];
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const perDay = daysAgo <= 1 ? 3 : random() < 0.45 + (29 - daysAgo) / 80 ? 2 : 1;
    for (let n = 0; n < perDay; n++) {
      // A handful of loyal regulars make up most of the orders.
      const customer = random() < 0.6 ? customers[Math.floor(random() * 5)] : pick(customers);
      const lineCount = 1 + Math.floor(random() * 3);
      const items = Array.from({ length: lineCount }, () => {
        const p = random() < 0.035 ? CATALOG[8] : pick(products);
        return { name: p.name, quantity: p.name === "Celebration cake" ? 1 : 1 + Math.floor(random() * 3), unitPrice: p.price };
      });
      const sum = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      const status = daysAgo === 0 ? (n === 0 ? "pending" : n === 1 ? "pending" : "confirmed")
        : daysAgo === 1 && n === 0 ? "pending"
        : random() < 0.05 ? "cancelled" : "completed";
      const createdAt = uaeTime(now, daysAgo, 7 + Math.floor(random() * 13), Math.floor(random() * 60));
      orders.push({
        clientId,
        customerId: customer._id,
        customerName: customer.name,
        ...(customer.email ? { customerEmail: customer.email } : {}),
        items,
        ...computeTotals(sum, 5, true),
        currency: "AED",
        status,
        notes: random() < 0.1 ? "Please add a candle." : "",
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  for (const c of customers) {
    const theirs = orders.filter((o) => String(o.customerId) === String(c._id) && o.status !== "cancelled");
    c.orderCount = theirs.length;
    c.totalSpent = Math.round(theirs.reduce((s, o) => s + (o.total as number), 0) * 100) / 100;
    const last = theirs.map((o) => (o.createdAt as Date).getTime()).sort((a, b) => b - a)[0];
    if (last) (c as Record<string, unknown>).lastOrderAt = new Date(last);
  }

  await Customer.collection.insertMany(customers);
  await Order.collection.insertMany(orders);

  // Bookings: a few done, today's schedule, and the week ahead.
  const bookingPlan: Array<[number, number, number, number, string, string]> = [
    [-6, 10, 0, 60, "Cake tasting", "Mariam Khalifa"],
    [-3, 9, 0, 90, "Breakfast catering", "Ahmed Al Mansoori"],
    [-1, 16, 30, 30, "Custom cake consult", "Priya Menon"],
    [0, 10, 0, 60, "Cake tasting", "Sara Ali"],
    [0, 13, 30, 30, "Custom cake consult", "Omar Saeed"],
    [0, 17, 0, 15, "Birthday order pickup", "Lina Haddad"],
    [1, 9, 30, 90, "Breakfast catering", "Ahmed Al Mansoori"],
    [1, 16, 0, 60, "Cake tasting", "Huda Karim"],
    [3, 11, 0, 30, "Custom cake consult", "Noura Al Hammadi"],
    [5, 15, 0, 60, "Cake tasting", "Daniel Brooks"],
  ];
  const nowDate = new Date(now);
  await Booking.collection.insertMany(bookingPlan.map(([day, h, m, duration, service, name], i) => {
    const scheduledFor = uaeSlot(now, day, h, m);
    const past = scheduledFor < nowDate;
    return {
      clientId,
      customerName: name,
      service,
      scheduledFor,
      durationMinutes: duration,
      status: past ? "completed" : i % 3 === 1 ? "pending" : "confirmed",
      notes: service === "Breakfast catering" ? "20 people, office in Business Bay" : "",
      createdAt: new Date(scheduledFor.getTime() - 4 * DAY),
      updatedAt: new Date(now),
    };
  }));

  // Notifications for the latest activity
  const latest = [...orders].sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime()).slice(0, 5);
  await Notification.collection.insertMany([
    ...latest.map((o, i) => ({
      clientId, type: "order", title: "New order",
      message: `A new order from ${o.customerName} was received.`,
      ...(i >= 3 ? { readAt: new Date(now) } : {}),
      createdAt: o.createdAt, updatedAt: o.createdAt,
    })),
    {
      clientId, type: "booking", title: "New booking", message: "Daniel Brooks booked Cake tasting.",
      readAt: new Date(now), createdAt: uaeTime(now, 1, 12), updatedAt: new Date(now),
    },
  ]);

  // Website
  await Website.create({
    clientId,
    businessName: DEMO_NAME,
    tagline: "Fresh from our oven, every morning.",
    description: "Croissants, knafeh and celebration cakes, baked in Al Barsha since 2019. Order ahead for pickup or delivery across Dubai.",
    contactEmail: "hello@laylasbakery.example",
    phone: "+971 50 000 0100",
    whatsapp: "+971 50 000 0100",
    instagram: "@laylasbakery",
    address: "Al Barsha 1, Dubai",
    openingHours: "Ramadan hours may vary.",
    hours: [
      { day: 1, closed: false, open: "07:00", close: "22:00" },
      { day: 2, closed: false, open: "07:00", close: "22:00" },
      { day: 3, closed: false, open: "07:00", close: "22:00" },
      { day: 4, closed: false, open: "07:00", close: "22:00" },
      { day: 5, closed: false, open: "07:00", close: "23:59" },
      { day: 6, closed: false, open: "08:00", close: "23:00" },
      { day: 0, closed: false, open: "08:00", close: "23:00" },
    ],
    announcement: { enabled: true, text: "Open late this Friday" },
    faqs: [
      { question: "Do you deliver?", answer: "Yes, across Dubai. Orders before 2 PM arrive the same day." },
      { question: "How early should I order a celebration cake?", answer: "48 hours ahead, or 72 hours for custom designs." },
      { question: "Do you have nut-free options?", answer: "Yes. Tell us about allergies when you order and we'll confirm." },
    ],
    seoTitle: "Layla's Bakery · Fresh pastries in Al Barsha, Dubai",
    seoDescription: "Croissants, knafeh and celebration cakes baked fresh every morning. Order ahead for pickup or delivery.",
    published: true,
  });

  return client;
}

/** Returns the demo client, building or refreshing it if needed. */
export async function ensureDemoWorkspace() {
  const client = await Client.findOne({ clientCode: DEMO_CLIENT_CODE, isDemo: true });
  const stale = !client?.demoResetAt || Date.now() - client.demoResetAt.getTime() > STALE_AFTER_MS;
  return client && !stale ? client : resetDemoWorkspace();
}
