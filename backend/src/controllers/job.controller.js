import { prisma } from "../config/database.js";
import { EMPLOYMENT_TYPES, REMOTE_OPTIONS } from "../utils/enums.js";
import mlApiService from "../services/mlApi.service.js";

// Helper to build job data payload for ML vector
async function buildJobVectorPayload(jobId) {
  const job = await prisma.jobs.findUnique({
    where: { id: jobId },
    include: { skills: true }
  });
  if (!job) return null;
  return {
    id: job.id.toString(),
    field_id: job.fieldId?.toString(),
    job_level: job.jobLevel,
    location_id: job.locationId?.toString(),
    min_experience: job.minExperience,
    max_experience: job.maxExperience,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    employment_type: job.employmentType,
    remote_option: job.remoteOption,
    skills: job.skills.map(s => ({
      skill_id: s.skillId.toString(),
      importance: s.importance,
      is_required: s.isRequired
    }))
  };
}

export async function createJob(req, res, next) {
  try {
    const companyId = BigInt(req.user.id);
    const {
      title,
      field_id,
      job_level,
      location_id,
      min_experience,
      max_experience,
      salary_min,
      salary_max,
      employment_type,
      remote_option,
      expires_at
    } = req.body;

    if (!Object.values(EMPLOYMENT_TYPES).includes(employment_type)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid employment_type" }
      });
    }
    if (!Object.values(REMOTE_OPTIONS).includes(remote_option)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid remote_option" }
      });
    }

    if (min_experience && max_experience && min_experience > max_experience) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "min_experience must be <= max_experience" }
      });
    }
    if (salary_min && salary_max && salary_min > salary_max) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "salary_min must be <= salary_max" }
      });
    }

    const job = await prisma.jobs.create({
      data: {
        companyId,
        title,
        fieldId: field_id,
        jobLevel: job_level,
        locationId: location_id || null,
        minExperience: min_experience || null,
        maxExperience: max_experience || null,
        salaryMin: salary_min || null,
        salaryMax: salary_max || null,
        employmentType: employment_type,
        remoteOption: remote_option,
        expiresAt: expires_at ? new Date(expires_at) : null
      }
    });

    const responseData = {
      success: true,
      data: job,
      message: "Job created"
    };

    // Build job vector in background (non-blocking)
    buildJobVectorPayload(job.id).then(payload => {
      if (payload) mlApiService.updateJobVector(job.id.toString(), payload).catch((e) => {
        console.error("Failed to build job vector:", e.message);
      });
    });

    return res.status(201).json(responseData);
  } catch (err) {
    next(err);
  }
}

