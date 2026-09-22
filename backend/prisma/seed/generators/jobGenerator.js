import { randomInt, randomChoice, randomChoices } from "../utils.js";

const titlesByField = {
  1: ["Data Scientist", "ML Engineer", "Data Analyst"],
  2: ["Backend Developer", "Backend Engineer", "API Developer"],
  3: ["Frontend Developer", "Frontend Engineer", "Web Developer"],
  4: ["DevOps Engineer", "Site Reliability Engineer"],
  5: ["Mobile Developer", "Android Developer", "iOS Developer"],
  6: ["Product Manager", "Product Owner"],
  7: ["UI/UX Designer", "Product Designer"],
  8: ["Security Engineer", "Cybersecurity Specialist"]
};

function levelPrefix(level) {
  if (level === 1) return "Junior";
  if (level === 2) return "";
  if (level === 3) return "Senior";
  if (level === 4) return "Lead";
  return "";
}

export function generateJobs(companies, fieldIds, locationIds) {
  const jobs = [];

  for (const company of companies) {
    const numJobs = randomInt(2, 4);
    for (let i = 0; i < numJobs; i++) {
      const fieldId = randomChoice(fieldIds);
      const level = randomInt(1, 4);
      const baseTitle = randomChoice(titlesByField[fieldId] || ["Software Engineer"]);
      const prefix = levelPrefix(level);
      const title = prefix ? `${prefix} ${baseTitle}` : baseTitle;

      let minExp, maxExp;
      if (level === 1) {
        minExp = 0;
        maxExp = randomInt(1, 3);
      } else if (level === 2) {
        minExp = randomInt(2, 3);
        maxExp = randomInt(3, 5);
      } else if (level === 3) {
        minExp = randomInt(4, 6);
        maxExp = randomInt(6, 9);
      } else {
        minExp = randomInt(7, 9);
        maxExp = randomInt(9, 12);
      }

      const baseSalary = 9000 + level * 4000 + ((minExp + maxExp) / 2) * 800;
      const salaryMin = Math.round(baseSalary * 0.9);
      const salaryMax = Math.round(baseSalary * 1.1);

      const employmentType = randomInt(1, 4);
      const remoteOption = randomInt(0, 2);
      const today = new Date();
      const daysToAdd = randomInt(30, 90);
      const expiresAt = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      jobs.push({
        companyId: company.id,
        title,
        fieldId,
        jobLevel: level,
        locationId: randomChoice(locationIds),
        minExperience: minExp,
        maxExperience: maxExp,
        salaryMin,
        salaryMax,
        employmentType,
        remoteOption,
        isActive: Math.random() < 0.9 ? 1 : 0,
        expiresAt
      });
    }
  }

  return jobs;
}

export function generateJobSkillsForJob(jobId, fieldId, jobLevel, fieldSkills, generalSkills) {
  const skills = [];
  const numFieldSkills = randomInt(3, 6);
  const numGeneralSkills = randomInt(1, 2);
  const selectedField = randomChoices(fieldSkills, numFieldSkills);
  const selectedGeneral = randomChoices(generalSkills, numGeneralSkills);
  const all = [...selectedField, ...selectedGeneral];

  all.forEach((skill, index) => {
    const importance = index < 2 ? 5 : randomInt(3, 5);
    const isRequired = index < 3 ? 1 : 0;
    skills.push({
      jobId,
      skillId: skill.id,
      importance,
      isRequired
    });
  });

  return skills;
}

