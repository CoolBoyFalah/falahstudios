import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  budget?: string;
  services?: string[];
  status: "new" | "read" | "responded" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    phone: {
      type: String,
    },
    company: {
      type: String,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    budget: {
      type: String,
    },
    services: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["new", "read", "responded", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContact>("Contact", ContactSchema);
