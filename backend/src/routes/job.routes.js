import { Router } from "express";
import { authMiddleware, isCompany } from "../middlewares/auth.middleware.js";
import {
  createJob,
  listJobs,
  getJobById,
  updateJob,
  deleteJob,
  addJobSkills,
  getMyJobs
} from "../controllers/job.controller.js";
import { validate, validateInDB } from "../middlewares/validation.middleware.js";
import {
  createJobSchema,
  updateJobSchema,
  addJobSkillsSchema,
  validateJobDataInDB
} from "../validators/job.validator.js";

const router = Router();

router.get("/", listJobs);

// Specific named routes MUST come before /:id wildcard
router.get("/my-jobs/list", authMiddleware, isCompany, getMyJobs);

router.get("/:id", getJobById);

router.use(authMiddleware, isCompany);

router.post(
  "/",
  validate(createJobSchema),
  validateInDB(validateJobDataInDB),
  createJob
);
router.put("/:id", validate(updateJobSchema), updateJob);
router.delete("/:id", deleteJob);
router.post(
  "/:id/skills",
  validate(addJobSkillsSchema),
  validateInDB(validateJobDataInDB),
  addJobSkills
);

export default router;



