import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.body = value.body;
    req.query = value.query;
    req.params = value.params;

    next();
  };
}
