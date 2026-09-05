import mongoose, { Document, Schema } from "mongoose";

export interface IWebsite extends Document {
  clientId: mongoose.Types.ObjectId;
  businessName: string;
  tagline: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteSchema = new Schema<IWebsite>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      unique: true,
      index: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    tagline: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWebsite>("Website", WebsiteSchema);