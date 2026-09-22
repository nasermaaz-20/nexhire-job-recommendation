import bcrypt from "bcrypt";
import { prisma } from "../config/database.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { CAREER_LEVELS } from "../utils/enums.js";
import mlApiService from "../services/mlApi.service.js";
const SALT_ROUNDS = 10;

function buildAuthResponse(entity, type) {
  // Convert BigInt to string for JSON serialization
  const payload = { 
    id: entity.id.toString(), 
    type, 
    email: entity.email 
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    success: true,
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: type === "user" ? { 
        id: entity.id.toString(), 
        name: entity.name, 
        email: entity.email,
        role: entity.role || 'job_seeker'
      } : null,
      company: type === "company" ? { 
        id: entity.id.toString(), 
        name: entity.name, 
        email: entity.email 
      } : null
    },
    message: "Authentication successful"
  };
}

export async function registerUser(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      years_of_experience = 0,
      career_level,
      field_id,
      current_location_id,
      desired_salary_min,
      desired_salary_max
    } = req.body;

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const existingCompany = await prisma.companies.findUnique({ where: { email } });
    if (existingCompany) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    if (!Object.values(CAREER_LEVELS).includes(career_level)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid career level" }
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        passwordHash,
        yearsOfExperience: years_of_experience,
        careerLevel: career_level,
        fieldId: field_id || null,
        currentLocationId: current_location_id || null,
        desiredSalaryMin: desired_salary_min || null,
        desiredSalaryMax: desired_salary_max || null
      }
    });
    
prisma.users.findUnique({
      where: { id: user.id },
      include: { skills: true, preferences: true, preferredLocations: true }
    }).then(fullUser => {
      if (fullUser) {
        mlApiService.updateUserVector(fullUser.id.toString(), fullUser)
          .catch(err => console.error("ML Initial Vector Error:", err.message));
      }
    }).catch(err => console.error("DB Error fetching new user for ML:", err.message));
    // =================================================================

    return res.status(201).json(buildAuthResponse(user, "user"));
  } catch (err) {
    next(err);
  }
}

export async function registerCompany(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      industry,
      company_size,
      location_id,
      founded_year,
      website
    } = req.body;

    const existing = await prisma.companies.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const company = await prisma.companies.create({
      data: {
        name,
        email,
        passwordHash,
        industry,
        companySize: company_size,
        locationId: location_id || null,
        foundedYear: founded_year || null,
        website: website || null,
        isVerified: 0
      }
    });

    return res.status(201).json({
      success: true,
      data: null,
      message: "Account created successfully. Your account is pending verification. Please try logging in later."
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, type } = req.body;

    if (type === "user" || type === "admin") {
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "No account found with this email." });
      }

      // Check if admin login but user is not admin
      if (type === "admin" && user.role !== "admin") {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ message: "Incorrect password." });
      }
      return res.status(200).json(buildAuthResponse(user, "user"));
    }

    if (type === "company") {
      const company = await prisma.companies.findUnique({ where: { email } });
      if (!company) {
        return res.status(404).json({ message: "No account found with this email." });
      }
      const match = await bcrypt.compare(password, company.passwordHash);
      if (!match) {
        return res.status(401).json({ message: "Incorrect password." });
      }
      if (company.isVerified === 0) {
        return res.status(403).json({ message: "Your company account has not been verified yet. Please try again later." });
      }
      return res.status(200).json(buildAuthResponse(company, "company"));
    }

    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid login type" }
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;
    let payload;
    try {
      payload = verifyRefreshToken(refresh_token);
    } catch {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid refresh token" }
      });
    }

    const accessToken = signAccessToken({ id: payload.id, type: payload.type, email: payload.email });
    const newRefresh = signRefreshToken({ id: payload.id, type: payload.type, email: payload.email });

    return res.status(200).json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: newRefresh
      },
      message: "Token refreshed"
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // Stateless JWT: من الناحية التقنية لا يوجد تخزين، يمكن لاحقًا إضافة blacklist في DB/Redis
    return res.status(200).json({
      success: true,
      data: null,
      message: "Logged out successfully"
    });
  } catch (err) {
    next(err);
  }
}

