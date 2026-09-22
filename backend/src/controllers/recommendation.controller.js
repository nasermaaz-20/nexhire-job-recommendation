import mlApiService from "../services/mlApi.service.js";
import { prisma } from "../config/database.js";

/**
 * Get job recommendations for the authenticated user
 */
export const getMyJobRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, method = "hybrid" } = req.query;

    const recommendations = await mlApiService.getJobRecommendations(userId, {
      limit: parseInt(limit, 10),
      method,
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get candidate recommendations for a job (company only)
 */
export const getJobCandidates = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { limit = 20, method = "hybrid" } = req.query;

    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(jobId) },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Job not found" },
      });
    }

    if (job.companyId !== BigInt(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not own this job" },
      });
    }

    const recommendations = await mlApiService.getCandidateRecommendations(
      parseInt(jobId, 10),
      { limit: parseInt(limit, 10), method }
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get job recommendations for any user (public/admin)
 */
export const getJobRecommendationsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, method = "hybrid" } = req.query;

    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
    }

    const recommendations = await mlApiService.getJobRecommendations(
      parseInt(userId, 10),
      { limit: parseInt(limit, 10), method }
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Health check for ML service
 */
export const mlHealthCheck = async (req, res) => {
  try {
    const health = await mlApiService.healthCheck();

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: { code: "ML_UNAVAILABLE", message: "ML service unavailable" },
    });
  }
};