export async function listJobs(req, res, next) {
  try {
    const { field_id, location_id, job_level, company_id } = req.query;

    const where = { isActive: 1 };
    if (field_id) where.fieldId = Number(field_id);
    if (location_id) where.locationId = Number(location_id);
    if (job_level) where.jobLevel = Number(job_level);
    if (company_id) where.companyId = BigInt(company_id);

    const jobs = await prisma.jobs.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        location: true,
        field: true
      }
    });

    // Transform to flat structure
    const transformedJobs = jobs.map(job => ({
      id: job.id.toString(),
      title: job.title,
      company_id: job.companyId.toString(),
      company_name: job.company?.name || 'Unknown Company',
      field_id: job.fieldId?.toString(),
      field_name: job.field?.name,
      location_id: job.locationId?.toString(),
      location_name: job.location ? `${job.location.city}, ${job.location.country}` : null,
      job_level: job.jobLevel,
      employment_type: job.employmentType,
      remote: job.remoteOption === 'yes',
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      experience_min: job.minExperience,
      experience_max: job.maxExperience,
      description: job.description,
      is_active: job.isActive === 1,
      created_at: job.createdAt,
      expires_at: job.expiresAt
    }));

    return res.status(200).json({
      success: true,
      data: transformedJobs,
      message: "Jobs list"
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobById(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const [job, views, applicants] = await Promise.all([
      prisma.jobs.findUnique({
        where: { id },
        include: {
          company: { include: { location: true } },
          location: true,
          field: true,
          skills: { include: { skill: true } }
        }
      }),
      prisma.interactions.count({ where: { jobId: id, interactionType: 1 } }),
      prisma.interactions.count({ where: { jobId: id, interactionType: 3 } }),
    ]);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Job not found" }
      });
    }

    // Transform to flat structure
    const transformedJob = {
      id: job.id.toString(),
      title: job.title,
      company_id: job.companyId.toString(),
      company_name: job.company?.name || 'Unknown Company',
      company: {
        id: job.company?.id.toString(),
        name: job.company?.name || 'Unknown Company',
        email: job.company?.email || null,
        founded_year: job.company?.foundedYear || null,
        location_name: job.company?.location
          ? `${job.company.location.city}, ${job.company.location.country}`
          : null,
      },
      field_id: job.fieldId?.toString(),
      field_name: job.field?.name,
      location_id: job.locationId?.toString(),
      location_name: job.location ? `${job.location.city}, ${job.location.country}` : null,
      job_level: job.jobLevel,
      employment_type: job.employmentType,
      remote_option: job.remoteOption,
      remote: job.remoteOption === 1,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      experience_min: job.minExperience,
      experience_max: job.maxExperience,
      description: job.description,
      is_active: job.isActive === 1,
      created_at: job.createdAt,
      expires_at: job.expiresAt,
      skills: job.skills?.map(js => ({
        id: js.skillId.toString(),
        name: js.skill?.name,
        importance: js.importance,
        is_required: js.isRequired === 1
      })) || [],
      stats: { views, applicants },
    };

    return res.status(200).json({
      success: true,
      data: transformedJob,
      message: "Job details"
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const companyId = BigInt(req.user.id);

    const job = await prisma.jobs.findUnique({ where: { id } });
    if (!job || job.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You can only update your own jobs" }
      });
    }

    const {
      title,
      field_id,
      job_level,
      location_id,
      min_experience,
      max_experience,
      salary_min,
      salary_max,
      employment_type,
      remote_option,
      is_active,
      expires_at,
      skills // optional: [{ skill_id, importance, is_required }]
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (field_id !== undefined) data.fieldId = field_id;
    if (job_level !== undefined) data.jobLevel = job_level;
    if (location_id !== undefined) data.locationId = location_id || null;
    if (min_experience !== undefined) data.minExperience = min_experience || null;
    if (max_experience !== undefined) data.maxExperience = max_experience || null;
    if (salary_min !== undefined) data.salaryMin = salary_min || null;
    if (salary_max !== undefined) data.salaryMax = salary_max || null;
    if (employment_type !== undefined) data.employmentType = employment_type;
    if (remote_option !== undefined) data.remoteOption = remote_option;
    if (is_active !== undefined) data.isActive = is_active;
    if (expires_at !== undefined) data.expiresAt = expires_at ? new Date(expires_at) : null;

    const updated = await prisma.jobs.update({ where: { id }, data });

    // Sync skills if provided: diff against DB, delete removed, create new, update changed
    if (Array.isArray(skills)) {
      const incomingSkillIds = skills.map(s => BigInt(s.skill_id));

      await prisma.$transaction(async (tx) => {
        // 1. Delete skills that are in DB but NOT in the new list
        await tx.jobSkills.deleteMany({
          where: {
            jobId: id,
            skillId: { notIn: incomingSkillIds.length > 0 ? incomingSkillIds : [BigInt(0)] }
          }
        });

        // 2. For each incoming skill: create if new, update importance if existing
        for (const s of skills) {
          const skillId = BigInt(s.skill_id);
          await tx.jobSkills.upsert({
            where: { jobId_skillId: { jobId: id, skillId } },
            create: {
              jobId: id,
              skillId,
              importance: s.importance,
              isRequired: s.importance >= 4 ? 1 : 0
            },
            update: {
              importance: s.importance,
              isRequired: s.importance >= 4 ? 1 : 0
            }
          });
        }
      });
    }

    const responseData = {
      success: true,
      data: updated,
      message: "Job updated"
    };

    // Rebuild job vector in background (non-blocking)
    buildJobVectorPayload(id).then(payload => {
      if (payload) mlApiService.updateJobVector(id.toString(), payload).catch((e) => {
        console.error("Failed to rebuild job vector:", e.message);
      });
    });

    return res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const companyId = BigInt(req.user.id);

    const job = await prisma.jobs.findUnique({ where: { id } });
    if (!job || job.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You can only delete your own jobs" }
      });
    }

    // Delete related records first to avoid FK constraint violations
    await prisma.$transaction([
      prisma.jobSkills.deleteMany({ where: { jobId: id } }),
      prisma.interactions.deleteMany({ where: { jobId: id } }),
      prisma.companyCandidateInteractions.deleteMany({ where: { jobId: id } }),
      prisma.applications.deleteMany({ where: { jobId: id } }),
      prisma.jobs.delete({ where: { id } }),
    ]);

    return res.status(200).json({
      success: true,
      data: null,
      message: "Job deleted"
    });
  } catch (err) {
    next(err);
  }
}

