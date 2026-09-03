import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  author: string;
  role: string;
  company: string;
  content: string;
  image?: string;
  rating: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, "Testimonial content is required"],
    },
    image: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITestimonial>(
  "Testimonial",
  TestimonialSchema
);
