import { prisma } from "../config/database.js";
import { APPLICATION_STATUS, INTERACTION_TYPES } from "../utils/enums.js";

export async function applyForJob(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const { job_id } = req.body;

    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(job_id) },
      include: { company: true }
    });

    if (!job || job.isActive === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Job not found or inactive" }
      });
    }

    const existing = await prisma.applications.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId: job.id
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: "ALREADY_APPLIED", message: "User already applied to this job" }
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.applications.create({
        data: {
          userId,
          jobId: job.id,
          companyId: job.companyId,
          status: APPLICATION_STATUS.PENDING
        }
      });

      await tx.interactions.create({
        data: {
          userId,
          jobId: job.id,
          interactionType: INTERACTION_TYPES.APPLY
        }
      });

      return application;
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: "Application created"
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyApplications(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const applications = await prisma.applications.findMany({
      where: { userId },
      orderBy: { appliedAt: "desc" },
      include: {
        job: {
          include: {
            company: true,
            location: true,
            field: true
          }
        },
        company: true
      }
    });

    // Transform to flat structure
    const transformedApplications = applications.map(app => ({
      id: app.id.toString(),
      user_id: app.userId.toString(),
      job_id: app.jobId.toString(),
      company_id: app.companyId.toString(),
      status: app.status,
      applied_at: app.appliedAt,
      job: {
        id: app.job.id.toString(),
        title: app.job.title,
        company_name: app.job.company?.name || 'Unknown Company',
        field_name: app.job.field?.name,
        location_name: app.job.location ? `${app.job.location.city}, ${app.job.location.country}` : null,
        job_level: app.job.jobLevel,
        employment_type: app.job.employmentType,
        remote: app.job.remoteOption === 'yes',
        salary_min: app.job.salaryMin,
        salary_max: app.job.salaryMax,
        created_at: app.job.createdAt
      }
    }));

    return res.status(200).json({
      success: true,
      data: transformedApplications,
      message: "User applications"
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobApplications(req, res, next) {
  try {
    const companyId = BigInt(req.user.id);
    const jobId = BigInt(req.params.job_id);

    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      include: { skills: { include: { skill: true } } }
    });
    if (!job || job.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You can only view applications for your own jobs" }
      });
    }

    const applications = await prisma.applications.findMany({
      where: { jobId },
      orderBy: { appliedAt: "desc" },
      include: {
        user: {
          include: {
            field: true,
            currentLocation: true,
            skills: { include: { skill: true } },
            preferences: true,
            preferredLocations: { include: { location: true } }
          }
        }
      }
    });

    // ── Match Engine ──────────────────────────────────────────────────────────
    function calcMatch(user, job) {
      // Non-skill criteria (7 fixed criteria)
      const criteria = [];

      // 1. Field match
      criteria.push({
        key: "field",
        label: "Field Match",
        met: user.fieldId != null && user.fieldId === job.fieldId
      });

      // 2. Location match (job location in user preferred locations)
      const prefLocIds = user.preferredLocations?.map(pl => pl.locationId.toString()) || [];
      criteria.push({
        key: "location",
        label: "Location Match",
        met: job.locationId != null && prefLocIds.includes(job.locationId.toString())
      });

      // 3. Career level match
      criteria.push({
        key: "career_level",
        label: "Career Level",
        met: user.careerLevel >= job.jobLevel
      });

      // 4. Employment type match
      const prefEmpType = user.preferences?.preferredEmploymentType;
      criteria.push({
        key: "employment_type",
        label: "Employment Type",
        met: prefEmpType == null || prefEmpType === job.employmentType
      });

      // 5. Remote preference match
      const prefRemote = user.preferences?.remotePreference;
      criteria.push({
        key: "remote",
        label: "Remote Preference",
        met: prefRemote == null || prefRemote === job.remoteOption
      });

      // 6. Salary match
      criteria.push({
        key: "salary",
        label: "Salary Match",
        met: user.desiredSalaryMin == null || (job.salaryMin != null && job.salaryMin >= user.desiredSalaryMin)
      });

      // 7. Experience match
      criteria.push({
        key: "experience",
        label: "Experience",
        met: job.minExperience == null || user.yearsOfExperience >= job.minExperience
      });

      // 8. Skills — each skill is an INDIVIDUAL criterion
      // A skill is matched ONLY if user has it AND user.level >= job.importance
      const skillResults = job.skills.map(js => {
        const userSkill = user.skills.find(us => us.skillId === js.skillId);
        const met = userSkill != null && userSkill.level >= js.importance;
        return {
          skill_id: js.skillId.toString(),
          skill_name: js.skill?.name,
          importance: js.importance,
          user_level: userSkill?.level ?? 0,
          met
        };
      });

      // Each skill counts as its own criterion in the total
      const allCriteria = [
        ...criteria,
        ...skillResults.map(s => ({ key: `skill_${s.skill_id}`, label: s.skill_name, met: s.met }))
      ];

      const metCount = allCriteria.filter(c => c.met).length;
      const matchPercentage = allCriteria.length > 0
        ? Math.round((metCount / allCriteria.length) * 100)
        : 0;

      return { matchPercentage, criteria, skillResults };
    }
    // ─────────────────────────────────────────────────────────────────────────

    const transformedApplications = applications.map(app => {
      const { matchPercentage, criteria, skillResults } = calcMatch(app.user, job);

      return {
        id: app.id.toString(),
        user_id: app.userId.toString(),
        job_id: app.jobId.toString(),
        company_id: app.companyId.toString(),
        status: app.status,
        applied_at: app.appliedAt,
        match_percentage: matchPercentage,
        match_criteria: criteria,
        user: {
          id: app.user.id.toString(),
          name: app.user.name,
          email: app.user.email,
          field_id: app.user.fieldId?.toString(),
          field_name: app.user.field?.name,
          location_name: app.user.currentLocation
            ? `${app.user.currentLocation.city}, ${app.user.currentLocation.country}`
            : null,
          career_level: app.user.careerLevel,
          years_of_experience: app.user.yearsOfExperience,
          desired_salary_min: app.user.desiredSalaryMin,
          skills: skillResults,
          all_skills: app.user.skills?.map(us => ({
            id: us.skillId.toString(),
            skill_name: us.skill?.name,
            level: us.level
          })) || []
        }
      };
    });

    // Sort by match percentage descending
    transformedApplications.sort((a, b) => b.match_percentage - a.match_percentage);

    return res.status(200).json({
      success: true,
      data: transformedApplications,
      message: "Job applications"
    });
  } catch (err) {
    next(err);
  }
}

export async function withdrawApplication(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const jobId = BigInt(req.params.jobId);

    await prisma.$transaction(async (tx) => {
      await tx.applications.deleteMany({
        where: { userId, jobId }
      });
      await tx.interactions.deleteMany({
        where: { userId, jobId, interactionType: INTERACTION_TYPES.APPLY }
      });
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: "Application withdrawn"
    });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const companyId = BigInt(req.user.id);
    const id = BigInt(req.params.id);
    const { status } = req.body;

    if (!Object.values(APPLICATION_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid status" }
      });
    }

    const application = await prisma.applications.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application || application.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only update applications for your own jobs"
        }
      });
    }

    const updated = await prisma.applications.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Application status updated"
    });
  } catch (err) {
    next(err);
  }
}

