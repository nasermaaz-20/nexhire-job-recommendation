import { prisma } from "../config/database.js";

// ═══════════════════════════════════════
// دوال للتحقق من وجود IDs في قاعدة البيانات
// ═══════════════════════════════════════

export const existsInDB = {
  skillId: async (id) => {
    const skill = await prisma.skills.findUnique({
      where: { id: BigInt(id) }
    });
    if (!skill) {
      throw new Error(`Skill with id ${id} does not exist`);
    }
    return true;
  },

  locationId: async (id) => {
    const location = await prisma.locations.findUnique({
      where: { id: BigInt(id) }
    });
    if (!location) {
      throw new Error(`Location with id ${id} does not exist`);
    }
    return true;
  },

  fieldId: async (id) => {
    const field = await prisma.fields.findUnique({
      where: { id: BigInt(id) }
    });
    if (!field) {
      throw new Error(`Field with id ${id} does not exist`);
    }
    return true;
  },

  jobId: async (id, mustBeActive = true) => {
    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(id) }
    });
    if (!job) {
      throw new Error(`Job with id ${id} does not exist`);
    }
    if (mustBeActive && job.isActive === 0) {
      throw new Error(`Job with id ${id} is no longer active`);
    }
    return true;
  },

  userId: async (id, mustBeActive = true) => {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) }
    });
    if (!user) {
      throw new Error(`User with id ${id} does not exist`);
    }
    if (mustBeActive && user.isActive === 0) {
      throw new Error(`User with id ${id} is not active`);
    }
    return true;
  },

  skillIds: async (ids) => {
    const parsed = ids.map((id) => BigInt(id));
    const skills = await prisma.skills.findMany({
      where: { id: { in: parsed } },
      select: { id: true }
    });

    const foundIds = skills.map((s) => s.id.toString());
    const missingIds = ids.filter((id) => !foundIds.includes(id.toString()));

    if (missingIds.length > 0) {
      throw new Error(`Skills with ids [${missingIds.join(", ")}] do not exist`);
    }
    return true;
  },

  locationIds: async (ids) => {
    const parsed = ids.map((id) => BigInt(id));
    const locations = await prisma.locations.findMany({
      where: { id: { in: parsed } },
      select: { id: true }
    });

    const foundIds = locations.map((l) => l.id.toString());
    const missingIds = ids.filter((id) => !foundIds.includes(id.toString()));

    if (missingIds.length > 0) {
      throw new Error(`Locations with ids [${missingIds.join(", ")}] do not exist`);
    }
    return true;
  }
};

// ═══════════════════════════════════════
// قيم الـ Enums المسموحة (Strict Whitelist)
// ═══════════════════════════════════════

export const ALLOWED_VALUES = {
  career_level: [1, 2, 3, 4],
  job_level: [1, 2, 3, 4],
  employment_type: [1, 2, 3, 4],
  remote_option: [0, 1, 2],
  skill_level: [1, 2, 3, 4, 5],
  skill_importance: [1, 2, 3, 4, 5],
  location_priority: [1, 2, 3, 4, 5],
  interaction_type: [1, 2, 3],
  company_interaction_type: [1, 2, 3, 4],
  application_status: [1, 2, 3, 4, 5],
  company_size: [1, 2, 3, 4, 5],
  industry: [1, 2, 3, 4, 5, 6, 7]
};

