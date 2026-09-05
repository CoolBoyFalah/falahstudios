import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface IOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrder extends Document {
  clientId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  items: IOrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    items: [{
      name: { type: String, required: true, trim: true },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
    }],
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "AED", trim: true, uppercase: true },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

OrderSchema.index({ clientId: 1, createdAt: -1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
