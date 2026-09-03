import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  price: number;
  deliveryTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
    },
    icon: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    deliveryTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", ServiceSchema);
