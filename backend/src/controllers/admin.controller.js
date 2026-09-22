import { prisma } from "../config/database.js";

const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit };
};

export async function getUsers(req, res, next) {
  try {
    const { skip, take } = paginate(req.query);
    const { search, role, status } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role && role !== "all") where.role = role;
    if (status === "active") where.isActive = 1;
    if (status === "inactive") where.isActive = 0;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          field: { select: { name: true } },
          _count: { select: { skills: true } },
        },
      }),
      prisma.users.count({ where }),
    ]);

    const data = users.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      is_active: u.isActive === 1,
      created_at: u.createdAt,
      field_name: u.field?.name || null,
      skills_count: u._count.skills,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: { total, page: parseInt(req.query.page) || 1, limit: take },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        field: { select: { name: true } },
        skills: { include: { skill: { select: { name: true } } } },
        _count: { select: { applications: true, interactions: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.isActive === 1,
        created_at: user.createdAt,
        field_name: user.field?.name || null,
        skills: user.skills.map((s) => ({ name: s.skill.name, proficiency_level: s.level })),
        applications_count: user._count.applications,
        saved_jobs_count: user._count.interactions,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const { status } = req.body;
    const isActive = status === "active" ? 1 : 0;
    await prisma.users.update({ where: { id }, data: { isActive } });
    return res.status(200).json({ success: true, message: "User status updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    await prisma.users.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getCompanies(req, res, next) {
  try {
    const { skip, take } = paginate(req.query);
    const { search, status } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status === "active") where.isActive = 1;
    if (status === "inactive") where.isActive = 0;

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          industry: true,
          companySize: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { jobs: true, applications: true } },
        },
      }),
      prisma.companies.count({ where }),
    ]);

    const data = companies.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      email: c.email,
      industry: c.industry,
      company_size: c.companySize,
      is_active: c.isActive === 1,
      is_verified: c.isVerified,
      created_at: c.createdAt,
      jobs_count: c._count.jobs,
      total_applicants: c._count.applications,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: { total, page: parseInt(req.query.page) || 1, limit: take },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyStatus(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const { status } = req.body;
    const isActive = status === "active" ? 1 : 0;
    await prisma.companies.update({ where: { id }, data: { isActive } });
    return res.status(200).json({ success: true, message: "Company status updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteCompany(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    await prisma.companies.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Company deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getJobs(req, res, next) {
  try {
    const { skip, take } = paginate(req.query);
    const { search, status } = req.query;

    const where = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (status === "active") where.isActive = 1;
    if (status === "inactive") where.isActive = 0;

    const [jobs, total] = await Promise.all([
      prisma.jobs.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { name: true } },
          field: { select: { name: true } },
          location: { select: { city: true, country: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.jobs.count({ where }),
    ]);

    const data = jobs.map((j) => ({
      id: j.id.toString(),
      title: j.title,
      company_id: j.companyId.toString(),
      company_name: j.company?.name || null,
      field_name: j.field?.name || null,
      location_name: j.location ? `${j.location.city}, ${j.location.country}` : null,
      job_level: j.jobLevel,
      employment_type: j.employmentType,
      remote_option: j.remoteOption,
      is_active: j.isActive === 1,
      created_at: j.createdAt,
      expires_at: j.expiresAt,
      applications_count: j._count.applications,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: { total, page: parseInt(req.query.page) || 1, limit: take },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 30;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    // Run all real DB queries in parallel
    const [
      applicationsByStatusRaw,
      jobsByFieldRaw,
      topSkillsRaw,
      conversionViews,
      conversionApplications,
      conversionAccepted,
      conversionRejected,
      topCompanies,
    ] = await Promise.all([
      // Applications grouped by status
      prisma.applications.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { appliedAt: { gte: dateLimit } },
      }),
      // Jobs grouped by field
      prisma.jobs.groupBy({
        by: ["fieldId"],
        _count: { id: true },
        where: { createdAt: { gte: dateLimit } },
      }),
      // Top skills by job demand
      prisma.jobSkills.groupBy({
        by: ["skillId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),
      // Conversion funnel counts
      prisma.interactions.count({ where: { interactionType: 1 } }), // job views
      prisma.applications.count(),
      prisma.applications.count({ where: { status: 5 } }), // accepted
      prisma.applications.count({ where: { status: 4 } }), // rejected
      // Top companies by job count
      prisma.companies.findMany({
        take: 5,
        orderBy: { jobs: { _count: "desc" } },
        select: {
          name: true,
          _count: { select: { jobs: true, applications: true } },
        },
      }),
    ]);

    // Resolve field names for jobsByField
    const fieldIds = jobsByFieldRaw.map((j) => j.fieldId).filter(Boolean);
    const fields = await prisma.fields.findMany({
      where: { id: { in: fieldIds } },
      select: { id: true, name: true },
    });
    const fieldMap = Object.fromEntries(fields.map((f) => [f.id.toString(), f.name]));

    // Resolve skill names for topSkills
    const skillIds = topSkillsRaw.map((s) => s.skillId).filter(Boolean);
    const skills = await prisma.skills.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, name: true },
    });
    const skillMap = Object.fromEntries(skills.map((s) => [s.id.toString(), s.name]));

    // Status label map — 2 and 3 both map to "Reviewed" (merged)
    const statusLabels = { 1: "Unreviewed", 2: "Reviewed", 3: "Reviewed", 4: "Rejected", 5: "Accepted" };

    // Build userGrowth — weekly buckets over the period
    const weekCount = Math.max(1, Math.ceil(days / 7));
    const userGrowth = [];
    for (let i = weekCount - 1; i >= 0; i--) {
      const bucketEnd = new Date();
      bucketEnd.setDate(bucketEnd.getDate() - i * 7);
      const bucketStart = new Date(bucketEnd);
      bucketStart.setDate(bucketStart.getDate() - 7);
      const [u, c] = await Promise.all([
        prisma.users.count({ where: { createdAt: { gte: bucketStart, lt: bucketEnd } } }),
        prisma.companies.count({ where: { createdAt: { gte: bucketStart, lt: bucketEnd } } }),
      ]);
      userGrowth.push({
        date: bucketEnd.toISOString().slice(0, 10),
        users: u,
        companies: c,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        userGrowth,

        applicationsByStatus: (() => {
          // Merge status 2 and 3 both into "Reviewed"
          const merged = {};
          for (const a of applicationsByStatusRaw) {
            const label = statusLabels[a.status];
            if (!label) continue;
            merged[label] = (merged[label] || 0) + a._count.id;
          }
          return Object.entries(merged).map(([name, value]) => ({ name, value }));
        })(),

        jobsByField: jobsByFieldRaw.map((j) => ({
          field: fieldMap[j.fieldId?.toString()] || "Unknown",
          count: j._count.id,
        })),

        topSkills: topSkillsRaw.map((s) => ({
          skill: skillMap[s.skillId?.toString()] || "Unknown",
          demand: s._count.id,
        })),

        // Match score distribution — static buckets (no ML scores in DB)
        matchScoreDistribution: [
          { range: "0-20%", count: 0 },
          { range: "20-40%", count: 0 },
          { range: "40-60%", count: 0 },
          { range: "60-80%", count: 0 },
          { range: "80-100%", count: 0 },
        ],

        // Daily activity — interactions as proxy for logins/searches
        dailyActivity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
          date: day,
          logins: 0,
          applications: 0,
          searches: 0,
        })),

        companyEngagement: topCompanies.map((c) => ({
          company: c.name,
          jobs: c._count.jobs,
          views: 0,
          applications: c._count.applications,
        })),

        conversionFunnel: [
          { stage: "Job Views", count: conversionViews },
          { stage: "Applications", count: conversionApplications },
          { stage: "Accepted", count: conversionAccepted },
          { stage: "Rejected", count: conversionRejected },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const [totalUsers, totalCompanies, totalJobs, totalApplications, activeJobs] =
      await Promise.all([
        prisma.users.count(),
        prisma.companies.count(),
        prisma.jobs.count(),
        prisma.applications.count(),
        prisma.jobs.count({ where: { isActive: 1 } }),
      ]);

    // New users registered in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await prisma.users.count({
      where: { createdAt: { gte: oneWeekAgo } },
    });

    return res.status(200).json({
      success: true,
      data: {
        total_users: totalUsers,
        total_companies: totalCompanies,
        total_jobs: totalJobs,
        total_applications: totalApplications,
        new_users_this_week: newUsersThisWeek,
        active_jobs: activeJobs,
      },
      message: "Admin stats",
    });
  } catch (err) {
    next(err);
  }
}

// ── Locations CRUD ────────────────────────────────────────────────────────────
export async function getLocations(req, res, next) {
  try {
    const locations = await prisma.locations.findMany({ orderBy: { id: "asc" } });
    return res.status(200).json({
      success: true,
      data: locations.map(l => ({ id: l.id.toString(), country: l.country, city: l.city })),
    });
  } catch (err) { next(err); }
}

export async function createLocation(req, res, next) {
  try {
    const { country, city } = req.body;
    if (!country || !city) return res.status(400).json({ success: false, error: { message: "country and city are required" } });
    const loc = await prisma.locations.create({ data: { country, city } });
    return res.status(201).json({ success: true, data: { id: loc.id.toString(), country: loc.country, city: loc.city } });
  } catch (err) { next(err); }
}

export async function updateLocation(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const { country, city } = req.body;
    const data = {};
    if (country !== undefined) data.country = country;
    if (city !== undefined) data.city = city;
    const loc = await prisma.locations.update({ where: { id }, data });
    return res.status(200).json({ success: true, data: { id: loc.id.toString(), country: loc.country, city: loc.city } });
  } catch (err) { next(err); }
}

export async function deleteLocation(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    await prisma.locations.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Location deleted" });
  } catch (err) { next(err); }
}

// ── Skills CRUD ───────────────────────────────────────────────────────────────
export async function getAdminSkills(req, res, next) {
  try {
    const skills = await prisma.skills.findMany({
      orderBy: { id: "asc" },
      include: { field: { select: { name: true } } },
    });
    return res.status(200).json({
      success: true,
      data: skills.map(s => ({
        id: s.id.toString(),
        name: s.name,
        field_id: s.fieldId?.toString() || null,
        field_name: s.field?.name || null,
      })),
    });
  } catch (err) { next(err); }
}

export async function createSkill(req, res, next) {
  try {
    const { name, field_id } = req.body;
    if (!name) return res.status(400).json({ success: false, error: { message: "name is required" } });
    const skill = await prisma.skills.create({
      data: { name, fieldId: field_id ? BigInt(field_id) : null },
      include: { field: { select: { name: true } } },
    });
    return res.status(201).json({
      success: true,
      data: { id: skill.id.toString(), name: skill.name, field_id: skill.fieldId?.toString() || null, field_name: skill.field?.name || null },
    });
  } catch (err) { next(err); }
}

export async function updateSkill(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const { name, field_id } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (field_id !== undefined) data.fieldId = field_id ? BigInt(field_id) : null;
    const skill = await prisma.skills.update({ where: { id }, data, include: { field: { select: { name: true } } } });
    return res.status(200).json({
      success: true,
      data: { id: skill.id.toString(), name: skill.name, field_id: skill.fieldId?.toString() || null, field_name: skill.field?.name || null },
    });
  } catch (err) { next(err); }
}

