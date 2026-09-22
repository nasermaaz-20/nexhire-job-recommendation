import { prisma } from "../config/database.js";
import { INTERACTION_TYPES, COMPANY_INTERACTION_TYPES } from "../utils/enums.js";

export async function createUserInteraction(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const { job_id, interaction_type } = req.body;

    if (!Object.values(INTERACTION_TYPES).includes(interaction_type)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid interaction_type" }
      });
    }

    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(job_id) }
    });
    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Job not found" }
      });
    }

    // View (type 1): only create if it doesn't already exist
    if (interaction_type === INTERACTION_TYPES.VIEW) {
      const existing = await prisma.interactions.findFirst({
        where: { userId, jobId: job.id, interactionType: INTERACTION_TYPES.VIEW }
      });
      if (existing) {
        return res.status(200).json({
          success: true,
          data: existing,
          message: "View interaction already exists"
        });
      }
    }

    // Save (type 2): only create if it doesn't already exist
    if (interaction_type === INTERACTION_TYPES.SAVE) {
      const existing = await prisma.interactions.findFirst({
        where: { userId, jobId: job.id, interactionType: INTERACTION_TYPES.SAVE }
      });
      if (existing) {
        return res.status(200).json({
          success: true,
          data: existing,
          message: "Save interaction already exists"
        });
      }
    }

    const interaction = await prisma.interactions.create({
      data: {
        userId,
        jobId: job.id,
        interactionType: interaction_type
      }
    });

    return res.status(201).json({
      success: true,
      data: interaction,
      message: "Interaction created"
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserInteraction(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const jobId = BigInt(req.params.jobId);
    const interactionType = parseInt(req.params.type);

    if (!Object.values(INTERACTION_TYPES).includes(interactionType)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid interaction type" }
      });
    }

    await prisma.interactions.deleteMany({
      where: { userId, jobId, interactionType }
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: "Interaction deleted"
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyInteractions(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const interactions = await prisma.interactions.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: { company: true, location: true, field: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: interactions,
      message: "User interactions history"
    });
  } catch (err) {
    next(err);
  }
}

export async function createCompanyInteraction(req, res, next) {
  try {
    const companyId = BigInt(req.user.id);
    const { user_id, job_id, interaction_type } = req.body;

    if (!Object.values(COMPANY_INTERACTION_TYPES).includes(interaction_type)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid interaction_type" }
      });
    }

    const user = await prisma.users.findUnique({ where: { id: BigInt(user_id) } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" }
      });
    }

    let job = null;
    if (job_id) {
      job = await prisma.jobs.findUnique({ where: { id: BigInt(job_id) } });
      if (!job) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Job not found" }
        });
      }
    }

    const interaction = await prisma.companyCandidateInteractions.create({
      data: {
        companyId,
        userId: user.id,
        jobId: job ? job.id : null,
        interactionType: interaction_type
      }
    });

    return res.status(201).json({
      success: true,
      data: interaction,
      message: "Company-candidate interaction created"
    });
  } catch (err) {
    next(err);
  }
}

export async function getCompanyInteractionsHistory(req, res, next) {
  try {
    const companyId = BigInt(req.user.id);
    const interactions = await prisma.companyCandidateInteractions.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        job: true
      }
    });

    return res.status(200).json({
      success: true,
      data: interactions,
      message: "Company interactions history"
    });
  } catch (err) {
    next(err);
  }
}