export async function addJobSkills(req, res, next) {
  try {
    const jobId = BigInt(req.params.id);
    const companyId = BigInt(req.user.id);

    const job = await prisma.jobs.findUnique({ where: { id: jobId } });
    if (!job || job.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You can only update your own jobs" }
      });
    }

    const { skills } = req.body; // [{ skill_id, importance, is_required }]
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "skills must be a non-empty array" }
      });
    }

    const tx = skills.map((s) =>
      prisma.jobSkills.upsert({
        where: {
          jobId_skillId: {
            jobId,
            skillId: s.skill_id
          }
        },
        create: {
          jobId,
          skillId: s.skill_id,
          importance: s.importance,
          isRequired: s.is_required
        },
        update: {
          importance: s.importance,
          isRequired: s.is_required
        }
      })
    );

    const result = await prisma.$transaction(tx);

    return res.status(201).json({
      success: true,
      data: result,
      message: "Job skills upserted"
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyJobs(req, res, next) {
  try {
    const companyId = BigInt(req.user.id);
    const jobs = await prisma.jobs.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        location: true,
        field: true,
        skills: { include: { skill: true } }
      }
    });

    // Fetch interaction counts for all jobs in parallel
    const jobIds = jobs.map(j => j.id);
    const [viewCounts, applyCounts] = await Promise.all([
      prisma.interactions.groupBy({
        by: ["jobId"],
        where: { jobId: { in: jobIds }, interactionType: 1 },
        _count: { id: true }
      }),
      prisma.interactions.groupBy({
        by: ["jobId"],
        where: { jobId: { in: jobIds }, interactionType: 3 },
        _count: { id: true }
      })
    ]);

    const viewMap = Object.fromEntries(viewCounts.map(r => [r.jobId.toString(), r._count.id]));
    const applyMap = Object.fromEntries(applyCounts.map(r => [r.jobId.toString(), r._count.id]));

    const transformedJobs = jobs.map(job => ({
      id: job.id.toString(),
      title: job.title,
      company_id: job.companyId.toString(),
      field_id: job.fieldId?.toString(),
      field_name: job.field?.name,
      location_id: job.locationId?.toString(),
      location_name: job.location ? `${job.location.city}, ${job.location.country}` : null,
      job_level: job.jobLevel,
      employment_type: job.employmentType,
      remote_option: job.remoteOption,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      experience_min: job.minExperience,
      experience_max: job.maxExperience,
      is_active: job.isActive === 1,
      created_at: job.createdAt,
      expires_at: job.expiresAt,
      views: viewMap[job.id.toString()] || 0,
      applications: applyMap[job.id.toString()] || 0,
      skills: job.skills?.map(js => ({
        id: js.skillId.toString(),
        name: js.skill?.name,
        importance: js.importance
      })) || []
    }));

    return res.status(200).json({
      success: true,
      data: transformedJobs,
      message: "Company jobs"
    });
  } catch (err) {
    next(err);
  }
}

