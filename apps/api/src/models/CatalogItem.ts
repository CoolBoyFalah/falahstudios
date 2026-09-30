import mongoose, { Document, Schema } from "mongoose";

export const CATALOG_TYPES = ["product", "service"] as const;
export type CatalogType = (typeof CATALOG_TYPES)[number];

export interface ICatalogItem extends Document {
  clientId: mongoose.Types.ObjectId;
  type: CatalogType;
  name: string;
  description: string;
  category: string;
  price: number;
  /** Services only: default booking length. */
  durationMinutes?: number;
  available: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogItemSchema = new Schema<ICatalogItem>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    type: { type: String, enum: CATALOG_TYPES, default: "product" },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, min: 5 },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CatalogItemSchema.index({ clientId: 1, type: 1, category: 1, name: 1 });

export default mongoose.model<ICatalogItem>("CatalogItem", CatalogItemSchema);
