import { Router } from "express";
import {
  getStats,
  getAnalytics,
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getCompanies,
  updateCompanyStatus,
  deleteCompany,
  updateCompanyVerification,
  getJobs,
  getAdminJobById,
  deleteAdminJob,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getAdminSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getAdminFields,
  createField,
  updateField,
  deleteField,
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/stats", getStats);
router.get("/analytics", getAnalytics);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/companies", getCompanies);
router.patch("/companies/:id/status", updateCompanyStatus);
router.put("/companies/:id/verify", updateCompanyVerification);
router.delete("/companies/:id", deleteCompany);

router.get("/jobs", getJobs);
router.get("/jobs/:id", getAdminJobById);
router.delete("/jobs/:id", deleteAdminJob);

// Locations
router.get("/locations", getLocations);
router.post("/locations", createLocation);
router.put("/locations/:id", updateLocation);
router.delete("/locations/:id", deleteLocation);

// Skills
router.get("/skills", getAdminSkills);
router.post("/skills", createSkill);
router.put("/skills/:id", updateSkill);
router.delete("/skills/:id", deleteSkill);

// Fields
router.get("/fields", getAdminFields);
router.post("/fields", createField);
router.put("/fields/:id", updateField);
router.delete("/fields/:id", deleteField);

export default router;
