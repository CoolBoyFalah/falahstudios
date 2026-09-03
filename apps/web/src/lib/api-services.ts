import apiClient from "./api-client";
import { ServiceItem, PortfolioProject, Testimonial } from "@/types";

// Services
export const servicesApi = {
  getAll: () => apiClient.get<ServiceItem[]>("/services"),
  getById: (id: string) => apiClient.get<ServiceItem>(`/services/${id}`),
};

// Portfolio
export const portfolioApi = {
  getAll: (category?: string) =>
    apiClient.get<PortfolioProject[]>("/portfolio", { params: { category } }),
  getById: (id: string) => apiClient.get<PortfolioProject>(`/portfolio/${id}`),
};

// Testimonials
export const testimonialsApi = {
  getAll: () => apiClient.get<Testimonial[]>("/testimonials"),
};

// Contact
export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) =>
    apiClient.post("/contact", data),
};

// Blog
export const blogApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get("/blog", { params: { page, limit } }),
  getBySlug: (slug: string) => apiClient.get(`/blog/${slug}`),
};
