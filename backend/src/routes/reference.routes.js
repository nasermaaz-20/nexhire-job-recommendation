import { Router } from "express";
import {
  getLocations,
  getFields,
  getSkills,
  getEnums
} from "../controllers/reference.controller.js";

const router = Router();

router.get("/locations", getLocations);
router.get("/fields", getFields);
router.get("/skills", getSkills);
router.get("/enums", getEnums);

export default router;

