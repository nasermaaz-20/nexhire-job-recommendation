import {
  randomInt,
  randomChoice,
  randomChoices,
  randomFloat,
  getCareerLevel,
  hashPassword
} from "../utils.js";

const firstNames = ["Ahmed", "Mohamed", "Ali", "Omar", "Khalid", "Sara", "Fatima", "Noor", "Laila", "Mona"];
const lastNames = ["Hassan", "Ibrahim", "Mahmoud", "Yousef", "Abdullah", "Mostafa", "Saleh", "Nasser", "Hamed", "Khalifa"];

export async function generateUsers(count, locationIds, fieldIds) {
  const users = [];
  const passwordHash = await hashPassword("Password123");

  for (let i = 0; i < count; i++) {
    const first = randomChoice(firstNames);
    const last = randomChoice(lastNames);
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@example.com`;

    const years = randomInt(0, 15);
    const careerLevel = getCareerLevel(years);
    const fieldId = randomChoice(fieldIds);
    const currentLocationId = randomChoice(locationIds);

    const baseSalary = 8000 + years * 1000 + careerLevel * 2000;
    const desiredMin = Math.round(baseSalary * randomFloat(0.9, 1.0));
    const desiredMax = Math.round(baseSalary * randomFloat(1.1, 1.3));

    users.push({
      name,
      email,
      passwordHash,
      yearsOfExperience: years,
      careerLevel,
      fieldId,
      currentLocationId,
      desiredSalaryMin: desiredMin,
      desiredSalaryMax: desiredMax,
      isActive: Math.random() < 0.95 ? 1 : 0
    });
  }

  return users;
}

export function generateUserSkillsForUser(userId, fieldId, yearsOfExperience, fieldSkills, generalSkills) {
  const skills = [];
  const numFieldSkills = randomInt(3, 7);
  const numGeneralSkills = randomInt(1, 3);

  const selectedField = randomChoices(fieldSkills, numFieldSkills);
  const selectedGeneral = randomChoices(generalSkills, numGeneralSkills);
  const all = [...selectedField, ...selectedGeneral];

  for (const skill of all) {
    let level;
    if (yearsOfExperience <= 1) level = randomInt(1, 3);
    else if (yearsOfExperience <= 4) level = randomInt(2, 4);
    else if (yearsOfExperience <= 8) level = randomInt(3, 5);
    else level = randomInt(4, 5);

    skills.push({
      userId,
      skillId: skill.id,
      level
    });
  }

  return skills;
}

export function generateUserPreferencesForUser(userId, fieldId, careerLevel) {
  const sameField = Math.random() < 0.8;
  return {
    userId,
    preferredFieldId: sameField ? fieldId : null,
    preferredJobLevel: careerLevel,
    preferredEmploymentType: randomInt(1, 4),
    remotePreference: randomInt(0, 2),
    minSalary: null
  };
}

export function generateUserPreferredLocationsForUser(userId, currentLocationId, locationIds) {
  const allLocations = [...locationIds];
  const num = randomInt(1, 3);
  const chosen = new Set([currentLocationId]);
  while (chosen.size < num) {
    chosen.add(randomChoice(allLocations));
  }
  const result = [];
  let priority = 1;
  for (const locId of chosen) {
    result.push({
      userId,
      locationId: locId,
      priority
    });
    priority = Math.min(priority + 1, 5);
  }
  return result;
}

