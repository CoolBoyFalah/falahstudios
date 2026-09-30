export type Status = "pending" | "confirmed" | "completed" | "cancelled";
export const STATUSES: Status[] = ["pending", "confirmed", "completed", "cancelled"];

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  _id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  taxRate?: number;
  total: number;
  currency: string;
  status: Status;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderAt?: string;
  notes: string;
  createdAt: string;
}

export interface Booking {
  _id: string;
  customerName: string;
  customerEmail?: string;
  service: string;
  scheduledFor: string;
  durationMinutes: number;
  status: Status;
  notes: string;
}

export interface Notice {
  _id: string;
  title: string;
  message: string;
  type: "order" | "booking" | "system";
  readAt?: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface DashboardData {
  metrics: {
    revenue: number;
    revenue30d: number;
    ordersToday: number;
    ordersYesterday: number;
    pendingOrders: number;
    customers: number;
    newCustomers30d: number;
    bookingsToday: number;
  };
  recentOrders: Order[];
  upcomingBookings: Booking[];
  unreadNotifications: number;
}

export interface AnalyticsData {
  days: number;
  series: Array<{ date: string; revenue: number; orders: number }>;
  totals: { revenue: number; previousRevenue: number; orders: number; previousOrders: number; averageOrder: number };
  ordersByStatus: Partial<Record<Status, number>>;
  bookingsByStatus: Partial<Record<Status, number>>;
  topCustomers: Array<Pick<Customer, "_id" | "name" | "totalSpent" | "orderCount">>;
}

export interface Insight {
  key: string;
  tone: "positive" | "neutral" | "attention";
  params: Record<string, string | number>;
}

export interface InsightData {
  summary: { orders: number; customers: number; bookings: number; revenue: number };
  insights: Insight[];
  generatedAt: string;
}

export type CatalogType = "product" | "service";

export interface CatalogItem {
  _id: string;
  type: CatalogType;
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes?: number;
  available: boolean;
  featured: boolean;
}

export interface OpeningHours {
  day: number;
  closed: boolean;
  open: string;
  close: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Website {
  businessName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  openingHours: string;
  hours: OpeningHours[];
  announcement: { enabled: boolean; text: string };
  faqs: Faq[];
  seoTitle: string;
  seoDescription: string;
  tiktok: string;
  facebook: string;
  mapsUrl: string;
  published: boolean;
  updatedAt?: string;
}

export interface WorkspaceSettings {
  name: string;
  slug: string;
  clientCode: string;
  createdAt: string;
  currency: string;
  taxRate: number;
  pricesIncludeTax: boolean;
  taxNumber: string;
  receiptNote: string;
}

export const CURRENCIES = ["AED", "SAR", "KWD", "QAR", "BHD", "OMR", "EGP", "JOD", "USD", "EUR", "GBP"] as const;
