import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { locationsData } from "./data/locations.js";
import { fieldsData } from "./data/fields.js";
import { skillsData, getSkillsByField } from "./data/skills.js";
import { generateCompanies } from "./generators/companyGenerator.js";
import {
  generateUsers,
  generateUserSkillsForUser,
  generateUserPreferencesForUser,
  generateUserPreferredLocationsForUser
} from "./generators/userGenerator.js";
import { generateJobs, generateJobSkillsForJob } from "./generators/jobGenerator.js";
import {
  generateInteractions,
  generateCompanyInteractions
} from "./generators/interactionGenerator.js";
import { randomInt } from "./utils.js";

dotenv.config();

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("Clearing existing data...");
  await prisma.companyCandidateInteractions.deleteMany();
  await prisma.applications.deleteMany();
  await prisma.interactions.deleteMany();
  await prisma.userPreferredLocations.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.userSkills.deleteMany();
  await prisma.jobSkills.deleteMany();
  await prisma.jobs.deleteMany();
  await prisma.users.deleteMany();
  await prisma.companies.deleteMany();
  await prisma.skills.deleteMany();
  await prisma.fields.deleteMany();
  await prisma.locations.deleteMany();
}

async function main() {
  try {
    const TARGET = {
      locations: 30,
      fields: 8,
      skills: 80,
      companies: 300,
      users: 2000
    };

    await clearDatabase();

    console.log("Seeding locations...");
    await prisma.locations.createMany({
      data: locationsData.slice(0, TARGET.locations)
    });
    const locations = await prisma.locations.findMany();
    const locationIds = locations.map((l) => l.id);

    console.log("Seeding fields...");
    await prisma.fields.createMany({ data: fieldsData });
    const fields = await prisma.fields.findMany();
    const fieldIds = fields.map((f) => f.id);

    console.log("Seeding skills...");
    // Map legacy numeric fieldId (1..8) to actual DB field ids (which may not start at 1)
    const fieldIdByLegacy = new Map();
    // fieldsData order corresponds to legacy ids 1..8
    fieldsData.forEach((fDef, index) => {
      const legacyId = index + 1;
      const fieldRow = fields.find((f) => f.name === fDef.name);
      if (fieldRow) {
        fieldIdByLegacy.set(legacyId, fieldRow.id);
      }
    });

    await prisma.skills.createMany({
      data: skillsData.map((s) => ({
        name: s.name,
        fieldId: s.fieldId ? fieldIdByLegacy.get(s.fieldId) ?? null : null
      }))
    });
    const skills = await prisma.skills.findMany();

    console.log("Seeding companies...");
    const companiesData = await generateCompanies(TARGET.companies, locationIds);
    await prisma.companies.createMany({ data: companiesData });
    const companies = await prisma.companies.findMany();

    console.log("Seeding users...");
    const usersData = await generateUsers(TARGET.users, locationIds, fieldIds);
    await prisma.users.createMany({ data: usersData });
    const users = await prisma.users.findMany();

    console.log("Seeding jobs...");
    const jobsData = generateJobs(companies, fieldIds, locationIds);
    await prisma.jobs.createMany({ data: jobsData });
    const jobs = await prisma.jobs.findMany();

    console.log("Seeding user skills, preferences, preferred locations...");
    const allUserSkills = [];
    const allUserPreferences = [];
    const allUserPreferredLocations = [];

    const skillsByFieldId = new Map();
    for (const f of fields) {
      const forField = skills.filter((s) => s.fieldId === f.id);
      const general = skills.filter((s) => s.fieldId === null);
      skillsByFieldId.set(f.id, { fieldSkills: forField, generalSkills: general });
    }

    for (const user of users) {
      const fieldId = user.fieldId;
      if (!fieldId) continue;

      const mapping = skillsByFieldId.get(fieldId);
      if (!mapping) continue;

      const userSkills = generateUserSkillsForUser(
        user.id,
        fieldId,
        user.yearsOfExperience,
        mapping.fieldSkills,
        mapping.generalSkills
      );
      allUserSkills.push(...userSkills);

      const prefs = generateUserPreferencesForUser(user.id, fieldId, user.careerLevel);
      allUserPreferences.push(prefs);

      const preferredLocs = generateUserPreferredLocationsForUser(
        user.id,
        user.currentLocationId,
        locationIds
      );
      allUserPreferredLocations.push(...preferredLocs);
    }

    await prisma.userSkills.createMany({ data: allUserSkills });
    await prisma.userPreferences.createMany({ data: allUserPreferences });
    await prisma.userPreferredLocations.createMany({ data: allUserPreferredLocations });

    console.log("Seeding job skills...");
    const allJobSkills = [];
    const generalSkills = skills.filter((s) => s.fieldId === null);

    for (const job of jobs) {
      const fieldId = job.fieldId;
      const fieldSkills = skills.filter((s) => s.fieldId === fieldId);
      const jobSkills = generateJobSkillsForJob(
        job.id,
        fieldId,
        job.jobLevel,
        fieldSkills,
        generalSkills
      );
      allJobSkills.push(...jobSkills);
    }

    await prisma.jobSkills.createMany({ data: allJobSkills });

    console.log("Building userSkillsMap and jobSkillsMap...");
    const userSkillsRows = await prisma.userSkills.findMany();
    const jobSkillsRows = await prisma.jobSkills.findMany();

    const userSkillsMap = new Map();
    for (const us of userSkillsRows) {
      const key = us.userId;
      if (!userSkillsMap.has(key)) userSkillsMap.set(key, []);
      userSkillsMap.get(key).push(us.skillId);
    }

    const jobSkillsMap = new Map();
    for (const js of jobSkillsRows) {
      const key = js.jobId;
      if (!jobSkillsMap.has(key)) jobSkillsMap.set(key, []);
      jobSkillsMap.get(key).push(js.skillId);
    }

    console.log("Seeding interactions and applications...");
    const { interactions, applications } = generateInteractions(
      users,
      jobs,
      userSkillsMap,
      jobSkillsMap
    );

    await prisma.interactions.createMany({ data: interactions });

    // Deduplicate applications by (userId, jobId)
    const appMap = new Map();
    for (const app of applications) {
      const key = `${app.userId}-${app.jobId}`;
      if (!appMap.has(key)) {
        appMap.set(key, app);
      }
    }
    const uniqueApplications = Array.from(appMap.values());

    // Assign statuses
    const appStatusMap = new Map();
    const appsWithStatus = uniqueApplications.map((app) => {
      const r = randomInt(1, 100);
      let status;
      if (r <= 40) status = 1; // pending
      else if (r <= 65) status = 2; // reviewed
      else if (r <= 80) status = 3; // shortlisted
      else if (r <= 95) status = 4; // rejected
      else status = 5; // accepted
      appStatusMap.set(`${app.userId}-${app.jobId}`, status);
      return { ...app, status };
    });

    await prisma.applications.createMany({ data: appsWithStatus });

    console.log("Seeding company-candidate interactions...");
    const companyInteractionsData = generateCompanyInteractions(
      companies,
      appsWithStatus,
      appStatusMap
    );
    await prisma.companyCandidateInteractions.createMany({ data: companyInteractionsData });

    console.log("Seed completed.");

    const usersCount = await prisma.users.count();
    const jobsCount = await prisma.jobs.count();
    const interactionsCount = await prisma.interactions.count();
    const applicationsCount = await prisma.applications.count();
    const companiesCount = await prisma.companies.count();

    const matrixSize = usersCount * jobsCount;
    const filled = interactionsCount;
    const filledPct = matrixSize ? (filled / matrixSize) * 100 : 0;
    const sparsity = 100 - filledPct;

    console.log("========== Seed Summary ==========");
    console.log(`Locations: ${await prisma.locations.count()}`);
    console.log(`Fields: ${await prisma.fields.count()}`);
    console.log(`Skills: ${await prisma.skills.count()}`);
    console.log(`Companies: ${companiesCount}`);
    console.log(`Users: ${usersCount}`);
    console.log(`Jobs: ${jobsCount}`);
    console.log(`User Skills: ${await prisma.userSkills.count()}`);
    console.log(`Job Skills: ${await prisma.jobSkills.count()}`);
    console.log(`Interactions: ${interactionsCount}`);
    console.log(`Applications: ${applicationsCount}`);
    console.log(
      `Company Candidate Interactions: ${await prisma.companyCandidateInteractions.count()}`
    );
    console.log("---------- Matrix Statistics ----------");
    console.log(`Matrix Size: ${usersCount} x ${jobsCount} = ${matrixSize}`);
    console.log(`Filled: ${filled} (${filledPct.toFixed(2)}%)`);
    console.log(`Sparsity: ${sparsity.toFixed(2)}%`);
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

