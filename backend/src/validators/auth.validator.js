import Joi from "joi";
import { CAREER_LEVELS, COMPANY_SIZES, INDUSTRIES } from "../utils/enums.js";

const email = Joi.string().email().max(255).required();
const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
  .required();

export const registerUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email,
    password,
    years_of_experience: Joi.number().integer().min(0).default(0),
    career_level: Joi.number()
      .integer()
      .valid(...Object.values(CAREER_LEVELS))
      .required(),
    field_id: Joi.number().integer().positive().optional(),
    current_location_id: Joi.number().integer().positive().optional(),
    desired_salary_min: Joi.number().integer().min(0).optional(),
    desired_salary_max: Joi.number()
      .integer()
      .min(Joi.ref("desired_salary_min"))
      .when("desired_salary_min", { is: Joi.exist(), then: Joi.required(), otherwise: Joi.optional() })
  })
});

export const registerCompanySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email,
    password,
    industry: Joi.number()
      .integer()
      .valid(...Object.values(INDUSTRIES))
      .required(),
    company_size: Joi.number()
      .integer()
      .valid(...Object.values(COMPANY_SIZES))
      .required(),
    location_id: Joi.number().integer().positive().optional(),
    founded_year: Joi.number()
      .integer()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    website: Joi.string().uri().optional()
  })
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email,
    password,
    type: Joi.string().valid("user", "company", "admin").required()
  })
});

export const refreshSchema = Joi.object({
  body: Joi.object({
    refresh_token: Joi.string().required()
  })
});

