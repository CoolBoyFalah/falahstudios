import Joi from "joi";
import { ORDER_STATUSES } from "../models/Order";
import { BOOKING_STATUSES } from "../models/Booking";
import { CATALOG_TYPES } from "../models/CatalogItem";

const objectId = Joi.string().hex().length(24);
const optionalText = (max: number) => Joi.string().trim().max(max).allow("");
const email = Joi.string().trim().lowercase().email().max(200).allow("");

export const idParams = Joi.object({ id: objectId.required() });

/** Browser timezone offset in minutes (same sign as Date#getTimezoneOffset). */
const tzOffset = Joi.number().integer().min(-840).max(840).default(0);

export const dashboardQuery = Joi.object({ tzOffset });

export const analyticsQuery = Joi.object({
  days: Joi.number().integer().valid(7, 30, 90).default(30),
  tzOffset,
});

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  q: Joi.string().trim().max(100).allow("").default(""),
};

export const listOrdersQuery = Joi.object({
  ...pagination,
  status: Joi.string().valid(...ORDER_STATUSES, "all").default("all"),
});

export const createOrderBody = Joi.object({
  customerName: Joi.string().trim().min(1).max(120).required(),
  customerEmail: email,
  // Omitted → the workspace's default currency.
  currency: Joi.string().trim().uppercase().length(3),
  notes: optionalText(1000),
  status: Joi.string().valid(...ORDER_STATUSES).default("pending"),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(1).max(160).required(),
        quantity: Joi.number().integer().min(1).max(100000).required(),
        unitPrice: Joi.number().min(0).max(100000000).precision(2).required(),
      })
    )
    .min(1)
    .max(50)
    .required(),
});

export const orderStatusBody = Joi.object({
  status: Joi.string().valid(...ORDER_STATUSES).required(),
});

export const listCustomersQuery = Joi.object({
  ...pagination,
  sort: Joi.string().valid("recent", "spend", "name").default("recent"),
});

export const createCustomerBody = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  email,
  phone: optionalText(40),
  notes: optionalText(2000),
});

export const updateCustomerBody = Joi.object({
  name: Joi.string().trim().min(1).max(120),
  email,
  phone: optionalText(40),
  notes: optionalText(2000),
}).min(1);

export const listBookingsQuery = Joi.object({
  scope: Joi.string().valid("upcoming", "past", "all").default("upcoming"),
});

export const createBookingBody = Joi.object({
  customerName: Joi.string().trim().min(1).max(120).required(),
  customerEmail: email,
  service: Joi.string().trim().min(1).max(160).required(),
  scheduledFor: Joi.date().iso().required(),
  durationMinutes: Joi.number().integer().min(5).max(1440).default(60),
  notes: optionalText(1000),
});

export const updateBookingBody = Joi.object({
  customerName: Joi.string().trim().min(1).max(120),
  service: Joi.string().trim().min(1).max(160),
  scheduledFor: Joi.date().iso(),
  durationMinutes: Joi.number().integer().min(5).max(1440),
  status: Joi.string().valid(...BOOKING_STATUSES),
  notes: optionalText(1000),
}).min(1);

export const CURRENCIES = ["AED", "SAR", "KWD", "QAR", "BHD", "OMR", "EGP", "JOD", "USD", "EUR", "GBP"] as const;

export const settingsBody = Joi.object({
  name: Joi.string().trim().min(1).max(120),
  currency: Joi.string().valid(...CURRENCIES),
  taxRate: Joi.number().min(0).max(100).precision(2),
  pricesIncludeTax: Joi.boolean(),
  taxNumber: optionalText(40),
  receiptNote: optionalText(500),
}).min(1);

export const listCatalogQuery = Joi.object({
  type: Joi.string().valid(...CATALOG_TYPES, "all").default("all"),
  q: Joi.string().trim().max(100).allow("").default(""),
  available: Joi.boolean(),
});

const catalogFields = {
  type: Joi.string().valid(...CATALOG_TYPES),
  name: Joi.string().trim().min(1).max(160),
  description: optionalText(1000),
  category: optionalText(60),
  price: Joi.number().min(0).max(100000000).precision(2),
  durationMinutes: Joi.number().integer().min(5).max(1440).allow(null),
  available: Joi.boolean(),
  featured: Joi.boolean(),
};

export const createCatalogBody = Joi.object({
  ...catalogFields,
  type: catalogFields.type.default("product"),
  name: catalogFields.name.required(),
  price: catalogFields.price.required(),
});

export const updateCatalogBody = Joi.object(catalogFields).min(1);

export const insightsBody = Joi.object({ tzOffset });

export const websiteBody = Joi.object({
  businessName: Joi.string().trim().min(1).max(120),
  tagline: optionalText(160),
  description: optionalText(2000),
  contactEmail: email,
  phone: optionalText(40),
  whatsapp: optionalText(40),
  instagram: optionalText(80),
  address: optionalText(300),
  openingHours: optionalText(300),
  hours: Joi.array()
    .items(
      Joi.object({
        day: Joi.number().integer().min(0).max(6).required(),
        closed: Joi.boolean().default(false),
        open: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).default("09:00"),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).default("18:00"),
      })
    )
    .max(7)
    .unique("day"),
  announcement: Joi.object({ enabled: Joi.boolean().default(false), text: optionalText(200).default("") }),
  faqs: Joi.array()
    .items(Joi.object({ question: Joi.string().trim().min(1).max(200).required(), answer: optionalText(1000).default("") }))
    .max(30),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  tiktok: optionalText(80),
  facebook: optionalText(120),
  mapsUrl: Joi.string().trim().uri({ scheme: ["http", "https"] }).max(500).allow(""),
  published: Joi.boolean(),
}).min(1);
