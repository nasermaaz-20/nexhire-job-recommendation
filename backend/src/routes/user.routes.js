import { Router } from "express";
import { authMiddleware, isUser } from "../middlewares/auth.middleware.js";
import {
  getProfile,
  getUserById,
  updateProfile,
  addUserSkills,
  deleteUserSkill,
  updateUserPreferences,
  addUserPreferredLocations
} from "../controllers/user.controller.js";
import { validate, validateInDB } from "../middlewares/validation.middleware.js";
import {
  updateProfileSchema,
  addSkillsSchema,
  updatePreferencesSchema,
  addPreferredLocationsSchema,
  validateUserDataInDB
} from "../validators/user.validator.js";

const router = Router();

router.use(authMiddleware, isUser);

router.get("/profile", getProfile);
router.put(
  "/profile",
  validate(updateProfileSchema),
  validateInDB(validateUserDataInDB),
  updateProfile
);
router.post(
  "/skills",
  validate(addSkillsSchema),
  validateInDB(validateUserDataInDB),
  addUserSkills
);
router.delete("/skills/:skill_id", deleteUserSkill);
router.post(
  "/preferences",
  validate(updatePreferencesSchema),
  validateInDB(validateUserDataInDB),
  updateUserPreferences
);
router.post(
  "/preferred-locations",
  validate(addPreferredLocationsSchema),
  validateInDB(validateUserDataInDB),
  addUserPreferredLocations
);

export default router;



