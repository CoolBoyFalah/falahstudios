import mongoose, { Document, Schema } from "mongoose";

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface IBooking extends Document {
  clientId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  service: string;
  scheduledFor: Date;
  durationMinutes: number;
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
    durationMinutes: { type: Number, default: 60, min: 5 },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending" },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

BookingSchema.index({ clientId: 1, scheduledFor: 1 });

export default mongoose.model<IBooking>("Booking", BookingSchema);
