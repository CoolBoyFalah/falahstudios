import { ReactNode } from "react";

export interface SectionProps {
  children?: ReactNode;
  className?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  link?: string;
  technologies: string[];
  results?: string[];
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
  image?: string;
  rating: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
  publishedAt: Date;
  updatedAt: Date;
}
