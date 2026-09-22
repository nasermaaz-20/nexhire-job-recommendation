import bcrypt from "bcrypt";

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

export function randomChoices(array, count) {
  const copy = [...array];
  const result = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = randomInt(0, copy.length - 1);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export function weightedRandom(weights) {
  const sum = weights.reduce((acc, w) => acc + w.weight, 0);
  const r = Math.random() * sum;
  let cum = 0;
  for (const w of weights) {
    cum += w.weight;
    if (r <= cum) return w.value;
  }
  return weights[weights.length - 1].value;
}

export function getCareerLevel(yearsOfExperience) {
  if (yearsOfExperience <= 2) return 1; // Junior
  if (yearsOfExperience <= 5) return 2; // Mid
  if (yearsOfExperience <= 9) return 3; // Senior
  return 4; // Lead
}

export function calculateMatchScore(user, job, userSkillIds, jobSkillIds) {
  // مجال الوظيفة
  const fieldMatch = user.fieldId && job.fieldId && user.fieldId === job.fieldId ? 1 : 0;

  // المهارات
  const userSet = new Set(userSkillIds);
  const jobSet = new Set(jobSkillIds);
  let overlap = 0;
  for (const id of jobSet) {
    if (userSet.has(id)) overlap++;
  }
  const skillsMatch = jobSet.size > 0 ? overlap / jobSet.size : 0;

  // الموقع
  const locationMatch =
    user.currentLocationId && job.locationId && user.currentLocationId === job.locationId ? 1 : 0;

  // الخبرة
  let expMatch = 0;
  if (job.minExperience != null && job.maxExperience != null) {
    const yrs = user.yearsOfExperience || 0;
    if (yrs >= job.minExperience && yrs <= job.maxExperience) {
      expMatch = 1;
    } else {
      const range = job.maxExperience - job.minExperience || 1;
      const dist =
        yrs < job.minExperience
          ? job.minExperience - yrs
          : yrs > job.maxExperience
          ? yrs - job.maxExperience
          : 0;
      expMatch = Math.max(0, 1 - dist / (range * 2));
    }
  }

  return (
    0.4 * fieldMatch +
    0.3 * skillsMatch +
    0.15 * locationMatch +
    0.15 * expMatch
  );
}

export async function hashPassword(password) {
  const SALT_ROUNDS = 10;
  return bcrypt.hash(password, SALT_ROUNDS);
}

