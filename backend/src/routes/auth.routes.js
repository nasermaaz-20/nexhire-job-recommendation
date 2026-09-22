import { Router } from "express";
import {
  registerUser,
  registerCompany,
  login,
  refreshToken,
  logout
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  registerUserSchema,
  registerCompanySchema,
  loginSchema,
  refreshSchema
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register/user", validate(registerUserSchema), registerUser);
router.post("/register/company", validate(registerCompanySchema), registerCompany);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refreshToken);
router.post("/logout", logout);

export default router;

