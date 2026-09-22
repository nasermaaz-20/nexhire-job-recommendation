import Joi from "joi";
import { ALLOWED_VALUES, existsInDB } from "./common.validator.js";

export const createJobSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(2).max(255).required(),
    field_id: Joi.number().integer().positive().required(),
    job_level: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.job_level)
      .required(),
    location_id: Joi.number().integer().positive().required(),
    min_experience: Joi.number().integer().min(0).required(),
    max_experience: Joi.number()
      .integer()
      .min(Joi.ref("min_experience"))
      .required(),
    salary_min: Joi.number().integer().min(0).required(),
    salary_max: Joi.number()
      .integer()
      .greater(Joi.ref("salary_min"))
      .required(),
    employment_type: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.employment_type)
      .required(),
    remote_option: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.remote_option)
      .required(),
    expires_at: Joi.date()
      .greater("now")
      .required()
  })
});

export const updateJobSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(2).max(255).optional(),
    field_id: Joi.number().integer().positive().optional(),
    job_level: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.job_level)
      .optional(),
    location_id: Joi.number().integer().positive().optional(),
    min_experience: Joi.number().integer().min(0).optional(),
    max_experience: Joi.number()
      .integer()
      .min(Joi.ref("min_experience"))
      .optional(),
    salary_min: Joi.number().integer().min(0).optional(),
    salary_max: Joi.number()
      .integer()
      .greater(Joi.ref("salary_min"))
      .optional(),
    employment_type: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.employment_type)
      .optional(),
    remote_option: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.remote_option)
      .optional(),
    is_active: Joi.number().integer().valid(0, 1).optional(),
    expires_at: Joi.date()
      .greater("now")
      .optional(),
    skills: Joi.array()
      .items(
        Joi.object({
          skill_id: Joi.number().integer().positive().required(),
          importance: Joi.number()
            .integer()
            .valid(...ALLOWED_VALUES.skill_importance)
            .required()
        })
      )
      .optional()
  })
});

export const addJobSkillsSchema = Joi.object({
  body: Joi.object({
    skills: Joi.array()
      .items(
        Joi.object({
          skill_id: Joi.number().integer().positive().required(),
          importance: Joi.number()
            .integer()
            .valid(...ALLOWED_VALUES.skill_importance)
            .required(),
          is_required: Joi.number().integer().valid(0, 1).required()
        })
      )
      .min(1)
      .required()
  })
});

export const validateJobDataInDB = async (data) => {
  const errors = [];

  if (data.field_id) {
    try {
      await existsInDB.fieldId(data.field_id);
    } catch (error) {
      errors.push({ field: "field_id", message: error.message });
    }
  }

  if (data.location_id) {
    try {
      await existsInDB.locationId(data.location_id);
    } catch (error) {
      errors.push({ field: "location_id", message: error.message });
    }
  }

  if (data.skills && data.skills.length > 0) {
    const skillIds = data.skills.map((s) => s.skill_id);
    try {
      await existsInDB.skillIds(skillIds);
    } catch (error) {
      errors.push({ field: "skills", message: error.message });
    }
  }

  return errors;
};

