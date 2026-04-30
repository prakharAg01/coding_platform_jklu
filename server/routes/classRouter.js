import express from "express";
import {
  createClass,
  getClasses,
  getClassDetails,
  toggleJoinStatus,
  joinClass,
  removeStudent,
  addStudentByEmail,
} from "../controllers/classController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Teacher routes
router.post("/create", isAuthenticated, authorizeRoles("Teacher", "Sadmin"), createClass);
router.patch("/:id/toggle-join", isAuthenticated, authorizeRoles("Teacher", "Sadmin"), toggleJoinStatus);
router.delete("/:classId/student/:studentId", isAuthenticated, authorizeRoles("Teacher", "Sadmin"), removeStudent);
router.post("/:classId/add-student", isAuthenticated, authorizeRoles("Teacher", "Sadmin"), addStudentByEmail);

// Student routes
router.post("/join", isAuthenticated, authorizeRoles("Student"), joinClass);

// Shared routes
router.get("/", isAuthenticated, getClasses);
router.get("/:id", isAuthenticated, getClassDetails);

export default router;
