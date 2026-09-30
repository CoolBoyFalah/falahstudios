import Joi from "joi";
import { Request, Response, NextFunction } from "express";

interface RequestSchemas {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

/**
 * Validates and normalises each part of the request independently.
 * Unknown keys are stripped so handlers only ever see fields they expect.
 */
export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string }> = [];

    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;

      const { error, value } = schema.validate(req[part] ?? {}, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        errors.push(
          ...error.details.map((detail) => ({
            field: [part, ...detail.path].join("."),
            message: detail.message.replace(/"/g, ""),
          }))
        );
      } else {
        req[part] = value;
      }
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors[0].message,
        details: errors,
      });
    }

    next();
  };
}