export async function deleteSkill(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    await prisma.skills.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Skill deleted" });
  } catch (err) { next(err); }
}

// ── Fields CRUD ───────────────────────────────────────────────────────────────
export async function getAdminFields(req, res, next) {
  try {
    const fields = await prisma.fields.findMany({ orderBy: { id: "asc" } });
    return res.status(200).json({
      success: true,
      data: fields.map(f => ({ id: f.id.toString(), name: f.name })),
    });
  } catch (err) { next(err); }
}

export async function createField(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: { message: "name is required" } });
    const field = await prisma.fields.create({ data: { name } });
    return res.status(201).json({ success: true, data: { id: field.id.toString(), name: field.name } });
  } catch (err) { next(err); }
}

export async function updateField(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const { name } = req.body;
    const field = await prisma.fields.update({ where: { id }, data: { name } });
    return res.status(200).json({ success: true, data: { id: field.id.toString(), name: field.name } });
  } catch (err) { next(err); }
}

export async function deleteField(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    await prisma.fields.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Field deleted" });
  } catch (err) { next(err); }
}

// ── Company Verification ──────────────────────────────────────────────────────
export async function updateCompanyVerification(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const { is_verified } = req.body;
    if (is_verified !== 0 && is_verified !== 1) {
      return res.status(400).json({ success: false, error: { message: "is_verified must be 0 or 1" } });
    }
    await prisma.companies.update({ where: { id }, data: { isVerified: is_verified } });
    return res.status(200).json({ success: true, message: "Company verification updated" });
  } catch (err) { next(err); }
}

