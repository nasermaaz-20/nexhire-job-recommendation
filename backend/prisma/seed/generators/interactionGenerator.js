import { randomInt, weightedRandom, calculateMatchScore } from "../utils.js";

export function generateInteractions(users, jobs, userSkillsMap, jobSkillsMap) {
  const interactions = [];
  const applications = [];

  for (const user of users) {
    const userId = user.id;
    const userSkillIds = userSkillsMap.get(userId) || [];

    // احسب درجات المطابقة لكل وظيفة
    const scoredJobs = jobs.map((job) => {
      const jobSkillIds = jobSkillsMap.get(job.id) || [];
      const score = calculateMatchScore(user, job, userSkillIds, jobSkillIds);
      return { job, score };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    const interactionsCount = randomInt(10, 25);
    const pickedJobs = scoredJobs.slice(0, interactionsCount);

    for (const { job, score } of pickedJobs) {
      const jobId = job.id;

      // View دائمًا أولاً
      interactions.push({
        userId,
        jobId,
        interactionType: 1
      });

      // حدد نوع التفاعل الإضافي بناءً على score
      let dist;
      if (score > 0.7) {
        dist = [
          { value: 3, weight: 0.5 }, // Apply
          { value: 2, weight: 0.3 }, // Save
          { value: 1, weight: 0.2 } // View فقط
        ];
      } else if (score >= 0.4) {
        dist = [
          { value: 3, weight: 0.1 },
          { value: 2, weight: 0.4 },
          { value: 1, weight: 0.5 }
        ];
      } else {
        dist = [
          { value: 3, weight: 0.05 },
          { value: 2, weight: 0.15 },
          { value: 1, weight: 0.8 }
        ];
      }

      const extraType = weightedRandom(dist);
      if (extraType === 2) {
        interactions.push({
          userId,
          jobId,
          interactionType: 2
        });
      } else if (extraType === 3) {
        interactions.push({
          userId,
          jobId,
          interactionType: 2
        });
        interactions.push({
          userId,
          jobId,
          interactionType: 3
        });
        applications.push({
          userId,
          jobId,
          companyId: job.companyId
        });
      }
    }
  }

  return { interactions, applications };
}

export function generateCompanyInteractions(companies, applications, applicationStatusMap) {
  const companyInteractions = [];

  for (const app of applications) {
    const companyId = app.companyId;
    const userId = app.userId;
    const jobId = app.jobId;
    const status = applicationStatusMap.get(`${userId}-${jobId}`) || 1;

    // View دائمًا
    companyInteractions.push({
      companyId,
      userId,
      jobId,
      interactionType: 1
    });

    if (status >= 3) {
      companyInteractions.push({
        companyId,
        userId,
        jobId,
        interactionType: 2 // Shortlist
      });
    }

    if (status === 5) {
      companyInteractions.push({
        companyId,
        userId,
        jobId,
        interactionType: 4 // Contact
      });
    }
  }

  return companyInteractions;
}

