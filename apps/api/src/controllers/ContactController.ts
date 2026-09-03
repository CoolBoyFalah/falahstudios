import { Request, Response } from "express";
import ContactService from "../services/ContactService";
import { asyncHandler, AppError } from "../utils/error-handler";
import Joi from "joi";

export class ContactController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const contacts = await ContactService.getAllContacts(status as string);
    res.json({
      success: true,
      data: contacts,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const contact = await ContactService.getContactById(req.params.id);
    res.json({
      success: true,
      data: contact,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string(),
        company: Joi.string(),
        message: Joi.string().required(),
        budget: Joi.string(),
        services: Joi.array().items(Joi.string()),
      }).required(),
    });

    const { error, value } = schema.validate({ body: req.body });

    if (error) {
      throw new AppError("Validation failed", 400, error.details);
    }

    const contact = await ContactService.createContact(value.body);
    res.status(201).json({
      success: true,
      data: contact,
      message: "Message received. We'll get back to you soon!",
    });
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const contact = await ContactService.updateContactStatus(
      req.params.id,
      status
    );
    res.json({
      success: true,
      data: contact,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await ContactService.deleteContact(req.params.id);
    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  });
}

export default ContactController;
