import mongoose, { Document, Schema } from "mongoose";

export interface IOpeningHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  closed: boolean;
  open: string;
  close: string;
}

export interface IFaq {
  question: string;
  answer: string;
}

export interface IWebsite extends Document {
  clientId: mongoose.Types.ObjectId;
  businessName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  openingHours: string;
  hours: IOpeningHours[];
  announcement: { enabled: boolean; text: string };
  faqs: IFaq[];
  seoTitle: string;
  seoDescription: string;
  tiktok: string;
  facebook: string;
  mapsUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const text = { type: String, default: "", trim: true };

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

    tagline: text,
    description: text,
    contactEmail: { ...text, lowercase: true },
    phone: text,
    whatsapp: text,
    instagram: text,
    address: text,
    openingHours: text,
    hours: [{
      _id: false,
      day: { type: Number, min: 0, max: 6, required: true },
      closed: { type: Boolean, default: false },
      open: { type: String, default: "09:00" },
      close: { type: String, default: "18:00" },
    }],
    announcement: {
      enabled: { type: Boolean, default: false },
      text: text,
    },
    faqs: [{
      _id: false,
      question: { type: String, required: true, trim: true },
      answer: { type: String, default: "", trim: true },
    }],
    seoTitle: text,
    seoDescription: text,
    tiktok: text,
    facebook: text,
    mapsUrl: text,

    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWebsite>("Website", WebsiteSchema);
