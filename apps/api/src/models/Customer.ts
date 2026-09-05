import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  clientId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  totalSpent: number;
  orderCount: number;
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
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ clientId: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
