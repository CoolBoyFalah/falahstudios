import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  clientId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  /** Sum of all non-cancelled orders. Maintained by services/customerStats. */
  totalSpent: number;
  orderCount: number;
  lastOrderAt?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    totalSpent: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 },
    lastOrderAt: { type: Date },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// Emails are unique per workspace, but only when present.
CustomerSchema.index(
  { clientId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);
CustomerSchema.index({ clientId: 1, name: 1 });

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
