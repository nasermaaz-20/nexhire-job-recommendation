import Joi from "joi";
import { prisma } from "../config/database.js";
import { ALLOWED_VALUES, existsInDB } from "./common.validator.js";

export const applySchema = Joi.object({
  body: Joi.object({
    job_id: Joi.number().integer().positive().required()
  })
});

export const updateStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.number()
      .integer()
      .valid(...ALLOWED_VALUES.application_status)
      .required()
      .messages({
        "any.only": `Status must be: ${ALLOWED_VALUES.application_status.join(", ")}`
      })
  })
});

export const validateApplicationInDB = async (data, user) => {
  const errors = [];

  try {
    await existsInDB.jobId(data.job_id, true);
  } catch (error) {
    errors.push({ field: "job_id", message: error.message });
    return errors;
  }

  // تحقق من عدم وجود طلب سابق لنفس الوظيفة من نفس المستخدم
  const existingApplication = await prisma.applications.findFirst({
    where: {
      userId: BigInt(user.id),
      jobId: BigInt(data.job_id)
    }
  });

  if (existingApplication) {
    errors.push({
      field: "job_id",
      message: "You have already applied for this job"
    });
  }

  return errors;
};

