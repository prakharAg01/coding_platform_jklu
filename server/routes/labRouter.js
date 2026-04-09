import express from "express";
import {
  createLab,
  updateLab,
  getLabsForClass,
  getLabDetails,
} from "../controllers/labController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, authorizeRoles("Teacher", "Admin"), createLab);
router.put("/:id/update", isAuthenticated, authorizeRoles("Teacher", "Admin"), updateLab);

router.get("/class/:classId", isAuthenticated, getLabsForClass);
router.get("/:id", isAuthenticated, getLabDetails);

export default router;
