import { Request, Response } from "express";
import PortfolioService from "../services/PortfolioService";
import { asyncHandler, AppError } from "../utils/error-handler";
import Joi from "joi";

export class PortfolioController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.query;
    const projects = await PortfolioService.getAllProjects(
      category as string
    );
    res.json({
      success: true,
      data: projects,
    });
  });

  static getFeatured = asyncHandler(async (req: Request, res: Response) => {
    const projects = await PortfolioService.getFeaturedProjects();
    res.json({
      success: true,
      data: projects,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const project = await PortfolioService.getProjectById(req.params.id);
    res.json({
      success: true,
      data: project,
    });
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const project = await PortfolioService.getProjectBySlug(req.params.slug);
    res.json({
      success: true,
      data: project,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        shortDescription: Joi.string().required(),
        category: Joi.string()
          .valid("Web Development", "Branding", "Content", "Automation", "Marketing")
          .required(),
        image: Joi.string().required(),
        images: Joi.array().items(Joi.string()),
        link: Joi.string().uri(),
        technologies: Joi.array().items(Joi.string()),
        results: Joi.array().items(Joi.string()),
        clientName: Joi.string(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        featured: Joi.boolean(),
      }).required(),
    });

    const { error, value } = schema.validate({ body: req.body });

    if (error) {
      throw new AppError("Validation failed", 400, error.details);
    }

    const project = await PortfolioService.createProject(value.body);
    res.status(201).json({
      success: true,
      data: project,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const project = await PortfolioService.updateProject(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: project,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await PortfolioService.deleteProject(req.params.id);
    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  });
}

export default PortfolioController;
