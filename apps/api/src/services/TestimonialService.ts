import Testimonial from "../models/Testimonial";
import { AppError } from "../utils/error-handler";

export class TestimonialService {
  async getAllTestimonials() {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return testimonials;
  }

  async getFeaturedTestimonials(limit = 6) {
    const testimonials = await Testimonial.find({ featured: true })
      .limit(limit)
      .sort({ createdAt: -1 });
    return testimonials;
  }

  async getTestimonialById(id: string) {
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      throw new AppError("Testimonial not found", 404);
    }
    return testimonial;
  }

  async createTestimonial(data: any) {
    const testimonial = new Testimonial(data);
    await testimonial.save();
    return testimonial;
  }

  async updateTestimonial(id: string, data: any) {
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      throw new AppError("Testimonial not found", 404);
    }
    return testimonial;
  }

  async deleteTestimonial(id: string) {
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      throw new AppError("Testimonial not found", 404);
    }
    return testimonial;
  }
}

export default new TestimonialService();
