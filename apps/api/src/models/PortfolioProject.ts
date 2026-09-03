import mongoose, { Schema, Document } from "mongoose";

export interface IPortfolioProject extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  image: string;
  images: string[];
  link?: string;
  technologies: string[];
  results: string[];
  clientName?: string;
  startDate: Date;
  endDate: Date;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioProjectSchema = new Schema<IPortfolioProject>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
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
      required: [true, "Project description is required"],
    },
    shortDescription: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Web Development", "Branding", "Content", "Automation", "Marketing"],
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    link: {
      type: String,
    },
    technologies: {
      type: [String],
      default: [],
    },
    results: {
      type: [String],
      default: [],
    },
    clientName: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPortfolioProject>(
  "PortfolioProject",
  PortfolioProjectSchema
);
