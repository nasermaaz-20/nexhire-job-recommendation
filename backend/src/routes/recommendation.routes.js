import { Router } from "express";
import * as recommendationController from "../controllers/recommendation.controller.js";
import { authMiddleware, isUser, isCompany } from "../middlewares/auth.middleware.js";

const router = Router();

// User recommendations (authenticated user only)
router.get(
  "/jobs/me",
  authMiddleware,
  isUser,
  recommendationController.getMyJobRecommendations
);

// Candidate recommendations for a job (company only)
router.get(
  "/candidates/:jobId",
  authMiddleware,
  isCompany,
  recommendationController.getJobCandidates
);

// Public/Admin: Get recommendations for any user
router.get("/jobs/user/:userId", recommendationController.getJobRecommendationsForUser);

// ML service health check
router.get("/ml/health", recommendationController.mlHealthCheck);

export default router;