// ── Admin Job by ID ───────────────────────────────────────────────────────────
export async function getAdminJobById(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const job = await prisma.jobs.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        field: { select: { name: true } },
        location: { select: { city: true, country: true } },
        skills: { include: { skill: { select: { name: true } } } },
      },
    });
    if (!job) return res.status(404).json({ success: false, error: { message: "Job not found" } });
    return res.status(200).json({
      success: true,
      data: {
        id: job.id.toString(),
        title: job.title,
        company_id: job.companyId.toString(),
        company_name: job.company?.name || null,
        field_name: job.field?.name || null,
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
        skills: job.skills.map(s => ({ name: s.skill?.name, importance: s.importance })),
      },
    });
  } catch (err) { next(err); }
}

// ── Admin Delete Job (with FK cleanup) ───────────────────────────────────────
export async function deleteAdminJob(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    await prisma.$transaction([
      prisma.jobSkills.deleteMany({ where: { jobId: id } }),
      prisma.interactions.deleteMany({ where: { jobId: id } }),
      prisma.companyCandidateInteractions.deleteMany({ where: { jobId: id } }),
      prisma.applications.deleteMany({ where: { jobId: id } }),
      prisma.jobs.delete({ where: { id } }),
    ]);
    return res.status(200).json({ success: true, message: "Job deleted" });
  } catch (err) { next(err); }
}
