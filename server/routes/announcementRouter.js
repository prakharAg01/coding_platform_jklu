import express from "express";
import {
  createAnnouncement,
  getAnnouncementsForClass,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", isAuthenticated, authorizeRoles("Teacher", "Sadmin"), createAnnouncement);
router.get("/class/:classId", isAuthenticated, getAnnouncementsForClass);
router.delete("/:id", isAuthenticated, authorizeRoles("Teacher", "Sadmin"), deleteAnnouncement);

export default router;
