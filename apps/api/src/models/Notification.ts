import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = "order" | "booking" | "system";

export interface INotification extends Document {
  clientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["order", "booking", "system"], default: "system" },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ clientId: 1, readAt: 1, createdAt: -1 });

export default mongoose.model<INotification>("Notification", NotificationSchema);
