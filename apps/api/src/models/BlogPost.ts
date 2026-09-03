import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
