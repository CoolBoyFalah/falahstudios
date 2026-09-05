import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IClient extends Document {
  name: string;
  slug: string;
  clientCode: string;
  accessCodeHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  compareAccessCode(secret: string): Promise<boolean>;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Client slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    clientCode: {
      type: String,
      required: [true, "Client code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    accessCodeHash: {
      type: String,
      required: [true, "Access code hash is required"],
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ClientSchema.methods.compareAccessCode = function (
  this: IClient,
  secret: string
): Promise<boolean> {
  return bcrypt.compare(secret, this.accessCodeHash);
};

export default mongoose.model<IClient>("Client", ClientSchema);