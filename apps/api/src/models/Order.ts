import mongoose, { Document, Schema } from "mongoose";

export const ORDER_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface IOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrder extends Document {
  clientId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  items: IOrderItem[];
  /** Before tax. Equals total when no tax applies. */
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  status: OrderStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    items: {
      type: [{
        _id: false,
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
      }],
      validate: [(items: IOrderItem[]) => items.length > 0, "An order needs at least one item"],
    },
    subtotal: { type: Number, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "AED", trim: true, uppercase: true },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

OrderSchema.index({ clientId: 1, createdAt: -1 });
OrderSchema.index({ clientId: 1, status: 1 });
OrderSchema.index({ clientId: 1, customerId: 1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
