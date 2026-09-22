import Joi from "joi";
import { ALLOWED_VALUES, existsInDB } from "./common.validator.js";

export const userInteractionSchema = Joi.object({
  body: Joi.object({
    job_id: Joi.number().integer().positive().required(),
    interaction_type: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.interaction_type)
      .required()
  })
});

export const companyInteractionSchema = Joi.object({
  body: Joi.object({
    user_id: Joi.number().integer().positive().required(),
    job_id: Joi.number().integer().positive().optional(),
    interaction_type: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.company_interaction_type)
      .required()
  })
});

export const validateInteractionInDB = async (data, type) => {
  const errors = [];

  if (type === "user") {
    try {
      await existsInDB.jobId(data.job_id, false); // allow inactive jobs
    } catch (error) {
      errors.push({ field: "job_id", message: error.message });
    }
  }

  if (type === "company") {
    try {
      await existsInDB.userId(data.user_id, true);
    } catch (error) {
      errors.push({ field: "user_id", message: error.message });
    }

    if (data.job_id) {
      try {
        await existsInDB.jobId(data.job_id, false);
      } catch (error) {
        errors.push({ field: "job_id", message: error.message });
      }
    }
  }

  return errors;
};

