import { Router } from "express";
import { authMiddleware, isUser, isCompany } from "../middlewares/auth.middleware.js";
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication
} from "../controllers/application.controller.js";
import { validate, validateInDB } from "../middlewares/validation.middleware.js";
import {
  applySchema,
  updateStatusSchema,
  validateApplicationInDB
} from "../validators/application.validator.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  isUser,
  validate(applySchema),
  validateInDB(validateApplicationInDB),
  applyForJob
);
router.get("/my-applications", authMiddleware, isUser, getMyApplications);
router.delete("/job/:jobId", authMiddleware, isUser, withdrawApplication);

router.get("/job/:job_id", authMiddleware, isCompany, getJobApplications);
router.put(
  "/:id/status",
  authMiddleware,
  isCompany,
  validate(updateStatusSchema),
  updateApplicationStatus
);

export default router;


