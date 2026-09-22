import { prisma } from "../config/database.js";
import mlApiService from "../services/mlApi.service.js";

export async function getProfile(req, res, next) {
  try {
    if (req.user.type !== "user") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "User access only" }
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(req.user.id) },
      include: {
        skills: { include: { skill: true } },
        preferences: { include: { field: true } },
        preferredLocations: { include: { location: true } },
        currentLocation: true, 
        field: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" }
      });
    }

    // Transform data to flat format for frontend
    const transformedUser = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      years_of_experience: user.yearsOfExperience,
      career_level: user.careerLevel,
      field_id: user.fieldId ? user.fieldId.toString() : null,
      field_name: user.field?.name || null,
      current_location_id: user.currentLocationId ? user.currentLocationId.toString() : null,
      location_name: user.currentLocation ? `${user.currentLocation.city}, ${user.currentLocation.country}` : null,
      desired_salary_min: user.desiredSalaryMin,
      desired_salary_max: user.desiredSalaryMax,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      
      // Transform skills array
      skills: user.skills?.map(us => ({
        skill_id: us.skillId.toString(),
        skill_name: us.skill?.name || null,
        level: us.level, // NOT proficiency_level
      })) || [],
      
      // Transform preferences
      preferences: user.preferences ? {
        preferred_field_id: user.preferences.preferredFieldId ? user.preferences.preferredFieldId.toString() : null,
        preferred_field_name: user.preferences.field?.name || null,
        preferred_job_level: user.preferences.preferredJobLevel,
        preferred_employment_type: user.preferences.preferredEmploymentType,
        remote_preference: user.preferences.remotePreference,
        min_salary: user.preferences.minSalary,
      } : null,
      
      // Transform preferred locations
      preferred_locations: user.preferredLocations?.map(pl => ({
        location_id: pl.locationId.toString(),
        location_name: `${pl.location.city}, ${pl.location.country}`,
        priority: pl.priority,
      })) || [],
    };

    return res.status(200).json({
      success: true,
      data: { user: transformedUser },
      message: "User profile fetched"
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
      include: {
        skills: { include: { skill: true } },
        preferences: { include: { field: true } },
        preferredLocations: { include: { location: true } },
        currentLocation: true,
        field: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" }
      });
    }

    // Transform data to flat format for frontend
    const transformedUser = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      years_of_experience: user.yearsOfExperience,
      career_level: user.careerLevel,
      field_id: user.fieldId ? user.fieldId.toString() : null,
      field_name: user.field?.name || null,
      current_location_id: user.currentLocationId ? user.currentLocationId.toString() : null,
      location_name: user.currentLocation ? `${user.currentLocation.city}, ${user.currentLocation.country}` : null,
      desired_salary_min: user.desiredSalaryMin,
      desired_salary_max: user.desiredSalaryMax,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      
      // Transform skills array
      skills: user.skills?.map(us => ({
        skill_id: us.skillId.toString(),
        skill_name: us.skill?.name || null,
        level: us.level,
      })) || [],
      
      // Transform preferences
      preferences: user.preferences ? {
        preferred_field_id: user.preferences.preferredFieldId ? user.preferences.preferredFieldId.toString() : null,
        preferred_field_name: user.preferences.field?.name || null,
        preferred_job_level: user.preferences.preferredJobLevel,
        preferred_employment_type: user.preferences.preferredEmploymentType,
        remote_preference: user.preferences.remotePreference,
        min_salary: user.preferences.minSalary,
      } : null,
      
      // Transform preferred locations
      preferred_locations: user.preferredLocations?.map(pl => ({
        location_id: pl.locationId.toString(),
        location_name: `${pl.location.city}, ${pl.location.country}`,
        priority: pl.priority,
      })) || [],
    };

    return res.status(200).json({
      success: true,
      data: { user: transformedUser },
      message: "User profile fetched"
    });
  } catch (err) {
    next(err);
  }
}

// تأكد من استيراد الخدمة في أعلى الملف


export async function updateProfile(req, res, next) {
  try {
    if (req.user.type !== "user") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "User access only" }
      });
    }

    const data = {};
    const {
      name,
      years_of_experience,
      career_level,
      field_id,
      current_location_id,
      desired_salary_min,
      desired_salary_max
    } = req.body;

    if (name !== undefined) data.name = name;
    if (years_of_experience !== undefined) data.yearsOfExperience = years_of_experience;
    if (career_level !== undefined) data.careerLevel = career_level;
    if (field_id !== undefined) data.fieldId = field_id || null;
    if (current_location_id !== undefined) data.currentLocationId = current_location_id || null;
    if (desired_salary_min !== undefined) data.desiredSalaryMin = desired_salary_min || null;
    if (desired_salary_max !== undefined) data.desiredSalaryMax = desired_salary_max || null;

    // 1. تحديث البيانات في قاعدة بيانات Postgres
    const user = await prisma.users.update({
      where: { id: BigInt(req.user.id) },
      data
    });

    // --- التعديل الجديد هنا ---
    // 2. جلب بيانات المستخدم "كاملة" مع العلاقات (مهارات، تفضيلات، مواقع)
    const fullUser = await prisma.users.findUnique({
      where: { id: BigInt(req.user.id) },
      include: {
        skills: true, 
        preferences: true, 
        preferredLocations: true 
      }
    });

    // 3. إرسال البيانات المحدثة لمحرك الـ ML لتغيير الـ Vector فوراً
    // نستخدم .catch لضمان عدم تعليق التطبيق في حال تعطل خدمة الـ ML
    if (fullUser) {
      mlApiService.updateUserVector(fullUser.id.toString(), fullUser)
        .catch(err => console.error("Error updating ML Vector:", err.message));
    }
    // -----------------------

    return res.status(200).json({
      success: true,
      data: user,
      message: "User profile updated"
    });
  } catch (err) {
    next(err);
  }
}

