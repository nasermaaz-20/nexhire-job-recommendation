import { randomInt, randomChoice, hashPassword } from "../utils.js";

const namePrefixes = ["Tech", "Digital", "Cloud", "Data", "Smart", "Next", "Prime", "Nova"];
const nameSuffixes = ["Solutions", "Systems", "Labs", "Corp", "Works", "Studio", "Group", "Hub"];

export async function generateCompanies(count, locationIds) {
  const companies = [];
  const passwordHash = await hashPassword("Password123");

  for (let i = 0; i < count; i++) {
    const prefix = randomChoice(namePrefixes);
    const suffix = randomChoice(nameSuffixes);
    const baseName = `${prefix} ${suffix}`;
    const name = `${baseName} ${i + 1}`;
    const emailName = baseName.toLowerCase().replace(/\s+/g, "");

    companies.push({
      name,
      email: `hr@${emailName}${i + 1}.com`,
      passwordHash,
      industry: randomInt(1, 7),
      companySize: randomInt(1, 5),
      locationId: randomChoice(locationIds),
      foundedYear: randomInt(2005, 2023),
      website: `https://www.${emailName}${i + 1}.com`,
      isVerified: Math.random() < 0.8 ? 1 : 0,
      isActive: 1
    });
  }

  return companies;
}

