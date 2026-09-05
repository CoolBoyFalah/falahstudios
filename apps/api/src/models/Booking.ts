import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface IBooking extends Document {
  clientId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  service: string;
  scheduledFor: Date;
  status: BookingStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    service: { type: String, required: true, trim: true },
    scheduledFor: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

BookingSchema.index({ clientId: 1, scheduledFor: 1 });

export default mongoose.model<IBooking>("Booking", BookingSchema);