export async function addUserSkills(req, res, next) {
  try {
    const { skills } = req.body; // [{ skill_id, level }]
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "skills must be a non-empty array" }
      });
    }

    const userId = BigInt(req.user.id);

    const data = skills.map((s) => ({
      userId,
      skillId: s.skill_id,
      level: s.level
    }));

    // 1. تنفيذ عملية الحفظ في قاعدة البيانات
    const created = await prisma.$transaction(
      data.map((d) =>
        prisma.userSkills.upsert({
          where: {
            userId_skillId: {
              userId: d.userId,
              skillId: d.skillId
            }
          },
          create: d,
          update: { level: d.level }
        })
      )
    );

    // --- التعديل الجديد هنا لتحديث الـ Vector ---
    // 2. جلب نسخة كاملة ومحدثة من بيانات المستخدم (لأن المهارات تغيرت الآن)
    const fullUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        skills: true, 
        preferences: true, 
        preferredLocations: true 
      }
    });

    // 3. إرسال البيانات لمحرك الـ ML لتعديل الـ Vector
    if (fullUser) {
      mlApiService.updateUserVector(fullUser.id.toString(), fullUser)
        .catch(err => console.error("Error updating ML Vector after skill update:", err.message));
    }
    // ------------------------------------------

    return res.status(201).json({
      success: true,
      data: created,
      message: "User skills upserted"
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserSkill(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const skillId = BigInt(req.params.skill_id);

    await prisma.userSkills.delete({
      where: {
        userId_skillId: {
          userId,
          skillId
        }
      }
    });
    // === الإضافة الوحيدة هنا ===
    // تحديث الشعاع بعد الحذف لكي تختفي الوظائف المعتمدة على هذه المهارة
    syncUserVectorWithML(userId);
    // ===========================

    return res.status(200).json({
      success: true,
      data: null,
      message: "User skill deleted"
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserPreferences(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const {
      preferred_field_id,
      preferred_job_level,
      preferred_employment_type,
      remote_preference,
      min_salary
    } = req.body;

    // Fetch user's field and career level to auto-fill preferences if not provided
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { fieldId: true, careerLevel: true }
    });

    const data = {};

    // Auto-fill from user profile if not explicitly provided
    data.preferredFieldId = preferred_field_id !== undefined
      ? (preferred_field_id || null)
      : (user?.fieldId || null);

    data.preferredJobLevel = preferred_job_level !== undefined
      ? (preferred_job_level || null)
      : (user?.careerLevel || null);

    if (preferred_employment_type !== undefined) data.preferredEmploymentType = preferred_employment_type || null;
    // remote_preference can be 0 (falsy) — must not use || null
    if (remote_preference !== undefined && remote_preference !== '') {
      data.remotePreference = remote_preference !== null ? Number(remote_preference) : null;
    }
    if (min_salary !== undefined) data.minSalary = min_salary || null;

    const prefs = await prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data }
    });

    return res.status(200).json({
      success: true,
      data: prefs,
      message: "User preferences updated"
    });
  } catch (err) {
    next(err);
  }
}

export async function addUserPreferredLocations(req, res, next) {
  try {
    const userId = BigInt(req.user.id);
    const { locations } = req.body; // [{ location_id, priority }]

    if (!Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "locations must be a non-empty array" }
      });
    }

    const locations_mapped = locations.map((l) => ({
      location_id: BigInt(l.location_id),
      priority: l.priority
    }));

    const incomingLocationIds = locations_mapped.map((l) => l.location_id);

    // Delete locations not in the incoming list, then upsert the incoming ones
    const deletePromise = prisma.userPreferredLocations.deleteMany({
      where: {
        userId,
        locationId: { notIn: incomingLocationIds },
      },
    });

    const upsertPromises = locations_mapped.map((l) =>
      prisma.userPreferredLocations.upsert({
        where: {
          userId_locationId: {
            userId,
            locationId: l.location_id,
          },
        },
        create: {
          userId,
          locationId: l.location_id,
          priority: l.priority,
        },
        update: {
          priority: l.priority,
        },
      })
    );

    const result = await prisma.$transaction([deletePromise, ...upsertPromises]);

    return res.status(201).json({
      success: true,
      data: result,
      message: "Preferred locations upserted"
    });
  } catch (err) {
    next(err);
  }
}

async function syncUserVectorWithML(userId) {
  try {
    const fullUser = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
      include: {
        skills: true,
        preferences: true,
        preferredLocations: true
      }
    });

    if (fullUser) {
      mlApiService.updateUserVector(fullUser.id.toString(), fullUser)
        .catch(err => console.error(`ML Update Error for user ${userId}:`, err.message));
    }
  } catch (error) {
    console.error(`Database Error during ML sync:`, error.message);
  }
}

