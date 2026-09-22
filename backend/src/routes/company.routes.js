import { Router } from "express";
import { authMiddleware, isCompany } from "../middlewares/auth.middleware.js";
import {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyPublic
} from "../controllers/company.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { updateCompanySchema } from "../validators/company.validator.js";

const router = Router();

// Authenticated company routes MUST come before /:id wildcard
router.get("/profile/me", authMiddleware, isCompany, getCompanyProfile);
router.put("/profile", authMiddleware, isCompany, validate(updateCompanySchema), updateCompanyProfile);

// Public wildcard route last
router.get("/:id", getCompanyPublic);

export default router;

