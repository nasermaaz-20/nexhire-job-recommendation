import { prisma } from "../config/database.js";
import {
  CAREER_LEVELS,
  EMPLOYMENT_TYPES,
  REMOTE_OPTIONS,
  INTERACTION_TYPES,
  COMPANY_INTERACTION_TYPES,
  APPLICATION_STATUS,
  COMPANY_SIZES,
  INDUSTRIES
} from "../utils/enums.js";

export async function getLocations(req, res, next) {
  try {
    const locations = await prisma.locations.findMany({
      orderBy: [{ country: "asc" }, { city: "asc" }]
    });
    
    // Transform BigInt IDs to strings for JSON serialization
    const transformedLocations = locations.map(loc => ({
      id: loc.id.toString(),
      country: loc.country,
      city: loc.city
    }));
    
    return res.status(200).json({
      success: true,
      data: transformedLocations,
      message: "Locations list"
    });
  } catch (err) {
    next(err);
  }
}

export async function getFields(req, res, next) {
  try {
    const fields = await prisma.fields.findMany({
      orderBy: { name: "asc" }
    });
    
    // Transform BigInt IDs to strings for JSON serialization
    const transformedFields = fields.map(field => ({
      id: field.id.toString(),
      name: field.name
    }));
    
    return res.status(200).json({
      success: true,
      data: transformedFields,
      message: "Fields list"
    });
  } catch (err) {
    next(err);
  }
}

export async function getSkills(req, res, next) {
  try {
    const { field_id } = req.query;
    const where = {};
    if (field_id) {
      where.fieldId = Number(field_id);
    }
    const skills = await prisma.skills.findMany({
      where,
      orderBy: { name: "asc" }
    });
    
    // Transform BigInt IDs to strings for JSON serialization
    const transformedSkills = skills.map(skill => ({
      id: skill.id.toString(),
      name: skill.name,
      field_id: skill.fieldId ? skill.fieldId.toString() : null
    }));
    
    return res.status(200).json({
      success: true,
      data: transformedSkills,
      message: "Skills list"
    });
  } catch (err) {
    next(err);
  }
}

export async function getEnums(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        career_levels: CAREER_LEVELS,
        employment_types: EMPLOYMENT_TYPES,
        remote_options: REMOTE_OPTIONS,
        interaction_types: INTERACTION_TYPES,
        company_interaction_types: COMPANY_INTERACTION_TYPES,
        application_status: APPLICATION_STATUS,
        company_sizes: COMPANY_SIZES,
        industries: INDUSTRIES
      },
      message: "Enums"
    });
  } catch (err) {
    next(err);
  }
}

