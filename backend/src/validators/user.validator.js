import Joi from "joi";
import { ALLOWED_VALUES, existsInDB } from "./common.validator.js";

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    years_of_experience: Joi.number().integer().min(0).optional(),
    career_level: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.career_level)
      .optional(),
    field_id: Joi.number().integer().positive().optional(),
    current_location_id: Joi.number().integer().positive().optional(),
    desired_salary_min: Joi.number().integer().min(0).optional(),
    desired_salary_max: Joi.number()
      .integer()
      .greater(Joi.ref("desired_salary_min"))
      .when("desired_salary_min", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.optional()
      })
  })
});

export const addSkillsSchema = Joi.object({
  body: Joi.object({
    skills: Joi.array()
      .items(
        Joi.object({
          skill_id: Joi.number().integer().positive().required(),
          level: Joi.number()
            .integer()
            .valid(...ALLOWED_VALUES.skill_level)
            .required()
            .messages({
              "any.only": `Skill level must be one of: ${ALLOWED_VALUES.skill_level.join(", ")}`
            })
        })
      )
      .min(1)
      .required()
  })
});

export const updatePreferencesSchema = Joi.object({
  body: Joi.object({
    preferred_field_id: Joi.number().integer().positive().optional(),
    preferred_job_level: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.career_level)
      .optional(),
    preferred_employment_type: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.employment_type)
      .optional(),
    remote_preference: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.remote_option)
      .optional(),
    min_salary: Joi.number().integer().min(0).optional()
  })
});

export const addPreferredLocationsSchema = Joi.object({
  body: Joi.object({
    locations: Joi.array()
      .items(
        Joi.object({
          location_id: Joi.number().integer().positive().required(),
          priority: Joi.number()
            .integer()
            .valid(...ALLOWED_VALUES.location_priority)
            .required()
        })
      )
      .min(1)
      .required()
  })
});

export const validateUserDataInDB = async (data) => {
  const errors = [];

  if (data.field_id) {
    try {
      await existsInDB.fieldId(data.field_id);
    } catch (error) {
      errors.push({ field: "field_id", message: error.message });
    }
  }

  if (data.current_location_id) {
    try {
      await existsInDB.locationId(data.current_location_id);
    } catch (error) {
      errors.push({ field: "current_location_id", message: error.message });
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

  if (data.locations && data.locations.length > 0) {
    const locationIds = data.locations.map((l) => l.location_id);
    try {
      await existsInDB.locationIds(locationIds);
    } catch (error) {
      errors.push({ field: "locations", message: error.message });
    }
  }

  if (data.preferred_field_id) {
    try {
      await existsInDB.fieldId(data.preferred_field_id);
    } catch (error) {
      errors.push({ field: "preferred_field_id", message: error.message });
    }
  }

  return errors;
};

