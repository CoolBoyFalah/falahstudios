import { Request, Response } from "express";
import TestimonialService from "../services/TestimonialService";
import { asyncHandler, AppError } from "../utils/error-handler";
import Joi from "joi";

export class TestimonialController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const testimonials = await TestimonialService.getAllTestimonials();
    res.json({
      success: true,
      data: testimonials,
    });
  });

  static getFeatured = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 6;
    const testimonials = await TestimonialService.getFeaturedTestimonials(limit);
    res.json({
      success: true,
      data: testimonials,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const testimonial = await TestimonialService.getTestimonialById(
      req.params.id
    );
    res.json({
      success: true,
      data: testimonial,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      body: Joi.object({
        author: Joi.string().required(),
        role: Joi.string().required(),
        company: Joi.string().required(),
        content: Joi.string().required(),
        image: Joi.string(),
        rating: Joi.number().min(1).max(5).required(),
        featured: Joi.boolean(),
      }).required(),
    });

    const { error, value } = schema.validate({ body: req.body });

    if (error) {
      throw new AppError("Validation failed", 400, error.details);
    }

    const testimonial = await TestimonialService.createTestimonial(value.body);
    res.status(201).json({
      success: true,
      data: testimonial,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const testimonial = await TestimonialService.updateTestimonial(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: testimonial,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await TestimonialService.deleteTestimonial(req.params.id);
    res.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  });
}

export default TestimonialController;
