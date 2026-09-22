import { prisma } from "../config/database.js";

export async function getCompanyProfile(req, res, next) {
  try {
    if (req.user.type !== "company") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Company access only" }
      });
    }

    const company = await prisma.companies.findUnique({
      where: { id: BigInt(req.user.id) },
      include: {
        location: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" }
      });
    }

    // Transform to flat structure
    const transformedCompany = {
      id: company.id.toString(),
      name: company.name,
      email: company.email,
      industry: company.industry,
      company_size: company.companySize,
      location_id: company.locationId?.toString() || null,
      location_name: company.location ? `${company.location.city}, ${company.location.country}` : null,
      founded_year: company.foundedYear || null,
      website: company.website || null,
      is_verified: company.isVerified === 1,
      created_at: company.createdAt
    };

    return res.status(200).json({
      success: true,
      data: transformedCompany,
      message: "Company profile fetched"
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyProfile(req, res, next) {
  try {
    if (req.user.type !== "company") {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Company access only" }
      });
    }

    const companyId = BigInt(req.user.id);
    const { name, industry, company_size, location_id, founded_year, website } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (industry !== undefined) data.industry = industry;
    if (company_size !== undefined) data.companySize = company_size;
    if (location_id !== undefined) data.locationId = location_id || null;
    if (founded_year !== undefined) data.foundedYear = founded_year || null;
    if (website !== undefined) data.website = website || null;

    const company = await prisma.companies.update({
      where: { id: companyId },
      data
    });

    return res.status(200).json({
      success: true,
      data: company,
      message: "Company profile updated"
    });
  } catch (err) {
    next(err);
  }
}

export async function getCompanyPublic(req, res, next) {
  try {
    const id = BigInt(req.params.id);
    const company = await prisma.companies.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        industry: true,
        companySize: true,
        website: true,
        isVerified: true,
        location: true,
        foundedYear: true,
        createdAt: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Company not found" }
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
      message: "Company info"
    });
  } catch (err) {
    next(err);
  }
}

