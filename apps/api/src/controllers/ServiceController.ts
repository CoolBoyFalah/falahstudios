import { Request, Response } from "express";
import ServiceService from "../services/ServiceService";
import { AppError, asyncHandler } from "../utils/error-handler";
import Joi from "joi";

export class ServiceController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const services = await ServiceService.getAllServices();
    res.json({
      success: true,
      data: services,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const service = await ServiceService.getServiceById(req.params.id);
    res.json({
      success: true,
      data: service,
    });
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const service = await ServiceService.getServiceBySlug(req.params.slug);
    res.json({
      success: true,
      data: service,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        icon: Joi.string().required(),
        features: Joi.array().items(Joi.string()),
        price: Joi.number().required(),
        deliveryTime: Joi.string().required(),
      }).required(),
    });

    const { error, value } = schema.validate({
      body: req.body,
    });

    if (error) {
      throw new AppError("Validation failed", 400, error.details);
    }

    const service = await ServiceService.createService(value.body);
    res.status(201).json({
      success: true,
      data: service,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const service = await ServiceService.updateService(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: service,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await ServiceService.deleteService(req.params.id);
    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  });
}

export default ServiceController;
