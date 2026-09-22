import Joi from "joi";
import { ALLOWED_VALUES } from "./common.validator.js";

export const updateCompanySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    industry: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.industry)
      .optional(),
    company_size: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.company_size)
      .optional(),
    location_id: Joi.number().integer().positive().optional(),
    founded_year: Joi.number()
      .integer()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    website: Joi.string().uri().optional()
  })
});

