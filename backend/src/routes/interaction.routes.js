import { Router } from "express";
import { authMiddleware, isUser, isCompany } from "../middlewares/auth.middleware.js";
import {
  createUserInteraction,
  deleteUserInteraction,
  getMyInteractions,
  createCompanyInteraction,
  getCompanyInteractionsHistory
} from "../controllers/interaction.controller.js";
import { validate, validateInDB } from "../middlewares/validation.middleware.js";
import {
  userInteractionSchema,
  companyInteractionSchema,
  validateInteractionInDB
} from "../validators/interaction.validator.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  isUser,
  validate(userInteractionSchema),
  validateInDB((data) => validateInteractionInDB(data, "user")),
  createUserInteraction
);
router.get("/my-history", authMiddleware, isUser, getMyInteractions);
router.delete("/job/:jobId/type/:type", authMiddleware, isUser, deleteUserInteraction);

router.post(
  "/company-interactions",
  authMiddleware,
  isCompany,
  validate(companyInteractionSchema),
  validateInDB((data) => validateInteractionInDB(data, "company")),
  createCompanyInteraction
);
router.get(
  "/company-interactions/history",
  authMiddleware,
  isCompany,
  getCompanyInteractionsHistory
);

export default router;



